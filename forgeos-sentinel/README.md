<div align="center">

<img src="https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" />
<img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
<img src="https://img.shields.io/badge/Framer_Motion-11-FF0055?style=for-the-badge" />
<img src="https://img.shields.io/badge/Voice-Enabled-34D399?style=for-the-badge" />

# 🛡️ ForgeOS Sentinel

**AI-powered Agrotech PWA for real-time screwworm monitoring.**  
*Voice & text interface. Offline-capable. Field-ready.*

[Demo](#-demo) · [Quick Start](#-quick-start) · [Architecture](#-architecture) · [Queries](#-example-queries)

</div>

---

## 🌱 What is ForgeOS Sentinel?

ForgeOS Sentinel is a single-screen Progressive Web App designed to give ranchers, veterinary technicians, and agricultural supervisors **instant AI access** to live news, alerts, risk assessments, and recommended actions around the **New World Screwworm** (*Cochliomyia hominivorax*).

Designed for use in the field — works on mobile, tablet, and desktop with full PWA installation support.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎤 **Voice Input** | Web Speech API with Spanish MX dialect |
| ⌨️ **Text Input** | Natural language queries |
| 🌐 **Live Web Search** | Real-time Google News RSS (no API key required) |
| 🔍 **Google Integration** | Say "busca en Google..." to open a real browser tab |
| 🤖 **AI Reports** | Structured: Summary · Findings · Risk Level · Recommendation |
| 📱 **PWA** | Installable on iOS, Android, and desktop |
| 🎨 **Premium Dark UI** | Glassmorphism, Apple-inspired, Framer Motion animations |
| 📡 **SSE Streaming** | Token-by-token streaming from the AI agent |

---

## 🚀 Quick Start

### Prerequisites
- `forgeos3-agent` running on `http://localhost:4000`
- `forgeos3-backend` running on `http://localhost:3001`

```bash
cd forgeos-sentinel
cp .env.example .env
npm install
npm run dev      # → http://localhost:5173
```

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🗣️ Example Queries

Speak or type any of these to see the agent in action:

```
"Dame un reporte rápido de la situación del gusano barrenador en México"
"Busca en Google las últimas noticias del gusano barrenador"
"¿Qué señales debo revisar en el ganado esta semana?"
"Resume las alertas sanitarias más recientes"
"¿Cuál es el nivel de riesgo actual en Durango?"
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                 ForgeOS Sentinel (PWA)               │
│                                                     │
│  User (voice / text)                                │
│       │                                             │
│       ▼                                             │
│  App.tsx ──▶ Web Speech API (transcription)         │
│       │                                             │
│       ▼                                             │
│  SearchBar ──▶ Google tab (if "busca en Google")    │
│       │                                             │
│       ▼                                             │
│  agent.ts                                           │
│    POST /api/agent/run ──▶ forgeos3-agent :4000     │
│    GET  /api/agent/stream/:id (SSE tokens)          │
│       │                                             │
│       ▼                                             │
│  parseAgentResponse() ──▶ ResponseCard              │
│                                                     │
│  VoiceOrb (idle / listening / loading / responding) │
└─────────────────────────────────────────────────────┘
```

---

## 🧩 Component Overview

| Component | File | Description |
|-----------|------|-------------|
| `VoiceOrb` | `components/VoiceOrb.tsx` | Animated state orb (Framer Motion) |
| `SearchBar` | `components/SearchBar.tsx` | Text + mic input |
| `ResponseCard` | `components/ResponseCard.tsx` | Structured AI response renderer |
| `QueryHistory` | `components/QueryHistory.tsx` | Recent query history (Supabase) |
| `agent.ts` | `services/agent.ts` | SSE agent communication |

---

## 📱 PWA Configuration

| Property | Value |
|----------|-------|
| Name | ForgeOS Sentinel |
| Short Name | ForgeOS |
| Theme Color | `#0b0f14` |
| Display | Standalone |
| Icons | `/pwa-192.png`, `/pwa-512.png` |

---

## ⚙️ Environment Variables

| Variable | Required | Description |
|----------|:--------:|-------------|
| `VITE_AGENT_URL` | ✅ | Agent server URL (`http://localhost:4000`) |
| `VITE_SUPABASE_URL` | — | Supabase URL (query history) |
| `VITE_SUPABASE_ANON_KEY` | — | Supabase anon key |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript + Vite 5 |
| Styling | SCSS (dark glassmorphism design system) |
| Animation | Framer Motion 11 |
| Icons | Lucide React |
| PWA | vite-plugin-pwa |
| Voice | Web Speech API (native browser) |
| Streaming | Server-Sent Events (SSE) |

---

## 📄 License

MIT © ForgeOS Team 2026
