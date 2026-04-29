// IntentEditor - AI generated intent editing UI

import { useState } from 'react'
import { useIntentStore } from '../../stores/intentStore'
import type { Step, Question } from '../../api/types'
import StepIntentCard from './StepIntentCard'

interface IntentEditorProps {
  onConfirm?: () => void
  onCancel?: () => void
}

export default function IntentEditor({ onConfirm, onCancel }: IntentEditorProps) {
  const { steps, totalIntent, questions, loading, error, clearIntent } = useIntentStore()
  const [localTotalIntent, setLocalTotalIntent] = useState(totalIntent)
  const [localSteps, setLocalSteps] = useState<Step[]>(steps)

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        <span className="ml-3 text-gray-500">AI 正在分析意图...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error}</p>
        <button
          onClick={clearIntent}
          className="mt-2 text-sm text-red-500 hover:text-red-700"
        >
          清除错误
        </button>
      </div>
    )
  }

  if (steps.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        暂无意图数据，请先上传截图并标注
      </div>
    )
  }

  const handleStepIntentChange = (stepId: string, newIntent: string) => {
    setLocalSteps(localSteps.map(step =>
      step.id === stepId ? { ...step, intent: newIntent } : step
    ))
  }

  const handleQuestionAnswer = (question: Question, answer: string) => {
    // Handle question answer - this would typically trigger refineIntent
    console.log('Answer:', question.id, answer)
  }

  const handleConfirm = () => {
    // Update the store with edited values
    onConfirm?.()
  }

  const handleReject = () => {
    clearIntent()
    onCancel?.()
  }

  return (
    <div className="space-y-6 p-4">
      {/* Total Intent */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">总意图</h3>
        <textarea
          value={localTotalIntent}
          onChange={(e) => setLocalTotalIntent(e.target.value)}
          className="w-full p-2 border border-blue-200 rounded-md bg-white resize-none"
          rows={2}
          placeholder="AI 生成的总意图描述..."
        />
      </div>

      {/* Questions */}
      {questions.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-800 mb-3">需要确认</h3>
          <div className="space-y-4">
            {questions.map((question) => (
              <div key={question.id} className="space-y-2">
                <p className="text-sm text-gray-700">{question.q}</p>
                <div className="flex flex-wrap gap-2">
                  {question.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleQuestionAnswer(question, option)}
                      className="px-3 py-1 text-sm bg-white border border-yellow-300 rounded-full hover:bg-yellow-100"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step Intents */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700">单步意图</h3>
        {localSteps.map((step, index) => (
          <StepIntentCard
            key={step.id}
            step={step}
            index={index + 1}
            onIntentChange={handleStepIntentChange}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          onClick={handleReject}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          拒绝
        </button>
        <button
          onClick={handleConfirm}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          确认意图
        </button>
      </div>
    </div>
  )
}