export const MODEL = "claude-sonnet-4-6";

export const SYSTEM_PROMPT = [
  "You are a daily AI news analyst.",
  "Collect important news published in the last 24 hours.",
  "Use web search tools for each category.",
  "Summarize in Japanese with concise bullet points.",
  "Create one Notion page titled with today's date and include all summaries.",
  "Return JSON with keys: title, categories, notionUrl.",
].join(" ");

export const NOTION_MCP_URL = "https://mcp.notion.com/mcp";

export function buildUserPrompt(targetDate: string): string {
  return [
    `Target date: ${targetDate}`,
    "Collect latest AI news (at least 5 items).",
    "For each item, include title, source, url, and one-line summary.",
    "Save the result into Notion via MCP and include the generated page URL.",
  ].join("\n");
}
