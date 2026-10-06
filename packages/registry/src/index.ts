export type RegistryRenderer = 'h5' | 'weapp'

export const registryProfiles = Object.freeze({
  'h5': Object.freeze({
    id: 'h5',
    renderer: 'h5',
    compilerPlatform: null,
    host: 'browser',
    maturity: 'stable',
  } as const),
  'weapp': Object.freeze({
    id: 'weapp',
    renderer: 'weapp',
    compilerPlatform: 'weapp',
    host: 'miniprogram',
    maturity: 'stable',
  } as const),
  'alipay': Object.freeze({
    id: 'alipay',
    renderer: 'weapp',
    compilerPlatform: 'alipay',
    host: 'miniprogram',
    maturity: 'experimental',
  } as const),
  'tt': Object.freeze({
    id: 'tt',
    renderer: 'weapp',
    compilerPlatform: 'tt',
    host: 'miniprogram',
    maturity: 'experimental',
  } as const),
  'xhs': Object.freeze({
    id: 'xhs',
    renderer: 'weapp',
    compilerPlatform: 'xhs',
    host: 'miniprogram',
    maturity: 'experimental',
  } as const),
  'donut-android': Object.freeze({
    id: 'donut-android',
    renderer: 'weapp',
    compilerPlatform: 'weapp',
    host: 'donut',
    os: 'android',
    maturity: 'experimental',
  } as const),
  'donut-ios': Object.freeze({
    id: 'donut-ios',
    renderer: 'weapp',
    compilerPlatform: 'weapp',
    host: 'donut',
    os: 'ios',
    maturity: 'experimental',
  } as const),
  'donut-ohos': Object.freeze({
    id: 'donut-ohos',
    renderer: 'weapp',
    compilerPlatform: 'weapp',
    host: 'donut',
    os: 'ohos',
    maturity: 'experimental',
  } as const),
})

export type RegistryTarget = keyof typeof registryProfiles

export function isRegistryTarget(value: unknown): value is RegistryTarget {
  return typeof value === 'string' && Object.hasOwn(registryProfiles, value)
}

export function getRegistryProfile<T extends RegistryTarget>(target: T): typeof registryProfiles[T] {
  if (!isRegistryTarget(target)) {
    throw new Error(`Unsupported registry target: ${formatValue(target)}`)
  }
  return registryProfiles[target]
}
export type RegistryItemType = 'component' | 'block' | 'hook' | 'util' | 'theme' | 'template'

export interface RegistryFile {
  target: RegistryRenderer
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
  platforms?: RegistryTarget[]
  registryDependencies: string[]
  targetDependencies?: Partial<Record<RegistryRenderer, string[]>>
  targetDevDependencies?: Partial<Record<RegistryRenderer, string[]>>
  targetRegistryDependencies?: Partial<Record<RegistryRenderer, string[]>>
  targets: RegistryRenderer[]
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
  'breadcrumb',
  'button',
  'calendar',
  'card',
  'cascader',
  'cell',
  'checkbox',
  'collapse',
  'date-field',
  'date-picker',
  'dialog',
  'divider',
  'drawer',
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
  'input-otp',
  'layout',
  'list',
  'loading',
  'menu',
  'navbar',
  'notice-bar',
  'number-keyboard',
  'overlay',
  'pagination',
  'picker',
  'popover',
  'popup',
  'progress',
  'pull-refresh',
  'radio',
  'range',
  'rate',
  'safe-area',
  'searchbar',
  'select',
  'short-password',
  'side-navbar',
  'signature',
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
  'watermark',
] as const

export const weappComponentCatalogV01 = [
  'action-sheet',
  'avatar',
  'badge',
  'breadcrumb',
  'button',
  'card',
  'cell',
  'checkbox',
  'collapse',
  'date-field',
  'dialog',
  'divider',
  'drawer',
  'empty',
  'form',
  'grid',
  'icon',
  'image',
  'indicator',
  'input',
  'input-number',
  'input-otp',
  'layout',
  'list',
  'loading',
  'menu',
  'navbar',
  'notice-bar',
  'overlay',
  'pagination',
  'picker',
  'popover',
  'popup',
  'progress',
  'pull-refresh',
  'radio',
  'rate',
  'safe-area',
  'searchbar',
  'select',
  'signature',
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
  'watermark',
] as const

const allowedRenderers: readonly RegistryRenderer[] = ['h5', 'weapp']
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

function hasWindowsInvalidPathCharacter(value: string): boolean {
  for (const character of value) {
    const code = character.charCodeAt(0)
    if (code <= 0x1F || '<>:"|?*'.includes(character)) {
      return true
    }
  }
  return false
}

const windowsReservedPathNamePattern = /^(?:aux|com[1-9¹²³]|con|conin\$|conout\$|lpt[1-9¹²³]|nul|prn)$/i

function hasPortablePathSegments(value: string): boolean {
  return value.split('/').every((segment) => {
    if (
      segment.endsWith('.')
      || segment.endsWith(' ')
      || hasWindowsInvalidPathCharacter(segment)
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
      if (!allowedRenderers.includes(target as RegistryRenderer)) {
        errors.push(`unsupported target: ${formatValue(target)}`)
      }
    })
  }

  const platforms = registryItem.platforms
  if (platforms !== undefined) {
    if (!Array.isArray(platforms)) {
      errors.push('platforms must be an array')
    }
    else {
      for (const platform of platforms) {
        if (!isRegistryTarget(platform)) {
          errors.push(`unsupported platform: ${formatValue(platform)}`)
        }
        else if (Array.isArray(targets) && !targets.includes(getRegistryProfile(platform).renderer)) {
          errors.push(`platform renderer is not declared by item: ${platform}`)
        }
      }
    }
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

      if (!allowedRenderers.includes(registryFile.target as RegistryRenderer)) {
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
      if (!allowedRenderers.includes(target as RegistryRenderer)) {
        errors.push(`unsupported ${field} target: ${target}`)
      }
      if (!Array.isArray(dependencies) || dependencies.some(dependency => !isNonEmptyString(dependency))) {
        errors.push(`${field}.${target} must be an array of package names`)
      }
    })
  }

  return errors
}
