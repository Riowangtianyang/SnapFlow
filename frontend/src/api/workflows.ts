// Workflow API endpoints

import { get, post, put, del } from './client'
import type {
  ListWorkflowsResponse,
  Workflow,
  WorkflowSummary,
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
  WorkflowExport,
  WorkflowImport,
} from './types'

export async function listWorkflows(): Promise<ListWorkflowsResponse> {
  return get<ListWorkflowsResponse>('/workflows')
}

export async function getWorkflow(id: string): Promise<Workflow> {
  return get<Workflow>(`/workflows/${id}`)
}

export async function createWorkflow(data: CreateWorkflowRequest): Promise<WorkflowSummary> {
  return post<WorkflowSummary>('/workflows', data)
}

export async function updateWorkflow(id: string, data: UpdateWorkflowRequest): Promise<Workflow> {
  return put<Workflow>(`/workflows/${id}`, data)
}

export async function deleteWorkflow(id: string): Promise<void> {
  return del<void>(`/workflows/${id}`)
}

export async function exportWorkflow(id: string): Promise<WorkflowExport> {
  return get<WorkflowExport>(`/workflows/${id}/export`)
}

export async function importWorkflow(id: string, data: WorkflowImport): Promise<Workflow> {
  return post<Workflow>(`/workflows/${id}/import`, data)
}

export interface RunWorkflowResponse {
  execution_id: string
  workflow_id: string
  status: string
  started_at: string | null
  completed_at: string | null
  step_results: Array<{
    step_id: string
    status: string
    output: Record<string, unknown> | null
    error: string | null
  }>
}

export async function runWorkflow(workflowId: string): Promise<RunWorkflowResponse> {
  return post<RunWorkflowResponse>(`/executions/run/${workflowId}`)
}
