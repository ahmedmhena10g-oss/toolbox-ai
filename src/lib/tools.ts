export type CategoryId =
  | "image"
  | "pdf"
  | "ocr"
  | "text"
  | "color"
  | "ai"
  | "developer"
  | "utility";

export interface Faq {
  q: string;
  a: string;
}

export interface ToolConfig {
  id: string;
  name: string;
  slug: string;
  category: CategoryId;
  /** One-line description shown on cards and search results. */
  short: string;
  /** Paragraph shown at the top of the tool page. */
  description: string;
  /** Lucide icon key resolved in components/icons.tsx */
  icon: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  howTo: string[];
  faqs: Faq[];
  related: string[];
  /** Shown on the homepage "Popular tools" section. */
  popular?: boolean;
  /** Labelled as experimental in the UI. */
  experimental?: boolean;
  /** Input file formats accepted by the tool, e.g. ["jpg", "png"]. */
  formats?: string[];
  /** Client-side only — everything here runs in the browser. */
  privacy: "local" | "api";
}

export interface CategoryConfig {
  id: CategoryId;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  icon: string;
}

export const categories: CategoryConfig[] = [
  {
    id: "image",
    name: "Image Tools",
    slug: "image-tools",
    tagline: "Convert, compress, resize and edit images in your browser",
    description:
      "Everything you need to work with images — convert between JPG, PNG, WebP and more, compress files, resize, crop, rotate and remove backgrounds. All processing happens locally in your browser, so your photos never leave your device.",
    seoTitle: "Free Online Image Tools — Convert, Compress, Resize & Edit Images",
    seoDescription:
      "Free online image tools: convert JPG, PNG and WebP, compress photos, resize, crop, rotate and remove backgrounds. Private, fast and 100% free — no upload required.",
    icon: "Image",
  },
  {
    id: "pdf",
    name: "PDF Tools",
    slug: "pdf-tools",
    tagline: "Create, merge, split, compress and secure PDF documents",
    description:
      "A complete PDF toolkit: turn images into PDFs, convert PDF pages to JPG or PNG, merge and split documents, reduce file size, rotate pages, protect files with passwords and inspect metadata.",
    seoTitle: "Free Online PDF Tools — Merge, Split, Compress & Convert PDF",
    seoDescription:
      "Free online PDF tools: merge PDFs, split pages, compress file size, convert JPG/PNG to PDF and PDF to JPG/PNG, rotate pages and protect documents. No sign-up required.",
    icon: "FileText",
  },
  {
    id: "ocr",
    name: "OCR Tools",
    slug: "ocr-tools",
    tagline: "Extract text from images and scanned documents",
    description:
      "Turn images, screenshots and scanned PDFs into editable text. Our OCR tools recognize text in multiple languages including Arabic, English, French, Spanish and German — right in your browser.",
    seoTitle: "Free Online OCR Tools — Extract Text from Images & PDFs",
    seoDescription:
      "Free online OCR: extract text from images and scanned PDFs. Supports Arabic, English, French, Spanish and German. Copy or download the result as TXT, DOCX or PDF.",
    icon: "ScanText",
  },
  {
    id: "text",
    name: "Text Tools",
    slug: "text-tools",
    tagline: "Count words, convert case, clean, sort and generate text",
    description:
      "Handy text utilities: count words and characters, convert case, remove duplicate lines, sort lists, clean up messy text, generate lorem ipsum, compare documents and create SEO-friendly slugs.",
    seoTitle: "Free Online Text Tools — Word Counter, Case Converter & More",
    seoDescription:
      "Free online text tools: count words and characters, convert text case, remove duplicate lines, sort text, clean formatting, generate lorem ipsum and create URL slugs.",
    icon: "Type",
  },
  {
    id: "color",
    name: "Color Tools",
    slug: "color-tools",
    tagline: "Pick, convert and generate colors, palettes and gradients",
    description:
      "Color utilities for designers and developers: pick colors visually, convert between HEX, RGB, HSL and HSV, generate harmonious palettes, build CSS gradients and check WCAG contrast ratios.",
    seoTitle: "Free Online Color Tools — Color Picker, Palette & Contrast Checker",
    seoDescription:
      "Free online color tools: color picker with HEX, RGB, HSL and HSV, HEX to RGB converter, palette generator, CSS gradient generator and WCAG contrast checker.",
    icon: "Palette",
  },
  {
    id: "ai",
    name: "AI Tools",
    slug: "ai-tools",
    tagline: "Summarize, rewrite, translate and analyze with AI",
    description:
      "AI-powered utilities that run where possible on your device: summarize long texts, rewrite content in different styles, translate between languages, generate image descriptions and even color manga pages.",
    seoTitle: "Free Online AI Tools — Summarizer, Rewriter, Translator & More",
    seoDescription:
      "Free online AI tools: summarize long texts, rewrite content in professional or casual styles, translate between languages and generate image descriptions. Private by design.",
    icon: "Sparkles",
  },
  {
    id: "developer",
    name: "Developer Tools",
    slug: "developer-tools",
    tagline: "Format JSON, encode, generate and test for developers",
    description:
      "Tools for developers: format and validate JSON, encode and decode Base64, work with URLs, generate UUIDs, convert timestamps and test regular expressions against live text.",
    seoTitle: "Free Online Developer Tools — JSON Formatter, Base64, UUID & More",
    seoDescription:
      "Free online developer tools: JSON formatter and validator, Base64 encoder/decoder, URL encoder, UUID generator, Unix timestamp converter and regex tester.",
    icon: "Braces",
  },
  {
    id: "utility",
    name: "Utility Tools",
    slug: "utility-tools",
    tagline: "Calculators, converters, generators and everyday helpers",
    description:
      "Everyday utilities: standard and percentage calculators, age calculator, unit converter, random number generator and a QR code generator for text, URLs, Wi-Fi and more.",
    seoTitle: "Free Online Utility Tools — Calculators, Unit Converter & QR Code",
    seoDescription:
      "Free online utility tools: calculator, percentage calculator, age calculator, unit converter for length, weight, temperature and more, random number generator and QR code generator.",
    icon: "Wrench",
  },
];

export const categoryById = Object.fromEntries(categories.map((c) => [c.id, c])) as Record<
  CategoryId,
  CategoryConfig
>;

export const categoryBySlug = Object.fromEntries(categories.map((c) => [c.slug, c])) as Record<
  string,
  CategoryConfig
>;

const t = (
  id: string,
  name: string,
  slug: string,
  category: CategoryId,
  icon: string,
  short: string,
  description: string,
  seoTitle: string,
  seoDescription: string,
  keywords: string[],
  howTo: string[],
  faqs: Faq[],
  related: string[],
  extra: Partial<ToolConfig> = {}
): ToolConfig => ({
  id,
  name,
  slug,
  category,
  icon,
  short,
  description,
  seoTitle,
  seoDescription,
  keywords,
  howTo,
  faqs,
  related,
  privacy: "local",
  formats: [],
  ...extra,
});

export const tools: ToolConfig[] = [
  // ---------------------------------------------------------------- IMAGE
  t(
    "jpg-to-png",
    "JPG to PNG",
    "jpg-to-png",
    "image",
    "Image",
    "Convert JPG images to PNG with transparent background support",
    "Convert one or more JPG images to PNG format directly in your browser. PNG preserves every pixel and supports transparency, which makes it ideal for logos, screenshots and images you plan to edit further.",
    "JPG to PNG Converter — Free Online Image Conversion",
    "Convert JPG to PNG online for free. No upload needed — your images stay on your device. Batch convert multiple JPG files and download them individually or as a set.",
    ["jpg to png", "convert jpg to png", "jpeg to png converter", "image converter", "png converter online"],
    [
      "Add your JPG images using the upload area — drag and drop or click to choose files.",
      "Review the previews and rearrange the order if needed.",
      "Click Convert to start the conversion. Each image is processed locally.",
      "Download converted images individually or download them all at once.",
    ],
    [
      { q: "Does JPG to PNG lose quality?", a: "No. Converting JPG to PNG never degrades the image — PNG is a lossless format, so every pixel is preserved exactly as it was in the source file." },
      { q: "Why would I convert JPG to PNG?", a: "PNG supports transparency and lossless compression, making it a better choice for logos, graphics, screenshots and any image you plan to edit or print." },
      { q: "Are my images uploaded to a server?", a: "No. The conversion runs entirely in your browser using the Canvas API. Your images never leave your device." },
    ],
    ["png-to-jpg", "webp-converter", "image-converter", "image-compressor"],
    { popular: true, formats: ["jpg", "jpeg"] }
  ),
  t(
    "png-to-jpg",
    "PNG to JPG",
    "png-to-jpg",
    "image",
    "FileImage",
    "Convert PNG images to JPG with quality and background control",
    "Convert PNG images to JPG format. Choose the output quality, pick a background color for transparent areas, and control the output resolution. JPG is perfect for photos and web use where smaller files matter.",
    "PNG to JPG Converter — Free Online with Quality Control",
    "Convert PNG to JPG online for free. Set JPG quality, choose a background color for transparent PNGs and control output resolution. Private, browser-based processing.",
    ["png to jpg", "convert png to jpg", "png to jpeg", "transparent png to jpg", "jpg quality"],
    [
      "Upload your PNG file.",
      "Choose the JPG quality (higher quality means a larger file).",
      "Pick a background color for transparent areas — white or black usually works best.",
      "Optionally set a custom output resolution, then click Convert.",
      "Download your JPG file.",
    ],
    [
      { q: "What happens to transparent areas when converting PNG to JPG?", a: "JPG does not support transparency, so transparent pixels are filled with the background color you choose. White is the most common choice." },
      { q: "What JPG quality should I use?", a: "For photos, 85–90% is a great balance of quality and file size. For web use where file size matters, 70–80% is usually fine." },
      { q: "Does PNG to JPG reduce file size?", a: "Usually yes. JPG uses lossy compression, which typically produces much smaller files than PNG, especially for photos and detailed images." },
    ],
    ["jpg-to-png", "webp-converter", "image-compressor", "image-resizer"],
    { formats: ["png"] }
  ),
  t(
    "webp-converter",
    "WebP Converter",
    "webp-converter",
    "image",
    "RefreshCw",
    "Convert between WebP, JPG and PNG in both directions",
    "Convert images to and from WebP — the modern image format that loads faster on the web. Supports JPG to WebP, PNG to WebP, WebP to JPG and WebP to PNG conversions with quality control.",
    "WebP Converter — Convert JPG, PNG & WebP Online Free",
    "Free online WebP converter: convert JPG and PNG to WebP for faster loading, or convert WebP back to JPG and PNG. Adjustable quality, fully private.",
    ["webp converter", "convert to webp", "jpg to webp", "png to webp", "webp to jpg", "webp to png"],
    [
      "Upload an image — JPG, PNG or WebP.",
      "Choose the target format from the dropdown.",
      "Adjust the quality slider if needed.",
      "Click Convert and download your new file.",
    ],
    [
      { q: "What is WebP?", a: "WebP is a modern image format created by Google that provides superior compression — typically 25–35% smaller files than JPG at the same visual quality. All modern browsers support it." },
      { q: "Is converting to WebP lossy?", a: "WebP supports both lossy and lossless compression. Our converter uses high-quality lossy compression with an adjustable quality slider, so you control the trade-off between quality and file size." },
      { q: "Which browsers support WebP?", a: "All modern browsers — Chrome, Firefox, Safari, Edge and Opera — support WebP. It is safe to use on the web today." },
    ],
    ["jpg-to-png", "png-to-jpg", "image-converter", "image-compressor"],
    { formats: ["jpg", "jpeg", "png", "webp"] }
  ),
  t(
    "image-compressor",
    "Image Compressor",
    "image-compressor",
    "image",
    "Shrink",
    "Compress JPG, PNG and WebP images and see exactly how much you save",
    "Compress images without losing visible quality. Our compressor lets you choose a compression level, target quality and even a maximum file size. You'll see the original size, compressed size and percentage saved before you download.",
    "Image Compressor Online — Compress JPG, PNG & WebP Free",
    "Compress JPG, PNG and WebP images online for free. Reduce file size by up to 90% without visible quality loss. See exact savings before downloading. 100% private.",
    ["image compressor", "compress image", "compress jpg", "compress png", "reduce image size", "photo compressor"],
    [
      "Upload the image you want to compress.",
      "Pick a compression level or set a target quality.",
      "Optionally set a maximum file size — we'll tune the quality to hit it.",
      "Review the original vs compressed size and the percentage saved.",
      "Download the compressed image.",
    ],
    [
      { q: "How much can I compress an image?", a: "Most images compress by 50–90%. Photos with smooth gradients compress extremely well, while noisy or highly detailed images save less. The tool shows your exact savings before you download." },
      { q: "Will compression make my image look bad?", a: "At quality settings of 70–85%, compression is barely visible to the human eye. Our tool removes metadata automatically, which can save additional space without touching pixels." },
      { q: "Is image compression lossy?", a: "Our compressor uses lossy compression for JPG and WebP (like most compressors) and lossless optimization for PNG. You control the quality/compression trade-off." },
    ],
    ["image-resizer", "webp-converter", "png-to-jpg", "jpg-to-png"],
    { popular: true, formats: ["jpg", "jpeg", "png", "webp"] }
  ),
  t(
    "image-resizer",
    "Image Resizer",
    "image-resizer",
    "image",
    "Maximize2",
    "Resize images by width, height or percentage with aspect ratio lock",
    "Resize images to exact dimensions, by percentage, or using preset sizes for social media and the web. Lock the aspect ratio to keep proportions perfect, and maintain quality with high-quality resampling.",
    "Image Resizer — Resize Images Online Free in Seconds",
    "Resize images online for free. Set custom width and height, resize by percentage, or use presets for Instagram, YouTube and more. Aspect ratio lock and high-quality output.",
    ["image resizer", "resize image", "resize photo", "image resizing online", "resize image to dimensions"],
    [
      "Upload your image.",
      "Choose a resize mode: exact dimensions, percentage or a preset size.",
      "Lock the aspect ratio to avoid distortion.",
      "Click Resize and preview the result.",
      "Download your resized image.",
    ],
    [
      { q: "Will resizing reduce image quality?", a: "Resizing down keeps quality high — details are simply scaled. Our tool uses high-quality resampling. Resizing up cannot create detail that isn't there, but we interpolate smoothly to avoid pixelation." },
      { q: "How do I resize an image to a specific dimension without distortion?", a: "Enable the aspect ratio lock, set the width (or height), and the other dimension is calculated automatically. If you need exact non-proportional dimensions, unlock the ratio." },
      { q: "What are the best dimensions for Instagram and social media?", a: "Square posts: 1080×1080 px. Portrait: 1080×1350 px. Landscape: 1080×566 px. YouTube thumbnails: 1280×720 px. These presets are built into the tool." },
    ],
    ["image-cropper", "image-compressor", "png-to-jpg", "webp-converter"],
    { popular: true, formats: ["jpg", "jpeg", "png", "webp"] }
  ),
  t(
    "image-cropper",
    "Image Cropper",
    "image-cropper",
    "image",
    "Crop",
    "Crop images with free, square or preset aspect ratios",
    "Crop any image with an interactive editor. Choose a free-form crop, a perfect square, or common ratios like 16:9, 4:3 and 3:2 — or enter a custom ratio of your own.",
    "Image Cropper — Crop Images Online Free with Aspect Ratios",
    "Crop images online for free with an interactive editor. Free crop, square, 16:9, 4:3, 3:2 or custom aspect ratios. Preview before you download.",
    ["image cropper", "crop image", "crop photo online", "crop image to ratio", "crop 16:9"],
    [
      "Upload your image.",
      "Drag the crop handles to select the area you want to keep.",
      "Choose an aspect ratio: free, square, 16:9, 4:3, 3:2 or custom.",
      "Click Crop and review the result.",
      "Download your cropped image.",
    ],
    [
      { q: "Does cropping reduce image quality?", a: "No. Cropping removes pixels — the remaining area keeps its full original resolution. The cropped output is generated at the full quality of your selection." },
      { q: "What is the 16:9 aspect ratio used for?", a: "16:9 is the standard widescreen ratio for videos, YouTube thumbnails and most modern displays. 4:3 and 3:2 are classic photo ratios." },
      { q: "Can I crop without losing the rest of the image?", a: "No — cropping permanently removes the area outside your selection. If you might need it later, keep a copy of the original file." },
    ],
    ["image-resizer", "image-rotator", "image-compressor", "jpg-to-png"],
    { formats: ["jpg", "jpeg", "png", "webp"] }
  ),
  t(
    "image-rotator",
    "Image Rotator",
    "image-rotator",
    "image",
    "RotateCw",
    "Rotate images 90°, 180° or 270° and flip them horizontally or vertically",
    "Rotate images in 90° increments, flip them horizontally or vertically, and download the result. Perfect for fixing phone photos taken sideways or mirroring images for print and design.",
    "Image Rotator — Rotate & Flip Images Online Free",
    "Rotate images 90, 180 or 270 degrees and flip them horizontally or vertically — free online tool with live preview and one-click download.",
    ["image rotator", "rotate image", "flip image", "rotate photo 90 degrees", "flip image horizontal"],
    [
      "Upload your image.",
      "Click Rotate 90°, 180° or 270° — the preview updates instantly.",
      "Use Flip horizontal or Flip vertical to mirror the image.",
      "Download the rotated image.",
    ],
    [
      { q: "Does rotating an image lose quality?", a: "No. Rotating in 90° increments is lossless — pixels are rearranged, not recomputed. Free-angle rotation would require resampling, but this tool only uses exact increments." },
      { q: "How do I straighten a photo taken at an angle?", a: "This tool rotates in fixed 90° steps for lossless results. For slight angle corrections you would need a perspective tool — but for sideways photos, 90° rotation is exactly what you need." },
      { q: "What is a horizontal flip used for?", a: "Flipping horizontally mirrors the image left-to-right. It's commonly used for selfies, text corrections, or when a design needs a mirrored version." },
    ],
    ["image-cropper", "image-resizer", "image-compressor", "image-converter"],
    { formats: ["jpg", "jpeg", "png", "webp"] }
  ),
  t(
    "image-converter",
    "Image Converter",
    "image-converter",
    "image",
    "Repeat",
    "Convert images between JPG, PNG, WebP, AVIF, GIF and BMP",
    "A universal image converter supporting JPG, PNG, WebP, AVIF, GIF and BMP. Convert single images or batches, with quality control for lossy formats and transparent background options.",
    "Image Converter — Convert JPG, PNG, WebP, AVIF, GIF & BMP",
    "Free online image converter: convert between JPG, PNG, WebP, AVIF, GIF and BMP. Batch conversion, quality control and privacy-first local processing.",
    ["image converter", "convert image format", "jpg to avif", "png to gif", "bmp converter", "image format converter"],
    [
      "Upload one or more images in any supported format.",
      "Select the target format.",
      "Adjust quality for lossy formats (JPG, WebP, AVIF) if needed.",
      "Click Convert and download files individually or all at once.",
    ],
    [
      { q: "Which image formats are supported?", a: "JPG, PNG, WebP, AVIF, GIF and BMP are supported as both input and output formats." },
      { q: "What is AVIF?", a: "AVIF is a next-generation image format based on the AV1 video codec. It offers even better compression than WebP — often 50% smaller files at the same quality — and is supported by all modern browsers." },
      { q: "Can I convert an animated GIF?", a: "This converter processes the first frame of a GIF. For animated GIFs, the result will be a static image of the first frame." },
    ],
    ["jpg-to-png", "png-to-jpg", "webp-converter", "image-compressor"],
    { formats: ["jpg", "jpeg", "png", "webp", "avif", "gif", "bmp"] }
  ),
  t(
    "remove-background",
    "Remove Image Background",
    "remove-background",
    "image",
    "Wand2",
    "Remove image backgrounds automatically with AI and download a transparent PNG",
    "Remove the background from any image automatically using AI. The model detects the subject, separates it from the background and produces a transparent PNG. Compare the original and result side by side.",
    "Remove Background from Image — Free AI Background Remover",
    "Remove image backgrounds online for free with AI. Automatically detects people, products and objects, then downloads a transparent PNG. Compare before/after in the browser.",
    ["remove background", "background remover", "transparent background", "remove image background free", "cut out image"],
    [
      "Upload a photo — people, pets and products work best.",
      "The AI model processes the image right in your browser.",
      "Compare the original and the result using the before/after slider.",
      "Download the transparent PNG.",
    ],
    [
      { q: "Is background removal free?", a: "Yes, this tool is completely free. The AI model runs in your browser, so there are no processing fees and no uploads to a server." },
      { q: "Which images work best?", a: "Photos with a clear subject in the foreground and a distinct background produce the best results. Portraits, product shots and pets are ideal." },
      { q: "Will the result be perfect on the first try?", a: "The model is very accurate, but hair, fur and complex edges can sometimes need a second pass. You can re-run the tool with a different image or refine manually with an editor." },
      { q: "What format is the result?", a: "The output is a PNG with a fully transparent background, ready to place on any design or document." },
    ],
    ["image-compressor", "image-cropper", "png-to-jpg", "image-resizer"],
    { popular: true, experimental: true, formats: ["jpg", "jpeg", "png", "webp"] }
  ),

  // ---------------------------------------------------------------- PDF
  t(
    "jpg-to-pdf",
    "JPG to PDF",
    "jpg-to-pdf",
    "pdf",
    "Images",
    "Convert multiple JPG images into a single PDF document",
    "Turn JPG images into a professional PDF document. Combine multiple images, choose the page size and orientation, adjust margins and image quality, and reorder pages before converting.",
    "JPG to PDF Converter — Convert Images to PDF Online Free",
    "Convert JPG images to PDF online for free. Combine multiple images into one PDF, choose page size and orientation, adjust margins and download instantly. No upload required.",
    ["jpg to pdf", "convert jpg to pdf", "images to pdf", "make pdf from images", "jpeg to pdf converter"],
    [
      "Upload one or more JPG images.",
      "Drag and drop to reorder them — the first image becomes the first page.",
      "Choose page size, orientation, margins and image quality.",
      "Click Convert to PDF and download your document.",
    ],
    [
      { q: "Is converting JPG to PDF free?", a: "Yes, completely free. The PDF is generated locally in your browser using the jsPDF library — your images never leave your device." },
      { q: "Can I combine JPG and PNG images in one PDF?", a: "Yes — this tool accepts JPG images, and PNG images are handled by the dedicated PNG to PDF tool with the same options." },
      { q: "What page sizes are supported?", a: "A4, Letter, A3 and more, in both portrait and landscape orientation, with adjustable margins." },
    ],
    ["png-to-pdf", "merge-pdf", "compress-pdf", "pdf-to-jpg"],
    { popular: true, formats: ["jpg", "jpeg"] }
  ),
  t(
    "png-to-pdf",
    "PNG to PDF",
    "png-to-pdf",
    "pdf",
    "FileImage",
    "Convert PNG images into a PDF with full layout control",
    "Convert PNG images — including transparent ones — into a PDF document. Combine multiple images, choose page size and orientation, set margins and quality, and reorder pages before conversion.",
    "PNG to PDF Converter — Free Online Image to PDF",
    "Convert PNG to PDF online for free. Combine multiple PNG images into one PDF with page size, orientation, margin and quality options. Private, browser-based processing.",
    ["png to pdf", "convert png to pdf", "images to pdf", "transparent png to pdf", "make pdf"],
    [
      "Upload one or more PNG images.",
      "Reorder pages by dragging them.",
      "Select page size, orientation, margins and quality.",
      "Click Convert to PDF and download.",
    ],
    [
      { q: "Can I keep transparency in my PDF?", a: "Yes — unlike JPG to PDF, converting PNG to PDF preserves transparency where your PDF viewer supports it." },
      { q: "Are multiple images combined into one PDF?", a: "Yes. Every uploaded image becomes one page, in the order you arrange them." },
      { q: "Is the conversion private?", a: "Fully private. The PDF is assembled in your browser and nothing is uploaded to any server." },
    ],
    ["jpg-to-pdf", "merge-pdf", "compress-pdf", "pdf-to-png"],
    { formats: ["png"] }
  ),
  t(
    "pdf-to-jpg",
    "PDF to JPG",
    "pdf-to-jpg",
    "pdf",
    "Image",
    "Convert PDF pages into high-quality JPG images",
    "Convert every page of a PDF into JPG images, or select specific pages. Choose image quality and download the results individually or as a ZIP archive.",
    "PDF to JPG Converter — Convert PDF Pages to Images Free",
    "Convert PDF to JPG online for free. Turn all or selected pages into high-quality JPG images, choose quality, and download as individual files or a ZIP archive.",
    ["pdf to jpg", "convert pdf to jpg", "pdf to image", "pdf pages to jpg", "pdf to pictures"],
    [
      "Upload your PDF file.",
      "Choose whether to convert all pages or select specific ones.",
      "Set the JPG quality and output scale.",
      "Click Convert — each page is rendered locally.",
      "Download pages individually or all at once as a ZIP.",
    ],
    [
      { q: "Does PDF to JPG reduce quality?", a: "Each page is rendered at a high resolution by default. If you increase the scale or quality, you get sharper images — at the cost of larger files." },
      { q: "Can I convert only certain pages?", a: "Yes. You can select specific page numbers (for example 1-3, 5) or convert every page in the document." },
      { q: "Is my PDF uploaded anywhere?", a: "No. The PDF is rendered to images entirely in your browser using pdf.js. Your documents stay private." },
    ],
    ["pdf-to-png", "jpg-to-pdf", "split-pdf", "extract-pages"],
    { popular: true, formats: ["pdf"] }
  ),
  t(
    "pdf-to-png",
    "PDF to PNG",
    "pdf-to-png",
    "pdf",
    "FileImage",
    "Convert PDF pages into transparent PNG images",
    "Convert PDF pages into high-resolution PNG images with full quality preservation. Select specific pages or convert the entire document, then download images individually or as a ZIP.",
    "PDF to PNG Converter — Convert PDF Pages to PNG Free",
    "Convert PDF to PNG online for free. Render all or selected pages as high-quality PNG images, downloadable individually or as a ZIP archive. Private and free.",
    ["pdf to png", "convert pdf to png", "pdf to transparent png", "pdf pages to png"],
    [
      "Upload your PDF.",
      "Choose all pages or select specific page numbers.",
      "Set the output scale for higher resolution.",
      "Click Convert and download the PNG files.",
    ],
    [
      { q: "What is the difference between PDF to JPG and PDF to PNG?", a: "PNG is lossless, so text and graphics stay razor sharp — ideal for screenshots and design assets. JPG files are smaller, which suits photos and web use." },
      { q: "Can I convert a PDF page with transparency to PNG?", a: "Yes. PNG supports transparency, so elements like logos that were transparent in the PDF stay transparent." },
      { q: "Is the whole PDF processed locally?", a: "Yes — rendering happens in your browser, and the resulting images are never uploaded anywhere." },
    ],
    ["pdf-to-jpg", "png-to-pdf", "merge-pdf", "extract-pages"],
    { formats: ["pdf"] }
  ),
  t(
    "merge-pdf",
    "Merge PDF",
    "merge-pdf",
    "pdf",
    "Merge",
    "Combine multiple PDF files into one document with drag-and-drop",
    "Merge two or more PDF files into a single document. Reorder the files with drag-and-drop, then combine them into one clean PDF — all in your browser.",
    "Merge PDF — Combine PDF Files Online Free",
    "Merge PDF files online for free. Combine multiple PDFs into one document with drag-and-drop ordering. No watermarks, no sign-up, fully private.",
    ["merge pdf", "combine pdf", "join pdf files", "pdf merger", "combine pdf online"],
    [
      "Upload the PDF files you want to merge.",
      "Drag and drop to arrange the order — the top file becomes the first pages.",
      "Click Merge PDF.",
      "Download your combined document.",
    ],
    [
      { q: "Can I merge more than two PDFs?", a: "Yes — upload as many PDFs as you like. They are merged in the order shown in the list." },
      { q: "Is the order of pages preserved?", a: "Yes. Each PDF keeps its internal page order, and files are appended in the order you arrange them." },
      { q: "Are there watermarks or file size limits?", a: "No watermarks and no arbitrary limits. The merge happens locally, so the only limit is your browser's memory." },
    ],
    ["split-pdf", "jpg-to-pdf", "compress-pdf", "rotate-pdf"],
    { popular: true, formats: ["pdf"] }
  ),
  t(
    "split-pdf",
    "Split PDF",
    "split-pdf",
    "pdf",
    "Scissors",
    "Split a PDF into separate files by page or range",
    "Split a PDF into multiple files: extract selected pages, split every page into its own file, or split by page ranges. Perfect for dividing large documents into chapters or sections.",
    "Split PDF — Separate PDF Pages Online Free",
    "Split PDF files online for free. Extract selected pages, split every page into its own PDF, or split by page ranges. Fast, private, no sign-up.",
    ["split pdf", "separate pdf pages", "extract pages from pdf", "pdf splitter", "divide pdf"],
    [
      "Upload your PDF.",
      "Choose a split mode: extract pages, split every page, or split by ranges.",
      "Specify the pages to extract (e.g. 2-4, 7) or the range size.",
      "Click Split and download the resulting PDFs as a ZIP.",
    ],
    [
      { q: "What does split by ranges mean?", a: "It divides the document into consecutive chunks — for example, splitting a 20-page PDF into ranges of 5 creates four 5-page files (pages 1-5, 6-10, 11-15, 16-20)." },
      { q: "Can I extract just a few pages?", a: "Yes. In 'Extract selected pages' mode, enter the pages you want, like 1, 3, 5-8, and they are saved as a single new PDF." },
      { q: "Is my PDF uploaded to a server?", a: "No. Splitting happens entirely in your browser." },
    ],
    ["merge-pdf", "extract-pages", "pdf-to-jpg", "rotate-pdf"],
    { formats: ["pdf"] }
  ),
  t(
    "compress-pdf",
    "Compress PDF",
    "compress-pdf",
    "pdf",
    "Shrink",
    "Reduce PDF file size while keeping good quality",
    "Compress PDF files to make them easier to email and faster to upload. See the original size, the new size and the exact percentage saved before downloading.",
    "Compress PDF — Reduce PDF File Size Online Free",
    "Compress PDF files online for free. Reduce file size by optimizing images and structure, and see your exact savings before downloading. Private, no sign-up.",
    ["compress pdf", "reduce pdf size", "pdf compressor", "smaller pdf", "shrink pdf"],
    [
      "Upload your PDF.",
      "Choose a compression level — balanced works well for most documents.",
      "Review the original size, new size and percentage saved.",
      "Download the compressed PDF.",
    ],
    [
      { q: "How does PDF compression work?", a: "The tool re-encodes embedded images at a smarter quality and optimizes the PDF structure. Text stays crisp because text is vector data, not pixels." },
      { q: "How much can I reduce a PDF?", a: "PDFs that contain photos or scanned pages typically shrink by 50–80%. Text-only PDFs are already small and may only shrink slightly." },
      { q: "Will compression change my PDF?", a: "Text, layout and links are preserved. Embedded images are recompressed, which can slightly reduce their quality depending on the level you choose." },
    ],
    ["merge-pdf", "pdf-metadata", "split-pdf", "jpg-to-pdf"],
    { popular: true, formats: ["pdf"] }
  ),
  t(
    "rotate-pdf",
    "Rotate PDF",
    "rotate-pdf",
    "pdf",
    "RotateCw",
    "Rotate individual pages, selected pages or an entire PDF",
    "Rotate PDF pages 90° clockwise or counter-clockwise. Rotate the whole document, a selection of pages, or a single page — perfect for fixing scanned documents that are sideways.",
    "Rotate PDF — Rotate Pages Online Free",
    "Rotate PDF pages online for free. Rotate individual pages, selected pages or the entire document by 90° in either direction. Private and instant.",
    ["rotate pdf", "rotate pdf pages", "turn pdf sideways", "rotate pdf page 90 degrees"],
    [
      "Upload your PDF.",
      "Choose what to rotate: all pages, a page range, or click a page thumbnail.",
      "Pick the rotation direction: 90° clockwise or counter-clockwise.",
      "Click Rotate and download the fixed PDF.",
    ],
    [
      { q: "Can I rotate just one page of a PDF?", a: "Yes — click any page thumbnail to rotate it individually, or specify a page range in the options." },
      { q: "Is rotation lossy?", a: "No. Rotation is applied as a page attribute, so the original content is not recompressed — quality is fully preserved." },
      { q: "Why are my scanned pages sideways?", a: "Scanners and phone apps often save pages in landscape. Rotate the affected pages by 90° and the document will read correctly." },
    ],
    ["split-pdf", "merge-pdf", "pdf-metadata", "compress-pdf"],
    { formats: ["pdf"] }
  ),
  t(
    "extract-pages",
    "PDF Page Extractor",
    "extract-pages",
    "pdf",
    "FileSearch",
    "Select specific pages from a PDF and save them as a new document",
    "Extract any combination of pages from a PDF and save them as a new document. Choose pages by number or click thumbnails to pick exactly what you need.",
    "PDF Page Extractor — Extract Pages from PDF Online Free",
    "Extract selected pages from a PDF online for free. Pick pages by number or thumbnail and download them as a brand new PDF. No upload, fully private.",
    ["extract pages from pdf", "pdf page extractor", "remove pages from pdf", "save pdf pages"],
    [
      "Upload your PDF.",
      "Select the pages to extract — click thumbnails or enter page numbers.",
      "Click Extract.",
      "Download the new PDF containing only the selected pages.",
    ],
    [
      { q: "What is the difference between this and Split PDF?", a: "The extractor lets you pick any combination of pages (e.g. 1, 3, 7) and saves them as one PDF. Split PDF divides the document into multiple files." },
      { q: "Can I use this to remove pages from a PDF?", a: "Yes — extract the pages you want to keep. The new document simply won't include the rest." },
      { q: "Are my pages recompressed?", a: "No. Selected pages are copied into the new document without recompression, so quality is identical to the source." },
    ],
    ["split-pdf", "merge-pdf", "rotate-pdf", "pdf-to-jpg"],
    { formats: ["pdf"] }
  ),
  t(
    "pdf-metadata",
    "PDF Metadata Viewer",
    "pdf-metadata",
    "pdf",
    "Info",
    "View PDF metadata such as title, author and creation date",
    "Inspect the metadata stored inside a PDF: title, author, subject, creator and creation date. Useful for checking document info before sharing or publishing.",
    "PDF Metadata Viewer — Read PDF Information Online Free",
    "View PDF metadata online for free — title, author, subject, creator, keywords and creation date. Private: metadata is read locally in your browser.",
    ["pdf metadata", "view pdf info", "pdf properties", "pdf title author", "check pdf metadata"],
    [
      "Upload your PDF file.",
      "The tool reads the document's metadata instantly.",
      "Review the title, author, subject and dates.",
      "Copy any value with one click.",
    ],
    [
      { q: "What is PDF metadata?", a: "Metadata is descriptive information stored inside the PDF — such as title, author, subject, keywords and creation date. Many programs also add their own creator info." },
      { q: "Is metadata private?", a: "Metadata is only exposed if the document creator added it. This tool never displays anything beyond what's already in the file, and it is read entirely on your device." },
      { q: "How do I remove metadata from a PDF?", a: "Many editors can strip metadata. To avoid sharing author info, remove or edit metadata in your PDF editor before publishing." },
    ],
    ["pdf-protect", "compress-pdf", "pdf-unlock", "merge-pdf"],
    { formats: ["pdf"] }
  ),
  t(
    "pdf-protect",
    "PDF Password Protection",
    "pdf-protect",
    "pdf",
    "Lock",
    "Protect your own PDF with a password before sharing",
    "Add password protection to a PDF so only people with the password can open it. The file is encrypted locally in your browser and the password is never sent anywhere.",
    "Protect PDF with Password — Free Online PDF Encryption",
    "Password-protect a PDF online for free. Encrypt your PDF with a password locally in your browser and download the secured file. Never store the password.",
    ["protect pdf", "pdf password", "pdf encryption", "lock pdf with password", "secure pdf"],
    [
      "Upload the PDF you want to protect.",
      "Enter a strong password (at least 6 characters).",
      "Click Protect — the file is encrypted in your browser.",
      "Download the protected PDF and share the password securely with recipients.",
    ],
    [
      { q: "How strong is the encryption?", a: "Files are encrypted with AES-256 using the standard PDF encryption scheme. Choose a long, unique password — that is the most important factor." },
      { q: "Can I remove the password later?", a: "Yes — upload the protected file to the PDF Unlock tool, enter your password, and download an unprotected version." },
      { q: "What if I forget the password?", a: "There is no way to recover it. Keep your password somewhere safe — and note that some viewers may not support encrypted PDFs." },
    ],
    ["pdf-unlock", "pdf-metadata", "merge-pdf", "compress-pdf"],
    { formats: ["pdf"] }
  ),
  t(
    "pdf-unlock",
    "PDF Unlock",
    "pdf-unlock",
    "pdf",
    "Unlock",
    "Remove a password from PDFs you own — when you know the password",
    "Remove password protection from a PDF that you are authorized to access. Enter the password you set, or use the tool for files that are technically encrypted but open without restrictions.",
    "PDF Unlock — Remove Password from PDF (You Own) Online",
    "Remove a password from a PDF you own — enter your password and download an unprotected copy. For files marked as restricted without a real password, protection is removed automatically.",
    ["pdf unlock", "remove pdf password", "unlock pdf", "remove pdf restrictions"],
    [
      "Upload the password-protected PDF.",
      "Enter the password if the file is password-protected.",
      "Click Unlock — the file is decrypted in your browser.",
      "Download the unlocked PDF.",
    ],
    [
      { q: "Is it OK to unlock a PDF?", a: "Only unlock files you own or have explicit permission to modify. This tool never attempts to bypass passwords it doesn't know — if you don't have the password, you can't unlock the file." },
      { q: "What if my PDF has no password but shows restrictions?", a: "Some PDFs are marked with permission flags but aren't truly encrypted. Those open normally and this tool removes the restriction flags for you." },
      { q: "Does the password leave my device?", a: "No. Decryption happens entirely in your browser — the password and the file never leave your computer." },
    ],
    ["pdf-protect", "pdf-metadata", "compress-pdf", "merge-pdf"],
    { formats: ["pdf"] }
  ),

  // ---------------------------------------------------------------- OCR
  t(
    "image-to-text",
    "Image to Text",
    "image-to-text",
    "ocr",
    "ScanText",
    "Extract text from images with OCR in 5 languages",
    "Extract text from photos, screenshots and scanned images using OCR. Supports Arabic, English, French, Spanish and German. The extracted text appears in an editable box you can copy or download.",
    "Image to Text Converter — Extract Text from Images (OCR) Free",
    "Extract text from images online for free with OCR. Supports Arabic, English, French, Spanish and German. Copy the result or download as TXT, DOCX or PDF.",
    ["image to text", "ocr image", "extract text from image", "image to text converter", "ocr online arabic"],
    [
      "Upload an image containing text — a photo, screenshot or scan.",
      "Select the language of the text for the best accuracy.",
      "Click Extract Text — OCR runs in your browser.",
      "Review, edit and copy the text, or download it as TXT, DOCX or PDF.",
    ],
    [
      { q: "How accurate is the OCR?", a: "Accuracy depends on image quality, resolution and font clarity. Clear, high-resolution images with straight text achieve near-perfect results. Low-quality or handwritten text is harder." },
      { q: "Which languages are supported?", a: "Arabic, English, French, Spanish and German are supported out of the box, with English as the default." },
      { q: "Are my images uploaded to a server?", a: "No. OCR runs locally in your browser with Tesseract.js. Your images and extracted text never leave your device." },
    ],
    ["pdf-to-text", "ai-ocr", "text-cleaner", "word-counter"],
    { popular: true, formats: ["jpg", "jpeg", "png", "webp", "bmp"] }
  ),
  t(
    "pdf-to-text",
    "PDF to Text",
    "pdf-to-text",
    "ocr",
    "FileText",
    "Extract text from PDF documents, including scanned pages",
    "Extract text from searchable PDFs instantly, or run OCR on scanned PDFs to recognize text from images. Copy or download the extracted text in multiple formats.",
    "PDF to Text Converter — Extract Text from PDF Free",
    "Extract text from PDF online for free. Read text from digital PDFs instantly or run OCR on scanned documents. Supports Arabic, English, French, Spanish and German.",
    ["pdf to text", "extract text from pdf", "pdf text extractor", "ocr pdf", "convert pdf to text"],
    [
      "Upload your PDF file.",
      "Select the language of the text.",
      "Choose 'Searchable text' for digital PDFs or 'OCR' for scanned pages.",
      "Click Extract and review the editable text.",
      "Copy or download as TXT, DOCX or PDF.",
    ],
    [
      { q: "What is the difference between searchable text and OCR?", a: "Digital PDFs already contain text that can be read instantly. Scanned PDFs are images, so OCR is needed to recognize the text within them." },
      { q: "Is OCR on a scanned PDF accurate?", a: "It's very good on clean scans at 300 DPI or higher. Blurry or skewed pages will have more errors." },
      { q: "How long does extraction take?", a: "Searchable PDFs extract instantly. OCR on scanned pages runs locally and takes a few seconds per page, depending on your device." },
    ],
    ["image-to-text", "ai-ocr", "word-counter", "text-cleaner"],
    { formats: ["pdf"] }
  ),

  // ---------------------------------------------------------------- TEXT
  t(
    "word-counter",
    "Word Counter",
    "word-counter",
    "text",
    "Type",
    "Count words, characters, sentences, paragraphs and reading time",
    "Count words and characters in any text instantly. See characters without spaces, sentences, paragraphs and an estimated reading time — all updated live as you type or paste.",
    "Word Counter — Count Words & Characters Online Free",
    "Count words, characters, sentences and paragraphs online for free. See reading time and character counts excluding spaces, updated live as you type. No registration.",
    ["word counter", "count words", "character counter", "word count online", "count characters"],
    [
      "Type or paste your text into the box.",
      "The counts update live as you type.",
      "Review words, characters, sentences, paragraphs and reading time.",
      "Use Copy to grab the text or Clear to start over.",
    ],
    [
      { q: "What counts as a word?", a: "A word is any sequence of characters separated by spaces or line breaks. Punctuation attached to a word counts as part of that word." },
      { q: "How is reading time calculated?", a: "Using the standard average of 200 words per minute for adults. Short texts are rounded up to a minimum of one minute." },
      { q: "Is my text saved or shared?", a: "No. Everything is processed in your browser — nothing is stored or transmitted." },
    ],
    ["case-converter", "text-cleaner", "remove-duplicate-lines", "slug-generator"],
    { popular: true }
  ),
  t(
    "case-converter",
    "Case Converter",
    "case-converter",
    "text",
    "CaseSensitive",
    "Convert text to UPPERCASE, lowercase, Title Case, camelCase and more",
    "Convert any text between seven common cases: UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case and kebab-case. Paste once and switch instantly.",
    "Case Converter — Convert Text to Upper, Lower, Title & More",
    "Free online case converter: convert text to UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case and kebab-case instantly. Copy with one click.",
    ["case converter", "uppercase converter", "lowercase converter", "title case", "camel case converter", "snake case"],
    [
      "Paste your text.",
      "Click the case you want — the result appears instantly.",
      "Review the conversion and copy it with one click.",
      "Clear the box when you're done.",
    ],
    [
      { q: "What is camelCase?", a: "camelCase joins words without spaces and capitalizes the first letter of each word after the first — like 'convertThisText'. It's standard in programming." },
      { q: "What is kebab-case?", a: "kebab-case joins words with hyphens — like 'this-is-a-slug'. It's commonly used in URLs and file names." },
      { q: "How does Title Case work?", a: "Title Case capitalizes the first letter of every significant word. Small words like 'and', 'or' and 'of' are typically left lowercase." },
    ],
    ["word-counter", "slug-generator", "text-cleaner", "sort-text"],
    { popular: true }
  ),
  t(
    "remove-duplicate-lines",
    "Remove Duplicate Lines",
    "remove-duplicate-lines",
    "text",
    "ListFilter",
    "Remove duplicate lines from pasted text or lists",
    "Remove duplicate lines instantly — perfect for cleaning up lists, exports and copied data. Optionally trim whitespace and sort the result.",
    "Remove Duplicate Lines — Clean Lists Online Free",
    "Remove duplicate lines from text online for free. Instantly deduplicate lists, CSV exports and pasted data. Optional sorting and whitespace trimming.",
    ["remove duplicate lines", "deduplicate list", "remove duplicates", "unique lines", "dedupe text"],
    [
      "Paste your text or list.",
      "Choose whether to trim whitespace and ignore case when matching.",
      "Click Remove Duplicates.",
      "Copy the cleaned result.",
    ],
    [
      { q: "Does it preserve the original order?", a: "Yes — the first occurrence of each line is kept, so the original order is preserved. A 'sort result' option is available if you want alphabetical order." },
      { q: "Are near-identical lines removed?", a: "Only exact duplicates are removed (optionally ignoring case). Lines with different spacing are treated as different unless you enable trimming." },
      { q: "Is my data private?", a: "Yes — the text never leaves your browser." },
    ],
    ["sort-text", "text-cleaner", "word-counter", "case-converter"],
    {}
  ),
  t(
    "sort-text",
    "Sort Text",
    "sort-text",
    "text",
    "ArrowUpDown",
    "Sort lines alphabetically, numerically, by length or in reverse",
    "Sort lists and text lines by alphabetical order, reverse order, numeric value or line length. Choose ascending or descending and copy the result instantly.",
    "Sort Text Lines — Alphabetical, Numeric & By Length Free",
    "Sort text lines online for free — alphabetically, reverse alphabetically, numerically or by length, ascending or descending. Instant results in your browser.",
    ["sort text", "sort lines", "alphabetical order", "sort list online", "sort lines alphabetically"],
    [
      "Paste the lines you want to sort.",
      "Pick a sort method: alphabetical, reverse, numeric or by length.",
      "Choose ascending or descending order.",
      "Copy the sorted result.",
    ],
    [
      { q: "How does numeric sorting differ from alphabetical?", a: "Alphabetical sorting treats '10' as smaller than '9'. Numeric sorting compares values, so 9 comes before 10. Enable numeric mode for lists of numbers." },
      { q: "Can I sort by line length?", a: "Yes — 'By length' sorts lines from shortest to longest (or longest to shortest in descending mode)." },
      { q: "Are blank lines removed?", a: "No. Blank lines are kept unless you remove them beforehand with the Text Cleaner tool." },
    ],
    ["remove-duplicate-lines", "text-cleaner", "case-converter", "word-counter"],
    {}
  ),
  t(
    "text-cleaner",
    "Text Cleaner",
    "text-cleaner",
    "text",
    "Eraser",
    "Remove extra spaces, empty lines and special characters from text",
    "Clean up messy text with one click: remove extra spaces, empty lines, duplicate spaces and special characters, and normalize line breaks. Perfect for fixing text copied from PDFs and emails.",
    "Text Cleaner — Remove Extra Spaces & Formatting Online Free",
    "Clean messy text online for free — remove extra spaces, empty lines, duplicate spaces and special characters, and normalize line breaks. Instant results, fully private.",
    ["text cleaner", "remove extra spaces", "clean text online", "remove special characters", "normalize text"],
    [
      "Paste the messy text.",
      "Tick the cleaning options you want: extra spaces, empty lines, special characters and more.",
      "Click Clean Text.",
      "Review and copy the cleaned result.",
    ],
    [
      { q: "Which characters are removed by 'special characters'?", a: "Only non-printable characters, symbols and punctuation are removed — letters, numbers and basic punctuation are kept. Accented letters remain intact." },
      { q: "Will cleaning change the meaning of my text?", a: "The options only remove formatting noise. If you're unsure about an option, enable just one at a time and preview the result." },
      { q: "Why is my text full of odd characters?", a: "Text copied from PDFs and emails often contains hidden formatting, non-breaking spaces and smart quotes. This tool normalizes them to plain text." },
    ],
    ["remove-duplicate-lines", "word-counter", "sort-text", "slug-generator"],
    {}
  ),
  t(
    "lorem-ipsum",
    "Lorem Ipsum Generator",
    "lorem-ipsum",
    "text",
    "TextQuote",
    "Generate lorem ipsum placeholder text by words, sentences or paragraphs",
    "Generate lorem ipsum placeholder text for mockups, layouts and design previews. Choose how many words, sentences or paragraphs you need and copy with one click.",
    "Lorem Ipsum Generator — Generate Placeholder Text Free",
    "Generate lorem ipsum placeholder text online for free. Create words, sentences or paragraphs of dummy text for design mockups and layouts. Copy with one click.",
    ["lorem ipsum", "lorem ipsum generator", "placeholder text", "dummy text generator", "lorem generator"],
    [
      "Choose the unit: words, sentences or paragraphs.",
      "Set the amount you need.",
      "Click Generate.",
      "Copy the text into your design or document.",
    ],
    [
      { q: "What is lorem ipsum?", a: "Lorem ipsum is standard placeholder text used in design to show where real content will go. It's derived from a Latin text by Cicero." },
      { q: "Can I start with 'Lorem ipsum dolor sit amet'?", a: "Yes — the generator can begin with the classic opening, or start with any random sentence for variety." },
      { q: "Is there a maximum amount?", a: "The generator supports up to a few thousand words comfortably. For very large amounts, generate in batches." },
    ],
    ["word-counter", "text-cleaner", "case-converter", "sort-text"],
    {}
  ),
  t(
    "text-diff",
    "Text Diff",
    "text-diff",
    "text",
    "GitCompare",
    "Compare two texts and see the differences highlighted",
    "Compare two versions of a text and see exactly what changed. Additions, removals and unchanged lines are color-coded for a quick visual review.",
    "Text Diff — Compare Two Texts Online Free",
    "Compare two texts online for free. Paste the original and modified versions and see additions and removals highlighted line by line. No registration.",
    ["text diff", "compare text", "diff checker", "compare two texts", "text comparison"],
    [
      "Paste the original text into the left box.",
      "Paste the modified text into the right box.",
      "The diff is computed instantly with color-coded highlights.",
      "Use the swap button to compare in the other direction.",
    ],
    [
      { q: "How does the diff work?", a: "The tool compares the texts line by line. Green lines were added, red lines were removed, and plain lines are unchanged." },
      { q: "Can I compare files?", a: "You can paste the contents of two files, or upload them with the file buttons — the comparison itself works on text." },
      { q: "Is my text sent anywhere?", a: "No — the comparison runs entirely in your browser." },
    ],
    ["text-cleaner", "word-counter", "sort-text", "case-converter"],
    {}
  ),
  t(
    "slug-generator",
    "Slug Generator",
    "slug-generator",
    "text",
    "Link2",
    "Turn titles into SEO-friendly URL slugs",
    "Convert any title or phrase into a clean, SEO-friendly URL slug. 'Best Free Online Image Tools' becomes 'best-free-online-image-tools' — lowercase, hyphenated and stripped of special characters.",
    "Slug Generator — Create SEO-Friendly URL Slugs Free",
    "Generate SEO-friendly URL slugs online for free. Convert titles into clean, hyphenated, lowercase slugs for WordPress, Shopify and any CMS. Instant results.",
    ["slug generator", "url slug", "seo slug", "create slug from title", "wordpress slug"],
    [
      "Type or paste your title or phrase.",
      "The slug is generated automatically.",
      "Choose lowercase or uppercase and custom separators if needed.",
      "Copy the slug into your CMS or URL.",
    ],
    [
      { q: "What is a URL slug?", a: "A slug is the part of a URL that identifies a page in human-readable words — for example 'best-free-online-image-tools' in toolbox-ai.com/tools/best-free-online-image-tools." },
      { q: "Why do slugs matter for SEO?", a: "Descriptive slugs help search engines and users understand what a page is about. Clean, keyword-relevant slugs are part of good on-page SEO." },
      { q: "What characters are removed?", a: "Spaces become hyphens, letters are lowercased, and characters like ?, &, %, # and accents are removed or converted to ASCII." },
    ],
    ["case-converter", "word-counter", "text-cleaner", "remove-duplicate-lines"],
    {}
  ),

  // ---------------------------------------------------------------- COLOR
  t(
    "color-picker",
    "Color Picker",
    "color-picker",
    "color",
    "Palette",
    "Pick colors visually and get HEX, RGB, HSL and HSV values",
    "Pick any color visually and instantly see its HEX, RGB, HSL and HSV values. Copy any format with one click and save colors to a palette for later.",
    "Color Picker — Pick Colors & Get HEX, RGB, HSL, HSV Free",
    "Free online color picker: choose any color visually and copy its HEX, RGB, HSL and HSV values instantly. Save colors to a palette and export them.",
    ["color picker", "hex color picker", "rgb picker", "color code", "pick color online"],
    [
      "Click or drag on the color wheel to pick a color.",
      "Use the sliders to fine-tune hue, saturation and lightness.",
      "Copy the HEX, RGB, HSL or HSV value with one click.",
      "Save colors to your palette and export the list.",
    ],
    [
      { q: "What is the difference between HEX, RGB, HSL and HSV?", a: "HEX is a hex triplet like #4F46E5. RGB describes red, green and blue amounts. HSL and HSV describe hue, saturation, lightness/value — more intuitive for designers." },
      { q: "Can I enter a hex code directly?", a: "Yes — type a hex code into the HEX field and the picker, sliders and all other formats update to match." },
      { q: "Is the picker free?", a: "Yes, and it runs entirely in your browser — no account, no tracking." },
    ],
    ["hex-to-rgb", "rgb-to-hex", "palette-generator", "contrast-checker"],
    { popular: true }
  ),
  t(
    "hex-to-rgb",
    "HEX to RGB",
    "hex-to-rgb",
    "color",
    "Hash",
    "Convert HEX color codes to RGB values instantly",
    "Convert any HEX color code (#FF5733 or FF5733) into its RGB values. Get red, green and blue components plus a live preview of the color.",
    "HEX to RGB Converter — Convert Hex Codes to RGB Free",
    "Convert HEX color codes to RGB values online for free. Get R, G, B components, a live color preview and a one-click copy button. Instant, private, no sign-up.",
    ["hex to rgb", "hex to rgb converter", "convert hex color", "hex color code to rgb"],
    [
      "Type or paste a HEX code, like #4F46E5.",
      "The RGB values appear instantly with a color preview.",
      "Copy the RGB value for CSS or design software.",
    ],
    [
      { q: "What is a HEX color code?", a: "A HEX code is a six-digit hexadecimal number that describes a color — two digits each for red, green and blue, like #4F46E5." },
      { q: "How do I write RGB in CSS?", a: "Use the rgb() function: rgb(79, 70, 229). The tool copies exactly that format." },
      { q: "Can I convert back?", a: "Yes — use the RGB to HEX tool to go in the other direction." },
    ],
    ["rgb-to-hex", "color-picker", "palette-generator", "contrast-checker"],
    {}
  ),
  t(
    "rgb-to-hex",
    "RGB to HEX",
    "rgb-to-hex",
    "color",
    "Hash",
    "Convert RGB color values to HEX codes",
    "Convert RGB values (red, green, blue) into their HEX color code. Adjust the sliders or type values directly and copy the resulting hex with one click.",
    "RGB to HEX Converter — Convert RGB to Hex Codes Free",
    "Convert RGB to HEX color codes online for free. Adjust red, green and blue values with sliders and copy the hex code instantly. Includes live color preview.",
    ["rgb to hex", "rgb to hex converter", "rgb color to hex", "convert rgb"],
    [
      "Adjust the R, G and B sliders or type values from 0–255.",
      "The HEX code updates live with a color preview.",
      "Copy the hex code for CSS or your design tools.",
    ],
    [
      { q: "What RGB values are valid?", a: "Each channel ranges from 0 to 255. The tool clamps values automatically if you type outside the range." },
      { q: "What is hex used for in web design?", a: "HEX codes are the standard way to define colors in CSS and HTML, and are supported by every design tool." },
      { q: "Can I convert back to RGB?", a: "Yes — use the HEX to RGB tool." },
    ],
    ["hex-to-rgb", "color-picker", "gradient-generator", "palette-generator"],
    {}
  ),
  t(
    "palette-generator",
    "Color Palette Generator",
    "palette-generator",
    "color",
    "SwatchBook",
    "Generate complementary, analogous, triadic and monochromatic palettes",
    "Generate harmonious color palettes from any starting color. Choose complementary, analogous, triadic, monochromatic or random schemes, and copy every color with one click.",
    "Color Palette Generator — Harmonious Palettes Online Free",
    "Generate color palettes online for free — complementary, analogous, triadic, monochromatic and random schemes. Copy any color or export the whole palette.",
    ["color palette generator", "palette generator", "color scheme generator", "complementary colors", "triadic colors"],
    [
      "Pick a base color or generate a random one.",
      "Choose a harmony type: complementary, analogous, triadic, monochromatic or random.",
      "The palette updates instantly with five colors.",
      "Copy individual colors or the whole palette as CSS variables.",
    ],
    [
      { q: "What is a complementary palette?", a: "Complementary colors sit opposite each other on the color wheel (like blue and orange), creating strong, high-contrast combinations." },
      { q: "What are analogous colors?", a: "Analogous colors sit next to each other on the color wheel and create calm, harmonious designs — often found in nature." },
      { q: "Can I export the palette?", a: "Yes — copy each hex code individually, or export the whole palette as CSS variables ready to paste into your project." },
    ],
    ["gradient-generator", "color-picker", "contrast-checker", "rgb-to-hex"],
    {}
  ),
  t(
    "gradient-generator",
    "Gradient Generator",
    "gradient-generator",
    "color",
    "Blend",
    "Create linear and radial CSS gradients with live preview",
    "Design beautiful CSS gradients: choose linear or radial, pick two or more colors, set the direction and position, and copy ready-to-use CSS code.",
    "Gradient Generator — Create CSS Gradients Online Free",
    "Create CSS gradients online for free — linear and radial, with adjustable direction, position and multiple colors. Copy clean CSS code with one click.",
    ["gradient generator", "css gradient", "linear gradient", "radial gradient", "gradient maker"],
    [
      "Choose linear or radial gradient type.",
      "Pick your colors — add or remove color stops.",
      "Adjust the direction (for linear) or position (for radial).",
      "Copy the generated CSS code and paste it into your stylesheet.",
    ],
    [
      { q: "What is the difference between linear and radial gradients?", a: "Linear gradients transition along a straight line (top-to-bottom, diagonal, etc.). Radial gradients transition outward from a center point in a circle." },
      { q: "What CSS is generated?", a: "A background property with the standard gradient syntax plus a -webkit- prefix for maximum browser compatibility." },
      { q: "Can I add more than two colors?", a: "Yes — add as many color stops as you like. Each stop can be positioned anywhere along the gradient." },
    ],
    ["palette-generator", "color-picker", "rgb-to-hex", "hex-to-rgb"],
    {}
  ),
  t(
    "contrast-checker",
    "Contrast Checker",
    "contrast-checker",
    "color",
    "Contrast",
    "Check WCAG contrast ratios between two colors",
    "Check the contrast ratio between a foreground and background color and find out whether it passes WCAG accessibility guidelines for normal text, large text and UI components.",
    "Contrast Checker — WCAG Color Contrast Ratio Tool Free",
    "Check color contrast ratios online for free. See if your foreground and background colors pass WCAG AA and AAA guidelines for normal and large text.",
    ["contrast checker", "wcag contrast", "color contrast ratio", "accessibility contrast", "text contrast"],
    [
      "Pick a foreground color and a background color.",
      "The contrast ratio is calculated instantly.",
      "See pass/fail results for normal text, large text and UI components.",
      "Adjust the colors until your combination passes.",
    ],
    [
      { q: "What is the WCAG contrast requirement?", a: "WCAG AA requires 4.5:1 for normal text and 3:1 for large text (18pt or 14pt bold). AAA requires 7:1 and 4.5:1 respectively." },
      { q: "Why does contrast matter?", a: "Low contrast makes text hard to read for people with low vision and in bright environments. Meeting WCAG standards also protects you legally in many regions." },
      { q: "What does a ratio like 7:1 mean?", a: "It means the foreground is 7 times brighter than the background, measured by WCAG's luminance formula. Higher is better." },
    ],
    ["color-picker", "palette-generator", "hex-to-rgb", "gradient-generator"],
    {}
  ),

  // ---------------------------------------------------------------- AI
  t(
    "text-summarizer",
    "AI Text Summarizer",
    "text-summarizer",
    "ai",
    "AlignLeft",
    "Summarize long texts into short, medium or detailed summaries",
    "Summarize any text automatically. Choose a short, medium or detailed summary length and get the key points instantly. Runs on your device — your text stays private.",
    "AI Text Summarizer — Summarize Long Text Online Free",
    "Summarize long articles and documents online for free. Choose short, medium or detailed summaries and get key points instantly. Private, on-device processing.",
    ["text summarizer", "summarize text", "article summarizer", "summarize long text", "ai summary"],
    [
      "Paste or type the text you want to summarize.",
      "Choose the summary length: short, medium or detailed.",
      "Click Summarize — key sentences are extracted automatically.",
      "Copy or download the summary.",
    ],
    [
      { q: "How does the summarizer work?", a: "It's an extractive summarizer: it scores every sentence by how much it represents the whole text and keeps the most important ones in the correct order." },
      { q: "Is it as good as a human summary?", a: "For informational texts it captures the main points reliably. It works best on articles, reports and web content with clear topic sentences." },
      { q: "Is my text stored anywhere?", a: "No — summarization runs locally in your browser." },
    ],
    ["text-rewriter", "word-counter", "translator", "text-cleaner"],
    { experimental: true }
  ),
  t(
    "text-rewriter",
    "AI Text Rewriter",
    "text-rewriter",
    "ai",
    "PenLine",
    "Rewrite text in professional, simple, formal, friendly or academic styles",
    "Rewrite any text in the style you need — professional, simple, formal, friendly or academic. Rephrase sentences, swap vocabulary and improve flow, all on your device.",
    "AI Text Rewriter — Rewrite Text in Different Styles Free",
    "Rewrite text online for free in professional, simple, formal, friendly or academic styles. On-device rewriting that improves clarity and tone.",
    ["text rewriter", "rewrite text", "paraphrase online", "rewrite paragraph", "ai rewrite"],
    [
      "Paste the text you want to rewrite.",
      "Choose the target style: professional, simple, formal, friendly or academic.",
      "Click Rewrite.",
      "Review the result and copy or download it.",
    ],
    [
      { q: "What styles are supported?", a: "Professional, simple, formal, friendly and academic. Each style adjusts vocabulary, sentence structure and tone." },
      { q: "Is the rewrite accurate?", a: "The rewriter preserves the original meaning while changing the wording. It's best for improving tone and clarity rather than creating brand-new content." },
      { q: "How is this different from a full AI model?", a: "This tool runs locally with a lightweight language model, so it's free and private — but for complex creative writing, a full cloud model will produce richer results." },
    ],
    ["text-summarizer", "translator", "word-counter", "text-cleaner"],
    { experimental: true }
  ),
  t(
    "translator",
    "AI Translator",
    "translator",
    "ai",
    "Languages",
    "Translate text between dozens of languages",
    "Translate text between more than 40 languages. Paste your text, pick a target language, and get a translation you can copy or download.",
    "AI Translator — Free Online Text Translation",
    "Translate text online for free between 40+ languages. Instant translation, copy or download the result, and a character count for the source text.",
    ["translator", "translate text", "online translator", "translate arabic", "translate english"],
    [
      "Type or paste the text to translate.",
      "Select the source language (or auto-detect) and the target language.",
      "Click Translate.",
      "Copy or download the translation.",
    ],
    [
      { q: "How many languages are supported?", a: "Over 40 languages, including Arabic, English, French, Spanish, German, Chinese, Japanese, Russian and more." },
      { q: "Is translation free?", a: "Yes, the translation service is free for everyday use. Very long texts may be split into chunks to stay within API limits." },
      { q: "Is my text sent to a server?", a: "Translation uses a free public translation API, so the text is sent to that service to be translated. For fully private processing, use the on-device tools." },
    ],
    ["text-summarizer", "text-rewriter", "image-to-text", "ai-ocr"],
    { experimental: true, privacy: "api" }
  ),
  t(
    "image-description",
    "AI Image Description Generator",
    "image-description",
    "ai",
    "Eye",
    "Generate an accessible description of any image",
    "Upload an image and get a natural-language description of what it contains. Great for alt text, accessibility work and cataloging photos. Runs locally in your browser.",
    "AI Image Description Generator — Alt Text & Captions Free",
    "Generate image descriptions online for free. Upload a photo and get a natural-language description for alt text, accessibility and captions. Private, on-device.",
    ["image description generator", "alt text generator", "describe image", "image caption", "image alt text"],
    [
      "Upload an image.",
      "The tool analyzes the image and generates a description.",
      "Choose between a short caption and a detailed description.",
      "Copy the text for your alt attribute, caption or documentation.",
    ],
    [
      { q: "What is the description based on?", a: "The tool analyzes visual features of the image — dominant colors, detected objects, faces and overall composition — and turns them into a natural description." },
      { q: "Can I use it for accessibility?", a: "Yes — the descriptions are written in the style of good alt text, suitable for screen readers and web accessibility." },
      { q: "Is my image uploaded?", a: "No — the image is analyzed entirely in your browser." },
    ],
    ["image-to-text", "remove-background", "ai-ocr", "text-summarizer"],
    { experimental: true, formats: ["jpg", "jpeg", "png", "webp"] }
  ),
  t(
    "ai-ocr",
    "AI OCR",
    "ai-ocr",
    "ai",
    "ScanLine",
    "Extract text with OCR and clean it up with AI",
    "Extract text from images with OCR, then automatically clean and organize the result — fix spacing, merge broken lines and remove scanner noise to produce tidy, editable text.",
    "AI OCR — Extract & Clean Text from Images Free",
    "Extract text from images with AI-powered OCR that also cleans and organizes the result. Fixes spacing, merges broken lines and removes noise. Private, on-device.",
    ["ai ocr", "smart ocr", "extract text from image", "ocr clean text", "scanned text cleanup"],
    [
      "Upload an image or PDF page containing text.",
      "Choose the language of the text.",
      "Click Extract — OCR reads the text, then AI cleans the result.",
      "Review the organized text and copy or download it.",
    ],
    [
      { q: "How is AI OCR different from normal OCR?", a: "Besides recognizing characters, it fixes common OCR errors: merged or split words, stray punctuation and inconsistent spacing, producing much cleaner output." },
      { q: "Which languages are supported?", a: "Arabic, English, French, Spanish and German." },
      { q: "Where does processing happen?", a: "Entirely in your browser — images and extracted text never leave your device." },
    ],
    ["image-to-text", "pdf-to-text", "text-cleaner", "text-summarizer"],
    { experimental: true, formats: ["jpg", "jpeg", "png", "webp", "bmp", "pdf"] }
  ),
  t(
    "manga-colorizer",
    "AI Manga / Comic Coloring",
    "manga-colorizer",
    "ai",
    "Brush",
    "Experimental: color black-and-white manga pages using a reference image",
    "An experimental tool that adds color to black-and-white manga or comic pages. Upload a page and optionally a reference image — the tool detects regions, builds a palette from the reference (or your chosen colors) and fills each region while preserving the original line art.",
    "AI Manga Colorizer — Color Manga Pages Online Free",
    "Color black-and-white manga and comic pages online for free. Experimental on-device colorizer with reference-image palettes and an original/colored comparison slider.",
    ["manga colorizer", "color manga", "comic coloring", "anime colorize", "color manga pages"],
    [
      "Upload a black-and-white manga or comic page.",
      "Optionally upload a reference image so the palette matches its character colors.",
      "Click Colorize — regions are detected and colored while line art is preserved.",
      "Use the Original | Colored slider to compare the result.",
      "Download the colored page as PNG or JPG.",
    ],
    [
      { q: "How does it decide which color goes where?", a: "The tool segments the page into regions (skin, hair, clothing, background) based on line density and tone, then assigns colors from the reference image palette — or your chosen colors if no reference is provided." },
      { q: "Will it look like professional coloring?", a: "No — this is an experimental prototype. Results can be striking, but they won't match a professional colorist. We label it clearly as experimental." },
      { q: "Is the reference image required?", a: "No. Without a reference, the tool uses a default anime-style palette. With one, it extracts dominant colors to match the character's look." },
      { q: "Where is the image processed?", a: "Locally in your browser. Nothing is uploaded." },
    ],
    ["remove-background", "image-description", "image-converter", "image-compressor"],
    { experimental: true, formats: ["jpg", "jpeg", "png", "webp"] }
  ),

  // ---------------------------------------------------------------- DEVELOPER
  t(
    "json-formatter",
    "JSON Formatter",
    "json-formatter",
    "developer",
    "Braces",
    "Format, minify and validate JSON with error highlighting",
    "Format and validate JSON with indentation, minify it for production, and get clear, friendly error messages when something is wrong. Copy the result with one click.",
    "JSON Formatter — Format & Validate JSON Online Free",
    "Format, minify and validate JSON online for free. Pretty-print with adjustable indentation, catch syntax errors with friendly messages, and copy with one click.",
    ["json formatter", "format json", "json validator", "json beautifier", "json pretty print"],
    [
      "Paste your JSON into the editor.",
      "Click Format to pretty-print or Minify to compress it.",
      "Syntax errors are highlighted with clear messages.",
      "Copy the formatted or minified result.",
    ],
    [
      { q: "What is JSON used for?", a: "JSON (JavaScript Object Notation) is the standard data format for APIs and configuration files. It's readable by both humans and machines." },
      { q: "What indentation should I use?", a: "2 spaces is the most common convention in JavaScript projects; 4 spaces is common elsewhere. The tool lets you choose." },
      { q: "What happens when my JSON is invalid?", a: "The tool shows a friendly message describing where the problem is — for example a missing comma or an unclosed brace — and nothing is lost." },
    ],
    ["base64-encoder", "url-encoder", "regex-tester", "timestamp-converter"],
    { popular: true }
  ),
  t(
    "base64-encoder",
    "Base64 Encoder / Decoder",
    "base64-encoder",
    "developer",
    "Binary",
    "Encode text to Base64 and decode Base64 back to text",
    "Encode plain text into Base64 or decode Base64 back into readable text. Handy for API payloads, data URIs and debugging. Works offline, in your browser.",
    "Base64 Encoder / Decoder — Encode & Decode Text Free",
    "Encode text to Base64 and decode Base64 to text online for free. Instant results with UTF-8 support and copy buttons. Private, browser-based.",
    ["base64 encode", "base64 decode", "base64 converter", "encode to base64", "decode base64"],
    [
      "Type or paste your text into the input.",
      "Click Encode to get Base64, or Decode to convert back.",
      "The result updates instantly in the output box.",
      "Copy either value with one click.",
    ],
    [
      { q: "What is Base64?", a: "Base64 is an encoding that represents binary data as ASCII text using 64 characters. It's commonly used to embed data in JSON, URLs and email." },
      { q: "Is Base64 encryption?", a: "No — Base64 is an encoding, not encryption. Anyone can decode it. Never use it to protect sensitive data." },
      { q: "Does it support non-English characters?", a: "Yes — the tool encodes with UTF-8, so Arabic, Chinese and emoji work correctly." },
    ],
    ["url-encoder", "json-formatter", "uuid-generator", "timestamp-converter"],
    {}
  ),
  t(
    "url-encoder",
    "URL Encoder / Decoder",
    "url-encoder",
    "developer",
    "Link2",
    "Encode and decode URLs and query parameters",
    "Encode special characters in URLs so they're safe to use in links and query strings, or decode encoded URLs back to readable form. Instant, in your browser.",
    "URL Encoder / Decoder — Encode & Decode URLs Free",
    "Encode and decode URLs online for free. Safely encode query parameters and special characters, or decode encoded URLs with one click.",
    ["url encoder", "url decode", "url encode decode", "percent encoding", "encode url"],
    [
      "Paste the URL or text.",
      "Click Encode to percent-encode special characters, or Decode to reverse it.",
      "Choose between full URL encoding or query-string only.",
      "Copy the result.",
    ],
    [
      { q: "Why do URLs need encoding?", a: "Characters like spaces, &, ? and # have special meaning in URLs. Encoding them as percent-sequences (e.g. %20 for space) keeps links and query parameters intact." },
      { q: "What is the difference between the two modes?", a: "Full encoding also encodes characters like : and / that are part of the URL structure. Query-string mode only encodes parameter values." },
      { q: "Is this the same as Base64?", a: "No — URL encoding uses percent-sequences and is human-readable; Base64 uses a 64-character alphabet. They serve different purposes." },
    ],
    ["base64-encoder", "slug-generator", "json-formatter", "regex-tester"],
    {}
  ),
  t(
    "uuid-generator",
    "UUID Generator",
    "uuid-generator",
    "developer",
    "KeyRound",
    "Generate random UUIDs (v4) in bulk",
    "Generate cryptographically random UUID v4 identifiers. Create one or many at once, choose uppercase or lowercase, and copy them as a list or comma-separated string.",
    "UUID Generator — Generate Random UUIDs v4 Free",
    "Generate UUID v4 identifiers online for free. Create bulk UUIDs with lowercase/uppercase options and copy as a list, CSV or JSON array.",
    ["uuid generator", "generate uuid", "uuid v4", "guid generator", "unique id"],
    [
      "Choose how many UUIDs you need.",
      "Select lowercase or uppercase output.",
      "Click Generate.",
      "Copy as a list, comma-separated string or JSON array.",
    ],
    [
      { q: "What is a UUID?", a: "A UUID (Universally Unique Identifier) is a 128-bit identifier that is practically unique across all devices and time. Version 4 is generated from random numbers." },
      { q: "Are the UUIDs cryptographically random?", a: "Yes — they're generated with the browser's crypto.getRandomValues API, the same source used for secure keys." },
      { q: "What are UUIDs used for?", a: "Database primary keys, order IDs, session identifiers, file names and anywhere a collision-free identifier is needed." },
    ],
    ["timestamp-converter", "base64-encoder", "json-formatter", "regex-tester"],
    {}
  ),
  t(
    "timestamp-converter",
    "Timestamp Converter",
    "timestamp-converter",
    "developer",
    "Timer",
    "Convert Unix timestamps to readable dates and back",
    "Convert Unix timestamps (seconds or milliseconds) into human-readable dates, and dates into Unix timestamps. Includes timezone display and 'now' shortcut.",
    "Unix Timestamp Converter — Epoch to Date & Back Free",
    "Convert Unix timestamps to readable dates and back online for free. Seconds or milliseconds, with timezone info and a live 'current time' display.",
    ["timestamp converter", "unix timestamp", "epoch converter", "timestamp to date", "epoch time"],
    [
      "Paste a Unix timestamp in seconds or milliseconds.",
      "The readable date appears instantly in your local timezone.",
      "Or pick a date and see its timestamp.",
      "Copy either value with one click.",
    ],
    [
      { q: "What is a Unix timestamp?", a: "It's the number of seconds (or milliseconds) that have elapsed since January 1, 1970 UTC — the 'epoch'. It's how most systems store time." },
      { q: "Seconds or milliseconds?", a: "The tool detects both automatically. Seconds are 10 digits (e.g. 1755000000); milliseconds are 13 digits." },
      { q: "What timezone is the result in?", a: "Dates are shown in your local timezone, with the UTC equivalent displayed alongside." },
    ],
    ["uuid-generator", "json-formatter", "base64-encoder", "url-encoder"],
    {}
  ),
  t(
    "regex-tester",
    "Regex Tester",
    "regex-tester",
    "developer",
    "Code2",
    "Test regular expressions against live text with highlighting",
    "Test regular expressions against sample text and see every match highlighted in color. Supports flags like global, case-insensitive and multiline, plus a quick reference.",
    "Regex Tester — Test Regular Expressions Online Free",
    "Test regex patterns online for free with live match highlighting. Global, case-insensitive and multiline flags, plus a cheat sheet of common patterns.",
    ["regex tester", "test regex", "regular expression tester", "regex online", "regex checker"],
    [
      "Type your regex pattern.",
      "Choose the flags you need (g, i, m, s).",
      "Paste test text — every match is highlighted instantly.",
      "See the match count and copy matches if needed.",
    ],
    [
      { q: "What are regex flags?", a: "g (global) matches all occurrences, i ignores case, m makes ^ and $ match line boundaries, and s makes . match newlines too." },
      { q: "Why doesn't my pattern match?", a: "Common causes: missing the global flag for multiple matches, unescaped special characters, or the text containing newlines that . doesn't match without the s flag." },
      { q: "What syntax is used?", a: "JavaScript regular expression syntax, which is also compatible with most other languages for common patterns." },
    ],
    ["json-formatter", "base64-encoder", "url-encoder", "slug-generator"],
    {}
  ),

  // ---------------------------------------------------------------- UTILITY
  t(
    "calculator",
    "Calculator",
    "calculator",
    "utility",
    "Calculator",
    "A clean, fast calculator for everyday math",
    "A simple, fast calculator for everyday arithmetic — addition, subtraction, multiplication, division and percentages. Full keyboard support and a copyable result.",
    "Free Online Calculator — Simple & Fast",
    "Use this free online calculator for everyday math. Clean design, full keyboard support, percentage operations and copyable results. No sign-up.",
    ["calculator", "online calculator", "basic calculator", "free calculator"],
    [
      "Click the buttons or use your keyboard.",
      "Operators chain like a standard calculator.",
      "Press = or Enter to see the result.",
      "Use C to clear and the copy button to grab the result.",
    ],
    [
      { q: "Does the calculator support keyboard input?", a: "Yes — digits, operators, Enter, Backspace and Escape all work, and the active button stays visible for feedback." },
      { q: "How precise are the results?", a: "Results are computed with full floating-point precision and rounded for display to avoid artifacts like 0.30000000000000004." },
      { q: "Is there a percentage button?", a: "Yes — % calculates percentages (e.g. 200 × 10% = 20)." },
    ],
    ["percentage-calculator", "age-calculator", "unit-converter", "random-number"],
    { popular: true }
  ),
  t(
    "percentage-calculator",
    "Percentage Calculator",
    "percentage-calculator",
    "utility",
    "Percent",
    "Calculate X% of Y, percentage increase, decrease and difference",
    "Four percentage calculators in one: what is X% of Y, percentage increase, percentage decrease and percentage difference. Instant results with clean explanations.",
    "Percentage Calculator — Calculate % of, Increase & Difference",
    "Free online percentage calculator: what is X% of Y, percentage increase, percentage decrease and percentage difference. Instant results, no sign-up.",
    ["percentage calculator", "percent calculator", "percentage increase", "percentage difference", "what is 10 percent of"],
    [
      "Choose the calculation type from the tabs.",
      "Enter the two values.",
      "The result and a plain-English explanation appear instantly.",
      "Copy the result if you need it elsewhere.",
    ],
    [
      { q: "How do I calculate percentage increase?", a: "Divide the increase by the original value and multiply by 100. For example, 50 → 75 is a 50% increase. The tool does this for you." },
      { q: "What is percentage difference?", a: "It compares two values symmetrically: the difference divided by their average, times 100. It's useful when neither value is the 'original'." },
      { q: "What is X% of Y?", a: "Multiply Y by X and divide by 100. For example, 15% of 200 is 30." },
    ],
    ["calculator", "age-calculator", "unit-converter", "random-number"],
    { popular: true }
  ),
  t(
    "age-calculator",
    "Age Calculator",
    "age-calculator",
    "utility",
    "CalendarDays",
    "Calculate your exact age from your date of birth",
    "Calculate your exact age in years, months and days from your date of birth. See your next birthday countdown and the day of the week you were born.",
    "Age Calculator — Calculate Exact Age from Date of Birth",
    "Calculate your exact age online for free — years, months and days from your date of birth, plus days until your next birthday. Instant results.",
    ["age calculator", "calculate age", "age from date of birth", "how old am i", "birthday calculator"],
    [
      "Enter your date of birth.",
      "Optionally set a target date (defaults to today).",
      "Your exact age in years, months and days appears instantly.",
      "See how many days remain until your next birthday.",
    ],
    [
      { q: "How is age calculated?", a: "The tool counts full years, then months, then days between the birth date and the target date, accounting for month lengths and leap years." },
      { q: "Why does the age differ from my documents?", a: "Some countries count age differently (e.g. by year only). This calculator shows the precise elapsed time in years, months and days." },
      { q: "Can I calculate age for a date in the past?", a: "Yes — set a custom target date to find out someone's age on a specific day." },
    ],
    ["calculator", "percentage-calculator", "timestamp-converter", "unit-converter"],
    {}
  ),
  t(
    "unit-converter",
    "Unit Converter",
    "unit-converter",
    "utility",
    "Ruler",
    "Convert length, weight, temperature, area, volume, time and data",
    "Convert between units across seven categories: length, weight, temperature, area, volume, time and data storage. Pick a category, type a value, and get every equivalent instantly.",
    "Unit Converter — Length, Weight, Temperature & More Free",
    "Convert units online for free — length, weight, temperature, area, volume, time and data storage. Instant results across all units in each category.",
    ["unit converter", "convert units", "length converter", "weight converter", "temperature converter", "cm to inches"],
    [
      "Choose a category: length, weight, temperature, area, volume, time or data.",
      "Enter a value and select its unit.",
      "Every equivalent unit updates instantly.",
      "Tap any result to copy it.",
    ],
    [
      { q: "How many units are supported?", a: "Hundreds, across seven categories — metric and imperial for length, weight, area and volume, plus temperature scales, time units and data storage sizes." },
      { q: "Is cm to inches supported?", a: "Yes — select Length, type centimeters, and see inches, feet, meters, miles and more instantly." },
      { q: "Are conversions exact?", a: "Yes — all conversions use the official definitions (e.g. 1 inch = 2.54 cm exactly). Results are rounded only for display." },
    ],
    ["random-number", "age-calculator", "percentage-calculator", "calculator"],
    {}
  ),
  t(
    "random-number",
    "Random Number Generator",
    "random-number",
    "utility",
    "Dice5",
    "Generate random numbers within any range, in any quantity",
    "Generate truly random numbers between a minimum and maximum — one or many at once. Uses the browser's cryptographic random source and lets you copy the results.",
    "Random Number Generator — Generate Random Numbers Free",
    "Generate random numbers online for free within any range and quantity. Cryptographically random, copy as list or comma-separated. No sign-up.",
    ["random number generator", "random number", "pick random number", "random generator", "rng"],
    [
      "Set the minimum and maximum values.",
      "Choose how many numbers to generate.",
      "Click Generate.",
      "Copy the numbers as a list or comma-separated string.",
    ],
    [
      { q: "Are the numbers truly random?", a: "They're generated with the browser's crypto.getRandomValues API — a cryptographically secure source, not a predictable algorithm." },
      { q: "Can numbers repeat?", a: "By default each number is independent, so repeats are possible — like rolling dice. Enable 'unique values' to prevent duplicates (when the range allows)." },
      { q: "How large can the range be?", a: "Practically unlimited — the generator supports the full range of safe integers." },
    ],
    ["calculator", "percentage-calculator", "unit-converter", "uuid-generator"],
    {}
  ),
  t(
    "qr-generator",
    "QR Code Generator",
    "qr-generator",
    "utility",
    "QrCode",
    "Generate QR codes from text, URLs, emails, phone numbers and Wi-Fi",
    "Create QR codes for text, URLs, email addresses, phone numbers and Wi-Fi networks. Choose size and colors, preview instantly, and download as a high-resolution PNG.",
    "QR Code Generator — Create QR Codes Online Free",
    "Generate QR codes online for free from text, URLs, email, phone and Wi-Fi details. Customize size and colors and download a high-quality PNG.",
    ["qr code generator", "generate qr code", "qr code", "qr generator", "wifi qr code"],
    [
      "Choose the QR type: text, URL, email, phone or Wi-Fi.",
      "Enter the content — the QR code renders instantly.",
      "Adjust the size and colors if you like.",
      "Download the QR code as a PNG.",
    ],
    [
      { q: "Can I create a Wi-Fi QR code?", a: "Yes — choose the Wi-Fi type, enter your network name, password and security type, and anyone can scan the code to connect instantly." },
      { q: "What size should my QR code be?", a: "For print, use 500–1000 px. For screens and email, 300 px is plenty. Larger sizes include quiet-zone margins automatically." },
      { q: "Are my QR codes private?", a: "Yes — QR codes are generated locally in your browser. Nothing is sent to a server." },
    ],
    ["uuid-generator", "random-number", "unit-converter", "calculator"],
    { popular: true }
  ),
];

export const toolById = Object.fromEntries(tools.map((tool) => [tool.id, tool])) as Record<
  string,
  ToolConfig
>;

export const toolBySlug = Object.fromEntries(tools.map((tool) => [tool.slug, tool])) as Record<
  string,
  ToolConfig
>;

export const toolsByCategory = (category: CategoryId): ToolConfig[] =>
  tools.filter((tool) => tool.category === category);

export const popularTools: ToolConfig[] = tools.filter((tool) => tool.popular);

export const slugify = (input: string): string =>
  input
    .toLowerCase()
    .trim()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export const siteName = "ToolBox AI";
export const siteUrl = "https://toolbox-ai.com";
export const siteTagline = "Free Online Tools for Everyone";
