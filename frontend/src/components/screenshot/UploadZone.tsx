// Upload Zone Component - Drag and drop file upload for screenshots

import { useState, useCallback, useRef } from 'react'
import { useScreenshotStore } from '../../stores/screenshotStore'

interface UploadZoneProps {
  workflowId?: string
  stepOrder?: number
  onUploadComplete?: (screenshotId: string) => void
}

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export function UploadZone({ workflowId, stepOrder, onUploadComplete }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploadScreenshot } = useScreenshotStore()

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Only PNG, JPG, and WebP files are supported'
    }
    if (file.size > MAX_SIZE) {
      return 'File size must be less than 10MB'
    }
    return null
  }

  const handleUpload = useCallback(async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setUploadProgress(0)

    try {
      // Simulate progress for UX (actual progress would come from upload API)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev === null) return 0
          if (prev >= 90) return prev
          return prev + 10
        })
      }, 100)

      const screenshot = await uploadScreenshot(file, workflowId, stepOrder)

      clearInterval(progressInterval)
      setUploadProgress(100)

      setTimeout(() => {
        setUploadProgress(null)
        onUploadComplete?.(screenshot.id)
      }, 300)
    } catch (err) {
      setUploadProgress(null)
      setError(err instanceof Error ? err.message : 'Upload failed')
    }
  }, [uploadScreenshot, workflowId, stepOrder, onUploadComplete])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleUpload(files[0])
    }
  }, [handleUpload])

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleUpload(files[0])
    }
    // Reset input so same file can be selected again
    e.target.value = ''
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`
        relative flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed cursor-pointer
        transition-colors duration-200
        ${isDragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {uploadProgress !== null ? (
        <div className="flex flex-col items-center gap-2">
          <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <span className="text-sm text-gray-500">Uploading... {uploadProgress}%</span>
        </div>
      ) : (
        <>
          <svg
            className="w-12 h-12 text-gray-400 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-gray-600 font-medium mb-1">
            Drag & drop screenshot here
          </p>
          <p className="text-gray-400 text-sm">
            or click to browse (PNG, JPG, WebP up to 10MB)
          </p>
        </>
      )}

      {error && (
        <div className="absolute bottom-2 left-2 right-2">
          <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded">
            {error}
          </div>
        </div>
      )}
    </div>
  )
}