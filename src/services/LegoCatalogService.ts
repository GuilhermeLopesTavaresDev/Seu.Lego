import type { LegoColor } from "../models/LegoColor";
import type { LegoPart } from "../models/LegoPart";

export class LegoCatalogService {
  private readonly colors: LegoColor[] = [
    { id: "black", name: "Black", hex: "#05131D", rgb: { r: 5, g: 19, b: 29 } },
    { id: "white", name: "White", hex: "#FFFFFF", rgb: { r: 255, g: 255, b: 255 } },
    { id: "red", name: "Red", hex: "#C91A09", rgb: { r: 201, g: 26, b: 9 } },
    { id: "dark-red", name: "Dark Red", hex: "#720E0F", rgb: { r: 114, g: 14, b: 15 } },
    { id: "coral", name: "Coral", hex: "#FF698F", rgb: { r: 255, g: 105, b: 143 } },
    { id: "blue", name: "Blue", hex: "#0055BF", rgb: { r: 0, g: 85, b: 191 } },
    { id: "dark-blue", name: "Dark Blue", hex: "#0A3463", rgb: { r: 10, g: 52, b: 99 } },
    { id: "medium-blue", name: "Medium Blue", hex: "#5A93DB", rgb: { r: 90, g: 147, b: 219 } },
    { id: "light-blue", name: "Light Blue", hex: "#B4D2E3", rgb: { r: 180, g: 210, b: 227 } },
    { id: "yellow", name: "Yellow", hex: "#F2CD37", rgb: { r: 242, g: 205, b: 55 } },
    { id: "bright-light-yellow", name: "Bright Light Yellow", hex: "#FFF03A", rgb: { r: 255, g: 240, b: 58 } },
    { id: "orange", name: "Orange", hex: "#FE8A18", rgb: { r: 254, g: 138, b: 24 } },
    { id: "dark-orange", name: "Dark Orange", hex: "#A95500", rgb: { r: 169, g: 85, b: 0 } },
    { id: "green", name: "Green", hex: "#237841", rgb: { r: 35, g: 120, b: 65 } },
    { id: "dark-green", name: "Dark Green", hex: "#184632", rgb: { r: 24, g: 70, b: 50 } },
    { id: "lime", name: "Lime", hex: "#BBE90B", rgb: { r: 187, g: 233, b: 11 } },
    { id: "olive-green", name: "Olive Green", hex: "#9B9A5A", rgb: { r: 155, g: 154, b: 90 } },
    { id: "sand-green", name: "Sand Green", hex: "#A0BCAC", rgb: { r: 160, g: 188, b: 172 } },
    { id: "tan", name: "Tan", hex: "#E4CD9E", rgb: { r: 228, g: 205, b: 158 } },
    { id: "light-nougat", name: "Light Nougat", hex: "#F6D7B3", rgb: { r: 246, g: 215, b: 179 } },
    { id: "nougat", name: "Nougat", hex: "#D09168", rgb: { r: 208, g: 145, b: 104 } },
    { id: "medium-nougat", name: "Medium Nougat", hex: "#AA7D55", rgb: { r: 170, g: 125, b: 85 } },
    { id: "dark-tan", name: "Dark Tan", hex: "#958A73", rgb: { r: 149, g: 138, b: 115 } },
    { id: "brown", name: "Brown", hex: "#582A12", rgb: { r: 88, g: 42, b: 18 } },
    { id: "reddish-brown", name: "Reddish Brown", hex: "#582A12", rgb: { r: 88, g: 42, b: 18 } },
    { id: "dark-brown", name: "Dark Brown", hex: "#352100", rgb: { r: 53, g: 33, b: 0 } },
    { id: "dark-purple", name: "Dark Purple", hex: "#3F3691", rgb: { r: 63, g: 54, b: 145 } },
    { id: "medium-lavender", name: "Medium Lavender", hex: "#AC78BA", rgb: { r: 172, g: 120, b: 186 } },
    { id: "magenta", name: "Magenta", hex: "#923978", rgb: { r: 146, g: 57, b: 120 } },
    { id: "pink", name: "Pink", hex: "#FC97AC", rgb: { r: 252, g: 151, b: 172 } },
    { id: "light-bluish-gray", name: "Light Bluish Gray", hex: "#A0A5A9", rgb: { r: 160, g: 165, b: 169 } },
    { id: "dark-bluish-gray", name: "Dark Bluish Gray", hex: "#6C6E68", rgb: { r: 108, g: 110, b: 104 } },
    { id: "light-gray", name: "Light Gray", hex: "#9BA19D", rgb: { r: 155, g: 161, b: 157 } },
    { id: "dark-gray", name: "Dark Gray", hex: "#6D6E5C", rgb: { r: 109, g: 110, b: 92 } }
  ];

  private readonly parts: LegoPart[] = [
    {
      id: "tile-1x1",
      name: "Tile 1 x 1",
      category: "tile",
      widthStuds: 1,
      heightStuds: 1
    },
    {
      id: "plate-1x1",
      name: "Plate 1 x 1",
      category: "plate",
      widthStuds: 1,
      heightStuds: 1
    }
  ];

  async getAvailableColorsForPart(_partId: string): Promise<LegoColor[]> {
    return this.colors;
  }

  async getPartById(partId: string): Promise<LegoPart | null> {
    return this.parts.find((part) => part.id === partId) ?? null;
  }
}
