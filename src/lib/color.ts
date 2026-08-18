export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export interface Hsl {
  h: number;
  s: number;
  l: number;
}

export interface Hsv {
  h: number;
  s: number;
  v: number;
}

const clamp255 = (n: number) => Math.max(0, Math.min(255, Math.round(n)));

export const hexToRgb = (hex: string): Rgb | null => {
  let value = hex.trim().replace(/^#/, "");
  if (value.length === 3) {
    value = value
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return null;
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
};

export const rgbToHex = ({ r, g, b }: Rgb): string =>
  `#${[r, g, b].map((c) => clamp255(c).toString(16).padStart(2, "0")).join("")}`.toUpperCase();

export const rgbToHsl = ({ r, g, b }: Rgb): Hsl => {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
    else if (max === gn) h = ((bn - rn) / d + 2) * 60;
    else h = ((rn - gn) / d + 4) * 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
};

export const rgbToHsv = ({ r, g, b }: Rgb): Hsv => {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const v = max;
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
    else if (max === gn) h = ((bn - rn) / d + 2) * 60;
    else h = ((rn - gn) / d + 4) * 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), v: Math.round(v * 100) };
};

export const hslToRgb = ({ h, s, l }: Hsl): Rgb => {
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;
  let rgb: [number, number, number];
  const hh = ((h % 360) + 360) % 360;
  if (hh < 60) rgb = [c, x, 0];
  else if (hh < 120) rgb = [x, c, 0];
  else if (hh < 180) rgb = [0, c, x];
  else if (hh < 240) rgb = [0, x, c];
  else if (hh < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return { r: clamp255((rgb[0] + m) * 255), g: clamp255((rgb[1] + m) * 255), b: clamp255((rgb[2] + m) * 255) };
};

export const hsvToRgb = ({ h, s, v }: Hsv): Rgb => {
  const sn = s / 100;
  const vn = v / 100;
  const hh = ((h % 360) + 360) % 360;
  const c = vn * sn;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = vn - c;
  let rgb: [number, number, number];
  if (hh < 60) rgb = [c, x, 0];
  else if (hh < 120) rgb = [x, c, 0];
  else if (hh < 180) rgb = [0, c, x];
  else if (hh < 240) rgb = [0, x, c];
  else if (hh < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return { r: clamp255((rgb[0] + m) * 255), g: clamp255((rgb[1] + m) * 255), b: clamp255((rgb[2] + m) * 255) };
};

export const formatHsl = ({ h, s, l }: Hsl): string => `hsl(${h}, ${s}%, ${l}%)`;
export const formatHsv = ({ h, s, v }: Hsv): string => `hsv(${h}, ${s}%, ${v}%)`;
export const formatRgb = ({ r, g, b }: Rgb): string => `rgb(${r}, ${g}, ${b})`;

export const parseRgb = (input: string): Rgb | null => {
  const match = input.trim().match(/^(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})$/);
  if (!match) return null;
  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);
  if ([r, g, b].some((n) => n > 255)) return null;
  return { r, g, b };
};

export const parseHsl = (input: string): Hsl | null => {
  const match = input
    .trim()
    .match(/^(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%$/);
  if (!match) return null;
  return {
    h: parseInt(match[1], 10) % 360,
    s: Math.min(100, parseInt(match[2], 10)),
    l: Math.min(100, parseInt(match[3], 10)),
  };
};

/** Relative luminance per WCAG 2.1. */
export const relativeLuminance = ({ r, g, b }: Rgb): number => {
  const linearize = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
};

export const contrastRatio = (a: Rgb, b: Rgb): number => {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
};

export type HarmonyType = "complementary" | "analogous" | "triadic" | "monochromatic" | "random";

export const generatePalette = (base: Rgb, type: HarmonyType): Rgb[] => {
  const { h, s, v } = rgbToHsv(base);
  const fromHsv = (hh: number, ss: number, vv: number): Rgb => hsvToRgb({ h: ((hh % 360) + 360) % 360, s: Math.max(0, Math.min(100, ss)), v: Math.max(0, Math.min(100, vv)) });

  switch (type) {
    case "complementary":
      return [base, fromHsv(h + 30, s, v), fromHsv(h + 180, s, v), fromHsv(h + 195, s, Math.min(100, v * 0.85)), fromHsv(h + 15, s, Math.max(0, v * 0.9))];
    case "analogous":
      return [fromHsv(h - 60, s, v), fromHsv(h - 30, s, v), base, fromHsv(h + 30, s, v), fromHsv(h + 60, s, v)];
    case "triadic":
      return [base, fromHsv(h + 120, s, v), fromHsv(h + 240, s, v), fromHsv(h + 120, s * 0.7, v * 0.9), fromHsv(h + 240, s * 0.7, v * 0.9)];
    case "monochromatic":
      return [base, fromHsv(h, s, v * 0.75), fromHsv(h, s, v * 0.5), fromHsv(h, Math.min(100, s + 15), v), fromHsv(h, Math.max(0, s - 20), v * 0.85)];
    case "random": {
      const baseH = Math.floor(Math.random() * 360);
      const baseS = 55 + Math.floor(Math.random() * 40);
      const baseV = 60 + Math.floor(Math.random() * 35);
      const offsets = [0, 20, 50, 160, 210];
      return offsets.map((o, i) =>
        fromHsv(baseH + o, Math.max(20, baseS - i * 8), Math.min(95, baseV + (i % 2 === 0 ? 5 : -10)))
      );
    }
  }
};
