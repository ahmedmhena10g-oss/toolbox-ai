"use client";

import { useEffect, useState } from "react";
import { Sparkles, ShieldCheck, RefreshCw } from "lucide-react";
import { type ToolConfig, type CategoryConfig } from "@/lib/tools";
import { getToolOverrides, type ToolOverrides } from "@/lib/settings";
import { trackToolUse } from "@/lib/analytics";
import { getToolComponent } from "./tools/registry";
import { Breadcrumbs, FAQSection, RelatedTools } from "./ui/seo-client";
import AdSlot from "./ui/AdSlot";
import ToolCard from "./ui/ToolCard";
import { Button } from "./ui/feedback";
import { useLocale } from "./i18n/LocaleProvider";
import { useLocalizedHref } from "./i18n/LocalizedLink";
import { localizeCategory, localizeTool } from "@/lib/ar-content";
import { translate } from "@/lib/i18n";

export default function ToolShell({
  tool,
  category,
  topTools,
}: {
  tool: ToolConfig;
  category: CategoryConfig;
  topTools: ToolConfig[];
}) {
  const { locale } = useLocale();
  const t = (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars);
  const l = (href: string) => useLocalizedHref(href, locale) as string;

  const localizedTool = localizeTool(tool, locale);
  const localizedCategory = localizeCategory(category.id, locale);
  const Component = getToolComponent(localizedTool.slug);
  const [overrides, setOverrides] = useState<ToolOverrides>(() => getToolOverrides());

  useEffect(() => {
    trackToolUse(localizedTool.slug);
    const sync = () => setOverrides(getToolOverrides());
    window.addEventListener("storage", sync);
    window.addEventListener("toolbox:overrides", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("toolbox:overrides", sync);
    };
  }, [localizedTool.slug]);

  const override = overrides[localizedTool.slug];
  const disabled = override?.disabled;
  const description = override?.description || localizedTool.description;
  const sidebarTools = topTools.map((tool) => localizeTool(tool, locale));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs
        items={[
          { name: t("breadcrumb.home"), url: "/" },
          { name: t("breadcrumb.tools"), url: "/tools" },
          { name: localizedCategory.name, url: `/${category.slug}` },
          { name: localizedTool.name },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <main className="min-w-0">
          <header>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              {localizedTool.name}
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
              {description}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> {t("tool.badge.free")}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                {localizedTool.privacy === "local" ? t("tool.badge.local") : t("tool.badge.api")}
              </span>
              {localizedTool.experimental && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 font-medium text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden /> {t("tool.badge.experimental")}
                </span>
              )}
            </div>
          </header>

          <AdSlot position="top" />

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-8 dark:border-slate-700 dark:bg-slate-800/50">
            {disabled ? (
              <div className="py-10 text-center">
                <p className="text-base font-semibold text-slate-800 dark:text-slate-100">
                  {t("tool.disabled.title")}
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                  {t("tool.disabled.text")}
                </p>
                <Button variant="secondary" size="sm" className="mt-4" icon={<RefreshCw className="h-4 w-4" />}>
                  {t("common.reload")}
                </Button>
              </div>
            ) : Component ? (
              <Component />
            ) : (
              <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                {t("tool.comingSoon")}
              </p>
            )}
          </section>

          <AdSlot position="content" />

          <section aria-labelledby="howto-heading" className="mt-10">
            <h2 id="howto-heading" className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t("tool.howTo", { name: localizedTool.name })}
            </h2>
            <ol className="mt-5 space-y-4">
              {localizedTool.howTo.map((step, index) => (
                <li key={index} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{step}</p>
                </li>
              ))}
            </ol>
          </section>

          <FAQSection faqs={localizedTool.faqs} />

          <AdSlot position="bottom" />

          <RelatedTools tool={localizedTool} />
        </main>

        <aside className="hidden lg:block" aria-label="Sidebar">
          <div className="sticky top-24 space-y-6">
            <AdSlot position="sidebar" />
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-700 dark:bg-slate-800/50">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {t("tool.sidebar.popular")}
              </h2>
              <ul className="mt-3 space-y-1">
                {sidebarTools.map((tool) => (
                  <li key={tool.id}>
                    <ToolCard tool={tool} />
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}
