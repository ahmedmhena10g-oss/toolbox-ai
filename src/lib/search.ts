import { tools, toolsByCategory, categories, type ToolConfig } from "./tools";

export interface SearchResult {
  tool: ToolConfig;
  score: number;
}

/**
 * Tokenize a query into lowercase alphanumeric words.
 */
const tokenize = (input: string): string[] =>
  input
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

/**
 * Score a tool against a set of query tokens.
 * Name matches score highest, then keywords, then category, then description.
 */
const scoreTool = (tool: ToolConfig, tokens: string[]): number => {
  let score = 0;
  const haystackName = tool.name.toLowerCase();
  const haystackKeywords = tool.keywords.join(" ").toLowerCase();
  const haystackCategory = categories.find((c) => c.id === tool.category)?.name.toLowerCase() ?? "";
  const haystackDescription = `${tool.short} ${tool.description}`.toLowerCase();

  for (const token of tokens) {
    if (haystackName === token) score += 100;
    else if (haystackName.startsWith(token)) score += 60;
    else if (haystackName.includes(token)) score += 40;

    if (haystackKeywords.includes(token)) score += 25;
    if (haystackKeywords.startsWith(token + " ")) score += 10;

    if (haystackCategory === token || haystackCategory.includes(token)) score += 15;

    if (haystackDescription.includes(token)) score += 5;
  }
  return score;
};

export const searchTools = (query: string, limit = 8): SearchResult[] => {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const scored: SearchResult[] = [];
  for (const tool of tools) {
    const score = scoreTool(tool, tokens);
    if (score > 0) scored.push({ tool, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
};

/** Search within a single category (used on category pages). */
export const searchToolsInCategory = (
  category: string,
  query: string,
  limit = 40
): ToolConfig[] => {
  const tokens = tokenize(query);
  const list = toolsByCategory(category as ToolConfig["category"]);
  if (tokens.length === 0) return list;
  return list
    .map((tool) => ({ tool, score: scoreTool(tool, tokens) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.tool);
};
