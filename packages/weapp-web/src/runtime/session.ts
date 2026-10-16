export interface WeappWebRuntimeSession {
  pagePath: string
  query?: Record<string, string>
  signal: AbortSignal
  ready: (artifact: string) => void
  fail: (error: unknown) => void
}
