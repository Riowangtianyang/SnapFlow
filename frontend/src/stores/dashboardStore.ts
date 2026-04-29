// Dashboard Store - State management for dashboard
import { create } from 'zustand'
import * as dashboardApi from '../api/dashboard'
import type { DashboardStats, ExecutionRecord } from '../api/dashboard'

interface DashboardState {
  stats: DashboardStats | null
  records: ExecutionRecord[]
  total: number
  loading: boolean
  error: string | null

  fetchStats: () => Promise<void>
  fetchRecords: (limit?: number, offset?: number) => Promise<void>
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: null,
  records: [],
  total: 0,
  loading: false,
  error: null,

  fetchStats: async () => {
    set({ loading: true, error: null })
    try {
      const stats = await dashboardApi.getDashboardStats()
      set({ stats, loading: false })
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to fetch stats'
      set({ error, loading: false })
    }
  },

  fetchRecords: async (limit = 20, offset = 0) => {
    set({ loading: true, error: null })
    try {
      const response = await dashboardApi.listExecutions(limit, offset)
      set({ records: response.executions, total: response.total, loading: false })
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to fetch records'
      set({ error, loading: false })
    }
  },
}))
