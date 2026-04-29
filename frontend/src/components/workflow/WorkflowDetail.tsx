import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Play, Loader2 } from 'lucide-react'
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
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/workflows" className="text-gray-500 hover:text-gray-700">
            ← 返回
          </Link>
          <h1 className="text-xl font-semibold text-gray-800">{currentWorkflow.name}</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRun}
            disabled={running}
            className="flex items-center gap-2 h-[38px] px-4 bg-primary text-white rounded-[8px] text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          <button
            onClick={() => setActiveTab('canvas')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'canvas'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            画布
          </button>
          <button
            onClick={() => setActiveTab('intents')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'intents'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            意图
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'results'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            结果
          </button>
        </div>
      </div>

      {runError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 text-sm">
          {runError}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'canvas' && (
          <>
            <div className="w-64 bg-gray-100 border-r overflow-y-auto">
              <NodePanel />
            </div>
            <div className="flex-1">
              <Canvas />
            </div>
            <div className="w-80 bg-white border-l overflow-y-auto">
              <PropertiesPanel />
            </div>
          </>
        )}
        {activeTab === 'intents' && (
          <div className="flex-1 overflow-y-auto p-6">
            <IntentEditor />
          </div>
        )}
        {activeTab === 'results' && (
          <div className="flex-1 overflow-y-auto p-6">
            {lastExecution ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                    lastExecution.status === 'completed' ? 'bg-success-bg text-success' :
                    lastExecution.status === 'failed' ? 'bg-red-50 text-red-500' :
                    'bg-primary-light text-primary'
                  }`}>
                    {lastExecution.status === 'completed' ? '已完成' :
                     lastExecution.status === 'failed' ? '失败' : '运行中'}
                  </span>
                  <span className="text-sm text-text-muted">
                    {lastExecution.started_at && new Date(lastExecution.started_at).toLocaleString('zh-CN')}
                  </span>
                </div>
                <div className="bg-surface border border-border rounded-[10px] p-4">
                  <h3 className="text-sm font-medium text-text-primary mb-3">步骤结果</h3>
                  <div className="space-y-2">
                    {lastExecution.step_results.map((sr, idx) => (
                      <div key={sr.step_id} className="flex items-start gap-3 text-sm">
                        <span className={`w-2 h-2 rounded-full mt-1.5 ${
                          sr.status === 'completed' ? 'bg-success' :
                          sr.status === 'failed' ? 'bg-red-500' : 'bg-gray-400'
                        }`} />
                        <div className="flex-1">
                          <span className="text-text-primary">步骤 {idx + 1}</span>
                          <span className="ml-2 text-text-muted">{sr.status}</span>
                          {sr.error && <p className="text-red-500 text-xs mt-1">{sr.error}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-text-muted">
                运行工作流后查看结果
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
