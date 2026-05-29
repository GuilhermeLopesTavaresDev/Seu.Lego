export interface LegoPart {
  id: string;
  name: string;
  category: "plate" | "tile" | "brick" | "baseplate";
  widthStuds: number;
  heightStuds: number;
}

