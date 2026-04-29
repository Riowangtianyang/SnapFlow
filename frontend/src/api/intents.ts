// Intent API endpoints

import { post } from './client'
import type {
  IntentGenerateRequest,
  IntentGenerateResponse,
  IntentRefineRequest,
  IntentRefineResponse,
} from './types'

export async function generateIntent(
  data: IntentGenerateRequest
): Promise<IntentGenerateResponse> {
  return post<IntentGenerateResponse>('/intent/generate', data)
}

export async function refineIntent(
  data: IntentRefineRequest
): Promise<IntentRefineResponse> {
  return post<IntentRefineResponse>('/intent/refine', data)
}
