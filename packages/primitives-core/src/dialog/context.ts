import { inject, provide, type InjectionKey } from 'vue'
import type { UseDialogRootResult } from './types'

const dialogRootContextKey: InjectionKey<UseDialogRootResult> = Symbol('varo-dialog-root')

export function provideDialogRootContext(context: UseDialogRootResult) {
  provide(dialogRootContextKey, context)
}

export function useDialogRootContext() {
  const context = inject(dialogRootContextKey)

  if (!context) {
    throw new Error('Dialog parts must be used within DialogRoot.')
  }

  return context
}
