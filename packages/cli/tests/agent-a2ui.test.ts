import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { registryProfiles } from '@varo/registry'
import { afterEach, describe, expect, it } from 'vitest'
import { installRegistryItems } from '../src/index'

const unit = 'components/agent-a2ui'
const directory = 'src/components/agent-a2ui'
const registryRoot = resolve(__dirname, '../../../registry')
const projects: string[] = []
const unsupported = Object.values(registryProfiles).filter(profile => profile.id !== 'weapp').map(profile => profile.id)

function project() {
  const projectRoot = mkdtempSync(join(tmpdir(), 'varo-agent-a2ui-'))
  projects.push(projectRoot)
  return { registryRoot, projectRoot }
}

afterEach(() => {
  for (const root of projects.splice(0)) { rmSync(root, { recursive: true, force: true }) }
})

describe('optional Weapp A2UI Registry unit', () => {
  it('installs the renderer, Core adapter, and catalog with only the native UI closure', async () => {
    const options = project()
    const plan = await installRegistryItems([unit], { ...options, target: 'weapp' })
    const payload = join(options.projectRoot, directory)
    const catalog = JSON.parse(readFileSync(join(payload, 'catalog.json'), 'utf8'))

    expect(readdirSync(payload)).toEqual(expect.arrayContaining(['AgentSurfaceNode.vue', 'LICENSE.a2ui.txt', 'VAgentSurface.vue', 'catalog.json', 'core-compat.js', 'session.ts']))
    expect(catalog.protocolVersion).toBe('1.0')
    expect(Object.keys(catalog.components).sort()).toEqual(['Button', 'Card', 'Column', 'Text', 'TextField'])
    expect(plan.items.map(item => item.name).sort()).toEqual(['agent-a2ui', 'base', 'button', 'card', 'cn', 'icon', 'input', 'primitives'])
    expect(plan.dependencies).toContain('@a2ui/web_core@0.15.0')
    expect(plan.dependencies.some(dependency => /@tanstack\/|@varo-ui\/ai|^vue$/.test(dependency))).toBe(false)
    expect(existsSync(join(options.projectRoot, 'src/components/blocks'))).toBe(false)
  })

  it.each(unsupported)('rejects %s without changing a mixed install, even with --force', async (target) => {
    const options = project()
    const sentinel = join(options.projectRoot, 'src/components/ui/v-button.vue')
    mkdirSync(dirname(sentinel), { recursive: true })
    writeFileSync(sentinel, 'consumer customizations')
    const before = readdirSync(options.projectRoot, { recursive: true }).sort()

    await expect(installRegistryItems(['components/button', unit], { ...options, target, force: true }))
      .rejects
      .toThrow(`Registry item ${unit} does not support target ${target}`)
    expect(readdirSync(options.projectRoot, { recursive: true }).sort()).toEqual(before)
    expect(readFileSync(sentinel, 'utf8')).toBe('consumer customizations')
  })

  it.each(['blocks/agent-chat', 'components/agent-ui'])('does not install A2UI with %s', async (name) => {
    const options = project()
    const plan = await installRegistryItems([name], { ...options, target: 'weapp' })

    expect(plan.items.some(item => item.name === 'agent-a2ui')).toBe(false)
    expect(plan.dependencies.some(dependency => dependency.startsWith('@a2ui/'))).toBe(false)
    expect(existsSync(join(options.projectRoot, directory))).toBe(false)
  })
})
