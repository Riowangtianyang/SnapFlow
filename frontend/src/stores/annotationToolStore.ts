// Annotation Tool Store - Manages annotation tool state and annotations

import { create } from 'zustand'
import type { Annotation } from '../types/annotation'
import type { Screenshot } from '../api/types'

interface AnnotationToolState {
  selectedTool: 'click' | 'extract' | 'download'
  selectedColor: string
  currentScreenshot: Screenshot | null
  annotations: Annotation[]
  history: Annotation[][]
  historyIndex: number

  setSelectedTool: (tool: 'click' | 'extract' | 'download') => void
  setSelectedColor: (color: string) => void
  setCurrentScreenshot: (screenshot: Screenshot | null) => void
  addAnnotation: (annotation: Annotation) => void
  removeAnnotation: (id: string) => void
  updateAnnotation: (id: string, updates: Partial<Annotation>) => void
  clearAnnotations: () => void
  undo: () => void
  redo: () => void
}

const TOOL_COLORS = {
  click: '#3B82F6',
  extract: '#22C55E',
  download: '#EF4444',
} as const

export const useAnnotationToolStore = create<AnnotationToolState>((set, get) => ({
  selectedTool: 'click',
  selectedColor: TOOL_COLORS.click,
  currentScreenshot: null,
  annotations: [],
  history: [[]],
  historyIndex: 0,

  setSelectedTool: (tool) => {
    set({ selectedTool: tool, selectedColor: TOOL_COLORS[tool] })
  },

  setSelectedColor: (color) => {
    set({ selectedColor: color })
  },

  setCurrentScreenshot: (screenshot) => {
    set({ currentScreenshot: screenshot })
  },

  addAnnotation: (annotation) => {
    const { annotations, history, historyIndex } = get()
    const newAnnotations = [...annotations, annotation]
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newAnnotations)
    set({
      annotations: newAnnotations,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    })
  },

  removeAnnotation: (id) => {
    const { annotations, history, historyIndex } = get()
    const newAnnotations = annotations.filter((a) => a.id !== id)
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newAnnotations)
    set({
      annotations: newAnnotations,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    })
  },

  updateAnnotation: (id, updates) => {
    const { annotations, history, historyIndex } = get()
    const newAnnotations = annotations.map((a) =>
      a.id === id ? { ...a, ...updates } : a
    )
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newAnnotations)
    set({
      annotations: newAnnotations,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    })
  },

  clearAnnotations: () => {
    const { history, historyIndex } = get()
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push([])
    set({
      annotations: [],
      history: newHistory,
      historyIndex: newHistory.length - 1,
    })
  },

  undo: () => {
    const { history, historyIndex } = get()
    if (historyIndex > 0) {
      set({
        annotations: history[historyIndex - 1],
        historyIndex: historyIndex - 1,
      })
    }
  },

  redo: () => {
    const { history, historyIndex } = get()
    if (historyIndex < history.length - 1) {
      set({
        annotations: history[historyIndex + 1],
        historyIndex: historyIndex + 1,
      })
    }
  },
}))