import type { Mosaic } from "../models/Mosaic";
import type { ProjectPart } from "../models/ProjectPart";

export class PartsOptimizerService {
  countOneByOneParts(mosaic: Mosaic, partId: string): ProjectPart[] {
    const totals = new Map<string, ProjectPart>();

    for (const cell of mosaic.cells) {
      const key = `${partId}:${cell.legoColor.id}`;
      const current = totals.get(key);

      if (current) {
        current.quantity += 1;
      } else {
        totals.set(key, {
          partId,
          colorId: cell.legoColor.id,
          colorName: cell.legoColor.name,
          quantity: 1
        });
      }
    }

    return Array.from(totals.values()).sort((a, b) => a.colorName.localeCompare(b.colorName));
  }
}

