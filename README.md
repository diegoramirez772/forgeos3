<div align="center">

<img src="public/favicon.svg" alt="ForgeOS3" width="64" height="64" />

# ForgeOS3

### Infraestructura Runtime-Agnóstica para Agentes de IA Seguros

**Construye una vez. Gobierna en cualquier parte.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
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

| Módulo | Descripción |
|---|---|
| 🏗️ **Builder Console** | Crea agentes desde plantillas reutilizables con perfiles de dominio, tool packs y presets de política |
| 📦 **Registry Manager** | Almacén centralizado de perfiles de dominio, tool packs, configs de política y adaptadores de runtime |
| ⚖️ **Policy Studio** | Evalúa cada intento de herramienta y retorna `allowed`, `blocked`, o `approval_required` |
| 🔀 **Tool Gateway** | Capa de intercepción — cada llamada a herramienta pasa por aquí antes de ejecutarse |
| 🔁 **Loop Guard** | Detecta comportamiento fuera de control, rastrea risk scores, activa modo seguro o kill switch |
| 🧱 **Sandbox Layer** | Ejecución aislada con timeouts, límites de recursos, allowlist de red y scoping de secretos |
| 👁️ **Sentinel Studio** | Dashboard en vivo de ejecuciones activas, timelines de herramientas y badges de decisión |
| 📋 **Audit Trail** | Registro institucional completo de ejecuciones, decisiones, aprobaciones y eventos de riesgo |
| ✅ **Approvals Panel** | Flujo human-in-the-loop para llamadas a herramientas sensibles |
| 💥 **Attack Simulator** | Simula ataques reales de prompt injection, exfiltración y social engineering para validar la gobernanza |
| 🛡️ **Security Pulse** | Dashboard de seguridad en tiempo real con métricas, tendencias y alertas de amenazas activas |

---

## Dominios Soportados

| Dominio | Herramientas | Risk Mode |
|---|---|---|
| ♥ **HealthTech** | summarize, checklist, diagnose\*, write_record\* | Safe |
| ⬡ **AgroTech** | analyze_crop, predict_yield, apply_treatment\*, write_report\* | Safe |
| ◈ **FinTech** | analyze, detect_fraud, generate_report, execute_transfer\* | Normal |
| ◎ **Custom** | Define tus propias políticas y reglas | Normal |

`*` requiere aprobación humana o está bloqueado según el preset de política activo.

---

## Demo — Un Agente, Tres Modos de Gobernanza

El mismo agente se comporta diferente dependiendo de su perfil de dominio y preset de política.

**Escenario A — HealthTech (Strict)**
```
Input: "Resume el ingreso del paciente #4821 y crea checklist de seguimiento"

summarize      → ✅ permitido
checklist      → ✅ permitido
diagnose       → ❌ bloqueado   (sensibilidad crítica · política estricta)
write_record   → ⏳ aprobación requerida
```

**Escenario B — AgroTech (Balanced)**
```
Input: "Analiza salud del cultivo del campo #7 y programa tratamiento"

analyze_crop   → ✅ permitido
predict_yield  → ✅ permitido
apply_treatment→ ⏳ aprobación requerida  (alto impacto en campo)
```

**Escenario C — FinTech (Permissive)**
```
Input: "Analiza transacciones de marzo y genera reporte de riesgos"

analyze         → ✅ permitido
detect_fraud    → ✅ permitido
generate_report → ✅ permitido
execute_transfer→ ⏳ aprobación requerida  (transferencia financiera)
```

**Escenario D — Loop Guard**
```
Misma herramienta llamada repetidamente → risk score escala → safe mode activado → kill switch
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
│  Attack Simulator · Security Pulse                       │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP
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
│                  Agent Runtime(s)                         │
│              OpenClaw · Custom Enterprise                 │
└─────────────────────────────────────────────────────────┘
```

---

## Estructura del Repositorio

```
forgeos3/                        ← Frontend (Cristian)
├── src/
│   ├── pages/                   # 15 páginas — Builder, Sentinel, Audit,
│   │   ├── Dashboard.tsx        #   Attack Simulator, Security Pulse, etc.
│   │   ├── AttackSimulator.tsx  # ← NUEVO: simulación de ataques reales
│   │   ├── SecurityPulse.tsx    # ← NUEVO: dashboard de seguridad en vivo
│   │   ├── PolicyStudio.tsx
│   │   ├── SentinelStudio.tsx
│   │   └── ...
│   ├── components/              # Sistema UI — Badge, Button, Card, Modal...
│   │   ├── layout/              #   AuthLayout, Sidebar, TopBar
│   │   └── ui/                  #   Badge, Button, Card, Modal, Skeleton, Toggle
│   ├── store/                   # Zustand — auth, agents, runs, dashboard
│   │   ├── agentStore.ts
│   │   ├── authStore.ts
│   │   ├── runStore.ts
│   │   └── dashboardStore.ts    # ← NUEVO
│   ├── lib/
│   │   ├── constants.ts         # Domain profiles, tool packs, policy presets
│   │   ├── api.ts
│   │   └── supabase.ts
│   └── types/                   # TypeScript compartido

forgeos3-backend/                ← API + Core Engine (Diego) [en desarrollo]
├── src/
│   ├── routes/                  # Endpoints REST
│   ├── engine/                  # Policy, Gateway, LoopGuard, Audit, Sandbox
│   └── db/                      # Supabase client + seeds

forgeos3-agent/                  ← OpenClaw Adapter (William) [en desarrollo]
├── src/
│   ├── adapter/                 # Implementación RuntimeAdapter
│   ├── scenarios/               # HealthTech, AgroTech, FinTech demos
│   └── tools/                   # Definiciones de herramientas por dominio
```

---

## Rutas del Frontend

| Ruta | Página | Descripción |
|---|---|---|
| `/` | Landing | Página de inicio pública |
| `/dashboard` | Dashboard | Vista general del sistema |
| `/builder` | Builder Console | Crear y configurar agentes |
| `/registry` | Registry Manager | Gestión de perfiles y tool packs |
| `/policy` | Policy Studio | Configuración del motor de políticas |
| `/gateway` | Tool Gateway | Monitoreo de interceptaciones |
| `/loopguard` | Loop Guard | Detección de comportamiento repetitivo |
| `/sandbox` | Sandbox Layer | Control de ejecución aislada |
| `/sentinel` | Sentinel Studio | Dashboard de ejecuciones en vivo |
| `/audit` | Audit Trail | Registro histórico institucional |
| `/approvals` | Approvals Panel | Flujo de aprobaciones human-in-the-loop |
| `/attack-simulator` | Attack Simulator | ← Simulación de ataques de prompt |
| `/security-pulse` | Security Pulse | ← Métricas de seguridad en tiempo real |
| `/settings` | Settings | Configuración de cuenta |

---

## Primeros Pasos

### Prerequisitos
- Node.js 20+
- Proyecto en Supabase
- OpenClaw instalado

### 1. Clonar
```bash
git clone https://github.com/diegoramirez772/forgeos3.git
cd forgeos3
```

### 2. Frontend
```bash
cd forgeos3
npm install
cp .env.example .env        # configurar VITE_API_URL y VITE_AGENT_URL
npm run dev                 # corre en http://localhost:5173
```

Variables de entorno necesarias:
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
cp .env.example .env        # agregar credenciales de Supabase
npm run dev                 # corre en http://localhost:3001
```

### 4. Agente
```bash
cd forgeos3-agent
npm install
cp .env.example .env        # configurar FORGEOS3_API_URL
npm run demo:healthtech     # ejecutar escenario HealthTech
npm run demo:agrotech       # ejecutar escenario AgroTech
npm run demo:fintech        # ejecutar escenario FinTech
```

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS, Zustand, Framer Motion, Recharts |
| Backend | Node.js, Express, TypeScript, Zod |
| Base de datos | Supabase (PostgreSQL) |
| Agent Runtime | OpenClaw |
| Compartido | Interfaces TypeScript en los tres proyectos |

---

## Estado del Proyecto

- [x] Frontend — 15 páginas construidas incluyendo Attack Simulator y Security Pulse
- [x] Capa de mock data — demo completo con datos realistas
- [x] Dominios: HealthTech, AgroTech, FinTech + Custom
- [x] Integración con Supabase (auth + reads en vivo)
- [ ] Schema completo de Supabase + seeds
- [ ] Endpoints del Core API
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

*No estamos construyendo otro agente. Estamos construyendo la capa de infraestructura que hace que los agentes sean más seguros, reutilizables y listos para producción en cualquier runtime.*

</div>
