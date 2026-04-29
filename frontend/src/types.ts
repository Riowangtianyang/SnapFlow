// Type definitions placeholder
// Add shared types here

export interface WorkflowNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: Record<string, unknown>
}

export interface Workflow {
  id: string
  name: string
  nodes: WorkflowNode[]
  edges: Edge[]
}

export interface Edge {
  id: string
  source: string
  target: string
}