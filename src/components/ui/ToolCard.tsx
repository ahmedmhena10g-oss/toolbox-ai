"use client";

import { ArrowRight } from "lucide-react";
import type { ToolConfig } from "@/lib/tools";
import { getIcon } from "../icons";
import { useLocale } from "../i18n/LocaleProvider";
import { useLocalizedHref } from "../i18n/LocalizedLink";
import { localizeTool } from "@/lib/ar-content";
import { CategoryBadge } from "./seo-client";

export default function ToolCard({ tool }: { tool: ToolConfig }) {
  const { locale } = useLocale();
  const localized = localizeTool(tool, locale);
  const Icon = getIcon(localized.icon);
  return (
    <a
      href={useLocalizedHref(`/tools/${tool.slug}`, locale) as string}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-brand-700"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-500/10 dark:text-brand-300 dark:group-hover:bg-brand-600 dark:group-hover:text-white">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <CategoryBadge categoryId={tool.category} />
      </div>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{localized.name}</h3>
      <p className="mt-1 flex-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{localized.short}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 opacity-0 transition-opacity group-hover:opacity-100 rtl:-scale-x-100 dark:text-brand-400">
        {locale === "ar" ? "افتح الأداة" : "Open tool"} <ArrowRight className="h-3 w-3" aria-hidden />
      </span>
    </a>
  );
}
