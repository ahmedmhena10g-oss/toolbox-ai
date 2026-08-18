"use client";

import { useMemo, useState } from "react";
import { RefreshCw, Copy, Wand2, ArrowRight, Dices } from "lucide-react";
import { useToast } from "../ui/Toast";
import { Button, CopyButton } from "../ui/feedback";
import { Field, Select, Tabs, TextArea, TextInput, Toggle } from "../ui/form";
import { copyToClipboard } from "@/lib/utils";

/* ------------------------------------------------------------ JsonFormatter */

export function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState("2");
  const [error, setError] = useState<string | null>(null);

  const process = (minify: boolean) => {
    setError(null);
    try {
      const parsed = JSON.parse(input);
      setOutput(minify ? JSON.stringify(parsed) : JSON.stringify(parsed, null, parseInt(indent, 10)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "This doesn't look like valid JSON.");
      setOutput("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Indentation" htmlFor="json-indent">
          <Select id="json-indent" value={indent} onChange={(e) => setIndent(e.target.value)}>
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value="tab">Tab</option>
          </Select>
        </Field>
        <div className="flex gap-2">
          <Button onClick={() => process(false)} icon={<Wand2 className="h-4 w-4" />}>Format</Button>
          <Button variant="secondary" onClick={() => process(true)}>Minify</Button>
          <Button variant="ghost" icon={<RefreshCw className="h-4 w-4" />} onClick={() => { setInput(""); setOutput(""); setError(null); }}>Clear</Button>
        </div>
      </div>
      <TextArea value={input} onChange={(e) => setInput(e.target.value)} rows={8} placeholder='{"hello": "world"}' className="font-mono text-xs" aria-label="JSON input" />
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      )}
      {output && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Result</p>
            <CopyButton text={output} />
          </div>
          <pre className="max-h-80 overflow-auto rounded-xl bg-slate-900 p-4 font-mono text-xs leading-relaxed text-emerald-400 dark:bg-slate-950">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ Base64 */

const utf8ToBase64 = (text: string): string => {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
};

const base64ToUtf8 = (base64: string): string => {
  const clean = base64.replace(/\s+/g, "");
  const binary = atob(clean);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

export function Base64Tool() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const run = () => {
    setError(null);
    try {
      setOutput(mode === "encode" ? utf8ToBase64(input) : base64ToUtf8(input));
    } catch {
      setError("This doesn't look like valid Base64. Please check your input and try again.");
      setOutput("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Tabs
          tabs={[
            { id: "encode", label: "Text → Base64" },
            { id: "decode", label: "Base64 → Text" },
          ]}
          active={mode}
          onChange={(m) => setMode(m)}
        />
        <div className="flex gap-2">
          <Button onClick={run} icon={<ArrowRight className="h-4 w-4" />}>{mode === "encode" ? "Encode" : "Decode"}</Button>
          <Button variant="ghost" icon={<RefreshCw className="h-4 w-4" />} onClick={() => { setInput(""); setOutput(""); setError(null); }}>Clear</Button>
        </div>
      </div>
      <TextArea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={6}
        placeholder={mode === "encode" ? "Hello world…" : "SGVsbG8gd29ybGQ="}
        className="font-mono text-xs"
        aria-label={mode === "encode" ? "Text to encode" : "Base64 to decode"}
      />
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      )}
      {output && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Result</p>
            <CopyButton text={output} />
          </div>
          <TextArea value={output} readOnly rows={6} className="font-mono text-xs" aria-label="Result" />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------- URL */

export function UrlEncoder() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [type, setType] = useState<"component" | "full">("component");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const run = () => {
    setError(null);
    try {
      if (mode === "encode") {
        setOutput(type === "component" ? encodeURIComponent(input) : encodeURI(input));
      } else {
        setOutput(type === "component" ? decodeURIComponent(input) : decodeURI(input));
      }
    } catch {
      setError("This text doesn't look like a valid encoded URL.");
      setOutput("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Tabs
          tabs={[
            { id: "encode", label: "Encode" },
            { id: "decode", label: "Decode" },
          ]}
          active={mode}
          onChange={(m) => setMode(m)}
        />
        <Field label="Mode" htmlFor="url-type">
          <Select id="url-type" value={type} onChange={(e) => setType(e.target.value as "component" | "full")}>
            <option value="component">Query-string values (encodeURIComponent)</option>
            <option value="full">Full URL (encodeURI)</option>
          </Select>
        </Field>
        <Button onClick={run} icon={<ArrowRight className="h-4 w-4" />}>{mode === "encode" ? "Encode" : "Decode"}</Button>
      </div>
      <TextArea value={input} onChange={(e) => setInput(e.target.value)} rows={5} placeholder="https://example.com/?q=hello world" className="font-mono text-xs" aria-label="URL input" />
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      )}
      {output && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Result</p>
            <CopyButton text={output} />
          </div>
          <TextArea value={output} readOnly rows={5} className="font-mono text-xs" aria-label="URL result" />
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- UUID */

export function UuidGenerator() {
  const [count, setCount] = useState("5");
  const [uppercase, setUppercase] = useState(false);
  const [uuids, setUuids] = useState<string[]>([]);
  const { toast } = useToast();

  const generate = () => {
    const n = Math.max(1, Math.min(100, parseInt(count, 10) || 1));
    const list = Array.from({ length: n }, () => {
      const value = crypto.randomUUID();
      return uppercase ? value.toUpperCase() : value;
    });
    setUuids(list);
  };

  const copy = async (text: string, label: string) => {
    const ok = await copyToClipboard(text);
    if (ok) toast(`${label} copied to clipboard`, "success");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="How many?" htmlFor="uuid-count">
          <TextInput id="uuid-count" type="number" min={1} max={100} value={count} onChange={(e) => setCount(e.target.value)} className="w-28" />
        </Field>
        <div className="flex items-center gap-2 pb-2">
          <Toggle checked={uppercase} onChange={setUppercase} label="Uppercase" />
          <span className="text-sm text-slate-600 dark:text-slate-300">Uppercase</span>
        </div>
        <Button onClick={generate} icon={<Dices className="h-4 w-4" />}>Generate UUIDs</Button>
      </div>
      {uuids.length > 0 && (
        <div className="space-y-3">
          <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/40">
            <ul className="space-y-1">
              {uuids.map((uuid) => (
                <li key={uuid} className="flex items-center justify-between gap-2">
                  <code className="truncate font-mono text-xs text-slate-800 dark:text-slate-100">{uuid}</code>
                  <button type="button" onClick={() => copy(uuid, "UUID")} className="shrink-0 rounded p-1 text-slate-400 hover:text-brand-600" aria-label={`Copy ${uuid}`}>
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => copy(uuids.join("\n"), "List")}>Copy as list</Button>
            <Button size="sm" variant="outline" onClick={() => copy(uuids.join(", "), "Comma-separated list")}>Copy as CSV</Button>
            <Button size="sm" variant="outline" onClick={() => copy(JSON.stringify(uuids), "JSON array")}>Copy as JSON</Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------- TimestampConverter */

export function TimestampConverter() {
  const [timestamp, setTimestamp] = useState("");
  const [dateInput, setDateInput] = useState("");

  const parsed = useMemo(() => {
    const raw = timestamp.trim();
    if (!raw) return null;
    const value = Number(raw);
    if (!Number.isFinite(value)) return null;
    const ms = raw.length >= 13 ? value : value * 1000;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? null : date;
  }, [timestamp]);

  const dateOutput = useMemo(() => {
    if (!dateInput) return null;
    const date = new Date(dateInput);
    return Number.isNaN(date.getTime()) ? null : date;
  }, [dateInput]);

  const now = () => {
    setTimestamp(String(Math.floor(Date.now() / 1000)));
  };

  const formatDate = (date: Date) => ({
    local: date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "medium" }),
    utc: date.toUTCString(),
    iso: date.toISOString(),
  });

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
        <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Unix timestamp → date</p>
        <div className="flex flex-wrap gap-2">
          <TextInput value={timestamp} onChange={(e) => setTimestamp(e.target.value)} placeholder="1755000000 (seconds) or 1755000000000 (ms)" className="flex-1 min-w-52 font-mono" />
          <Button variant="secondary" onClick={now}>Use now</Button>
        </div>
        {parsed && (
          <div className="mt-3 space-y-1 text-sm">
            <p className="text-slate-700 dark:text-slate-200"><span className="text-slate-400">Local:</span> {formatDate(parsed).local}</p>
            <p className="text-slate-700 dark:text-slate-200"><span className="text-slate-400">UTC:</span> {formatDate(parsed).utc}</p>
            <p className="text-slate-700 dark:text-slate-200"><span className="text-slate-400">ISO:</span> {formatDate(parsed).iso}</p>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
        <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Date → Unix timestamp</p>
        <TextInput type="datetime-local" value={dateInput} onChange={(e) => setDateInput(e.target.value)} className="max-w-xs" aria-label="Date and time" />
        {dateOutput && (
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <p className="text-slate-700 dark:text-slate-200">
              Seconds: <code className="rounded bg-white px-2 py-0.5 font-mono dark:bg-slate-800">{Math.floor(dateOutput.getTime() / 1000)}</code>
            </p>
            <p className="text-slate-700 dark:text-slate-200">
              Milliseconds: <code className="rounded bg-white px-2 py-0.5 font-mono dark:bg-slate-800">{dateOutput.getTime()}</code>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- RegexTester */

export function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState({ g: true, i: false, m: false, s: false });
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { count, nodes, regexError } = useMemo(() => {
    if (!pattern) return { count: 0, nodes: [] as React.ReactNode[], regexError: null };
    try {
      const flagString = (Object.keys(flags) as (keyof typeof flags)[])
        .filter((f) => flags[f])
        .join("");
      const nodes: React.ReactNode[] = [];
      let count = 0;
      let lastIndex = 0;
      let match: RegExpExecArray | null;
      const globalRegex = new RegExp(pattern, flagString.includes("g") ? flagString : flagString + "g");
      while ((match = globalRegex.exec(text)) !== null) {
        const start = match.index;
        const end = start + match[0].length;
        if (end === start) {
          globalRegex.lastIndex++;
          continue;
        }
        nodes.push(text.slice(lastIndex, start));
        nodes.push(
          <mark key={start} className="rounded bg-amber-200 px-0.5 text-slate-900 dark:bg-amber-400/70">
            {text.slice(start, end)}
          </mark>
        );
        lastIndex = end;
        count++;
      }
      nodes.push(text.slice(lastIndex));
      return { count, nodes, regexError: null };
    } catch (err) {
      return {
        count: 0,
        nodes: [],
        regexError: err instanceof Error ? err.message : "Invalid regular expression.",
      };
    }
  }, [pattern, flags, text]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Regular expression" htmlFor="regex-pattern">
          <div className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/30 dark:border-slate-600 dark:bg-slate-800">
            <span className="text-sm text-slate-400">/</span>
            <input
              id="regex-pattern"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className="h-10 w-full bg-transparent font-mono text-sm text-slate-900 outline-none dark:text-slate-100"
              placeholder="\b\w+@\w+\.\w+\b"
            />
            <span className="text-sm text-slate-400">/</span>
          </div>
        </Field>
        <div className="flex flex-wrap items-center gap-4 pb-2">
          {(["g", "i", "m", "s"] as const).map((flag) => (
            <div key={flag} className="flex items-center gap-1.5">
              <Toggle checked={flags[flag]} onChange={(v) => setFlags((f) => ({ ...f, [flag]: v }))} label={`${flag} flag`} />
              <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">{flag}</span>
            </div>
          ))}
        </div>
      </div>
      <TextArea value={text} onChange={(e) => setText(e.target.value)} rows={8} placeholder="Paste test text here — matches are highlighted instantly…" aria-label="Test text" />
      {(error ?? regexError) && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">
          {error ?? regexError}
        </p>
      )}
      {pattern && !error && !regexError && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {count} match{count === 1 ? "" : "es"}
            </p>
          </div>
          <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200">
            {nodes.length > 0 ? nodes : <span className="text-slate-400">No matches.</span>}
          </div>
        </div>
      )}
    </div>
  );
}
