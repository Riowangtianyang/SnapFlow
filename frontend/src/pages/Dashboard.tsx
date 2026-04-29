import { useEffect } from 'react'
import { Activity, CheckCircle, Clock, FileText, TrendingUp, AlertCircle } from 'lucide-react'
import { ErrorBoundary } from '../components/common/ErrorBoundary'
import { useDashboardStore } from '../stores/dashboardStore'

interface StatCardProps {
  value: number | string
  label: string
  icon: React.ElementType
  valueColor?: string
}

function StatCard({ value, label, icon: Icon, valueColor = 'text-text-primary' }: StatCardProps) {
  return (
    <div className="bg-surface border border-border rounded-[10px] p-5">
      <div className="flex items-start justify-between mb-3">
        <Icon className="w-5 h-5 text-text-muted" />
      </div>
      <div className={`text-3xl font-semibold font-serif ${valueColor} mb-1`}>{value}</div>
      <div className="text-xs text-text-muted">{label}</div>
    </div>
  )
}

function ExecutionRecord({ time, workflow, status, duration }: { time: string; workflow: string; status: 'success' | 'failed' | 'running'; duration: string }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-border last:border-0">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        status === 'success' ? 'bg-success-bg text-success' :
        status === 'failed' ? 'bg-red-50 text-red-500' :
        'bg-primary-light text-primary'
      }`}>
        {status === 'success' && <CheckCircle className="w-4 h-4" />}
        {status === 'failed' && <AlertCircle className="w-4 h-4" />}
        {status === 'running' && <Activity className="w-4 h-4 animate-pulse" />}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-text-primary">{workflow}</p>
        <p className="text-xs text-text-muted">{time}</p>
      </div>
      <div className="text-right">
        <span className={`text-xs font-medium ${
          status === 'success' ? 'text-success' :
          status === 'failed' ? 'text-red-500' :
          'text-primary'
        }`}>
          {status === 'success' ? '成功' : status === 'failed' ? '失败' : '运行中'}
        </span>
        <p className="text-xs text-text-muted">{duration}</p>
      </div>
    </div>
  )
}

function formatDuration(startedAt: string | null, completedAt: string | null): string {
  if (!startedAt) return '-'
  if (!completedAt) return '-'
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
  if (isYesterday) {
    return '昨天'
  }
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
    { value: stats?.total_workflows ?? 0, label: '总工作流', icon: FileText },
    { value: stats?.running ?? 0, label: '运行中', icon: Activity, valueColor: 'text-success' },
    { value: stats?.completed ?? 0, label: '已完成', icon: CheckCircle, valueColor: 'text-success' },
    { value: stats?.drafts ?? 0, label: '草稿', icon: Clock, valueColor: 'text-warning' },
    { value: stats?.monthly_executions ?? 0, label: '本月执行', icon: TrendingUp },
    { value: stats?.success_rate ? `${stats.success_rate}%` : '0%', label: '成功率', icon: CheckCircle, valueColor: 'text-success' },
  ]

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary mb-1">仪表盘</h1>
        <p className="text-sm text-text-secondary">概览 SnapFlow 运行状态</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {loading && !stats ? (
          <div className="lg:col-span-6 flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-2" />
            <p className="text-text-muted text-sm ml-3">加载中...</p>
          </div>
        ) : (
          statsData.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))
        )}
      </div>

      {/* Execution Records */}
      <div className="bg-surface border border-border rounded-[14px] p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">执行记录</h2>
        {loading && records.length === 0 ? (
          <div className="text-center py-8 text-text-muted text-sm">加载中...</div>
        ) : records.length === 0 ? (
          <div className="text-center py-8 text-text-muted text-sm">
            暂无执行记录
          </div>
        ) : (
          <div className="divide-y divide-border">
            {records.map((record) => (
              <ExecutionRecord
                key={record.execution_id}
                time={formatTime(record.started_at)}
                workflow={record.workflow_name || record.workflow_id}
                status={mapStatus(record.status)}
                duration={formatDuration(record.started_at, record.completed_at)}
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
