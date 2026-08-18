"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import FileUploader from "../upload/FileUploader";
import FilePreview from "../upload/FilePreview";
import { useImageFiles } from "@/lib/useImageFiles";
import { resizeImage } from "@/lib/image";
import { stripExtension } from "@/lib/utils";
import { useToast } from "../ui/Toast";
import { Button } from "../ui/feedback";
import { Field, Select, Slider, Tabs, TextInput, Toggle } from "../ui/form";
import { ResultsPanel, makeResult, type ResultItem } from "./shared";

type Mode = "dimensions" | "percent" | "presets";

const PRESETS = [
  { id: "instagram-square", label: "Instagram square", width: 1080, height: 1080 },
  { id: "instagram-portrait", label: "Instagram portrait", width: 1080, height: 1350 },
  { id: "youtube-thumbnail", label: "YouTube thumbnail", width: 1280, height: 720 },
  { id: "twitter-header", label: "Twitter header", width: 1500, height: 500 },
  { id: "facebook-cover", label: "Facebook cover", width: 820, height: 312 },
  { id: "blog-wide", label: "Blog wide image", width: 1200, height: 675 },
  { id: "hero", label: "Web hero banner", width: 1920, height: 1080 },
];

export default function ImageResizer() {
  const { entries, addFiles, remove, clear } = useImageFiles(1);
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>("dimensions");
  const [width, setWidth] = useState("1920");
  const [height, setHeight] = useState("1080");
  const [lockAspect, setLockAspect] = useState(true);
  const [percent, setPercent] = useState(50);
  const [preset, setPreset] = useState(PRESETS[0].id);
  const [format, setFormat] = useState("jpg");
  const [quality, setQuality] = useState(90);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ResultItem | null>(null);

  const entry = entries[0];
  const lossy = ["jpg", "webp"].includes(format);

  const updateWidth = (value: string) => {
    setWidth(value);
    if (lockAspect && entry?.loaded) {
      const w = parseFloat(value);
      if (w > 0) {
        setHeight(String(Math.round((entry.loaded.height / entry.loaded.width) * w)));
      }
    }
  };

  const updateHeight = (value: string) => {
    setHeight(value);
    if (lockAspect && entry?.loaded) {
      const h = parseFloat(value);
      if (h > 0) {
        setWidth(String(Math.round((entry.loaded.width / entry.loaded.height) * h)));
      }
    }
  };

  const computeTarget = (): { width?: number; height?: number; percent?: number } => {
    if (mode === "dimensions") return { width: parseFloat(width) || undefined, height: parseFloat(height) || undefined };
    if (mode === "percent") return { percent };
    const p = PRESETS.find((x) => x.id === preset);
    return p ? { width: p.width, height: p.height } : {};
  };

  const resize = async () => {
    if (!entry?.loaded) {
      toast("Please add a valid image first.", "error");
      return;
    }
    const target = computeTarget();
    if (!target.width && !target.height && !target.percent) {
      toast("Please enter valid dimensions.", "error");
      return;
    }
    setProcessing(true);
    try {
      const targetFormat = format === "original" ? (entry.dataUrl.includes("image/png") ? "png" : "jpg") : format;
      const blob = await resizeImage(entry.loaded, {
        ...target,
        format: targetFormat,
        quality: lossy ? quality / 100 : undefined,
        backgroundColor: targetFormat === "jpg" ? "#ffffff" : undefined,
      });
      const item = await makeResult(`${stripExtension(entry.name)}-resized.${targetFormat}`, blob);
      setResult(item);
      toast("Image resized successfully", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "We couldn't resize this image. Please try again.", "error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <FileUploader
        accept=".jpg,.jpeg,.png,.webp"
        formats={["JPG", "PNG", "WebP"]}
        multiple={false}
        onFiles={(files) => addFiles(files)}
        disabled={processing}
      />

      {entry && (
        <div className="mt-5">
          <FilePreview
            entry={{
              id: entry.id,
              name: `${entry.name} — ${entry.loaded?.width ?? "?"}×${entry.loaded?.height ?? "?"} px`,
              size: entry.size,
              dataUrl: entry.dataUrl,
              isImage: true,
            }}
            onRemove={(id) => remove(id)}
          />
        </div>
      )}

      {entry && !result && (
        <div className="mt-5 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
          <Tabs
            tabs={[
              { id: "dimensions", label: "Dimensions" },
              { id: "percent", label: "Percentage" },
              { id: "presets", label: "Presets" },
            ]}
            active={mode}
            onChange={(m) => setMode(m)}
          />

          {mode === "dimensions" && (
            <>
              <div className="flex flex-wrap items-end gap-3">
                <Field label="Width (px)" htmlFor="rw">
                  <TextInput id="rw" type="number" min={1} value={width} onChange={(e) => updateWidth(e.target.value)} className="w-32" />
                </Field>
                <Field label="Height (px)" htmlFor="rh">
                  <TextInput id="rh" type="number" min={1} value={height} onChange={(e) => updateHeight(e.target.value)} className="w-32" />
                </Field>
                <div className="flex items-center gap-2 pb-2">
                  <Toggle checked={lockAspect} onChange={setLockAspect} label="Lock aspect ratio" />
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Lock aspect ratio</span>
                </div>
              </div>
              {entry?.loaded && (
                <p className="text-xs text-slate-400">
                  Original: {entry.loaded.width}×{entry.loaded.height} px · {mode === "dimensions" && lockAspect ? "Aspect ratio is preserved automatically." : ""}
                </p>
              )}
            </>
          )}

          {mode === "percent" && (
            <Slider label="Scale" value={percent} min={1} max={200} unit="%" onChange={setPercent} display={`${percent}%`} />
          )}

          {mode === "presets" && (
            <Field label="Preset size" htmlFor="preset">
              <Select id="preset" value={preset} onChange={(e) => setPreset(e.target.value)}>
                {PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>{p.label} ({p.width}×{p.height})</option>
                ))}
              </Select>
            </Field>
          )}

          <div className="flex flex-wrap items-end gap-3">
            <Field label="Output format" htmlFor="out-format">
              <Select id="out-format" value={format} onChange={(e) => setFormat(e.target.value)}>
                <option value="original">Keep original</option>
                <option value="jpg">JPG</option>
                <option value="png">PNG</option>
                <option value="webp">WebP</option>
              </Select>
            </Field>
            {lossy && (
              <div className="w-48">
                <Slider label="Quality" value={quality} min={10} max={100} unit="%" onChange={setQuality} display={`${quality}%`} />
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={resize} loading={processing}>Resize image</Button>
            <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={clear}>Reset</Button>
          </div>
        </div>
      )}

      {result && (
        <ResultsPanel items={[result]} downloadName="resized-image" onClear={() => setResult(null)} />
      )}
    </div>
  );
}
