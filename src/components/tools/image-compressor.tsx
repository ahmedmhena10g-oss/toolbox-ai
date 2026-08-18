"use client";

import { useState } from "react";
import { RefreshCw, TrendingDown } from "lucide-react";
import FileUploader from "../upload/FileUploader";
import FilePreview from "../upload/FilePreview";
import { useImageFiles } from "@/lib/useImageFiles";
import { compressImage, compressToMaxSize } from "@/lib/image";
import { stripExtension, formatBytes } from "@/lib/utils";
import { useToast } from "../ui/Toast";
import { Button, ProgressBar } from "../ui/feedback";
import { Field, Select, Tabs, Toggle } from "../ui/form";
import { ResultsPanel, makeResult, type ResultItem } from "./shared";

type Level = "low" | "balanced" | "high" | "ultra";

const levelQuality: Record<Level, number> = {
  low: 0.9,
  balanced: 0.75,
  high: 0.6,
  ultra: 0.45,
};

const levelLabels: Record<Level, string> = {
  low: "Low (quality first)",
  balanced: "Balanced (recommended)",
  high: "High compression",
  ultra: "Ultra compression",
};

export default function ImageCompressor() {
  const { entries, addFiles, remove, clear } = useImageFiles(1);
  const { toast } = useToast();
  const [mode, setMode] = useState<"level" | "maxSize">("level");
  const [level, setLevel] = useState<Level>("balanced");
  const [maxSizeMB, setMaxSizeMB] = useState("1");
  const [stripMetadata, setStripMetadata] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ResultItem | null>(null);
  const [savings, setSavings] = useState<{ original: number; compressed: number; percent: number } | null>(null);

  const entry = entries[0];

  const compress = async () => {
    if (!entry?.loaded) {
      toast("Please add a valid image first.", "error");
      return;
    }
    setProcessing(true);
    setResult(null);
    setSavings(null);
    setProgress(15);
    try {
      const isPng = entry.file.name.toLowerCase().endsWith(".png");
      // PNG gets a lossless re-encode (metadata stripped); JPG/WebP get quality control.
      const format = isPng ? "png" : "jpg";
      let blob: Blob;
      if (mode === "maxSize" && !isPng) {
        const maxBytes = Math.max(10, parseFloat(maxSizeMB) * 1024 * 1024);
        setProgress(45);
        blob = await compressToMaxSize(entry.loaded, "jpg", maxBytes, "#ffffff");
      } else {
        const quality = isPng ? undefined : levelQuality[level];
        setProgress(45);
        blob = await compressImage(entry.loaded, format, quality ?? 0.9, undefined);
      }
      setProgress(85);
      const item = await makeResult(`${stripExtension(entry.name)}-compressed.${format}`, blob);
      setProgress(100);
      setResult(item);
      setSavings({
        original: entry.size,
        compressed: blob.size,
        percent: entry.size > 0 ? Math.max(0, Math.round((1 - blob.size / entry.size) * 100)) : 0,
      });
      toast("Image compressed successfully", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "We couldn't compress this image. Please try again.", "error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <FileUploader
        accept=".jpg,.jpeg,.png,.webp"
        formats={["JPG", "JPEG", "PNG", "WebP"]}
        multiple={false}
        onFiles={(files) => addFiles(files)}
        disabled={processing}
      />

      {entry && (
        <div className="mt-5">
          <FilePreview
            entry={{ id: entry.id, name: entry.name, size: entry.size, dataUrl: entry.dataUrl, isImage: true }}
            onRemove={(id) => remove(id)}
          />
        </div>
      )}

      {entry && !result && (
        <div className="mt-5 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
          <Tabs
            tabs={[
              { id: "level", label: "Compression level" },
              { id: "maxSize", label: "Maximum file size" },
            ]}
            active={mode}
            onChange={(m) => setMode(m)}
          />
          {mode === "level" ? (
            <Field label="How much compression do you want?" htmlFor="level">
              <Select id="level" value={level} onChange={(e) => setLevel(e.target.value as Level)}>
                {(Object.keys(levelLabels) as Level[]).map((key) => (
                  <option key={key} value={key}>{levelLabels[key]}</option>
                ))}
              </Select>
            </Field>
          ) : (
            <Field label="Target maximum file size (MB)" htmlFor="max-size">
              <input
                id="max-size"
                type="number"
                min={0.01}
                step={0.1}
                value={maxSizeMB}
                onChange={(e) => setMaxSizeMB(e.target.value)}
                className="h-10 w-36 rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </Field>
          )}
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-slate-600 dark:text-slate-300">Remove unnecessary metadata</span>
            <Toggle checked={stripMetadata} onChange={setStripMetadata} label="Remove unnecessary metadata" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={compress} loading={processing}>Compress image</Button>
            <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={clear}>Reset</Button>
          </div>
          {processing && <ProgressBar value={progress} label="Compressing…" />}
        </div>
      )}

      {result && savings && (
        <div className="mt-6">
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-800 dark:text-emerald-300">
              <TrendingDown className="h-4 w-4" aria-hidden />
              Compression complete
            </h3>
            <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">
              <span className="font-bold tabular-nums">{formatBytes(savings.original)}</span>
              {" → "}
              <span className="font-bold tabular-nums">{formatBytes(savings.compressed)}</span>
              {" — "}
              <span className="font-bold tabular-nums">{savings.percent}% smaller</span>
            </p>
          </div>
          <ResultsPanel items={[result]} downloadName="compressed-image" onClear={() => setResult(null)} />
          <Button variant="ghost" size="sm" icon={<RefreshCw className="h-4 w-4" />} className="mt-3" onClick={() => { setResult(null); setSavings(null); clear(); }}>
            Compress another image
          </Button>
        </div>
      )}
    </div>
  );
}
