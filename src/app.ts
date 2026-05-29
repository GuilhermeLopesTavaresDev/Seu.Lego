import cors from "cors";
import express from "express";
import helmet from "helmet";
import path from "path";

import { errorMiddleware } from "./config/errorMiddleware";
import { projectRoutes } from "./routes/projectRoutes";
import { uploadRoutes } from "./routes/uploadRoutes";

export function createApp() {
  const app = express();

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          "img-src": ["'self'", "data:", "blob:"]
        }
      }
    })
  );
  app.use(cors());
  app.use(express.json({ limit: "2mb" }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/uploads", uploadRoutes);
  app.use("/projects", projectRoutes);

  const frontendDistPath = path.resolve(process.cwd(), "frontend", "dist");
  app.use(express.static(frontendDistPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });

  app.use(errorMiddleware);

  return app;
}
