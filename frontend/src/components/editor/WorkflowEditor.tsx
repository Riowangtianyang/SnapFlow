// Workflow Editor Component - React Flow based
import { useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Node as FlowNode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useWorkflowStore } from '../../stores/workflowStore';
import NodePanel from './NodePanel';
import { PropertiesPanel } from './PropertiesPanel';

export function WorkflowEditor() {
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const setSelectedNodeId = useWorkflowStore((s) => s.setSelectedNodeId);

  // QLT-3: Use proper FlowNode type instead of any
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        setEdges((eds) => addEdge({ ...params, id: `e-${params.source}-${params.target}` }, eds));
      }
    },
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: FlowNode) => {
    setSelectedNodeId(node.id);
  }, [setSelectedNodeId]);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div className="flex h-screen">
      <NodePanel onAddNode={(node) => setNodes((nds) => [...nds, node as FlowNode])} />
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
        >
          <Controls />
          <Background />
        </ReactFlow>
      </div>
      {selectedNode && (
        <PropertiesPanel
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          node={selectedNode as any}
          onUpdate={(id, data) => {
            setNodes((nds) =>
              nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...data } } : n))
            );
          }}
          onClose={() => setSelectedNodeId(null)}
        />
      )}
    </div>
  );
}

export default WorkflowEditor;