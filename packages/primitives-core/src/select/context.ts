import type { UseSelectRootResult } from './types'

export const selectRootContextKey = Symbol('varo-select-root')

export function createSelectRootContext(context: UseSelectRootResult) {
  return context
}

export function provideSelectRootContext(context: UseSelectRootResult) {
  return createSelectRootContext(context)
}

export function useSelectRootContext(context?: UseSelectRootResult) {
  if (!context) {
    throw new Error('Select parts must be used within SelectRoot.')
  }

  return context
}

export function createSelectRootProvider(provide: (key: symbol, context: UseSelectRootResult) => void) {
  return function provideRuntimeSelectRootContext(context: UseSelectRootResult) {
    provide(selectRootContextKey, context)
  }
}

export function createSelectRootConsumer(inject: (key: symbol) => UseSelectRootResult | undefined) {
  return function useRuntimeSelectRootContext() {
    const context = inject(selectRootContextKey)

    if (!context) {
      throw new Error('Select parts must be used within SelectRoot.')
    }

    return context
  }
}
