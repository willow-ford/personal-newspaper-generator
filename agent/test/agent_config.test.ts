import { describe, expect, it } from "vitest";

import { MODEL, NOTION_MCP_URL, SYSTEM_PROMPT, buildUserPrompt } from "../agent_config.js";
import { buildAgentDefinition } from "../deploy_agent.js";

describe("buildUserPrompt", () => {
  it("ITとAIの収集指示を含む", () => {
    const prompt = buildUserPrompt("2026-05-18");

    expect(prompt).toContain("Target date: 2026-05-18");
    expect(prompt).toContain("Collect latest IT news (at least 5 items).");
    expect(prompt).toContain("Collect latest AI news (at least 5 items).");
  });
});

describe("buildAgentDefinition", () => {
  it("Agent定義を設定値から組み立てる", () => {
    expect(buildAgentDefinition()).toEqual({
      name: "daily-news-notion-agent",
      model: MODEL,
      systemPrompt: SYSTEM_PROMPT,
      mcpServers: [{ type: "url", url: NOTION_MCP_URL }],
    });
  });
});