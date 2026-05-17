# 設計書 — 毎日ニュース収集エージェント

## 概要

- IT・AIの最新ニュースを **毎朝自動収集** し、Notionにまとめるエージェント
- **GAS** をトリガーとして使用し、**Claude API** がニュース収集から Notion 保存までを担う
- 将来的には **Claude Managed Agents** に移行し、複雑な処理にも対応できる設計

---

## 処理フロー

```
GAS（毎朝 6:00 ・定期トリガー）
  ↓ HTTP リクエスト
Claude API（MCP 対応）
  ├── Web 検索で IT ニュース取得
  ├── Web 検索で AI ニュース取得
  └── Notion MCP でページ保存
  ↓
LINE Notify（Notion ページの URL を通知）
```

---

## 技術構成

### GAS

- 役割：**定期トリガーのみ**（毎朝 6:00 に Claude API へ HTTP リクエストを送信するだけ）
- トリガー設定は初回のみ手動、以降はコード変更不要

### Claude API

- モデル：`claude-sonnet-4-6`
- MCP：Notion MCP サーバー（`https://mcp.notion.com/mcp`）経由で Notion に直接保存
- Web 検索：`agent_toolset` または `web_search` ツールで最新ニュースを取得

### Notion

- 保存先：日付ごとにページを自動作成
- 認証：Anthropic Console で OAuth 連携（ネイティブ対応なので設定が簡単）

### 通知

- **LINE Notify** で作成された Notion ページの URL を送信

---

## リポジトリ構成

```
/
├── gas/
│   ├── .clasp.json
│   ├── appsscript.json
│   └── main.js
├── agent/
│   ├── agent_config.ts
│   ├── deploy_agent.ts
│   ├── package.json
│   └── tsconfig.json
└── .github/
    ├── dependabot.yml
    └── workflows/
        ├── deploy_gas.yml
        └── deploy_agent.yml
```

---

## 依存ツール

| ツール | 用途 |
|---|---|
| `clasp` | GAS コードのデプロイ |
| `@anthropic-ai/sdk` | Claude SDK (TypeScript) |

---

## CI/CD

- `gas/` 配下の変更 → GitHub Actions → `clasp push` → GAS に自動デプロイ
- `agent/` 配下の変更 → GitHub Actions → `deploy_agent.ts` → Claude Agent 定義を更新
- **Dependabot** で週次ライブラリ監視、メジャーバージョンアップは内容確認後にマージ
