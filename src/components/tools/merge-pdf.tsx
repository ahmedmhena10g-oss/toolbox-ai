"use client";

import { useCallback, useState } from "react";
import { RefreshCw, FileDown } from "lucide-react";
import FileUploader from "../upload/FileUploader";
import SortableList from "../upload/SortableList";
import { loadPdfLib, mergePdfs } from "@/lib/pdf";
import { downloadBlob, formatBytes, uid, uint8ToBlob } from "@/lib/utils";
import { useToast } from "../ui/Toast";
import { Button, ProgressBar } from "../ui/feedback";

interface PdfEntry {
  id: string;
  file: File;
  pageCount: number;
}

export default function MergePdf() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<PdfEntry[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const addFiles = useCallback(
    async (files: File[]) => {
      const { PDFDocument } = await loadPdfLib();
      const next: PdfEntry[] = [];
      for (const file of files) {
        try {
          const bytes = await file.arrayBuffer();
          const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
          next.push({ id: uid(), file, pageCount: doc.getPageCount() });
        } catch {
          toast(`We couldn't read "${file.name}". Please make sure it is a valid PDF and try again.`, "error");
        }
      }
      setEntries((prev) => [...prev, ...next]);
    },
    [toast]
  );

  const remove = useCallback((id: string) => setEntries((prev) => prev.filter((e) => e.id !== id)), []);
  const reorder = useCallback((from: number, to: number) => {
    setEntries((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }, []);

  const merge = async () => {
    if (entries.length < 2) {
      toast("Please add at least two PDF files to merge.", "error");
      return;
    }
    setProcessing(true);
    setProgress(15);
    try {
      const { PDFDocument } = await loadPdfLib();
      const docs = [];
      for (let i = 0; i < entries.length; i++) {
        const bytes = await entries[i].file.arrayBuffer();
        docs.push(await PDFDocument.load(bytes, { ignoreEncryption: true }));
        setProgress(20 + Math.round((i / entries.length) * 60));
      }
      setProgress(80);
      const bytes = await mergePdfs(docs);
      const blob = uint8ToBlob(bytes, "application/pdf");
      setProgress(100);
      downloadBlob(blob, "merged-document.pdf");
      toast(`Merged ${entries.length} PDFs into one document`, "success");
    } catch (err) {
      console.error(err);
      toast("We couldn't merge these PDFs. One of the files may be password-protected.", "error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <FileUploader
        accept=".pdf"
        formats={["PDF"]}
        multiple
        maxFiles={20}
        hint="Upload two or more PDFs, then drag them into the order you want."
        onFiles={(files) => addFiles(files)}
        disabled={processing}
      />

      {entries.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            PDFs to merge — drag to set the order
          </h3>
          <SortableList
            items={entries.map((e) => ({ id: e.id, name: e.file.name }))}
            onReorder={reorder}
            onRemove={remove}
            getMeta={(item) => {
              const entry = entries.find((e) => e.id === item.id);
              return entry ? `${formatBytes(entry.file.size)} · ${entry.pageCount} pages` : "";
            }}
          />
        </div>
      )}

      {entries.length > 0 && (
        <div className="mt-5 space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button onClick={merge} loading={processing} icon={<FileDown className="h-4 w-4" />}>
              Merge PDFs
            </Button>
            <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={() => setEntries([])}>
              Reset
            </Button>
          </div>
          {processing && <ProgressBar value={progress} label="Merging documents…" />}
        </div>
      )}
    </div>
  );
}
