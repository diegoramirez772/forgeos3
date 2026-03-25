import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useAgentStore } from '../../store/agentStore'
import { Sidebar } from './Sidebar'

export function AuthLayout() {
  const { isAuthenticated } = useAuthStore()
  const { fetchConfig } = useAgentStore()

  useEffect(() => {
    if (isAuthenticated) {
      fetchConfig()
    }
  }, [isAuthenticated, fetchConfig])

  if (!isAuthenticated) return <Navigate to="/signin" replace />

  return (
    <div className="flex h-screen bg-forge-bg overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-[52px] lg:pt-0">
        <Outlet />
      </main>
    </div>
  )
}