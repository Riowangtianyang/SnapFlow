import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, FileText, MousePointer, Download, ChevronRight, Clock } from 'lucide-react'
import { useWorkflowStore } from '../../stores/workflowStore'
import { ErrorBoundary } from '../common/ErrorBoundary'
import type { WorkflowSummary } from '../../api/types'
import { ApiException } from '../../api/client'

function EmptyStateCard() {
  return (
    <div className="relative bg-white border border-border rounded-[16px] p-12 text-center group hover-lift card-glow animate-fade-in-up">
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
        <Plus className="w-10 h-10 text-primary" />
      </div>
      <h3 className="text-xl font-bold font-display text-text-primary mb-2">创建第一个工作流</h3>
      <p className="text-text-secondary mb-8 max-w-sm mx-auto">
        通过简单的可视化编辑器，快速构建自动化采集流程
      </p>
      <Link
        to="/workflows?create=true"
        className="inline-flex items-center gap-2 h-[44px] px-6 bg-primary text-white rounded-[10px] text-sm font-semibold hover:bg-primary-hover transition-all btn-press shadow-glow"
      >
        <Plus className="w-4 h-4" />
        新建工作流
      </Link>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'running') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-success-bg text-success border border-success/20">
        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
        运行中
      </span>
    )
  }
  if (status === 'draft') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-warning-bg text-warning border border-warning/20">
        <Clock className="w-3 h-3" />
        草稿
      </span>
    )
  }
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-success-bg text-success border border-success/20">
        <span className="w-1.5 h-1.5 rounded-full bg-success" />
        已完成
      </span>
    )
  }
  return null
}

function NodeTag({ type }: { type: string }) {
  const configs: Record<string, { icon: React.ElementType; label: string; className: string }> = {
    click: { icon: MousePointer, label: '点击', className: 'bg-primary/10 text-primary border-primary/20' },
    extract: { icon: FileText, label: '提取', className: 'bg-purple-100 text-purple-700 border-purple-200' },
    download: { icon: Download, label: '下载', className: 'bg-accent/10 text-accent border-accent/20' },
  }
  const config = configs[type] || configs.click
  const Icon = config.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${config.className}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  )
}

function WorkflowCard({ workflow, index }: { workflow: WorkflowSummary; index: number }) {
  return (
    <Link
      to={`/workflow/${workflow.id}`}
      className="group relative bg-white border border-border rounded-[16px] p-6 hover-lift card-glow animate-fade-in-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-6 right-6 h-[3px] bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-full" />

      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 pr-4">
          <h3 className="font-bold text-lg text-text-primary font-display leading-tight mb-1 group-hover:text-primary transition-colors">
            {workflow.name}
          </h3>
          {workflow.description && (
            <p className="text-sm text-text-muted line-clamp-2">{workflow.description}</p>
          )}
        </div>
        <StatusBadge status={workflow.status} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          <NodeTag type="click" />
          <NodeTag type="extract" />
        </div>
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>{workflow.updated_at ? new Date(workflow.updated_at).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) : '-'}</span>
          <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        </div>
      </div>
    </Link>
  )
}

function WorkflowListContent() {
  const { workflows, loading, error, fetchWorkflows, createWorkflow } = useWorkflowStore()
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [createError, setCreateError] = useState<string | null>(null)

  useEffect(() => {
    fetchWorkflows()
  }, [fetchWorkflows])

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreateError(null)
    try {
      await createWorkflow(newName, newDesc)
      setNewName('')
      setNewDesc('')
      setShowCreate(false)
    } catch (err) {
      if (err instanceof ApiException) {
        setCreateError(err.detail)
      } else {
        setCreateError('创建失败')
      }
    }
  }

  const getErrorMessage = (err: unknown) => {
    if (err instanceof ApiException) return err.detail
    if (err instanceof Error) return err.message
    return String(err)
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-10 animate-fade-in-up">
        <h1 className="text-3xl font-bold font-display text-text-primary mb-1 tracking-tight">工作流</h1>
        <p className="text-text-secondary">管理和自动化您的数据采集流程</p>
      </div>

      {/* Create Form */}
      {showCreate ? (
        <div className="bg-white border border-border rounded-[16px] p-6 mb-6 animate-fade-in-up">
          <input
            type="text"
            placeholder="工作流名称"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full h-[44px] px-4 border border-border rounded-[10px] text-sm mb-3 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none input-glow transition-all"
            autoFocus
          />
          <textarea
            placeholder="描述（可选）"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-[10px] text-sm mb-3 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none resize-none input-glow transition-all"
            rows={2}
          />
          {createError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-[10px] mb-3 text-sm border border-red-100">{createError}</div>
          )}
          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              className="h-[44px] px-6 bg-primary text-white rounded-[10px] text-sm font-semibold hover:bg-primary-hover transition-all btn-press"
            >
              创建
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="h-[44px] px-6 bg-white border border-border text-text-secondary rounded-[10px] text-sm font-semibold hover:border-primary hover:text-primary transition-all"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowCreate(true)}
          className="w-full bg-white border-2 border-dashed border-border rounded-[16px] p-6 mb-8 text-center hover:border-primary hover:bg-primary/5 transition-all group animate-fade-in-up"
        >
          <span className="text-text-secondary group-hover:text-primary transition-colors">点击创建新工作流</span>
        </button>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-[12px] mb-6 animate-fade-in-up">
          <p className="font-semibold">错误</p>
          <p className="text-sm mt-1">{getErrorMessage(error)}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-text-muted text-sm ml-3">加载中...</p>
        </div>
      )}

      {/* Workflow Grid */}
      {!loading && (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {workflows.length === 0 ? (
            <div className="md:col-span-2 lg:col-span-3">
              <EmptyStateCard />
            </div>
          ) : (
            workflows.map((wf: WorkflowSummary, idx: number) => (
              <WorkflowCard key={wf.id} workflow={wf} index={idx} />
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default function WorkflowList() {
  return (
    <ErrorBoundary>
      <WorkflowListContent />
    </ErrorBoundary>
  )
}
