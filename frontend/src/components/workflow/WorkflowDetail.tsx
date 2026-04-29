import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useWorkflowStore } from '../../stores/workflowStore'
import Canvas from '../editor/Canvas'
import PropertiesPanel from '../editor/PropertiesPanel'
import NodePanel from '../editor/NodePanel'
import IntentEditor from './IntentEditor'

export default function WorkflowDetail() {
  const { id } = useParams<{ id: string }>()
  const { currentWorkflow, fetchWorkflows } = useWorkflowStore()
  const [activeTab, setActiveTab] = useState<'canvas' | 'intents' | 'results'>('canvas')

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
            <div className="text-center text-gray-500">
              运行工作流后查看结果
            </div>
          </div>
        )}
      </div>
    </div>
  )
}