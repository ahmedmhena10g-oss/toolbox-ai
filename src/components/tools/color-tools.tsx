"use client";

import { useMemo, useRef, useState } from "react";
import { RefreshCw, Copy, Check, Dices } from "lucide-react";
import { useToast } from "../ui/Toast";
import { Button, CopyButton } from "../ui/feedback";
import { Field, Select, Slider, TextInput } from "../ui/form";
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  rgbToHsv,
  hslToRgb,
  hsvToRgb,
  parseRgb,
  formatRgb,
  formatHsl,
  formatHsv,
  contrastRatio,
  generatePalette,
  type Rgb,
  type HarmonyType,
} from "@/lib/color";
import { copyToClipboard } from "@/lib/utils";

/* -------------------------------------------------------------- ColorPicker */

export function ColorPicker() {
  const [rgb, setRgb] = useState<Rgb>({ r: 79, g: 70, b: 229 });
  const svRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const hex = rgbToHex(rgb);
  const hsl = rgbToHsl(rgb);
  const hsv = rgbToHsv(rgb);

  const setFromHex = (value: string) => {
    const parsed = hexToRgb(value);
    if (parsed) setRgb(parsed);
  };

  const updateSv = (clientX: number, clientY: number) => {
    const rect = svRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    const h = rgbToHsv(rgb).h;
    setRgb(hsvToRgbSafe(h, x * 100, (1 - y) * 100));
  };

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-4">
        <div
          ref={svRef}
          role="slider"
          aria-label="Saturation and value picker"
          aria-valuetext={`${Math.round(hsv.s)}% saturation, ${Math.round(hsv.v)}% value`}
          tabIndex={0}
          className="relative h-56 w-full cursor-crosshair touch-none rounded-xl border border-slate-200 select-none dark:border-slate-700"
          style={{
            background: `linear-gradient(to top, #000, rgba(0,0,0,0)), linear-gradient(to right, #fff, hsl(${hsv.h}, 100%, 50%))`,
          }}
          onPointerDown={(e) => {
            dragging.current = true;
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
            updateSv(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => dragging.current && updateSv(e.clientX, e.clientY)}
          onPointerUp={() => (dragging.current = false)}
          onKeyDown={(e) => {
            const step = e.shiftKey ? 5 : 1;
            let s = hsv.s;
            let v = hsv.v;
            if (e.key === "ArrowRight") s = Math.min(100, s + step);
            if (e.key === "ArrowLeft") s = Math.max(0, s - step);
            if (e.key === "ArrowUp") v = Math.min(100, v + step);
            if (e.key === "ArrowDown") v = Math.max(0, v - step);
            setRgb(hsvToRgbSafe(hsv.h, s, v));
          }}
        >
          <span
            className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md"
            style={{
              left: `${hsv.s}%`,
              top: `${100 - hsv.v}%`,
              backgroundColor: hex,
            }}
          />
        </div>
        <Slider label="Hue" value={hsv.h} min={0} max={359} unit="°" onChange={(h) => setRgb(hsvToRgbSafe(h, hsv.s, hsv.v))} />
      </div>

      <div className="space-y-4">
        <div
          className="h-20 rounded-xl border border-slate-200 dark:border-slate-700"
          style={{ backgroundColor: hex }}
          role="img"
          aria-label={`Preview of color ${hex}`}
        />
        <Field label="HEX" htmlFor="picker-hex">
          <div className="flex gap-2">
            <TextInput id="picker-hex" value={hex} onChange={(e) => setFromHex(e.target.value)} className="font-mono" />
            <CopyButton text={hex} />
          </div>
        </Field>
        {[
          { label: "RGB", value: formatRgb(rgb) },
          { label: "HSL", value: formatHsl(hsl) },
          { label: "HSV", value: formatHsv(hsv) },
        ].map((row) => (
          <div key={row.label} className="flex items-center gap-2">
            <span className="w-10 text-sm font-medium text-slate-500 dark:text-slate-400">{row.label}</span>
            <code className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-100">
              {row.value}
            </code>
            <CopyButton text={row.value} />
          </div>
        ))}
        <div className="grid grid-cols-3 gap-3">
          {(["r", "g", "b"] as const).map((channel) => (
            <div key={channel}>
              <label className="mb-1 block text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                {channel}
              </label>
              <input
                type="range"
                min={0}
                max={255}
                value={rgb[channel]}
                onChange={(e) => setRgb((c) => ({ ...c, [channel]: Number(e.target.value) }))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-brand-600 dark:bg-slate-700"
                aria-label={`Red channel ${channel === "r" ? "red" : channel === "g" ? "green" : "blue"}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const hsvToRgbSafe = (h: number, s: number, v: number): Rgb => hsvToRgb({ h, s, v });

/* --------------------------------------------------------------- HexToRgb */

export function HexToRgb() {
  const [hex, setHex] = useState("#4F46E5");
  const rgb = useMemo(() => hexToRgb(hex), [hex]);
  const valid = rgb !== null;

  return (
    <div className="space-y-4">
      <Field label="HEX color code" htmlFor="hex-input" hint="With or without the # prefix — for example #4F46E5 or 4F46E5.">
        <TextInput id="hex-input" value={hex} onChange={(e) => setHex(e.target.value)} className="font-mono" placeholder="#4F46E5" />
      </Field>
      <div className="flex h-16 items-center rounded-xl border border-slate-200 dark:border-slate-700" style={{ backgroundColor: valid ? rgbToHex(rgb) : "#cccccc" }}>
        {!valid && <span className="w-full text-center text-sm text-slate-500">Invalid hex code</span>}
      </div>
      {valid && rgb && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">RGB</p>
              <p className="mt-1 font-mono text-lg font-bold text-slate-900 dark:text-white">{formatRgb(rgb)}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Red {rgb.r} · Green {rgb.g} · Blue {rgb.b}
              </p>
            </div>
            <CopyButton text={formatRgb(rgb)} />
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- RgbToHex */

export function RgbToHex() {
  const [rgb, setRgb] = useState<Rgb>({ r: 79, g: 70, b: 229 });
  const hex = rgbToHex(rgb);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {(["r", "g", "b"] as const).map((channel) => (
          <Field key={channel} label={channel.toUpperCase()}>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={255}
                value={rgb[channel]}
                onChange={(e) => setRgb((c) => ({ ...c, [channel]: Number(e.target.value) }))}
                className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-brand-600 dark:bg-slate-700"
                aria-label={`${channel} channel`}
              />
              <input
                type="number"
                min={0}
                max={255}
                value={rgb[channel]}
                onChange={(e) => setRgb((c) => ({ ...c, [channel]: Math.max(0, Math.min(255, Number(e.target.value))) }))}
                className="h-10 w-16 rounded-lg border border-slate-300 bg-white px-2 text-center text-sm tabular-nums dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                aria-label={`${channel} value`}
              />
            </div>
          </Field>
        ))}
      </div>
      <div
        className="flex h-16 items-center justify-between rounded-xl border border-slate-200 px-4 dark:border-slate-700"
        style={{ backgroundColor: hex }}
      >
        <span className="rounded-lg bg-slate-900/60 px-3 py-1.5 font-mono text-sm font-bold text-white">{hex}</span>
        <CopyButton text={hex} />
      </div>
    </div>
  );
}

/* -------------------------------------------------------- PaletteGenerator */

const SWATCH_HELP: Record<HarmonyType, string> = {
  complementary: "Colors opposite each other on the color wheel — strong, high-contrast combinations.",
  analogous: "Colors next to each other on the wheel — calm, harmonious designs.",
  triadic: "Three colors evenly spaced on the wheel — vibrant but balanced.",
  monochromatic: "Tints and shades of one hue — clean and consistent.",
  random: "A random harmonious set generated from a random base color.",
};

export function PaletteGenerator() {
  const [base, setBase] = useState("#4F46E5");
  const [harmony, setHarmony] = useState<HarmonyType>("complementary");
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);

  const baseRgb = hexToRgb(base) ?? { r: 79, g: 70, b: 229 };
  const palette = useMemo(() => generatePalette(baseRgb, harmony), [baseRgb, harmony]);

  const copy = async (value: string) => {
    const ok = await copyToClipboard(value);
    if (ok) {
      setCopied(value);
      toast(`${value} copied`, "success");
      setTimeout(() => setCopied(null), 1200);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Base color" htmlFor="base-color">
          <div className="flex items-center gap-2">
            <input
              id="base-color"
              type="color"
              value={base}
              onChange={(e) => setBase(e.target.value)}
              className="h-10 w-12 cursor-pointer rounded-lg border border-slate-300 bg-white dark:border-slate-600"
              aria-label="Base color"
            />
            <TextInput value={base} onChange={(e) => setBase(e.target.value)} className="w-28 font-mono" />
          </div>
        </Field>
        <Field label="Harmony type" htmlFor="harmony">
          <Select id="harmony" value={harmony} onChange={(e) => setHarmony(e.target.value as HarmonyType)}>
            <option value="complementary">Complementary</option>
            <option value="analogous">Analogous</option>
            <option value="triadic">Triadic</option>
            <option value="monochromatic">Monochromatic</option>
            <option value="random">Random</option>
          </Select>
        </Field>
        <Button
          variant="secondary"
          icon={<Dices className="h-4 w-4" />}
          onClick={() => setBase(rgbToHex(generatePalette({ r: Math.floor(Math.random() * 255), g: Math.floor(Math.random() * 255), b: Math.floor(Math.random() * 255) }, "random")[0]))}
        >
          Random
        </Button>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{SWATCH_HELP[harmony]}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {palette.map((color) => {
          const hexValue = rgbToHex(color);
          return (
            <div key={hexValue} className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => copy(hexValue)}
                className="flex h-24 w-full items-end p-2 transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                style={{ backgroundColor: hexValue }}
                aria-label={`Copy ${hexValue}`}
              >
                <span
                  className="rounded-md bg-slate-900/50 px-2 py-0.5 font-mono text-[11px] font-semibold text-white"
                  style={{ color: contrastRatio(color, { r: 255, g: 255, b: 255 }) > 2 ? "#fff" : "#111" }}
                >
                  {copied === hexValue ? <Check className="h-3 w-3" /> : hexValue}
                </span>
              </button>
              <p className="bg-white py-1.5 text-center text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {hexValue}
              </p>
            </div>
          );
        })}
      </div>
      <CopyButton
        text={palette.map(rgbToHex).join(", ")}
        label="Copy all colors"
      />
    </div>
  );
}

/* ------------------------------------------------------ GradientGenerator */

interface ColorStop {
  id: string;
  color: string;
  position: number; // 0-100
}

let stopCounter = 0;

export function GradientGenerator() {
  const [type, setType] = useState<"linear" | "radial">("linear");
  const [angle, setAngle] = useState(90);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [stops, setStops] = useState<ColorStop[]>([
    { id: "a", color: "#4F46E5", position: 0 },
    { id: "b", color: "#9333EA", position: 100 },
  ]);

  const css = useMemo(() => {
    const sorted = [...stops].sort((a, b) => a.position - b.position);
    const parts = sorted.map((s) => `${s.color} ${s.position}%`).join(", ");
    if (type === "linear") return `background: linear-gradient(${angle}deg, ${parts});`;
    return `background: radial-gradient(circle at ${position.x}% ${position.y}%, ${parts});`;
  }, [type, angle, position, stops]);

  const updateStop = (id: string, patch: Partial<ColorStop>) =>
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const addStop = () => {
    const next = stops.length ? Math.min(100, Math.max(...stops.map((s) => s.position)) + 1) : 50;
    setStops((prev) => [...prev, { id: `stop-${stopCounter++}`, color: "#10B981", position: next }]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Gradient type" htmlFor="grad-type">
          <Select id="grad-type" value={type} onChange={(e) => setType(e.target.value as "linear" | "radial")}>
            <option value="linear">Linear</option>
            <option value="radial">Radial</option>
          </Select>
        </Field>
        {type === "linear" ? (
          <div className="w-48">
            <Slider label="Direction" value={angle} min={0} max={360} unit="°" onChange={setAngle} display={`${angle}°`} />
          </div>
        ) : (
          <div className="w-64 space-y-2">
            <Slider label="Horizontal position" value={position.x} min={0} max={100} unit="%" onChange={(x) => setPosition((p) => ({ ...p, x }))} />
            <Slider label="Vertical position" value={position.y} min={0} max={100} unit="%" onChange={(y) => setPosition((p) => ({ ...p, y }))} />
          </div>
        )}
        <Button variant="secondary" size="md" onClick={addStop}>
          + Add color
        </Button>
      </div>

      <div
        className="h-40 rounded-xl border border-slate-200 dark:border-slate-700"
        style={
          type === "linear"
            ? { background: `linear-gradient(${angle}deg, ${stops.map((s) => `${s.color} ${s.position}%`).join(", ")})` }
            : { background: `radial-gradient(circle at ${position.x}% ${position.y}%, ${stops.map((s) => `${s.color} ${s.position}%`).join(", ")})` }
        }
        role="img"
        aria-label="Gradient preview"
      />

      <div className="space-y-2">
        {stops.map((stop) => (
          <div key={stop.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800/60">
            <input
              type="color"
              value={stop.color}
              onChange={(e) => updateStop(stop.id, { color: e.target.value })}
              className="h-9 w-11 cursor-pointer rounded-md border border-slate-300 bg-white dark:border-slate-600"
              aria-label={`Color ${stop.color}`}
            />
            <TextInput value={stop.color} onChange={(e) => updateStop(stop.id, { color: e.target.value })} className="w-28 font-mono" />
            <Slider
              label=""
              value={stop.position}
              min={0}
              max={100}
              unit="%"
              onChange={(position) => updateStop(stop.id, { position })}
            />
            <button
              type="button"
              disabled={stops.length <= 2}
              onClick={() => setStops((prev) => prev.filter((s) => s.id !== stop.id))}
              className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 dark:hover:bg-red-500/10"
              aria-label={`Remove color ${stop.color}`}
            >
              <span className="text-xs font-semibold">✕</span>
            </button>
          </div>
        ))}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">CSS code</p>
          <CopyButton text={css} />
        </div>
        <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 font-mono text-xs text-emerald-400 dark:bg-slate-950">
          {css}
        </pre>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- ContrastChecker */

const WCAG_PRESETS = [
  { label: "White on black", fg: "#ffffff", bg: "#000000" },
  { label: "Black on white", fg: "#000000", bg: "#ffffff" },
  { label: "Gray on white", fg: "#9ca3af", bg: "#ffffff" },
  { label: "Brand on white", fg: "#4f46e5", bg: "#ffffff" },
  { label: "White on brand", fg: "#ffffff", bg: "#4f46e5" },
];

export function ContrastChecker() {
  const [fg, setFg] = useState("#1e293b");
  const [bg, setBg] = useState("#ffffff");

  const fgRgb = hexToRgb(fg);
  const bgRgb = hexToRgb(bg);
  const ratio = fgRgb && bgRgb ? contrastRatio(fgRgb, bgRgb) : null;

  const checks = ratio
    ? [
        { label: "Normal text (AA)", pass: ratio >= 4.5, level: "≥ 4.5:1" },
        { label: "Normal text (AAA)", pass: ratio >= 7, level: "≥ 7:1" },
        { label: "Large text (AA)", pass: ratio >= 3, level: "≥ 3:1" },
        { label: "Large text (AAA)", pass: ratio >= 4.5, level: "≥ 4.5:1" },
        { label: "UI components (AA)", pass: ratio >= 3, level: "≥ 3:1" },
      ]
    : [];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Foreground (text) color" htmlFor="fg-color">
          <div className="flex items-center gap-2">
            <input id="fg-color" type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="h-10 w-12 cursor-pointer rounded-lg border border-slate-300 bg-white dark:border-slate-600" />
            <TextInput value={fg} onChange={(e) => setFg(e.target.value)} className="font-mono" />
          </div>
        </Field>
        <Field label="Background color" htmlFor="bg-color">
          <div className="flex items-center gap-2">
            <input id="bg-color" type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-10 w-12 cursor-pointer rounded-lg border border-slate-300 bg-white dark:border-slate-600" />
            <TextInput value={bg} onChange={(e) => setBg(e.target.value)} className="font-mono" />
          </div>
        </Field>
      </div>

      <div className="flex flex-wrap gap-2">
        {WCAG_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => {
              setFg(preset.fg);
              setBg(preset.bg);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-transparent dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700" style={{ backgroundColor: bg, color: fg }}>
        <p className="text-2xl font-extrabold">Sample text</p>
        <p className="mt-1 text-sm opacity-90">This is how your text will look on this background.</p>
        <p className="mt-2 text-xs opacity-70">AaBbCc 123 · Large text sample</p>
      </div>

      {ratio !== null ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Contrast ratio:{" "}
            <span className="text-xl font-extrabold tabular-nums text-slate-900 dark:text-white">{ratio.toFixed(2)}:1</span>
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {checks.map((check) => (
              <div
                key={check.label}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium ${
                  check.pass
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                    : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300"
                }`}
              >
                <span>{check.label}</span>
                <span className="font-bold">{check.pass ? "Pass" : "Fail"} · {check.level}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400">Enter two valid colors to see the contrast ratio.</p>
      )}
    </div>
  );
}
