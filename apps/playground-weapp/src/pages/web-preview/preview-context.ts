interface ReadonlyValue<T> {
  readonly value: T
}

export interface PreviewContextState {
  revision: ReadonlyValue<number>
  value: ReadonlyValue<string>
}

export const previewContextKey = Symbol('varo-web-preview-context')
