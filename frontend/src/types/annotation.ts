// Annotation Types
import type { Annotation as ApiAnnotation } from '../api/types'

export type AnnotationTool = 'click' | 'extract' | 'download'

export interface Annotation extends ApiAnnotation {}

export interface AnnotationCreateParams {
  type: AnnotationTool
  x: number
  y: number
  width: number
  height: number
  label?: string
}