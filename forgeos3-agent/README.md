<div align="center">

<img src="https://img.shields.io/badge/OpenClaw-Powered-orange?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PC9zdmc+" />
<img src="https://img.shields.io/badge/Anthropic-Claude-blueviolet?style=for-the-badge" />
<img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white" />
<img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />

# 🦞 ForgeOS3 Agent

**Autonomous AI runtime with real-time governance. Built for Agrotech, HealthTech & FinTech.**

[Getting Started](#-getting-started) · [API Reference](#-api-reference) · [Tools](#-tool-registry) · [Architecture](#-architecture)

</div>

---

## 📖 What is this?

`forgeos3-agent` is the core AI execution engine of the ForgeOS3 platform. It runs autonomous Claude-powered agents under **real-time governance**, enforcing tool policies, loop risk scoring, and human-in-the-loop approval before any sensitive action is executed.

> **Hackathon context:** This agent powers **ForgeOS Sentinel** — an Agrotech PWA for screwworm (*Cochliomyia hominivorax*) monitoring in livestock regions of Mexico.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    forgeos3-agent                        │
│                                                         │
│  ┌──────────────┐    ┌───────────────┐                  │
│  │ Express :4000│───▶│ AgentExecutor │                  │
│  │  /run  (POST)│    │               │                  │
│  │  /stream(SSE)│    │  1. Plan      │                  │
│  └──────────────┘    │  2. Loop Guard│                  │
│                      │  3. Governance│                  │
│                      │  4. Tools     │                  │
│                      └──────┬────────┘                  │
│                             │                           │
│              ┌──────────────▼──────────────┐            │
│              │   Anthropic Claude (Haiku)   │            │
│              └──────────────┬──────────────┘            │
│                             │                           │
│         ┌───────────────────▼──────────────────┐        │
│         │          Tool Registry                │        │
│         │  search_news · analyze_crop_health    │        │
│         │  reportar_incidencia · apply_treatment│        │
│         └───────────────────┬──────────────────┘        │
│                             │                           │
│         ┌───────────────────▼──────────────────┐        │
│         │     ForgeOS3 Backend (Governance DB)  │        │
│         └──────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 20
- An Anthropic API key (claude-3-haiku access)
- A running instance of `forgeos3-backend` on port 3001

### Installation

```bash
git clone https://github.com/your-org/forgeos3
cd forgeos3-agent

cp .env.example .env
# → Fill in ANTHROPIC_API_KEY and other secrets

npm install
npm run dev
```

The agent server starts at → **`http://localhost:4000`**

### OpenClaw Monitor (TUI)

```bash
npx openclaw tui --token <AGENT_API_KEY>
```

---

## 📡 API Reference

### `POST /api/agent/run`

Starts a governed agent run. Returns a `runId` for SSE streaming.

**Request body:**
```json
{
  "query":     "Busca noticias recientes del gusano barrenador",
  "domain":    "agrotech",
  "mode":      "sentinel"
}
```

**Response:**
```json
{ "runId": "2df7da9c-7525-4d95-8f70-841b4df70446" }
```

---

### `GET /api/agent/stream/:runId`

Server-Sent Events stream. Connect immediately after `/run`.

| Event Type | Payload | Description |
|------------|---------|-------------|
| `token` | `{ text: string }` | Streaming text chunk from Claude |
| `gov_event` | `{ tool, decision }` | Governance policy decision |
| `done` | — | Run completed successfully |
| `error` | `{ message }` | Run terminated with error |

---

### `GET /api/health`

```json
{
  "status": "ok",
  "adapter": "openclaw_v1",
  "uptime": 3600
}
```

---

## 🛡️ Governance Pipeline

Every tool call passes through three mandatory gates:

```
Agent wants to call a tool
         │
         ▼
┌─────────────────────┐
│  1. beforeToolCall  │ ← OpenClaw evaluates intent
│                     │   → allowed / blocked / approval_required
└────────┬────────────┘
         │ if approval_required
         ▼
┌─────────────────────┐
│  2. requestApproval │ ← Human operator notified
│                     │   → polls for decision (max 60s)
└────────┬────────────┘
         │ if approved or allowed
         ▼
┌─────────────────────┐
│  3. afterToolCall   │ ← Result logged to audit trail
└─────────────────────┘
```

**Loop Guard** runs between every iteration and scores run risk (0–100). At threshold, agent enters safe mode or is terminated.

---

## 🧰 Tool Registry

| Domain | Tool | Requires Approval |
|--------|------|:-----------------:|
| `agrotech` | `search_news` | — |
| `agrotech` | `reportar_incidencia` | — |
| `agrotech` | `analyze_crop_health` | — |
| `agrotech` | `apply_treatment` | ✅ |
| `agrotech` | `asignar_prioridad` | ✅ |
| `agrotech` | `consult_expert` | — |
| `healthtech` | `summarize_intake` | — |
| `healthtech` | `write_clinical_record` | ✅ |
| `fintech` | `detect_fraud_patterns` | — |
| `fintech` | `execute_transfer` | ✅ |

---

## ⚙️ Environment Variables

| Variable | Required | Description |
|----------|:--------:|-------------|
| `ANTHROPIC_API_KEY` | ✅ | Claude API key |
| `FORGEOS3_API_URL` | ✅ | Backend URL (`http://localhost:3001`) |
| `AGENT_API_KEY` | ✅ | Shared secret for server-to-server auth |
| `SUPABASE_URL` | ✅ | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | ✅ | Supabase service role key |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 + TypeScript 5 |
| LLM | Anthropic Claude 3 Haiku |
| Governance | OpenClaw 2026.3 |
| Database | Supabase (PostgreSQL) |
| Server | Express 5 |
| Dev Server | ts-node-dev |

---

## 📄 License

MIT © ForgeOS Team 2026
