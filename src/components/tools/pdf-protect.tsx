"use client";

import { useState } from "react";
import { RefreshCw, Lock, FileDown } from "lucide-react";
import FileUploader from "../upload/FileUploader";
import { usePdfFile } from "@/lib/usePdfFile";
import { downloadBlob, uint8ToBlob } from "@/lib/utils";
import { useToast } from "../ui/Toast";
import { Button, ProgressBar } from "../ui/feedback";
import { Field, TextInput } from "../ui/form";
import { PdfFileCard } from "./pdf-shared";

export default function PdfProtect() {
  const { file, doc, error, loading, handleFile, reset } = usePdfFile();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const protect = async () => {
    if (!file) {
      toast("Please add a PDF file first.", "error");
      return;
    }
    if (password.length < 6) {
      toast("Please use a password with at least 6 characters.", "error");
      return;
    }
    if (password !== confirm) {
      toast("The passwords don't match. Please try again.", "error");
      return;
    }
    setProcessing(true);
    setProgress(20);
    try {
      const { PDFDocument } = await import("pdf-lib-with-encrypt");
      const loaded = await PDFDocument.load(await file.arrayBuffer());
      setProgress(50);
      await loaded.encrypt({
        userPassword: password,
        ownerPassword: password,
        permissions: {
          printing: "highResolution",
          modifying: false,
          copying: false,
          annotating: false,
        },
      });
      const bytes = await loaded.save();
      setProgress(100);
      const blob = uint8ToBlob(bytes, "application/pdf");
      downloadBlob(blob, file.name.replace(/\.pdf$/i, "-protected.pdf"));
      toast("PDF encrypted successfully — keep your password safe", "success");
    } catch (err) {
      console.error(err);
      toast("We couldn't protect this PDF. Please try again.", "error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      {!file ? (
        <FileUploader
          accept=".pdf"
          formats={["PDF"]}
          multiple={false}
          hint="The file is encrypted locally in your browser. The password is never sent anywhere."
          onFiles={handleFile}
          disabled={loading}
        />
      ) : (
        <div className="space-y-4">
          <PdfFileCard name={file.name} size={file.size} pageCount={doc ? doc.getPageCount() : null} onReset={reset} error={error} />
          {doc && (
            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
              <Field label="Password (at least 6 characters)" htmlFor="password">
                <TextInput
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Choose a strong password"
                />
              </Field>
              <Field label="Confirm password" htmlFor="confirm">
                <TextInput
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Repeat the password"
                />
              </Field>
              <p className="text-xs text-slate-400">
                The document will be encrypted so that it requires this password to open. Anyone with the password can
                open it; there is no way to recover a forgotten password.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={protect} loading={processing} icon={<Lock className="h-4 w-4" />}>
                  Protect PDF
                </Button>
                <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={reset}>
                  Reset
                </Button>
              </div>
              {processing && <ProgressBar value={progress} label="Encrypting your PDF…" />}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
