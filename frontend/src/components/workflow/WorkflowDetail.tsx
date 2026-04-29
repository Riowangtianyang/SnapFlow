import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Play, Loader2, ArrowLeft, CheckCircle2, XCircle, Circle } from 'lucide-react'
import { useWorkflowStore } from '../../stores/workflowStore'
import Canvas from '../editor/Canvas'
import PropertiesPanel from '../editor/PropertiesPanel'
import NodePanel from '../editor/NodePanel'
import IntentEditor from './IntentEditor'
import * as workflowsApi from '../../api/workflows'
import { ApiException } from '../../api/client'

export default function WorkflowDetail() {
  const { id } = useParams<{ id: string }>()
  const { currentWorkflow, fetchWorkflows } = useWorkflowStore()
  const [activeTab, setActiveTab] = useState<'canvas' | 'intents' | 'results'>('canvas')
  const [running, setRunning] = useState(false)
  const [runError, setRunError] = useState<string | null>(null)
  const [lastExecution, setLastExecution] = useState<workflowsApi.RunWorkflowResponse | null>(null)

  useEffect(() => {
    if (!currentWorkflow || currentWorkflow.id !== id) {
      fetchWorkflows().then(() => {
        const wf = useWorkflowStore.getState().workflows.find((w) => w.id === id)
        if (wf) {
          useWorkflowStore.getState().setCurrentWorkflow(wf as any)
        }
      })
    }
  }, [id, currentWorkflow, fetchWorkflows])

  const handleRun = async () => {
    if (!id || running) return
    setRunError(null)
    setRunning(true)
    try {
      const result = await workflowsApi.runWorkflow(id)
      setLastExecution(result)
      setActiveTab('results')
    } catch (err) {
      if (err instanceof ApiException) {
        setRunError(err.detail)
      } else {
        setRunError('运行失败')
      }
    } finally {
      setRunning(false)
    }
  }

  if (!currentWorkflow) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const tabs = [
    { id: 'canvas', label: '画布' },
    { id: 'intents', label: '意图' },
    { id: 'results', label: '结果' },
  ] as const

  return (
    <div className="flex flex-col h-full -m-8">
      {/* Dark Header */}
      <div className="bg-[#0A0A0A] border-b border-white/5 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              to="/workflows"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">返回</span>
            </Link>
            <div>
              <h1 className="text-lg font-bold font-display text-white">{currentWorkflow.name}</h1>
              {currentWorkflow.description && (
                <p className="text-xs text-slate-500 mt-0.5">{currentWorkflow.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRun}
              disabled={running}
              className="flex items-center gap-2 h-[38px] px-5 bg-primary text-white rounded-[8px] text-sm font-semibold hover:bg-primary-hover transition-all btn-press shadow-glow disabled:opacity-50"
            >
              {running ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  运行中...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  运行
                </>
              )}
            </button>
            <div className="flex items-center bg-white/5 rounded-lg p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white/10 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {runError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 text-sm mx-6 mt-4 rounded-lg">
          {runError}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'canvas' && (
          <>
            <div className="w-56 bg-[#0A0A0A] border-r border-white/5">
              <NodePanel />
            </div>
            <div className="flex-1">
              <Canvas />
            </div>
            <div className="w-80 bg-[#0A0A0A] border-l border-white/5">
              <PropertiesPanel />
            </div>
          </>
        )}
        {activeTab === 'intents' && (
          <div className="flex-1 overflow-y-auto p-8 bg-background">
            <IntentEditor />
          </div>
        )}
        {activeTab === 'results' && (
          <div className="flex-1 overflow-y-auto p-8 bg-background">
            {lastExecution ? (
              <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
                {/* Status Header */}
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    lastExecution.status === 'completed' ? 'bg-success/10 text-success' :
                    lastExecution.status === 'failed' ? 'bg-red-500/10 text-red-500' :
                    'bg-primary/10 text-primary'
                  }`}>
                    {lastExecution.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> :
                     lastExecution.status === 'failed' ? <XCircle className="w-6 h-6" /> :
                     <Circle className="w-6 h-6" />}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold font-display text-text-primary">
                      {lastExecution.status === 'completed' ? '执行完成' :
                       lastExecution.status === 'failed' ? '执行失败' : '执行中'}
                    </h2>
                    <p className="text-sm text-text-muted">
                      {lastExecution.started_at && new Date(lastExecution.started_at).toLocaleString('zh-CN')}
                    </p>
                  </div>
                </div>

                {/* Step Results */}
                <div className="bg-white border border-border rounded-[16px] p-6">
                  <h3 className="text-sm font-semibold text-text-primary mb-4">步骤结果</h3>
                  <div className="space-y-3">
                    {lastExecution.step_results.map((sr, idx) => (
                      <div key={sr.step_id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          sr.status === 'completed' ? 'bg-success/10 text-success' :
                          sr.status === 'failed' ? 'bg-red-500/10 text-red-500' :
                          'bg-slate-200 text-slate-500'
                        }`}>
                          {sr.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> :
                           sr.status === 'failed' ? <XCircle className="w-4 h-4" /> :
                           <Circle className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-text-primary">步骤 {idx + 1}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              sr.status === 'completed' ? 'bg-success/10 text-success' :
                              sr.status === 'failed' ? 'bg-red-500/10 text-red-500' :
                              'bg-slate-200 text-slate-500'
                            }`}>
                              {sr.status}
                            </span>
                          </div>
                          {sr.error && (
                            <p className="text-xs text-red-500 mt-1">{sr.error}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                  <Play className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">运行工作流后查看结果</h3>
                <p className="text-sm text-text-muted">点击上方运行按钮开始执行</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
