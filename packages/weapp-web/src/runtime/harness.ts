import type { template } from 'glass-easel'
import type { MiniProgramEnv } from 'glass-easel-miniprogram-adapter'
import type { NativeArtifactBundle, NativeGlobals } from './artifacts.ts'
import type { NativeElementRegistrationOptions } from './native-elements.ts'
import type { WxHostOptions } from './wx-host.ts'
import { registerNativeElements } from './native-elements.ts'
import { createWxHost } from './wx-host.ts'

export interface WxHost {
  wx: Record<string, unknown>
  dispose: () => void
}

export type NativeElementDefinitions = Record<string, import('glass-easel').GeneralComponentDefinition>

export interface WeappWebHarness {
  createWxHost: (options: WxHostOptions) => WxHost
  registerNativeElements: (
    env: MiniProgramEnv,
    templates: Record<string, template.ComponentTemplate>,
    options: NativeElementRegistrationOptions,
  ) => NativeElementDefinitions
  extendGlobals?: (globals: NativeGlobals, context: { bundle: NativeArtifactBundle, pagePath: string }) => void
}

export const defaultWeappWebHarness: WeappWebHarness = {
  createWxHost,
  registerNativeElements,
}

export function resolveWeappWebHarness(harness?: Partial<WeappWebHarness>): WeappWebHarness {
  return {
    createWxHost: harness?.createWxHost ?? defaultWeappWebHarness.createWxHost,
    registerNativeElements: harness?.registerNativeElements ?? defaultWeappWebHarness.registerNativeElements,
    extendGlobals: harness?.extendGlobals,
  }
}
