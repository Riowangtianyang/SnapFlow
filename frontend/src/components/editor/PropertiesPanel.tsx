// Properties Panel - Node configuration with comprehensive field support
import { useState, useEffect } from 'react';
import { Play, MousePointer, Keyboard, FileText, Clock, Eye, RefreshCw, HelpCircle, Globe, Camera, Upload, Flag } from 'lucide-react';

interface FlowNodeData {
  label?: string;
  description?: string;
  selector?: string;
  value?: string;
  field_name?: string;
  attribute?: string;
  seconds?: number;
  timeout?: number;
  variable_name?: string;
  operator?: string;
  url?: string;
  name?: string;
  full_page?: boolean;
  format?: string;
  filename?: string;
  status?: string;
  [key: string]: unknown;
}

interface FlowNode {
  id: string;
  type: string;
  data: FlowNodeData;
}

interface PropertiesPanelProps {
  node?: FlowNode;
  onUpdate?: (id: string, data: FlowNodeData) => void;
  onClose?: () => void;
}

interface NodeMeta {
  label: string;
  icon: React.ElementType;
  colorClass: string;
  fields: string[];
}

const nodeMeta: Record<string, NodeMeta> = {
  start: { label: 'Start', icon: Play, colorClass: 'bg-green-100 text-green-700', fields: [] },
  click: { label: 'Click', icon: MousePointer, colorClass: 'bg-blue-100 text-blue-700', fields: ['selector', 'description'] },
  type: { label: 'Type', icon: Keyboard, colorClass: 'bg-gray-100 text-gray-700', fields: ['selector', 'value', 'description'] },
  extract: { label: 'Extract', icon: FileText, colorClass: 'bg-purple-100 text-purple-700', fields: ['selector', 'field_name', 'attribute', 'description'] },
  wait: { label: 'Wait', icon: Clock, colorClass: 'bg-amber-100 text-amber-700', fields: ['seconds', 'description'] },
  wait_for: { label: 'Wait For', icon: Eye, colorClass: 'bg-cyan-100 text-cyan-700', fields: ['selector', 'timeout', 'description'] },
  loop: { label: 'Loop', icon: RefreshCw, colorClass: 'bg-indigo-100 text-indigo-700', fields: ['selector', 'variable_name', 'description'] },
  condition: { label: 'Condition', icon: HelpCircle, colorClass: 'bg-yellow-100 text-yellow-700', fields: ['selector', 'operator', 'value', 'description'] },
  navigate: { label: 'Navigate', icon: Globe, colorClass: 'bg-sky-100 text-sky-700', fields: ['url', 'description'] },
  screenshot: { label: 'Screenshot', icon: Camera, colorClass: 'bg-pink-100 text-pink-700', fields: ['name', 'full_page', 'description'] },
  download: { label: 'Download', icon: Upload, colorClass: 'bg-amber-100 text-amber-700', fields: ['format', 'filename', 'description'] },
  end: { label: 'End', icon: Flag, colorClass: 'bg-red-100 text-red-700', fields: ['status'] },
};

const inputClass = "w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"

export function PropertiesPanel({ node, onUpdate, onClose }: PropertiesPanelProps) {
  const [localData, setLocalData] = useState<FlowNodeData>({});

  if (!node) {
    return (
      <aside className="w-72 border-l border-slate-700 bg-slate-800 flex flex-col items-center justify-center p-8">
        <div className="text-slate-400 text-center">
          <p className="text-4xl mb-2 opacity-50">←</p>
          <p className="text-sm">从左侧选择节点</p>
        </div>
      </aside>
    );
  }

  const meta = nodeMeta[node.type] || { label: node.type, icon: Play, colorClass: 'bg-gray-100 text-gray-700', fields: [] };
  const Icon = meta.icon;

  useEffect(() => {
    setLocalData(node.data || {});
  }, [node.id, node.data]);

  const handleFieldChange = (field: string, value: unknown) => {
    if (!node) return;
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    onUpdate?.(node.id, newData);
  };

  const getFieldValue = (field: string): string => {
    const val = localData[field];
    return typeof val === 'string' ? val : '';
  };

  const getNumberValue = (field: string): number => {
    const val = localData[field];
    return typeof val === 'number' ? val : 0;
  };

  const getBoolValue = (field: string): boolean => {
    return Boolean(localData[field]);
  };

  return (
    <aside className="w-72 border-l border-slate-700 bg-slate-800 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <span className={`flex items-center justify-center w-8 h-8 rounded-lg ${meta.colorClass}`}>
            <Icon className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-medium text-white">{meta.label} 配置</h3>
            <p className="text-xs text-slate-400">节点属性设置</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Common Fields */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">标签</label>
          <input
            type="text"
            value={localData.label || ''}
            onChange={(e) => handleFieldChange('label', e.target.value)}
            placeholder="节点显示名称"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">描述</label>
          <input
            type="text"
            value={localData.description || ''}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder="节点功能描述"
            className={inputClass}
          />
        </div>

        {/* Type-specific Fields */}
        {(node.type === 'click' || node.type === 'type' || node.type === 'extract' || node.type === 'wait_for' || node.type === 'condition') && (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">选择器</label>
            <input
              type="text"
              value={getFieldValue('selector')}
              onChange={(e) => handleFieldChange('selector', e.target.value)}
              placeholder="CSS选择器或xpath"
              className={inputClass}
            />
            <p className="text-xs text-slate-500 mt-1">支持 CSS 选择器或 XPath</p>
          </div>
        )}

        {node.type === 'type' && (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">输入值</label>
            <input
              type="text"
              value={getFieldValue('value')}
              onChange={(e) => handleFieldChange('value', e.target.value)}
              placeholder="要输入的文本"
              className={inputClass}
            />
          </div>
        )}

        {node.type === 'extract' && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">字段名</label>
              <input
                type="text"
                value={getFieldValue('field_name')}
                onChange={(e) => handleFieldChange('field_name', e.target.value)}
                placeholder="如: title, price"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">属性</label>
              <input
                type="text"
                value={getFieldValue('attribute')}
                onChange={(e) => handleFieldChange('attribute', e.target.value)}
                placeholder="如: href, src (留空获取文本)"
                className={inputClass}
              />
            </div>
          </>
        )}

        {node.type === 'wait' && (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">等待秒数</label>
            <input
              type="number"
              value={getNumberValue('seconds')}
              onChange={(e) => handleFieldChange('seconds', parseInt(e.target.value) || 0)}
              min="0"
              placeholder="0"
              className={inputClass}
            />
          </div>
        )}

        {node.type === 'wait_for' && (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">超时(秒)</label>
            <input
              type="number"
              value={getNumberValue('timeout')}
              onChange={(e) => handleFieldChange('timeout', parseInt(e.target.value) || 30)}
              min="1"
              placeholder="30"
              className={inputClass}
            />
          </div>
        )}

        {node.type === 'loop' && (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">循环变量名</label>
            <input
              type="text"
              value={getFieldValue('variable_name')}
              onChange={(e) => handleFieldChange('variable_name', e.target.value)}
              placeholder="如: item"
              className={inputClass}
            />
          </div>
        )}

        {node.type === 'condition' && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">比较操作符</label>
              <select
                value={getFieldValue('operator')}
                onChange={(e) => handleFieldChange('operator', e.target.value)}
                className={inputClass}
              >
                <option value="">选择操作符</option>
                <option value="equals">等于</option>
                <option value="not_equals">不等于</option>
                <option value="contains">包含</option>
                <option value="not_contains">不包含</option>
                <option value="exists">存在</option>
                <option value="not_exists">不存在</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">比较值</label>
              <input
                type="text"
                value={getFieldValue('value')}
                onChange={(e) => handleFieldChange('value', e.target.value)}
                placeholder="比较的值"
                className={inputClass}
              />
            </div>
          </>
        )}

        {node.type === 'navigate' && (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">URL</label>
            <input
              type="url"
              value={getFieldValue('url')}
              onChange={(e) => handleFieldChange('url', e.target.value)}
              placeholder="https://example.com"
              className={inputClass}
            />
          </div>
        )}

        {node.type === 'screenshot' && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">截图名称</label>
              <input
                type="text"
                value={getFieldValue('name')}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                placeholder="截图名称"
                className={inputClass}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="fullPage"
                checked={getBoolValue('full_page')}
                onChange={(e) => handleFieldChange('full_page', e.target.checked)}
                className="w-4 h-4 text-primary rounded border-slate-600 bg-slate-700 focus:ring-primary"
              />
              <label htmlFor="fullPage" className="text-sm text-slate-300">整页截图</label>
            </div>
          </>
        )}

        {node.type === 'download' && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">输出格式</label>
              <select
                value={getFieldValue('format') || 'json'}
                onChange={(e) => handleFieldChange('format', e.target.value)}
                className={inputClass}
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="markdown">Markdown</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">文件名</label>
              <input
                type="text"
                value={getFieldValue('filename')}
                onChange={(e) => handleFieldChange('filename', e.target.value)}
                placeholder="output.json"
                className={inputClass}
              />
            </div>
          </>
        )}

        {node.type === 'end' && (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">结束状态</label>
            <select
              value={getFieldValue('status') || 'success'}
              onChange={(e) => handleFieldChange('status', e.target.value)}
              className={inputClass}
            >
              <option value="success">成功</option>
              <option value="error">错误</option>
            </select>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 bg-slate-800/50">
        <div className="text-xs text-slate-500">
          节点ID: <span className="font-mono text-slate-400">{String(node.id)}</span>
        </div>
      </div>
    </aside>
  );
}

export default PropertiesPanel;
