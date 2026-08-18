"use client";

import { usePathname, useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { useLocale } from "./LocaleProvider";

export default function LanguageSwitcher() {
  const { locale } = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchTo = locale === "ar" ? "en" : "ar";

  const navigate = () => {
    // Strip any existing locale prefix, then re-apply the target one.
    const rest = pathname.replace(/^\/(ar|en)(?=\/|$)/, "") || "/";
    const target = switchTo === "ar" ? (rest === "/" ? "/ar" : `/ar${rest}`) : rest;
    if (target !== pathname) router.push(target);
  };

  return (
    <button
      type="button"
      onClick={navigate}
      aria-label={locale === "ar" ? "Switch to English" : "التبديل إلى العربية"}
      title={locale === "ar" ? "Switch to English" : "التبديل إلى العربية"}
      className="inline-flex h-10 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
    >
      <Languages className="h-4 w-4" aria-hidden />
      <span className={locale === "ar" ? "font-arabic" : ""}>{switchTo.toUpperCase()}</span>
    </button>
  );
}
