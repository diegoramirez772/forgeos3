import { Clock } from 'lucide-react'
import type { SentinelQuery } from '../services/supabase'

interface QueryHistoryProps {
  queries: SentinelQuery[]
  onSelect: (q: string) => void
}

export function QueryHistory({ queries, onSelect }: QueryHistoryProps) {
  if (queries.length === 0) return null

  return (
    <div className="query-history fade-in-up">
      <h3 className="query-history__title">Consultas recientes</h3>
      <div className="query-history__list">
        {queries.map((q) => (
          <button
            key={q.id}
            className="query-history__item"
            onClick={() => onSelect(q.query)}
          >
            <Clock size={12} />
            <span className="truncate">{q.query}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
