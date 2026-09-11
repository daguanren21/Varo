import type { template } from 'glass-easel'
import type { CodeSpace } from 'glass-easel-miniprogram-adapter'

export interface NativeModule {
  exports: unknown
}

export type NativeRequire = (specifier: string) => unknown
export type NativeGlobals = Record<string, unknown>
export type NativeModuleFactory = (require: NativeRequire, module: NativeModule, exports: Record<string, unknown>, globals: NativeGlobals) => void

export interface NativeComponentArtifact {
  config: Parameters<CodeSpace['addComponentStaticConfig']>[1]
  template: template.ComponentTemplate
  styleScope: string
}

export interface NativeArtifactBundle {
  digest: string
  pages: Record<string, string>
  components: Record<string, NativeComponentArtifact>
  builtinTemplates: Record<string, template.ComponentTemplate>
  modules: Record<string, NativeModuleFactory>
  styles: Record<string, string>
  assets: Record<string, string>
}
