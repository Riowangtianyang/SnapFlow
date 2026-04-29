// ActionNode - Click/Extract/Download node for React Flow

import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import type { CanvasNodeData } from '../../../stores/workflowCanvasStore'

const typeConfig: Record<string, { icon: string; color: string; bgColor: string; borderColor: string }> = {
  click: {
    icon: '👆',
    color: 'text-blue-800',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-400',
  },
  extract: {
    icon: '📄',
    color: 'text-purple-800',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-400',
  },
  download: {
    icon: '📥',
    color: 'text-orange-800',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-400',
  },
}

const typeLabels: Record<string, string> = {
  click: '点击',
  extract: '提取',
  download: '下载',
}

const ActionNode = memo(({ data, selected }: NodeProps<CanvasNodeData>) => {
  const config = typeConfig[data.type] || typeConfig.click

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 transition-all min-w-[140px] ${
        selected
          ? `shadow-lg ${config.borderColor.replace('border', 'shadow-')}`
          : config.borderColor
      } ${config.bgColor}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{config.icon}</span>
        <span className={`font-medium ${config.color}`}>
          {typeLabels[data.type] || data.type}
        </span>
      </div>

      {data.intent && (
        <p className={`text-xs ${config.color} mt-2 line-clamp-2`}>
          {data.intent}
        </p>
      )}

      {data.url && (
        <p className="text-xs text-gray-500 mt-1 truncate max-w-[160px]">
          {data.url}
        </p>
      )}

      <div className="flex justify-between mt-2">
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-gray-400"
        />
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-gray-400"
        />
      </div>
    </div>
  )
})

ActionNode.displayName = 'ActionNode'

export default ActionNode