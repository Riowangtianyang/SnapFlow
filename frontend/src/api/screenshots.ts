// Screenshot API endpoints

import { get, put, upload } from './client'
import type {
  Screenshot,
  UploadScreenshotResponse,
  UpdateAnnotationsRequest,
  Annotation,
} from './types'

export interface UploadScreenshotParams {
  file: File
  workflow_id?: string
  step_order?: number
}

export async function uploadScreenshot(
  params: UploadScreenshotParams
): Promise<UploadScreenshotResponse> {
  const formData = new FormData()
  formData.append('file', params.file)
  if (params.workflow_id) {
    formData.append('workflow_id', params.workflow_id)
  }
  if (params.step_order !== undefined) {
    formData.append('step_order', String(params.step_order))
  }
  return upload<UploadScreenshotResponse>('/screenshots/upload', formData)
}

export async function getScreenshot(id: string): Promise<Screenshot> {
  return get<Screenshot>(`/screenshots/${id}`)
}

export async function updateAnnotations(
  id: string,
  annotations: Annotation[]
): Promise<Screenshot> {
  const data: UpdateAnnotationsRequest = { annotations }
  return put<Screenshot>(`/screenshots/${id}/annotations`, data)
}
