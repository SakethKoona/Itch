import type { AnyBlockType } from './types'

export type BlockColors = {
  bg: string
  dark: string
  light: string
}

export const BLOCK_COLORS: Record<AnyBlockType, BlockColors> = {
  env:            { bg: '#8b5cf6', dark: '#5b21b6', light: '#f5f3ff' },
  tool:           { bg: '#3b82f6', dark: '#1e40af', light: '#eff6ff' },
  task:           { bg: '#10b981', dark: '#065f46', light: '#ecfdf5' },
  taskset:        { bg: '#0d9488', dark: '#115e59', light: '#f0fdfa' },
  database:       { bg: '#f97316', dark: '#c2410c', light: '#fff7ed' },
  'tool-input':   { bg: '#6366f1', dark: '#3730a3', light: '#eef2ff' },
  'answer-check': { bg: '#f43f5e', dark: '#9f1239', light: '#fff1f2' },
  'state-check':  { bg: '#f59e0b', dark: '#92400e', light: '#fffbeb' },
}
