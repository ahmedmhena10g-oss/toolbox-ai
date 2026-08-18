"use client";

import type { ComponentType } from "react";
import { JpgToPng, PngToJpg, WebpConverter, ImageConverter } from "./image-converter";
import ImageCompressor from "./image-compressor";
import ImageResizer from "./image-resizer";
import ImageCropper from "./image-cropper";
import ImageRotator from "./image-rotator";
import RemoveBackground from "./remove-background";
import { JpgToPdf, PngToPdf } from "./images-to-pdf";
import { PdfToJpg, PdfToPng } from "./pdf-to-image";
import MergePdf from "./merge-pdf";
import { SplitPdf, ExtractPages } from "./split-pdf";
import CompressPdf from "./compress-pdf";
import RotatePdf from "./rotate-pdf";
import PdfMetadata from "./pdf-metadata";
import PdfProtect from "./pdf-protect";
import PdfUnlock from "./pdf-unlock";
import { ImageToText, PdfToText } from "./ocr-tools";
import {
  WordCounter,
  CaseConverter,
  RemoveDuplicateLines,
  SortText,
  TextCleaner,
  LoremIpsum,
  TextDiff,
  SlugGenerator,
} from "./text-tools";
import {
  ColorPicker,
  HexToRgb,
  RgbToHex,
  PaletteGenerator,
  GradientGenerator,
  ContrastChecker,
} from "./color-tools";
import { TextSummarizer, TextRewriter, Translator } from "./ai-text";
import { ImageDescription, AiOcr, MangaColorizer } from "./ai-image";
import {
  JsonFormatter,
  Base64Tool,
  UrlEncoder,
  UuidGenerator,
  TimestampConverter,
  RegexTester,
} from "./developer-tools";
import {
  Calculator,
  PercentageCalculator,
  AgeCalculator,
  UnitConverter,
  RandomNumber,
  QrGenerator,
} from "./utility-tools";

/**
 * Central registry: add a new tool by registering its component here and
 * adding its metadata in src/lib/tools.ts. The page, SEO and search index
 * are generated automatically from the metadata.
 */
const registry: Record<string, ComponentType> = {
  "jpg-to-png": JpgToPng,
  "png-to-jpg": PngToJpg,
  "webp-converter": WebpConverter,
  "image-compressor": ImageCompressor,
  "image-resizer": ImageResizer,
  "image-cropper": ImageCropper,
  "image-rotator": ImageRotator,
  "image-converter": ImageConverter,
  "remove-background": RemoveBackground,

  "jpg-to-pdf": JpgToPdf,
  "png-to-pdf": PngToPdf,
  "pdf-to-jpg": PdfToJpg,
  "pdf-to-png": PdfToPng,
  "merge-pdf": MergePdf,
  "split-pdf": SplitPdf,
  "compress-pdf": CompressPdf,
  "rotate-pdf": RotatePdf,
  "extract-pages": ExtractPages,
  "pdf-metadata": PdfMetadata,
  "pdf-protect": PdfProtect,
  "pdf-unlock": PdfUnlock,

  "image-to-text": ImageToText,
  "pdf-to-text": PdfToText,

  "word-counter": WordCounter,
  "case-converter": CaseConverter,
  "remove-duplicate-lines": RemoveDuplicateLines,
  "sort-text": SortText,
  "text-cleaner": TextCleaner,
  "lorem-ipsum": LoremIpsum,
  "text-diff": TextDiff,
  "slug-generator": SlugGenerator,

  "color-picker": ColorPicker,
  "hex-to-rgb": HexToRgb,
  "rgb-to-hex": RgbToHex,
  "palette-generator": PaletteGenerator,
  "gradient-generator": GradientGenerator,
  "contrast-checker": ContrastChecker,

  "text-summarizer": TextSummarizer,
  "text-rewriter": TextRewriter,
  translator: Translator,
  "image-description": ImageDescription,
  "ai-ocr": AiOcr,
  "manga-colorizer": MangaColorizer,

  "json-formatter": JsonFormatter,
  "base64-encoder": Base64Tool,
  "url-encoder": UrlEncoder,
  "uuid-generator": UuidGenerator,
  "timestamp-converter": TimestampConverter,
  "regex-tester": RegexTester,

  calculator: Calculator,
  "percentage-calculator": PercentageCalculator,
  "age-calculator": AgeCalculator,
  "unit-converter": UnitConverter,
  "random-number": RandomNumber,
  "qr-generator": QrGenerator,
};

export const getToolComponent = (slug: string): ComponentType | null => registry[slug] ?? null;

export const registryCount = Object.keys(registry).length;
