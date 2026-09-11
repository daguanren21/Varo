export interface WeappWebRuntimeSession {
  pagePath: string
  signal: AbortSignal
  ready: (artifact: string) => void
  fail: (error: unknown) => void
}
