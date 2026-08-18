"use client";

import { useState } from "react";
import { RefreshCw, ScanText, FileDown, FileText, FileArchive, Copy, Trash2, ScanLine } from "lucide-react";
import FileUploader from "../upload/FileUploader";
import { fileToDataUrl, stripExtension, copyToClipboard } from "@/lib/utils";
import { useToast } from "../ui/Toast";
import { Button, ProgressBar, CopyButton } from "../ui/feedback";
import { Field, Select, TextArea, Tabs } from "../ui/form";
import { downloadTxt, downloadDocx, downloadTextPdf } from "@/lib/textdownload";
import { usePdfFile } from "@/lib/usePdfFile";
import { PdfFileCard } from "./pdf-shared";

export const OCR_LANGS = [
  { id: "eng", label: "English" },
  { id: "ara", label: "Arabic (العربية)" },
  { id: "fra", label: "French" },
  { id: "spa", label: "Spanish" },
  { id: "deu", label: "German" },
];

export async function runOcr(dataUrl: string, lang: string, onProgress: (pct: number) => void): Promise<string> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker(lang, 1, {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === "recognizing text") onProgress(Math.round(m.progress * 100));
    },
  });
  try {
    const { data } = await worker.recognize(dataUrl);
    return data.text;
  } finally {
    await worker.terminate();
  }
}

function TextResult({
  text,
  setText,
  baseName,
  onClear,
}: {
  text: string;
  setText: (value: string) => void;
  baseName: string;
  onClear: () => void;
}) {
  const { toast } = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  const download = async (kind: "txt" | "docx" | "pdf") => {
    if (!text.trim()) {
      toast("There is no text to download yet.", "error");
      return;
    }
    setBusy(kind);
    try {
      if (kind === "txt") downloadTxt(text, baseName);
      if (kind === "docx") await downloadDocx(text, baseName);
      if (kind === "pdf") await downloadTextPdf(text, baseName);
      toast("File downloaded", "success");
    } catch {
      toast("We couldn't create the file. Please try again.", "error");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mt-6 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Extracted text</h3>
        <div className="flex flex-wrap gap-1.5">
          <CopyButton text={text} />
          <Button size="sm" variant="outline" icon={<FileDown className="h-3.5 w-3.5" />} loading={busy === "txt"} onClick={() => download("txt")}>
            TXT
          </Button>
          <Button size="sm" variant="outline" icon={<FileText className="h-3.5 w-3.5" />} loading={busy === "docx"} onClick={() => download("docx")}>
            DOCX
          </Button>
          <Button size="sm" variant="outline" icon={<FileArchive className="h-3.5 w-3.5" />} loading={busy === "pdf"} onClick={() => download("pdf")}>
            PDF
          </Button>
          <Button size="sm" variant="ghost" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={onClear}>
            Clear
          </Button>
        </div>
      </div>
      <TextArea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        className="font-mono text-sm"
        aria-label="Extracted text (editable)"
      />
    </div>
  );
}

/* ------------------------------------------------------------- ImageToText */

export function ImageToText() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [lang, setLang] = useState("eng");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState("");

  const run = async () => {
    if (!dataUrl) {
      toast("Please add an image first.", "error");
      return;
    }
    setProcessing(true);
    setProgress(0);
    setText("");
    try {
      const result = await runOcr(dataUrl, lang, setProgress);
      setText(result);
      toast(result.trim() ? "Text extracted successfully" : "No text was found in this image", result.trim() ? "success" : "info");
    } catch (err) {
      console.error(err);
      toast("We couldn't extract text from this image. Please try a clearer image.", "error");
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setDataUrl(null);
    setText("");
    setProgress(0);
  };

  return (
    <div>
      {!file ? (
        <FileUploader
          accept=".jpg,.jpeg,.png,.webp,.bmp"
          formats={["JPG", "PNG", "WebP", "BMP"]}
          multiple={false}
          hint="Clear, high-resolution images with straight text give the best results."
          onFiles={async (files) => {
            const f = files[0];
            setFile(f);
            setDataUrl(await fileToDataUrl(f));
          }}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
            {dataUrl && <img src={dataUrl} alt="Image to extract text from" className="h-20 w-20 rounded-lg object-cover" />}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{file.name}</p>
              <Button variant="ghost" size="sm" onClick={reset}>Change image</Button>
            </div>
          </div>

          {text === "" && (
            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
              <Field label="Text language" htmlFor="ocr-lang">
                <Select id="ocr-lang" value={lang} onChange={(e) => setLang(e.target.value)}>
                  {OCR_LANGS.map((l) => (
                    <option key={l.id} value={l.id}>{l.label}</option>
                  ))}
                </Select>
              </Field>
              <div className="flex flex-wrap gap-2">
                <Button onClick={run} loading={processing} icon={<ScanText className="h-4 w-4" />}>
                  Extract text
                </Button>
                <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={reset}>
                  Reset
                </Button>
              </div>
              {processing && (
                <ProgressBar
                  value={progress}
                  label={progress === 0 ? "Loading OCR engine…" : `Reading text… ${progress}%`}
                />
              )}
            </div>
          )}

          {text !== "" && (
            <TextResult text={text} setText={setText} baseName={stripExtension(file.name)} onClear={() => { setText(""); }} />
          )}
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- PdfToText */

export function PdfToText() {
  const { file, doc, error, loading, handleFile, reset } = usePdfFile();
  const { toast } = useToast();
  const [lang, setLang] = useState("eng");
  const [mode, setMode] = useState<"searchable" | "ocr">("searchable");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState("");

  const run = async () => {
    if (!file) {
      toast("Please add a PDF file first.", "error");
      return;
    }
    setProcessing(true);
    setProgress(0);
    setText("");
    try {
      if (mode === "searchable") {
        const pdfjs = await loadPdfJsSafe();
        const src = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
        let out = "";
        for (let i = 1; i <= src.numPages; i++) {
          const page = await src.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items
            .map((item) => ("str" in item ? (item as { str: string }).str : ""))
            .join(" ")
            .replace(/\s+/g, " ")
            .trim();
          out += (pageText ? pageText + "\n\n" : "") ;
          setProgress(Math.round((i / src.numPages) * 100));
        }
        setText(out.trim());
        toast(out.trim() ? "Text extracted from the PDF" : "No searchable text found — try the OCR mode for scanned pages.", out.trim() ? "success" : "info");
      } else {
        const pdfjs = await loadPdfJsSafe();
        const src = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
        let out = "";
        const scale = 2;
        for (let i = 1; i <= src.numPages; i++) {
          const page = await src.getPage(i);
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          await page.render({ canvasContext: ctx, viewport } as never).promise;
          const pageText = await runOcr(canvas.toDataURL("image/jpeg", 0.9), lang, () => {});
          out += pageText.trim() + "\n\n";
          setProgress(Math.round((i / src.numPages) * 100));
        }
        setText(out.trim());
        toast(out.trim() ? "Text extracted from the scanned PDF" : "No text was recognized. Try a higher-quality scan.", out.trim() ? "success" : "info");
      }
    } catch (err) {
      console.error(err);
      toast("We couldn't extract text from this PDF. Please make sure it is a valid PDF and try again.", "error");
    } finally {
      setProcessing(false);
    }
  };

  const resetAll = () => {
    reset();
    setText("");
  };

  return (
    <div>
      {!file ? (
        <FileUploader
          accept=".pdf"
          formats={["PDF"]}
          multiple={false}
          hint="Digital PDFs extract instantly. Use OCR mode for scanned pages."
          onFiles={handleFile}
          disabled={loading}
        />
      ) : (
        <div className="space-y-4">
          <PdfFileCard name={file.name} size={file.size} pageCount={doc ? doc.getPageCount() : null} onReset={resetAll} error={error} />

          {doc && text === "" && (
            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
              <Tabs
                tabs={[
                  { id: "searchable", label: "Searchable text" },
                  { id: "ocr", label: "OCR (scanned pages)" },
                ]}
                active={mode}
                onChange={(m) => setMode(m)}
              />
              {mode === "ocr" && (
                <Field label="Text language" htmlFor="pdf-ocr-lang">
                  <Select id="pdf-ocr-lang" value={lang} onChange={(e) => setLang(e.target.value)}>
                    {OCR_LANGS.map((l) => (
                      <option key={l.id} value={l.id}>{l.label}</option>
                    ))}
                  </Select>
                </Field>
              )}
              <div className="flex flex-wrap gap-2">
                <Button onClick={run} loading={processing} icon={mode === "ocr" ? <ScanLine className="h-4 w-4" /> : <FileText className="h-4 w-4" />}>
                  {mode === "ocr" ? "Extract with OCR" : "Extract text"}
                </Button>
                <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={resetAll}>
                  Reset
                </Button>
              </div>
              {processing && <ProgressBar value={progress} label={mode === "ocr" ? "Recognizing pages…" : "Reading pages…"} />}
            </div>
          )}

          {text !== "" && (
            <TextResult text={text} setText={setText} baseName={stripExtension(file.name)} onClear={() => setText("")} />
          )}
        </div>
      )}
    </div>
  );
}

/** Load pdf.js and return it (shared by the PDF tools). */
async function loadPdfJsSafe() {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  return pdfjs;
}
