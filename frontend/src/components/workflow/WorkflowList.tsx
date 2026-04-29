import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useWorkflowStore } from '../../stores/workflowStore'
import { useLanguageStore } from '../../stores/languageStore'
import { ErrorBoundary } from '../common/ErrorBoundary'
import type { WorkflowSummary } from '../../api/types'
import { ApiException } from '../../api/client'

function WorkflowListContent() {
  const { workflows, loading, error, fetchWorkflows, createWorkflow } = useWorkflowStore()
  const { t } = useLanguageStore()
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getErrorMessage = (err: unknown) => {
    if (err instanceof ApiException) {
      return err.detail
    }
    if (err instanceof Error) {
      return err.message
    }
    return String(err)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t('workflow.list')}</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showCreate ? t('common.cancel') : `+ ${t('workflow.create')}`}
        </button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <input
            type="text"
            placeholder={t('workflow.name')}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder={t('workflow.description')}
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
          {createError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-3">
              {createError}
            </div>
          )}
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t('workflow.create')}
          </button>
        </div>
      )}

      {loading && (
        <div className="text-center py-8 text-gray-500">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-2" />
          <p>{t('common.loading')}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-4">
          <p className="font-medium">{t('common.error')}</p>
          <p className="text-sm mt-1">{getErrorMessage(error)}</p>
        </div>
      )}

      {!loading && workflows.length === 0 && !error && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-4">📋</p>
          <p>{t('results.noData')}</p>
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
              <span>0 {t('workflow.steps')}</span>
              <span>{formatDate(wf.updated_at)}</span>
            </div>
          </Link>
        ))}
      </div>
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
