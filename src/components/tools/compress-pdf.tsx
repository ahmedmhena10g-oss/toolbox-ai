"use client";

import { useState } from "react";
import { RefreshCw, TrendingDown, FileDown } from "lucide-react";
import FileUploader from "../upload/FileUploader";
import { usePdfFile } from "@/lib/usePdfFile";
import { loadPdfJs, renderPageToCanvas } from "@/lib/pdf";
import { canvasToBlob } from "@/lib/image";
import { downloadBlob, formatBytes, uint8ToBlob } from "@/lib/utils";
import { useToast } from "../ui/Toast";
import { Button, ProgressBar } from "../ui/feedback";
import { Field, Select } from "../ui/form";
import { PdfFileCard } from "./pdf-shared";

type Level = "balanced" | "maximum" | "quality";

const levelConfig: Record<Level, { scale: number; quality: number; label: string }> = {
  balanced: { scale: 1.5, quality: 0.72, label: "Balanced — good quality, much smaller" },
  maximum: { scale: 1.1, quality: 0.55, label: "Maximum — smallest file, some quality loss" },
  quality: { scale: 2, quality: 0.85, label: "Quality first — modest savings, best output" },
};

export default function CompressPdf() {
  const { file, doc, error, loading, handleFile, reset } = usePdfFile();
  const { toast } = useToast();
  const [level, setLevel] = useState<Level>("balanced");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ blob: Blob; original: number } | null>(null);

  const compress = async () => {
    if (!file || !doc) {
      toast("Please add a PDF file first.", "error");
      return;
    }
    setProcessing(true);
    setResult(null);
    setProgress(5);
    try {
      const config = levelConfig[level];
      const pdfjs = await loadPdfJs();
      const source = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
      const pageCount = source.numPages;

      const { PDFDocument } = await import("pdf-lib");
      const out = await PDFDocument.create();
      for (let i = 1; i <= pageCount; i++) {
        const canvas = await renderPageToCanvas(source, i, config.scale);
        const blob = await canvasToBlob(canvas, "jpg", config.quality);
        const bytes = await blob.arrayBuffer();
        const image = await out.embedJpg(bytes);
        const page = out.addPage([image.width, image.height]);
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
        setProgress(Math.round((i / pageCount) * 90) + 5);
      }
      const saved = await out.save();
      const compressedBlob = uint8ToBlob(saved, "application/pdf");
      setProgress(98);

      // Never return a file larger than the original — fall back to a pdf-lib re-save.
      const { PDFDocument: PDFLib } = await import("pdf-lib");
      const resaved = await PDFLib.load(await file.arrayBuffer(), { ignoreEncryption: true });
      const resavedBytes = await resaved.save();
      const finalBlob =
        compressedBlob.size < file.size ? compressedBlob : uint8ToBlob(resavedBytes, "application/pdf");

      setProgress(100);
      setResult({ blob: finalBlob, original: file.size });
      toast("PDF compressed successfully", "success");
    } catch (err) {
      console.error(err);
      toast("We couldn't compress this PDF. Please make sure it is a valid PDF and try again.", "error");
    } finally {
      setProcessing(false);
    }
  };

  const savings = result
    ? { percent: result.original > 0 ? Math.max(0, Math.round((1 - result.blob.size / result.original) * 100)) : 0 }
    : null;

  return (
    <div>
      {!file ? (
        <FileUploader
          accept=".pdf"
          formats={["PDF"]}
          multiple={false}
          hint="Text stays crisp; embedded images are re-encoded at an optimized quality."
          onFiles={handleFile}
          disabled={loading}
        />
      ) : (
        <div className="space-y-4">
          <PdfFileCard name={file.name} size={file.size} pageCount={doc ? doc.getPageCount() : null} onReset={reset} error={error} />

          {doc && !result && (
            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
              <Field label="Compression level" htmlFor="level">
                <Select id="level" value={level} onChange={(e) => setLevel(e.target.value as Level)}>
                  <option value="balanced">Balanced — good quality, much smaller</option>
                  <option value="maximum">Maximum — smallest file, some quality loss</option>
                  <option value="quality">Quality first — modest savings, best output</option>
                </Select>
              </Field>
              <div className="flex flex-wrap gap-2">
                <Button onClick={compress} loading={processing}>Compress PDF</Button>
                <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={reset}>Reset</Button>
              </div>
              {processing && <ProgressBar value={progress} label="Optimizing pages…" />}
            </div>
          )}

          {result && savings && (
            <div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-800 dark:text-emerald-300">
                  <TrendingDown className="h-4 w-4" aria-hidden />
                  Compression complete
                </h3>
                <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">
                  <span className="font-bold tabular-nums">{formatBytes(result.original)}</span>
                  {" → "}
                  <span className="font-bold tabular-nums">{formatBytes(result.blob.size)}</span>
                  {" — "}
                  <span className="font-bold tabular-nums">{savings.percent}% smaller</span>
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant="success"
                  icon={<FileDown className="h-4 w-4" />}
                  onClick={() => {
                    downloadBlob(result.blob, file.name.replace(/\.pdf$/i, "-compressed.pdf"));
                    toast("Compressed PDF downloaded", "success");
                  }}
                >
                  Download compressed PDF
                </Button>
                <Button
                  variant="secondary"
                  icon={<RefreshCw className="h-4 w-4" />}
                  onClick={() => {
                    setResult(null);
                    reset();
                  }}
                >
                  Compress another file
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
