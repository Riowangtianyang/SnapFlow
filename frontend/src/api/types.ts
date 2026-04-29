// API Types based on docs/api-contracts.md

export type WorkflowStatus = 'draft' | 'running' | 'completed' | 'failed'

export type StepType = 'start' | 'click' | 'extract' | 'download'

// Annotation shape types (for canvas drawing)
export type AnnotationShapeType = 'circle' | 'box' | 'arrow'

// Annotation type for step/click actions
export type AnnotationType = 'click' | 'extract' | 'download'

export interface Annotation {
  id: string
  type: AnnotationType
  // Shape properties for canvas rendering
  shape_type?: AnnotationShapeType
  x: number
  y: number
  // Circle properties
  radius?: number
  // Box properties
  width?: number
  height?: number
  // Arrow properties
  to_x?: number
  to_y?: number
  // Common properties
  label?: string
  params: Record<string, unknown>
  // Legacy/optional properties
  target_selector?: string
}

export interface Step {
  id: string
  screenshot_id?: string
  url?: string
  type: StepType
  intent: string
  params: Record<string, unknown>
  annotations?: Annotation[]
}

export interface Workflow {
  id: string
  name: string
  description: string
  status: WorkflowStatus
  steps: Step[]
  total_intent: string
  created_at: string
  updated_at: string
}

export interface WorkflowSummary {
  id: string
  name: string
  description: string
  status: WorkflowStatus
  created_at: string
  updated_at: string
}

export interface Screenshot {
  id: string
  url: string
  path: string
  width: number
  height: number
  workflow_id: string | null
  step_order: number | null
  annotations: Annotation[]
  created_at?: string
}

export interface Question {
  id: string
  q: string
  options: string[]
  answer: string | null
}

export interface IntentGenerateRequest {
  screenshots: Array<{
    id: string
    url: string
    annotations: Omit<Annotation, 'id'>[]
  }>
}

export interface IntentGenerateResponse {
  steps: Step[]
  total_intent: string
  questions: Question[]
}

export interface IntentRefineRequest {
  workflow_id: string
  question_id: string
  answer: string
}

export interface IntentRefineResponse {
  updated_steps: Step[]
  updated_total_intent: string
  consumed_questions: string[]
}

export interface WorkflowExport {
  version: '1.0'
  id: string
  name: string
  steps: Step[]
  total_intent: string
}

export interface WorkflowImport {
  version: '1.0'
  name: string
  steps: Step[]
  total_intent: string
}

export interface ApiError {
  detail: string
  code: string
}

// Workflow API types
export interface ListWorkflowsResponse {
  workflows: WorkflowSummary[]
}

export interface CreateWorkflowRequest {
  name: string
  description: string
}

export interface UpdateWorkflowRequest {
  name?: string
  description?: string
  steps?: Step[]
  total_intent?: string
}

// Screenshot API types
export interface UploadScreenshotResponse {
  id: string
  url: string
  path: string
  width: number
  height: number
  workflow_id: string | null
  step_order: number | null
  annotations: Annotation[]
}

export interface UpdateAnnotationsRequest {
  annotations: Annotation[]
}
