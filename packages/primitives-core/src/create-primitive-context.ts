export function createPrimitiveContext<T>(name: string) {
  const key = Symbol(`varo-${name.toLowerCase()}`)
  const errorMessage = `${name} parts must be used within ${name}.`

  function useContext(context?: T) {
    if (!context) {
      throw new Error(errorMessage)
    }

    return context
  }

  function createProvider(provide: (key: symbol, context: T) => void) {
    return function provideContext(context: T) {
      provide(key, context)
    }
  }

  function createConsumer(inject: (key: symbol) => T | undefined) {
    return function consumeContext() {
      return useContext(inject(key))
    }
  }

  return {
    createConsumer,
    createProvider,
    key,
    useContext
  }
}
