import type { UseDialogRootResult } from '@varo-ui/headless'
import { inject } from 'wevu'

export type DialogContext = UseDialogRootResult

export const dialogContextKey = Symbol('varo-dialog')

export function useDialogContext(): DialogContext {
  const context = inject<DialogContext>(dialogContextKey)
  if (context === undefined) {
    throw new Error('Dialog parts must be used inside VDialogRoot')
  }
  return context
}
