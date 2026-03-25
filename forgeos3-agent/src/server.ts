import "dotenv/config"
import express from "express"
import cors from "cors"
import { EventEmitter } from "events"
import { startRun, log } from "./adapter/openclawAdapter"
import { AgentExecutor } from "./runtime/executor"

const app = express()
app.use(cors())
app.use(express.json())

const executor = new AgentExecutor()

// Track active runs for SSE streaming
const activeRuns = new Map<string, EventEmitter>()

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    adapter: 'openclaw_v1',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  })
})

/**
 * POST /api/agent/run
 * Starts a new agent run and returns the runId
 */
app.post("/api/agent/run", async (req, res) => {
  const { query, domain, agentName, runtime, mode } = req.body
  
  try {
    const SENTINEL_ID = "2d370610-d4c9-4589-af26-2bb620e363cc";
    const runDomain = domain || "agrotech";

    // 1. Initialize run via adapter (registers in DB)
    const { id: runId } = await startRun(SENTINEL_ID, runDomain, query)
    
    // 2. Create an event emitter for this run
    const emitter = new EventEmitter()
    activeRuns.set(runId, emitter)

    // 3. Start execution in background
    executor.execute({
      agentId: SENTINEL_ID,
      agentName: "Forge Sentinel",
      domain: domain || "agrotech",
      input: query,
      mode: mode || "sentinel",
      onToken: (text) => emitter.emit("data", { type: "token", text }),
      onGovEvent: (event) => emitter.emit("data", { type: "gov_event", ...event }),
    }).then(() => {
      emitter.emit("data", { type: "done" })
      setTimeout(() => activeRuns.delete(runId), 10000) // Cleanup after 10s
    }).catch(err => {
      emitter.emit("data", { type: "error", message: err.message })
      setTimeout(() => activeRuns.delete(runId), 10000)
    })

    res.json({ runId })

  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * GET /api/agent/stream/:runId
 * Servers Sent Events (SSE) stream for a specific run
 */
app.get("/api/agent/stream/:runId", (req, res) => {
  const { runId } = req.params
  const emitter = activeRuns.get(runId)

  if (!emitter) {
    return res.status(404).json({ error: "Run not found or already finished" })
  }

  res.setHeader("Content-Type", "text/event-stream")
  res.setHeader("Cache-Control", "no-cache")
  res.setHeader("Connection", "keep-alive")

  const send = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }

  const onData = (data: any) => {
    send(data)
    if (data.type === "done" || data.type === "error") {
      cleanup()
    }
  }

  const cleanup = () => {
    emitter.off("data", onData)
    res.end()
  }

  emitter.on("data", onData)

  req.on("close", cleanup)
})

const PORT = 4000
app.listen(PORT, () => {
  log("🚀", `ForgeOS3 Agent Server (OpenClaw) running on http://localhost:${PORT}`)
})
