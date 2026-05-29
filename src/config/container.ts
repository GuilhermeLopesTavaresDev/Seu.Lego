import { ProjectController } from "../controllers/ProjectController";
import { UploadController } from "../controllers/UploadController";
import { ProjectRepository } from "../repositories/ProjectRepository";
import { MosaicGenerationService } from "../services/MosaicGenerationService";
import { PartsOptimizerService } from "../services/PartsOptimizerService";
import { PdfManualService } from "../services/PdfManualService";

const projectRepository = new ProjectRepository();
const mosaicGenerationService = new MosaicGenerationService();
const partsOptimizerService = new PartsOptimizerService();
const pdfManualService = new PdfManualService();

export const uploadController = new UploadController(projectRepository);
export const projectController = new ProjectController(
  projectRepository,
  mosaicGenerationService,
  partsOptimizerService,
  pdfManualService
);
