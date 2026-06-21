import type { AnyBlockType } from './types'

export type BlockColors = {
  bg: string
  dark: string
  light: string
}

export const BLOCK_COLORS: Record<AnyBlockType, BlockColors> = {
  env:            { bg: '#BE5A2E', dark: '#924824', light: '#f7ebe6' },
  tool:           { bg: '#3F7A74', dark: '#395e56', light: '#e8efee' },
  task:           { bg: '#B26B74', dark: '#8a5456', light: '#f5edee' },
  taskset:        { bg: '#9C4A55', dark: '#7a3d41', light: '#f3e9ea' },
  database:       { bg: '#B07D2A', dark: '#886122', light: '#f5efe5' },
  'tool-input':   { bg: '#5A7691', dark: '#4c5c6b', light: '#ebeef1' },
  'answer-check': { bg: '#B0503E', dark: '#884130', light: '#f5eae7' },
  'state-check':  { bg: '#4F8A5B', dark: '#446a45', light: '#eaf1eb' },
}
