// StepIntentCard - Single step intent card

import type { Step } from '../../api/types'

interface StepIntentCardProps {
  step: Step
  index: number
  onIntentChange: (stepId: string, newIntent: string) => void
}

const typeLabels: Record<string, string> = {
  start: '开始',
  click: '点击',
  extract: '提取',
  download: '下载',
}

const typeColors: Record<string, string> = {
  start: 'bg-green-100 border-green-300',
  click: 'bg-blue-100 border-blue-300',
  extract: 'bg-purple-100 border-purple-300',
  download: 'bg-orange-100 border-orange-300',
}

export default function StepIntentCard({ step, index, onIntentChange }: StepIntentCardProps) {
  const handleIntentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onIntentChange(step.id, e.target.value)
  }

  return (
    <div className={`border rounded-lg p-4 ${typeColors[step.type] || 'bg-gray-100 border-gray-300'}`}>
      <div className="flex items-center gap-3 mb-3">
        {/* Screenshot thumbnail placeholder */}
        <div className="w-16 h-12 bg-gray-200 border border-gray-300 rounded flex items-center justify-center">
          {step.url ? (
            <span className="text-xs text-gray-500 truncate px-1">{index}</span>
          ) : (
            <span className="text-xs text-gray-400">无截图</span>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white border">
              步骤 {index}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white border">
              {typeLabels[step.type] || step.type}
            </span>
          </div>
          {step.url && (
            <p className="text-xs text-gray-500 mt-1 truncate">{step.url}</p>
          )}
        </div>
      </div>

      {/* Editable intent field */}
      <div>
        <label className="text-xs text-gray-600 mb-1 block">意图描述</label>
        <textarea
          value={step.intent}
          onChange={handleIntentChange}
          className="w-full p-2 text-sm border border-white rounded-md bg-white/80 resize-none"
          rows={2}
          placeholder="描述此步骤的意图..."
        />
      </div>
    </div>
  )
}