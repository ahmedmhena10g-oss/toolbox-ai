"use client";

import { forwardRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2, Copy, Check, Download, AlertTriangle as AlertTriangleIcon } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";
import { useToast } from "./Toast";

/* ------------------------------------------------------------------ Button */

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white shadow-sm hover:bg-brand-700 focus-visible:ring-brand-500 disabled:bg-brand-300 dark:disabled:bg-brand-800",
  secondary:
    "bg-slate-100 text-slate-800 hover:bg-slate-200 focus-visible:ring-slate-400 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
  outline:
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-brand-500 dark:border-slate-600 dark:bg-transparent dark:text-slate-200 dark:hover:bg-slate-800",
  ghost:
    "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-400 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
  danger:
    "bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500 disabled:bg-red-300",
  success:
    "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 focus-visible:ring-emerald-500 disabled:bg-emerald-300",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading = false, icon, className = "", children, disabled, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`inline-flex select-none items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-slate-900 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  );
});

/* ------------------------------------------------------------- ProgressBar */

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full" role="progressbar" aria-valuenow={Math.round(clamped)} aria-valuemin={0} aria-valuemax={100} aria-label={label ?? "Progress"}>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className="h-full rounded-full bg-brand-600 transition-[width] duration-200 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
      {label ? <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{label}</p> : null}
    </div>
  );
}

/* ------------------------------------------------------------ ErrorMessage */

export function ErrorMessage({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
    >
      <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{children}</p>
    </div>
  );
}

/* ----------------------------------------------------------------- Spinner */

export function Spinner({ label = "Processing…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10" role="status">
      <Loader2 className="h-8 w-8 animate-spin text-brand-600 dark:text-brand-400" aria-hidden />
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

/* -------------------------------------------------------------- CopyButton */

export function CopyButton({ text, label = "Copy", className = "" }: { text: string; label?: string; className?: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      toast("Copied to clipboard", "success");
      setTimeout(() => setCopied(false), 1600);
    } else {
      toast("Couldn't access the clipboard", "error");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-slate-600 dark:bg-transparent dark:text-slate-200 dark:hover:bg-slate-800 ${className}`}
    >
      {copied ? <Check className="h-4 w-4 text-emerald-500" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
      {copied ? "Copied" : label}
    </button>
  );
}

/* ---------------------------------------------------------- DownloadButton */

export function DownloadButton({
  href,
  download,
  label = "Download",
  onClick,
  disabled = false,
  className = "",
}: {
  href?: string;
  download: string;
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const base =
    "inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-slate-900";
  if (href) {
    return (
      <a href={href} download={download} className={`${base} ${className}`}>
        <Download className="h-4 w-4" aria-hidden />
        {label}
      </a>
    );
  }
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={`${base} ${className}`}>
      <Download className="h-4 w-4" aria-hidden />
      {label}
    </button>
  );
}
