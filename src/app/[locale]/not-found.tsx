"use client";

import { SearchX, Home, ArrowRight } from "lucide-react";
import { popularTools } from "@/lib/tools";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useLocalizedHref } from "@/components/i18n/LocalizedLink";
import { localizeTool } from "@/lib/ar-content";
import { translate } from "@/lib/i18n";

export default function NotFound() {
  const { locale } = useLocale();
  const t = (key: string) => translate(locale, key);
  const l = (href: string) => useLocalizedHref(href, locale) as string;
  const popular = popularTools.slice(0, 5).map((tool) => localizeTool(tool, locale));

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
        <SearchX className="h-8 w-8" aria-hidden />
      </span>
      <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">{t("404.title")}</h1>
      <p className="mt-3 max-w-md text-base text-slate-500 dark:text-slate-400">{t("404.text")}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a
          href={l("/")}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          <Home className="h-4 w-4" aria-hidden /> {t("404.backHome")}
        </a>
        <a
          href={l("/tools")}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-transparent dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {t("404.browseTools")} <ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
        </a>
      </div>
      <div className="mt-10 w-full">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t("404.popular")}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {popular.map((tool) => (
            <a
              key={tool.id}
              href={l(`/tools/${tool.slug}`)}
              className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              {tool.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
