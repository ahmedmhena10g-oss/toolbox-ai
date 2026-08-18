import type { PDFDocument, PDFPage } from "pdf-lib";

export const PAGE_SIZES: Record<string, [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
  a3: [841.89, 1190.55],
  a5: [419.53, 595.28],
  legal: [612, 1008],
};

export interface ImagesToPdfOptions {
  pageSize: keyof typeof PAGE_SIZES;
  orientation: "portrait" | "landscape";
  margin: number; // points
  quality: number; // 0-1
}

/** Build a PDF from image data URLs using jsPDF. */
export const imagesToPdf = async (
  images: { dataUrl: string; name: string }[],
  options: ImagesToPdfOptions
): Promise<Blob> => {
  const { jsPDF } = await import("jspdf");
  const [baseW, baseH] = PAGE_SIZES[options.pageSize] ?? PAGE_SIZES.a4;
  const [pw, ph] =
    options.orientation === "landscape" ? [baseH, baseW] : [baseW, baseH];
  const margin = options.margin;

  const pdf = new jsPDF({
    orientation: options.orientation,
    unit: "pt",
    format: [pw, ph],
    compress: true,
  });

  const contentW = pw - margin * 2;
  const contentH = ph - margin * 2;

  // Pre-convert non-PNG images to JPEG at the chosen quality (smaller PDFs).
  const prepared = await Promise.all(
    images.map(async (image) => {
      const isPng = image.dataUrl.startsWith("data:image/png");
      if (isPng) return { dataUrl: image.dataUrl, format: "PNG" as const };
      const { loadImage, convertImage } = await import("./image");
      const blob = await convertImage(await loadImage(image.dataUrl), {
        format: "jpg",
        quality: options.quality,
        backgroundColor: "#ffffff",
      });
      return { dataUrl: await blobToDataUrl(blob), format: "JPEG" as const };
    })
  );

  for (let i = 0; i < prepared.length; i++) {
    if (i > 0) pdf.addPage();
    const image = prepared[i];
    const img = await loadImageElement(image.dataUrl);
    const scale = Math.min(contentW / img.naturalWidth, contentH / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    const x = (pw - w) / 2;
    const y = (ph - h) / 2;
    pdf.addImage(image.dataUrl, image.format as never, x, y, w, h, undefined, "FAST");
  }

  return pdf.output("blob");
};

export const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read the generated image."));
    reader.readAsDataURL(blob);
  });

const loadImageElement = (dataUrl: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("One of the images could not be read."));
    img.src = dataUrl;
  });

/** Dynamic import wrapper so pdf-lib is only loaded when a PDF tool runs. */
export const loadPdfLib = () => import("pdf-lib");

/** Dynamic import wrapper for pdf.js (renders PDF pages to canvas). */
export const loadPdfJs = async () => {
  const pdfjs = await import("pdfjs-dist");
  // The worker file is copied into /public at install time (scripts/copy-assets.mjs).
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  return pdfjs;
};

/** Render a single PDF page to a canvas at the given scale. */
export const renderPageToCanvas = async (
  doc: import("pdfjs-dist").PDFDocumentProxy,
  pageNumber: number,
  scale: number
): Promise<HTMLCanvasElement> => {
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  const renderContext = {
    canvasContext: ctx,
    viewport,
  } as never;
  await page.render(renderContext).promise;
  return canvas;
};

export interface PageRangeInput {
  mode: "all" | "selected" | "ranges";
  selectedPages: string; // "1,3,5-8"
  rangeSize: number;
}

/** Parse "1,3,5-8" into a sorted list of 1-based page numbers. */
export const parsePageSelection = (input: string, pageCount: number): number[] => {
  const pages = new Set<number>();
  for (const part of input.split(",")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    if (trimmed.includes("-")) {
      const [a, b] = trimmed.split("-").map((n) => parseInt(n.trim(), 10));
      if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
      const start = Math.max(1, Math.min(a, b));
      const end = Math.min(pageCount, Math.max(a, b));
      for (let p = start; p <= end; p++) pages.add(p);
    } else {
      const n = parseInt(trimmed, 10);
      if (Number.isFinite(n) && n >= 1 && n <= pageCount) pages.add(n);
    }
  }
  return [...pages].sort((x, y) => x - y);
};

export const resolvePageSelection = (input: PageRangeInput, pageCount: number): number[] => {
  switch (input.mode) {
    case "all":
      return Array.from({ length: pageCount }, (_, i) => i + 1);
    case "selected":
      return parsePageSelection(input.selectedPages, pageCount);
    case "ranges": {
      const size = Math.max(1, input.rangeSize);
      const pages: number[] = [];
      for (let start = 1; start <= pageCount; start += size) {
        for (let p = start; p < start + size && p <= pageCount; p++) pages.push(p);
      }
      return pages;
    }
    default:
      return [];
  }
};

/** Copy selected pages from srcDoc into a brand new PDF document. */
export const extractPagesToNewPdf = async (
  srcDoc: PDFDocument,
  pageNumbers: number[]
): Promise<Uint8Array> => {
  const { PDFDocument } = await loadPdfLib();
  const out = await PDFDocument.create();
  const copied = await out.copyPages(srcDoc, pageNumbers.map((n) => n - 1));
  copied.forEach((page) => out.addPage(page));
  return out.save();
};

/** Merge multiple PDF documents into one. */
export const mergePdfs = async (docs: PDFDocument[]): Promise<Uint8Array> => {
  const { PDFDocument } = await loadPdfLib();
  const out = await PDFDocument.create();
  for (const doc of docs) {
    const pages = await out.copyPages(doc, doc.getPageIndices());
    pages.forEach((page) => out.addPage(page));
  }
  return out.save();
};

/** Rotate a set of pages in place and return the saved bytes. */
export const rotatePages = async (
  doc: PDFDocument,
  pageIndices: number[],
  degrees: 90 | 180 | 270 | -90
): Promise<Uint8Array> => {
  const { degrees: rotationDegrees } = await loadPdfLib();
  for (const index of pageIndices) {
    const page = doc.getPage(index);
    const current = page.getRotation().angle;
    page.setRotation(rotationDegrees((current + degrees) % 360));
  }
  return doc.save();
};

export const pageNumberInputs = (doc: PDFDocument): { index: number; page: PDFPage; number: number }[] =>
  doc.getPages().map((page, index) => ({ index, page, number: index + 1 }));
