#!/usr/bin/env node
import { startVaroMcp } from './index.ts'

const args = process.argv.slice(2)
if (args.some(arg => arg !== '--allow-execution') || args.length > 1) {
  process.stderr.write('Usage: node packages/devtools/src/cli.ts [--allow-execution]\n')
  process.exitCode = 1
}
else {
  try {
    await startVaroMcp({ allowExecution: args.includes('--allow-execution') })
  }
  catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : 'Devtools startup failed'}\n`)
    process.exitCode = 1
  }
}
