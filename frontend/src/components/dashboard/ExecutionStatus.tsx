// Execution Status Component - Shows current execution progress
import { useEffect, useState } from 'react';
import { useWorkflowStore } from '../../stores/workflowStore';

type NodeStatus = 'pending' | 'running' | 'succeeded' | 'failed';

interface NodeExecutionInfo {
  nodeId: string;
  status: NodeStatus;
  startTime?: number;
  endTime?: number;
  error?: string;
}

interface ExecutionStatusProps {
  execution?: {
    execution_id?: string;
    status?: string;
    started_at?: string;
    completed_at?: string;
    result?: { data?: unknown[]; output_format?: string };
  } | null;
}

export function ExecutionStatus({ execution }: ExecutionStatusProps) {
  const nodes = useWorkflowStore((s) => s.nodes);
  const [nodeStatuses, setNodeStatuses] = useState<Map<string, NodeExecutionInfo>>(new Map());
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);

  // Simulate execution progress based on execution status
  useEffect(() => {
    if (!execution || execution.status !== 'running') {
      setNodeStatuses(new Map());
      setCurrentNodeId(null);
      return;
    }

    // Initialize node statuses
    const statuses = new Map<string, NodeExecutionInfo>();
    nodes.forEach((node, index) => {
      if (index === 0) {
        statuses.set(node.id, { nodeId: node.id, status: 'succeeded' });
      } else if (index === 1) {
        statuses.set(node.id, { nodeId: node.id, status: 'running', startTime: Date.now() });
        setCurrentNodeId(node.id);
      } else {
        statuses.set(node.id, { nodeId: node.id, status: 'pending', startTime: undefined, endTime: undefined, error: undefined });
      }
    });
    setNodeStatuses(statuses);
  }, [execution, nodes]);

  const getStatusColor = (status: NodeStatus): string => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-500';
      case 'running': return 'bg-yellow-100 text-yellow-700';
      case 'succeeded': return 'bg-green-100 text-green-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  const getStatusIcon = (status: NodeStatus): string => {
    switch (status) {
      case 'pending': return '⏳';
      case 'running': return '🔄';
      case 'succeeded': return '✓';
      case 'failed': return '✗';
      default: return '○';
    }
  };

  const formatDuration = (start?: number, end?: number): string => {
    if (!start) return '-';
    const duration = (end || Date.now()) - start;
    if (duration < 1000) return `${duration}ms`;
    if (duration < 60000) return `${(duration / 1000).toFixed(1)}s`;
    return `${Math.floor(duration / 60000)}m ${Math.floor((duration % 60000) / 1000)}s`;
  };

  if (!execution) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <div className="text-3xl mb-2">▶️</div>
        <div className="text-sm text-gray-500">暂无执行任务</div>
        <div className="text-xs text-gray-400 mt-1">运行工作流以查看执行状态</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${
              execution.status === 'running' ? 'bg-green-500 animate-pulse' :
              execution.status === 'completed' ? 'bg-blue-500' :
              execution.status === 'error' ? 'bg-red-500' : 'bg-gray-400'
            }`} />
            <span className="text-sm font-medium text-gray-700">
              {execution.status === 'running' && '执行中'}
              {execution.status === 'completed' && '已完成'}
              {execution.status === 'stopped' && '已停止'}
              {execution.status === 'error' && '执行错误'}
            </span>
          </div>
          <span className="text-xs text-gray-400">
            ID: {execution.execution_id?.slice(0, 8) ?? 'N/A'}...
          </span>
        </div>

        {/* Time info */}
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
          <span>开始: {execution.started_at ? new Date(execution.started_at).toLocaleTimeString() : '-'}</span>
          {execution.completed_at && execution.started_at && (
            <span>耗时: {formatDuration(new Date(execution.started_at).getTime(), new Date(execution.completed_at).getTime())}</span>
          )}
        </div>
      </div>

      {/* Node Progress */}
      <div className="p-4">
        <h4 className="text-xs font-medium text-gray-500 mb-3">节点进度</h4>
        <div className="space-y-2">
          {nodes.map((node, index) => {
            const info = nodeStatuses.get(node.id) || { status: 'pending' as NodeStatus, startTime: undefined, endTime: undefined, error: undefined };
            const isCurrent = currentNodeId === node.id;

            return (
              <div
                key={node.id}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-all ${
                  isCurrent ? 'border-purple-300 bg-purple-50' : 'border-gray-100 bg-gray-50'
                }`}
              >
                {/* Status Icon */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${getStatusColor(info.status)}`}>
                  {info.status === 'running' ? (
                    <span className="animate-spin">🔄</span>
                  ) : (
                    getStatusIcon(info.status)
                  )}
                </div>

                {/* Node Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">{String(node.data?.label ?? node.type)}</span>
                    <span className="text-xs text-gray-400">{node.type}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {info.status === 'running' && '执行中...'}
                    {info.status === 'succeeded' && `完成 (${formatDuration(info.startTime, info.endTime)})`}
                    {info.status === 'failed' && (info.error || '失败')}
                    {info.status === 'pending' && '等待中'}
                  </div>
                </div>

                {/* Step Number */}
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                  {index + 1}
                </div>
              </div>
            );
          })}
        </div>

        {/* No nodes message */}
        {nodes.length === 0 && (
          <div className="text-center py-4 text-sm text-gray-400">
            画布上没有节点
          </div>
        )}
      </div>

      {/* Execution Summary */}
      {execution.result && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">提取数据: {Array.isArray(execution.result.data) ? execution.result.data.length : 0} 条</span>
            <span className="text-gray-500">格式: {execution.result.output_format}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExecutionStatus;