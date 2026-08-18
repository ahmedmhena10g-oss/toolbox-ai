"use client";

import { useCallback, useState } from "react";
import { fileToDataUrl, uid } from "./utils";
import { loadImage, type LoadedImage } from "./image";

export interface ImageEntry {
  id: string;
  file: File;
  name: string;
  size: number;
  dataUrl: string;
  loaded: LoadedImage | null;
  error?: string;
}

export function useImageFiles(maxFiles = 10) {
  const [entries, setEntries] = useState<ImageEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const addFiles = useCallback(
    async (files: File[]) => {
      const room = maxFiles - entries.length;
      const accepted = files.slice(0, room);
      if (accepted.length < files.length) {
        // Let the caller surface the limit; we silently keep the first N.
      }
      setLoading(true);
      try {
        const next = await Promise.all(
          accepted.map(async (file): Promise<ImageEntry> => {
            try {
              const dataUrl = await fileToDataUrl(file);
              const loaded = await loadImage(dataUrl);
              return {
                id: uid(),
                file,
                name: file.name,
                size: file.size,
                dataUrl,
                loaded,
              };
            } catch (err) {
              return {
                id: uid(),
                file,
                name: file.name,
                size: file.size,
                dataUrl: "",
                loaded: null,
                error: err instanceof Error ? err.message : "Could not read this image.",
              };
            }
          })
        );
        setEntries((prev) => [...prev, ...next]);
      } finally {
        setLoading(false);
      }
    },
    [entries.length, maxFiles]
  );

  const remove = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clear = useCallback(() => setEntries([]), []);

  const reorder = useCallback((from: number, to: number) => {
    setEntries((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }, []);

  return { entries, addFiles, remove, clear, reorder, loading, setEntries };
}
