import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import PDFDocument from "pdfkit";

import type { Mosaic } from "../models/Mosaic";
import type { ProjectPart } from "../models/ProjectPart";

interface ManualInput {
  projectId: string;
  mosaic: Mosaic;
  parts: ProjectPart[];
}

export class PdfManualService {
  async generateManual(input: ManualInput): Promise<{ filePath: string }> {
    const outputDir = path.resolve(process.cwd(), "manuals");
    await fsPromises.mkdir(outputDir, { recursive: true });

    const filePath = path.join(outputDir, `${input.projectId}.pdf`);
    const doc = new PDFDocument({ margin: 42, size: "A4" });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    this.drawCover(doc, input);
    this.drawAssemblyGuide(doc, input);
    this.drawMosaicMap(doc, input.mosaic);
    this.drawAssemblySteps(doc, input.mosaic);
    this.drawPartsList(doc, input.parts);

    doc.end();

    await new Promise<void>((resolve, reject) => {
      stream.on("finish", resolve);
      stream.on("error", reject);
    });

    return { filePath };
  }

  private drawCover(
    doc: PDFKit.PDFDocument,
    input: ManualInput
  ) {
    const totalPieces = input.parts.reduce((total, part) => total + part.quantity, 0);

    doc.rect(0, 0, doc.page.width, 112).fill("#f5c518");
    doc.rect(42, 34, 86, 46).fill("#111827");
    doc.fontSize(14).fillColor("#ffffff").text("BRICK", 55, 45);
    doc.fontSize(9).fillColor("#ffffff").text("PORTRAIT", 55, 62);

    doc.fontSize(30).fillColor("#111827").text("Manual de montagem", 42, 150);
    doc.fontSize(15).fillColor("#374151").text("Mosaico personalizado em pecas 1 x 1", 42, 190);

    doc.roundedRect(42, 242, doc.page.width - 84, 112, 8).fillAndStroke("#f9fafb", "#d1d5db");
    doc.fontSize(11).fillColor("#111827").text(`${input.mosaic.width} x ${input.mosaic.height}`, 66, 268);
    doc.fontSize(8).fillColor("#6b7280").text("studs", 66, 286);
    doc.fontSize(11).fillColor("#111827").text(`${totalPieces}`, 188, 268);
    doc.fontSize(8).fillColor("#6b7280").text("pecas", 188, 286);
    doc.fontSize(11).fillColor("#111827").text(`${input.parts.length}/${input.mosaic.colorLimit}`, 310, 268);
    doc.fontSize(8).fillColor("#6b7280").text("cores", 310, 286);
    doc.fontSize(11).fillColor("#111827").text(`${input.mosaic.fidelityScore}%`, 432, 268);
    doc.fontSize(8).fillColor("#6b7280").text("fidelidade", 432, 286);

    doc
      .fontSize(10)
      .fillColor("#4b5563")
      .text(`Projeto: ${input.projectId}`, 42, 388);
    doc.text(`Tamanho aproximado: ${(input.mosaic.width * 0.8).toFixed(1)} x ${(input.mosaic.height * 0.8).toFixed(1)} cm`);
    doc.text("Manual inspirado na clareza de instrucoes de montagem por etapas: pecas da etapa, mapa e inventario final.");
    this.drawFooter(doc, "Capa");
  }

  private drawAssemblyGuide(doc: PDFKit.PDFDocument, input: ManualInput) {
    doc.addPage();
    this.drawStepHeader(doc, "Antes de comecar", "Separe, confira e monte por etapas");
    doc.moveDown(0.7);

    const instructions = [
      "1. Separe as pecas por cor antes de comecar. Use a legenda e a lista de pecas deste manual.",
      "2. Prepare uma base com o tamanho indicado. Cada quadrado do mapa representa uma peca 1 x 1.",
      "3. Monte de cima para baixo, seguindo as linhas numeradas. A coluna 1 fica no lado esquerdo.",
      "4. Use as paginas de etapas para montar pequenos blocos de linhas. Isso evita se perder em areas parecidas.",
      "5. Ao finalizar cada faixa de linhas, compare com o mapa geral antes de continuar.",
      "6. A cor da foto foi aproximada para a cor LEGO disponivel mais parecida, entao pequenas diferencas sao esperadas."
    ];

    doc.fontSize(11).fillColor("#374151");
    for (const item of instructions) {
      doc.text(item, { paragraphGap: 8, lineGap: 2 });
    }

    doc.moveDown();
    doc.roundedRect(42, doc.y, 190, 76, 8).fillAndStroke("#f9fafb", "#d1d5db");
    doc.fontSize(12).fillColor("#111827").text("Referencia 1:1", 58, doc.y + 16);
    doc.rect(170, doc.y - 16, 22.68, 22.68).fillAndStroke("#ffffff", "#111827");
    doc.fontSize(8).fillColor("#4b5563").text("1 stud = 8 mm", 58, doc.y + 8);
    doc.moveDown(4);

    doc
      .fontSize(12)
      .fillColor("#111827")
      .text("Resumo da montagem", { underline: true });
    doc.moveDown(0.4);
    doc
      .fontSize(10)
      .fillColor("#374151")
      .text(`Tamanho da grade: ${input.mosaic.width} colunas x ${input.mosaic.height} linhas`);
    doc.text(`Dimensao fisica aproximada: ${(input.mosaic.width * 0.8).toFixed(1)} x ${(input.mosaic.height * 0.8).toFixed(1)} cm`);
    doc.text(`Total de pecas 1 x 1: ${input.parts.reduce((total, part) => total + part.quantity, 0)}`);
    this.drawFooter(doc, "Guia");
  }

  private drawPartsList(doc: PDFKit.PDFDocument, parts: ProjectPart[]) {
    doc.addPage();
    this.drawStepHeader(doc, "Inventario final", "Confira todas as pecas antes de montar");
    doc.moveDown();

    const sortedParts = [...parts].sort((first, second) => first.colorName.localeCompare(second.colorName));

    for (const part of sortedParts) {
      if (doc.y > 735) {
        doc.addPage();
      }

      const colorHex = this.findColorHexByName(part.colorName);
      doc.rect(48, doc.y + 2, 12, 12).fillAndStroke(colorHex, "#111827");
      doc
        .fontSize(10)
        .fillColor("#111827")
        .text(`${part.colorName}`, 68, doc.y, { continued: true })
        .fillColor("#4b5563")
        .text(`  ${part.partId}`, { continued: true })
        .fillColor("#111827")
        .text(`  ${part.quantity} un.`);
    }
    this.drawFooter(doc, "Inventario");
  }

  private drawMosaicMap(doc: PDFKit.PDFDocument, mosaic: Mosaic) {
    doc.addPage({ margin: 24 });
    this.drawStepHeader(doc, "Mapa geral", "Use como conferencia entre as etapas");
    doc.moveDown();

    const labelSpace = 22;
    const availableWidth = doc.page.width - 48 - labelSpace;
    const availableHeight = doc.page.height - 120 - labelSpace;
    const cellSize = Math.min(availableWidth / mosaic.width, availableHeight / mosaic.height);
    const originX = 24 + labelSpace + (availableWidth - cellSize * mosaic.width) / 2;
    const originY = doc.y + 16 + labelSpace;

    this.drawGrid(doc, mosaic, {
      originX,
      originY,
      cellSize,
      startRow: 0,
      endRow: mosaic.height - 1,
      showLabels: true
    });

    doc
      .rect(originX, originY, cellSize * mosaic.width, cellSize * mosaic.height)
      .lineWidth(0.5)
      .strokeColor("#111827")
      .stroke();
    this.drawFooter(doc, "Mapa geral");
  }

  private drawAssemblySteps(doc: PDFKit.PDFDocument, mosaic: Mosaic) {
    const rowsPerStep = 8;

    for (let startRow = 0; startRow < mosaic.height; startRow += rowsPerStep) {
      const endRow = Math.min(startRow + rowsPerStep - 1, mosaic.height - 1);
      const stepNumber = Math.floor(startRow / rowsPerStep) + 1;
      doc.addPage({ margin: 24 });
      this.drawStepHeader(doc, String(stepNumber), `Linhas ${startRow + 1} a ${endRow + 1}`);

      const stepParts = this.getPartsForRows(mosaic, startRow, endRow);
      this.drawPartsTray(doc, stepParts);
      doc.moveDown();

      const stepHeight = endRow - startRow + 1;
      const labelSpace = 22;
      const availableWidth = doc.page.width - 48 - labelSpace;
      const availableHeight = doc.page.height - doc.y - 76 - labelSpace;
      const cellSize = Math.min(availableWidth / mosaic.width, availableHeight / (endRow + 1));
      const originX = 24 + labelSpace + (availableWidth - cellSize * mosaic.width) / 2;
      const originY = doc.y + 16 + labelSpace;

      this.drawProgressGrid(doc, mosaic, {
        originX,
        originY,
        cellSize,
        startRow,
        endRow,
        showLabels: true
      });
      this.drawFooter(doc, `Etapa ${stepNumber}`);
    }
  }

  private drawGrid(
    doc: PDFKit.PDFDocument,
    mosaic: Mosaic,
    options: {
      originX: number;
      originY: number;
      cellSize: number;
      startRow: number;
      endRow: number;
      showLabels: boolean;
    }
  ) {
    const visibleCells = mosaic.cells.filter((cell) => cell.y >= options.startRow && cell.y <= options.endRow);

    for (const cell of visibleCells) {
      doc
        .rect(
          options.originX + cell.x * options.cellSize,
          options.originY + (cell.y - options.startRow) * options.cellSize,
          Math.max(options.cellSize, 0.5),
          Math.max(options.cellSize, 0.5)
        )
        .fill(cell.legoColor.hex);
    }

    if (options.cellSize >= 7) {
      doc.strokeColor("#111827").lineWidth(0.12);
      for (let x = 0; x <= mosaic.width; x += 1) {
        doc
          .moveTo(options.originX + x * options.cellSize, options.originY)
          .lineTo(options.originX + x * options.cellSize, options.originY + (options.endRow - options.startRow + 1) * options.cellSize)
          .stroke();
      }

      for (let row = 0; row <= options.endRow - options.startRow + 1; row += 1) {
        doc
          .moveTo(options.originX, options.originY + row * options.cellSize)
          .lineTo(options.originX + mosaic.width * options.cellSize, options.originY + row * options.cellSize)
          .stroke();
      }
    }

    if (options.showLabels) {
      doc.fontSize(6).fillColor("#111827");
      for (let x = 0; x < mosaic.width; x += 4) {
        doc.text(String(x + 1), options.originX + x * options.cellSize, options.originY - 12, {
          width: options.cellSize * 4,
          align: "center"
        });
      }

      for (let row = options.startRow; row <= options.endRow; row += 1) {
        doc.text(String(row + 1), options.originX - 20, options.originY + (row - options.startRow) * options.cellSize + 1, {
          width: 16,
          align: "right"
        });
      }
    }
  }

  private drawProgressGrid(
    doc: PDFKit.PDFDocument,
    mosaic: Mosaic,
    options: {
      originX: number;
      originY: number;
      cellSize: number;
      startRow: number;
      endRow: number;
      showLabels: boolean;
    }
  ) {
    const previousCells = mosaic.cells.filter((cell) => cell.y < options.startRow);

    doc.save();
    doc.opacity(0.22);
    for (const cell of previousCells) {
      doc
        .rect(
          options.originX + cell.x * options.cellSize,
          options.originY + cell.y * options.cellSize,
          Math.max(options.cellSize, 0.5),
          Math.max(options.cellSize, 0.5)
        )
        .fill(cell.legoColor.hex);
    }
    doc.restore();

    const currentCells = mosaic.cells.filter((cell) => cell.y >= options.startRow && cell.y <= options.endRow);
    for (const cell of currentCells) {
      doc
        .rect(
          options.originX + cell.x * options.cellSize,
          options.originY + cell.y * options.cellSize,
          Math.max(options.cellSize, 0.5),
          Math.max(options.cellSize, 0.5)
        )
        .fill(cell.legoColor.hex);
    }

    doc
      .rect(
        options.originX,
        options.originY + options.startRow * options.cellSize,
        options.cellSize * mosaic.width,
        options.cellSize * (options.endRow - options.startRow + 1)
      )
      .lineWidth(2)
      .strokeColor("#0f766e")
      .stroke();

    if (options.showLabels) {
      doc.fontSize(6).fillColor("#111827");
      for (let x = 0; x < mosaic.width; x += 4) {
        doc.text(String(x + 1), options.originX + x * options.cellSize, options.originY - 12, {
          width: options.cellSize * 4,
          align: "center"
        });
      }

      for (let row = 0; row <= options.endRow; row += 1) {
        doc.text(String(row + 1), options.originX - 20, options.originY + row * options.cellSize + 1, {
          width: 16,
          align: "right"
        });
      }
    }
  }

  private drawStepHeader(doc: PDFKit.PDFDocument, title: string, subtitle: string) {
    if (/^\d+$/.test(title)) {
      doc.circle(56, 52, 24).fill("#111827");
      doc.fontSize(24).fillColor("#ffffff").text(title, 42, 38, {
        width: 28,
        align: "center"
      });
      doc.fontSize(18).fillColor("#111827").text(subtitle, 92, 38);
      doc.fontSize(9).fillColor("#6b7280").text("Pecas desta etapa no topo, montagem abaixo.", 92, 62);
      doc.moveDown(3);
      return;
    }

    doc.fontSize(20).fillColor("#111827").text(title);
    doc.fontSize(10).fillColor("#6b7280").text(subtitle);
  }

  private drawPartsTray(doc: PDFKit.PDFDocument, parts: ProjectPart[]) {
    const startX = 42;
    let x = startX;
    let y = doc.y + 8;
    const trayHeight = 82;

    doc.roundedRect(42, y, doc.page.width - 84, trayHeight, 8).fillAndStroke("#f9fafb", "#d1d5db");
    y += 14;

    for (const part of parts.slice(0, 12)) {
      if (x > doc.page.width - 92) {
        x = startX;
        y += 30;
      }

      doc.rect(x, y, 16, 16).fillAndStroke(this.findColorHexByName(part.colorName), "#111827");
      doc.fontSize(8).fillColor("#111827").text(`${part.quantity}x`, x + 22, y + 1, { width: 34 });
      x += 62;
    }

    if (parts.length > 12) {
      doc.fontSize(8).fillColor("#6b7280").text(`+ ${parts.length - 12} cores nesta etapa`, x, y + 1);
    }

    doc.y = y + 38;
  }

  private getPartsForRows(mosaic: Mosaic, startRow: number, endRow: number): ProjectPart[] {
    const totals = new Map<string, ProjectPart>();

    for (const cell of mosaic.cells.filter((item) => item.y >= startRow && item.y <= endRow)) {
      const key = cell.legoColor.id;
      const current = totals.get(key);

      if (current) {
        current.quantity += 1;
      } else {
        totals.set(key, {
          partId: "1x1",
          colorId: cell.legoColor.id,
          colorName: cell.legoColor.name,
          quantity: 1
        });
      }
    }

    return Array.from(totals.values()).sort((first, second) => second.quantity - first.quantity);
  }

  private drawFooter(doc: PDFKit.PDFDocument, label: string) {
    doc
      .fontSize(7)
      .fillColor("#9ca3af")
      .text(`Brick Portrait Studio - ${label}`, 42, doc.page.height - 34, {
        width: doc.page.width - 84,
        align: "center"
      });
  }

  private findColorHexByName(colorName: string): string {
    const palette: Record<string, string> = {
      Black: "#05131D",
      White: "#FFFFFF",
      Red: "#C91A09",
      "Dark Red": "#720E0F",
      Coral: "#FF698F",
      Blue: "#0055BF",
      "Dark Blue": "#0A3463",
      "Medium Blue": "#5A93DB",
      "Light Blue": "#B4D2E3",
      Yellow: "#F2CD37",
      "Bright Light Yellow": "#FFF03A",
      Orange: "#FE8A18",
      "Dark Orange": "#A95500",
      Green: "#237841",
      "Dark Green": "#184632",
      Lime: "#BBE90B",
      "Olive Green": "#9B9A5A",
      "Sand Green": "#A0BCAC",
      Tan: "#E4CD9E",
      "Light Nougat": "#F6D7B3",
      Nougat: "#D09168",
      "Medium Nougat": "#AA7D55",
      "Dark Tan": "#958A73",
      Brown: "#582A12",
      "Reddish Brown": "#582A12",
      "Dark Brown": "#352100",
      "Dark Purple": "#3F3691",
      "Medium Lavender": "#AC78BA",
      Magenta: "#923978",
      Pink: "#FC97AC",
      "Light Bluish Gray": "#A0A5A9",
      "Dark Bluish Gray": "#6C6E68",
      "Light Gray": "#9BA19D",
      "Dark Gray": "#6D6E5C"
    };

    return palette[colorName] ?? "#d1d5db";
  }
}
