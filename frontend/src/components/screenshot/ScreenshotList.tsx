// Screenshot List Component - Thumbnail list with selection and preview

import { useState } from 'react'
import { useScreenshotStore } from '../../stores/screenshotStore'
import type { Screenshot } from '../../api/types'

interface ScreenshotListProps {
  onSelect?: (screenshot: Screenshot) => void
}

export function ScreenshotList({ onSelect }: ScreenshotListProps) {
  const { screenshots, currentScreenshot, setCurrentScreenshot } = useScreenshotStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [previewId, setPreviewId] = useState<string | null>(null)

  const handleSelect = (screenshot: Screenshot) => {
    setSelectedId(screenshot.id)
    setCurrentScreenshot(screenshot)
    onSelect?.(screenshot)
  }

  const handleDelete = (e: React.MouseEvent, screenshotId: string) => {
    e.stopPropagation()
    // In a real app, would call delete API
    console.log('Delete screenshot:', screenshotId)
  }

  const previewScreenshot = screenshots.find((s) => s.id === previewId)

  return (
    <div className="flex flex-col gap-2">
      {screenshots.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">No screenshots uploaded yet</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {screenshots.map((screenshot) => (
            <div
              key={screenshot.id}
              onClick={() => handleSelect(screenshot)}
              className={`
                relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all
                ${selectedId === screenshot.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'}
              `}
            >
              <img
                src={screenshot.url}
                alt={`Screenshot ${screenshot.id.slice(0, 8)}`}
                className="w-24 h-24 object-cover"
              />

              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setPreviewId(screenshot.id)
                  }}
                  className="p-1.5 bg-white rounded-full hover:bg-gray-100"
                  title="Preview"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => handleDelete(e, screenshot.id)}
                  className="p-1.5 bg-white rounded-full hover:bg-red-100 hover:text-red-600"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* Selection indicator */}
              {currentScreenshot?.id === screenshot.id && (
                <div className="absolute top-1 right-1">
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewId && previewScreenshot && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setPreviewId(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewId(null)}
              className="absolute top-3 right-3 p-2 bg-gray-100 hover:bg-gray-200 rounded-full z-10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={previewScreenshot.url}
              alt="Preview"
              className="max-w-full max-h-[85vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}