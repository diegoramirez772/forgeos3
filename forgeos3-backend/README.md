<div align="center">

<img src="https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white" />
<img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
<img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Security-Helmet%20%2B%20JWT-red?style=for-the-badge" />
<img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />

# ⚙️ ForgeOS3 Backend

**Production-grade Governance API for the ForgeOS3 AI Platform.**

[Getting Started](#-getting-started) · [API](#-api-overview) · [Security](#-security-architecture) · [Environment](#-environment-variables)

</div>

---

## 📖 Overview

`forgeos3-backend` is the central API layer of ForgeOS3. It persists every agent run, enforces governance policies, manages the human approval queue, and provides a full auditable history of all AI decisions.

> **Every tool call an agent makes is evaluated, logged, and retrievable — forever.**

---

## 🚀 Getting Started

```bash
cd forgeos3-backend
cp .env.example .env
npm install
npm run dev     # → http://localhost:3001
```

**Health check:**
```bash
curl http://localhost:3001/health
```

```json
{
  "status": "ok",
  "service": "forgeos3-backend",
  "database": { "status": "connected", "latency_ms": 12 },
  "uptime": 3600
}
```

---

## 📡 API Overview

### 🔓 Public Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Sign in, returns JWT |
| `POST` | `/api/auth/register` | Create new account |
| `GET` | `/health` | Platform health check |

### 🤖 Agent Routes _(API Key: `Authorization: Bearer <AGENT_API_KEY>`)_

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/runs/start` | Register a new agent run in DB |
| `POST` | `/api/runs/finish` | Close run with final status + output |
| `POST` | `/api/tools/evaluate` | OpenClaw governance policy check |
| `POST` | `/api/tools/log` | Log tool execution result |
| `POST` | `/api/risk/evaluate-loop` | Loop risk scoring (0–100) |

### 🔐 Protected Routes _(JWT required)_

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/agents` | List deployed agents |
| `GET/POST` | `/api/runs` | Run history |
| `GET/POST` | `/api/approvals` | Human approval queue |
| `POST` | `/api/approvals/:id/approve` | Approve a pending action |
| `POST` | `/api/approvals/:id/reject` | Reject a pending action |
| `GET` | `/api/dashboard/stats` | Platform KPIs |
| `GET` | `/api/audit` | Immutable audit log |
| `GET` | `/api/workspace` | Workspace management |

---

## 🛡️ Security Architecture

```
Incoming Request
       │
       ├─ helmet()              ← HTTP security headers
       ├─ cors()                ← Whitelist: :5173, :5174, FRONTEND_URL
       ├─ rateLimit()           ← 300 req/15min global
       │                          20 req/15min on /auth
       │                          100 req/min on agent routes
       ├─ morgan()              ← Request logging (Winston)
       ├─ sanitizeInput()       ← XSS + injection prevention
       │
       └─ authMiddleware()
             ├─ AGENT_API_KEY   ← Server-to-server (agent)
             ├─ Supabase token  ← User sessions (frontend)
             └─ Internal JWT    ← Fallback for API clients
```

---

## 🗄️ Database Schema (Key Tables)

| Table | Purpose |
|-------|---------|
| `agent_runs` | Full run lifecycle (start → finish) |
| `tool_events` | Every tool call + governance decision |
| `approvals` | Human-in-the-loop approval requests |
| `audit_log` | Immutable event history |
| `agents` | Registered agent configurations |
| `domain_profiles` | Domain-specific governance profiles |

---

## ⚙️ Environment Variables

| Variable | Required | Default | Description |
|----------|:--------:|---------|-------------|
| `PORT` | — | `3001` | Server port |
| `SUPABASE_URL` | ✅ | — | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | ✅ | — | Service role key |
| `JWT_SECRET` | ✅ | — | JWT signing secret |
| `AGENT_API_KEY` | ✅ | — | Agent server pre-shared key |
| `FRONTEND_URL` | — | — | Production frontend URL (CORS) |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 + TypeScript 5 |
| Framework | Express 5 |
| Database | Supabase (PostgreSQL) |
| Auth | JWT + Supabase Auth |
| Security | Helmet, express-rate-limit, DOMPurify |
| Logging | Winston + Morgan |

---

## 📄 License

MIT © ForgeOS Team 2026