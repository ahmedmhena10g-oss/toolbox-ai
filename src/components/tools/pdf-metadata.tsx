"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import FileUploader from "../upload/FileUploader";
import { usePdfFile } from "@/lib/usePdfFile";
import { formatBytes } from "@/lib/utils";
import { useToast } from "../ui/Toast";
import { Button } from "../ui/feedback";
import { CopyButton } from "../ui/feedback";
import { PdfFileCard } from "./pdf-shared";

export default function PdfMetadata() {
  const { file, doc, error, loading, handleFile, reset } = usePdfFile();
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);

  if (!file) {
    return (
      <FileUploader
        accept=".pdf"
        formats={["PDF"]}
        multiple={false}
        hint="The metadata is read locally in your browser — nothing is uploaded."
        onFiles={handleFile}
        disabled={loading}
      />
    );
  }

  const rows: { label: string; value: string | null }[] = [
    { label: "Title", value: doc?.getTitle() ?? null },
    { label: "Author", value: doc?.getAuthor() ?? null },
    { label: "Subject", value: doc?.getSubject() ?? null },
    { label: "Keywords", value: doc?.getKeywords() ?? null },
    { label: "Creator", value: doc?.getCreator() ?? null },
    { label: "Producer", value: doc?.getProducer() ?? null },
    { label: "Created", value: doc?.getCreationDate() ? formatPdfDate(doc.getCreationDate() as Date) : null },
    { label: "Modified", value: doc?.getModificationDate() ? formatPdfDate(doc.getModificationDate() as Date) : null },
    { label: "Pages", value: doc ? String(doc.getPageCount()) : null },
    { label: "File size", value: formatBytes(file.size) },
    { label: "Encrypted", value: doc ? (doc.isEncrypted ? "Yes" : "No") : null },
  ];

  return (
    <div className="space-y-4">
      <PdfFileCard name={file.name} size={file.size} pageCount={doc ? doc.getPageCount() : null} onReset={reset} error={error} />

      {doc && (
        <>
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
            <dl className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {rows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4 bg-white px-4 py-3 dark:bg-slate-800/50">
                  <dt className="w-28 shrink-0 text-sm font-medium text-slate-500 dark:text-slate-400">{row.label}</dt>
                  <dd className="min-w-0 flex-1 truncate text-right text-sm text-slate-800 dark:text-slate-100">
                    {row.value || <span className="text-slate-300 dark:text-slate-600">—</span>}
                  </dd>
                  {row.value && (
                    <CopyButton
                      text={row.value}
                      label=""
                      className="h-8 w-8 border-none px-0 py-0"
                    />
                  )}
                </div>
              ))}
            </dl>
          </div>
          <p className="text-xs text-slate-400">
            Only metadata already stored in the file is shown. No sensitive information is exposed beyond what the
            document itself contains.
          </p>
          <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={reset}>
            View another PDF
          </Button>
        </>
      )}
    </div>
  );
}

const formatPdfDate = (date: Date): string => {
  try {
    return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return String(date);
  }
};
