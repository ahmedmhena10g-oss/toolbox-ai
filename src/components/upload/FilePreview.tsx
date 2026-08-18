"use client";

import { X, FileText } from "lucide-react";
import { formatBytes } from "@/lib/utils";

export interface PreviewEntry {
  id: string;
  name: string;
  size: number;
  dataUrl?: string;
  isImage?: boolean;
  badge?: string;
}

export default function FilePreview({
  entry,
  onRemove,
  index,
}: {
  entry: PreviewEntry;
  onRemove?: (id: string) => void;
  index?: number;
}) {
  const isImage = entry.isImage ?? (entry.dataUrl?.startsWith("data:image") ?? false);
  return (
    <div className="group relative flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5 pr-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
      {isImage && entry.dataUrl ? (
        <img
          src={entry.dataUrl}
          alt={`Preview of ${entry.name}`}
          className="h-12 w-12 shrink-0 rounded-lg object-cover"
          loading="lazy"
        />
      ) : (
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 dark:bg-slate-700">
          <FileText className="h-5 w-5" aria-hidden />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
          {index !== undefined ? `${index + 1}. ` : ""}
          {entry.name}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {formatBytes(entry.size)}
          {entry.badge ? ` · ${entry.badge}` : ""}
        </p>
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(entry.id)}
          aria-label={`Remove ${entry.name}`}
          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
