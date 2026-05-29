import type { LegoColor } from "./LegoColor";

export interface MosaicCell {
  x: number;
  y: number;
  sourceHex: string;
  colorDistance: number;
  legoColor: LegoColor;
}

export interface Mosaic {
  width: number;
  height: number;
  colorLimit: number;
  fidelityScore: number;
  palette: LegoColor[];
  cells: MosaicCell[];
}
