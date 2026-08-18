"use client";

import { ChevronRight, HelpCircle, ArrowRight } from "lucide-react";
import { categories, categoryById, toolBySlug, type CategoryId, type ToolConfig } from "@/lib/tools";
import { getIcon } from "../icons";
import { useLocale } from "../i18n/LocaleProvider";
import { useLocalizedHref } from "../i18n/LocalizedLink";
import { localizeCategory, localizeTool } from "@/lib/ar-content";
import { translate } from "@/lib/i18n";
import ToolCard from "./ToolCard";

/* ------------------------------------------------------------- Breadcrumbs */

export function Breadcrumbs({ items }: { items: { name: string; url?: string }[] }) {
  const { locale } = useLocale();
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
        {items.map((item, index) => (
          <li key={item.name} className="flex items-center gap-1">
            {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" aria-hidden />}
            {item.url ? (
              <a
                href={useLocalizedHref(item.url, locale) as string}
                className="transition-colors hover:text-brand-600 dark:hover:text-brand-400"
              >
                {item.name}
              </a>
            ) : (
              <span aria-current="page" className="font-medium text-slate-700 dark:text-slate-200">
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* -------------------------------------------------------------- FAQSection */

export function FAQSection({ faqs }: { faqs: { q: string; a: string }[] }) {
  const { locale } = useLocale();
  return (
    <section aria-labelledby="faq-heading" className="mt-12">
      <h2 id="faq-heading" className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        {translate(locale, "tool.faq")}
      </h2>
      <div className="mt-5 space-y-3">
        {faqs.map((faq) => (
          <details
            key={faq.q}
            className="group rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/60"
          >
            <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 text-sm font-semibold text-slate-800 dark:text-slate-100 [&::-webkit-details-marker]:hidden">
              <HelpCircle className="h-4 w-4 shrink-0 text-brand-500" aria-hidden />
              {faq.q}
              <ChevronRight className="ms-auto h-4 w-4 text-slate-400 transition-transform group-open:rotate-90 rtl:-scale-x-100 dark:text-slate-400" aria-hidden />
            </summary>
            <p className="px-4 pb-4 ps-11 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{faq.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- RelatedTools */

export function RelatedTools({ tool }: { tool: ToolConfig }) {
  const { locale } = useLocale();
  const related = tool.related
    .map((slug) => toolBySlug[slug])
    .filter((t): t is ToolConfig => Boolean(t))
    .map((t) => localizeTool(t, locale));
  if (related.length === 0) return null;
  return (
    <section aria-labelledby="related-heading" className="mt-12">
      <h2 id="related-heading" className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        {translate(locale, "tool.related")}
      </h2>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((item) => (
          <ToolCard key={item.id} tool={item} />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------- CategoryRail (sidebar popular list) */

export function PopularSidebarList({ tools }: { tools: ToolConfig[] }) {
  const { locale } = useLocale();
  const items = tools.map((t) => localizeTool(t, locale));
  return (
    <nav aria-label="Popular tools">
      <ul className="space-y-1">
        {items.map((tool) => {
          const Icon = getIcon(tool.icon);
          return (
            <li key={tool.id}>
              <a
                href={useLocalizedHref(`/tools/${tool.slug}`, locale) as string}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <Icon className="h-4 w-4 shrink-0 text-brand-500" aria-hidden />
                <span className="flex-1">{tool.name}</span>
                <ArrowRight className="h-3.5 w-3.5 rtl:-scale-x-100" aria-hidden />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function CategoryLinks() {
  const { locale } = useLocale();
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const localized = localizeCategory(category.id, locale);
        return (
          <a
            key={category.id}
            href={useLocalizedHref(`/${category.slug}`, locale) as string}
            className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-brand-600 dark:hover:text-brand-300"
          >
            {localized.name}
          </a>
        );
      })}
    </div>
  );
}

export function CategoryBadge({ categoryId }: { categoryId: CategoryId }) {
  const { locale } = useLocale();
  const category = categoryById[categoryId];
  if (!category) return null;
  return (
    <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
      {localizeCategory(category.id, locale).name}
    </span>
  );
}
