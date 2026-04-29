// Workflow Store - State management for workflows

import { create } from 'zustand'
import type { Workflow, WorkflowSummary, Step, WorkflowExport, WorkflowImport } from '../api/types'
import * as workflowsApi from '../api/workflows'

interface WorkflowState {
  workflows: WorkflowSummary[]
  currentWorkflow: Workflow | null
  loading: boolean
  error: string | null
  selectedNodeId: string | null
  nodes: FlowNode[]
  edges: Edge[]

  fetchWorkflows: () => Promise<void>
  createWorkflow: (name: string, description: string) => Promise<WorkflowSummary>
  updateWorkflow: (id: string, data: Partial<{ name: string; description: string; steps: Step[]; total_intent: string }>) => Promise<Workflow>
  deleteWorkflow: (id: string) => Promise<void>
  setCurrentWorkflow: (workflow: Workflow | null) => void
  exportWorkflow: (id: string) => Promise<WorkflowExport>
  importWorkflow: (id: string, data: WorkflowImport) => Promise<Workflow>
  setSelectedNodeId: (id: string | null) => void
  setNodes: (nodes: FlowNode[]) => void
  setEdges: (edges: Edge[]) => void
}

interface FlowNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: Record<string, unknown>
}

interface Edge {
  id: string
  source: string
  target: string
}

export const useWorkflowStore = create<WorkflowState>((set) => ({
  workflows: [],
  currentWorkflow: null,
  loading: false,
  error: null,
  selectedNodeId: null,
  nodes: [],
  edges: [],

  fetchWorkflows: async () => {
    set({ loading: true, error: null })
    try {
      const response = await workflowsApi.listWorkflows()
      set({ workflows: response.workflows, loading: false })
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to fetch workflows'
      set({ error, loading: false })
    }
  },

  createWorkflow: async (name: string, description: string) => {
    set({ loading: true, error: null })
    try {
      const workflow = await workflowsApi.createWorkflow({ name, description })
      set((state) => ({
        workflows: [...state.workflows, workflow],
        loading: false,
      }))
      return workflow
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to create workflow'
      set({ error, loading: false })
      throw err
    }
  },

  updateWorkflow: async (id: string, data) => {
    set({ loading: true, error: null })
    try {
      const workflow = await workflowsApi.updateWorkflow(id, data)
      set((state) => ({
        workflows: state.workflows.map((w) => (w.id === id ? workflow : w)),
        currentWorkflow: state.currentWorkflow?.id === id ? workflow : state.currentWorkflow,
        loading: false,
      }))
      return workflow
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to update workflow'
      set({ error, loading: false })
      throw err
    }
  },

  deleteWorkflow: async (id: string) => {
    set({ loading: true, error: null })
    try {
      await workflowsApi.deleteWorkflow(id)
      set((state) => ({
        workflows: state.workflows.filter((w) => w.id !== id),
        currentWorkflow: state.currentWorkflow?.id === id ? null : state.currentWorkflow,
        loading: false,
      }))
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to delete workflow'
      set({ error, loading: false })
      throw err
    }
  },

  setCurrentWorkflow: (workflow: Workflow | null) => {
    set({ currentWorkflow: workflow })
  },

  exportWorkflow: async (id: string) => {
    return workflowsApi.exportWorkflow(id)
  },

  importWorkflow: async (id: string, data: WorkflowImport) => {
    return workflowsApi.importWorkflow(id, data)
  },

  setSelectedNodeId: (id: string | null) => {
    set({ selectedNodeId: id })
  },

  setNodes: (nodes: FlowNode[]) => {
    set({ nodes })
  },

  setEdges: (edges: Edge[]) => {
    set({ edges })
  },
}))
