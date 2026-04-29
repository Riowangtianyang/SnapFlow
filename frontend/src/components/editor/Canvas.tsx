// Canvas - React Flow wrapper for workflow visualization

import { useCallback } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Connection,
  BackgroundVariant,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { useWorkflowCanvasStore, type CanvasNodeData } from '../../stores/workflowCanvasStore'
import StartNode from './nodes/StartNode'
import ActionNode from './nodes/ActionNode'

const nodeTypes = {
  start: StartNode,
  click: ActionNode,
  extract: ActionNode,
  download: ActionNode,
}

export default function Canvas() {
  const {
    nodes: storeNodes,
    edges: storeEdges,
    connectNodes,
    disconnectNodes,
    setSelectedNode,
  } = useWorkflowCanvasStore()

  const [nodes, , onNodesChange] = useNodesState(storeNodes as Node<CanvasNodeData>[])
  const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges)

  const onConnect = useCallback(
    (connection: Connection) => {
      connectNodes(connection)
      setEdges((eds) => addEdge(connection, eds))
    },
    [connectNodes, setEdges]
  )

  const onEdgesDelete = useCallback(
    (deletedEdges: Edge[]) => {
      deletedEdges.forEach((edge) => disconnectNodes(edge.id))
    },
    [disconnectNodes]
  )

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNode(node.id)
    },
    [setSelectedNode]
  )

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [setSelectedNode])

  return (
    <div className="w-full h-full bg-slate-900">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgesDelete={onEdgesDelete}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[16, 16]}
        defaultViewport={{ x: 100, y: 100, zoom: 1 }}
        className="bg-slate-900"
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} className="bg-slate-900" />
        <Controls className="!bg-slate-800 !border-slate-700" />
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
          className="!bg-slate-800"
        />
      </ReactFlow>
    </div>
  )
}