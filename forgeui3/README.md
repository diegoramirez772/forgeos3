<div align="center">

<img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Supabase-Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
<img src="https://img.shields.io/badge/SCSS-Glassmorphism-CC6699?style=for-the-badge&logo=sass&logoColor=white" />
<img src="https://img.shields.io/badge/i18n-ES%20%7C%20EN-blue?style=for-the-badge" />

# 🎨 ForgeUI3

**The end-user application for the ForgeOS3 platform.**  
*Multi-role. Multi-domain. Premium UX for the agricultural sector.*

[Features](#-features) · [Roles](#-user-roles) · [Canvases](#-canvases) · [Quick Start](#-quick-start)

</div>

---

## 📖 Overview

**ForgeUI3** is the primary end-user interface of ForgeOS3. It delivers tailored role-based experiences for all actors in the agricultural and governance ecosystem — from cattle ranchers in the field to regulators in government offices.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Role-based auth** | Supabase Auth with automatic role-based routing |
| 💬 **AgentChat** | Conversational AI connected to ForgeOS3 Agent via SSE |
| ✅ **Approvals Widget** | Inline human-in-the-loop governance approvals |
| 🗺️ **Domain Canvases** | Rich interactive modules per sector |
| 🌍 **Full i18n** | Spanish / English via translations module |
| 💎 **Premium UI** | Glassmorphism, dark mode, Framer Motion micro-animations |
| 📊 **Governance Bar** | Real-time AI governance status in the global header |
| 📱 **Responsive** | Optimized for mobile, tablet, and desktop |

---

## 👥 User Roles

| Role | Default Route | Access |
|------|--------------|--------|
| `admin` | `/dashboard` | Full platform + user management |
| `government` | `/dashboard` | Full platform + analytics |
| `producer` | `/dashboard` | Field dashboard, canvases, chat, trámites |
| `union_ganadera` | `/tramites/panel` | Trámites and reports only |

> Routing is automatically enforced at login based on the user's role stored in Supabase.

---

## 🗺️ Canvases

Domain-specific interactive dashboards:

| Canvas | Domain | Description |
|--------|--------|-------------|
| `AgroCanvas` | Agrotech | Crop & livestock field monitoring |
| `HealthCanvas` | HealthTech | Animal health records and tracking |
| `FinCanvas` | FinTech | Financial dashboards and subsidy management |

---

## 🚀 Quick Start

```bash
cd forgeui3
cp .env.example .env
npm install
npm run dev
```

---

## 🧩 Key Components

| Component | Description |
|-----------|-------------|
| `AgentChat` | Full AI chat interface with SSE token streaming |
| `ApprovalWidget` | Inline approval cards for governance decisions |
| `GovernanceBar` | Live status of AI governance in global header |
| `Sidebar` | Role-aware navigation |
| `Landing` | Public marketing/product landing page |

---

## ⚙️ Environment Variables

| Variable | Required | Description |
|----------|:--------:|-------------|
| `VITE_SUPABASE_URL` | ✅ | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key |
| `VITE_API_URL` | ✅ | Backend API URL |
| `VITE_AGENT_URL` | ✅ | Agent server URL |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript + Vite |
| Styling | SCSS + Tailwind CSS |
| Animation | Framer Motion |
| Auth | Supabase Auth |
| State | Zustand |
| i18n | Custom translations module |
| Icons | Lucide React |

---

## 📄 License

MIT © ForgeOS Team 2026
