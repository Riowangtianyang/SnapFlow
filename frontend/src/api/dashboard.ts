// Dashboard API
import { get } from './client'

export interface DashboardStats {
  total_workflows: number
  running: number
  completed: number
  drafts: number
  monthly_executions: number
  success_rate: number
}

export interface ExecutionRecord {
  execution_id: string
  workflow_id: string
  workflow_name: string
  status: string
  started_at: string | null
  completed_at: string | null
  steps_completed: number
  steps_total: number
  error?: string | null
}

export interface ExecutionListResponse {
  executions: ExecutionRecord[]
  total: number
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return get<DashboardStats>('/api/executions/dashboard/stats')
}

export async function listExecutions(limit = 20, offset = 0): Promise<ExecutionListResponse> {
  return get<ExecutionListResponse>('/api/executions/list', { params: { limit, offset } })
}
