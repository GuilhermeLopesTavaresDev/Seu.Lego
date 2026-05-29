export type ProjectStatus = "created" | "processing" | "ready" | "failed";

export interface Project {
  id: string;
  status: ProjectStatus;
  originalImagePath: string;
  widthStuds: number;
  heightStuds: number;
  partId: string;
  colorLimit: number;
  createdAt: Date;
  updatedAt: Date;
}
