"use client";

/**
 * A tiny, safe localStorage-backed store used for:
 *  - Ad network configuration (IDs can be added from the admin panel)
 *  - Cookie/consent preferences
 *  - Admin overrides for tool descriptions/SEO titles (applied client-side)
 *
 * In a multi-user deployment this would be replaced by a real backend;
 * the admin panel clearly states that the current build is client-side only.
 */

const KEYS = {
  ads: "toolbox.ads.v1",
  consent: "toolbox.consent.v1",
  theme: "toolbox.theme.v1",
  toolOverrides: "toolbox.overrides.v1",
  usage: "toolbox.usage.v1",
  adminAuth: "toolbox.admin-auth.v1",
} as const;

export interface AdConfig {
  /** Ad network client id, e.g. "ca-pub-XXXX" for AdSense. Empty = placeholders only. */
  clientId: string;
  slots: {
    top: string;
    sidebar: string;
    content: string;
    bottom: string;
    mobile: string;
  };
  enabled: boolean;
}

export const defaultAdConfig: AdConfig = {
  clientId: "",
  slots: { top: "", sidebar: "", content: "", bottom: "", mobile: "" },
  enabled: false,
};

export interface ConsentState {
  essential: boolean;
  analytics: boolean;
  advertising: boolean;
  set: boolean;
  date: string;
}

export interface ToolOverride {
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  disabled?: boolean;
}

export type ToolOverrides = Record<string, ToolOverride>;

const read = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key: string, value: unknown): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — non-critical.
  }
};

export const getAdConfig = (): AdConfig => read(KEYS.ads, defaultAdConfig);
export const setAdConfig = (config: AdConfig): void => write(KEYS.ads, config);

export const getConsent = (): ConsentState =>
  read(KEYS.consent, { essential: true, analytics: false, advertising: false, set: false, date: "" });
export const setConsent = (state: ConsentState): void => write(KEYS.consent, state);

export const getToolOverrides = (): ToolOverrides => read(KEYS.toolOverrides, {});
export const setToolOverrides = (overrides: ToolOverrides): void => write(KEYS.toolOverrides, overrides);

export const getTheme = (): "light" | "dark" => read(KEYS.theme, "light");
export const setTheme = (theme: "light" | "dark"): void => write(KEYS.theme, theme);

export const isAdminAuthed = (): boolean => read(KEYS.adminAuth, false);
export const setAdminAuthed = (authed: boolean): void => write(KEYS.adminAuth, authed);
