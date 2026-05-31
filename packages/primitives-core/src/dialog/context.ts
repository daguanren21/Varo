import type { UseDialogRootResult } from './types'

export const dialogRootContextKey = Symbol('varo-dialog-root')

export function createDialogRootContext(context: UseDialogRootResult) {
  return context
}

export function provideDialogRootContext(context: UseDialogRootResult) {
  return createDialogRootContext(context)
}

export function useDialogRootContext(context?: UseDialogRootResult) {
  if (!context) {
    throw new Error('Dialog parts must be used within DialogRoot.')
  }

  return context
}

export function createDialogRootProvider(provide: (key: symbol, context: UseDialogRootResult) => void) {
  return function provideRuntimeDialogRootContext(context: UseDialogRootResult) {
    provide(dialogRootContextKey, context)
  }
}

export function createDialogRootConsumer(inject: (key: symbol) => UseDialogRootResult | undefined) {
  return function useRuntimeDialogRootContext() {
    const context = inject(dialogRootContextKey)

    if (!context) {
      throw new Error('Dialog parts must be used within DialogRoot.')
    }

    return context
  }
}
