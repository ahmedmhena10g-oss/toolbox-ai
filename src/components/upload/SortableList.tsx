"use client";

import { useState, type ReactNode } from "react";
import { GripVertical, X, ArrowUp, ArrowDown } from "lucide-react";

export interface SortableItem {
  id: string;
  name: string;
  meta?: string;
  thumbnail?: string;
}

export default function SortableList({
  items,
  onReorder,
  onRemove,
  getMeta,
  renderThumbnail,
}: {
  items: SortableItem[];
  onReorder: (from: number, to: number) => void;
  onRemove: (id: string) => void;
  getMeta?: (item: SortableItem) => string;
  renderThumbnail?: (item: SortableItem) => ReactNode;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const move = (from: number, to: number) => {
    if (from === to || to < 0 || to >= items.length) return;
    onReorder(from, to);
  };

  return (
    <ul className="space-y-2" aria-label="Files (drag to reorder)">
      {items.map((item, index) => (
        <li
          key={item.id}
          draggable
          onDragStart={() => setDragIndex(index)}
          onDragOver={(e) => {
            e.preventDefault();
            setOverIndex(index);
          }}
          onDragLeave={() => setOverIndex((o) => (o === index ? null : o))}
          onDrop={(e) => {
            e.preventDefault();
            if (dragIndex !== null) move(dragIndex, index);
            setDragIndex(null);
            setOverIndex(null);
          }}
          onDragEnd={() => {
            setDragIndex(null);
            setOverIndex(null);
          }}
          className={`group flex items-center gap-3 rounded-xl border bg-white p-2.5 pr-3 shadow-sm transition-colors dark:bg-slate-800/60 ${
            overIndex === index && dragIndex !== null && dragIndex !== index
              ? "border-brand-500 ring-2 ring-brand-500/30"
              : "border-slate-200 dark:border-slate-700"
          } ${dragIndex === index ? "opacity-50" : ""}`}
        >
          <span
            className="cursor-grab touch-none rounded-md p-1 text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400"
            aria-hidden
          >
            <GripVertical className="h-4 w-4" />
          </span>
          <span className="w-5 text-center text-xs font-semibold text-slate-400">{index + 1}</span>
          {renderThumbnail?.(item)}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{item.name}</p>
            {getMeta && <p className="text-xs text-slate-400">{getMeta(item)}</p>}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label={`Move ${item.name} up`}
              disabled={index === 0}
              onClick={() => move(index, index - 1)}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 dark:hover:bg-slate-700"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              aria-label={`Move ${item.name} down`}
              disabled={index === items.length - 1}
              onClick={() => move(index, index + 1)}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 dark:hover:bg-slate-700"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              aria-label={`Remove ${item.name}`}
              onClick={() => onRemove(item.id)}
              className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
