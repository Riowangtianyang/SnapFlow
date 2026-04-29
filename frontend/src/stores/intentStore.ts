// Intent Store - State management for workflow intent generation

import { create } from 'zustand'
import type { Step, Question, IntentGenerateRequest, IntentRefineResponse } from '../api/types'
import * as intentsApi from '../api/intents'

interface IntentState {
  steps: Step[]
  totalIntent: string
  questions: Question[]
  loading: boolean
  error: string | null

  generateIntent: (screenshots: IntentGenerateRequest['screenshots']) => Promise<void>
  refineIntent: (workflowId: string, questionId: string, answer: string) => Promise<IntentRefineResponse>
  clearIntent: () => void
  clearError: () => void
}

export const useIntentStore = create<IntentState>((set) => ({
  steps: [],
  totalIntent: '',
  questions: [],
  loading: false,
  error: null,

  generateIntent: async (screenshots) => {
    set({ loading: true, error: null })
    try {
      const data: IntentGenerateRequest = { screenshots }
      const response = await intentsApi.generateIntent(data)
      set({
        steps: response.steps,
        totalIntent: response.total_intent,
        questions: response.questions,
        loading: false,
      })
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to generate intent'
      set({ error, loading: false })
      throw err
    }
  },

  refineIntent: async (workflowId: string, questionId: string, answer: string) => {
    set({ loading: true, error: null })
    try {
      const response = await intentsApi.refineIntent({
        workflow_id: workflowId,
        question_id: questionId,
        answer,
      })
      set((state) => ({
        steps: response.updated_steps,
        totalIntent: response.updated_total_intent,
        questions: state.questions.filter(
          (q) => !response.consumed_questions.includes(q.id)
        ),
        loading: false,
      }))
      return response
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to refine intent'
      set({ error, loading: false })
      throw err
    }
  },

  clearIntent: () => {
    set({ steps: [], totalIntent: '', questions: [] })
  },

  clearError: () => {
    set({ error: null })
  },
}))
