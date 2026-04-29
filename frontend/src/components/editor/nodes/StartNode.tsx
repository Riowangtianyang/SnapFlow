// StartNode - Start node for React Flow

import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import type { CanvasNodeData } from '../../../stores/workflowCanvasStore'

const StartNode = memo(({ data, selected }: NodeProps<CanvasNodeData>) => {
  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 transition-all ${
        selected
          ? 'border-green-500 shadow-lg shadow-green-200'
          : 'border-green-400'
      } bg-green-50 min-w-[120px]`}
    >
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="font-medium text-green-800">开始</span>
      </div>
      {data.url && (
        <p className="text-xs text-green-600 mt-1 truncate max-w-[150px]">
          {data.url}
        </p>
      )}
      {data.label && data.label !== '开始' && (
        <p className="text-xs text-green-700 mt-1">{data.label}</p>
      )}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-green-500"
      />
    </div>
  )
})

StartNode.displayName = 'StartNode'

export default StartNode