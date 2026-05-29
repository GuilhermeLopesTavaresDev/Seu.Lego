import type { LegoColor } from "../models/LegoColor";

interface LabColor {
  l: number;
  a: number;
  b: number;
}

export interface ColorMatch {
  color: LegoColor;
  distance: number;
}

export class ColorMatchingService {
  findNearestColor(rgb: LegoColor["rgb"], availableColors: LegoColor[]): LegoColor {
    return this.findNearestColorWithDistance(rgb, availableColors).color;
  }

  findNearestColorWithDistance(rgb: LegoColor["rgb"], availableColors: LegoColor[]): ColorMatch {
    if (availableColors.length === 0) {
      throw new Error("No LEGO colors available for matching");
    }

    const sourceLab = this.rgbToLab(rgb);
    const best = availableColors.reduce(
      (currentBest, candidate) => {
        const candidateDistance = this.deltaE2000(sourceLab, this.rgbToLab(candidate.rgb));

        return candidateDistance < currentBest.distance
          ? { color: candidate, distance: candidateDistance }
          : currentBest;
      },
      { color: availableColors[0], distance: Number.POSITIVE_INFINITY }
    );

    return best;
  }

  createLimitedPalette(input: {
    pixels: Array<{ rgb: LegoColor["rgb"] }>;
    availableColors: LegoColor[];
    colorLimit: number;
  }): LegoColor[] {
    const rankedColors = new Map<string, { color: LegoColor; score: number; uses: number }>();

    for (const pixel of input.pixels) {
      const nearest = this.findNearestColorWithDistance(pixel.rgb, input.availableColors);
      const current = rankedColors.get(nearest.color.id);
      const score = Math.max(0, 100 - nearest.distance);

      if (current) {
        current.score += score;
        current.uses += 1;
      } else {
        rankedColors.set(nearest.color.id, {
          color: nearest.color,
          score,
          uses: 1
        });
      }
    }

    return Array.from(rankedColors.values())
      .sort((first, second) => {
        const weightedScore = second.score - first.score;
        return weightedScore !== 0 ? weightedScore : second.uses - first.uses;
      })
      .slice(0, input.colorLimit)
      .map((entry) => entry.color);
  }

  rgbToLab(rgb: LegoColor["rgb"]): LabColor {
    const xyz = this.rgbToXyz(rgb);
    return this.xyzToLab(xyz);
  }

  private rgbToXyz(rgb: LegoColor["rgb"]) {
    const normalize = (value: number) => {
      const channel = value / 255;
      return channel > 0.04045 ? Math.pow((channel + 0.055) / 1.055, 2.4) : channel / 12.92;
    };

    const r = normalize(rgb.r);
    const g = normalize(rgb.g);
    const b = normalize(rgb.b);

    return {
      x: (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047,
      y: (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.0,
      z: (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883
    };
  }

  private xyzToLab(xyz: { x: number; y: number; z: number }): LabColor {
    const transform = (value: number) =>
      value > 0.008856 ? Math.cbrt(value) : 7.787 * value + 16 / 116;

    const x = transform(xyz.x);
    const y = transform(xyz.y);
    const z = transform(xyz.z);

    return {
      l: 116 * y - 16,
      a: 500 * (x - y),
      b: 200 * (y - z)
    };
  }

  deltaE2000(first: LabColor, second: LabColor): number {
    const avgLightness = (first.l + second.l) / 2;
    const c1 = Math.sqrt(first.a * first.a + first.b * first.b);
    const c2 = Math.sqrt(second.a * second.a + second.b * second.b);
    const avgChroma = (c1 + c2) / 2;
    const chromaPower = Math.pow(avgChroma, 7);
    const g = 0.5 * (1 - Math.sqrt(chromaPower / (chromaPower + Math.pow(25, 7))));

    const a1Prime = (1 + g) * first.a;
    const a2Prime = (1 + g) * second.a;
    const c1Prime = Math.sqrt(a1Prime * a1Prime + first.b * first.b);
    const c2Prime = Math.sqrt(a2Prime * a2Prime + second.b * second.b);
    const avgChromaPrime = (c1Prime + c2Prime) / 2;

    const h1Prime = this.normalizeHue(Math.atan2(first.b, a1Prime) * (180 / Math.PI));
    const h2Prime = this.normalizeHue(Math.atan2(second.b, a2Prime) * (180 / Math.PI));
    const deltaLightnessPrime = second.l - first.l;
    const deltaChromaPrime = c2Prime - c1Prime;
    const deltaHueRaw =
      c1Prime * c2Prime === 0
        ? 0
        : Math.abs(h2Prime - h1Prime) <= 180
          ? h2Prime - h1Prime
          : h2Prime <= h1Prime
            ? h2Prime - h1Prime + 360
            : h2Prime - h1Prime - 360;
    const deltaHuePrime =
      2 * Math.sqrt(c1Prime * c2Prime) * Math.sin((deltaHueRaw / 2) * (Math.PI / 180));

    const avgHuePrime =
      c1Prime * c2Prime === 0
        ? h1Prime + h2Prime
        : Math.abs(h1Prime - h2Prime) <= 180
          ? (h1Prime + h2Prime) / 2
          : h1Prime + h2Prime < 360
            ? (h1Prime + h2Prime + 360) / 2
            : (h1Prime + h2Prime - 360) / 2;

    const t =
      1 -
      0.17 * Math.cos((avgHuePrime - 30) * (Math.PI / 180)) +
      0.24 * Math.cos(2 * avgHuePrime * (Math.PI / 180)) +
      0.32 * Math.cos((3 * avgHuePrime + 6) * (Math.PI / 180)) -
      0.2 * Math.cos((4 * avgHuePrime - 63) * (Math.PI / 180));
    const deltaTheta = 30 * Math.exp(-Math.pow((avgHuePrime - 275) / 25, 2));
    const rc = 2 * Math.sqrt(Math.pow(avgChromaPrime, 7) / (Math.pow(avgChromaPrime, 7) + Math.pow(25, 7)));
    const sl = 1 + (0.015 * Math.pow(avgLightness - 50, 2)) / Math.sqrt(20 + Math.pow(avgLightness - 50, 2));
    const sc = 1 + 0.045 * avgChromaPrime;
    const sh = 1 + 0.015 * avgChromaPrime * t;
    const rt = -Math.sin(2 * deltaTheta * (Math.PI / 180)) * rc;

    return Math.sqrt(
      Math.pow(deltaLightnessPrime / sl, 2) +
        Math.pow(deltaChromaPrime / sc, 2) +
        Math.pow(deltaHuePrime / sh, 2) +
        rt * (deltaChromaPrime / sc) * (deltaHuePrime / sh)
    );
  }

  private normalizeHue(hue: number): number {
    return hue >= 0 ? hue : hue + 360;
  }
}
