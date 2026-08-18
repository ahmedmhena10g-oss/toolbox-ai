"use client";

import { useCallback, useState } from "react";
import type { PDFDocument } from "pdf-lib";
import { loadPdfLib } from "./pdf";

export function usePdfFile() {
  const [file, setFile] = useState<File | null>(null);
  const [doc, setDoc] = useState<PDFDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = useCallback(async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setError(null);
    setLoading(true);
    try {
      const { PDFDocument } = await loadPdfLib();
      const bytes = await f.arrayBuffer();
      const loaded = await PDFDocument.load(bytes, { ignoreEncryption: true });
      setDoc(loaded);
    } catch {
      setError("We couldn't read this file. Please make sure it is a valid PDF and try again.");
      setDoc(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setFile(null);
    setDoc(null);
    setError(null);
  }, []);

  return { file, doc, error, loading, handleFile, reset };
}
