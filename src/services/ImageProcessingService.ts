import sharp from "sharp";

export interface SampledPixel {
  x: number;
  y: number;
  rgb: {
    r: number;
    g: number;
    b: number;
  };
  hex: string;
}

export class ImageProcessingService {
  async sampleImage(imagePath: string, width: number, height: number): Promise<SampledPixel[]> {
    const image = sharp(imagePath)
      .rotate()
      .normalise()
      .sharpen({ sigma: 0.6 })
      .resize(width, height, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255 },
        kernel: sharp.kernel.lanczos3
      })
      .removeAlpha()
      .raw();

    const buffer = await image.toBuffer();
    const pixels: SampledPixel[] = [];

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const offset = (y * width + x) * 3;
        const rgb = {
          r: buffer[offset],
          g: buffer[offset + 1],
          b: buffer[offset + 2]
        };

        pixels.push({
          x,
          y,
          rgb,
          hex: this.rgbToHex(rgb)
        });
      }
    }

    return pixels;
  }

  private rgbToHex(rgb: SampledPixel["rgb"]): string {
    const channelToHex = (value: number) => value.toString(16).padStart(2, "0");
    return `#${channelToHex(rgb.r)}${channelToHex(rgb.g)}${channelToHex(rgb.b)}`;
  }
}
