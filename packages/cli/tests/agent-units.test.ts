import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { installRegistryItems } from '../src/index'

const workspaceRoot = resolve(__dirname, '../../..')
const registryRoot = join(workspaceRoot, 'registry')
const projects: string[] = []

afterEach(() => {
  for (const project of projects.splice(0)) {
    rmSync(project, { recursive: true, force: true })
  }
})

describe.each(['h5', 'weapp'] as const)('Agent source units for %s', (target) => {
  it('installs chat without unrelated workspace, RAG or advanced payload', () => {
    const projectRoot = mkdtempSync(join(tmpdir(), 'varo-agent-chat-'))
    projects.push(projectRoot)
    execFileSync(process.execPath, [
      join(workspaceRoot, 'packages/cli/src/index.ts'),
      'add',
      '--registry',
      registryRoot,
      '--target',
      target,
      'blocks/agent-chat',
    ], { cwd: projectRoot, encoding: 'utf8' })

    const directory = join(projectRoot, 'src/components/agent-ui')
    const files = readdirSync(directory)
    expect(files).toContain(target === 'h5' ? 'conversation.ts' : 'AgentEventRenderer.vue')
    expect(files).toContain('presentation.ts')
    expect(files).not.toContain('index.ts')
    expect(files.filter(file => /advanced|workspace|rag|file-diff|FileDiff|FineTune|supplemental/i.test(file))).toEqual([])
    expect(existsSync(join(projectRoot, 'src/components/blocks/agent-chat.vue'))).toBe(true)
    expect(existsSync(join(projectRoot, 'src/styles/varo-agent.css'))).toBe(true)
  })

  it('installs the full suite together with its leaves without destination conflicts', async () => {
    const projectRoot = mkdtempSync(join(tmpdir(), 'varo-agent-suite-'))
    projects.push(projectRoot)
    const plan = await installRegistryItems([
      'components/agent-ui',
      'components/agent-conversation',
      'components/agent-workspace',
      'components/agent-advanced',
      'components/agent-rag',
    ], { projectRoot, registryRoot, target })

    const destinations = plan.files.map(file => file.to)
    expect(destinations).toEqual([...new Set(destinations)])
    const expected = target === 'h5'
      ? ['index.ts', 'conversation.ts', 'workspace.ts', 'advanced.ts', 'supplemental.ts', 'AgentRagPipeline.vue']
      : ['index.ts', 'AgentEventRenderer.vue', 'AgentTaskRunner.vue', 'AgentFileDiff.vue', 'AgentFineTune.vue', 'AgentRagPipeline.vue']
    for (const file of expected) {
      expect(existsSync(join(projectRoot, 'src/components/agent-ui', file)), file).toBe(true)
    }
  })
})
