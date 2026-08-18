"use client";

import { useState } from "react";
import { RefreshCw, ImageDown } from "lucide-react";
import FileUploader from "../upload/FileUploader";
import { loadPdfJs, renderPageToCanvas } from "@/lib/pdf";
import { canvasToBlob } from "@/lib/image";
import { stripExtension, formatBytes, downloadBlob } from "@/lib/utils";
import { useToast } from "../ui/Toast";
import { Button, ProgressBar } from "../ui/feedback";
import { Field, Select, Slider, TextInput } from "../ui/form";
import { ResultsPanel, makeResult, type ResultItem } from "./shared";

function PdfToImage({ format, label }: { format: "jpg" | "png"; label: string }) {
  const { toast } = useToast();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<"all" | "selected">("all");
  const [selection, setSelection] = useState("");
  const [scale, setScale] = useState("1.5");
  const [quality, setQuality] = useState(90);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ResultItem[]>([]);

  const convert = async () => {
    if (!pdfFile) {
      toast("Please add a PDF file first.", "error");
      return;
    }
    setProcessing(true);
    setResults([]);
    setProgress(5);
    try {
      const pdfjs = await loadPdfJs();
      const buffer = await pdfFile.arrayBuffer();
      const doc = await pdfjs.getDocument({ data: buffer }).promise;
      const pageCount = doc.numPages;
      const numbers =
        mode === "all"
          ? Array.from({ length: pageCount }, (_, i) => i + 1)
          : parseSelection(selection, pageCount);
      if (numbers.length === 0) {
        toast("No valid pages selected. Use a format like 1-3, 5.", "error");
        return;
      }
      const scaleNum = parseFloat(scale);
      const out: ResultItem[] = [];
      for (let i = 0; i < numbers.length; i++) {
        const pageNum = numbers[i];
        const canvas = await renderPageToCanvas(doc, pageNum, scaleNum);
        const blob = await canvasToBlob(canvas, format, format === "jpg" ? quality / 100 : undefined);
        out.push(
          await makeResult(`${stripExtension(pdfFile.name)}-page-${pageNum}.${format}`, blob, `Page ${pageNum}`)
        );
        setProgress(Math.round(((i + 1) / numbers.length) * 95) + 5);
      }
      setResults(out);
      toast(`Converted ${out.length} page${out.length === 1 ? "" : "s"} to ${label}`, "success");
    } catch (err) {
      console.error(err);
      toast(
        "We couldn't process this PDF. Please make sure it is a valid PDF and try again.",
        "error"
      );
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setPdfFile(null);
    setPdfDataUrl(null);
    setResults([]);
    setSelection("");
  };

  return (
    <div>
      {!pdfFile ? (
        <FileUploader
          accept=".pdf"
          formats={["PDF"]}
          multiple={false}
          hint="Each page of the PDF becomes a separate image."
          onFiles={async (files) => {
            const file = files[0];
            setPdfFile(file);
            const reader = new FileReader();
            reader.onload = () => setPdfDataUrl(reader.result as string);
            reader.readAsDataURL(file);
          }}
        />
      ) : (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            {pdfDataUrl && (
              <embed src={pdfDataUrl} className="hidden h-16 w-12 rounded border border-slate-200 sm:block" aria-hidden />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{pdfFile.name}</p>
              <p className="text-xs text-slate-400">{formatBytes(pdfFile.size)}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={reset}>Change file</Button>
          </div>
        </div>
      )}

      {pdfFile && results.length === 0 && (
        <div className="mt-5 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
          <Field label="Pages to convert" htmlFor="page-mode">
            <Select id="page-mode" value={mode} onChange={(e) => setMode(e.target.value as "all" | "selected")}>
              <option value="all">All pages</option>
              <option value="selected">Select specific pages</option>
            </Select>
          </Field>
          {mode === "selected" && (
            <Field label="Page numbers (e.g. 1-3, 5, 8)" htmlFor="pages">
              <TextInput id="pages" value={selection} onChange={(e) => setSelection(e.target.value)} placeholder="1-3, 5, 8" />
            </Field>
          )}
          <div className="flex flex-wrap items-end gap-3">
            <Field label="Resolution" htmlFor="scale">
              <Select id="scale" value={scale} onChange={(e) => setScale(e.target.value)}>
                <option value="1">Standard (72 DPI)</option>
                <option value="1.5">High (108 DPI)</option>
                <option value="2">Very high (144 DPI)</option>
                <option value="3">Maximum (216 DPI)</option>
              </Select>
            </Field>
            {format === "jpg" && (
              <div className="w-44">
                <Slider label="Quality" value={quality} min={40} max={100} unit="%" onChange={setQuality} display={`${quality}%`} />
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={convert} loading={processing} icon={<ImageDown className="h-4 w-4" />}>
              Convert pages to {label}
            </Button>
            <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={reset}>
              Reset
            </Button>
          </div>
          {processing && <ProgressBar value={progress} label="Rendering pages…" />}
        </div>
      )}

      {results.length > 0 && (
        <ResultsPanel items={results} downloadName={`pdf-to-${format}`} onClear={() => setResults([])} />
      )}
    </div>
  );
}

const parseSelection = (input: string, pageCount: number): number[] => {
  const pages = new Set<number>();
  for (const part of input.split(",")) {
    const t = part.trim();
    if (!t) continue;
    if (t.includes("-")) {
      const [a, b] = t.split("-").map((n) => parseInt(n, 10));
      if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
      for (let p = Math.max(1, Math.min(a, b)); p <= Math.min(pageCount, Math.max(a, b)); p++) pages.add(p);
    } else {
      const n = parseInt(t, 10);
      if (Number.isFinite(n) && n >= 1 && n <= pageCount) pages.add(n);
    }
  }
  return [...pages].sort((a, b) => a - b);
};

export function PdfToJpg() {
  return <PdfToImage format="jpg" label="JPG" />;
}

export function PdfToPng() {
  return <PdfToImage format="png" label="PNG" />;
}
