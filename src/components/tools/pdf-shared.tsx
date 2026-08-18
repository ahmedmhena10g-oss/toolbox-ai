"use client";

import { useEffect, useState } from "react";
import type { PDFDocument } from "pdf-lib";
import { FileText, Loader2 } from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { Button } from "../ui/feedback";
import { loadPdfJs, renderPageToCanvas } from "@/lib/pdf";

export function PdfFileCard({
  name,
  size,
  pageCount,
  onReset,
  error,
}: {
  name: string;
  size: number;
  pageCount: number | null;
  onReset: () => void;
  error?: string | null;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500 dark:bg-red-500/10">
          <FileText className="h-6 w-6" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{name}</p>
          <p className="text-xs text-slate-400">
            {formatBytes(size)}
            {pageCount !== null ? ` · ${pageCount} page${pageCount === 1 ? "" : "s"}` : ""}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onReset}>Change file</Button>
      </div>
      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}

export interface Thumb {
  number: number;
  dataUrl: string;
  selected: boolean;
}

/** Render PDF page thumbnails with pdf.js. */
export function usePdfThumbs(file: File | null, maxPages = 60): { thumbs: Thumb[]; ready: boolean } {
  const [thumbs, setThumbs] = useState<Thumb[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setThumbs([]);
    if (!file) return;
    (async () => {
      try {
        const pdfjs = await loadPdfJs();
        const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
        const count = Math.min(doc.numPages, maxPages);
        const rendered: Thumb[] = [];
        for (let i = 1; i <= count; i++) {
          if (cancelled) return;
          try {
            const canvas = await renderPageToCanvas(doc, i, 0.35);
            rendered.push({ number: i, dataUrl: canvas.toDataURL("image/jpeg", 0.8), selected: false });
          } catch {
            rendered.push({ number: i, dataUrl: "", selected: false });
          }
        }
        if (!cancelled) {
          setThumbs(rendered);
          setReady(true);
        }
      } catch {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [file, maxPages]);

  return { thumbs, ready };
}

export function ThumbGrid({
  thumbs,
  onToggle,
  onSelectAll,
  onClear,
}: {
  thumbs: Thumb[];
  onToggle: (number: number) => void;
  onSelectAll: () => void;
  onClear: () => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Pages
          <span className="ml-1 font-normal text-slate-400">({thumbs.length})</span>
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={onSelectAll} className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">
            Select all
          </button>
          <button type="button" onClick={onClear} className="text-xs font-medium text-slate-400 hover:underline">
            Clear
          </button>
        </div>
      </div>
      <div className="grid max-h-72 grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-6">
        {thumbs.map((thumb) => (
          <button
            key={thumb.number}
            type="button"
            onClick={() => onToggle(thumb.number)}
            aria-pressed={thumb.selected}
            aria-label={`Select page ${thumb.number}`}
            className={`relative aspect-[3/4] overflow-hidden rounded-lg border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
              thumb.selected
                ? "border-brand-600 ring-2 ring-brand-500/30"
                : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
            }`}
          >
            {thumb.dataUrl ? (
              <img src={thumb.dataUrl} alt={`Page ${thumb.number}`} className="h-full w-full object-cover" loading="lazy" />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-slate-100 text-[10px] text-slate-400 dark:bg-slate-800">
                {thumb.number}
              </span>
            )}
            <span
              className={`absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                thumb.selected ? "bg-brand-600 text-white" : "bg-slate-900/60 text-white"
              }`}
            >
              {thumb.number}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function PdfThumbLoader({ busy }: { busy: boolean }) {
  if (!busy) return null;
  return (
    <div className="flex items-center gap-2 py-3 text-sm text-slate-400">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      Generating page previews…
    </div>
  );
}

export type { PDFDocument };
