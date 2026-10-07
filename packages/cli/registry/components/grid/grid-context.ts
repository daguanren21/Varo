export type GridDirection = 'vertical' | 'horizontal'

export interface GridContext {
  readonly clickable: boolean
  readonly direction: GridDirection
  readonly square: boolean
}

export const gridContextKey = Symbol('varo-grid')
