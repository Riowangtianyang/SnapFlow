// Node Panel - Draggable node palette with icons
import { useCallback } from 'react';
import { Play, MousePointer, Keyboard, FileText, Clock, Eye, RefreshCw, HelpCircle, Globe, Camera, Upload, Flag } from 'lucide-react';

interface NodeType {
  type: string;
  label: string;
  icon: React.ElementType;
  colorClass: string;
  description: string;
}

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
  { type: 'start', label: 'Start', icon: Play, colorClass: 'bg-green-100 text-green-700', description: '入口点' },
  { type: 'click', label: 'Click', icon: MousePointer, colorClass: 'bg-blue-100 text-blue-700', description: '点击元素' },
  { type: 'type', label: 'Type', icon: Keyboard, colorClass: 'bg-gray-100 text-gray-700', description: '输入文本' },
  { type: 'extract', label: 'Extract', icon: FileText, colorClass: 'bg-purple-100 text-purple-700', description: '提取数据' },
  { type: 'wait', label: 'Wait', icon: Clock, colorClass: 'bg-amber-100 text-amber-700', description: '等待秒数' },
  { type: 'wait_for', label: 'Wait For', icon: Eye, colorClass: 'bg-cyan-100 text-cyan-700', description: '等待元素' },
  { type: 'loop', label: 'Loop', icon: RefreshCw, colorClass: 'bg-indigo-100 text-indigo-700', description: '遍历列表' },
  { type: 'condition', label: 'Condition', icon: HelpCircle, colorClass: 'bg-yellow-100 text-yellow-700', description: '条件分支' },
  { type: 'navigate', label: 'Navigate', icon: Globe, colorClass: 'bg-sky-100 text-sky-700', description: '跳转URL' },
  { type: 'screenshot', label: 'Screenshot', icon: Camera, colorClass: 'bg-pink-100 text-pink-700', description: '截图' },
  { type: 'download', label: 'Download', icon: Upload, colorClass: 'bg-amber-100 text-amber-700', description: '下载数据' },
  { type: 'end', label: 'End', icon: Flag, colorClass: 'bg-red-100 text-red-700', description: '结束' },
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

  const handleDragStart = useCallback((e: React.DragEvent, nodeType: string, label: string, description: string) => {
    e.dataTransfer.setData('application/node', JSON.stringify({
      type: nodeType,
      data: { label, description },
    }));
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  return (
    <aside className="w-56 bg-slate-800 border-r border-slate-700 p-4 overflow-y-auto">
      <h3 className="text-sm font-medium text-white mb-3">节点面板</h3>
      <p className="text-xs text-slate-400 mb-4">双击或拖拽到画布添加节点</p>

      <div className="space-y-1.5">
        {nodeTypes.map((node) => {
          const Icon = node.icon;
          return (
            <div
              key={node.type}
              draggable
              onDoubleClick={() => handleDoubleClick(node.type, node.label)}
              onDragStart={(e) => handleDragStart(e, node.type, node.label, node.description)}
              className="flex items-center gap-2.5 px-3 py-2 bg-slate-700 rounded-lg border border-slate-600 cursor-grab hover:border-primary hover:shadow-sm transition-all active:cursor-grabbing group"
            >
              <span className={`flex items-center justify-center w-6 h-6 rounded ${node.colorClass}`}>
                <Icon className="w-3.5 h-3.5" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white font-medium">{node.label}</div>
                <div className="text-xs text-slate-400 truncate">{node.description}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Node Legend */}
      <div className="mt-6 pt-4 border-t border-slate-700">
        <h4 className="text-xs font-medium text-slate-400 mb-2">快捷操作</h4>
        <div className="space-y-1 text-xs text-slate-400">
          <div>• 双击添加到画布中央</div>
          <div>• 拖拽节点到画布</div>
          <div>• 节点间连线创建流程</div>
        </div>
      </div>
    </aside>
  );
}
