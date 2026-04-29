// API Client based on docs/api-contracts.md

import type { ApiError, Annotation, AnnotationShapeType } from './types'

export type { Annotation, AnnotationShapeType }

const baseURL = '/api'

export class ApiException extends Error {
  constructor(
    public code: string,
    public detail: string,
    public status: number
  ) {
    super(detail)
    this.name = 'ApiException'
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options

  let url = `${baseURL}${endpoint}${endpoint.endsWith('/') ? '' : '/'}`

  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  }

  let response: Response
  try {
    response = await fetch(url, {
      ...fetchOptions,
      headers,
    })
  } catch (networkError) {
    throw new ApiException(
      'NETWORK_ERROR',
      '网络连接失败，请检查网络或服务器状态',
      0
    )
  }

  if (!response.ok) {
    let errorData: ApiError
    try {
      errorData = await response.json()
    } catch {
      errorData = {
        detail: response.statusText || '请求失败',
        code: 'INTERNAL_ERROR',
      }
    }
    throw new ApiException(
      errorData.code || 'HTTP_ERROR',
      errorData.detail || `HTTP ${response.status}`,
      response.status
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

export async function get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
  return request<T>(endpoint, { ...options, method: 'GET' })
}

export async function post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
  return request<T>(endpoint, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  })
}

export async function put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
  return request<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  })
}

export async function del<T>(endpoint: string, options?: RequestOptions): Promise<T> {
  return request<T>(endpoint, { ...options, method: 'DELETE' })
}

export async function upload<T>(
  endpoint: string,
  formData: FormData,
  options?: RequestOptions
): Promise<T> {
  const response = await fetch(`${baseURL}${endpoint}`, {
    ...options,
    method: 'POST',
    body: formData,
    headers: {
      // Don't set Content-Type for FormData - browser will set it with boundary
    },
  })

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      detail: response.statusText,
      code: 'INTERNAL_ERROR',
    }))
    throw error
  }

  return response.json()
}
