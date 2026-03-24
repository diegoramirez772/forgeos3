import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { XCircle } from 'lucide-react'
import { AuthLayout } from './components/layout/AuthLayout'
import { useRunStore } from './store/runStore'

function EmergencyAlertOverlay() {
  const { emergencyAlerts, dismissAlert } = useRunStore()
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {emergencyAlerts.map(alert => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto w-80 bg-red-950 border border-red-500/60 rounded-2xl p-4 shadow-[0_0_30px_rgba(239,68,68,0.25)]"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0 mt-0.5">
                <XCircle size={15} className="text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">Sentinel bloqueó</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                </div>
                <p className="text-sm font-semibold text-white truncate">{alert.toolName}</p>
                <p className="text-xs text-red-300/80 mt-0.5 line-clamp-2">{alert.reason}</p>
              </div>
              <button
                onClick={() => dismissAlert(alert.id)}
                className="text-red-500/60 hover:text-red-400 transition-colors shrink-0"
              >
                <XCircle size={13} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
import { Landing } from './pages/Landing'
import { SignIn } from './pages/SignIn'
import { SignUp } from './pages/SignUp'
import { Dashboard } from './pages/Dashboard'
import { BuilderConsole } from './pages/BuilderConsole'
import { RegistryManager } from './pages/RegistryManager'
import { PolicyStudio } from './pages/PolicyStudio'
import { SentinelStudio } from './pages/SentinelStudio'
import { ApprovalsPanel } from './pages/ApprovalsPanel'
import { Settings } from './pages/Settings'
import { ToolGateway } from './pages/ToolGateway'
import { LoopGuard } from './pages/LoopGuard'
import { AuditTrail } from './pages/AuditTrail'
import { SandboxLayer } from './pages/SandboxLayer'
import { AttackSimulator } from './pages/AttackSimulator'
import { SecurityPulse } from './pages/SecurityPulse'

export default function App() {
  return (
    <BrowserRouter>
      <EmergencyAlertOverlay />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route element={<AuthLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/builder" element={<BuilderConsole />} />
          <Route path="/registry" element={<RegistryManager />} />
          <Route path="/policy" element={<PolicyStudio />} />
          <Route path="/gateway" element={<ToolGateway />} />
          <Route path="/loopguard" element={<LoopGuard />} />
          <Route path="/sandbox" element={<SandboxLayer />} />
          <Route path="/sentinel" element={<SentinelStudio />} />
          <Route path="/audit" element={<AuditTrail />} />
          <Route path="/approvals" element={<ApprovalsPanel />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/attack-simulator" element={<AttackSimulator />} />
          <Route path="/security-pulse" element={<SecurityPulse />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}