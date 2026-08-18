"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { defaultLocale, translate, type Locale } from "@/lib/i18n";

interface LocaleContextValue {
  locale: Locale;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: defaultLocale,
  t: (key) => key,
});

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      t: (key, vars) => {
        let text = translate(locale, key);
        if (vars) {
          for (const [name, replacement] of Object.entries(vars)) {
            text = text.replace(`{${name}}`, String(replacement));
          }
        }
        return text;
      },
    }),
    [locale]
  );
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}
