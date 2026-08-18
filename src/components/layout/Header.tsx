"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, WandSparkles, ChevronDown } from "lucide-react";
import { categories, siteName } from "@/lib/tools";
import { getIcon } from "../icons";
import { useLocale } from "../i18n/LocaleProvider";
import { useLocalizedHref } from "../i18n/LocalizedLink";
import { localizeCategory } from "@/lib/ar-content";
import { translate } from "@/lib/i18n";
import ThemeToggle from "./ThemeToggle";
import SearchBox from "./SearchBox";
import LanguageSwitcher from "../i18n/LanguageSwitcher";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const pathname = usePathname();
  const { locale } = useLocale();

  useEffect(() => {
    setMobileOpen(false);
    setToolsOpen(false);
  }, [pathname]);

  // Active-link matching ignores the locale prefix (/ar/tools === /tools).
  const path = pathname.replace(/^\/(ar|en)(?=\/|$)/, "") || "/";
  const t = (key: string) => translate(locale, key);
  const l = (href: string) => useLocalizedHref(href, locale) as string;

  const categoryLinks = categories.slice(0, 6);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md dark:border-slate-700/70 dark:bg-slate-900/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <a href={l("/")} className="flex shrink-0 items-center gap-2.5" aria-label={`${siteName} ${t("breadcrumb.home")}`}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-sm">
            <WandSparkles className="h-5 w-5" aria-hidden />
          </span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">{siteName}</span>
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{t("site.tagline")}</span>
          </span>
        </a>

        <nav className="ms-2 hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          <a
            href={l("/tools")}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              path === "/tools"
                ? "text-brand-700 dark:text-brand-300"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            }`}
          >
            {t("nav.allTools")}
          </a>
          <div className="relative">
            <button
              type="button"
              onClick={() => setToolsOpen((o) => !o)}
              aria-expanded={toolsOpen}
              className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                toolsOpen || path.endsWith("-tools")
                  ? "text-brand-700 dark:text-brand-300"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              }`}
            >
              {t("nav.categories")}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${toolsOpen ? "rotate-180" : ""}`} aria-hidden />
            </button>
            {toolsOpen && (
              <div className="absolute left-0 top-full mt-1 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-panel dark:border-slate-700 dark:bg-slate-800">
                <p className="px-2.5 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {t("nav.browseBy")}
                </p>
                {categories.map((category) => {
                  const Icon = getIcon(category.icon);
                  return (
                    <a
                      key={category.id}
                      href={l(`/${category.slug}`)}
                      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      <Icon className="h-4 w-4 text-brand-500" aria-hidden />
                      {localizeCategory(category.id, locale).name}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
          <a
            href={l("/blog")}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              path.startsWith("/blog")
                ? "text-brand-700 dark:text-brand-300"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            }`}
          >
            {t("nav.blog")}
          </a>
        </nav>

        <div className="ms-auto hidden w-full max-w-xs md:block lg:max-w-sm">
          <SearchBox size="sm" placeholder={t("search.placeholder")} />
        </div>

        <div className="ms-auto flex items-center gap-1.5 md:ms-0">
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label={mobileOpen ? t("menu.close") : t("menu.open")}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 pb-6 pt-4 lg:hidden dark:border-slate-700 dark:bg-slate-900">
          <SearchBox size="md" placeholder={t("search.placeholder")} onNavigate={() => setMobileOpen(false)} />
          <nav aria-label="Mobile navigation" className="mt-4 grid grid-cols-2 gap-1">
            <a
              href={l("/tools")}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {t("nav.allTools")}
            </a>
            {categories.map((category) => {
              const Icon = getIcon(category.icon);
              return (
                <a
                  key={category.id}
                  href={l(`/${category.slug}`)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Icon className="h-4 w-4 text-brand-500" aria-hidden />
                  {localizeCategory(category.id, locale).name}
                </a>
              );
            })}
            <a
              href={l("/blog")}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {t("nav.blog")}
            </a>
          </nav>
          {categoryLinks.length > 0 && null}
        </div>
      )}
    </header>
  );
}
