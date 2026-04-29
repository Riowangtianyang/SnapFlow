import { useState, useRef, useEffect } from 'react'
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { Workflow, LayoutDashboard, Settings, Search, User } from 'lucide-react'
import WorkflowList from './components/workflow/WorkflowList'
import WorkflowDetail from './components/workflow/WorkflowDetail'
import SettingsPage from './components/settings/SettingsPage'
import Dashboard from './pages/Dashboard'

function NavButton({ to, icon: Icon, children, isActive }: { to: string; icon: React.ElementType; children: React.ReactNode; isActive: boolean }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 h-[36px] px-4 rounded-[8px] text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'bg-primary text-white shadow-glow'
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon className="w-4 h-4" />
      {children}
    </Link>
  )
}

function SettingsDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-[36px] h-[36px] rounded-[8px] text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
      >
        <Settings className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[180px] bg-[#18181B] border border-white/10 rounded-[12px] shadow-xl py-1.5 z-50 animate-fade-in-up">
          <Link
            to="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Settings className="w-4 h-4" />
            设置
          </Link>
        </div>
      )}
    </div>
  )
}

function App() {
  const location = useLocation()

  return (
    <div className="min-h-screen page-wrapper">
      <header className="sticky top-0 z-40 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-[60px] flex items-center justify-between">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-8">
            <Link to="/workflows" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <span className="text-white text-lg font-bold font-display">S</span>
              </div>
              <span className="text-lg font-bold text-white font-display tracking-tight">
                SnapFlow
              </span>
            </Link>
            <nav className="flex items-center gap-1">
              <NavButton to="/workflows" icon={Workflow} isActive={location.pathname === '/workflows'}>
                工作流
              </NavButton>
              <NavButton to="/dashboard" icon={LayoutDashboard} isActive={location.pathname === '/dashboard'}>
                仪表盘
              </NavButton>
            </nav>
          </div>

          {/* Right: Search + Settings + Avatar */}
          <div className="flex items-center gap-3">
            <div className="relative w-[180px] group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="搜索..."
                className="w-full h-[36px] pl-9 pr-4 bg-white/5 border border-white/10 rounded-[8px] text-sm text-white placeholder:text-slate-500 focus:border-primary focus:bg-white/10 focus:outline-none transition-all"
              />
            </div>
            <SettingsDropdown />
            <div className="w-[36px] h-[36px] rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/workflows" replace />} />
          <Route path="/workflows" element={<WorkflowList />} />
          <Route path="/workflow/:id" element={<WorkflowDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
