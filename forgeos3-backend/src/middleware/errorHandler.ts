import type { Request, Response, NextFunction } from 'express'

const SAFE_MESSAGES = [
  'Not found', 'Unauthorized', 'Forbidden',
  'Bad request', 'Validation error', 'Already exists'
]

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error('[ERROR]', err.message)

  // Never expose raw Supabase or internal error messages to the client
  const isSafe = SAFE_MESSAGES.some(m => err.message?.toLowerCase().includes(m.toLowerCase()))
  const message = isSafe ? err.message : 'An unexpected error occurred'

  res.status(500).json({ error: message })
}