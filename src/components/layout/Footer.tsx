"use client";

import { WandSparkles, ShieldCheck } from "lucide-react";
import { categories, siteName } from "@/lib/tools";
import { popularTools } from "@/lib/tools";
import { useLocale } from "../i18n/LocaleProvider";
import { useLocalizedHref } from "../i18n/LocalizedLink";
import { localizeCategory, localizeTool } from "@/lib/ar-content";
import { translate } from "@/lib/i18n";

export default function Footer() {
  const { locale } = useLocale();
  const t = (key: string) => translate(locale, key);
  const l = (href: string) => useLocalizedHref(href, locale) as string;

  const toolLinks = popularTools.slice(0, 6).map((tool) => localizeTool(tool, locale));
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-1">
            <a href={l("/")} className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 text-white">
                <WandSparkles className="h-5 w-5" aria-hidden />
              </span>
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">{siteName}</span>
            </a>
            <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{t("footer.blurb")}</p>
            <p className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              {t("footer.processedLocally")}
            </p>
          </div>

          <nav aria-label="Footer tools">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{t("footer.tools")}</h2>
            <ul className="mt-3 space-y-2">
              {toolLinks.map((tool) => (
                <li key={tool.id}>
                  <a
                    href={l(`/tools/${tool.slug}`)}
                    className="text-sm text-slate-500 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
                  >
                    {tool.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Footer categories">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{t("footer.categories")}</h2>
            <ul className="mt-3 space-y-2">
              {categories.map((category) => (
                <li key={category.id}>
                  <a
                    href={l(`/${category.slug}`)}
                    className="text-sm text-slate-500 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
                  >
                    {localizeCategory(category.id, locale).name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Footer company">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{t("footer.company")}</h2>
            <ul className="mt-3 space-y-2">
              <li><a href={l("/about")} className="text-sm text-slate-500 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400">{t("footer.about")}</a></li>
              <li><a href={l("/contact")} className="text-sm text-slate-500 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400">{t("footer.contact")}</a></li>
              <li><a href={l("/privacy")} className="text-sm text-slate-500 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400">{t("footer.privacy")}</a></li>
              <li><a href={l("/terms")} className="text-sm text-slate-500 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400">{t("footer.terms")}</a></li>
              <li><a href={l("/cookie-policy")} className="text-sm text-slate-500 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400">{t("footer.cookie")}</a></li>
            </ul>
          </nav>

          <nav aria-label="Footer resources">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{t("footer.resources")}</h2>
            <ul className="mt-3 space-y-2">
              <li><a href={l("/blog")} className="footer-link">{t("footer.blog")}</a></li>
              <li><a href={l("/faq")} className="footer-link">{t("footer.faq")}</a></li>
              <li><a href="/sitemap.xml" className="footer-link">{t("footer.sitemap")}</a></li>
              <li><a href={l("/tools")} className="footer-link">{t("footer.allTools")}</a></li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center dark:border-slate-800 dark:text-slate-500">
          <p>© {year} {siteName}. {t("footer.rights")}</p>
          <p>{t("footer.privacyNote")}</p>
        </div>
      </div>
    </footer>
  );
}
