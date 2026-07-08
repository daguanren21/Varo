export type RegistryTarget = 'weapp-vite'
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
  targets: RegistryTarget[]
  title: string
  type: RegistryItemType
}

export const baseKitPhase1 = [
  'button',
  'cell',
  'input',
  'textarea',
  'input-number',
  'form',
  'checkbox',
  'radio',
  'switch',
  'select',
  'picker',
  'cascader',
  'date-picker',
  'overlay',
  'popup',
  'dialog',
  'toast',
  'loading'
] as const

const allowedTargets: RegistryTarget[] = ['weapp-vite']
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

  if (!Array.isArray(registryItem.targets)) {
    errors.push('targets must be an array')
  } else {
    if (registryItem.targets.length === 0) errors.push('targets must not be empty')

    registryItem.targets.forEach((target) => {
      if (!allowedTargets.includes(target as RegistryTarget)) errors.push(`unsupported target: ${target}`)
    })
  }

  if (!Array.isArray(registryItem.files)) {
    errors.push('files must be an array')
  } else {
    if (registryItem.files.length === 0) errors.push('files must not be empty')

    registryItem.files.forEach((file) => {
      const registryFile = file as Partial<Record<keyof RegistryFile, unknown>>

      if (!allowedTargets.includes(registryFile.target as RegistryTarget)) {
        errors.push(`unsupported file target: ${registryFile.target}`)
      }
      if (typeof registryFile.from !== 'string' || !registryFile.from.startsWith('registry/')) {
        errors.push(`file.from must start with registry/: ${registryFile.from}`)
      }
      if (typeof registryFile.to !== 'string' || !registryFile.to.startsWith('src/')) {
        errors.push(`file.to must start with src/: ${registryFile.to}`)
      }
    })
  }

  return errors
}
