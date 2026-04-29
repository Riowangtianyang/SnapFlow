// Annotation Canvas Component - Screenshot annotation with drawing tools

import { useState, useRef, useCallback, useEffect } from 'react'
import { useAnnotationToolStore } from '../../stores/annotationToolStore'
import type { Annotation as AnnotationType } from '../../types/annotation'

interface AnnotationCanvasProps {
  width?: number
  height?: number
}

const TOOL_COLORS = {
  click: '#3B82F6',
  extract: '#22C55E',
  download: '#EF4444',
} as const

export function AnnotationCanvas({ width = 800, height = 600 }: AnnotationCanvasProps) {
  const {
    currentScreenshot,
    annotations,
    selectedTool,
    selectedColor,
    addAnnotation,
    removeAnnotation,
  } = useAnnotationToolStore()

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null)
  const [currentRect, setCurrentRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })

  // Draw annotations on canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !currentScreenshot) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background image
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      ctx.save()
      ctx.translate(offset.x, offset.y)
      ctx.scale(scale, scale)

      // Draw image
      ctx.drawImage(img, 0, 0)

      // Draw annotations
      annotations.forEach((ann) => {
        const annWidth = ann.width ?? 0
        const annHeight = ann.height ?? 0
        ctx.strokeStyle = TOOL_COLORS[ann.type as keyof typeof TOOL_COLORS] || selectedColor
        ctx.lineWidth = 2 / scale
        ctx.strokeRect(ann.x, ann.y, annWidth, annHeight)

        // Draw label
        ctx.fillStyle = TOOL_COLORS[ann.type as keyof typeof TOOL_COLORS] || selectedColor
        ctx.font = `${14 / scale}px sans-serif`
        ctx.fillText(ann.label || ann.type, ann.x, ann.y - 5 / scale)

        // Draw selection handles
        if (ann.id === selectedAnnotationId) {
          ctx.setLineDash([5 / scale, 5 / scale])
          ctx.strokeStyle = '#000'
          ctx.strokeRect(ann.x - 2 / scale, ann.y - 2 / scale, annWidth + 4 / scale, annHeight + 4 / scale)
          ctx.setLineDash([])
        }
      })

      // Draw current rectangle being drawn
      if (currentRect && isDrawing) {
        ctx.strokeStyle = TOOL_COLORS[selectedTool as keyof typeof TOOL_COLORS] || selectedColor
        ctx.lineWidth = 2 / scale
        ctx.setLineDash([5 / scale, 5 / scale])
        ctx.strokeRect(currentRect.x, currentRect.y, currentRect.w, currentRect.h)
        ctx.setLineDash([])
      }

      ctx.restore()
    }
    img.src = currentScreenshot.url
  }, [currentScreenshot, annotations, selectedAnnotationId, currentRect, isDrawing, selectedTool, selectedColor, scale, offset])

  useEffect(() => {
    draw()
  }, [draw])

  const getCanvasCoord = (e: React.MouseEvent): { x: number; y: number } => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left - offset.x) / scale,
      y: (e.clientY - rect.top - offset.y) / scale,
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      // Middle click or Alt+click for panning
      setIsPanning(true)
      setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
      return
    }

    const pos = getCanvasCoord(e)
    setStartPos(pos)
    setIsDrawing(true)

    // Check if clicking on existing annotation
    const clickedAnn = annotations.find(
      (ann) =>
        pos.x >= ann.x &&
        pos.x <= ann.x + (ann.width ?? 0) &&
        pos.y >= ann.y &&
        pos.y <= ann.y + (ann.height ?? 0)
    )
    setSelectedAnnotationId(clickedAnn?.id || null)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      })
      return
    }

    if (!isDrawing || !startPos) return

    const pos = getCanvasCoord(e)
    setCurrentRect({
      x: Math.min(startPos.x, pos.x),
      y: Math.min(startPos.y, pos.y),
      w: Math.abs(pos.x - startPos.x),
      h: Math.abs(pos.y - startPos.y),
    })
  }

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false)
      return
    }

    if (!isDrawing || !currentRect || !startPos) {
      setIsDrawing(false)
      setStartPos(null)
      return
    }

    // Only create annotation if rectangle has meaningful size
    if (currentRect.w > 5 && currentRect.h > 5) {
      const newAnnotation: AnnotationType = {
        id: `ann-${Date.now()}`,
        type: selectedTool as 'click' | 'extract' | 'download',
        x: currentRect.x,
        y: currentRect.y,
        width: currentRect.w,
        height: currentRect.h,
        label: selectedTool.toUpperCase(),
        params: {},
      }
      addAnnotation(newAnnotation)
    }

    setIsDrawing(false)
    setStartPos(null)
    setCurrentRect(null)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setScale((s) => Math.min(Math.max(s * delta, 0.1), 5))
  }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedAnnotationId) {
        removeAnnotation(selectedAnnotationId)
        setSelectedAnnotationId(null)
      }
    }
    if (e.key === 'Escape') {
      setSelectedAnnotationId(null)
    }
  }, [selectedAnnotationId, removeAnnotation])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!currentScreenshot) {
    return (
      <div className="flex items-center justify-center w-full h-64 bg-gray-100 rounded-lg text-gray-400">
        Select a screenshot to annotate
      </div>
    )
  }

  return (
    <div className="relative border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Zoom indicator */}
      <div className="absolute bottom-2 right-2 bg-white/80 px-2 py-1 rounded text-xs text-gray-600">
        {Math.round(scale * 100)}%
      </div>
    </div>
  )
}