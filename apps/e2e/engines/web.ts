import type { WebOptions } from '@e2e-dev/web'
import type { EngineHandle, EngineState, OperationContext } from 'e2e/engine'
import type { BrowserContext, ConsoleMessage, Page, WebError } from 'playwright-core'
import { surfaceOf, web, test as webTest } from '@e2e-dev/web'
import { ConfigurationError, defineEngine, raceAbort } from 'e2e/engine'

export interface VaroWebOptions extends WebOptions {
  platform: 'h5' | 'weapp-preview'
}

export interface WebDiagnostics {
  console: { type: string, text: string }[]
  pageErrors: string[]
}

/** Browser-only gaps in @e2e-dev/web 0.13.0, recorded by the runner. */
export interface WebRuntime {
  diagnostics: () => Promise<WebDiagnostics>
  interceptFileChoosers: () => Promise<void>
  setInputFiles: (selector: string, files: string[]) => Promise<void>
  emulateMedia: (options: {
    reducedMotion?: 'reduce' | 'no-preference' | null
    colorScheme?: 'light' | 'dark' | 'no-preference' | null
  }) => Promise<void>
}

export const test = webTest.extend<{ webRuntime: WebRuntime }>()

export function varoWeb({ platform, ...options }: VaroWebOptions): EngineHandle {
  if (platform !== 'h5' && platform !== 'weapp-preview') {
    throw new ConfigurationError('INVALID_CONFIG', 'varoWeb requires platform h5 or weapp-preview')
  }
  const upstream = web(options)
  const surface = surfaceOf(upstream)
  if (!surface) {
    throw new ConfigurationError('INVALID_CONFIG', 'The installed web engine does not expose its live surface')
  }
  const live = surface
  // defineEngine accepts Engine, not an already branded capability manifest.
  const { capabilities: _capabilities, ...engine } = upstream
  let observedContext: BrowserContext | undefined
  let chooserPage: Page | undefined
  // An explicit listener holds Chromium's chooser for setInputFiles instead of automatic cancellation.
  const onFileChooser = () => {}
  const consoleMessages: WebDiagnostics['console'] = []
  const pageErrors: string[] = []
  const onConsole = (message: ConsoleMessage) => {
    consoleMessages.push({ type: message.type(), text: message.text() })
  }
  const onWebError = (error: WebError) => {
    pageErrors.push(error.error().message)
  }

  function detach() {
    chooserPage?.off('filechooser', onFileChooser)
    chooserPage = undefined
    observedContext?.off('console', onConsole)
    observedContext?.off('weberror', onWebError)
    observedContext = undefined
  }

  function observeContext() {
    const current = live.context()
    if (current === observedContext) { return }
    detach()
    observedContext = current
    // Context events include every iframe and popup, before app.open navigates.
    current.on('console', onConsole)
    current.on('weberror', onWebError)
  }

  function clear() {
    detach()
    consoleMessages.length = 0
    pageErrors.length = 0
  }

  return defineEngine({
    ...engine,
    name: 'varo-web',
    version: `1.0.0+web.${upstream.version}`,
    platform,
    async startAttempt(context) {
      clear()
      await upstream.startAttempt?.(context)
      observeContext()
    },
    async endAttempt(context) {
      try {
        await upstream.endAttempt?.(context)
      }
      finally {
        clear()
      }
    },
    async dispose(context) {
      try {
        await upstream.dispose?.(context)
      }
      finally {
        clear()
      }
    },
    session: {
      ...upstream.session,
      ...(upstream.session?.reset && {
        async reset(operation: OperationContext) {
          await upstream.session!.reset!(operation)
          observeContext()
        },
      }),
    },
    ...(upstream.state && {
      state: {
        ...upstream.state,
        async restore(state: EngineState, operation: OperationContext) {
          await upstream.state!.restore(state, operation)
          observeContext()
        },
      },
    }),
    fixtures: {
      ...upstream.fixtures,
      webRuntime: context => context.fixture<WebRuntime>('webRuntime', {
        async diagnostics() {
          return {
            console: consoleMessages.map(message => ({ ...message })),
            pageErrors: [...pageErrors],
          }
        },
        async interceptFileChoosers() {
          const page = live.page()
          if (chooserPage === page) { return }
          chooserPage?.off('filechooser', onFileChooser)
          chooserPage = page
          page.on('filechooser', onFileChooser)
        },
        async setInputFiles(selector, files) {
          await raceAbort(() => live.page().locator(selector).setInputFiles(files), context.signal, 'webRuntime.setInputFiles')
        },
        async emulateMedia(preferences) {
          await raceAbort(() => live.page().emulateMedia(preferences), context.signal, 'webRuntime.emulateMedia')
        },
      }, {
        diagnostics: { kind: 'resource' },
        interceptFileChoosers: { kind: 'resource' },
        setInputFiles: { kind: 'resource', label: selector => selector },
        emulateMedia: { kind: 'resource', label: preferences => JSON.stringify(preferences) },
      }),
    },
  })
}
