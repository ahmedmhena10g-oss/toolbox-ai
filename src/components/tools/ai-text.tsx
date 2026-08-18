"use client";

import { useMemo, useState } from "react";
import { RefreshCw, Wand2, Copy, ArrowRight, Languages } from "lucide-react";
import { useToast } from "../ui/Toast";
import { Button, CopyButton } from "../ui/feedback";
import { Field, Select, TextArea, TextInput } from "../ui/form";
import { downloadTxt } from "@/lib/textdownload";
import { copyToClipboard, sleep } from "@/lib/utils";

/* ------------------------------------------------------------ Summarizer */

const STOP_WORDS = new Set(
  "the a an and or but if then else for of to in on at by with from as is are was were be been being have has had do does did will would can could should may might must this that these those it its there here what which who whom whose when where why how all any both each few more most other some such no nor not only own same so than too very just about into over under again further once also your my our their his her its our yours theirs ours".split(" ")
);

const splitSentences = (text: string): string[] =>
  text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'(])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1);

const summarize = (text: string, length: "short" | "medium" | "detailed"): string => {
  const sentences = splitSentences(text);
  if (sentences.length <= 3) return text.trim();

  const words = text.toLowerCase().match(/[a-z0-9']+/g) ?? [];
  const freq = new Map<string, number>();
  for (const word of words) {
    if (STOP_WORDS.has(word) || word.length < 3) continue;
    freq.set(word, (freq.get(word) ?? 0) + 1);
  }
  const maxFreq = Math.max(1, ...freq.values());

  const scored = sentences.map((sentence, index) => {
    const sentenceWords = sentence.toLowerCase().match(/[a-z0-9']+/g) ?? [];
    let score = 0;
    for (const word of sentenceWords) {
      if (freq.has(word)) score += freq.get(word)! / maxFreq;
    }
    score /= Math.max(1, sentenceWords.length);
    // Positional bonus: opening sentences usually state the topic.
    if (index === 0) score *= 1.5;
    if (index === 1) score *= 1.2;
    // Slight length penalty for very long sentences.
    score *= Math.min(1.4, 30 / Math.max(15, sentenceWords.length));
    return { sentence, score, index };
  });

  const ratio = length === "short" ? 0.18 : length === "medium" ? 0.35 : 0.55;
  const target = Math.max(1, Math.min(sentences.length - 1, Math.round(sentences.length * ratio)));
  const chosen = new Set(scored.sort((a, b) => b.score - a.score).slice(0, target).map((s) => s.index));
  return scored
    .filter((s) => chosen.has(s.index))
    .sort((a, b) => a.index - b.index)
    .map((s) => s.sentence)
    .join(" ");
};

export function TextSummarizer() {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [length, setLength] = useState<"short" | "medium" | "detailed">("medium");
  const [output, setOutput] = useState("");

  const run = () => {
    if (!text.trim()) {
      toast("Please paste some text to summarize first.", "error");
      return;
    }
    setOutput(summarize(text, length));
    toast("Summary generated", "success");
  };

  const originalCount = useMemo(() => (text.match(/\S+/g) ?? []).length, [text]);
  const summaryCount = useMemo(() => (output.match(/\S+/g) ?? []).length, [output]);

  return (
    <div className="space-y-4">
      <TextArea value={text} onChange={(e) => setText(e.target.value)} rows={9} placeholder="Paste the article or text you want to summarize…" aria-label="Text to summarize" />
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Summary length" htmlFor="summary-length">
          <Select id="summary-length" value={length} onChange={(e) => setLength(e.target.value as typeof length)}>
            <option value="short">Short — key points only</option>
            <option value="medium">Medium — main ideas</option>
            <option value="detailed">Detailed — thorough overview</option>
          </Select>
        </Field>
        <Button onClick={run} icon={<Wand2 className="h-4 w-4" />}>Summarize</Button>
        <Button variant="ghost" icon={<RefreshCw className="h-4 w-4" />} onClick={() => { setText(""); setOutput(""); }}>Clear</Button>
      </div>
      {output && (
        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Summary — {summaryCount} words from {originalCount} original
            </p>
            <div className="flex gap-2">
              <CopyButton text={output} />
              <Button size="sm" variant="outline" onClick={() => { downloadTxt(output, "summary.txt"); toast("Summary downloaded", "success"); }}>
                Download
              </Button>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 leading-relaxed text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200">
            {output}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------- Rewriter */

type Style = "professional" | "simple" | "formal" | "friendly" | "academic";

const REPLACEMENTS: Record<Style, [RegExp, string][]> = {
  professional: [
    [/\bdon't\b/gi, "do not"],
    [/\bcan't\b/gi, "cannot"],
    [/\bwon't\b/gi, "will not"],
    [/\bwouldn't\b/gi, "would not"],
    [/\bdoesn't\b/gi, "does not"],
    [/\bget\b/gi, "obtain"],
    [/\bgot\b/gi, "received"],
    [/\bhelp\b/gi, "assist"],
    [/\bstart\b/gi, "begin"],
    [/\bfix\b/gi, "resolve"],
    [/\bbuy\b/gi, "purchase"],
    [/\btell\b/gi, "inform"],
    [/\bask\b/gi, "request"],
    [/\bshow\b/gi, "demonstrate"],
    [/\buse\b/gi, "utilize"],
    [/\bbig\b/gi, "substantial"],
    [/\bsmall\b/gi, "minor"],
  ],
  simple: [
    [/\bhowever\b/gi, "but"],
    [/\btherefore\b/gi, "so"],
    [/\badditionally\b/gi, "also"],
    [/\bfurthermore\b/gi, "also"],
    [/\butilize\b/gi, "use"],
    [/\bapproximately\b/gi, "about"],
    [/\bobtain\b/gi, "get"],
    [/\bpurchase\b/gi, "buy"],
    [/\bassist\b/gi, "help"],
    [/\bcommence\b/gi, "start"],
    [/\bnumerous\b/gi, "many"],
    [/\bsubstantial\b/gi, "big"],
    [/\bdemonstrate\b/gi, "show"],
    [/\bregarding\b/gi, "about"],
    [/\binitiate\b/gi, "start"],
    [/\bterminate\b/gi, "end"],
  ],
  formal: [
    [/\bdon't\b/gi, "do not"],
    [/\bcan't\b/gi, "cannot"],
    [/\bwon't\b/gi, "will not"],
    [/\bisn't\b/gi, "is not"],
    [/\baren't\b/gi, "are not"],
    [/\bwasn't\b/gi, "was not"],
    [/\bit's\b/gi, "it is"],
    [/\bthat's\b/gi, "that is"],
    [/\bI'm\b/gi, "I am"],
    [/\byou're\b/gi, "you are"],
    [/\bwe're\b/gi, "we are"],
    [/\bthey're\b/gi, "they are"],
    [/\bget\b/gi, "obtain"],
    [/\bask\b/gi, "enquire"],
    [/\bthanks\b/gi, "thank you"],
    [/\bbecause\b/gi, "due to the fact that"],
  ],
  friendly: [
    [/\bdo not\b/gi, "don't"],
    [/\bcannot\b/gi, "can't"],
    [/\bwill not\b/gi, "won't"],
    [/\bis not\b/gi, "isn't"],
    [/\bare not\b/gi, "aren't"],
    [/\bit is\b/gi, "it's"],
    [/\bI am\b/gi, "I'm"],
    [/\byou are\b/gi, "you're"],
    [/\bwe are\b/gi, "we're"],
    [/\bthey are\b/gi, "they're"],
    [/\bplease\b/gi, "please"],
    [/\bgood\b/gi, "great"],
    [/\bvery\b/gi, "really"],
    [/\bthank you\b/gi, "thanks"],
    [/\bhowever\b/gi, "that said"],
  ],
  academic: [
    [/\bdon't\b/gi, "do not"],
    [/\bcan't\b/gi, "cannot"],
    [/\bwon't\b/gi, "will not"],
    [/\bget\b/gi, "obtain"],
    [/\bshow\b/gi, "demonstrate"],
    [/\bthink\b/gi, "contend"],
    [/\bfind\b/gi, "identify"],
    [/\bbig\b/gi, "significant"],
    [/\bimportant\b/gi, "salient"],
    [/\buse\b/gi, "employ"],
    [/\bmany\b/gi, "numerous"],
    [/\babout\b/gi, "regarding"],
    [/\bclearly\b/gi, "evidently"],
    [/\ba lot\b/gi, "a considerable amount"],
  ],
};

export function TextRewriter() {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [style, setStyle] = useState<Style>("professional");
  const [output, setOutput] = useState("");

  const run = () => {
    if (!text.trim()) {
      toast("Please paste some text to rewrite first.", "error");
      return;
    }
    let result = text;
    for (const [pattern, replacement] of REPLACEMENTS[style]) {
      result = result.replace(pattern, replacement);
    }
    // Capitalize sentence starts for readability.
    result = result.replace(/(^\s*\w|[.!?]\s+\w)/g, (m) => m.toUpperCase());
    setOutput(result);
    toast("Text rewritten", "success");
  };

  return (
    <div className="space-y-4">
      <TextArea value={text} onChange={(e) => setText(e.target.value)} rows={9} placeholder="Paste the text you want to rewrite…" aria-label="Text to rewrite" />
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Style" htmlFor="rewrite-style">
          <Select id="rewrite-style" value={style} onChange={(e) => setStyle(e.target.value as Style)}>
            <option value="professional">Professional</option>
            <option value="simple">Simple</option>
            <option value="formal">Formal</option>
            <option value="friendly">Friendly</option>
            <option value="academic">Academic</option>
          </Select>
        </Field>
        <Button onClick={run} icon={<Wand2 className="h-4 w-4" />}>Rewrite</Button>
        <Button variant="ghost" icon={<RefreshCw className="h-4 w-4" />} onClick={() => { setText(""); setOutput(""); }}>Clear</Button>
      </div>
      {output && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Rewritten text</p>
            <CopyButton text={output} />
          </div>
          <TextArea value={output} readOnly rows={9} aria-label="Rewritten text" />
        </div>
      )}
      <p className="text-xs text-slate-400">
        This on-device rewriter adjusts vocabulary and tone while keeping the original meaning. For complex creative
        writing, results are more limited than full cloud AI models.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------ Translator */

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "ar", name: "Arabic" },
  { code: "fr", name: "French" },
  { code: "es", name: "Spanish" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "tr", name: "Turkish" },
  { code: "zh-CN", name: "Chinese (Simplified)" },
  { code: "ja", name: "Japanese" },
  { code: "hi", name: "Hindi" },
  { code: "nl", name: "Dutch" },
  { code: "pl", name: "Polish" },
  { code: "sv", name: "Swedish" },
];

const translateChunk = async (chunk: string, source: string, target: string): Promise<string> => {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${source}|${target}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error("translation service unavailable");
  const data = (await response.json()) as { responseStatus: number; responseDetails?: string; responseData?: { translatedText?: string } };
  if (data.responseStatus !== 200) {
    if (data.responseStatus === 429) throw new Error("rate limited");
    throw new Error("translation failed");
  }
  return data.responseData?.translatedText ?? chunk;
};

export function Translator() {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [source, setSource] = useState("en");
  const [target, setTarget] = useState("ar");
  const [output, setOutput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState("");

  const run = async () => {
    if (!text.trim()) {
      toast("Please type some text to translate first.", "error");
      return;
    }
    setProcessing(true);
    setOutput("");
    setStatus("Translating…");
    try {
      const sentences = text.match(/[^.!?]+[.!?]*\s*/g) ?? [text];
      const chunks: string[] = [];
      let current = "";
      for (const sentence of sentences) {
        if ((current + sentence).length > 400) {
          if (current) chunks.push(current);
          current = sentence;
        } else {
          current += sentence;
        }
      }
      if (current) chunks.push(current);

      const translated: string[] = [];
      for (let i = 0; i < chunks.length; i++) {
        setStatus(`Translating part ${i + 1} of ${chunks.length}…`);
        try {
          translated.push(await translateChunk(chunks[i], source, target));
        } catch (err) {
          const message = err instanceof Error ? err.message : "error";
          if (message === "rate limited") {
            setStatus("Rate limit reached — waiting a moment…");
            await sleep(1500);
            translated.push(await translateChunk(chunks[i], source, target));
          } else {
            throw err;
          }
        }
        await sleep(150);
      }
      setOutput(translated.join(" ").replace(/\s+/g, " ").trim());
      setStatus("");
      toast("Translation complete", "success");
    } catch {
      setStatus("");
      toast(
        "The translation service couldn't be reached right now. Please try again in a moment.",
        "error"
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="From" htmlFor="src-lang">
          <Select id="src-lang" value={source} onChange={(e) => setSource(e.target.value)}>
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.name}</option>
            ))}
          </Select>
        </Field>
        <button
          type="button"
          aria-label="Swap languages"
          onClick={() => {
            setSource(target);
            setTarget(source);
            setOutput("");
          }}
          className="mb-2 rounded-lg border border-slate-300 bg-white p-2.5 text-slate-500 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-transparent dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <ArrowRight className="h-4 w-4 rotate-90" />
        </button>
        <Field label="To" htmlFor="target-lang">
          <Select id="target-lang" value={target} onChange={(e) => setTarget(e.target.value)}>
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.name}</option>
            ))}
          </Select>
        </Field>
        <Button onClick={run} loading={processing} icon={<Languages className="h-4 w-4" />}>
          Translate
        </Button>
      </div>
      <TextArea value={text} onChange={(e) => setText(e.target.value)} rows={6} placeholder="Type or paste text to translate…" aria-label="Text to translate" />
      {(processing || status) && <p className="text-sm text-slate-400">{status || "Working…"}</p>}
      {output && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Translation</p>
            <CopyButton text={output} />
          </div>
          <TextArea value={output} readOnly rows={6} aria-label="Translation" />
        </div>
      )}
      <p className="text-xs text-slate-400">
        Translation uses a free public translation API, so your text is sent to that service. For fully private
        processing, use the on-device tools.
      </p>
    </div>
  );
}
