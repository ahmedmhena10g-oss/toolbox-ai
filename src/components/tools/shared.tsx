"use client";

import { useRef, useState, type ReactNode } from "react";
import { Download, Package, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { downloadBlob, formatBytes, loadJszip, uid } from "@/lib/utils";
import { useToast } from "../ui/Toast";
import { Button } from "../ui/feedback";

export interface ResultItem {
  id: string;
  name: string;
  blob: Blob;
  dataUrl: string;
  size: number;
  badge?: string;
}

export function makeResult(name: string, blob: Blob, badge?: string): Promise<ResultItem> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve({ id: uid(), name, blob, dataUrl: reader.result as string, size: blob.size, badge });
    reader.readAsDataURL(blob);
  });
}

/** Download multiple blobs at once. */
export async function downloadAll(items: ResultItem[], fallbackName: string) {
  if (items.length === 1) {
    downloadBlob(items[0].blob, items[0].name);
    return;
  }
  const JSZip = await loadJszip();
  const zip = new JSZip();
  for (const item of items) {
    zip.file(item.name, item.blob);
  }
  const blob = await zip.generateAsync({ type: "blob" });
  downloadBlob(blob, `${fallbackName}.zip`);
}

export function DownloadAllButton({ items, name, disabled = false }: { items: ResultItem[]; name: string; disabled?: boolean }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  return (
    <Button
      variant="success"
      size="md"
      disabled={disabled || items.length === 0 || busy}
      loading={busy}
      icon={<Package className="h-4 w-4" />}
      onClick={async () => {
        setBusy(true);
        try {
          await downloadAll(items, name);
          toast(`Downloaded ${items.length} file${items.length === 1 ? "" : "s"}`, "success");
        } catch {
          toast("Couldn't create the ZIP archive. Please try again.", "error");
        } finally {
          setBusy(false);
        }
      }}
    >
      Download all ({items.length})
    </Button>
  );
}

/* ------------------------------------------------------------ ResultsPanel */

export function ResultsPanel({
  items,
  downloadName,
  onClear,
  clearLabel = "Clear results",
  showSize = true,
  previewHeight = "h-40",
}: {
  items: ResultItem[];
  downloadName: string;
  onClear: () => void;
  clearLabel?: string;
  showSize?: boolean;
  previewHeight?: string;
}) {
  const { toast } = useToast();
  return (
    <div className="mt-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Results {items.length > 0 && <span className="text-sm font-medium text-slate-400">({items.length})</span>}
        </h3>
        <div className="flex items-center gap-2">
          <DownloadAllButton items={items} name={downloadName} />
          {items.length > 0 && (
            <Button variant="ghost" size="md" icon={<Trash2 className="h-4 w-4" />} onClick={onClear}>
              {clearLabel}
            </Button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/60"
          >
            <div className={`${previewHeight} relative flex items-center justify-center bg-slate-50 dark:bg-slate-900/40`}>
              <img
                src={item.dataUrl}
                alt={`Result ${item.name}`}
                className="h-full w-full object-contain"
                loading="lazy"
              />
              {item.badge && (
                <span className="absolute left-2 top-2 rounded-full bg-slate-900/70 px-2 py-0.5 text-[10px] font-semibold text-white">
                  {item.badge}
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="truncate text-xs font-medium text-slate-700 dark:text-slate-200">{item.name}</p>
              <div className="mt-1.5 flex items-center justify-between gap-2">
                {showSize ? (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">{formatBytes(item.size)}</span>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={() => {
                    downloadBlob(item.blob, item.name);
                    toast(`Downloading ${item.name}`, "success");
                  }}
                  className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <Download className="h-3 w-3" aria-hidden /> Download
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {items.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400 dark:border-slate-700">
          Your converted files will appear here.
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------- BeforeAfter */

/** Original | Colored comparison slider. */
export function BeforeAfter({
  original,
  result,
  originalLabel = "Original",
  resultLabel = "Result",
  height = "h-[420px]",
}: {
  original: string;
  result: string;
  originalLabel?: string;
  resultLabel?: string;
  height?: string;
}) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updateFromClientX = (clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.max(0, Math.min(100, pct)));
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full touch-none select-none overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 ${height}`}
      onPointerDown={(e) => {
        dragging.current = true;
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        updateFromClientX(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && updateFromClientX(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerLeave={() => (dragging.current = false)}
      role="slider"
      aria-label="Comparison slider"
      aria-valuenow={Math.round(position)}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") setPosition((p) => Math.max(0, p - 5));
        if (e.key === "ArrowRight") setPosition((p) => Math.min(100, p + 5));
      }}
    >
      <img src={original} alt={originalLabel} className="absolute inset-0 h-full w-full object-contain" draggable={false} />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <img src={result} alt={resultLabel} className="h-full w-full object-contain" draggable={false} />
      </div>
      <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-slate-900/70 px-2.5 py-1 text-[11px] font-semibold text-white">
        {originalLabel}
      </span>
      <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-brand-600/90 px-2.5 py-1 text-[11px] font-semibold text-white">
        {resultLabel}
      </span>
      <div className="absolute inset-y-0" style={{ left: `${position}%` }}>
        <div className="absolute inset-y-0 -ml-px w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.15)]" />
        <span className="absolute top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-700 shadow-panel">
          <ChevronLeft className="h-4 w-4" aria-hidden />
          <ChevronRight className="-ml-1.5 h-4 w-4" aria-hidden />
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- ToolHeader */

export function ToolControls({ children }: { children: ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}
