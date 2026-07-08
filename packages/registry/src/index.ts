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

  if (!item.name) errors.push('name is required')
  if (!item.title) errors.push('title is required')
  if (!item.description) errors.push('description is required')
  if (!allowedTypes.includes(item.type)) errors.push(`unsupported type: ${item.type}`)
  if (!item.docs.startsWith('/')) errors.push('docs must be an absolute docs route')
  if (item.targets.length === 0) errors.push('targets must not be empty')
  if (item.files.length === 0) errors.push('files must not be empty')

  item.targets.forEach((target) => {
    if (!allowedTargets.includes(target)) errors.push(`unsupported target: ${target}`)
  })

  item.files.forEach((file) => {
    if (!allowedTargets.includes(file.target)) errors.push(`unsupported file target: ${file.target}`)
    if (!file.from.startsWith('registry/')) errors.push(`file.from must start with registry/: ${file.from}`)
    if (!file.to.startsWith('src/')) errors.push(`file.to must start with src/: ${file.to}`)
  })

  return errors
}
