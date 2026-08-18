"use client";

import { useMemo, useState } from "react";
import { Lock, ShieldAlert, LayoutDashboard, Wrench, Megaphone, BarChart3, Save, ChevronDown } from "lucide-react";
import { tools, categoryById, type ToolConfig } from "@/lib/tools";
import {
  getAdConfig,
  setAdConfig,
  getToolOverrides,
  setToolOverrides,
  isAdminAuthed,
  setAdminAuthed,
  type ToolOverrides,
} from "@/lib/settings";
import { getUsage, getPopularByUsage } from "@/lib/analytics";
import { blogPosts } from "@/lib/blog";
import { Button } from "@/components/ui/feedback";
import { TextInput } from "@/components/ui/form";
import { useToast } from "@/components/ui/Toast";
import { Toggle } from "@/components/ui/form";

const DEFAULT_PASSCODE = "toolbox-admin";

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => isAdminAuthed());
  const [passcode, setPasscode] = useState("");

  if (!authed) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-slate-700">
          <Lock className="h-7 w-7" aria-hidden />
        </span>
        <h1 className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">Admin sign in</h1>
        <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
          This build stores admin configuration locally in your browser (no backend). The default passcode is{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">toolbox-admin</code>.
        </p>
        <div className="mt-6 w-full space-y-3">
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && passcode === DEFAULT_PASSCODE) setAdminAuthed(true), setAuthed(true);
            }}
            placeholder="Passcode"
            aria-label="Admin passcode"
            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          <Button
            className="w-full"
            onClick={() => {
              if (passcode === DEFAULT_PASSCODE) {
                setAdminAuthed(true);
                setAuthed(true);
              }
            }}
          >
            Sign in
          </Button>
        </div>
        <p className="mt-6 flex items-center gap-1.5 text-center text-xs text-amber-600 dark:text-amber-400">
          <ShieldAlert className="h-3.5 w-3.5" aria-hidden />
          Client-side only — for real multi-user deployment, connect a backend.
        </p>
      </div>
    );
  }

  return <Dashboard />;
}

function Dashboard() {
  const [tab, setTab] = useState<"overview" | "tools" | "ads" | "stats">("overview");
  const tabs = [
    { id: "overview" as const, label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: "tools" as const, label: "Tools", icon: <Wrench className="h-4 w-4" /> },
    { id: "ads" as const, label: "Advertising", icon: <Megaphone className="h-4 w-4" /> },
    { id: "stats" as const, label: "Statistics", icon: <BarChart3 className="h-4 w-4" /> },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage tools, SEO content, advertising and view anonymous statistics.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { setAdminAuthed(false); window.location.reload(); }}>
          Sign out
        </Button>
      </div>

      <div role="tablist" aria-label="Admin sections" className="mt-6 flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
              tab === t.id ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "overview" && <OverviewTab />}
        {tab === "tools" && <ToolsTab />}
        {tab === "ads" && <AdsTab />}
        {tab === "stats" && <StatsTab />}
      </div>
    </div>
  );
}

function OverviewTab() {
  const usage = getUsage();
  const popular = getPopularByUsage(6);
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <StatCard title="Tools" value={String(tools.length)} sub={`${tools.length} tools across ${new Set(tools.map((t) => t.category)).size} categories`} />
        <StatCard title="Blog articles" value={String(blogPosts.length)} sub="Content links naturally to tools" />
        <StatCard title="Local tool uses (this device)" value={String(usage.total)} sub="Anonymous counters, stored locally only" />
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800/60">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Popular this week</h2>
        <ul className="mt-3 space-y-2">
          {popular.length === 0 && <p className="text-sm text-slate-400">No usage yet — open some tools!</p>}
          {popular.map(([slug, count]) => {
            const tool = tools.find((t) => t.slug === slug);
            if (!tool) return null;
            return (
              <li key={slug} className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-200">{tool.name}</span>
                <span className="text-xs text-slate-400">{count} uses</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function StatCard({ title, value, sub }: { title: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800/60">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
      <p className="mt-1 text-3xl font-extrabold tabular-nums text-slate-900 dark:text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{sub}</p>
    </div>
  );
}

function ToolsTab() {
  const [overrides, setOverrides] = useState<ToolOverrides>(() => getToolOverrides());
  const [expanded, setExpanded] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<ToolOverrides>({});
  const { toast } = useToast();

  const save = () => {
    const merged: ToolOverrides = {};
    for (const tool of tools) {
      merged[tool.slug] = { ...overrides[tool.slug], ...(drafts[tool.slug] ?? {}) };
    }
    setToolOverrides(merged);
    setOverrides(merged);
    setDrafts({});
    window.dispatchEvent(new Event("toolbox:overrides"));
    toast("Tool settings saved — applied instantly", "success");
  };

  const updateDraft = (slug: string, patch: Partial<ToolOverrides[string]>) => {
    setDrafts((d) => ({ ...d, [slug]: { ...d[slug], ...patch } }));
  };

  const groups = useMemo(() => {
    const map = new Map<string, ToolConfig[]>();
    for (const tool of tools) {
      const list = map.get(tool.category) ?? [];
      list.push(tool);
      map.set(tool.category, list);
    }
    return [...map.entries()];
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Disable tools, edit descriptions and SEO fields. Changes are applied instantly on tool pages and stored on
          this device.
        </p>
        <Button onClick={save} icon={<Save className="h-4 w-4" />}>Save changes</Button>
      </div>
      {groups.map(([categoryId, list]) => (
        <div key={categoryId}>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">
            {categoryById[categoryId as keyof typeof categoryById]?.name ?? categoryId}
          </h2>
          <div className="space-y-2">
            {list.map((tool) => {
              const override = overrides[tool.slug];
              const draft = drafts[tool.slug];
              const disabled = draft?.disabled ?? override?.disabled ?? false;
              const isExpanded = expanded === tool.slug;
              return (
                <div key={tool.id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/60">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {tool.name}
                        {disabled && <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400">Disabled</span>}
                      </p>
                      <p className="truncate text-xs text-slate-400">/tools/{tool.slug}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setExpanded(isExpanded ? null : tool.slug)}
                        aria-expanded={isExpanded}
                        className="rounded-md p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                        aria-label={`Edit ${tool.name}`}
                      >
                        <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </button>
                      <Toggle checked={!disabled} onChange={(v) => updateDraft(tool.slug, { disabled: !v })} label={`Enable ${tool.name}`} />
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="mt-4 space-y-3 border-t border-slate-100 pt-4 dark:border-slate-700">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Description (tool page intro)</label>
                        <textarea
                          defaultValue={draft?.description ?? override?.description ?? tool.description}
                          onChange={(e) => updateDraft(tool.slug, { description: e.target.value })}
                          rows={2}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                        />
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">SEO title</label>
                          <input
                            defaultValue={draft?.seoTitle ?? override?.seoTitle ?? tool.seoTitle}
                            onChange={(e) => updateDraft(tool.slug, { seoTitle: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Meta description</label>
                          <input
                            defaultValue={draft?.seoDescription ?? override?.seoDescription ?? tool.seoDescription}
                            onChange={(e) => updateDraft(tool.slug, { seoDescription: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function AdsTab() {
  const [config, setConfig] = useState(() => getAdConfig());
  const { toast } = useToast();

  const save = () => {
    setAdConfig(config);
    window.dispatchEvent(new Event("toolbox:ads"));
    toast("Ad configuration saved", "success");
  };

  return (
    <div className="max-w-2xl space-y-5 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/60">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Advertisement configuration</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Add your ad network IDs here — they are applied to every page through the AdSlot component without touching
          individual pages. No scripts load before visitor consent.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Enable advertising slots</span>
        <Toggle checked={config.enabled} onChange={(v) => setConfig((c) => ({ ...c, enabled: v }))} label="Enable advertising" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Ad network client ID</label>
        <TextInput
          value={config.clientId}
          onChange={(e) => setConfig((c) => ({ ...c, clientId: e.target.value }))}
          placeholder="ca-pub-XXXXXXXXXXXXXXXX (AdSense)"
        />
      </div>

      <div className="space-y-3">
        {(["top", "sidebar", "content", "bottom", "mobile"] as const).map((position) => (
          <div key={position} className="flex items-center justify-between gap-4">
            <span className="w-24 text-sm capitalize text-slate-600 dark:text-slate-300">{position} slot</span>
            <input
              value={config.slots[position]}
              onChange={(e) => setConfig((c) => ({ ...c, slots: { ...c.slots, [position]: e.target.value } }))}
              placeholder="Ad slot ID (e.g. 1234567890)"
              className="h-10 flex-1 rounded-lg border border-slate-300 bg-white px-3 font-mono text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              aria-label={`${position} ad slot ID`}
            />
          </div>
        ))}
      </div>

      <Button onClick={save} icon={<Save className="h-4 w-4" />}>Save ad configuration</Button>

      <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-400 dark:bg-slate-900/40">
        Until a client ID and slot IDs are configured, pages show a neutral “Advertisement” placeholder. When enabled
        with consent, the standard AdSense <code className="font-mono">&lt;ins&gt;</code> element is rendered. To use
        another network, adapt the AdSlot component.
      </p>
    </div>
  );
}

function StatsTab() {
  const usage = getUsage();
  const byTool = Object.entries(usage.byTool).sort((a, b) => b[1] - a[1]);
  const byDate = Object.entries(usage.byDate).sort((a, b) => a[0].localeCompare(b[0])).slice(-14);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800/60">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Tool usage (this device)</h2>
        <ul className="mt-3 space-y-1.5">
          {byTool.length === 0 && <p className="text-sm text-slate-400">No tool usage recorded yet.</p>}
          {byTool.slice(0, 20).map(([slug, count]) => {
            const tool = tools.find((t) => t.slug === slug);
            return (
              <li key={slug} className="flex items-center justify-between text-sm">
                <span className="text-slate-700 dark:text-slate-200">{tool?.name ?? slug}</span>
                <span className="font-semibold tabular-nums text-slate-500 dark:text-slate-400">{count}</span>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800/60">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Usage by day (last 14)</h2>
        <div className="mt-4 flex h-40 items-end gap-1.5">
          {byDate.map(([date, count]) => {
            const max = Math.max(1, ...byDate.map(([, c]) => c));
            return (
              <div key={date} className="flex flex-1 flex-col items-center gap-1" title={`${date}: ${count}`}>
                <div className="w-full rounded-t bg-brand-500" style={{ height: `${(count / max) * 100}%` }} />
                <span className="text-[9px] text-slate-400">{date.slice(5)}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-slate-400">
          These are anonymous, aggregated counters stored locally on this device — no user identifiers, no server
          requests. For cross-user analytics in production, connect a privacy-friendly analytics backend.
        </p>
      </div>
    </div>
  );
}
