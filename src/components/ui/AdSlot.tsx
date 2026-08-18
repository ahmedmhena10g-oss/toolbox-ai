"use client";

import { Megaphone } from "lucide-react";
import { getAdConfig, getConsent } from "@/lib/settings";
import { useLocale } from "../i18n/LocaleProvider";
import { translate } from "@/lib/i18n";

export type AdPosition = "top" | "sidebar" | "content" | "bottom" | "mobile";

const heights: Record<AdPosition, string> = {
  top: "min-h-[90px]",
  sidebar: "min-h-[250px]",
  content: "min-h-[120px]",
  bottom: "min-h-[90px]",
  mobile: "min-h-[100px]",
};

/**
 * Ad slot placeholder.
 *
 * When an ad network is configured (client id + slot ids via the admin panel)
 * and the visitor has consented to advertising cookies, the slot renders a
 * standard <ins> element ready for AdSense or another network.
 *
 * Until then it renders a clearly-labelled placeholder so the layout keeps
 * its shape without ever looking like a tool button or a fake download.
 */
export default function AdSlot({ position }: { position: AdPosition }) {
  const { locale } = useLocale();
  if (typeof window === "undefined") {
    return <Placeholder position={position} locale={locale} />;
  }
  const config = getAdConfig();
  const consent = getConsent();
  const slotId = config.slots[position];

  if (!config.enabled || !config.clientId || !slotId || !consent.advertising) {
    return <Placeholder position={position} locale={locale} />;
  }

  return (
    <div className={`flex w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-200 dark:border-slate-700 ${heights[position]}`}>
      <ins
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={config.clientId}
        data-ad-slot={slotId}
        data-ad-format={position === "sidebar" ? "rectangle" : "auto"}
        data-full-width-responsive="true"
        aria-label="Advertisement"
      />
    </div>
  );
}

function Placeholder({ position, locale }: { position: AdPosition; locale: "en" | "ar" }) {
  return (
    <div
      aria-hidden="true"
      className={`flex w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-200 bg-slate-50/60 dark:border-slate-700/70 dark:bg-slate-800/30 ${heights[position]}`}
    >
      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
        <Megaphone className="h-3 w-3" aria-hidden />
        {translate(locale, "ad.label")}
      </span>
    </div>
  );
}
