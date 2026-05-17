# 📰 auto-generate-my-news

> **毎朝、あなたの代わりに IT / AI ニュースを読んで Notion にまとめてくれるエージェント。**

---

## ✨ Overview

毎朝 6:00 に Google App Script (GAS) がトリガーを起動し、Claude API が Web 検索から Notion ページ作成まですべて自動で処理します。新しいページが作成されると LINE で通知が届くので、朝コーヒーを飲みながらサマリーを読むだけでOK。

---

## 🔄 Flow

```
GAS (毎朝 6:00 / 定期トリガー)
  │
  │  HTTP Request
  ▼
Claude API (claude-sonnet-4-6)
  ├─ 🔍 Web 検索: IT ニュース
  ├─ 🔍 Web 検索: AI ニュース
  └─ 📝 Notion MCP: ページ自動作成
          │
          │  Notion ページ URL
          ▼
        LINE Notify 📲
```

---

## 🛠 Tech Stack

| Layer | Tool / Service | Role |
|---|---|---|
| Trigger | Google Apps Script | 定期実行（毎朝 6:00） |
| Agent | Claude API (`claude-sonnet-4-6`) | ニュース収集 & Notion 保存 |
| Storage | Notion (via MCP) | 日付ごとにページ自動作成 |
| Notify | LINE Notify | Notion URL を通知 |
| Deploy | clasp + GitHub Actions | GAS の CI/CD |

---

## 📁 Repository Structure

```
/
├── gas/                    # Google Apps Script
│   ├── .clasp.json
│   ├── appsscript.json
│   └── main.js             # Claude API への HTTP リクエスト
├── agent/                  # Claude Agent 定義
│   ├── agent_config.ts     # エージェント設定
│   ├── deploy_agent.ts     # デプロイスクリプト
│   ├── package.json
│   └── tsconfig.json
└── .github/
    ├── dependabot.yml
    └── workflows/
        ├── deploy_gas.yml      # clasp push
        └── deploy_agent.yml    # Agent 定義の更新
```

---

## 🚀 Getting Started

### 1. 依存関係のインストール

```bash
npm install -g @google/clasp
cd agent && npm install
```

### 2. Notion OAuth 連携

[Anthropic Console](https://console.anthropic.com) で Notion MCP のネイティブ OAuth 連携を設定します。

### 3. GAS のデプロイ

```bash
cd gas
clasp login
clasp push
```

初回のみ GAS エディタでトリガー（毎朝 6:00）を手動設定してください。

### 4. 環境変数

| 変数名 | 説明 |
|---|---|
| `ANTHROPIC_API_KEY` | Claude API キー |
| `LINE_NOTIFY_TOKEN` | LINE Notify トークン |

---

## ⚙️ CI/CD

- **`gas/` 変更** → `clasp push` で GAS に自動デプロイ
- **`agent/` 変更** → `deploy_agent.ts` で Claude Agent 定義を更新
- **Dependabot** で週次ライブラリ監視（メジャーバージョンアップは内容確認後マージ）

---

## 🗺 Roadmap

- [ ] Claude Managed Agents への移行
- [ ] カテゴリ別ページ分割
- [ ] Slack 通知対応

---

## 📄 License

MIT
