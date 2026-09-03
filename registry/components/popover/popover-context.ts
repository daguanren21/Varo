import type { UsePopoverRootResult } from '@varo-ui/headless'
import { inject } from 'wevu'

export type PopoverSide = 'top' | 'right' | 'bottom' | 'left'
export type PopoverAlign = 'start' | 'center' | 'end'
export type PopoverContext = UsePopoverRootResult

export const popoverContextKey = Symbol('varo-popover')

export function usePopoverContext(): PopoverContext {
  const context = inject<PopoverContext>(popoverContextKey)
  if (context === undefined) {
    throw new Error('Popover parts must be used inside VPopoverRoot')
  }
  return context
}
