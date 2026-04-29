import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useWorkflowStore } from '../../stores/workflowStore'
import type { WorkflowSummary } from '../../api/types'

export default function WorkflowList() {
  const { workflows, loading, error, fetchWorkflows, createWorkflow } = useWorkflowStore()
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')

  useEffect(() => {
    fetchWorkflows()
  }, [fetchWorkflows])

  const handleCreate = async () => {
    if (!newName.trim()) return
    await createWorkflow(newName, newDesc)
    setNewName('')
    setNewDesc('')
    setShowCreate(false)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">工作流</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showCreate ? '取消' : '+ 新建工作流'}
        </button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <input
            type="text"
            placeholder="工作流名称"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder="描述（可选）"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            创建
          </button>
        </div>
      )}

      {loading && <div className="text-center py-8 text-gray-500">加载中...</div>}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      {!loading && workflows.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          还没有工作流，点击上方按钮创建第一个工作流
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workflows.map((wf: WorkflowSummary) => (
          <Link
            key={wf.id}
            to={`/workflow/${wf.id}`}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
          >
            <h3 className="font-semibold text-lg text-gray-800 mb-2">{wf.name}</h3>
            {wf.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{wf.description}</p>
            )}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>0 步骤</span>
              <span>{formatDate(wf.updated_at)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}