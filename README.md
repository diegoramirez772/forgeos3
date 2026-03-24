<div align="center">

<img src="forgeos3/public/favicon.svg" alt="ForgeOS3" width="64" height="64" />

# ForgeOS3
 
### Infraestructura Runtime-Agnóstica para Agentes de IA Seguros
 
**Construye una vez. Gobierna en cualquier parte.**
 
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-f59e0b?style=flat-square)](LICENSE)
 
<br />
 
> Construido en el **AI Tinkerers Hackathon · Durango, México 2025**
 
</div>
 
---
 
## ¿Qué es ForgeOS3?
 
ForgeOS3 **no es otro runtime de agentes**. Es una capa de infraestructura reutilizable que se posiciona encima de los frameworks de agentes existentes y los hace seguros, auditables y listos para producción.
 
Mientras que frameworks como LangGraph, AutoGen y CrewAI se enfocan en *cómo* piensan los agentes, ForgeOS3 se enfoca en *qué* tienen permitido hacer — y garantiza que cada decisión sea aplicada, registrada y explicable.
 
```
[ Tu Agent Runtime ]
        ↓
[ ForgeOS3 · Capa de Infraestructura ]
   Motor de Políticas · Tool Gateway · Loop Guard
   Approval Router · Sandbox · Audit Trail
   Attack Simulator · Security Pulse
        ↓
[ Supabase · Event Log · Cola de Aprobaciones ]
```
 
---
 
## Módulos del Sistema
 
| Módulo | Ruta | Descripción |
|---|---|---|
| 🏗️ **Builder Console** | `/builder` | Crea agentes desde plantillas con perfiles de dominio, tool packs y presets de política |
| 📦 **Registry Manager** | `/registry` | Almacén centralizado de perfiles de dominio, tool packs y configs de política |
| ⚖️ **Policy Studio** | `/policy` | Evalúa cada intento de herramienta y retorna `allowed`, `blocked`, o `approval_required` |
| 🔀 **Tool Gateway** | `/gateway` | Capa de intercepción — cada llamada a herramienta pasa por aquí antes de ejecutarse |
| 🔁 **Loop Guard** | `/loopguard` | Detecta comportamiento fuera de control, rastrea risk scores, activa modo seguro o kill switch |
| 🧱 **Sandbox Layer** | `/sandbox` | Ejecución aislada con timeouts, límites de recursos, allowlist de red y scoping de secretos |
| 👁️ **Sentinel Studio** | `/sentinel` | Dashboard en vivo de ejecuciones activas, timelines de herramientas y badges de decisión |
| 📋 **Audit Trail** | `/audit` | Registro institucional completo de ejecuciones, decisiones, aprobaciones y eventos de riesgo |
| ✅ **Approvals Panel** | `/approvals` | Flujo human-in-the-loop para llamadas a herramientas sensibles |
| 💥 **Attack Simulator** | `/attack-simulator` | Simula ataques reales: prompt injection, exfiltración y social engineering |
| 🛡️ **Security Pulse** | `/security-pulse` | Dashboard de seguridad en tiempo real con métricas, tendencias y alertas activas |
 
---
 
## Dominios Soportados
 
| Dominio | Herramientas | Risk Mode |
|---|---|---|
| ♥ **HealthTech** | `summarize`, `checklist`, `diagnose`\*, `write_record`\* | Safe |
| ⬡ **AgroTech** | `analyze_crop`, `predict_yield`, `apply_treatment`\*, `write_report`\* | Safe |
| ◈ **FinTech** | `analyze`, `detect_fraud`, `generate_report`, `execute_transfer`\* | Normal |
| ◎ **Custom** | Define tus propias políticas y reglas | Normal |
 
`*` requiere aprobación humana o está bloqueado según el preset de política activo.
 
---
 
## Presets de Política
 
| Preset | Nivel | Comportamiento |
|---|---|---|
| 🟢 **Permissive** | Bajo | Permite la mayoría de acciones, mínimas aprobaciones |
| 🟡 **Balanced** | Medio | Bloquea críticos, aprobación para herramientas de alto riesgo |
| 🔴 **Strict** | Estricto | Máxima gobernanza — todas las herramientas sensibles requieren aprobación |
 
---
 
## Demo — Un Agente, Cinco Escenarios
 
**Escenario A — HealthTech (Strict)**
```
Input: "Resume el ingreso del paciente #4821 y crea checklist de seguimiento"
 
summarize      → ✅ permitido
checklist      → ✅ permitido
diagnose       → ❌ bloqueado          (sensibilidad crítica · política estricta)
write_record   → ⏳ aprobación requerida
```
 
**Escenario B — AgroTech (Balanced)**
```
Input: "Analiza salud del cultivo del campo #7 y programa tratamiento"
 
analyze_crop    → ✅ permitido
predict_yield   → ✅ permitido
apply_treatment → ⏳ aprobación requerida  (alto impacto en campo)
write_report    → ⏳ aprobación requerida
```
 
**Escenario C — FinTech (Permissive)**
```
Input: "Analiza transacciones de marzo y genera reporte de riesgos"
 
analyze          → ✅ permitido
detect_fraud     → ✅ permitido
generate_report  → ✅ permitido
execute_transfer → ⏳ aprobación requerida  (transferencia financiera)
```
 
**Escenario D — Loop Guard**
```
Misma herramienta llamada repetidamente
  → risk score escala
  → safe mode activado
  → kill switch
```
 
**Escenario E — Attack Simulator**
```
"Grandmother Exploit"    → ⚡ interceptado   (social engineering detectado)
"Prompt Leakage"         → ⚡ interceptado   (intento de exfiltración)
"Unauthorized Transfer"  → ⚡ interceptado   (bypass de aprobación bloqueado)
```
 
---
 
## Arquitectura
 
```
┌─────────────────────────────────────────────────────────┐
│                   ForgeOS3 Web App                       │
│  Builder · Registry · Policy · Sentinel · Audit          │
│  Attack Simulator · Security Pulse · Dashboard           │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP (Axios · api.ts)
┌──────────────────────────▼──────────────────────────────┐
│                  ForgeOS3 Core API                        │
│  Policy Engine · Tool Gateway · Loop Guard               │
│  Approval Router · Sandbox Layer · Audit & Event Log     │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│               Runtime Adapter Layer                       │
│  OpenClaw Adapter (live) · LangGraph · AutoGen (planned) │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                  Supabase                                 │
│       Auth · PostgreSQL · Event Log · Approvals          │
└─────────────────────────────────────────────────────────┘
```
 
---
 
## Estructura del Repositorio
 
```
forgeos3/                          ← Frontend (Cristian)
├── src/
│   ├── pages/                     # 15 páginas
│   │   ├── Landing.tsx
│   │   ├── Dashboard.tsx
│   │   ├── BuilderConsole.tsx
│   │   ├── RegistryManager.tsx
│   │   ├── PolicyStudio.tsx
│   │   ├── ToolGateway.tsx
│   │   ├── LoopGuard.tsx
│   │   ├── SandboxLayer.tsx
│   │   ├── SentinelStudio.tsx
│   │   ├── AuditTrail.tsx
│   │   ├── ApprovalsPanel.tsx
│   │   ├── AttackSimulator.tsx    # ← Simulación de ataques reales
│   │   ├── SecurityPulse.tsx      # ← Dashboard de seguridad en vivo
│   │   ├── Settings.tsx
│   │   ├── SignIn.tsx
│   │   └── SignUp.tsx
│   ├── components/
│   │   ├── layout/                # AuthLayout · Sidebar · TopBar
│   │   └── ui/                    # Badge · Button · Card · Modal · Skeleton · Toggle
│   ├── store/                     # Zustand
│   │   ├── agentStore.ts
│   │   ├── authStore.ts
│   │   ├── runStore.ts            # Emergency alerts · kill switch state
│   │   └── dashboardStore.ts      # Security Pulse metrics · live stats
│   ├── lib/
│   │   ├── constants.ts           # DOMAIN_PROFILES · TOOL_PACKS · POLICY_PRESETS
│   │   ├── api.ts                 # Axios client
│   │   └── supabase.ts            # Auth + reads en vivo
│   └── types/
│       ├── agent.ts
│       ├── run.ts
│       ├── approval.ts
│       └── policy.ts
 
forgeos3-backend/                  ← API + Core Engine (Diego) [en desarrollo]
├── src/
│   ├── routes/                    # Endpoints REST
│   ├── engine/                    # Policy · Gateway · LoopGuard · Audit · Sandbox
│   └── db/                        # Supabase client + seeds
 
forgeos3-agent/                    ← OpenClaw Adapter (William) [en desarrollo]
├── src/
│   ├── adapter/                   # Implementación RuntimeAdapter
│   ├── scenarios/                 # HealthTech · AgroTech · FinTech demos
│   └── tools/                     # Definiciones de herramientas por dominio
```
 
---
 
## Primeros Pasos
 
### Prerequisitos
 
- Node.js 20+
- Proyecto en Supabase (Auth habilitado)
- OpenClaw instalado (para el adapter)
 
### 1. Clonar
 
```bash
git clone https://github.com/diegoramirez772/forgeos3.git
cd forgeos3
```
 
### 2. Frontend
 
```bash
cd forgeos3
npm install
cp .env.example .env
npm run dev       # http://localhost:5173
```
 
```env
VITE_API_URL=http://localhost:3001
VITE_AGENT_URL=http://localhost:4000
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```
 
### 3. Backend
 
```bash
cd forgeos3-backend
npm install
cp .env.example .env
npm run dev       # http://localhost:3001
```
 
### 4. Agente (OpenClaw)
 
```bash
cd forgeos3-agent
npm install
cp .env.example .env    # FORGEOS3_API_URL=http://localhost:3001
npm run demo:healthtech
npm run demo:agrotech
npm run demo:fintech
```
 
---
 
## Stack Tecnológico
 
| Capa | Tecnología |
|---|---|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS, Zustand, Framer Motion, Recharts |
| Backend | Node.js, Express, TypeScript, Zod |
| Base de datos | Supabase (PostgreSQL + Auth) |
| Agent Runtime | OpenClaw |
| HTTP Client | Axios |
| Compartido | Interfaces TypeScript en los tres proyectos |
 
---
 
## Estado del Proyecto
 
- [x] Frontend — 15 páginas construidas incluyendo Attack Simulator y Security Pulse
- [x] Sistema UI — Badge, Button, Card, Modal, Skeleton, Toggle
- [x] Emergency alert overlay — kill switch en tiempo real
- [x] Zustand stores — agentStore, authStore, runStore, dashboardStore
- [x] Dominios: HealthTech, AgroTech, FinTech + Custom (con tool packs y policy presets)
- [x] Integración con Supabase (auth + reads en vivo)
- [ ] Schema completo de Supabase + seeds
- [ ] Endpoints del Core API (`/api/dashboard/stats` y demás)
- [ ] Lógica del Policy Engine
- [ ] Integración con OpenClaw Adapter
- [ ] Demo end-to-end (5 escenarios)
- [ ] Deploy
 
---
 
## Equipo
 
| Rol | Persona |
|---|---|
| Backend · DB · Core Engine | Diego |
| Runtime · OpenClaw Adapter | William |
| Frontend · Dashboard · UI | Cristian |
 
---
 
<div align="center">
 
**ForgeOS3** · AI Tinkerers Hackathon · Durango, México 2025
 
*No estamos construyendo otro agente. Estamos construyendo la capa de infraestructura que hace que los agentes sean seguros, reutilizables y listos para producción en cualquier runtime.*
 
</div>
