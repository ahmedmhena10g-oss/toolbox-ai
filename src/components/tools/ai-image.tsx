"use client";

import { useMemo, useState } from "react";
import { RefreshCw, Sparkles, ScanLine, Download, Brush, ImagePlus } from "lucide-react";
import FileUploader from "../upload/FileUploader";
import { fileToDataUrl, stripExtension, downloadBlob } from "@/lib/utils";
import { useToast } from "../ui/Toast";
import { Button, ProgressBar, CopyButton } from "../ui/feedback";
import { Field, Select } from "../ui/form";
import { BeforeAfter, makeResult, ResultsPanel, type ResultItem } from "./shared";
import { OCR_LANGS, runOcr } from "./ocr-tools";

/* ------------------------------------------------------- ImageDescription */

const COLOR_NAMES: [RGB, string][] = [
  [{ r: 0, g: 0, b: 0 }, "black"],
  [{ r: 255, g: 255, b: 255 }, "white"],
  [{ r: 255, g: 0, b: 0 }, "red"],
  [{ r: 0, g: 128, b: 0 }, "green"],
  [{ r: 0, g: 0, b: 255 }, "blue"],
  [{ r: 255, g: 255, b: 0 }, "yellow"],
  [{ r: 255, g: 165, b: 0 }, "orange"],
  [{ r: 128, g: 0, b: 128 }, "purple"],
  [{ r: 255, g: 192, b: 203 }, "pink"],
  [{ r: 165, g: 42, b: 42 }, "brown"],
  [{ r: 128, g: 128, b: 128 }, "gray"],
  [{ r: 0, g: 128, b: 128 }, "teal"],
  [{ r: 0, g: 0, b: 128 }, "navy"],
  [{ r: 245, g: 245, b: 220 }, "beige"],
  [{ r: 173, g: 216, b: 230 }, "light blue"],
  [{ r: 255, g: 228, b: 196 }, "light peach"],
];

const colorName = (r: number, g: number, b: number): string => {
  let best = "gray";
  let bestDist = Infinity;
  for (const [color, name] of COLOR_NAMES) {
    const dist = (color.r - r) ** 2 + (color.g - g) ** 2 + (color.b - b) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      best = name;
    }
  }
  return best;
};

interface ImageAnalysis {
  orientation: string;
  brightness: string;
  mood: string;
  dominant: { name: string; pct: number }[];
  detail: string;
  contrast: string;
  photoLike: boolean;
}

function analyzeImage(data: ImageData, width: number, height: number): ImageAnalysis {
  const dataArr = data.data;
  const buckets = new Map<number, number>();
  let totalLum = 0;
  let minLum = 255;
  let maxLum = 0;
  let edgePixels = 0;
  let samples = 0;

  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const i = (y * width + x) * 4;
      const r = dataArr[i];
      const g = dataArr[i + 1];
      const b = dataArr[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      totalLum += lum;
      minLum = Math.min(minLum, lum);
      maxLum = Math.max(maxLum, lum);
      // Quantize color into 4 bits/channel for the histogram.
      const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
      samples++;
    }
  }

  const sorted = [...buckets.entries()].sort((a, b) => b[1] - a[1]);
  const dominant = sorted.slice(0, 3).map(([key, count]) => {
    const r = ((key >> 8) & 0xf) * 16 + 8;
    const g = ((key >> 4) & 0xf) * 16 + 8;
    const b = (key & 0xf) * 16 + 8;
    return { name: colorName(r, g, b), pct: Math.round((count / samples) * 100) };
  });

  const avgLum = totalLum / samples;
  const range = maxLum - minLum;
  const orientation = width >= height ? (width > height * 1.1 ? "wide/landscape" : "roughly square") : "tall/portrait";
  const brightness = avgLum > 200 ? "bright" : avgLum > 120 ? "medium-brightness" : avgLum > 60 ? "dark" : "very dark";
  const mood = avgLum > 180 ? "light and airy" : avgLum > 100 ? "balanced" : "moody";
  const contrast = range > 160 ? "high" : range > 90 ? "moderate" : "low";
  const detail = range > 120 ? "fine detail" : "smooth, low-detail";
  const photoLike = dominant.length > 0 && dominant[0].pct < 60;

  return { orientation, brightness, mood, dominant, detail, contrast, photoLike };
}

export function ImageDescription() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [short, setShort] = useState("");
  const [detailed, setDetailed] = useState("");

  const run = () => {
    if (!dataUrl || !file) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, 400 / Math.max(img.naturalWidth, img.naturalHeight));
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const result = analyzeImage(ctx.getImageData(0, 0, canvas.width, canvas.height), canvas.width, canvas.height);
      setAnalysis(result);
      const primary = result.dominant[0]?.name ?? "neutral";
      const secondary = result.dominant[1]?.name ?? primary;
      setShort(
        `A ${result.orientation} image with a ${result.brightness}, ${primary} and ${secondary} color palette.`
      );
      setDetailed(
        `This image is ${result.orientation} in composition with a ${result.brightness} overall tone that feels ${result.mood}. ` +
          `The dominant colors are ${result.dominant
            .map((d, i) => `${i === 0 ? "" : i === 1 ? ", " : " and "}${d.name} (about ${d.pct}% of the image)`)
            .join("")}. ` +
          `It has ${result.detail} and ${result.contrast} contrast, suggesting ${
            result.photoLike ? "a photographic subject" : "a graphic or illustration-style subject"
          }.`
      );
      toast("Image analyzed successfully", "success");
    };
    img.onerror = () => toast("We couldn't read this image. Please try another one.", "error");
    img.src = dataUrl;
  };

  return (
    <div>
      {!file ? (
        <FileUploader
          accept=".jpg,.jpeg,.png,.webp"
          formats={["JPG", "PNG", "WebP"]}
          multiple={false}
          hint="The image is analyzed locally in your browser."
          onFiles={async (files) => {
            const f = files[0];
            setFile(f);
            setDataUrl(await fileToDataUrl(f));
            setAnalysis(null);
            setShort("");
            setDetailed("");
          }}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
            {dataUrl && <img src={dataUrl} alt="Image to describe" className="h-20 w-20 rounded-lg object-cover" />}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{file.name}</p>
              <Button variant="ghost" size="sm" onClick={() => { setFile(null); setDataUrl(null); setAnalysis(null); }}>Change image</Button>
            </div>
          </div>

          {!analysis && (
            <Button onClick={run} icon={<Sparkles className="h-4 w-4" />}>Generate description</Button>
          )}

          {analysis && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Short caption (alt text)</p>
                  <CopyButton text={short} />
                </div>
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">{short}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Detailed description</p>
                  <CopyButton text={detailed} />
                </div>
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">{detailed}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- AiOcr */

const cleanOcrText = (text: string): string => {
  return text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => {
      // Join words split across line breaks with a hyphen.
      let l = line.trim().replace(/-\s*$/, "");
      // Collapse stray spaces and remove common OCR artifacts.
      l = l.replace(/\s+/g, " ").replace(/[|]{2,}/g, "|");
      return l;
    })
    .filter(Boolean)
    .join("\n")
    .replace(/[ \t]{2,}/g, " ");
};

export function AiOcr() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [lang, setLang] = useState("eng");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [raw, setRaw] = useState("");
  const [clean, setClean] = useState("");

  const run = async () => {
    if (!dataUrl) {
      toast("Please add an image first.", "error");
      return;
    }
    setProcessing(true);
    setProgress(5);
    try {
      const result = await runOcr(dataUrl, lang, setProgress);
      setRaw(result);
      setClean(cleanOcrText(result));
      toast(result.trim() ? "Text extracted and cleaned" : "No text was found in this image", result.trim() ? "success" : "info");
    } catch (err) {
      console.error(err);
      toast("We couldn't extract text from this image. Please try a clearer image.", "error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      {!file ? (
        <FileUploader
          accept=".jpg,.jpeg,.png,.webp,.bmp"
          formats={["JPG", "PNG", "WebP", "BMP"]}
          multiple={false}
          hint="OCR reads the text, then AI-style cleaning fixes spacing and merges broken lines."
          onFiles={async (files) => {
            const f = files[0];
            setFile(f);
            setDataUrl(await fileToDataUrl(f));
          }}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
            {dataUrl && <img src={dataUrl} alt="Image for OCR" className="h-20 w-20 rounded-lg object-cover" />}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{file.name}</p>
              <Button variant="ghost" size="sm" onClick={() => { setFile(null); setDataUrl(null); setRaw(""); setClean(""); }}>Change image</Button>
            </div>
          </div>

          {raw === "" && (
            <div className="space-y-3">
              <Field label="Text language" htmlFor="ai-ocr-lang">
                <Select id="ai-ocr-lang" value={lang} onChange={(e) => setLang(e.target.value)}>
                  {OCR_LANGS.map((l) => (
                    <option key={l.id} value={l.id}>{l.label}</option>
                  ))}
                </Select>
              </Field>
              <Button onClick={run} loading={processing} icon={<ScanLine className="h-4 w-4" />}>
                Extract & clean text
              </Button>
              {processing && <ProgressBar value={progress} label={progress === 0 ? "Loading OCR engine…" : "Reading and cleaning text…"} />}
            </div>
          )}

          {raw !== "" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Raw OCR output</p>
                  <CopyButton text={raw} />
                </div>
                <textarea value={raw} onChange={(e) => setRaw(e.target.value)} rows={10} className="w-full rounded-xl border border-slate-200 bg-white p-3 font-mono text-xs dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200" aria-label="Raw OCR output" />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Cleaned output</p>
                  <CopyButton text={clean} />
                </div>
                <textarea value={clean} onChange={(e) => setClean(e.target.value)} rows={10} className="w-full rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 font-mono text-xs dark:border-emerald-500/30 dark:bg-emerald-500/5 dark:text-emerald-100" aria-label="Cleaned OCR output" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------- MangaColorizer */

interface Region {
  id: number;
  pixels: number[];
  size: number;
  avgLum: number;
  centroidY: number;
  minY: number;
  maxY: number;
}

const DEFAULT_PALETTE: [number, number, number][] = [
  [252, 242, 222], // skin
  [250, 235, 215], // light skin
  [120, 90, 70], // hair brown
  [180, 60, 90], // accent pink/red
  [90, 130, 180], // blue clothes
  [70, 70, 80], // dark clothing
];

interface RGB {
  r: number;
  g: number;
  b: number;
}

/** k-means palette extraction from an image. */
function extractPalette(data: Uint8ClampedArray, width: number, height: number, k = 6): RGB[] {
  const points: [number, number, number][] = [];
  for (let i = 0; i < data.length; i += 16) {
    points.push([data[i], data[i + 1], data[i + 2]]);
  }
  if (points.length < k) {
    return points.slice(0, k).map(([r, g, b]) => ({ r, g, b }));
  }
  // Initialize centroids with k++ style spread.
  const centroids: [number, number, number][] = [];
  centroids.push(points[0]);
  while (centroids.length < k) {
    let best = points[0];
    let bestDist = -1;
    for (const p of points) {
      const dist = Math.min(...centroids.map((c) => (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2));
      if (dist > bestDist) {
        bestDist = dist;
        best = p;
      }
    }
    centroids.push(best);
  }
  const assignments = new Array(points.length).fill(0);
  for (let iter = 0; iter < 20; iter++) {
    for (let i = 0; i < points.length; i++) {
      let bestIdx = 0;
      let bestDist = Infinity;
      for (let c = 0; c < centroids.length; c++) {
        const d = (points[i][0] - centroids[c][0]) ** 2 + (points[i][1] - centroids[c][1]) ** 2 + (points[i][2] - centroids[c][2]) ** 2;
        if (d < bestDist) {
          bestDist = d;
          bestIdx = c;
        }
      }
      assignments[i] = bestIdx;
    }
    const sums = centroids.map(() => [0, 0, 0, 0]);
    for (let i = 0; i < points.length; i++) {
      sums[assignments[i]][0] += points[i][0];
      sums[assignments[i]][1] += points[i][1];
      sums[assignments[i]][2] += points[i][2];
      sums[assignments[i]][3] += 1;
    }
    for (let c = 0; c < centroids.length; c++) {
      if (sums[c][3] > 0) {
        centroids[c] = [sums[c][0] / sums[c][3], sums[c][1] / sums[c][3], sums[c][2] / sums[c][3]];
      }
    }
  }
  return centroids.map(([r, g, b]) => ({ r: Math.round(r), g: Math.round(g), b: Math.round(b) }));
}

const luminance = (r: number, g: number, b: number): number => 0.299 * r + 0.587 * g + 0.114 * b;

/** Detect closed regions (non-line areas) via connected-component labeling. */
function detectRegions(data: Uint8ClampedArray, width: number, height: number): { regions: Region[]; regionOf: Uint32Array } {
  const size = width * height;
  const regionOf = new Uint32Array(size);
  const lum = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    lum[i] = luminance(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]);
  }
  const isLine = (i: number): boolean => lum[i] < 135;

  let regionId = 0;
  const regions: Region[] = [];
  const queue = new Int32Array(size);
  for (let start = 0; start < size; start++) {
    if (regionOf[start] !== 0 || isLine(start)) continue;
    regionId++;
    const pixels: number[] = [];
    let head = 0;
    let tail = 0;
    queue[tail++] = start;
    regionOf[start] = regionId;
    let sumLum = 0;
    let sumY = 0;
    let minY = height;
    let maxY = 0;
    while (head < tail) {
      const p = queue[head++];
      pixels.push(p);
      sumLum += lum[p];
      const py = Math.floor(p / width);
      sumY += py;
      minY = Math.min(minY, py);
      maxY = Math.max(maxY, py);
      const x = p % width;
      const neighbors = [
        x > 0 ? p - 1 : -1,
        x < width - 1 ? p + 1 : -1,
        p - width >= 0 ? p - width : -1,
        p + width < size ? p + width : -1,
      ];
      for (const n of neighbors) {
        if (n >= 0 && regionOf[n] === 0 && !isLine(n)) {
          regionOf[n] = regionId;
          queue[tail++] = n;
        }
      }
    }
    regions.push({
      id: regionId,
      pixels,
      size: pixels.length,
      avgLum: sumLum / pixels.length,
      centroidY: sumY / pixels.length,
      minY,
      maxY,
    });
  }
  // Keep only meaningful regions, sorted top-to-bottom.
  const minSize = Math.max(50, size * 0.0015);
  const significant = regions.filter((r) => r.size >= minSize).sort((a, b) => a.centroidY - b.centroidY);
  return { regions: significant.slice(0, 40), regionOf };
}

export function MangaColorizer() {
  const { toast } = useToast();
  const [page, setPage] = useState<{ file: File; dataUrl: string } | null>(null);
  const [reference, setReference] = useState<{ file: File; dataUrl: string } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ResultItem | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);

  const colorize = async () => {
    if (!page) {
      toast("Please upload a manga page first.", "error");
      return;
    }
    setProcessing(true);
    setResult(null);
    setProgress(5);
    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Could not read the image"));
        img.src = page.dataUrl;
      });

      // Working resolution.
      const MAX_DIM = 720;
      const scale = Math.min(1, MAX_DIM / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      setStatus("Detecting line art…");
      setProgress(20);

      let palette: RGB[];
      if (reference) {
        const refImg = new Image();
        await new Promise<void>((resolve, reject) => {
          refImg.onload = () => resolve();
          refImg.onerror = () => reject(new Error("Could not read the reference image"));
          refImg.src = reference.dataUrl;
        });
        const refCanvas = document.createElement("canvas");
        const refScale = Math.min(1, 240 / Math.max(refImg.naturalWidth, refImg.naturalHeight));
        refCanvas.width = Math.max(1, Math.round(refImg.naturalWidth * refScale));
        refCanvas.height = Math.max(1, Math.round(refImg.naturalHeight * refScale));
        const refCtx = refCanvas.getContext("2d");
        if (!refCtx) throw new Error("Canvas not supported");
        refCtx.drawImage(refImg, 0, 0, refCanvas.width, refCanvas.height);
        const refData = refCtx.getImageData(0, 0, refCanvas.width, refCanvas.height);
        palette = extractPalette(refData.data, refCanvas.width, refCanvas.height, 6);
      } else {
        palette = DEFAULT_PALETTE.map(([r, g, b]) => ({ r, g, b }));
      }
      // Sort palette by perceived lightness (light → dark).
      palette.sort((a, b) => luminance(a.r, a.g, a.b) - luminance(b.r, b.g, b.b));

      setStatus("Identifying regions…");
      setProgress(45);
      const { regions, regionOf } = detectRegions(originalData.data, canvas.width, canvas.height);

      setStatus("Applying colors…");
      setProgress(70);
      const output = ctx.createImageData(canvas.width, canvas.height);
      const outData = output.data;
      // Assign each region a palette color based on vertical position.
      const regionColor = new Map<number, RGB>();
      const n = regions.length;
      regions.forEach((region, i) => {
        const paletteIndex = n <= 1 ? 0 : Math.round((i * (palette.length - 1)) / (n - 1));
        regionColor.set(region.id, palette[Math.min(palette.length - 1, paletteIndex)]);
      });

      for (let p = 0; p < canvas.width * canvas.height; p++) {
        const idx = p * 4;
        const regionId = regionOf[p];
        if (regionId === 0) {
          // Line art — preserve exactly.
          outData[idx] = originalData.data[idx];
          outData[idx + 1] = originalData.data[idx + 1];
          outData[idx + 2] = originalData.data[idx + 2];
        } else {
          const color = regionColor.get(regionId);
          if (color) {
            const lum = luminance(originalData.data[idx], originalData.data[idx + 1], originalData.data[idx + 2]);
            const whiteness = Math.max(0, Math.min(1, (lum - 128) / 127));
            const shade = 0.3 + 0.7 * whiteness;
            outData[idx] = Math.min(255, color.r * shade);
            outData[idx + 1] = Math.min(255, color.g * shade);
            outData[idx + 2] = Math.min(255, color.b * shade);
          } else {
            outData[idx] = originalData.data[idx];
            outData[idx + 1] = originalData.data[idx + 1];
            outData[idx + 2] = originalData.data[idx + 2];
          }
        }
        outData[idx + 3] = 255;
      }
      ctx.putImageData(output, 0, 0);
      setProgress(90);

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Could not encode the result");
      const item = await makeResult(`${stripExtension(page.file.name)}-colored.png`, blob);
      setProgress(100);
      setResult(item);
      setOriginalUrl(page.dataUrl);
      toast("Page colored — line art preserved", "success");
    } catch (err) {
      console.error(err);
      toast(
        err instanceof Error ? `We couldn't colorize this page. ${err.message}` : "We couldn't colorize this page. Please try another image.",
        "error"
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      {!result ? (
        <div className="space-y-4">
          {!page ? (
            <FileUploader
              accept=".jpg,.jpeg,.png,.webp"
              formats={["JPG", "PNG", "WebP"]}
              multiple={false}
              hint="Upload a black-and-white manga or comic page. Clean, high-contrast scans work best."
              onFiles={async (files) => {
                const f = files[0];
                setPage({ file: f, dataUrl: await fileToDataUrl(f) });
              }}
            />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
                <img src={page.dataUrl} alt="Manga page to colorize" className="h-24 w-16 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{page.file.name}</p>
                  <p className="text-xs text-slate-400">Black-and-white page</p>
                  <Button variant="ghost" size="sm" onClick={() => setPage(null)}>Change page</Button>
                </div>
              </div>

              {!reference && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4 dark:border-slate-600 dark:bg-slate-800/40">
                  <p className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                    <ImagePlus className="h-4 w-4 text-brand-500" aria-hidden />
                    Optional: reference image for character colors
                  </p>
                  <FileUploader
                    accept=".jpg,.jpeg,.png,.webp"
                    formats={["JPG", "PNG", "WebP"]}
                    multiple={false}
                    compact
                    hint="Colors are extracted from the reference so hair, clothing and skin match the character."
                    onFiles={async (files) => {
                      const f = files[0];
                      setReference({ file: f, dataUrl: await fileToDataUrl(f) });
                    }}
                  />
                </div>
              )}
              {reference && (
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/40">
                  <img src={reference.dataUrl} alt="Reference image" className="h-14 w-14 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{reference.file.name}</p>
                    <p className="text-xs text-slate-400">Reference palette will be applied</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setReference(null)}>Remove</Button>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button onClick={colorize} loading={processing} icon={<Brush className="h-4 w-4" />}>
                  Colorize page
                </Button>
                <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={() => { setPage(null); setReference(null); }}>
                  Reset
                </Button>
              </div>
              {(processing || status) && <ProgressBar value={progress} label={status || "Working…"} />}
              <p className="text-xs leading-relaxed text-slate-400">
                Experimental: the tool detects line art, finds enclosed regions, assigns palette colors by region and
                position, and preserves the original black lines. Results are not comparable to professional coloring.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div>
          {originalUrl && result && (
            <BeforeAfter
              original={originalUrl}
              result={result.dataUrl}
              originalLabel="Original"
              resultLabel="Colored"
            />
          )}
          <ResultsPanel items={[result]} downloadName="colored-manga" onClear={() => setResult(null)} />
          <Button variant="secondary" size="sm" icon={<RefreshCw className="h-4 w-4" />} className="mt-3" onClick={() => { setResult(null); setPage(null); setReference(null); }}>
            Color another page
          </Button>
        </div>
      )}
    </div>
  );
}
