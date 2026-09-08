import type { RegistryTarget } from '@varo/registry/source'

export type StandardRegistryType
  = | 'registry:block'
    | 'registry:component'
    | 'registry:ui'
    | 'registry:hook'
    | 'registry:composable'
    | 'registry:lib'
    | 'registry:file'
    | 'registry:page'
    | 'registry:theme'
    | 'registry:style'
    | 'registry:item'

export interface StandardRegistryFile {
  path: string
  type: StandardRegistryType
  target?: string
  content?: string
}

export interface StandardRegistryItem {
  $schema?: string
  name: string
  type: StandardRegistryType
  title?: string
  description?: string
  docs?: string
  files?: StandardRegistryFile[]
  dependencies?: string[]
  devDependencies?: string[]
  registryDependencies?: string[]
  meta?: { varo?: { target?: RegistryTarget }, [key: string]: unknown }
  [key: string]: unknown
}

export interface StandardRegistryCatalog {
  $schema?: string
  name: string
  homepage: string
  items: StandardRegistryItem[]
}

export interface StandardFileDestination {
  file: StandardRegistryFile
  to: string
  defaultTo: string
}

export interface StandardFileOrigin {
  path: string
  sourceKey: string
  sourceRoot: string
  defaultTo: string
}

export interface StandardFilePlanEntry {
  to: string
  sourcePath: string
  content?: string
  standard?: StandardFileOrigin
}
