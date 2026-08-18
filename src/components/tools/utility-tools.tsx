"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RefreshCw, Copy, Dices, Download } from "lucide-react";
import { useToast } from "../ui/Toast";
import { Button, CopyButton } from "../ui/feedback";
import { Field, Select, Slider, Tabs, TextInput } from "../ui/form";
import { copyToClipboard } from "@/lib/utils";
import { unitCategories, convertUnit, formatNumber } from "@/lib/units";

/* -------------------------------------------------------------- Calculator */

const KEYS = ["C", "(", ")", "⌫", "7", "8", "9", "÷", "4", "5", "6", "×", "1", "2", "3", "-", "0", ".", "=", "+"];

export function Calculator() {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");

  const evaluate = (expr: string): string => {
    try {
      const cleaned = expr.replace(/×/g, "*").replace(/÷/g, "/").replace(/%/g, "/100");
      if (!/^[0-9+\-*/().\s]+$/.test(cleaned)) throw new Error("bad");
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${cleaned});`)();
      if (typeof result !== "number" || !Number.isFinite(result)) throw new Error("bad");
      return String(parseFloat(result.toPrecision(12)));
    } catch {
      return "Error";
    }
  };

  const press = (key: string) => {
    if (key === "C") {
      setDisplay("0");
      setExpression("");
      return;
    }
    if (key === "⌫") {
      setDisplay((d) => (d.length > 1 ? d.slice(0, -1) : "0"));
      setExpression((e) => e.slice(0, -1));
      return;
    }
    if (key === "=") {
      const result = evaluate(expression || display);
      setDisplay(result);
      setExpression("");
      return;
    }
    setExpression((e) => e + key);
    setDisplay((d) => (d === "0" && /[0-9]/.test(key) ? key : d + key));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, string> = { Enter: "=", "*": "×", "/": "÷", Backspace: "⌫", Escape: "C" };
      const key = map[e.key] ?? e.key;
      if (KEYS.includes(key)) {
        e.preventDefault();
        press(key);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [display, expression]);

  return (
    <div className="mx-auto max-w-sm">
      <div className="rounded-2xl border border-slate-200 bg-slate-900 p-4 dark:border-slate-700">
        <div className="mb-3 min-h-14 rounded-xl bg-slate-800 px-4 py-3 text-right">
          <p className="truncate text-xs text-slate-400">{expression || " "}</p>
          <p className="truncate text-3xl font-bold tabular-nums text-white" aria-live="polite">
            {display}
          </p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => press(key)}
              className={`h-12 rounded-xl text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                key === "="
                  ? "bg-brand-600 text-white hover:bg-brand-700"
                  : /[0-9.]/.test(key)
                  ? "bg-slate-700 text-white hover:bg-slate-600"
                  : "bg-slate-600 text-slate-200 hover:bg-slate-500"
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------ PercentageCalculator */

type PercentMode = "of" | "increase" | "decrease" | "difference";

export function PercentageCalculator() {
  const [mode, setMode] = useState<PercentMode>("of");
  const [a, setA] = useState("15");
  const [b, setB] = useState("200");
  const [c, setC] = useState("");

  const result = useMemo(() => {
    const na = parseFloat(a);
    const nb = parseFloat(b);
    const nc = parseFloat(c);
    if (!Number.isFinite(na) || !Number.isFinite(nb)) return null;
    switch (mode) {
      case "of":
        return { value: (na / 100) * nb, text: `${na}% of ${nb} = ${formatNumber((na / 100) * nb, 4)}` };
      case "increase": {
        const resultValue = nb + (na / 100) * nb;
        return { value: resultValue, text: `${nb} increased by ${na}% = ${formatNumber(resultValue, 4)}` };
      }
      case "decrease": {
        const resultValue = nb - (na / 100) * nb;
        return { value: resultValue, text: `${nb} decreased by ${na}% = ${formatNumber(resultValue, 4)}` };
      }
      case "difference": {
        if (!Number.isFinite(nc)) return null;
        const diff = Math.abs(na - nb);
        const avg = (na + nb) / 2;
        const pct = avg === 0 ? 0 : (diff / avg) * 100;
        return { value: pct, text: `Difference between ${na} and ${nb} = ${formatNumber(pct, 2)}%` };
      }
    }
  }, [mode, a, b, c]);

  return (
    <div className="space-y-4">
      <Tabs
        tabs={[
          { id: "of", label: "What is X% of Y?" },
          { id: "increase", label: "Increase" },
          { id: "decrease", label: "Decrease" },
          { id: "difference", label: "Difference" },
        ]}
        active={mode}
        onChange={(m) => setMode(m)}
      />
      <div className="flex flex-wrap items-end gap-3">
        <Field label={mode === "of" ? "Percentage (X)" : mode === "difference" ? "First value" : "Percentage"}>
          <TextInput type="number" value={a} onChange={(e) => setA(e.target.value)} className="w-32" />
        </Field>
        {mode === "difference" ? (
          <Field label="Second value">
            <TextInput type="number" value={b} onChange={(e) => setB(e.target.value)} className="w-32" />
          </Field>
        ) : (
          <Field label="Value (Y)">
            <TextInput type="number" value={b} onChange={(e) => setB(e.target.value)} className="w-32" />
          </Field>
        )}
        {mode === "difference" && (
          <Field label="(Optional) known percent">
            <TextInput type="number" value={c} onChange={(e) => setC(e.target.value)} className="w-32" />
          </Field>
        )}
      </div>
      {result && (
        <p className="rounded-xl bg-brand-50 px-4 py-3 text-base font-semibold text-brand-800 dark:bg-brand-500/10 dark:text-brand-300">
          {result.text}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------- AgeCalculator */

export function AgeCalculator() {
  const [dob, setDob] = useState("");
  const [target, setTarget] = useState("");
  const [result, setResult] = useState<{ years: number; months: number; days: number; nextDays: number; weekday: string } | null>(null);

  const calculate = () => {
    const birth = new Date(dob);
    if (Number.isNaN(birth.getTime())) return;
    const end = target ? new Date(target) : new Date();
    if (end < birth) return;

    let years = end.getFullYear() - birth.getFullYear();
    let months = end.getMonth() - birth.getMonth();
    let days = end.getDate() - birth.getDate();
    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
      days += prevMonth;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const nextBirthday = new Date(end.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBirthday < end) nextBirthday.setFullYear(end.getFullYear() + 1);
    const nextDays = Math.ceil((nextBirthday.getTime() - end.getTime()) / 86400000);

    const weekday = birth.toLocaleDateString(undefined, { weekday: "long" });
    setResult({ years, months, days, nextDays, weekday });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Date of birth" htmlFor="dob">
          <TextInput id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
        </Field>
        <Field label="Target date (optional)" htmlFor="target-date">
          <TextInput id="target-date" type="date" value={target} onChange={(e) => setTarget(e.target.value)} />
        </Field>
        <Button onClick={calculate}>Calculate age</Button>
      </div>
      {result && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {[
            { label: "Years", value: result.years },
            { label: "Months", value: result.months },
            { label: "Days", value: result.days },
            { label: "Next birthday", value: `${result.nextDays} days` },
            { label: "Born on", value: result.weekday },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-4 text-center dark:border-slate-700 dark:bg-slate-800/60">
              <p className="text-xl font-extrabold tabular-nums text-brand-600 dark:text-brand-400">{item.value}</p>
              <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{item.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------- UnitConverter */

export function UnitConverter() {
  const [categoryId, setCategoryId] = useState("length");
  const category = unitCategories.find((c) => c.id === categoryId)!;
  const [value, setValue] = useState("1");
  const [fromId, setFromId] = useState(category.units[0].id);
  const [toId, setToId] = useState(category.units[1].id);

  useEffect(() => {
    const next = unitCategories.find((c) => c.id === categoryId)!;
    setFromId(next.units[0].id);
    setToId(next.units[1].id);
  }, [categoryId]);

  const numeric = parseFloat(value);
  const valid = Number.isFinite(numeric);
  const primary = valid ? convertUnit(categoryId, numeric, fromId, toId) : null;
  const all = useMemo(
    () =>
      valid
        ? category.units
            .filter((u) => u.id !== fromId)
            .map((u) => ({ unit: u, value: convertUnit(categoryId, numeric, fromId, u.id) }))
        : [],
    [categoryId, valid, numeric, fromId, category]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Category" htmlFor="unit-category">
          <Select id="unit-category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {unitCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Value" htmlFor="unit-value">
          <TextInput id="unit-value" type="number" value={value} onChange={(e) => setValue(e.target.value)} className="w-36" />
        </Field>
        <Field label="From" htmlFor="unit-from">
          <Select id="unit-from" value={fromId} onChange={(e) => setFromId(e.target.value)}>
            {category.units.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="To" htmlFor="unit-to">
          <Select id="unit-to" value={toId} onChange={(e) => setToId(e.target.value)}>
            {category.units.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </Select>
        </Field>
      </div>

      {primary !== null && (
        <div className="rounded-xl bg-brand-50 px-4 py-4 dark:bg-brand-500/10">
          <p className="text-3xl font-extrabold tabular-nums text-slate-900 dark:text-white">
            {formatNumber(numeric)} <span className="text-base font-semibold text-slate-500">{category.units.find((u) => u.id === fromId)?.name}</span>
          </p>
          <p className="mt-1 text-lg font-semibold text-brand-700 dark:text-brand-300">
            = {formatNumber(primary)} <span className="text-sm font-medium">{category.units.find((u) => u.id === toId)?.name}</span>
          </p>
        </div>
      )}

      {all.length > 0 && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700">
          {all.map((row, i) => (
            <div key={row.unit.id} className={`flex items-center justify-between px-4 py-2.5 text-sm ${i % 2 ? "" : "bg-slate-50 dark:bg-slate-800/40"}`}>
              <span className="text-slate-600 dark:text-slate-300">{row.unit.name}</span>
              <span className="font-semibold tabular-nums text-slate-900 dark:text-white">
                {row.value !== null ? formatNumber(row.value) : "—"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------- RandomNumber */

export function RandomNumber() {
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [count, setCount] = useState("5");
  const [unique, setUnique] = useState(false);
  const [numbers, setNumbers] = useState<number[]>([]);

  const generate = () => {
    const lo = Math.floor(parseFloat(min) || 0);
    const hi = Math.floor(parseFloat(max) || 100);
    const n = Math.max(1, Math.min(1000, parseInt(count, 10) || 1));
    if (hi < lo) return;
    const out: number[] = [];
    if (unique) {
      const range = hi - lo + 1;
      const wanted = Math.min(n, range);
      const pool = new Set<number>();
      while (pool.size < wanted) {
        pool.add(lo + Math.floor(Math.random() * range));
      }
      out.push(...pool);
    } else {
      for (let i = 0; i < n; i++) out.push(lo + Math.floor(Math.random() * (hi - lo + 1)));
    }
    setNumbers(out);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Minimum"><TextInput type="number" value={min} onChange={(e) => setMin(e.target.value)} className="w-28" /></Field>
        <Field label="Maximum"><TextInput type="number" value={max} onChange={(e) => setMax(e.target.value)} className="w-28" /></Field>
        <Field label="Quantity"><TextInput type="number" min={1} value={count} onChange={(e) => setCount(e.target.value)} className="w-28" /></Field>
        <label className="flex items-center gap-2 pb-2.5 text-sm text-slate-600 dark:text-slate-300">
          <input type="checkbox" checked={unique} onChange={(e) => setUnique(e.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-brand-600" />
          Unique values
        </label>
        <Button onClick={generate} icon={<Dices className="h-4 w-4" />}>Generate</Button>
      </div>
      {numbers.length > 0 && (
        <div>
          <div className="flex flex-wrap gap-2">
            {numbers.map((num, i) => (
              <span key={`${num}-${i}`} className="rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-sm font-semibold tabular-nums text-slate-800 dark:bg-slate-800 dark:text-slate-100">
                {num}
              </span>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="outline" onClick={() => copyToClipboard(numbers.join(" "))}>Copy as list</Button>
            <Button size="sm" variant="outline" onClick={() => copyToClipboard(numbers.join(", "))}>Copy comma-separated</Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------- QrGenerator */

type QrType = "text" | "url" | "email" | "phone" | "wifi";

export function QrGenerator() {
  const { toast } = useToast();
  const [type, setType] = useState<QrType>("url");
  const [text, setText] = useState("https://toolbox-ai.com");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [phone, setPhone] = useState("");
  const [ssid, setSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiSecurity, setWifiSecurity] = useState("WPA");
  const [hidden, setHidden] = useState(false);
  const [size, setSize] = useState(300);
  const [fg, setFg] = useState("#111827");
  const [bg, setBg] = useState("#ffffff");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const content = useMemo(() => {
    switch (type) {
      case "url":
        return text;
      case "email":
        return `mailto:${email}${subject || body ? `?${subject ? `subject=${encodeURIComponent(subject)}` : ""}${subject && body ? "&" : ""}${body ? `body=${encodeURIComponent(body)}` : ""}` : ""}`;
      case "phone":
        return `tel:${phone.replace(/\s+/g, "")}`;
      case "wifi":
        return `WIFI:T:${wifiSecurity};S:${ssid};P:${wifiPassword};${hidden ? "H:true;" : ""};`;
      default:
        return text;
    }
  }, [type, text, email, subject, body, phone, ssid, wifiPassword, wifiSecurity, hidden]);

  useEffect(() => {
    let cancelled = false;
    if (!content.trim()) {
      setQrDataUrl(null);
      return;
    }
    setBusy(true);
    const timer = setTimeout(async () => {
      try {
        const QRCode = (await import("qrcode")).default;
        const dataUrl = await QRCode.toDataURL(content, {
          width: size,
          margin: 2,
          errorCorrectionLevel: "M",
          color: { dark: fg, light: bg },
        });
        if (!cancelled) setQrDataUrl(dataUrl);
      } catch {
        if (!cancelled) setQrDataUrl(null);
      } finally {
        if (!cancelled) setBusy(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [content, size, fg, bg]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <Tabs
          tabs={[
            { id: "text", label: "Text" },
            { id: "url", label: "URL" },
            { id: "email", label: "Email" },
            { id: "phone", label: "Phone" },
            { id: "wifi", label: "Wi-Fi" },
          ]}
          active={type}
          onChange={(t) => setType(t)}
        />
        {type === "text" && (
          <Field label="Text content">
            <TextInput value={text} onChange={(e) => setText(e.target.value)} placeholder="Any text…" />
          </Field>
        )}
        {type === "url" && (
          <Field label="URL">
            <TextInput value={text} onChange={(e) => setText(e.target.value)} placeholder="https://…" />
          </Field>
        )}
        {type === "email" && (
          <div className="space-y-3">
            <Field label="Email address"><TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></Field>
            <Field label="Subject (optional)"><TextInput value={subject} onChange={(e) => setSubject(e.target.value)} /></Field>
            <Field label="Body (optional)"><TextInput value={body} onChange={(e) => setBody(e.target.value)} /></Field>
          </div>
        )}
        {type === "phone" && (
          <Field label="Phone number">
            <TextInput value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 123 4567" />
          </Field>
        )}
        {type === "wifi" && (
          <div className="space-y-3">
            <Field label="Network name (SSID)"><TextInput value={ssid} onChange={(e) => setSsid(e.target.value)} /></Field>
            <Field label="Password"><TextInput value={wifiPassword} onChange={(e) => setWifiPassword(e.target.value)} /></Field>
            <div className="flex flex-wrap items-end gap-3">
              <Field label="Security">
                <Select value={wifiSecurity} onChange={(e) => setWifiSecurity(e.target.value)}>
                  <option value="WPA">WPA/WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">None</option>
                </Select>
              </Field>
              <label className="flex items-center gap-2 pb-2.5 text-sm text-slate-600 dark:text-slate-300">
                <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-brand-600" />
                Hidden network
              </label>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Slider label="Size" value={size} min={150} max={600} step={10} unit="px" onChange={setSize} />
          <div className="flex gap-4">
            <Field label="Foreground">
              <div className="flex items-center gap-2">
                <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="h-10 w-11 cursor-pointer rounded-lg border border-slate-300 bg-white dark:border-slate-600" aria-label="QR foreground color" />
              </div>
            </Field>
            <Field label="Background">
              <div className="flex items-center gap-2">
                <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-10 w-11 cursor-pointer rounded-lg border border-slate-300 bg-white dark:border-slate-600" aria-label="QR background color" />
              </div>
            </Field>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900/40">
        {busy && !qrDataUrl && <p className="text-sm text-slate-400">Generating…</p>}
        {qrDataUrl ? (
          <>
            <img src={qrDataUrl} alt={`QR code for ${type}: ${content.slice(0, 60)}`} width={Math.min(size, 320)} height={Math.min(size, 320)} className="rounded-lg bg-white p-2 shadow-sm" />
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="success" size="sm" icon={<Download className="h-4 w-4" />} onClick={() => {
                const a = document.createElement("a");
                a.href = qrDataUrl;
                a.download = `qr-code-${type}.png`;
                a.click();
                toast("QR code downloaded", "success");
              }}>
                Download PNG
              </Button>
              <CopyButton text={content} label="Copy content" />
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-400">Enter the content on the left to generate your QR code.</p>
        )}
      </div>
    </div>
  );
}
