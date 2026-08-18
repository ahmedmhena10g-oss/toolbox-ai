"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw, Crop as CropIcon } from "lucide-react";
import FileUploader from "../upload/FileUploader";
import { useImageFiles } from "@/lib/useImageFiles";
import { cropImage, type LoadedImage } from "@/lib/image";
import { clamp, stripExtension } from "@/lib/utils";
import { useToast } from "../ui/Toast";
import { Button } from "../ui/feedback";
import { Field, Select, TextInput } from "../ui/form";
import { ResultsPanel, makeResult, type ResultItem } from "./shared";

type RatioId = "free" | "square" | "16x9" | "4x3" | "3x2" | "custom";

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

const MAX_W = 720;
const MAX_H = 500;
const MIN_SIZE = 24;

const RATIOS: Record<Exclude<RatioId, "free" | "custom">, number> = {
  square: 1,
  "16x9": 16 / 9,
  "4x3": 4 / 3,
  "3x2": 3 / 2,
};

export default function ImageCropper() {
  const { entries, addFiles, clear } = useImageFiles(1);
  const { toast } = useToast();
  const [ratio, setRatio] = useState<RatioId>("free");
  const [customRatio, setCustomRatio] = useState({ w: "16", h: "9" });
  const [box, setBox] = useState<Box | null>(null);
  const [result, setResult] = useState<ResultItem | null>(null);
  const [processing, setProcessing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    mode: "move" | "resize" | "new";
    corner?: string;
    startX: number;
    startY: number;
    startBox: Box;
  } | null>(null);

  const entry = entries[0];
  const loaded: LoadedImage | null = entry?.loaded ?? null;

  const display = useCallback(() => {
    if (!loaded) return { w: 0, h: 0, scale: 1 };
    const scale = Math.min(MAX_W / loaded.width, MAX_H / loaded.height, 1);
    return { w: loaded.width * scale, h: loaded.height * scale, scale };
  }, [loaded]);

  const ratioValue = useCallback((): number | null => {
    if (ratio === "free") return null;
    if (ratio === "custom") {
      const w = parseFloat(customRatio.w);
      const h = parseFloat(customRatio.h);
      return w > 0 && h > 0 ? w / h : null;
    }
    return RATIOS[ratio];
  }, [ratio, customRatio]);

  // Reset the crop box whenever the image or ratio changes.
  useEffect(() => {
    if (!loaded) {
      setBox(null);
      return;
    }
    const { w: dw, h: dh, scale } = display();
    if (dw === 0) return;
    const r = ratioValue();
    let bw = dw * 0.9;
    let bh = bw;
    if (r) {
      bh = bw / r;
      if (bh > dh) {
        bh = dh * 0.9;
        bw = bh * r;
      }
    } else {
      bh = dh * 0.9;
    }
    setBox({ x: (dw - bw) / 2, y: (dh - bh) / 2, w: bw, h: bh });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, ratio, customRatio]);

  const localPoint = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const handleDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!box || !loaded) return;
    e.preventDefault();
    const { x, y } = localPoint(e.clientX, e.clientY);
    const corners: Record<string, [number, number]> = {
      nw: [box.x, box.y],
      ne: [box.x + box.w, box.y],
      sw: [box.x, box.y + box.h],
      se: [box.x + box.w, box.y + box.h],
    };
    const corner = Object.entries(corners).find(
      ([, [cx, cy]]) => Math.abs(cx - x) <= 14 && Math.abs(cy - y) <= 14
    )?.[0];
    const inside = x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h;

    if (corner) {
      dragRef.current = { mode: "resize", corner, startX: x, startY: y, startBox: box };
    } else if (inside) {
      dragRef.current = { mode: "move", startX: x, startY: y, startBox: box };
    } else {
      // Start a fresh selection.
      dragRef.current = { mode: "new", startX: x, startY: y, startBox: { x, y, w: 0, h: 0 } };
      setBox({ x, y, w: 0, h: 0 });
    }
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || !loaded) return;
    const { w: dw, h: dh } = display();
    const { x, y } = localPoint(e.clientX, e.clientY);
    const r = ratioValue();

    if (drag.mode === "move") {
      const nx = clamp(drag.startBox.x + (x - drag.startX), 0, dw - drag.startBox.w);
      const ny = clamp(drag.startBox.y + (y - drag.startY), 0, dh - drag.startBox.h);
      setBox({ ...drag.startBox, x: nx, y: ny });
      return;
    }

    if (drag.mode === "new") {
      const nx = clamp(Math.min(x, drag.startX), 0, dw);
      const ny = clamp(Math.min(y, drag.startY), 0, dh);
      const nw = clamp(Math.abs(x - drag.startX), 0, dw - nx);
      const nh = clamp(Math.abs(y - drag.startY), 0, dh - ny);
      setBox({ x: nx, y: ny, w: nw, h: nh });
      return;
    }

    // Resize from a corner.
    if (drag.mode === "resize" && drag.corner) {
      const base = {
        x: drag.corner.includes("e") ? drag.startBox.x : drag.startBox.x + drag.startBox.w,
        y: drag.corner.includes("s") ? drag.startBox.y : drag.startBox.y + drag.startBox.h,
      };
      const dx = drag.corner.includes("e") ? x - base.x : base.x - x;
      const dy = drag.corner.includes("s") ? y - base.y : base.y - y;
      let nw = Math.max(MIN_SIZE, Math.abs(dx));
      let nh = Math.max(MIN_SIZE, Math.abs(dy));
      if (r) {
        if (nw / r <= nh && nw / r >= MIN_SIZE) {
          nh = nw / r;
        } else {
          nw = nh * r;
        }
      }
      // Keep within bounds.
      if (base.x + (drag.corner.includes("e") ? nw : -nw) > dw || base.x + (drag.corner.includes("e") ? nw : -nw) < 0) {
        nw = clamp(drag.corner.includes("e") ? dw - base.x : base.x, MIN_SIZE, dw);
        if (r) nh = nw / r;
      }
      if (base.y + (drag.corner.includes("s") ? nh : -nh) > dh || base.y + (drag.corner.includes("s") ? nh : -nh) < 0) {
        nh = clamp(drag.corner.includes("s") ? dh - base.y : base.y, MIN_SIZE, dh);
        if (r) nw = nh * r;
      }
      const bx = drag.corner.includes("e") ? base.x : base.x - nw;
      const by = drag.corner.includes("s") ? base.y : base.y - nh;
      setBox({ x: bx, y: by, w: nw, h: nh });
    }
  };

  const handleUp = () => {
    dragRef.current = null;
  };

  const doCrop = async () => {
    if (!loaded || !box || box.w < MIN_SIZE || box.h < MIN_SIZE) {
      toast("Please select an area to crop first.", "error");
      return;
    }
    const { scale } = display();
    setProcessing(true);
    try {
      const blob = await cropImage(
        loaded,
        { x: box.x / scale, y: box.y / scale, width: box.w / scale, height: box.h / scale },
        "png",
        0.95
      );
      const item = await makeResult(`${stripExtension(entry!.name)}-cropped.png`, blob);
      setResult(item);
      toast("Image cropped successfully", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "We couldn't crop this image. Please try again.", "error");
    } finally {
      setProcessing(false);
    }
  };

  const { w: dw, h: dh } = display();

  return (
    <div>
      <FileUploader
        accept=".jpg,.jpeg,.png,.webp"
        formats={["JPG", "PNG", "WebP"]}
        multiple={false}
        onFiles={(files) => addFiles(files)}
      />

      {loaded && !result && (
        <div className="mt-5 space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <Field label="Aspect ratio" htmlFor="ratio">
              <Select id="ratio" value={ratio} onChange={(e) => setRatio(e.target.value as RatioId)}>
                <option value="free">Free</option>
                <option value="square">Square (1:1)</option>
                <option value="16x9">16:9</option>
                <option value="4x3">4:3</option>
                <option value="3x2">3:2</option>
                <option value="custom">Custom ratio</option>
              </Select>
            </Field>
            {ratio === "custom" && (
              <>
                <Field label="Width" htmlFor="cw">
                  <TextInput id="cw" type="number" min={1} value={customRatio.w} onChange={(e) => setCustomRatio((c) => ({ ...c, w: e.target.value }))} className="w-24" />
                </Field>
                <Field label="Height" htmlFor="ch">
                  <TextInput id="ch" type="number" min={1} value={customRatio.h} onChange={(e) => setCustomRatio((c) => ({ ...c, h: e.target.value }))} className="w-24" />
                </Field>
              </>
            )}
            <div className="flex items-center gap-2 pb-1">
              <Button onClick={doCrop} loading={processing} icon={<CropIcon className="h-4 w-4" />}>
                Crop image
              </Button>
              <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={clear}>
                Reset
              </Button>
            </div>
          </div>

          <div
            ref={containerRef}
            onPointerDown={handleDown}
            onPointerMove={handleMove}
            onPointerUp={handleUp}
            onPointerLeave={handleUp}
            className="relative mx-auto max-w-full touch-none select-none overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/40"
            style={{ width: dw, height: dh, cursor: box ? "crosshair" : "default" }}
          >
            <img
              src={entry!.dataUrl}
              alt="Image to crop"
              className="pointer-events-none block h-full w-full object-contain"
              draggable={false}
            />
            {box && (
              <div
                className="absolute border-2 border-brand-500 bg-brand-500/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.5)]"
                style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
              >
                {(["nw", "ne", "sw", "se"] as const).map((corner) => (
                  <span
                    key={corner}
                    className="absolute h-3.5 w-3.5 border-2 border-white bg-brand-600 shadow"
                    style={
                      corner === "nw"
                        ? { left: -7, top: -7, cursor: "nwse-resize" }
                        : corner === "ne"
                        ? { right: -7, top: -7, cursor: "nesw-resize" }
                        : corner === "sw"
                        ? { left: -7, bottom: -7, cursor: "nesw-resize" }
                        : { right: -7, bottom: -7, cursor: "nwse-resize" }
                    }
                  />
                ))}
                <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900/80 px-2 py-0.5 text-[10px] font-medium text-white">
                  {Math.round(box.w)}×{Math.round(box.h)} px
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {result && (
        <ResultsPanel items={[result]} downloadName="cropped-image" onClear={() => setResult(null)} />
      )}
    </div>
  );
}
