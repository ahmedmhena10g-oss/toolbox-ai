"use client";

import { useState } from "react";
import { RefreshCw, Sparkles, Download } from "lucide-react";
import FileUploader from "../upload/FileUploader";
import FilePreview from "../upload/FilePreview";
import { useImageFiles } from "@/lib/useImageFiles";
import { stripExtension, downloadBlob, formatBytes } from "@/lib/utils";
import { useToast } from "../ui/Toast";
import { Button, ProgressBar } from "../ui/feedback";
import { BeforeAfter } from "./shared";

const MODEL_CDN = "https://staticimgly.com/@imgly/background-removal-data/1.5.5/dist/";

export default function RemoveBackground() {
  const { entries, addFiles, remove, clear } = useImageFiles(1);
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ dataUrl: string; blob: Blob } | null>(null);

  const entry = entries[0];

  const process = async () => {
    if (!entry) {
      toast("Please add an image first.", "error");
      return;
    }
    setProcessing(true);
    setResult(null);
    setStatus("Loading the AI model…");
    setProgress(10);
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      setStatus("Detecting the subject…");
      setProgress(35);
      const blob = await removeBackground(entry.dataUrl, {
        publicPath: MODEL_CDN,
        progress: (_key, current, total) => {
          const pct = 35 + Math.round((current / Math.max(1, total)) * 55);
          setProgress(Math.min(95, pct));
        },
      });
      setProgress(98);
      const dataUrl = URL.createObjectURL(blob);
      setResult({ dataUrl, blob });
      setStatus("");
      setProgress(100);
      toast("Background removed successfully", "success");
    } catch (err) {
      console.error("Background removal failed:", err);
      setStatus("");
      toast(
        "The AI model couldn't process this image. Please try a different image or try again in a moment.",
        "error"
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      {!result ? (
        <>
          <FileUploader
            accept=".jpg,.jpeg,.png,.webp"
            formats={["JPG", "PNG", "WebP"]}
            multiple={false}
            hint="A clear subject with a distinct background gives the best result. The AI model downloads once, then runs entirely on your device."
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

          {entry && (
            <div className="mt-5 space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button onClick={process} loading={processing} icon={<Sparkles className="h-4 w-4" />}>
                  Remove background
                </Button>
                <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={clear}>
                  Reset
                </Button>
              </div>
              {(processing || status) && <ProgressBar value={progress} label={status || "Processing…"} />}
            </div>
          )}
        </>
      ) : (
        <div>
          <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
            Drag the slider to compare the original and the transparent result. The output is a PNG with a fully
            transparent background ({formatBytes(result.blob.size)}).
          </p>
          <BeforeAfter original={entry!.dataUrl} result={result.dataUrl} originalLabel="Original" resultLabel="Background removed" />
          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              variant="success"
              icon={<Download className="h-4 w-4" />}
              onClick={() => {
                downloadBlob(result.blob, `${stripExtension(entry!.name)}-no-bg.png`);
                toast("Transparent PNG downloaded", "success");
              }}
            >
              Download transparent PNG
            </Button>
            <Button
              variant="secondary"
              icon={<RefreshCw className="h-4 w-4" />}
              onClick={() => {
                setResult(null);
                clear();
              }}
            >
              Process another image
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
