export interface LegoColor {
  id: string;
  name: string;
  hex: string;
  rgb: {
    r: number;
    g: number;
    b: number;
  };
}

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

export interface Project {
  id: string;
  status: string;
  originalImagePath: string;
  widthStuds: number;
  heightStuds: number;
  partId: "tile-1x1" | "plate-1x1";
  colorLimit: number;
}

export interface ProjectPart {
  partId: string;
  colorId: string;
  colorName: string;
  quantity: number;
}

export interface PreviewResponse {
  project: Project;
  mosaic: Mosaic;
  parts: ProjectPart[];
}
