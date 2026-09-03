export type RegistryTarget = 'h5' | 'weapp'
export type RegistryItemType = 'component' | 'block' | 'hook' | 'util' | 'theme' | 'template'

export interface RegistryFile {
  target: RegistryTarget
  from: string
  to: string
}

export interface RegistryItem {
  dependencies?: string[]
  description: string
  devDependencies?: string[]
  docs: string
  exportName?: string
  files: RegistryFile[]
  name: string
  registryDependencies: string[]
  targetDependencies?: Partial<Record<RegistryTarget, string[]>>
  targetDevDependencies?: Partial<Record<RegistryTarget, string[]>>
  targetRegistryDependencies?: Partial<Record<RegistryTarget, string[]>>
  targets: RegistryTarget[]
  title: string
  type: RegistryItemType
}

export const baseKitPhase1 = [
  'avatar',
  'badge',
  'button',
  'card',
  'checkbox',
  'empty',
  'icon',
  'image',
  'input',
  'input-number',
  'loading',
  'progress',
  'select',
  'switch',
  'tag',
] as const

export const componentCatalogV01 = [
  'action-sheet',
  'avatar',
  'badge',
  'button',
  'calendar',
  'card',
  'cascader',
  'cell',
  'checkbox',
  'collapse',
  'date-picker',
  'dialog',
  'divider',
  'empty',
  'elevator',
  'fixed-nav',
  'form',
  'grid',
  'icon',
  'image',
  'indicator',
  'input',
  'input-number',
  'layout',
  'list',
  'loading',
  'menu',
  'navbar',
  'number-keyboard',
  'notice-bar',
  'overlay',
  'pagination',
  'picker',
  'popover',
  'popup',
  'progress',
  'radio',
  'range',
  'rate',
  'safe-area',
  'searchbar',
  'select',
  'short-password',
  'side-navbar',
  'skeleton',
  'space',
  'steps',
  'sticky',
  'switch',
  'swipe-cell',
  'tabbar',
  'tabs',
  'tag',
  'textarea',
  'toast',
  'uploader',
] as const

export const weappComponentCatalogV01 = [
  'action-sheet',
  'avatar',
  'badge',
  'button',
  'card',
  'cell',
  'checkbox',
  'collapse',
  'dialog',
  'divider',
  'empty',
  'form',
  'grid',
  'icon',
  'image',
  'indicator',
  'input',
  'input-number',
  'layout',
  'list',
  'loading',
  'menu',
  'navbar',
  'notice-bar',
  'overlay',
  'pagination',
  'popover',
  'popup',
  'progress',
  'radio',
  'rate',
  'safe-area',
  'searchbar',
  'select',
  'skeleton',
  'space',
  'steps',
  'sticky',
  'swipe-cell',
  'switch',
  'tabbar',
  'tabs',
  'tag',
  'textarea',
  'toast',
] as const

const allowedTargets: readonly RegistryTarget[] = ['h5', 'weapp']
const allowedTypes: readonly RegistryItemType[] = ['component', 'block', 'hook', 'util', 'theme', 'template']

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function formatValue(value: unknown): string {
  if (
    value === undefined
    || value === null
    || typeof value === 'string'
    || typeof value === 'number'
    || typeof value === 'boolean'
    || typeof value === 'bigint'
  ) {
    return String(value)
  }

  return typeof value
}

function isSafeRegistryPath(value: string, root: 'registry' | 'src'): boolean {
  if (!value.startsWith(`${root}/`) || value.includes('\\') || value.includes('\0')) {
    return false
  }

  return value
    .slice(root.length + 1)
    .split('/')
    .every(segment => segment !== '' && segment !== '.' && segment !== '..')
}

const windowsInvalidPathCharacterPattern = /[<>:"|?*\u0000-\u001F]/
const windowsReservedPathNamePattern = /^(?:aux|com[1-9¹²³]|con|conin\$|conout\$|lpt[1-9¹²³]|nul|prn)$/i

function hasPortablePathSegments(value: string): boolean {
  return value.split('/').every((segment) => {
    if (
      segment.endsWith('.')
      || segment.endsWith(' ')
      || windowsInvalidPathCharacterPattern.test(segment)
    ) {
      return false
    }

    const extensionIndex = segment.indexOf('.')
    const basename = extensionIndex === -1 ? segment : segment.slice(0, extensionIndex)
    return !windowsReservedPathNamePattern.test(basename)
  })
}

function validateDependencyArray(
  value: unknown,
  field: 'dependencies' | 'devDependencies' | 'registryDependencies',
  errors: string[],
  required: boolean,
) {
  if (value === undefined && !required) { return }

  if (!Array.isArray(value) || value.some(dependency => !isNonEmptyString(dependency))) {
    errors.push(`${field} must be an array of package names`)
  }
}

export function validateRegistryItem(input: unknown): string[] {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    return ['registry item must be an object']
  }

  const registryItem = input as Record<string, unknown>
  const errors: string[] = []

  for (const field of ['name', 'title', 'description'] as const) {
    if (!isNonEmptyString(registryItem[field])) {
      errors.push(`${field} must be a non-empty string`)
    }
  }

  if (!allowedTypes.includes(registryItem.type as RegistryItemType)) {
    errors.push(`unsupported type: ${formatValue(registryItem.type)}`)
  }

  if (typeof registryItem.docs !== 'string' || !registryItem.docs.startsWith('/')) {
    errors.push('docs must be an absolute docs route')
  }

  if (registryItem.exportName !== undefined && !isNonEmptyString(registryItem.exportName)) {
    errors.push('exportName must be a non-empty string')
  }

  const targets = registryItem.targets
  if (!Array.isArray(targets)) {
    errors.push('targets must be an array')
  }
  else {
    if (targets.length === 0) { errors.push('targets must not be empty') }

    targets.forEach((target) => {
      if (!allowedTargets.includes(target as RegistryTarget)) {
        errors.push(`unsupported target: ${formatValue(target)}`)
      }
    })
  }

  validateDependencyArray(registryItem.dependencies, 'dependencies', errors, false)
  validateDependencyArray(registryItem.devDependencies, 'devDependencies', errors, false)
  validateDependencyArray(registryItem.registryDependencies, 'registryDependencies', errors, true)

  const files = registryItem.files
  if (!Array.isArray(files)) {
    errors.push('files must be an array')
  }
  else {
    if (files.length === 0) { errors.push('files must not be empty') }

    files.forEach((file, index) => {
      const fileIsObject = file !== null && typeof file === 'object' && !Array.isArray(file)
      const registryFile = fileIsObject ? file as Record<string, unknown> : {}
      if (!fileIsObject) {
        errors.push(`files[${index}] must be an object`)
      }

      if (!allowedTargets.includes(registryFile.target as RegistryTarget)) {
        errors.push(`unsupported file target: ${formatValue(registryFile.target)}`)
      }
      if (Array.isArray(targets) && !targets.includes(registryFile.target)) {
        errors.push(`file target is not declared by item: ${formatValue(registryFile.target)}`)
      }

      if (typeof registryFile.from !== 'string' || !registryFile.from.startsWith('registry/')) {
        errors.push(`file.from must start with registry/: ${formatValue(registryFile.from)}`)
      }
      else if (!isSafeRegistryPath(registryFile.from, 'registry')) {
        errors.push(`file.from must stay within registry/: ${registryFile.from}`)
      }
      else if (!hasPortablePathSegments(registryFile.from)) {
        errors.push(`file.from must use portable path segments: ${registryFile.from}`)
      }
      if (typeof registryFile.to !== 'string' || !registryFile.to.startsWith('src/')) {
        errors.push(`file.to must start with src/: ${formatValue(registryFile.to)}`)
      }
      else if (!isSafeRegistryPath(registryFile.to, 'src')) {
        errors.push(`file.to must stay within src/: ${registryFile.to}`)
      }
      else if (!hasPortablePathSegments(registryFile.to)) {
        errors.push(`file.to must use portable path segments: ${registryFile.to}`)
      }
    })

    if (Array.isArray(targets)) {
      targets.forEach((target) => {
        if (!files.some(file =>
          file !== null
          && typeof file === 'object'
          && !Array.isArray(file)
          && (file as Record<string, unknown>).target === target,
        )) {
          errors.push(`target has no files: ${formatValue(target)}`)
        }
      })
    }
  }

  for (const field of ['targetDependencies', 'targetDevDependencies', 'targetRegistryDependencies'] as const) {
    const targetDependencies = registryItem[field]
    if (targetDependencies === undefined) { continue }
    if (targetDependencies === null || typeof targetDependencies !== 'object' || Array.isArray(targetDependencies)) {
      errors.push(`${field} must be an object`)
      continue
    }

    Object.entries(targetDependencies).forEach(([target, dependencies]) => {
      if (!allowedTargets.includes(target as RegistryTarget)) {
        errors.push(`unsupported ${field} target: ${target}`)
      }
      if (!Array.isArray(dependencies) || dependencies.some(dependency => !isNonEmptyString(dependency))) {
        errors.push(`${field}.${target} must be an array of package names`)
      }
    })
  }

  return errors
}
