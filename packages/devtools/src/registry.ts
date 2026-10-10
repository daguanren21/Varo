import type { RegistryItem, RegistryTarget } from '@varo/registry/source'
import { readdir, realpath } from 'node:fs/promises'
import { resolve } from 'node:path'
import { previewRegistryInstall, resolveRegistryItems } from '@varo-ui/cli'
import { registryProfiles, validateRegistryItem } from '@varo/registry/source'
import { z } from 'zod'
import { assertRelativePath, containedPath, readText } from './filesystem.ts'

export const profileSchema = z.enum(Object.keys(registryProfiles) as RegistryTarget[])
export const blockNameSchema = z.string().max(100).regex(/^blocks\/[a-z0-9]+(?:-[a-z0-9]+)*$/)
export const listSchema = z.strictObject({
  target: profileSchema.optional(),
  offset: z.number().int().min(0).max(10_000).default(0),
  limit: z.number().int().min(1).max(50).default(20),
})
export const getSchema = z.strictObject({ name: blockNameSchema })
export const sourceSchema = z.strictObject({
  name: blockNameSchema,
  target: profileSchema,
  file: z.string().min(1).max(240),
})
export const planSchema = z.strictObject({
  names: z.array(blockNameSchema).min(1).max(20),
  target: profileSchema,
  project: z.enum(['h5', 'weapp']),
})

const projects = { h5: 'apps/playground-h5', weapp: 'apps/playground-weapp' } as const

export class RegistryTools {
  readonly root: string
  readonly registryRoot: string

  private constructor(root: string, registryRoot: string) {
    this.root = root
    this.registryRoot = registryRoot
  }

  static async create(workspaceRoot: string): Promise<RegistryTools> {
    const root = await realpath(workspaceRoot)
    const registryRoot = await containedPath(root, 'registry')
    return new RegistryTools(root, registryRoot)
  }

  async get(name: string): Promise<RegistryItem> {
    blockNameSchema.parse(name)
    const input: unknown = JSON.parse(await readText(this.registryRoot, `${name}/registry.json`, 64 * 1024))
    const errors = validateRegistryItem(input)
    if (errors.length) { throw new Error(`Invalid Registry manifest: ${errors.join('; ')}`) }
    const item = input as RegistryItem
    if (item.type !== 'block' || item.name !== name.slice('blocks/'.length)) {
      throw new Error('Registry manifest does not match the requested block')
    }
    return item
  }

  async list(input: z.infer<typeof listSchema>) {
    const directory = await containedPath(this.registryRoot, 'blocks')
    const entries = await readdir(directory, { withFileTypes: true })
    if (entries.length > 512) { throw new Error('Registry block directory exceeds the catalog limit') }
    const blocks = []
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      if (!entry.isDirectory() && !entry.isSymbolicLink()) { continue }
      const id = `blocks/${entry.name}`
      const item = await this.get(id)
      if (input.target) {
        const profile = registryProfiles[input.target]
        if (!item.targets.includes(profile.renderer)
          || (profile.id !== profile.renderer && !item.platforms?.includes(input.target))) { continue }
      }
      blocks.push({ id, name: item.name, title: item.title, description: item.description, docs: item.docs, targets: item.targets, platforms: item.platforms ?? [] })
    }
    const end = input.offset + input.limit
    return { blocks: blocks.slice(input.offset, end), total: blocks.length, nextOffset: end < blocks.length ? end : null }
  }

  async source(input: z.infer<typeof sourceSchema>) {
    assertRelativePath(input.file)
    await this.get(input.name)
    const plan = await resolveRegistryItems([input.name], { registryRoot: this.registryRoot, registryFormat: 'canonical', target: input.target })
    const file = plan.files.find(candidate => candidate.from === input.file)
    if (!file || !file.from.startsWith('registry/')) { throw new Error('Source is not in the selected Registry manifest closure') }
    const path = file.from.slice('registry/'.length)
    const sourcePath = await containedPath(this.registryRoot, path)
    if (sourcePath !== file.sourcePath) { throw new Error('Registry source identity changed') }
    return { name: input.name, target: input.target, file: file.from, content: await readText(this.registryRoot, path, 128 * 1024) }
  }

  async plan(input: z.infer<typeof planSchema>) {
    for (const name of input.names) { await this.get(name) }
    const projectRoot = await containedPath(this.root, projects[input.project])
    const plan = await previewRegistryInstall(input.names, {
      registryRoot: this.registryRoot,
      registryFormat: 'canonical',
      projectRoot,
      target: input.target,
    })
    return {
      target: plan.target,
      project: projects[input.project],
      items: plan.items,
      dependencies: plan.dependencies,
      devDependencies: plan.devDependencies,
      files: plan.files.map(({ item, target, from, to }) => ({ item, target, from, to })),
      conflicts: plan.conflicts,
      warnings: plan.warnings ?? [],
    }
  }
}

export const defaultWorkspaceRoot = resolve(import.meta.dirname, '../../..')
