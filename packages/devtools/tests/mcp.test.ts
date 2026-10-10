// @vitest-environment node
import type { CallToolResult } from '@modelcontextprotocol/client'
import { execFile } from 'node:child_process'
import { resolve } from 'node:path'
import { promisify } from 'node:util'
import { Client } from '@modelcontextprotocol/client'
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio'
import { afterEach, describe, expect, it } from 'vitest'

const workspace = resolve(import.meta.dirname, '../../..')
const cli = resolve(workspace, 'packages/devtools/src/cli.ts')
const clients: Client[] = []
afterEach(async () => {
  await Promise.all(clients.splice(0).map(client => client.close()))
})
async function connect() {
  const transport = new StdioClientTransport({ command: process.execPath, args: [cli], cwd: workspace, stderr: 'pipe' })
  const client = new Client({ name: 'varo-contract-test', version: '1.0.0' })
  clients.push(client)
  await client.connect(transport)
  return client
}
function text(result: CallToolResult): string {
  return result.content.map(content => content.type === 'text' ? content.text : '').join('\n')
}

describe('Devframe stdio MCP', () => {
  it('handshakes, discovers real tools and reads a resource without publishing shared state', async () => {
    const client = await connect()
    expect(client.getServerVersion()?.name).toBe('varo-devtools')
    const { tools } = await client.listTools()
    expect(tools.map(tool => tool.name).sort()).toEqual([
      'varo_blocks_get',
      'varo_blocks_list',
      'varo_blocks_source',
      'varo_checks_run',
      'varo_e2e_run',
      'varo_evidence_read',
      'varo_install_plan',
      'varo_preview_open',
    ])
    expect(tools.every(tool => tool.inputSchema.additionalProperties === false)).toBe(true)
    const resources = await client.listResources()
    expect(resources.resources).toHaveLength(1)
    expect(resources.resources[0]!.uri).toBe('devframe://resource/varo%3Ablocks')
    const catalog = await client.readResource({ uri: resources.resources[0]!.uri })
    expect(catalog.contents[0]).toHaveProperty('text')
    expect(JSON.stringify(catalog)).toContain('blocks/agent-chat')
    await expect(client.readResource({ uri: 'devframe://state/devframe%3Aservices' })).rejects.toThrow()
    const state = await client.callTool({ name: 'devframe_state_read', arguments: {} })
    expect(state.isError).toBe(true)
  }, 20_000)

  it('reads actual manifests, dependency source and a no-write CLI installation plan', async () => {
    const client = await connect()
    const manifestResult = await client.callTool({ name: 'varo_blocks_get', arguments: { name: 'blocks/agent-chat' } })
    expect(manifestResult.isError).not.toBe(true)
    const manifest = JSON.parse(text(manifestResult)) as { name: string, files: { target: string, from: string }[] }
    expect(manifest.name).toBe('agent-chat')
    const file = manifest.files.find(file => file.target === 'weapp')!
    const source = await client.callTool({ name: 'varo_blocks_source', arguments: { name: 'blocks/agent-chat', target: 'weapp', file: file.from } })
    expect(source.isError).not.toBe(true)
    expect(JSON.parse(text(source)).content).toContain('<template>')
    const plan = await client.callTool({ name: 'varo_install_plan', arguments: { names: ['blocks/agent-chat'], target: 'weapp', project: 'weapp' } })
    expect(plan.isError).not.toBe(true)
    expect(JSON.parse(text(plan))).toMatchObject({ target: 'weapp', project: 'apps/playground-weapp' })
    expect(text(plan)).not.toContain(workspace)
  }, 20_000)

  it('enforces authorization, strict fields, safe selectors and errors in the server', async () => {
    const client = await connect()
    for (const [name, args] of [
      ['varo_blocks_list', { approved: true }],
      ['varo_blocks_get', { name: 'blocks/../../package.json' }],
      ['varo_blocks_get', { name: 'blocks/nonexistent-block' }],
      ['varo_blocks_source', { name: 'blocks/agent-chat', target: 'weapp', file: '/etc/passwd' }],
      ['varo_install_plan', { names: ['blocks/agent-chat'], target: 'weapp', project: '../outside' }],
      ['varo_preview_open', { target: 'h5' }],
      ['varo_checks_run', { check: 'architecture' }],
      ['varo_e2e_run', { suite: 'web' }],
      ['varo_e2e_run', { suite: 'web', approved: true }],
      ['varo_e2e_run', { suite: 'web', command: 'echo unsafe' }],
      ['varo_evidence_read', { runId: 'unowned', artifact: 'run' }],
      ['varo_evidence_read', { runId: '../unowned', artifact: 'run' }],
    ] as const) {
      const result = await client.callTool({ name, arguments: args })
      expect(result.isError, `${name}: ${JSON.stringify(args)}`).toBe(true)
      expect(text(result)).not.toContain(workspace)
    }
    const disabled = await client.callTool({ name: 'varo_checks_run', arguments: { check: 'architecture' } })
    expect(text(disabled)).toContain('--allow-execution')
  }, 20_000)

  it('rejects unknown startup flags rather than turning them into execution authority', async () => {
    await expect(promisify(execFile)(process.execPath, [cli, '--approved'], { cwd: workspace })).rejects.toMatchObject({ code: 1, stdout: '', stderr: expect.stringContaining('Usage:') })
  })
})
