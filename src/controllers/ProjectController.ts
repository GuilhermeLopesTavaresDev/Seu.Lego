import type { Request, Response } from "express";

import { ProjectRepository } from "../repositories/ProjectRepository";
import { MosaicGenerationService } from "../services/MosaicGenerationService";
import { PartsOptimizerService } from "../services/PartsOptimizerService";
import { PdfManualService } from "../services/PdfManualService";

export class ProjectController {
  constructor(
    private readonly projectRepository = new ProjectRepository(),
    private readonly mosaicGenerationService = new MosaicGenerationService(),
    private readonly partsOptimizerService = new PartsOptimizerService(),
    private readonly pdfManualService = new PdfManualService()
  ) {}

  show = async (req: Request, res: Response) => {
    const projectId = String(req.params.projectId);
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      res.status(404).json({ error: { message: "Project not found" } });
      return;
    }

    res.json({ project });
  };

  preview = async (req: Request, res: Response) => {
    const projectId = String(req.params.projectId);
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      res.status(404).json({ error: { message: "Project not found" } });
      return;
    }

    const mosaic = await this.mosaicGenerationService.generate({
      imagePath: project.originalImagePath,
      widthStuds: project.widthStuds,
      heightStuds: project.heightStuds,
      partId: project.partId,
      colorLimit: project.colorLimit
    });
    const parts = this.partsOptimizerService.countOneByOneParts(mosaic, project.partId);

    res.json({
      project,
      mosaic,
      parts
    });
  };

  downloadManual = async (req: Request, res: Response) => {
    const projectId = String(req.params.projectId);
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      res.status(404).json({ error: { message: "Project not found" } });
      return;
    }

    const mosaic = await this.mosaicGenerationService.generate({
      imagePath: project.originalImagePath,
      widthStuds: project.widthStuds,
      heightStuds: project.heightStuds,
      partId: project.partId,
      colorLimit: project.colorLimit
    });
    const parts = this.partsOptimizerService.countOneByOneParts(mosaic, project.partId);
    const manual = await this.pdfManualService.generateManual({
      projectId,
      mosaic,
      parts
    });

    res.download(manual.filePath, `manual-${projectId}.pdf`);
  };
}
