"use client";

import { useMemo, useState } from "react";
import { RefreshCw, Copy, Check, ArrowRight, Wand2 } from "lucide-react";
import { useToast } from "../ui/Toast";
import { Button, CopyButton } from "../ui/feedback";
import { Field, Select, Slider, Tabs, TextArea, TextInput, Toggle } from "../ui/form";
import {
  textStats,
  convertCase,
  removeDuplicateLines,
  sortLines,
  cleanText,
  loremIpsum,
  diffLines,
  type CaseKind,
  type SortMode,
  type SortDirection,
} from "@/lib/text";
import { copyToClipboard } from "@/lib/utils";

/* ------------------------------------------------------------ WordCounter */

export function WordCounter() {
  const [text, setText] = useState("");
  const stats = useMemo(() => textStats(text), [text]);

  const items = [
    { label: "Words", value: stats.words },
    { label: "Characters", value: stats.characters },
    { label: "Characters (no spaces)", value: stats.charactersNoSpaces },
    { label: "Sentences", value: stats.sentences },
    { label: "Paragraphs", value: stats.paragraphs },
    { label: "Reading time", value: `${stats.readingTimeMinutes} min` },
  ];

  return (
    <div>
      <TextArea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        placeholder="Type or paste your text here…"
        aria-label="Text to count"
      />
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => (
          <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-4 text-center dark:border-slate-700 dark:bg-slate-800/60">
            <p className="text-2xl font-extrabold tabular-nums text-brand-600 dark:text-brand-400">{item.value}</p>
            <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{item.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <CopyButton text={text} label="Copy text" />
        <Button variant="ghost" icon={<RefreshCw className="h-4 w-4" />} onClick={() => setText("")}>
          Clear
        </Button>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- CaseConverter */

const CASES: { id: CaseKind; label: string; example: string }[] = [
  { id: "upper", label: "UPPERCASE", example: "HELLO WORLD" },
  { id: "lower", label: "lowercase", example: "hello world" },
  { id: "title", label: "Title Case", example: "Hello World" },
  { id: "sentence", label: "Sentence case", example: "Hello world" },
  { id: "camel", label: "camelCase", example: "helloWorld" },
  { id: "snake", label: "snake_case", example: "hello_world" },
  { id: "kebab", label: "kebab-case", example: "hello-world" },
];

export function CaseConverter() {
  const [text, setText] = useState("");
  const [output, setOutput] = useState("");
  const [active, setActive] = useState<CaseKind | null>(null);

  return (
    <div>
      <TextArea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder="Paste your text here…"
        aria-label="Text to convert"
      />
      <div className="mt-4 flex flex-wrap gap-2">
        {CASES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              setActive(c.id);
              setOutput(convertCase(text, c.id));
            }}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
              active === c.id
                ? "border-brand-600 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-500/10 dark:text-brand-300"
                : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-transparent dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      {output && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Result</p>
            <CopyButton text={output} />
          </div>
          <TextArea value={output} readOnly rows={6} aria-label="Converted text" />
        </div>
      )}
      <Button variant="ghost" icon={<RefreshCw className="h-4 w-4" />} className="mt-3" onClick={() => { setText(""); setOutput(""); setActive(null); }}>
        Clear
      </Button>
    </div>
  );
}

/* ------------------------------------------------------ RemoveDuplicateLines */

export function RemoveDuplicateLines() {
  const [text, setText] = useState("");
  const [output, setOutput] = useState("");
  const [trim, setTrim] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);

  const run = () => setOutput(removeDuplicateLines(text, { trim, ignoreCase }));

  return (
    <div>
      <TextArea value={text} onChange={(e) => setText(e.target.value)} rows={8} placeholder="Paste your list here…" aria-label="Lines to deduplicate" />
      <div className="mt-4 flex flex-wrap items-center gap-5">
        <div className="flex items-center gap-2">
          <Toggle checked={trim} onChange={setTrim} label="Trim whitespace" />
          <span className="text-sm text-slate-600 dark:text-slate-300">Trim whitespace</span>
        </div>
        <div className="flex items-center gap-2">
          <Toggle checked={ignoreCase} onChange={setIgnoreCase} label="Ignore case" />
          <span className="text-sm text-slate-600 dark:text-slate-300">Ignore case</span>
        </div>
        <div className="flex gap-2">
          <Button onClick={run} icon={<Wand2 className="h-4 w-4" />}>Remove duplicates</Button>
          <Button variant="ghost" icon={<RefreshCw className="h-4 w-4" />} onClick={() => { setText(""); setOutput(""); }}>Clear</Button>
        </div>
      </div>
      {output && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Result</p>
            <CopyButton text={output} />
          </div>
          <TextArea value={output} readOnly rows={8} aria-label="Deduplicated lines" />
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- SortText */

export function SortText() {
  const [text, setText] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<SortMode>("alpha");
  const [direction, setDirection] = useState<SortDirection>("asc");

  const run = () => setOutput(sortLines(text, mode, direction));

  return (
    <div>
      <TextArea value={text} onChange={(e) => setText(e.target.value)} rows={8} placeholder="Paste the lines you want to sort…" aria-label="Lines to sort" />
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <Field label="Sort by" htmlFor="sort-mode">
          <Select id="sort-mode" value={mode} onChange={(e) => setMode(e.target.value as SortMode)}>
            <option value="alpha">Alphabetically</option>
            <option value="alpha-reverse">Reverse alphabetically</option>
            <option value="numeric">Numerically</option>
            <option value="length">By length</option>
          </Select>
        </Field>
        <Field label="Order" htmlFor="sort-direction">
          <Select id="sort-direction" value={direction} onChange={(e) => setDirection(e.target.value as SortDirection)}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </Select>
        </Field>
        <div className="flex gap-2">
          <Button onClick={run} icon={<ArrowRight className="h-4 w-4" />}>Sort</Button>
          <Button variant="ghost" icon={<RefreshCw className="h-4 w-4" />} onClick={() => { setText(""); setOutput(""); }}>Clear</Button>
        </div>
      </div>
      {output && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Sorted result</p>
            <CopyButton text={output} />
          </div>
          <TextArea value={output} readOnly rows={8} aria-label="Sorted lines" />
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------- TextCleaner */

export function TextCleaner() {
  const [text, setText] = useState("");
  const [output, setOutput] = useState("");
  const [options, setOptions] = useState({
    extraSpaces: true,
    emptyLines: true,
    specialChars: false,
    normalizeBreaks: true,
    trimLines: true,
  });

  const run = () => setOutput(cleanText(text, options));

  const toggles = [
    { key: "extraSpaces" as const, label: "Remove extra spaces" },
    { key: "emptyLines" as const, label: "Remove empty lines" },
    { key: "specialChars" as const, label: "Remove special characters" },
    { key: "normalizeBreaks" as const, label: "Normalize line breaks" },
    { key: "trimLines" as const, label: "Trim lines" },
  ];

  return (
    <div>
      <TextArea value={text} onChange={(e) => setText(e.target.value)} rows={8} placeholder="Paste the messy text here…" aria-label="Text to clean" />
      <div className="mt-4 flex flex-wrap items-center gap-5">
        {toggles.map((t) => (
          <div key={t.key} className="flex items-center gap-2">
            <Toggle checked={options[t.key]} onChange={(v) => setOptions((o) => ({ ...o, [t.key]: v }))} label={t.label} />
            <span className="text-sm text-slate-600 dark:text-slate-300">{t.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <Button onClick={run} icon={<Wand2 className="h-4 w-4" />}>Clean text</Button>
        <Button variant="ghost" icon={<RefreshCw className="h-4 w-4" />} onClick={() => { setText(""); setOutput(""); }}>Clear</Button>
      </div>
      {output && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Cleaned text</p>
            <CopyButton text={output} />
          </div>
          <TextArea value={output} readOnly rows={8} aria-label="Cleaned text" />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------- LoremIpsum */

export function LoremIpsum() {
  const [unit, setUnit] = useState<"words" | "sentences" | "paragraphs">("paragraphs");
  const [amount, setAmount] = useState("3");
  const [output, setOutput] = useState("");
  const { toast } = useToast();

  const generate = () => {
    const n = Math.max(1, parseInt(amount, 10) || 1);
    setOutput(loremIpsum(unit, n));
  };

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Generate" htmlFor="lorem-unit">
          <Select id="lorem-unit" value={unit} onChange={(e) => setUnit(e.target.value as typeof unit)}>
            <option value="words">Words</option>
            <option value="sentences">Sentences</option>
            <option value="paragraphs">Paragraphs</option>
          </Select>
        </Field>
        <Field label="Amount" htmlFor="lorem-amount">
          <TextInput id="lorem-amount" type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} className="w-32" />
        </Field>
        <div className="flex gap-2">
          <Button onClick={generate} icon={<Wand2 className="h-4 w-4" />}>Generate</Button>
          {output && <CopyButton text={output} />}
        </div>
      </div>
      {output && (
        <div className="mt-4">
          <TextArea value={output} readOnly rows={10} aria-label="Generated lorem ipsum" />
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- TextDiff */

export function TextDiff() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [result, setResult] = useState<ReturnType<typeof diffLines> | null>(null);

  const compute = () => setResult(diffLines(left, right));
  const added = result?.filter((l) => l.status === "added").length ?? 0;
  const removed = result?.filter((l) => l.status === "removed").length ?? 0;

  return (
    <div>
      <div className="grid gap-3 md:grid-cols-2">
        <TextArea value={left} onChange={(e) => setLeft(e.target.value)} rows={10} placeholder="Original text…" aria-label="Original text" />
        <TextArea value={right} onChange={(e) => setRight(e.target.value)} rows={10} placeholder="Modified text…" aria-label="Modified text" />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Button onClick={compute} icon={<ArrowRight className="h-4 w-4" />}>Compare texts</Button>
        <Button variant="ghost" icon={<RefreshCw className="h-4 w-4" />} onClick={() => { setLeft(""); setRight(""); setResult(null); }}>Clear</Button>
        {result && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-emerald-600">+{added}</span> added · <span className="font-semibold text-red-500">-{removed}</span> removed
          </p>
        )}
      </div>
      {result && (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700" aria-label="Diff result">
          {result.map((line, i) => (
            <div
              key={i}
              className={`px-3 py-1 font-mono text-xs leading-relaxed ${
                line.status === "added"
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300"
                  : line.status === "removed"
                  ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              {line.status === "added" ? "+ " : line.status === "removed" ? "- " : "  "}
              {line.value || " "}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ SlugGenerator */

export function SlugGenerator() {
  const [title, setTitle] = useState("");
  const [separator, setSeparator] = useState<"-" | "_">("-");
  const [lowercase, setLowercase] = useState(true);
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const slug = useMemo(() => {
    let value = title
      .trim()
      .replace(/['']/g, "")
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .replace(/\s+/g, separator)
      .replace(/-+/g, separator)
      .replace(/_+/g, separator)
      .replace(/^-|-$/g, "");
    if (lowercase) value = value.toLowerCase();
    return value;
  }, [title, separator, lowercase]);

  const copy = async () => {
    const ok = await copyToClipboard(slug);
    if (ok) {
      setCopied(true);
      toast("Slug copied to clipboard", "success");
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div>
      <Field label="Title or phrase" htmlFor="slug-input">
        <TextInput
          id="slug-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Best Free Online Image Tools"
        />
      </Field>
      <div className="mt-4 flex flex-wrap items-center gap-5">
        <Field label="Separator" htmlFor="slug-sep">
          <Select id="slug-sep" value={separator} onChange={(e) => setSeparator(e.target.value as "-" | "_")}>
            <option value="-">Hyphen (-)</option>
            <option value="_">Underscore (_)</option>
          </Select>
        </Field>
        <div className="flex items-center gap-2">
          <Toggle checked={lowercase} onChange={setLowercase} label="Lowercase" />
          <span className="text-sm text-slate-600 dark:text-slate-300">Lowercase</span>
        </div>
      </div>
      {title && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Your slug</p>
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-transparent dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="rounded-xl bg-slate-900 px-4 py-3 font-mono text-sm text-emerald-400 dark:bg-slate-950">
            {slug || "—"}
          </p>
        </div>
      )}
    </div>
  );
}
