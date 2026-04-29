// Workflow Canvas Store - React Flow state management

import { create } from 'zustand'
import type { Node, Edge, Connection } from 'reactflow'

export type CanvasNodeType = 'start' | 'click' | 'extract' | 'download'

export interface CanvasNodeData {
  label: string
  type: CanvasNodeType
  intent?: string
  url?: string
  params?: Record<string, unknown>
  stepId?: string
}

interface WorkflowCanvasState {
  nodes: Node<CanvasNodeData>[]
  edges: Edge[]
  selectedNodeId: string | null

  // Actions
  setNodes: (nodes: Node<CanvasNodeData>[]) => void
  setEdges: (edges: Edge[]) => void
  addNode: (node: Node<CanvasNodeData>) => void
  removeNode: (nodeId: string) => void
  updateNode: (nodeId: string, data: Partial<CanvasNodeData>) => void
  connectNodes: (connection: Connection) => void
  disconnectNodes: (edgeId: string) => void
  setSelectedNode: (nodeId: string | null) => void
  clearCanvas: () => void

  // Helpers
  getNode: (nodeId: string) => Node<CanvasNodeData> | undefined
  getOutgoingEdges: (nodeId: string) => Edge[]
  getIncomingEdges: (nodeId: string) => Edge[]
}

export const useWorkflowCanvasStore = create<WorkflowCanvasState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,

  setNodes: (nodes) => set({ nodes }),

  setEdges: (edges) => set({ edges }),

  addNode: (node) => set((state) => ({
    nodes: [...state.nodes, node]
  })),

  removeNode: (nodeId) => set((state) => ({
    nodes: state.nodes.filter((n) => n.id !== nodeId),
    edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
  })),

  updateNode: (nodeId, data) => set((state) => ({
    nodes: state.nodes.map((n) =>
      n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
    ),
  })),

  connectNodes: (connection) => {
    const { source, target, sourceHandle, targetHandle } = connection
    if (!source || !target) return

    const newEdge: Edge = {
      id: `e-${source}-${target}-${Date.now()}`,
      source,
      target,
      sourceHandle,
      targetHandle,
    }

    set((state) => ({
      edges: [...state.edges, newEdge],
    }))
  },

  disconnectNodes: (edgeId) => set((state) => ({
    edges: state.edges.filter((e) => e.id !== edgeId),
  })),

  setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),

  clearCanvas: () => set({ nodes: [], edges: [], selectedNodeId: null }),

  getNode: (nodeId) => get().nodes.find((n) => n.id === nodeId),

  getOutgoingEdges: (nodeId) => get().edges.filter((e) => e.source === nodeId),

  getIncomingEdges: (nodeId) => get().edges.filter((e) => e.target === nodeId),
}))