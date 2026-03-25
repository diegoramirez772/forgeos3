<div align="center">

<img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
<img src="https://img.shields.io/badge/Zustand-State-FF6B6B?style=for-the-badge" />
<img src="https://img.shields.io/badge/OpenClaw-Connected-orange?style=for-the-badge" />
<img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />

# 🧠 ForgeOS3 Console

**The AI Governance Operations Center for the ForgeOS3 platform.**  
*Monitor · Approve · Audit · Configure — in real time.*

[Modules](#-modules) · [Quick Start](#-quick-start) · [Concepts](#-key-concepts) · [Tech Stack](#-tech-stack)

</div>

---

## 📖 Overview

**ForgeOS3** is the operator control plane of the ForgeOS platform. It gives teams complete visibility into every AI agent run, tool decision, governance event, and pending human approval — live.

Built for the era where **AI agents act autonomously** but humans remain in control.

---

## 🗂️ Modules

| Module | Route | Description |
|--------|-------|-------------|
| 📊 **Dashboard** | `/` | Live KPIs, activity feed, Loop Guard scores, agent status |
| 🏗️ **Builder** | `/builder` | Deploy and configure new AI agents |
| 🛡️ **Sentinel Studio** | `/sentinel` | Inspect active and historical runs in detail |
| ⚖️ **Policy Studio** | `/policy` | Configure governance rules per domain |
| ✅ **Approvals** | `/approvals` | Human-in-the-loop approval queue |
| 📦 **Registry** | `/registry` | Manage tool packs, domain profiles, policy presets |
| 🔍 **Audit Log** | `/audit` | Full immutable history of all AI actions |
| ⚙️ **Settings** | `/settings` | Workspace and account configuration |

---

## 🚀 Quick Start

```bash
cd forgeos3
cp .env.example .env
npm install
npm run dev     # → http://localhost:5174 (or :5173 if available)
```

> Requires `forgeos3-backend` on port 3001 and `forgeos3-agent` on port 4000.

---

## 🔑 Key Concepts

### 🔄 Governance Pipeline
Every agent tool call triggers a 3-phase pipeline visible in the console:

```
Agent requests tool
        │
        ▼
  [1] EVALUATE ─── OpenClaw policy engine
        │           → allowed / blocked / approval_required
        │
        ▼ (if approval_required)
  [2] APPROVE ──── Operator notified in /approvals panel
        │           → Approve or Reject with reason
        │
        ▼
  [3] LOG ──────── Result written to immutable audit trail
```

### 📈 Loop Guard
The **Loop Guard** widget monitors real-time risk scores per run (0–100):
- `0–15` → 🟢 Normal
- `16–30` → 🟡 Caution
- `31–100` → 🔴 Terminated / Safe Mode

### 🔗 OpenClaw Status
The header shows `OpenClaw ● live` when the agent server is reachable.  
Polled every **5 seconds** for real-time status.

---

## 👥 Roles & Access

| Role | Access Level |
|------|-------------|
| `admin` | Full platform including user management |
| `government` | Full platform + analytics |
| `producer` | Dashboard, canvases, AI chat, trámites |
| `union_ganadera` | Trámites panel and reports |

---

## ⚙️ Environment Variables

| Variable | Required | Description |
|----------|:--------:|-------------|
| `VITE_API_URL` | ✅ | Backend URL (`http://localhost:3001`) |
| `VITE_AGENT_URL` | ✅ | Agent server URL (`http://localhost:4000`) |
| `SUPABASE_URL` | ✅ | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | ✅ | Supabase service key |
| `JWT_SECRET` | ✅ | JWT signing secret |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS (forge dark theme) |
| Animation | Framer Motion |
| Charts | Recharts |
| State | Zustand (auth, agents, runs, approvals, dashboard) |
| Icons | Lucide React |
| Database | Supabase (real-time subscriptions) |

---

## 📄 License

MIT © ForgeOS Team 2026