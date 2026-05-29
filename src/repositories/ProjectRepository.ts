import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

import type { Project } from "../models/Project";

export class ProjectRepository {
  private readonly projects = new Map<string, Project>();
  private readonly storagePath = path.resolve(process.cwd(), "data", "projects.json");
  private isLoaded = false;

  async create(input: Omit<Project, "id" | "createdAt" | "updatedAt" | "status">): Promise<Project> {
    await this.load();
    const now = new Date();
    const project: Project = {
      id: crypto.randomUUID(),
      status: "ready",
      createdAt: now,
      updatedAt: now,
      ...input
    };

    this.projects.set(project.id, project);
    await this.save();
    return project;
  }

  async findById(id: string): Promise<Project | null> {
    await this.load();
    return this.projects.get(id) ?? null;
  }

  async updateStatus(id: string, status: Project["status"]): Promise<Project | null> {
    await this.load();
    const project = this.projects.get(id);

    if (!project) {
      return null;
    }

    const updatedProject = {
      ...project,
      status,
      updatedAt: new Date()
    };

    this.projects.set(id, updatedProject);
    await this.save();
    return updatedProject;
  }

  private async load(): Promise<void> {
    if (this.isLoaded) {
      return;
    }

    try {
      const payload = await fs.readFile(this.storagePath, "utf-8");
      const projects = JSON.parse(payload) as Project[];

      for (const project of projects) {
        this.projects.set(project.id, {
          ...project,
          createdAt: new Date(project.createdAt),
          updatedAt: new Date(project.updatedAt)
        });
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }

    this.isLoaded = true;
  }

  private async save(): Promise<void> {
    await fs.mkdir(path.dirname(this.storagePath), { recursive: true });
    await fs.writeFile(
      this.storagePath,
      JSON.stringify(Array.from(this.projects.values()), null, 2),
      "utf-8"
    );
  }
}
