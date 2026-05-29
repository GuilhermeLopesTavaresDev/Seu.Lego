export interface ProcessImageJobPayload {
  projectId: string;
}

export class ProcessImageJob {
  static readonly name = "process-image";

  async handle(_payload: ProcessImageJobPayload): Promise<void> {
    // A versao com BullMQ deve buscar o projeto, gerar mosaico, salvar partes e atualizar status.
  }
}

