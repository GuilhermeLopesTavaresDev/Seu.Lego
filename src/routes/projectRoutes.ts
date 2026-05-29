import { Router } from "express";

import { projectController } from "../config/container";

export const projectRoutes = Router();

projectRoutes.get("/:projectId", projectController.show);
projectRoutes.get("/:projectId/preview", projectController.preview);
projectRoutes.get("/:projectId/manual.pdf", projectController.downloadManual);
