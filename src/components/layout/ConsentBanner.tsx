"use client";

import { useEffect, useState } from "react";
import { Cookie, X, ShieldCheck, BarChart3, Megaphone } from "lucide-react";
import { getAdConfig, getConsent, setConsent, type ConsentState } from "@/lib/settings";
import { Button } from "../ui/feedback";
import { Toggle } from "../ui/form";
import { useLocale } from "../i18n/LocaleProvider";
import { translate } from "@/lib/i18n";

/**
 * Cookie / consent banner + preferences manager.
 *
 * Non-essential scripts (analytics, advertising) are only loaded after the
 * visitor opts in. Advertising slots additionally require a configured ad
 * network (admin panel) before anything is injected.
 */
export default function ConsentBanner() {
  const { locale } = useLocale();
  const t = (key: string) => translate(locale, key);
  const [consent, setLocalConsent] = useState<ConsentState | null>(null);
  const [showManager, setShowManager] = useState(false);

  useEffect(() => {
    setLocalConsent(getConsent());
  }, []);

  useEffect(() => {
    // Gate non-essential script loading on consent.
    if (!consent || !consent.set) return;
    loadAdvertisingScripts(consent);
    // Analytics integration point: if (consent.analytics) loadGoogleAnalytics();
  }, [consent]);

  if (!consent || consent.set) return null;

  const save = (state: ConsentState) => {
    setConsent(state);
    setLocalConsent(state);
    setShowManager(false);
  };

  const acceptAll = () =>
    save({ essential: true, analytics: true, advertising: true, set: true, date: new Date().toISOString() });
  const essentialOnly = () =>
    save({ essential: true, analytics: false, advertising: false, set: true, date: new Date().toISOString() });

  return (
    <>
      <div
        role="dialog"
        aria-label={t("consent.title")}
        className="fixed bottom-4 left-1/2 z-[80] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 animate-fade-in rounded-2xl border border-slate-200 bg-white p-5 shadow-panel dark:border-slate-700 dark:bg-slate-800"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
            <Cookie className="h-5 w-5" aria-hidden />
          </span>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t("consent.title")}</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t("consent.text")}</p>
            <div className="mt-3.5 flex flex-wrap gap-2">
              <Button size="sm" onClick={acceptAll}>{t("consent.acceptAll")}</Button>
              <Button size="sm" variant="secondary" onClick={essentialOnly}>{t("consent.essentialOnly")}</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowManager(true)}>{t("consent.manage")}</Button>
            </div>
          </div>
          <button
            type="button"
            aria-label={t("consent.dismiss")}
            onClick={essentialOnly}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showManager && (
        <ConsentManager
          initial={consent}
          onSave={save}
          onClose={() => setShowManager(false)}
        />
      )}
    </>
  );
}

function ConsentManager({
  initial,
  onSave,
  onClose,
}: {
  initial: ConsentState;
  onSave: (state: ConsentState) => void;
  onClose: () => void;
}) {
  const { locale } = useLocale();
  const t = (key: string) => translate(locale, key);
  const [analytics, setAnalytics] = useState(initial.analytics);
  const [advertising, setAdvertising] = useState(initial.advertising);

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Manage consent preferences"
        className="relative w-full max-w-md animate-fade-in rounded-2xl border border-slate-200 bg-white p-6 shadow-panel dark:border-slate-700 dark:bg-slate-800"
      >
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t("consent.preferences")}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t("consent.preferencesSub")}</p>

        <div className="mt-5 space-y-4">
          <ConsentRow
            icon={<ShieldCheck className="h-4 w-4" />}
            title={t("consent.essential")}
            description={t("consent.essentialDesc")}
            locked
          />
          <ConsentRow
            icon={<BarChart3 className="h-4 w-4" />}
            title={t("consent.analytics")}
            description={t("consent.analyticsDesc")}
            checked={analytics}
            onChange={setAnalytics}
          />
          <ConsentRow
            icon={<Megaphone className="h-4 w-4" />}
            title={t("consent.advertising")}
            description={t("consent.advertisingDesc")}
            checked={advertising}
            onChange={setAdvertising}
          />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>{t("consent.cancel")}</Button>
          <Button
            onClick={() =>
              onSave({
                essential: true,
                analytics,
                advertising,
                set: true,
                date: new Date().toISOString(),
              })
            }
          >
            {t("consent.save")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ConsentRow({
  icon,
  title,
  description,
  checked,
  onChange,
  locked = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked?: boolean;
  onChange?: (v: boolean) => void;
  locked?: boolean;
}) {
  const { locale } = useLocale();
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-3.5 dark:border-slate-700">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-brand-500">{icon}</span>
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
        </div>
      </div>
      {locked ? (
        <span className="text-xs font-medium text-slate-400">{translate(locale, "consent.alwaysOn")}</span>
      ) : (
        <Toggle checked={checked ?? false} onChange={(v) => onChange?.(v)} label={title} />
      )}
    </div>
  );
}

/** Load advertising scripts only after explicit consent. */
function loadAdvertisingScripts(consent: ConsentState) {
  if (!consent.advertising) return;
  const config = getAdConfig();
  if (!config.enabled || !config.clientId) return;
  if (document.querySelector('script[data-ad-client]')) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(config.clientId)}`;
  script.setAttribute("data-ad-client", config.clientId);
  script.crossOrigin = "anonymous";
  document.head.appendChild(script);
}
