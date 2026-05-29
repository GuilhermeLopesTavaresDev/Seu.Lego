import { useEffect, useRef } from "react";

import type { Mosaic } from "../types";

interface MosaicCanvasProps {
  mosaic: Mosaic | null;
}

export function MosaicCanvas({ mosaic }: MosaicCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mosaic) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const scale = Math.max(4, Math.floor(720 / Math.max(mosaic.width, mosaic.height)));
    canvas.width = mosaic.width * scale;
    canvas.height = mosaic.height * scale;

    context.fillStyle = "#f8fafc";
    context.fillRect(0, 0, canvas.width, canvas.height);

    for (const cell of mosaic.cells) {
      context.fillStyle = cell.legoColor.hex;
      context.fillRect(cell.x * scale, cell.y * scale, scale, scale);
    }

    context.strokeStyle = "rgba(15, 23, 42, 0.12)";
    context.lineWidth = 1;

    if (scale >= 8) {
      for (let x = 0; x <= mosaic.width; x += 1) {
        context.beginPath();
        context.moveTo(x * scale, 0);
        context.lineTo(x * scale, canvas.height);
        context.stroke();
      }

      for (let y = 0; y <= mosaic.height; y += 1) {
        context.beginPath();
        context.moveTo(0, y * scale);
        context.lineTo(canvas.width, y * scale);
        context.stroke();
      }
    }
  }, [mosaic]);

  if (!mosaic) {
    return (
      <div className="empty-preview">
        <div className="empty-grid" />
      </div>
    );
  }

  return <canvas ref={canvasRef} className="mosaic-canvas" aria-label="Previa em pixel art LEGO" />;
}

