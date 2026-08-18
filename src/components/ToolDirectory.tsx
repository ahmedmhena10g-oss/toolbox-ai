"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { categories, tools, type CategoryId, type ToolConfig } from "@/lib/tools";
import { searchTools } from "@/lib/search";
import { useLocale } from "./i18n/LocaleProvider";
import { localizeCategory, localizeTool } from "@/lib/ar-content";
import { translate } from "@/lib/i18n";
import ToolCard from "./ui/ToolCard";

export default function ToolDirectory({
  category,
  initialQuery = "",
}: {
  category?: CategoryId;
  initialQuery?: string;
}) {
  const searchParams = useSearchParams();
  const { locale } = useLocale();
  const [query, setQuery] = useState(initialQuery || searchParams.get("q") || "");
  const deferred = useDeferredValue(query);
  const [categoryFilter, setCategoryFilter] = useState<CategoryId | "all">(category ?? "all");

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setQuery(q);
  }, [searchParams]);

  const filtered = useMemo(() => {
    let list = categoryFilter === "all" ? tools : tools.filter((t) => t.category === categoryFilter);
    if (deferred.trim()) {
      if (locale === "ar") {
        const tokens = deferred.toLowerCase().split(/\s+/);
        list = list.filter((t) => {
          const localized = localizeTool(t, "ar");
          return tokens.every((token) =>
            `${localized.name} ${localized.short}`.toLowerCase().includes(token)
          );
        });
      } else {
        const results = searchTools(deferred, 60).map((r) => r.tool.slug);
        const resultSet = new Set(results);
        list = list.filter((t) => resultSet.has(t.slug));
        if (list.length === 0 && categoryFilter === "all") {
          // Fall back to text matching inside the list.
          const tokens = deferred.toLowerCase().split(/\s+/);
          list = tools.filter((t) =>
            tokens.every((token) =>
              `${t.name} ${t.short} ${t.keywords.join(" ")}`.toLowerCase().includes(token)
            )
          );
        }
      }
    }
    return list;
  }, [deferred, categoryFilter, locale]);

  const showCategoryTabs = !category;

  return (
    <div>
      <div className="relative mb-6 max-w-md">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 rtl:left-auto rtl:right-3.5"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={translate(locale, "tools.filter")}
          aria-label={translate(locale, "search.aria")}
          className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rtl:pl-4 rtl:pr-10"
        />
      </div>

      {showCategoryTabs && (
        <div className="mb-8 flex flex-wrap gap-2">
          <CategoryTab
            active={categoryFilter === "all"}
            onClick={() => setCategoryFilter("all")}
            label={translate(locale, "tools.category.all")}
          />
          {categories.map((c) => (
            <CategoryTab
              key={c.id}
              active={categoryFilter === c.id}
              onClick={() => setCategoryFilter(c.id as CategoryId)}
              label={localizeCategory(c.id, locale).name}
            />
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500 dark:border-slate-700">
          {translate(locale, "tools.noMatch", { q: query })}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((tool: ToolConfig) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryTab({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
        active
          ? "bg-brand-600 text-white shadow-sm"
          : "border border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-brand-600 dark:hover:text-brand-300"
      }`}
    >
      {label}
    </button>
  );
}
