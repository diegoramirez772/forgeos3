import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldAlert, Check, X } from 'lucide-react'
import { forgeApi } from '../lib/forgeosClient'
import { toast } from 'react-hot-toast'
import type { Domain } from '../types'

interface Approval {
  id: string
  tool_name: string
  reason: string
  agent_name: string
}

export function ApprovalWidget({ domain }: { domain: Domain }) {
  const [pending, setPending] = useState<Approval | null>(null)
  const [resolving, setResolving] = useState(false)

  // Polling for pending approvals for this domain
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const { data } = await forgeApi.get(`/api/approvals?domain=${domain}&status=pending&limit=1`)
        if (data.data && data.data.length > 0) {
          setPending(data.data[0])
        } else {
          setPending(null)
        }
      } catch {
        // silently fail polling
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [domain])

  const handleResolve = async (status: 'approved' | 'rejected') => {
    if (!pending || resolving) return
    setResolving(true)
    const toastId = toast.loading(`${status === 'approved' ? 'Approving' : 'Rejecting'} action...`)
    try {
      await forgeApi.post(`/api/approvals/${pending.id}/resolve`, {
        status,
        reviewedBy: 'admin@forgeos3.dev'
      })
      toast.success(`Action ${status}`, { id: toastId })
      setPending(null)
    } catch {
      toast.error('Failed to resolve approval', { id: toastId })
    } finally {
      setResolving(false)
    }
  }

  return (
    <AnimatePresence>
      {pending && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md z-50"
        >
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid rgba(245, 166, 35, 0.4)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            borderRadius: 12,
            overflow: 'hidden'
          }}>
            <div style={{ background: 'rgba(245, 166, 35, 0.1)', padding: '12px 16px', borderBottom: '1px solid rgba(245, 166, 35, 0.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <ShieldAlert size={18} color="#f5a623" />
              <span style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: 13 }}>Human Approval Required</span>
            </div>
            
            <div style={{ padding: 16 }}>
              <p style={{ color: 'var(--color-subtle)', fontSize: 13, marginBottom: 12 }}>
                <strong>{pending.agent_name}</strong> wants to execute 
                <code style={{ margin: '0 4px', padding: '2px 6px', background: 'var(--color-elevated)', borderRadius: 4, color: 'var(--color-secondary)' }}>{pending.tool_name}</code>
              </p>
              
              <div style={{ background: 'var(--color-elevated)', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                <p className="mono" style={{ fontSize: 11, color: 'var(--color-secondary)' }}>
                  {pending.reason}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleResolve('rejected')}
                  disabled={resolving}
                  className="flex-1 flex items-center justify-center gap-2"
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--color-danger)',
                    color: 'var(--color-danger)',
                    padding: '8px 0',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: resolving ? 'not-allowed' : 'pointer',
                    opacity: resolving ? 0.5 : 1
                  }}
                >
                  <X size={15} /> Reject
                </button>
                <button
                  onClick={() => handleResolve('approved')}
                  disabled={resolving}
                  className="flex-1 flex items-center justify-center gap-2"
                  style={{
                    background: 'var(--color-success)',
                    border: 'none',
                    color: '#fff',
                    padding: '8px 0',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: resolving ? 'not-allowed' : 'pointer',
                    opacity: resolving ? 0.5 : 1
                  }}
                >
                  <Check size={15} /> Approve
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
