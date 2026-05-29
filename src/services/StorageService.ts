import path from "path";

export class StorageService {
  getUploadPath(fileName: string): string {
    const uploadDir = process.env.UPLOAD_DIR ?? "uploads";
    return path.join(uploadDir, fileName);
  }
}

