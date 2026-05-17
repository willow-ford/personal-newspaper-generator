import "dotenv/config";

import { pathToFileURL } from "node:url";

import { MODEL, SYSTEM_PROMPT, NOTION_MCP_URL, buildUserPrompt } from "./agent_config.js";

const USER_PROMPT_TEMPLATE_DATE = "{{TARGET_DATE}}";

type AgentDefinition = {
  name: string;
  model: string;
  systemPrompt: string;
  mcpServers: Array<{ type: "url"; url: string }>;
};

export function buildAgentDefinition(): AgentDefinition {
  // 配備対象となるエージェント定義を1か所で組み立てる。
  const mergedSystemPrompt = [SYSTEM_PROMPT, buildUserPrompt(USER_PROMPT_TEMPLATE_DATE)].join("\n\n");

  return {
    name: "daily-news-notion-agent",
    model: MODEL,
    systemPrompt: mergedSystemPrompt,
    mcpServers: [{ type: "url", url: NOTION_MCP_URL }],
  };
}

export async function deploy() {
  const endpoint = process.env.AGENT_DEPLOY_ENDPOINT;
  const token = process.env.AGENT_DEPLOY_TOKEN;
  const definition = buildAgentDefinition();

  if (!endpoint) {
    throw new Error("AGENT_DEPLOY_ENDPOINT is not set.");
  }

  if (!token) {
    throw new Error("AGENT_DEPLOY_TOKEN is not set.");
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(definition),
  });

  const responseBody = await response.text();
  if (!response.ok) {
    throw new Error(`Deploy failed: ${response.status} ${responseBody}`);
  }

  console.log("Agent definition deployed successfully.");
  if (responseBody) {
    console.log(responseBody);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  deploy().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
