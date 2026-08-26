export type RegistryTarget = 'h5' | 'weapp-vite'
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
  'tag'
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
  'uploader'
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
  'toast'
] as const

const allowedTargets: RegistryTarget[] = ['h5', 'weapp-vite']
const allowedTypes: RegistryItemType[] = ['component', 'block', 'hook', 'util', 'theme', 'template']

export function validateRegistryItem(item: RegistryItem): string[] {
  const errors: string[] = []
  const registryItem = item as Partial<Record<keyof RegistryItem, unknown>>

  if (!item.name) errors.push('name is required')
  if (!item.title) errors.push('title is required')
  if (!item.description) errors.push('description is required')
  if (!allowedTypes.includes(item.type)) errors.push(`unsupported type: ${item.type}`)

  if (typeof registryItem.docs !== 'string' || !registryItem.docs.startsWith('/')) {
    errors.push('docs must be an absolute docs route')
  }

  const targets = registryItem.targets
  if (!Array.isArray(targets)) {
    errors.push('targets must be an array')
  } else {
    if (targets.length === 0) errors.push('targets must not be empty')

    targets.forEach((target) => {
      if (!allowedTargets.includes(target as RegistryTarget)) errors.push(`unsupported target: ${target}`)
    })
  }

  const files = registryItem.files
  if (!Array.isArray(files)) {
    errors.push('files must be an array')
  } else {
    if (files.length === 0) errors.push('files must not be empty')

    files.forEach((file) => {
      const registryFile =
        file !== null && typeof file === 'object' ? (file as Partial<Record<keyof RegistryFile, unknown>>) : {}

      if (!allowedTargets.includes(registryFile.target as RegistryTarget)) {
        errors.push(`unsupported file target: ${registryFile.target}`)
      }
      if (Array.isArray(targets) && !targets.includes(registryFile.target)) {
        errors.push(`file target is not declared by item: ${registryFile.target}`)
      }
      if (typeof registryFile.from !== 'string' || !registryFile.from.startsWith('registry/')) {
        errors.push(`file.from must start with registry/: ${registryFile.from}`)
      }
      if (typeof registryFile.to !== 'string' || !registryFile.to.startsWith('src/')) {
        errors.push(`file.to must start with src/: ${registryFile.to}`)
      }
    })

    if (Array.isArray(targets)) {
      targets.forEach((target) => {
        if (!files.some((file) => file?.target === target)) {
          errors.push(`target has no files: ${target}`)
        }
      })
    }
  }

  for (const field of ['targetDependencies', 'targetDevDependencies', 'targetRegistryDependencies'] as const) {
    const targetDependencies = registryItem[field]
    if (targetDependencies === undefined) continue
    if (targetDependencies === null || typeof targetDependencies !== 'object' || Array.isArray(targetDependencies)) {
      errors.push(`${field} must be an object`)
      continue
    }

    Object.entries(targetDependencies).forEach(([target, dependencies]) => {
      if (!allowedTargets.includes(target as RegistryTarget)) {
        errors.push(`unsupported ${field} target: ${target}`)
      }
      if (!Array.isArray(dependencies) || dependencies.some((dependency) => typeof dependency !== 'string')) {
        errors.push(`${field}.${target} must be an array of package names`)
      }
    })
  }

  return errors
}
