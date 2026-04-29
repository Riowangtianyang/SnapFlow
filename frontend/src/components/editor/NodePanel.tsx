// Node Panel - Draggable node palette with icons
import { useCallback } from 'react';

interface NodeType {
  type: string;
  label: string;
  icon: string;
  description: string;
}

// QLT-3: FlowNode type for drag and drop
interface FlowNode {
  id: string;
  type: string;
  data: {
    label: string;
    description: string;
  };
  position: { x: number; y: number };
}

interface NodePanelProps {
  onAddNode?: (node: FlowNode) => void;
}

const nodeTypes: NodeType[] = [
  { type: 'start', label: 'Start', icon: '🚀', description: '入口点' },
  { type: 'click', label: 'Click', icon: '👆', description: '点击元素' },
  { type: 'type', label: 'Type', icon: '⌨️', description: '输入文本' },
  { type: 'extract', label: 'Extract', icon: '📥', description: '提取数据' },
  { type: 'wait', label: 'Wait', icon: '⏱️', description: '等待秒数' },
  { type: 'wait_for', label: 'Wait For', icon: '👀', description: '等待元素' },
  { type: 'loop', label: 'Loop', icon: '🔄', description: '遍历列表' },
  { type: 'condition', label: 'Condition', icon: '❓', description: '条件分支' },
  { type: 'navigate', label: 'Navigate', icon: '🌐', description: '跳转URL' },
  { type: 'screenshot', label: 'Screenshot', icon: '📷', description: '截图' },
  { type: 'output', label: 'Output', icon: '📤', description: '输出数据' },
  { type: 'end', label: 'End', icon: '🏁', description: '结束' },
];

export default function NodePanel({ onAddNode }: NodePanelProps) {
  const handleDoubleClick = useCallback((nodeType: string, label: string) => {
    if (!onAddNode) return;
    const newNode = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      data: { label, description: nodeTypes.find((n) => n.type === nodeType)?.description ?? '' },
      position: { x: 250, y: 250 },
    };
    onAddNode(newNode);
  }, [onAddNode]);

  const handleDragStart = useCallback((e: React.DragEvent, nodeType: string, label: string) => {
    e.dataTransfer.setData('application/node', JSON.stringify({
      type: nodeType,
      data: { label, description: nodeTypes.find((n) => n.type === nodeType)?.description },
    }));
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  return (
    <aside className="w-56 border-r border-gray-200 bg-gray-50 p-4 overflow-y-auto">
      <h3 className="text-sm font-medium text-gray-700 mb-3">节点面板</h3>
      <p className="text-xs text-gray-400 mb-4">双击或拖拽到画布添加节点</p>

      <div className="space-y-1.5">
        {nodeTypes.map((node) => (
          <div
            key={node.type}
            draggable
            onDoubleClick={() => handleDoubleClick(node.type, node.label)}
            onDragStart={(e) => handleDragStart(e, node.type, node.label)}
            className="flex items-center gap-2.5 px-3 py-2 bg-white rounded-md border border-gray-200 cursor-grab hover:border-purple-400 hover:shadow-sm transition-all active:cursor-grabbing group"
          >
            <span className="text-base w-6 text-center">{node.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-700 font-medium">{node.label}</div>
              <div className="text-xs text-gray-400 truncate">{node.description}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Node Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-xs font-medium text-gray-500 mb-2">快捷操作</h4>
        <div className="space-y-1 text-xs text-gray-400">
          <div>• 双击添加到画布中央</div>
          <div>• 拖拽节点到画布</div>
          <div>• 节点间连线创建流程</div>
        </div>
      </div>
    </aside>
  );
}

