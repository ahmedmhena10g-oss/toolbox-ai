"use client";

import { useCallback, useRef, useState, type DragEvent, type ReactNode } from "react";
import { UploadCloud, X } from "lucide-react";
import { useToast } from "../ui/Toast";
import { formatBytes } from "@/lib/utils";

export interface FileUploaderProps {
  /** Comma-separated accept list passed to the file input, e.g. ".jpg,.jpeg,.png". */
  accept: string;
  /** Human readable formats for the hint, e.g. ["JPG", "PNG"]. */
  formats?: string[];
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  onFiles: (files: File[]) => void;
  disabled?: boolean;
  compact?: boolean;
  hint?: string;
  children?: ReactNode;
}

const DEFAULT_MAX_SIZE_MB = 50;

export default function FileUploader({
  accept,
  formats,
  multiple = false,
  maxFiles = 10,
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  onFiles,
  disabled = false,
  compact = false,
  hint,
  children,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const acceptedExtensions = accept
    .split(",")
    .map((a) => a.trim().toLowerCase().replace(/^\./, ""))
    .filter(Boolean);

  const validate = useCallback(
    (files: File[]): File[] => {
      setError(null);
      const valid: File[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
        if (acceptedExtensions.length > 0 && !acceptedExtensions.includes(ext)) {
          toast(
            `We couldn't process "${file.name}". Please use a supported format (${(formats ?? acceptedExtensions).join(", ")}).`,
            "error"
          );
          continue;
        }
        if (file.size > maxSizeMB * 1024 * 1024) {
          toast(
            `"${file.name}" is larger than ${maxSizeMB} MB. Please upload a smaller file.`,
            "error"
          );
          continue;
        }
        valid.push(file);
      }
      return valid;
    },
    [acceptedExtensions, formats, maxSizeMB, toast]
  );

  const handleFiles = (incoming: FileList | File[]) => {
    if (disabled) return;
    const list = Array.from(incoming);
    if (list.length === 0) return;
    const valid = validate(list);
    if (valid.length === 0) return;
    if (!multiple && valid.length > 1) {
      valid.splice(1);
    }
    onFiles(valid);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  };

  const formatHint =
    hint ??
    `Drag & drop ${multiple ? "your files" : "a file"} here, or click to browse. ${
      formats?.length ? `Supported: ${formats.join(", ")}.` : ""
    } ${multiple ? `Up to ${maxFiles} files, ` : ""}Max ${maxSizeMB} MB.`;

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload files"
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!disabled) inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`group relative flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
          dragging
            ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
            : "border-slate-300 bg-white hover:border-brand-400 hover:bg-brand-50/40 dark:border-slate-600 dark:bg-slate-800/40 dark:hover:border-brand-600 dark:hover:bg-slate-800"
        } ${compact ? "px-4 py-6" : "px-6 py-12"} ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
      >
        <span
          className={`flex items-center justify-center rounded-full bg-brand-100 text-brand-600 transition-transform group-hover:scale-105 dark:bg-brand-500/15 dark:text-brand-300 ${
            compact ? "h-10 w-10" : "h-14 w-14"
          }`}
        >
          <UploadCloud className={compact ? "h-5 w-5" : "h-7 w-7"} aria-hidden />
        </span>
        <p className={`mt-3 text-sm font-semibold text-slate-800 dark:text-slate-100 ${compact ? "mt-2" : ""}`}>
          {compact ? "Choose file" : "Drag & drop your files here"}
        </p>
        {!compact && (
          <>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              or <span className="font-medium text-brand-600 dark:text-brand-400">browse from your device</span>
            </p>
            <p className="mt-3 max-w-md text-center text-xs leading-relaxed text-slate-400 dark:text-slate-500">
              {formatHint}
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = "";
          }}
          disabled={disabled}
        />
      </div>
      {children}
      {error && (
        <p role="alert" className="mt-2 flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400">
          <X className="h-4 w-4" aria-hidden /> {error}
        </p>
      )}
    </div>
  );
}
