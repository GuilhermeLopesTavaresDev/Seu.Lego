import type { PreviewResponse, Project } from "./types";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

export async function createProject(input: {
  image: File;
  widthStuds: number;
  heightStuds: number;
  partId: string;
  colorLimit: number;
}): Promise<Project> {
  const formData = new FormData();
  formData.append("image", input.image);
  formData.append("widthStuds", String(input.widthStuds));
  formData.append("heightStuds", String(input.heightStuds));
  formData.append("partId", input.partId);
  formData.append("colorLimit", String(input.colorLimit));

  const response = await fetch(`${apiBaseUrl}/uploads/image`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel enviar a imagem.");
  }

  const payload = (await response.json()) as { project: Project };
  return payload.project;
}

export async function getProjectPreview(projectId: string): Promise<PreviewResponse> {
  const response = await fetch(`${apiBaseUrl}/projects/${projectId}/preview`);

  if (!response.ok) {
    throw new Error("Nao foi possivel gerar a previa.");
  }

  return (await response.json()) as PreviewResponse;
}

export function getManualUrl(projectId: string): string {
  return `${apiBaseUrl}/projects/${projectId}/manual.pdf`;
}
