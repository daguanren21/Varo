import type {
  ResolverObject,
  ResolverSupportFilesStrategy,
} from 'weapp-vite/auto-import-components/resolvers'
import { existsSync, readdirSync } from 'node:fs'
import { relative, resolve, sep } from 'node:path'
import process from 'node:process'

export interface VaroResolverOptions {
  /** Consumer project root. Defaults to process.cwd(). */
  root?: string
  /** Component directory relative to sourceRoot. */
  componentsDir?: string
  /** Mini-program source root relative to root. */
  sourceRoot?: string
  /** Support-file generation strategy. Production entries remain usage-driven. */
  supportFilesStrategy?: ResolverSupportFilesStrategy
}

interface VaroComponentEntry {
  from: string
  resolvedId: string
}

function toPosixPath(path: string): string {
  return path.split(sep).join('/')
}

function toKebabCase(name: string): string {
  return name
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replaceAll('_', '-')
    .toLowerCase()
}

function toVaroComponentName(filename: string): string | undefined {
  const name = toKebabCase(filename.replace(/\.vue$/i, ''))
  return name.startsWith('v-') ? name : undefined
}

function collectVueFiles(directory: string): string[] {
  if (!existsSync(directory)) {
    return []
  }

  const files: string[] = []
  const directories = [directory]

  while (directories.length > 0) {
    const current = directories.pop()!
    const entries = readdirSync(current, { withFileTypes: true })
      .sort((left, right) => left.name.localeCompare(right.name))

    for (const entry of entries) {
      const path = resolve(current, entry.name)

      if (entry.isDirectory()) {
        directories.push(path)
      }
      else if (entry.isFile() && entry.name.endsWith('.vue')) {
        files.push(path)
      }
    }
  }

  return files.sort()
}

function collectComponents(sourceRoot: string, componentsRoot: string): Map<string, VaroComponentEntry> {
  const components = new Map<string, VaroComponentEntry>()

  for (const resolvedId of collectVueFiles(componentsRoot)) {
    const name = toVaroComponentName(resolvedId.slice(resolvedId.lastIndexOf(sep) + 1))
    if (!name) {
      continue
    }

    const sourcePath = relative(sourceRoot, resolvedId)
    if (sourcePath === '..' || sourcePath.startsWith(`..${sep}`)) {
      throw new Error(`VaroResolver component is outside sourceRoot: ${resolvedId}`)
    }

    const existing = components.get(name)
    if (existing) {
      throw new Error(
        `VaroResolver component name collision for "${name}": ${existing.resolvedId} and ${resolvedId}`,
      )
    }

    components.set(name, {
      from: `/${toPosixPath(sourcePath).replace(/\.vue$/i, '')}`,
      resolvedId,
    })
  }

  return components
}

/**
 * Resolves editable Varo Registry SFCs copied into a weapp-vite consumer project.
 * Candidate registration is eager; production component entries remain usage-driven.
 */
export function VaroResolver(options: VaroResolverOptions = {}): ResolverObject {
  const root = resolve(options.root ?? process.cwd())
  const sourceRoot = resolve(root, options.sourceRoot ?? 'src')
  const componentsRoot = resolve(sourceRoot, options.componentsDir ?? 'components/ui')
  const relativeComponentsRoot = relative(sourceRoot, componentsRoot)

  if (relativeComponentsRoot === '..' || relativeComponentsRoot.startsWith(`..${sep}`)) {
    throw new Error(`VaroResolver componentsDir must stay inside sourceRoot: ${componentsRoot}`)
  }

  const componentMap = collectComponents(sourceRoot, componentsRoot)
  const components = Object.freeze(
    Object.fromEntries(
      Array.from(componentMap, ([name, component]) => [name, component.from]),
    ),
  )

  return {
    components,
    componentLookupStrategy: 'runtime',
    supportFilesStrategy: options.supportFilesStrategy ?? 'used',
    resolve(componentName) {
      const normalizedName = toKebabCase(componentName)
      const component = componentMap.get(normalizedName)
      if (!component) {
        return
      }

      return {
        name: componentName,
        from: component.from,
        resolvedId: component.resolvedId,
        sourceType: 'wevu-sfc',
        typeImport: true,
      }
    },
  }
}
