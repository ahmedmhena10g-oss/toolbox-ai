"use client";

import { useEffect, useState } from "react";
import { RotateCw, RotateCcw, RefreshCw, FlipHorizontal2, FlipVertical2, Download } from "lucide-react";
import FileUploader from "../upload/FileUploader";
import { useImageFiles } from "@/lib/useImageFiles";
import { stripExtension, downloadBlob } from "@/lib/utils";
import { useToast } from "../ui/Toast";
import { Button } from "../ui/feedback";

type Quarter = 0 | 1 | 2 | 3;

export default function ImageRotator() {
  const { entries, addFiles, clear } = useImageFiles(1);
  const { toast } = useToast();
  const [rotation, setRotation] = useState<Quarter>(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const entry = entries[0];

  useEffect(() => {
    if (!entry?.loaded) {
      setPreview(null);
      return;
    }
    const { loaded } = entry;
    const { canvas, height, width } = renderTransformed(loaded, rotation, flipH, flipV);
    setPreview(canvas.toDataURL(loaded.type === "image/png" ? "image/png" : "image/jpeg", 0.95));
    return () => {
      // keep last preview
    };
  }, [entry, rotation, flipH, flipV]);

  const handleFiles = (files: File[]) => {
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    addFiles(files);
  };

  const download = () => {
    if (!entry || !preview) return;
    const ext = entry.dataUrl.includes("image/png") ? "png" : "jpg";
    const link = document.createElement("a");
    link.href = preview;
    link.download = `${stripExtension(entry.name)}-rotated.${ext}`;
    link.click();
    toast("Image downloaded", "success");
  };

  return (
    <div>
      <FileUploader
        accept=".jpg,.jpeg,.png,.webp"
        formats={["JPG", "PNG", "WebP"]}
        multiple={false}
        onFiles={handleFiles}
      />

      {entry && !preview && <p className="mt-4 text-sm text-slate-400">Preparing preview…</p>}

      {entry && preview && (
        <div className="mt-5">
          <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
            <img
              src={preview}
              alt={`Preview of ${entry.name} after rotation`}
              className="max-h-[420px] max-w-full rounded-lg object-contain shadow-sm"
            />
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button size="sm" variant="secondary" icon={<RotateCw className="h-4 w-4" />} onClick={() => setRotation((r) => ((r + 1) % 4) as Quarter)}>
              Rotate 90°
            </Button>
            <Button size="sm" variant="secondary" icon={<RotateCcw className="h-4 w-4" />} onClick={() => setRotation((r) => ((r + 3) % 4) as Quarter)}>
              Rotate -90°
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setRotation((r) => ((r + 2) % 4) as Quarter)}>
              180°
            </Button>
            <Button size="sm" variant="secondary" icon={<FlipHorizontal2 className="h-4 w-4" />} onClick={() => setFlipH((f) => !f)}>
              Flip horizontal
            </Button>
            <Button size="sm" variant="secondary" icon={<FlipVertical2 className="h-4 w-4" />} onClick={() => setFlipV((f) => !f)}>
              Flip vertical
            </Button>
            <Button size="sm" variant="success" icon={<Download className="h-4 w-4" />} onClick={download}>
              Download
            </Button>
            <Button
              size="sm"
              variant="ghost"
              icon={<RefreshCw className="h-4 w-4" />}
              onClick={() => {
                setRotation(0);
                setFlipH(false);
                setFlipV(false);
              }}
            >
              Reset
            </Button>
          </div>
          <p className="mt-3 text-center text-xs text-slate-400">
            {`Rotation: ${rotation * 90}°`} · {flipH ? "Flipped horizontally" : "Not flipped horizontally"} · {flipV ? "Flipped vertically" : "Not flipped vertically"}
          </p>
        </div>
      )}
    </div>
  );
}

/** Render the transformed image (used for the preview and the download). */
export function renderTransformed(
  loaded: { img: HTMLImageElement; width: number; height: number },
  rotation: Quarter,
  flipH: boolean,
  flipV: boolean
): { canvas: HTMLCanvasElement; width: number; height: number } {
  const swap = rotation % 2 === 1;
  const width = swap ? loaded.height : loaded.width;
  const height = swap ? loaded.width : loaded.height;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  ctx.translate(width / 2, height / 2);
  ctx.rotate((rotation * 90 * Math.PI) / 180);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  ctx.drawImage(loaded.img, -loaded.width / 2, -loaded.height / 2);
  return { canvas, width, height };
}
