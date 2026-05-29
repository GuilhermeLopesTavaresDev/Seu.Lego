import type { Request, Response } from "express";
import { z } from "zod";

import { ProjectRepository } from "../repositories/ProjectRepository";

const createProjectSchema = z.object({
  widthStuds: z.coerce.number().int().min(16).max(256).default(48),
  heightStuds: z.coerce.number().int().min(16).max(256).default(48),
  partId: z.enum(["tile-1x1", "plate-1x1"]).default("tile-1x1"),
  colorLimit: z.coerce.number().int().min(4).max(48).default(24)
});

export class UploadController {
  constructor(private readonly projectRepository = new ProjectRepository()) {}

  createProject = async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: { message: "Image file is required" } });
      return;
    }

    const payload = createProjectSchema.parse(req.body);
    const project = await this.projectRepository.create({
      originalImagePath: req.file.path,
      widthStuds: payload.widthStuds,
      heightStuds: payload.heightStuds,
      partId: payload.partId,
      colorLimit: payload.colorLimit
    });

    res.status(201).json({
      project
    });
  };
}
