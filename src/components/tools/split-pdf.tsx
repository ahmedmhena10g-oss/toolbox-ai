"use client";

import { useMemo, useState } from "react";
import { RefreshCw, Scissors, FileDown, FileArchive } from "lucide-react";
import FileUploader from "../upload/FileUploader";
import { usePdfFile } from "@/lib/usePdfFile";
import { loadPdfLib, resolvePageSelection, extractPagesToNewPdf, type PageRangeInput } from "@/lib/pdf";
import { downloadBlob, loadJszip, stripExtension, uint8ToBlob } from "@/lib/utils";
import { useToast } from "../ui/Toast";
import { Button, ProgressBar } from "../ui/feedback";
import { Field, Select, Tabs, TextInput } from "../ui/form";
import { PdfFileCard, ThumbGrid, usePdfThumbs, PdfThumbLoader } from "./pdf-shared";

type Mode = "selected" | "every" | "ranges";

function SplitExtractPdf({ defaultMode, isExtractor }: { defaultMode: Mode; isExtractor?: boolean }) {
  const { file, doc, error, loading, handleFile, reset } = usePdfFile();
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [selection, setSelection] = useState<string>(isExtractor ? "" : "");
  const [rangeSize, setRangeSize] = useState("5");
  const [thumbSelection, setThumbSelection] = useState<Set<number>>(new Set());
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { thumbs, ready } = usePdfThumbs(file);

  const pageCount = doc?.getPageCount() ?? 0;
  const selectedThumbs = useMemo(() => [...thumbSelection].sort((a, b) => a - b), [thumbSelection]);

  const toggleThumb = (number: number) => {
    setThumbSelection((prev) => {
      const next = new Set(prev);
      if (next.has(number)) next.delete(number);
      else next.add(number);
      return next;
    });
  };

  const run = async () => {
    if (!doc || !file) {
      toast("Please add a PDF file first.", "error");
      return;
    }
    const input: PageRangeInput = {
      mode: mode === "selected" ? "selected" : "all",
      selectedPages: thumbSelection.size > 0 ? selectedThumbs.join(",") : selection,
      rangeSize: parseInt(rangeSize, 10) || 5,
    };
    const pages = resolvePageSelection(input, pageCount);
    if (pages.length === 0) {
      toast("No pages selected. Choose pages to continue.", "error");
      return;
    }
    setProcessing(true);
    setProgress(10);
    try {
      if (mode === "selected") {
        const bytes = await extractPagesToNewPdf(doc, pages);
        const blob = uint8ToBlob(bytes, "application/pdf");
        downloadBlob(blob, `${stripExtension(file.name)}-pages-${pages[0]}-${pages[pages.length - 1]}.pdf`);
        toast(`Created a new PDF with ${pages.length} page${pages.length === 1 ? "" : "s"}`, "success");
      } else {
        const JSZip = await loadJszip();
        const zip = new JSZip();
        if (mode === "every") {
          for (let i = 0; i < pages.length; i++) {
            const bytes = await extractPagesToNewPdf(doc, [pages[i]]);
            zip.file(`${stripExtension(file.name)}-page-${pages[i]}.pdf`, bytes);
            setProgress(15 + Math.round((i / pages.length) * 80));
          }
        } else {
          const size = Math.max(1, parseInt(rangeSize, 10) || 5);
          const chunks: number[][] = [];
          for (let i = 0; i < pages.length; i += size) chunks.push(pages.slice(i, i + size));
          for (let c = 0; c < chunks.length; c++) {
            const bytes = await extractPagesToNewPdf(doc, chunks[c]);
            zip.file(`${stripExtension(file.name)}-part-${c + 1}.pdf`, bytes);
            setProgress(15 + Math.round((c / chunks.length) * 80));
          }
        }
        const zipBlob = await zip.generateAsync({ type: "blob" });
        setProgress(100);
        downloadBlob(zipBlob, `${stripExtension(file.name)}-split.zip`);
        toast(`Split the PDF into ${mode === "every" ? pages.length : Math.ceil(pages.length / (parseInt(rangeSize, 10) || 5))} file${mode === "every" && pages.length === 1 ? "" : "s"}`, "success");
      }
    } catch (err) {
      console.error(err);
      toast("We couldn't split this PDF. The file may be password-protected or corrupted.", "error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      {!file ? (
        <FileUploader accept=".pdf" formats={["PDF"]} multiple={false} onFiles={handleFile} disabled={loading} />
      ) : (
        <div className="space-y-4">
          <PdfFileCard name={file.name} size={file.size} pageCount={doc ? doc.getPageCount() : null} onReset={reset} error={error} />

          {doc && (
            <>
              {isExtractor ? (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Select the pages to extract
                  </h3>
                  <PdfThumbLoader busy={!ready} />
                  {ready && (
                    <ThumbGrid
                      thumbs={thumbs}
                      onToggle={toggleThumb}
                      onSelectAll={() => setThumbSelection(new Set(thumbs.map((t) => t.number)))}
                      onClear={() => setThumbSelection(new Set())}
                    />
                  )}
                  <p className="mt-2 text-xs text-slate-400">
                    {selectedThumbs.length > 0
                      ? `${selectedThumbs.length} page${selectedThumbs.length === 1 ? "" : "s"} selected: ${selectedThumbs.join(", ")}`
                      : "Click pages to select them."}
                  </p>
                </div>
              ) : (
                <>
                  <Tabs
                    tabs={[
                      { id: "selected", label: "Extract pages" },
                      { id: "every", label: "Every page" },
                      { id: "ranges", label: "By ranges" },
                    ]}
                    active={mode}
                    onChange={(m) => setMode(m)}
                  />
                  {mode === "selected" && (
                    <div className="space-y-3">
                      <Field label="Pages to extract (e.g. 2-4, 7)" htmlFor="pages">
                        <TextInput id="pages" value={selection} onChange={(e) => setSelection(e.target.value)} placeholder="1-3, 5, 8" />
                      </Field>
                      <PdfThumbLoader busy={!ready} />
                      {ready && (
                        <ThumbGrid
                          thumbs={thumbs}
                          onToggle={toggleThumb}
                          onSelectAll={() => setThumbSelection(new Set(thumbs.map((t) => t.number)))}
                          onClear={() => setThumbSelection(new Set())}
                        />
                      )}
                    </div>
                  )}
                  {mode === "every" && (
                    <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      Every page will be saved as its own PDF file ({pageCount} files), downloaded as a ZIP archive.
                    </p>
                  )}
                  {mode === "ranges" && (
                    <Field label="Pages per file" htmlFor="range-size">
                      <TextInput id="range-size" type="number" min={1} max={50} value={rangeSize} onChange={(e) => setRangeSize(e.target.value)} className="w-32" />
                    </Field>
                  )}
                </>
              )}

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={run}
                  loading={processing}
                  icon={mode === "selected" ? <FileDown className="h-4 w-4" /> : <FileArchive className="h-4 w-4" />}
                >
                  {isExtractor
                    ? "Extract pages"
                    : mode === "selected"
                    ? "Extract into one PDF"
                    : mode === "every"
                    ? `Split into ${pageCount} files`
                    : "Split by ranges"}
                </Button>
                <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={reset}>
                  Reset
                </Button>
              </div>
              {processing && <ProgressBar value={progress} label="Splitting pages…" />}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function SplitPdf() {
  return <SplitExtractPdf defaultMode="selected" />;
}

export function ExtractPages() {
  return <SplitExtractPdf defaultMode="selected" isExtractor />;
}
