"use client";

import { useState } from "react";
import { RefreshCw, Unlock, FileDown } from "lucide-react";
import FileUploader from "../upload/FileUploader";
import { downloadBlob, formatBytes, uint8ToBlob } from "@/lib/utils";
import { useToast } from "../ui/Toast";
import { Button, ProgressBar } from "../ui/feedback";
import { Field, TextInput } from "../ui/form";

export default function PdfUnlock() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const unlock = async () => {
    if (!file) {
      toast("Please add a PDF file first.", "error");
      return;
    }
    setProcessing(true);
    setMessage(null);
    setProgress(25);
    try {
      const { PDFDocument } = await import("pdf-lib-with-encrypt");
      const bytes = await file.arrayBuffer();

      // Try to open the document. If it is not truly encrypted, this succeeds
      // without a password and any restriction flags are simply dropped.
      let doc;
      try {
        doc = await PDFDocument.load(bytes, { password });
      } catch {
        setMessage("This PDF is password-protected. Enter the password to unlock it.");
        return;
      }

      // Rebuild the document into a fresh, unprotected PDF.
      setProgress(60);
      const fresh = await PDFDocument.create();
      const pages = await fresh.copyPages(doc, doc.getPageIndices());
      pages.forEach((page) => fresh.addPage(page));
      const out = await fresh.save();
      setProgress(100);
      const blob = uint8ToBlob(out, "application/pdf");
      downloadBlob(blob, file.name.replace(/\.pdf$/i, "-unlocked.pdf"));
      setMessage(null);
      toast("PDF unlocked and downloaded", "success");
    } catch (err) {
      console.error(err);
      setMessage("The password is incorrect, or this file cannot be unlocked. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPassword("");
    setMessage(null);
  };

  return (
    <div>
      {!file ? (
        <FileUploader
          accept=".pdf"
          formats={["PDF"]}
          multiple={false}
          hint="Only unlock files you own or have permission to modify. Files without a real password (restriction flags only) are unlocked automatically."
          onFiles={(files) => setFile(files[0])}
        />
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-500 dark:bg-amber-500/10">
                <Unlock className="h-6 w-6" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{file.name}</p>
                <p className="text-xs text-slate-400">{formatBytes(file.size)}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={reset}>Change file</Button>
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
            <Field label="Password (if the file is encrypted)" htmlFor="pdf-password">
              <TextInput
                id="pdf-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="off"
                placeholder="Enter the PDF password"
              />
            </Field>
            {message && (
              <p role="alert" className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                {message}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button onClick={unlock} loading={processing} icon={<Unlock className="h-4 w-4" />}>
                Unlock PDF
              </Button>
              <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={reset}>
                Reset
              </Button>
            </div>
            {processing && <ProgressBar value={progress} label="Decrypting your PDF…" />}
            <p className="text-xs text-slate-400">
              This tool cannot bypass unknown passwords. It only removes protection from files you open with the
              correct password, or files that are marked restricted but aren&apos;t truly encrypted.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
