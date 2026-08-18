/**
 * All image processing helpers run on <canvas> in the browser.
 * Every function here is pure client-side — nothing is uploaded.
 */

export interface LoadedImage {
  img: HTMLImageElement;
  width: number;
  height: number;
  type: string; // e.g. "image/jpeg"
  dataUrl: string;
}

export const loadImage = (dataUrl: string): Promise<LoadedImage> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () =>
      resolve({
        img,
        width: img.naturalWidth,
        height: img.naturalHeight,
        type: dataUrl.split(";")[0].split(":")[1] ?? "image/png",
        dataUrl,
      });
    img.onerror = () => reject(new Error("This image file could not be read. It may be corrupted or unsupported."));
    img.src = dataUrl;
  });

/** Draw an image onto a new canvas with the given dimensions. */
export const drawToCanvas = (
  image: LoadedImage,
  width: number,
  height: number,
  backgroundColor?: string
): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  if (backgroundColor) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image.img, 0, 0, canvas.width, canvas.height);
  return canvas;
};

const mimeOf = (format: string): string => {
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    avif: "image/avif",
    gif: "image/gif",
    bmp: "image/bmp",
  };
  return map[format.toLowerCase()] ?? "image/png";
};

export const canvasToBlob = (
  canvas: HTMLCanvasElement,
  format: string,
  quality?: number
): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Could not encode the image in this format. Your browser may not support it."));
      },
      mimeOf(format),
      quality
    );
  });

export interface ConvertOptions {
  format: string;
  quality?: number; // 0-1 for lossy formats
  backgroundColor?: string; // for flattening transparency into jpg/bmp
  width?: number;
  height?: number;
}

/** Convert a loaded image to another format with optional resizing and background. */
export const convertImage = async (
  image: LoadedImage,
  options: ConvertOptions
): Promise<Blob> => {
  const target = options.format.toLowerCase();
  const needsBackground =
    (target === "jpg" || target === "jpeg" || target === "bmp") && options.backgroundColor;

  const width = options.width ?? image.width;
  const height = options.height ?? image.height;

  // PNG/GIF/WebP keep transparency; JPG/BMP flatten onto the background color.
  const canvas = needsBackground
    ? drawToCanvas(image, width, height, options.backgroundColor ?? "#ffffff")
    : drawToCanvas(image, width, height);

  const quality = ["jpg", "jpeg", "webp", "avif"].includes(target)
    ? (options.quality ?? 0.92)
    : undefined;

  return canvasToBlob(canvas, target, quality);
};

export interface ResizeOptions {
  width?: number;
  height?: number;
  percent?: number;
  format: string;
  quality?: number;
  backgroundColor?: string;
}

/** Resize an image (maintains aspect ratio when only one dimension is given). */
export const resizeImage = async (image: LoadedImage, options: ResizeOptions): Promise<Blob> => {
  let width = image.width;
  let height = image.height;

  if (options.percent && options.percent > 0 && options.percent !== 100) {
    width = Math.round((image.width * options.percent) / 100);
    height = Math.round((image.height * options.percent) / 100);
  }
  if (options.width && options.width > 0) {
    const ratio = options.width / width;
    width = Math.round(options.width);
    if (!options.height) height = Math.round(height * ratio);
  }
  if (options.height && options.height > 0) {
    const ratio = options.height / height;
    height = Math.round(options.height);
    if (!options.width) width = Math.round(width * ratio);
  }

  const target = options.format.toLowerCase();
  const needsBackground =
    (target === "jpg" || target === "jpeg") && options.backgroundColor;
  const canvas = needsBackground
    ? drawToCanvas(image, width, height, options.backgroundColor ?? "#ffffff")
    : drawToCanvas(image, width, height);

  const quality = ["jpg", "jpeg", "webp", "avif"].includes(target)
    ? (options.quality ?? 0.92)
    : undefined;
  return canvasToBlob(canvas, target, quality);
};

/** Draw the current state of a crop box onto a new canvas. */
export const cropImage = async (
  image: LoadedImage,
  box: { x: number; y: number; width: number; height: number },
  format: string,
  quality = 0.92
): Promise<Blob> => {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(box.width));
  canvas.height = Math.max(1, Math.round(box.height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  ctx.drawImage(
    image.img,
    box.x,
    box.y,
    box.width,
    box.height,
    0,
    0,
    canvas.width,
    canvas.height
  );
  return canvasToBlob(canvas, format, quality);
};

export type Rotation = 90 | 180 | 270;

export const rotateImage = async (image: LoadedImage, rotation: Rotation): Promise<Blob> => {
  const [w, h] = rotation === 90 || rotation === 270 ? [image.height, image.width] : [image.width, image.height];
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  ctx.translate(w / 2, h / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.drawImage(image.img, -image.width / 2, -image.height / 2);
  return canvasToBlob(canvas, image.type === "image/png" ? "png" : "jpg", 0.95);
};

export const flipImage = async (
  image: LoadedImage,
  direction: "horizontal" | "vertical"
): Promise<Blob> => {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  ctx.translate(direction === "horizontal" ? image.width : 0, direction === "vertical" ? image.height : 0);
  ctx.scale(direction === "horizontal" ? -1 : 1, direction === "vertical" ? -1 : 1);
  ctx.drawImage(image.img, 0, 0);
  return canvasToBlob(canvas, image.type === "image/png" ? "png" : "jpg", 0.95);
};

/** Simple lossy re-encode of an image (used by the compressor). */
export const compressImage = async (
  image: LoadedImage,
  format: string,
  quality: number,
  backgroundColor?: string
): Promise<Blob> => convertImage(image, { format, quality, backgroundColor });

/**
 * Compress to a target maximum file size by binary-searching quality.
 * Returns the best quality (0.05–0.95) that meets the target.
 */
export const compressToMaxSize = async (
  image: LoadedImage,
  format: string,
  maxBytes: number,
  backgroundColor?: string
): Promise<Blob> => {
  let low = 0.05;
  let high = 0.95;
  let best = await convertImage(image, { format, quality: high, backgroundColor });
  if (best.size <= maxBytes) return best;

  for (let i = 0; i < 7; i++) {
    const mid = (low + high) / 2;
    const candidate = await convertImage(image, { format, quality: mid, backgroundColor });
    if (candidate.size <= maxBytes) {
      best = candidate;
      low = mid;
    } else {
      high = mid;
    }
  }
  return best;
};
