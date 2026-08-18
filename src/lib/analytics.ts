"use client";

/**
 * Privacy-friendly, anonymous usage tracking.
 *
 * Counts are stored locally per device (no user identifiers, no network
 * requests, no cookies). They power the "popular tools" ordering and the
 * admin statistics panel. In production this could be replaced by a
 * server-side aggregator that never stores personal data.
 */

interface UsageStore {
  byTool: Record<string, number>;
  byDate: Record<string, number>; // YYYY-MM-DD -> tool count
  total: number;
}

const KEY = "toolbox.usage.v1";

const read = (): UsageStore => {
  if (typeof window === "undefined") return { byTool: {}, byDate: {}, total: 0 };
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as UsageStore) : { byTool: {}, byDate: {}, total: 0 };
  } catch {
    return { byTool: {}, byDate: {}, total: 0 };
  }
};

const write = (store: UsageStore): void => {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // Non-critical.
  }
};

const todayKey = (): string => new Date().toISOString().slice(0, 10);

/** Record one anonymous use of a tool. */
export const trackToolUse = (slug: string): void => {
  const store = read();
  store.byTool[slug] = (store.byTool[slug] ?? 0) + 1;
  store.byDate[todayKey()] = (store.byDate[todayKey()] ?? 0) + 1;
  store.total += 1;
  write(store);
};

/** Record an anonymous page view (used for the admin statistics panel). */
export const trackPageView = (path: string): void => {
  if (typeof window === "undefined") return;
  const key = `toolbox.pv.${path}`;
  try {
    const count = parseInt(window.localStorage.getItem(key) ?? "0", 10);
    window.localStorage.setItem(key, String(count + 1));
  } catch {
    // ignore
  }
};

export const getUsage = (): UsageStore => read();

export const getPopularByUsage = (limit = 8): [string, number][] => {
  const { byTool } = read();
  return Object.entries(byTool)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
};
