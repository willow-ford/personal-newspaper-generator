import "dotenv/config";

import { MODEL, SYSTEM_PROMPT, NOTION_MCP_URL } from "./agent_config.js";

type AgentDefinition = {
  name: string;
  model: string;
  systemPrompt: string;
  mcpServers: Array<{ type: "url"; url: string }>;
};

function buildAgentDefinition(): AgentDefinition {
  // 配備対象となるエージェント定義を1か所で組み立てる。
  return {
    name: "daily-news-notion-agent",
    model: MODEL,
    systemPrompt: SYSTEM_PROMPT,
    mcpServers: [{ type: "url", url: NOTION_MCP_URL }],
  };
}

async function deploy() {
  const endpoint = process.env.AGENT_DEPLOY_ENDPOINT;
  const token = process.env.AGENT_DEPLOY_TOKEN;
  const definition = buildAgentDefinition();

  if (!endpoint) {
    // エンドポイント未設定時は確認用に定義を出力して終了する。
    console.log("AGENT_DEPLOY_ENDPOINT is not set. Generated definition:");
    console.log(JSON.stringify(definition, null, 2));
    return;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

deploy().catch((error) => {
  console.error(error);
  process.exit(1);
});
