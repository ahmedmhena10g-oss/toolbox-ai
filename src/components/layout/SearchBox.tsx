"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Search, CornerDownLeft, X } from "lucide-react";
import { searchTools } from "@/lib/search";
import { categoryById, tools } from "@/lib/tools";
import { getIcon } from "../icons";
import { useLocale } from "../i18n/LocaleProvider";
import { useLocalizedHref } from "../i18n/LocalizedLink";
import { localizeCategory, localizeTool } from "@/lib/ar-content";
import { translate } from "@/lib/i18n";

export default function SearchBox({
  size = "md",
  placeholder,
  autoFocus = false,
  onNavigate,
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  placeholder?: string;
  autoFocus?: boolean;
  onNavigate?: () => void;
  className?: string;
}) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const deferredQuery = useDeferredValue(query);
  const { locale } = useLocale();
  const results = useResults(deferredQuery, locale);
  const rootRef = useRef<HTMLDivElement>(null);

  const t = (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars);
  const open = focused && query.trim().length > 0;

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setFocused(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => setActiveIndex(0), [deferredQuery]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") {
        setFocused(false);
        (document.activeElement as HTMLElement | null)?.blur();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const sizes = {
    sm: "h-9 text-sm",
    md: "h-11 text-sm",
    lg: "h-13 text-base",
  };

  const go = (slug: string) => {
    window.location.href = useLocalizedHref(`/tools/${slug}`, locale) as string;
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 rtl:left-auto rtl:right-3.5"
          aria-hidden
        />
        <input
          type="search"
          role="searchbox"
          aria-label={t("search.aria")}
          autoFocus={autoFocus}
          value={query}
          placeholder={placeholder ?? t("search.homePlaceholder")}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((i) => Math.min(i + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter" && results[activeIndex]) {
              go(results[activeIndex].slug);
            }
          }}
          className={`w-full rounded-xl border border-slate-300 bg-white pl-10 pr-9 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 rtl:pl-9 rtl:pr-10 ${sizes[size]}`}
        />
        {query && (
          <button
            type="button"
            aria-label={t("common.clear")}
            onClick={() => setQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-600 rtl:left-2.5 rtl:right-auto dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && (
        <div
          role="listbox"
          aria-label={t("search.aria")}
          className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-panel dark:border-slate-700 dark:bg-slate-800"
        >
          {results.length === 0 ? (
            <p className="px-4 py-5 text-sm text-slate-500 dark:text-slate-400">
              {t("search.noResults", { q: query })}
            </p>
          ) : (
            <ul>
              {results.map((tool, index) => {
                const Icon = getIcon(tool.icon);
                const category = categoryById[tool.category];
                return (
                  <li key={tool.id}>
                    <a
                      href={useLocalizedHref(`/tools/${tool.slug}`, locale) as string}
                      role="option"
                      aria-selected={index === activeIndex}
                      onClick={() => {
                        setFocused(false);
                        onNavigate?.();
                      }}
                      className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        index === activeIndex
                          ? "bg-brand-50 dark:bg-brand-500/10"
                          : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-brand-500" aria-hidden />
                      <span className="flex-1 font-medium text-slate-800 dark:text-slate-100">{tool.name}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {category ? localizeCategory(category.id, locale).name : ""}
                      </span>
                      {index === activeIndex && (
                        <CornerDownLeft className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" aria-hidden />
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/** Results computed with a deferred value; Arabic searches match localized names. */
function useResults(query: string, locale: "en" | "ar") {
  const deferred = useDeferredValue(query);
  const [results, setResults] = useState(() => computeResults(deferred, locale));
  useEffect(() => {
    setResults(computeResults(deferred, locale));
  }, [deferred, locale]);
  return results;
}

function computeResults(query: string, locale: "en" | "ar") {
  if (!query.trim()) return [];
  if (locale === "ar") {
    const tokens = query.trim().toLowerCase().split(/\s+/);
    return tools
      .map((tool) => localizeTool(tool, "ar"))
      .filter((tool) =>
        tokens.every((token) => `${tool.name} ${tool.short}`.toLowerCase().includes(token))
      )
      .slice(0, 8);
  }
  return searchTools(query, 8).map((r) => r.tool);
}
