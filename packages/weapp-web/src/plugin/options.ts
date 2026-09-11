import { isAbsolute, resolve } from 'node:path'

export const nativeArtifactModuleId = 'virtual:varo-native-artifacts'
export const resolvedNativeArtifactModuleId = `\0${nativeArtifactModuleId}`

export interface NativeArtifactsPluginOptions {
  /** Absolute or Vite-root-relative path to compiled WeChat mini-program output. */
  nativeBuildRoot: string
  /** Scenario id -> compiled page path, e.g. `{ controls: 'pages/index/index' }`. */
  pages: Record<string, string>
  /** Extra files that should invalidate the virtual artifact module. */
  watchFiles?: readonly string[]
}

export function resolvePluginPath(root: string, value: string): string {
  return isAbsolute(value) ? value : resolve(root, value)
}

export function assertNativeArtifactsOptions(options: NativeArtifactsPluginOptions): void {
  if (!options.nativeBuildRoot.trim()) {
    throw new Error('[varo-weapp-web] nativeBuildRoot is required')
  }
  const pages = Object.entries(options.pages)
  if (pages.length === 0) {
    throw new Error('[varo-weapp-web] pages must list at least one compiled mini-program page')
  }
  for (const [id, page] of pages) {
    if (!id.trim()) {
      throw new Error('[varo-weapp-web] page ids must be non-empty strings')
    }
    if (!page.trim() || page.includes('\\') || page.startsWith('/') || page.includes('..')) {
      throw new Error(`[varo-weapp-web] invalid compiled page path for ${id}: ${page}`)
    }
  }
}
