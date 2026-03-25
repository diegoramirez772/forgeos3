# ForgeOS Sentinel

PWA conversacional para vigilancia del gusano barrenador — Agrotech · Durango, México.

## Setup rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Llena VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_AGENT_URL

# 3. Correr SQL patch en Supabase
# Abre sentinel_queries_patch.sql y pégalo en el SQL Editor de Supabase

# 4. Iniciar dev
npm run dev
```

## Estructura

```
src/
  components/
    VoiceOrb.tsx       — Orb animada (idle/listening/loading)
    SearchBar.tsx      — Input texto + mic + enviar
    ResponseCard.tsx   — Card con resultado estructurado
    QueryHistory.tsx   — Historial de consultas recientes
  services/
    agent.ts           — Conexión SSE al servidor en puerto 4000
    supabase.ts        — Cliente Supabase + persistencia
  hooks/
    useSpeech.ts       — Web Speech API hook
  styles/
    variables.scss
    app.scss
  App.tsx
  main.tsx
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `VITE_SUPABASE_URL` | URL de tu proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Anon key de Supabase |
| `VITE_AGENT_URL` | URL del agente (default: `http://localhost:4000`) |

## Build para producción

```bash
npm run build
```
