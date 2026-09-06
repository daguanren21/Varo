import type {
  App,
  ComputedRef,
  InjectionKey,
  Plugin,
  PropType,
} from 'vue'
import type { ThemeCssVariables } from './css'
import type { ThemeDefinition, ThemeOverrides } from './types'
import type { ThemeConfig } from './types-runtime'
import { computed, defineComponent, h, inject, provide, toValue, watchEffect } from 'vue'
import { createThemeCssVariables } from './css'
import { createTheme, mergeThemeOverrides } from './theme'

const ThemeKey: InjectionKey<ComputedRef<ThemeDefinition>> = Symbol('varo-theme')
const fallbackTheme = createTheme({
  primary: '#07c160',
  success: '#13b248',
  warning: '#fa9200',
  error: '#eb3437',
  neutral: '#303133',
  info: '#73767a',
})

interface InlineStyleSnapshot {
  priority: string
  value: string
}

interface ThemeLayer {
  owner: symbol
  variables: ThemeCssVariables
}

interface ThemeTargetState {
  base: Map<string, InlineStyleSnapshot>
  layers: ThemeLayer[]
}

const targetStates = new WeakMap<HTMLElement, ThemeTargetState>()

function resolveTheme(config: ThemeConfig): ThemeDefinition {
  return mergeThemeOverrides(toValue(config.theme), toValue(config.overrides) ?? {})
}

function applyTargetState(target: HTMLElement, state: ThemeTargetState): void {
  const activeLayer = state.layers[state.layers.length - 1]
  const activeVariables = activeLayer?.variables as unknown as Record<string, string> | undefined
  for (const [name, snapshot] of state.base) {
    const value = activeVariables?.[name]
    if (value !== undefined) {
      target.style.setProperty(name, value)
    }
    else if (snapshot.value) {
      target.style.setProperty(name, snapshot.value, snapshot.priority)
    }
    else {
      target.style.removeProperty(name)
    }
  }
}

function bindThemeVariables(
  target: HTMLElement,
  theme: ComputedRef<ThemeDefinition>,
): () => void {
  let state = targetStates.get(target)
  if (!state) {
    state = { base: new Map(), layers: [] }
    targetStates.set(target, state)
  }

  const owner = Symbol('varo-theme-owner')
  const layer: ThemeLayer = {
    owner,
    variables: createThemeCssVariables(theme.value),
  }
  state.layers.push(layer)

  const stop = watchEffect(() => {
    const variables = createThemeCssVariables(theme.value)
    for (const name of Object.keys(variables)) {
      if (!state!.base.has(name)) {
        state!.base.set(name, {
          priority: target.style.getPropertyPriority(name),
          value: target.style.getPropertyValue(name),
        })
      }
    }
    layer.variables = variables
    if (state!.layers[state!.layers.length - 1]?.owner === owner) {
      applyTargetState(target, state!)
    }
  })

  return () => {
    stop()
    const index = state!.layers.findIndex(candidate => candidate.owner === owner)
    if (index < 0) {
      return
    }
    const wasActive = index === state!.layers.length - 1
    state!.layers.splice(index, 1)
    if (wasActive) {
      applyTargetState(target, state!)
    }
    if (state!.layers.length === 0) {
      targetStates.delete(target)
    }
  }
}

export function provideVaroTheme(config: ThemeConfig): void {
  provide(ThemeKey, computed(() => resolveTheme(config)))
}

export function useVaroTheme(): ComputedRef<ThemeDefinition> {
  return inject(ThemeKey, computed(() => fallbackTheme))
}

export const VaroThemeProvider = defineComponent({
  name: 'VaroThemeProvider',
  inheritAttrs: false,
  props: {
    theme: {
      type: Object as PropType<ThemeDefinition>,
      required: true,
    },
    overrides: {
      type: Object as PropType<ThemeOverrides>,
      default: undefined,
    },
  },
  setup(props, { attrs, slots }) {
    const theme = computed(() =>
      mergeThemeOverrides(props.theme, props.overrides ?? {}),
    )
    const styles = computed(() => createThemeCssVariables(theme.value))
    provide(ThemeKey, theme)

    return () =>
      h(
        'div',
        {
          ...attrs,
          style: [styles.value, attrs.style],
        },
        slots.default?.(),
      )
  },
})

export const VaroConfigProvider = {
  install(app: App, config?: ThemeConfig) {
    if (!config) {
      throw new Error('VaroConfigProvider requires a theme configuration.')
    }

    const theme = computed(() => resolveTheme(config))
    app.provide(ThemeKey, theme)
    if (typeof document === 'undefined') {
      return
    }

    const release = bindThemeVariables(config.target ?? document.documentElement, theme)
    app.onUnmount(release)
  },
} satisfies Plugin
