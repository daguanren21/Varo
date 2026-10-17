import type { AgentToolInput, DevframeDefinition, DevframeNodeContext } from 'devframe'
import { defineDevframe } from 'devframe'
import { createMcpServer } from 'devframe/adapters/mcp'
import { z } from 'zod'
import { checkSchema, e2eSchema, evidenceSchema, ExecutionTools, previewSchema } from './execution.ts'
import { boundedJson } from './filesystem.ts'
import { defaultWorkspaceRoot, getSchema, listSchema, planSchema, RegistryTools, sourceSchema } from './registry.ts'

export interface VaroDevtoolsOptions {
  /** Process-owner configuration, never an MCP argument. */
  workspaceRoot?: string
  allowExecution?: boolean
}

export interface VaroDevtools {
  definition: DevframeDefinition
  close: () => Promise<void>
}

export async function createVaroDevtools(options: VaroDevtoolsOptions = {}): Promise<VaroDevtools> {
  const registry = await RegistryTools.create(options.workspaceRoot ?? defaultWorkspaceRoot)
  const execution = new ExecutionTools(registry.root, options.allowExecution === true)
  const protect = async <T>(operation: () => Promise<T>): Promise<T> => {
    try {
      const result = await operation()
      boundedJson(result)
      return result
    }
    catch (error) {
      const message = error instanceof Error ? error.message : 'Tool operation failed'
      throw new Error(message.replaceAll(registry.root, '<workspace>').slice(0, 16 * 1024))
    }
  }
  function register<T extends z.ZodType>(
    ctx: DevframeNodeContext,
    id: string,
    description: string,
    schema: T,
    safety: AgentToolInput['safety'],
    handler: (input: z.output<T>, signal?: AbortSignal) => Promise<unknown>,
  ) {
    ctx.agent.registerTool({
      id,
      description,
      safety,
      inputSchema: z.toJSONSchema(schema, { io: 'input' }),
      handler: (args: unknown, context?: { signal: AbortSignal }) => protect(async () => {
        const input = schema.parse(args)
        context?.signal.throwIfAborted()
        return handler(input, context?.signal)
      }),
    })
  }
  const definition = defineDevframe({
    id: 'varo',
    name: 'Varo Registry and Development Tools',
    version: '0.0.0',
    packageName: '@varo/devtools',
    importMetaUrl: import.meta.url,
    homepage: 'https://daguanren21.github.io/Varo/',
    description: 'Local Registry reads and explicitly enabled fixed development commands.',
    setup(ctx) {
      register(ctx, 'varo:blocks:list', 'List canonical Registry Blocks with bounded pagination and optional profile admission.', listSchema, 'read', input => registry.list(input))
      register(ctx, 'varo:blocks:get', 'Read one canonical Block manifest, including its declared files and dependencies.', getSchema, 'read', input => registry.get(input.name))
      register(ctx, 'varo:blocks:source', 'Read one manifest-listed UTF-8 source file from the selected Block dependency closure.', sourceSchema, 'read', input => registry.source(input))
      register(ctx, 'varo:install:plan', 'Preview CLI installation into a fixed playground, including conflicts. Does not write files or install dependencies.', planSchema, 'read', input => registry.plan(input))
      register(ctx, 'varo:preview:open', 'Start or reuse an owned loopback playground preview. Requires process-start --allow-execution; a browser preview is not a native device.', previewSchema, 'action', (input, signal) => execution.preview(input.target, signal))
      register(ctx, 'varo:checks:run', 'Run the fixed generated-output or architecture check. Requires process-start --allow-execution.', checkSchema, 'action', (input, signal) => execution.check(input.check, signal))
      register(ctx, 'varo:e2e:run', 'Run a fixed suite through the repository E2E runner. Returns a structured passed, failed or blocked verdict; transport success is not a passing verdict. Inspect status and exitCode. Requires process-start --allow-execution.', e2eSchema, 'action', (input, signal) => execution.e2e(input.suite, signal))
      register(ctx, 'varo:evidence:read', 'Read run.json or report.json from an E2E run owned by this server session; no arbitrary paths.', evidenceSchema, 'read', input => execution.evidence(input))
      ctx.agent.registerResource({
        id: 'varo:blocks',
        name: 'Varo Registry Blocks',
        description: 'First catalog page. Use varo_blocks_list for pagination.',
        mimeType: 'application/json',
        read: () => protect(async () => ({ json: await registry.list(listSchema.parse({})) })),
      })
    },
  })
  return { definition, close: () => execution.close() }
}

/** Start the actual Devframe stdio adapter; no HTTP or shared-state publication. */
export async function startVaroMcp(options: VaroDevtoolsOptions = {}): Promise<{ stop: () => Promise<void> }> {
  const tools = await createVaroDevtools(options)
  try {
    const server = await createMcpServer(tools.definition, {
      transport: 'stdio',
      exposeSharedState: false,
      serverName: 'varo-devtools',
      serverVersion: '0.0.0',
    })
    let stopping: Promise<void> | undefined
    const stop = (): Promise<void> => {
      stopping ??= (async () => {
        try {
          await tools.close()
        }
        finally {
          await server.stop()
          process.stdin.off('end', shutdown)
          process.stdin.off('close', shutdown)
          process.stdin.off('error', shutdown)
          process.stdout.off('error', shutdown)
          process.off('SIGINT', interrupt)
          process.off('SIGTERM', terminate)
        }
      })()
      return stopping
    }
    const shutdown = () => {
      void stop().catch((error: unknown) => {
        process.stderr.write(`${error instanceof Error ? error.message : 'Devtools shutdown failed'}\n`)
        process.exitCode = 1
      })
    }
    const interrupt = () => { process.exitCode = 130; shutdown() }
    const terminate = () => { process.exitCode = 143; shutdown() }
    process.stdin.once('end', shutdown)
    process.stdin.once('close', shutdown)
    process.stdin.once('error', shutdown)
    process.stdout.once('error', shutdown)
    process.once('SIGINT', interrupt)
    process.once('SIGTERM', terminate)
    if (process.stdin.readableEnded || process.stdin.destroyed) { await stop() }
    return { stop }
  }
  catch (error) {
    await tools.close()
    throw error
  }
}
