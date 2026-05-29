import { Router } from "express";
import multer from "multer";

import { uploadController } from "../config/container";

const upload = multer({
  dest: process.env.UPLOAD_DIR ?? "uploads",
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

export const uploadRoutes = Router();

uploadRoutes.post("/image", upload.single("image"), uploadController.createProject);
