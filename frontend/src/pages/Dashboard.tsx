import { useEffect } from 'react'
import { Activity, CheckCircle, Clock, FileText, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react'
import { ErrorBoundary } from '../components/common/ErrorBoundary'
import { useDashboardStore } from '../stores/dashboardStore'

interface StatCardProps {
  value: number | string
  label: string
  icon: React.ElementType
  valueColor?: string
  index: number
}

function StatCard({ value, label, icon: Icon, valueColor = 'text-text-primary', index }: StatCardProps) {
  return (
    <div
      className="bg-white border border-border rounded-[16px] p-5 hover-lift animate-fade-in-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${valueColor === 'text-success' ? 'bg-success-bg text-success' : 'bg-primary/10 text-primary'}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className={`text-3xl font-bold font-display ${valueColor} mb-1 tracking-tight`}>{value}</div>
      <div className="text-xs text-text-muted font-medium">{label}</div>
    </div>
  )
}

function ExecutionRecord({ time, workflow, status, duration, index }: { time: string; workflow: string; status: 'success' | 'failed' | 'running'; duration: string; index: number }) {
  const statusConfig = {
    success: { bg: 'bg-success/10', text: 'text-success', label: '成功', icon: CheckCircle },
    failed: { bg: 'bg-red-50', text: 'text-red-500', label: '失败', icon: AlertCircle },
    running: { bg: 'bg-primary/10', text: 'text-primary', label: '运行中', icon: Activity },
  }
  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <div
      className="flex items-center gap-4 py-4 border-b border-border last:border-0 animate-fade-in-up"
      style={{ animationDelay: `${300 + index * 60}ms` }}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bg} ${config.text} relative`}>
        <StatusIcon className="w-5 h-5" />
        {status === 'running' && (
          <span className="absolute inset-0 rounded-xl animate-ping opacity-30 bg-primary" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate">{workflow}</p>
        <p className="text-xs text-text-muted">{time}</p>
      </div>
      <div className="text-right">
        <span className={`inline-flex items-center gap-1 text-xs font-semibold ${config.text}`}>
          {config.label}
          {status === 'running' && <Activity className="w-3 h-3 animate-pulse" />}
        </span>
        <p className="text-xs text-text-muted mt-0.5">{duration}</p>
      </div>
    </div>
  )
}

function formatDuration(startedAt: string | null, completedAt: string | null): string {
  if (!startedAt || !completedAt) return '-'
  const start = new Date(startedAt)
  const end = new Date(completedAt)
  const diffMs = end.getTime() - start.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 60) return `${diffSec}s`
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ${diffSec % 60}s`
  const diffHour = Math.floor(diffMin / 60)
  return `${diffHour}h ${diffMin % 60}m`
}

function formatTime(isoString: string | null): string {
  if (!isoString) return '-'
  const date = new Date(isoString)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = date.toDateString() === yesterday.toDateString()
  if (isToday) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) + ' 今天'
  }
  if (isYesterday) return '昨天'
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

function mapStatus(status: string): 'success' | 'failed' | 'running' {
  if (status === 'completed' || status === 'success') return 'success'
  if (status === 'failed') return 'failed'
  return 'running'
}

function DashboardContent() {
  const { stats, records, loading, fetchStats, fetchRecords } = useDashboardStore()

  useEffect(() => {
    fetchStats()
    fetchRecords()
  }, [fetchStats, fetchRecords])

  const statsData = [
    { value: stats?.total_workflows ?? 0, label: '总工作流', icon: FileText, valueColor: 'text-text-primary' },
    { value: stats?.running ?? 0, label: '运行中', icon: Activity, valueColor: 'text-success' },
    { value: stats?.completed ?? 0, label: '已完成', icon: CheckCircle, valueColor: 'text-success' },
    { value: stats?.drafts ?? 0, label: '草稿', icon: Clock, valueColor: 'text-warning' },
    { value: stats?.monthly_executions ?? 0, label: '本月执行', icon: TrendingUp, valueColor: 'text-text-primary' },
    { value: stats?.success_rate ? `${stats.success_rate}%` : '0%', label: '成功率', icon: CheckCircle, valueColor: 'text-success' },
  ]

  return (
    <div>
      {/* Page Header */}
      <div className="mb-10 animate-fade-in-up">
        <h1 className="text-3xl font-bold font-display text-text-primary mb-1 tracking-tight">仪表盘</h1>
        <p className="text-text-secondary">概览 SnapFlow 运行状态</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {loading && !stats ? (
          <div className="lg:col-span-6 flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-text-muted text-sm ml-3">加载中...</p>
          </div>
        ) : (
          statsData.map((stat, idx) => (
            <StatCard key={idx} {...stat} index={idx} />
          ))
        )}
      </div>

      {/* Execution Records */}
      <div className="bg-white border border-border rounded-[16px] p-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold font-display text-text-primary">执行记录</h2>
          {records.length > 0 && (
            <button className="flex items-center gap-1 text-xs text-text-muted hover:text-primary transition-colors">
              查看全部 <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
        {loading && records.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3 mx-auto" />
            <p className="text-text-muted text-sm">加载中...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-100 flex items-center justify-center">
              <Activity className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-text-muted text-sm">暂无执行记录</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {records.map((record, idx) => (
              <ExecutionRecord
                key={record.execution_id}
                time={formatTime(record.started_at)}
                workflow={record.workflow_name || record.workflow_id}
                status={mapStatus(record.status)}
                duration={formatDuration(record.started_at, record.completed_at)}
                index={idx}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  )
}
