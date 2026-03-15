import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

import { registryRouter  } from './routes/registry'
import { agentsRouter    } from './routes/agents'
import { runsRouter      } from './routes/runs'
import { toolsRouter     } from './routes/tools'
import { approvalsRouter } from './routes/approvals'
import { authRouter      } from './routes/auth'
import { sandboxRouter   } from './routes/sandbox'
import { errorHandler    } from './middleware/errorHandler'

const app = express()

// ── Middleware ───────────────────────────────────────────────
app.use(cors())
app.use(express.json())

// ── Health ───────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'forgeos3-backend', timestamp: new Date().toISOString() })
})

// ── Routes ───────────────────────────────────────────────────
app.use('/api/auth',      authRouter)
app.use('/api',           registryRouter)
app.use('/api/agents',    agentsRouter)
app.use('/api/runs',      runsRouter)
app.use('/api/tools',     toolsRouter)
app.use('/api/approvals', approvalsRouter)
app.use('/api/sandbox',   sandboxRouter)

// ── Error handler ────────────────────────────────────────────
app.use(errorHandler)

// ── Start ────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`🔥 ForgeOS3 Backend running on http://localhost:${PORT}`)
  console.log(`   Health check: http://localhost:${PORT}/health`)
})