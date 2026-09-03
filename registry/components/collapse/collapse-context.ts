import type { UseAccordionRootResult } from '@varo-ui/headless'
import { inject } from 'wevu'

export type CollapseContext = UseAccordionRootResult

export const collapseContextKey = Symbol('varo-collapse')

export function useCollapseContext(): CollapseContext {
  const context = inject<CollapseContext>(collapseContextKey)
  if (context === undefined) {
    throw new Error('VCollapseItem must be used inside VCollapse')
  }
  return context
}
