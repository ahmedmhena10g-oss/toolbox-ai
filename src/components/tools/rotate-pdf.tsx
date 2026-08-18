"use client";

import { useMemo, useState } from "react";
import { RefreshCw, RotateCw, RotateCcw, FileDown } from "lucide-react";
import FileUploader from "../upload/FileUploader";
import { usePdfFile } from "@/lib/usePdfFile";
import { rotatePages } from "@/lib/pdf";
import { downloadBlob, stripExtension, uint8ToBlob } from "@/lib/utils";
import { useToast } from "../ui/Toast";
import { Button, ProgressBar } from "../ui/feedback";
import { Field, Select, TextInput } from "../ui/form";
import { PdfFileCard, ThumbGrid, usePdfThumbs, PdfThumbLoader } from "./pdf-shared";

export default function RotatePdf() {
  const { file, doc, error, loading, handleFile, reset } = usePdfFile();
  const { toast } = useToast();
  const [mode, setMode] = useState<"all" | "selected" | "individual">("all");
  const [selection, setSelection] = useState("");
  const [thumbSelection, setThumbSelection] = useState<Set<number>>(new Set());
  const [direction, setDirection] = useState<"cw" | "ccw">("cw");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { thumbs, ready } = usePdfThumbs(file);

  const pageCount = doc?.getPageCount() ?? 0;
  const selectedThumbs = useMemo(() => [...thumbSelection].sort((a, b) => a - b), [thumbSelection]);

  const toggleThumb = (number: number) => {
    setThumbSelection((prev) => {
      const next = new Set(prev);
      if (next.has(number)) next.delete(number);
      else next.add(number);
      return next;
    });
  };

  const applyRotation = async (degrees: 90 | -90) => {
    if (!doc || !file) {
      toast("Please add a PDF file first.", "error");
      return;
    }
    let indices: number[] = [];
    if (mode === "all") {
      indices = Array.from({ length: pageCount }, (_, i) => i);
    } else if (mode === "selected") {
      indices = thumbSelection.size > 0 ? selectedThumbs.map((n) => n - 1) : parseRange(selection, pageCount);
    }
    if (mode === "selected" && indices.length === 0) {
      toast("No pages selected. Choose pages or enter page numbers.", "error");
      return;
    }
    setProcessing(true);
    setProgress(20);
    try {
      const bytes = await rotatePages(doc, indices, degrees);
      const blob = uint8ToBlob(bytes, "application/pdf");
      setProgress(100);
      downloadBlob(blob, `${stripExtension(file.name)}-rotated.pdf`);
      toast(`Rotated ${indices.length} page${indices.length === 1 ? "" : "s"}`, "success");
    } catch (err) {
      console.error(err);
      toast("We couldn't rotate this PDF. The file may be password-protected or corrupted.", "error");
    } finally {
      setProcessing(false);
    }
  };

  const rotateIndividual = async (pageNumber: number) => {
    if (!doc || !file) return;
    setProcessing(true);
    try {
      const bytes = await rotatePages(doc, [pageNumber - 1], direction === "cw" ? 90 : -90);
      const blob = uint8ToBlob(bytes, "application/pdf");
      downloadBlob(blob, `${stripExtension(file.name)}-rotated.pdf`);
      toast(`Page ${pageNumber} rotated`, "success");
    } catch {
      toast("We couldn't rotate this page. Please try again.", "error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      {!file ? (
        <FileUploader accept=".pdf" formats={["PDF"]} multiple={false} onFiles={handleFile} disabled={loading} />
      ) : (
        <div className="space-y-4">
          <PdfFileCard name={file.name} size={file.size} pageCount={doc ? doc.getPageCount() : null} onReset={reset} error={error} />

          {doc && (
            <>
              <div className="flex flex-wrap items-end gap-3">
                <Field label="Rotate" htmlFor="mode">
                  <Select id="mode" value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}>
                    <option value="all">Entire PDF</option>
                    <option value="selected">Selected pages</option>
                    <option value="individual">Individual pages (click below)</option>
                  </Select>
                </Field>
                <Field label="Direction" htmlFor="direction">
                  <Select id="direction" value={direction} onChange={(e) => setDirection(e.target.value as "cw" | "ccw")}>
                    <option value="cw">Clockwise (90°)</option>
                    <option value="ccw">Counter-clockwise (-90°)</option>
                  </Select>
                </Field>
                {mode === "selected" && (
                  <Field label="Or type pages (e.g. 1-3, 5)" htmlFor="pages">
                    <TextInput id="pages" value={selection} onChange={(e) => setSelection(e.target.value)} placeholder="1-3, 5" className="w-40" />
                  </Field>
                )}
              </div>

              {(mode === "selected" || mode === "individual") && (
                <div>
                  <PdfThumbLoader busy={!ready} />
                  {ready && (
                    <ThumbGrid
                      thumbs={thumbs}
                      onToggle={toggleThumb}
                      onSelectAll={() => setThumbSelection(new Set(thumbs.map((t) => t.number)))}
                      onClear={() => setThumbSelection(new Set())}
                    />
                  )}
                  <p className="mt-2 text-xs text-slate-400">
                    {mode === "individual"
                      ? "Click a page, then choose a direction below to rotate it."
                      : selectedThumbs.length > 0
                      ? `${selectedThumbs.length} page${selectedThumbs.length === 1 ? "" : "s"} selected`
                      : "Click pages to select them, or type page numbers above."}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {mode === "individual" ? (
                  <>
                    <Button
                      onClick={() => rotateIndividual(selectedThumbs[0] ?? 1)}
                      loading={processing}
                      disabled={selectedThumbs.length === 0}
                      icon={<RotateCw className="h-4 w-4" />}
                    >
                      Rotate selected page {direction === "cw" ? "90°" : "-90°"}
                    </Button>
                    <p className="w-full text-xs text-slate-400">
                      Select exactly one page to rotate it individually.
                    </p>
                  </>
                ) : (
                  <Button
                    onClick={() => applyRotation(direction === "cw" ? 90 : -90)}
                    loading={processing}
                    icon={direction === "cw" ? <RotateCw className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
                  >
                    Rotate {mode === "all" ? "entire PDF" : "selected pages"} {direction === "cw" ? "90°" : "-90°"}
                  </Button>
                )}
                <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={reset}>
                  Reset
                </Button>
              </div>
              {processing && <ProgressBar value={progress} label="Rotating pages…" />}
            </>
          )}
        </div>
      )}
    </div>
  );
}

const parseRange = (input: string, pageCount: number): number[] => {
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
  return [...pages].map((n) => n - 1);
};
