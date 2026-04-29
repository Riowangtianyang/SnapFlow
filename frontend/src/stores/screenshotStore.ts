// Screenshot Store - State management for screenshots

import { create } from 'zustand'
import type { Screenshot, Annotation } from '../api/types'
import * as screenshotsApi from '../api/screenshots'

interface ScreenshotState {
  screenshots: Screenshot[]
  currentScreenshot: Screenshot | null
  annotations: Annotation[]
  loading: boolean
  error: string | null

  uploadScreenshot: (file: File, workflowId?: string, stepOrder?: number) => Promise<Screenshot>
  fetchScreenshot: (id: string) => Promise<Screenshot>
  updateAnnotations: (id: string, annotations: Annotation[]) => Promise<Screenshot>
  setCurrentScreenshot: (screenshot: Screenshot | null) => void
  setAnnotations: (annotations: Annotation[]) => void
  clearError: () => void
}

export const useScreenshotStore = create<ScreenshotState>((set) => ({
  screenshots: [],
  currentScreenshot: null,
  annotations: [],
  loading: false,
  error: null,

  uploadScreenshot: async (file: File, workflowId?: string, stepOrder?: number) => {
    set({ loading: true, error: null })
    try {
      const screenshot = await screenshotsApi.uploadScreenshot({
        file,
        workflow_id: workflowId,
        step_order: stepOrder,
      })
      set((state) => ({
        screenshots: [...state.screenshots, screenshot],
        loading: false,
      }))
      return screenshot
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to upload screenshot'
      set({ error, loading: false })
      throw err
    }
  },

  fetchScreenshot: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const screenshot = await screenshotsApi.getScreenshot(id)
      set({
        currentScreenshot: screenshot,
        annotations: screenshot.annotations || [],
        loading: false,
      })
      return screenshot
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to fetch screenshot'
      set({ error, loading: false })
      throw err
    }
  },

  updateAnnotations: async (id: string, annotations: Annotation[]) => {
    set({ loading: true, error: null })
    try {
      const screenshot = await screenshotsApi.updateAnnotations(id, annotations)
      set((state) => ({
        screenshots: state.screenshots.map((s) => (s.id === id ? screenshot : s)),
        currentScreenshot: state.currentScreenshot?.id === id ? screenshot : state.currentScreenshot,
        annotations: screenshot.annotations || [],
        loading: false,
      }))
      return screenshot
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to update annotations'
      set({ error, loading: false })
      throw err
    }
  },

  setCurrentScreenshot: (screenshot: Screenshot | null) => {
    set({ currentScreenshot: screenshot })
  },

  setAnnotations: (annotations: Annotation[]) => {
    set({ annotations })
  },

  clearError: () => {
    set({ error: null })
  },
}))
