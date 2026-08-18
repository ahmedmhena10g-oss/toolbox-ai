"use client";

import { useState } from "react";
import { ArrowUp, ArrowDown, RefreshCw } from "lucide-react";
import FileUploader from "../upload/FileUploader";
import FilePreview from "../upload/FilePreview";
import { useImageFiles } from "@/lib/useImageFiles";
import { convertImage } from "@/lib/image";
import { stripExtension, uid } from "@/lib/utils";
import { useToast } from "../ui/Toast";
import { Button, ProgressBar } from "../ui/feedback";
import { Field, Select, Slider, TextInput } from "../ui/form";
import { ResultsPanel, makeResult, type ResultItem } from "./shared";

interface ConverterConfig {
  multiple: boolean;
  accept: string;
  formats: string[];
  outputFormats: { id: string; label: string }[];
  defaultFormat: string;
  showQuality: boolean;
  showBackground: boolean;
  showResolution: boolean;
  maxFiles?: number;
}

function GenericImageConverter({ config }: { config: ConverterConfig }) {
  const { entries, addFiles, remove, clear, reorder, loading: loadingFiles } = useImageFiles(config.maxFiles ?? 10);
  const { toast } = useToast();
  const [format, setFormat] = useState(config.defaultFormat);
  const [quality, setQuality] = useState(92);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [resolution, setResolution] = useState<"original" | "custom">("original");
  const [customWidth, setCustomWidth] = useState("1920");
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [results, setResults] = useState<ResultItem[]>([]);

  const lossy = ["jpg", "jpeg", "webp", "avif"].includes(format);
  const needsBg = ["jpg", "jpeg", "bmp"].includes(format);

  const convert = async () => {
    const ready = entries.filter((e) => e.loaded);
    if (ready.length === 0) {
      toast("Please add at least one valid image first.", "error");
      return;
    }
    setResults([]);
    setProgress({ done: 0, total: ready.length });
    const out: ResultItem[] = [];
    try {
      for (let i = 0; i < ready.length; i++) {
        const entry = ready[i];
        if (!entry.loaded) continue;
        let width: number | undefined;
        let height: number | undefined;
        if (config.showResolution && resolution === "custom") {
          const parsed = parseInt(customWidth, 10);
          if (parsed > 0) {
            width = parsed;
            height = Math.round((entry.loaded.height / entry.loaded.width) * parsed);
          }
        }
        const blob = await convertImage(entry.loaded, {
          format,
          quality: lossy ? quality / 100 : undefined,
          backgroundColor: needsBg ? bgColor : undefined,
          width,
          height,
        });
        out.push(await makeResult(`${stripExtension(entry.name)}.${format}`, blob));
        setProgress({ done: i + 1, total: ready.length });
      }
      setResults(out);
      toast(`Converted ${out.length} image${out.length === 1 ? "" : "s"} successfully`, "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "We couldn't process one of the images. Please try again.", "error");
    } finally {
      setProgress(null);
    }
  };

  return (
    <div>
      <FileUploader
        accept={config.accept}
        formats={config.formats}
        multiple={config.multiple}
        maxFiles={config.maxFiles ?? 10}
        onFiles={(files) => addFiles(files)}
        disabled={loadingFiles}
      />

      {entries.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            {config.multiple ? "Your images" : "Your image"}
            <span className="ml-1 font-normal text-slate-400">({entries.length})</span>
          </h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {entries.map((entry, index) => (
              <div key={entry.id} className="relative">
                <FilePreview
                  entry={{ id: entry.id, name: entry.name, size: entry.size, dataUrl: entry.dataUrl, isImage: true }}
                  onRemove={(id) => remove(id)}
                  index={index}
                />
                {config.multiple && (
                  <div className="absolute -right-2 -top-2 flex gap-0.5">
                    <button
                      type="button"
                      aria-label={`Move ${entry.name} up`}
                      disabled={index === 0}
                      onClick={() => reorder(index, index - 1)}
                      className="rounded-md bg-slate-100 p-1 text-slate-500 hover:bg-slate-200 disabled:opacity-30 dark:bg-slate-700 dark:text-slate-300"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${entry.name} down`}
                      disabled={index === entries.length - 1}
                      onClick={() => reorder(index, index + 1)}
                      className="rounded-md bg-slate-100 p-1 text-slate-500 hover:bg-slate-200 disabled:opacity-30 dark:bg-slate-700 dark:text-slate-300"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {entries.length > 0 && (
        <div className="mt-5 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
          {config.outputFormats.length > 1 && (
            <Field label="Output format" htmlFor="output-format">
              <Select id="output-format" value={format} onChange={(e) => setFormat(e.target.value)}>
                {config.outputFormats.map((f) => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </Select>
            </Field>
          )}
          {config.showQuality && lossy && (
            <Slider
              label="Quality"
              value={quality}
              min={10}
              max={100}
              unit="%"
              onChange={setQuality}
              display={`${quality}%`}
            />
          )}
          {config.showBackground && needsBg && (
            <div className="flex items-end gap-3">
              <Field label="Background color (for transparency)" htmlFor="bg-color">
                <div className="flex items-center gap-2">
                  <input
                    id="bg-color"
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-10 w-12 cursor-pointer rounded-lg border border-slate-300 bg-white dark:border-slate-600"
                    aria-label="Background color"
                  />
                  <TextInput value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-28 font-mono" />
                </div>
              </Field>
            </div>
          )}
          {config.showResolution && (
            <div className="flex flex-wrap items-end gap-3">
              <Field label="Output resolution" htmlFor="resolution">
                <Select id="resolution" value={resolution} onChange={(e) => setResolution(e.target.value as "original" | "custom")}>
                  <option value="original">Original size</option>
                  <option value="custom">Custom width</option>
                </Select>
              </Field>
              {resolution === "custom" && (
                <Field label="Width (px)" htmlFor="custom-width">
                  <TextInput
                    id="custom-width"
                    type="number"
                    min={1}
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                    className="w-32"
                  />
                </Field>
              )}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Button onClick={convert} loading={!!progress}>
              {progress ? `Converting… ${progress.done}/${progress.total}` : `Convert to ${format.toUpperCase()}`}
            </Button>
            <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={clear}>
              Reset
            </Button>
          </div>
          {progress && <ProgressBar value={(progress.done / progress.total) * 100} label={`Processing ${progress.done} of ${progress.total} images`} />}
        </div>
      )}

      {results.length > 0 && (
        <ResultsPanel items={results} downloadName={`${config.defaultFormat}-conversion`} onClear={() => setResults([])} />
      )}
    </div>
  );
}

/* -------------------------------------------------------------- Wrappers */

export function JpgToPng() {
  return (
    <GenericImageConverter
      config={{
        multiple: true,
        accept: ".jpg,.jpeg",
        formats: ["JPG", "JPEG"],
        outputFormats: [{ id: "png", label: "PNG (lossless, supports transparency)" }],
        defaultFormat: "png",
        showQuality: false,
        showBackground: false,
        showResolution: false,
        maxFiles: 20,
      }}
    />
  );
}

export function PngToJpg() {
  return (
    <GenericImageConverter
      config={{
        multiple: false,
        accept: ".png",
        formats: ["PNG"],
        outputFormats: [{ id: "jpg", label: "JPG" }],
        defaultFormat: "jpg",
        showQuality: true,
        showBackground: true,
        showResolution: true,
      }}
    />
  );
}

export function WebpConverter() {
  return (
    <GenericImageConverter
      config={{
        multiple: false,
        accept: ".jpg,.jpeg,.png,.webp",
        formats: ["JPG", "PNG", "WebP"],
        outputFormats: [
          { id: "webp", label: "WebP" },
          { id: "jpg", label: "JPG" },
          { id: "png", label: "PNG" },
        ],
        defaultFormat: "webp",
        showQuality: true,
        showBackground: true,
        showResolution: false,
      }}
    />
  );
}

export function ImageConverter() {
  return (
    <GenericImageConverter
      config={{
        multiple: true,
        accept: ".jpg,.jpeg,.png,.webp,.avif,.gif,.bmp",
        formats: ["JPG", "PNG", "WebP", "AVIF", "GIF", "BMP"],
        outputFormats: [
          { id: "png", label: "PNG" },
          { id: "jpg", label: "JPG" },
          { id: "webp", label: "WebP" },
          { id: "avif", label: "AVIF" },
          { id: "gif", label: "GIF" },
          { id: "bmp", label: "BMP" },
        ],
        defaultFormat: "png",
        showQuality: true,
        showBackground: true,
        showResolution: false,
        maxFiles: 20,
      }}
    />
  );
}
