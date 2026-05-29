import { Check, Download, ImageUp, Moon, Package, Palette, Ruler, Sun, Wand2 } from "lucide-react";
import { ChangeEvent, useMemo, useState } from "react";

import { createProject, getManualUrl, getProjectPreview } from "./api";
import { MosaicCanvas } from "./components/MosaicCanvas";
import { MosaicScene } from "./components/MosaicScene";
import type { PreviewResponse } from "./types";

type Theme = "light" | "dark";
type PartId = "tile-1x1" | "plate-1x1";

const sizeOptions = [
  { label: "16 x 16", width: 16, height: 16, group: "Mini" },
  { label: "24 x 24", width: 24, height: 24, group: "Mini" },
  { label: "32 x 32", width: 32, height: 32, group: "Quadrado" },
  { label: "48 x 48", width: 48, height: 48, group: "Quadrado" },
  { label: "64 x 64", width: 64, height: 64, group: "Quadrado" },
  { label: "96 x 96", width: 96, height: 96, group: "Quadrado" },
  { label: "24 x 32", width: 24, height: 32, group: "Retrato" },
  { label: "32 x 48", width: 32, height: 48, group: "Retrato" },
  { label: "48 x 64", width: 48, height: 64, group: "Retrato" },
  { label: "64 x 96", width: 64, height: 96, group: "Retrato" },
  { label: "32 x 24", width: 32, height: 24, group: "Paisagem" },
  { label: "48 x 32", width: 48, height: 32, group: "Paisagem" },
  { label: "64 x 48", width: 64, height: 48, group: "Paisagem" },
  { label: "96 x 64", width: 96, height: 64, group: "Paisagem" }
];

const colorLimitOptions = [12, 24, 36];

export function App() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState(sizeOptions[1]);
  const [partId, setPartId] = useState<PartId>("tile-1x1");
  const [colorLimit, setColorLimit] = useState(24);
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const totalPieces = useMemo(
    () => preview?.parts.reduce((total, part) => total + part.quantity, 0) ?? 0,
    [preview]
  );

  const dimensions = useMemo(() => {
    const widthCm = ((preview?.mosaic.width ?? selectedSize.width) * 0.8).toFixed(1);
    const heightCm = ((preview?.mosaic.height ?? selectedSize.height) * 0.8).toFixed(1);
    return `${widthCm} x ${heightCm} cm`;
  }, [preview, selectedSize]);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setPreview(null);
    setProjectId(null);
    setErrorMessage(null);

    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    setImagePreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  async function handleGenerate() {
    if (!selectedFile) {
      setErrorMessage("Escolha uma foto para gerar o projeto.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const project = await createProject({
        image: selectedFile,
        widthStuds: selectedSize.width,
        heightStuds: selectedSize.height,
        partId,
        colorLimit
      });
      setProjectId(project.id);
      const nextPreview = await getProjectPreview(project.id);
      setPreview(nextPreview);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Erro inesperado ao processar a imagem.");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleDownloadPdf() {
    if (!projectId) {
      setErrorMessage("Gere a pixel art antes de baixar o PDF.");
      return;
    }

    setIsGeneratingPdf(true);
    setErrorMessage(null);

    try {
      const response = await fetch(getManualUrl(projectId));

      if (!response.ok) {
        throw new Error("Nao foi possivel gerar o PDF.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `manual-${projectId}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Erro inesperado ao gerar o PDF.");
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  return (
    <main className={`app ${theme}`}>
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Brick Portrait Studio</p>
            <h1>Transforme uma foto em um projeto LEGO montavel.</h1>
          </div>
          <button className="icon-button" type="button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            <span>{theme === "dark" ? "Modo claro" : "Modo escuro"}</span>
          </button>
        </header>

        <div className="layout">
          <aside className="control-panel">
            <label className="upload-zone">
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageChange} />
              {imagePreviewUrl ? (
                <img src={imagePreviewUrl} alt="Foto escolhida" />
              ) : (
                <span className="upload-placeholder">
                  <ImageUp size={30} />
                  <strong>Enviar foto</strong>
                  <small>PNG, JPG ou WEBP ate 10 MB</small>
                </span>
              )}
            </label>

            <div className="field-group">
              <span className="field-label">Tamanho final</span>
              <div className="size-grid">
                {sizeOptions.map((option) => (
                  <button
                    className={selectedSize.label === option.label ? "active" : ""}
                    key={option.label}
                    type="button"
                    onClick={() => setSelectedSize(option)}
                  >
                    <span>{option.label}</span>
                    <small>{option.group}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="field-group">
              <span className="field-label">Peca principal</span>
              <div className="segmented two-options">
                <button className={partId === "tile-1x1" ? "active" : ""} type="button" onClick={() => setPartId("tile-1x1")}>
                  Tile 1x1
                </button>
                <button className={partId === "plate-1x1" ? "active" : ""} type="button" onClick={() => setPartId("plate-1x1")}>
                  Plate 1x1
                </button>
              </div>
            </div>

            <div className="field-group">
              <span className="field-label">Limite de cores</span>
              <div className="segmented">
                {colorLimitOptions.map((option) => (
                  <button
                    className={colorLimit === option ? "active" : ""}
                    key={option}
                    type="button"
                    onClick={() => setColorLimit(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <button className="primary-action" type="button" disabled={isProcessing} onClick={handleGenerate}>
              <Wand2 size={19} />
              {isProcessing ? "Gerando projeto..." : "Gerar pixel art"}
            </button>

            {errorMessage ? <p className="error-message">{errorMessage}</p> : null}

            <div className="metrics">
              <div>
                <Ruler size={18} />
                <span>Escala real</span>
                <strong>{dimensions}</strong>
              </div>
              <div>
                <Package size={18} />
                <span>Pecas estimadas</span>
                <strong>{totalPieces || selectedSize.width * selectedSize.height}</strong>
              </div>
              <div>
                <Check size={18} />
                <span>Cores</span>
                <strong>{preview ? `${preview.parts.length}/${preview.mosaic.colorLimit}` : colorLimit}</strong>
              </div>
              <div>
                <Palette size={18} />
                <span>Fidelidade</span>
                <strong>{preview ? `${preview.mosaic.fidelityScore}%` : "A analisar"}</strong>
              </div>
            </div>
          </aside>

          <section className="experience">
            <div className="viewer-header">
              <div>
                <p className="eyebrow">Modelo 3D</p>
                <h2>Previa em escala para entender tamanho, relevo e proporcao.</h2>
              </div>
              <button
                className="secondary-action"
                type="button"
                disabled={!projectId || isGeneratingPdf}
                onClick={handleDownloadPdf}
              >
                <Download size={18} />
                {isGeneratingPdf ? "Gerando PDF..." : "Baixar PDF"}
              </button>
            </div>

            <MosaicScene mosaic={preview?.mosaic ?? null} partId={partId} theme={theme} />
          </section>
        </div>

        <section className="result-band">
          <div className="preview-pane">
            <div className="section-title">
              <p className="eyebrow">Pixel art</p>
              <h2>Mapa visual do mosaico</h2>
            </div>
            <MosaicCanvas mosaic={preview?.mosaic ?? null} />
          </div>

          <div className="parts-pane">
            <div className="section-title">
              <p className="eyebrow">Lista de pecas</p>
              <h2>{preview ? `${preview.parts.length} cores encontradas` : "Aguardando imagem"}</h2>
            </div>
            <div className="parts-list">
              {(preview?.parts ?? []).slice(0, 12).map((part) => (
                <div className="part-row" key={`${part.partId}-${part.colorId}`}>
                  <span className="color-dot" style={{ background: preview?.mosaic.cells.find((cell) => cell.legoColor.id === part.colorId)?.legoColor.hex }} />
                  <span>{part.colorName}</span>
                  <strong>{part.quantity}</strong>
                </div>
              ))}
              {!preview ? (
                <div className="empty-list">
                  Envie uma foto para ver a lista de cores e quantidades necessarias para montar em casa.
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
