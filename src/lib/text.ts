export interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTimeMinutes: number;
  lines: number;
}

export const textStats = (text: string): TextStats => {
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  const sentences = trimmed
    ? (text.match(/[.!?…]+(\s|$)/g) ?? []).length
    : 0;
  const paragraphs = trimmed
    ? trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length
    : 0;
  const lines = trimmed ? text.split("\n").filter((l) => l.trim()).length : 0;
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));
  return {
    words,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    readingTimeMinutes,
    lines,
  };
};

export type CaseKind =
  | "upper"
  | "lower"
  | "title"
  | "sentence"
  | "camel"
  | "snake"
  | "kebab";

const SMALL_WORDS = new Set([
  "a", "an", "and", "as", "at", "but", "by", "for", "in", "nor", "of", "on",
  "or", "so", "the", "to", "up", "yet", "vs", "via",
]);

export const convertCase = (text: string, kind: CaseKind): string => {
  switch (kind) {
    case "upper":
      return text.toUpperCase();
    case "lower":
      return text.toLowerCase();
    case "title":
      return text
        .toLowerCase()
        .replace(/(^\w|\s\w|['’]\w)/g, (m) => m.toUpperCase())
        .split(/\s+/)
        .map((word, i, arr) => {
          if (i > 0 && i < arr.length - 1 && SMALL_WORDS.has(word.toLowerCase())) {
            return word.toLowerCase();
          }
          return word;
        })
        .join(" ");
    case "sentence":
      return text
        .toLowerCase()
        .replace(/(^\s*\w|[.!?]\s+\w)/g, (m) => m.toUpperCase());
    case "camel":
      return text
        .toLowerCase()
        .split(/[^a-z0-9]+/i)
        .filter(Boolean)
        .map((word, i) =>
          i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join("");
    case "snake":
      return text
        .toLowerCase()
        .split(/[^a-z0-9]+/i)
        .filter(Boolean)
        .join("_");
    case "kebab":
      return text
        .toLowerCase()
        .split(/[^a-z0-9]+/i)
        .filter(Boolean)
        .join("-");
  }
};

export const removeDuplicateLines = (
  text: string,
  options: { trim?: boolean; ignoreCase?: boolean } = {}
): string => {
  const seen = new Set<string>();
  const lines = text.split("\n");
  const result: string[] = [];
  for (let line of lines) {
    const key = options.trim ? line.trim() : line;
    const lookup = options.ignoreCase ? key.toLowerCase() : key;
    if (!seen.has(lookup)) {
      seen.add(lookup);
      result.push(line);
    }
  }
  return result.join("\n");
};

export type SortMode = "alpha" | "alpha-reverse" | "numeric" | "length";
export type SortDirection = "asc" | "desc";

export const sortLines = (
  text: string,
  mode: SortMode,
  direction: SortDirection
): string => {
  const lines = text.split("\n");
  const dir = direction === "asc" ? 1 : -1;
  const sorted = [...lines].sort((a, b) => {
    let cmp = 0;
    switch (mode) {
      case "alpha":
        cmp = a.localeCompare(b);
        break;
      case "alpha-reverse":
        cmp = b.localeCompare(a);
        break;
      case "numeric": {
        const na = parseFloat(a.replace(/[^0-9.-]/g, ""));
        const nb = parseFloat(b.replace(/[^0-9.-]/g, ""));
        cmp = (Number.isFinite(na) ? na : 0) - (Number.isFinite(nb) ? nb : 0);
        break;
      }
      case "length":
        cmp = a.length - b.length;
        break;
    }
    return cmp;
  });
  return (mode === "alpha-reverse" ? sorted : direction === "asc" ? sorted : [...sorted].reverse()).join("\n");
};

export interface CleanOptions {
  extraSpaces: boolean;
  emptyLines: boolean;
  specialChars: boolean;
  normalizeBreaks: boolean;
  trimLines: boolean;
}

export const cleanText = (text: string, options: CleanOptions): string => {
  let result = text;
  if (options.normalizeBreaks) {
    result = result.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  }
  if (options.extraSpaces) {
    result = result.replace(/[ \t]+/g, " ");
  }
  if (options.trimLines) {
    result = result
      .split("\n")
      .map((line) => line.trim())
      .join("\n");
  }
  if (options.emptyLines) {
    result = result.replace(/\n{2,}/g, "\n").replace(/^\n+|\n+$/g, "");
  }
  if (options.specialChars) {
    // Keep letters (incl. accents), digits, spaces and basic punctuation.
    result = result.replace(/[^\p{L}\p{N}\s.,!?;:'"()\[\]{}@#%&*+\-/=<>_|~^$€£¥$]/gu, "");
  }
  return result;
};

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
  "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
  "deserunt", "mollit", "anim", "id", "est", "laborum",
];

export const loremIpsum = (unit: "words" | "sentences" | "paragraphs", amount: number): string => {
  const randomWord = () => LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
  const sentence = () => {
    const length = 8 + Math.floor(Math.random() * 8);
    const words = Array.from({ length }, randomWord);
    return words.join(" ");
  };
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  if (unit === "words") {
    const count = Math.max(1, Math.min(amount, 5000));
    return Array.from({ length: count }, randomWord).join(" ");
  }
  if (unit === "sentences") {
    const count = Math.max(1, Math.min(amount, 500));
    return Array.from({ length: count }, () => capitalize(sentence()) + ".").join(" ");
  }
  const count = Math.max(1, Math.min(amount, 100));
  return Array.from(
    { length: count },
    () =>
      Array.from({ length: 3 + Math.floor(Math.random() * 3) }, () => capitalize(sentence()) + ".")
        .join(" ") + "\n\n"
  ).join("");
};

/** Token-level diff returning lines with a status. */
export interface DiffLine {
  value: string;
  status: "equal" | "added" | "removed";
}

export const diffLines = (a: string, b: string): DiffLine[] => {
  const linesA = a.split("\n");
  const linesB = b.split("\n");
  const m = linesA.length;
  const n = linesB.length;
  // Simple LCS-based diff (fine for typical text sizes).
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] =
        linesA[i] === linesB[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (linesA[i] === linesB[j]) {
      result.push({ value: linesA[i], status: "equal" });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      result.push({ value: linesA[i], status: "removed" });
      i++;
    } else {
      result.push({ value: linesB[j], status: "added" });
      j++;
    }
  }
  while (i < m) {
    result.push({ value: linesA[i], status: "removed" });
    i++;
  }
  while (j < n) {
    result.push({ value: linesB[j], status: "added" });
    j++;
  }
  return result;
};
