import type { Mosaic } from "../models/Mosaic";
import { ColorMatchingService } from "./ColorMatchingService";
import { ImageProcessingService } from "./ImageProcessingService";
import { LegoCatalogService } from "./LegoCatalogService";

export class MosaicGenerationService {
  constructor(
    private readonly imageProcessingService = new ImageProcessingService(),
    private readonly legoCatalogService = new LegoCatalogService(),
    private readonly colorMatchingService = new ColorMatchingService()
  ) {}

  async generate(input: {
    imagePath: string;
    widthStuds: number;
    heightStuds: number;
    partId: string;
    colorLimit?: number;
  }): Promise<Mosaic> {
    const colors = await this.legoCatalogService.getAvailableColorsForPart(input.partId);
    const pixels = await this.imageProcessingService.sampleImage(
      input.imagePath,
      input.widthStuds,
      input.heightStuds
    );
    const colorLimit = Math.min(Math.max(input.colorLimit ?? 24, 4), colors.length);
    const limitedPalette = this.colorMatchingService.createLimitedPalette({
      pixels,
      availableColors: colors,
      colorLimit
    });
    const cells = pixels.map((pixel) => {
      const match = this.colorMatchingService.findNearestColorWithDistance(pixel.rgb, limitedPalette);

      return {
        x: pixel.x,
        y: pixel.y,
        sourceHex: pixel.hex,
        colorDistance: Number(match.distance.toFixed(2)),
        legoColor: match.color
      };
    });
    const averageDistance =
      cells.reduce((total, cell) => total + cell.colorDistance, 0) / Math.max(cells.length, 1);

    return {
      width: input.widthStuds,
      height: input.heightStuds,
      colorLimit,
      fidelityScore: Math.max(0, Math.min(100, Math.round(100 - averageDistance * 2))),
      palette: limitedPalette,
      cells
    };
  }
}
