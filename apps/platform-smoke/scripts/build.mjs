import { rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { prepareProject } from './prepare.mjs'
import { appRoot, compilerCli, getProject, run } from './project.mjs'
import { verifyProject } from './verify.mjs'

const [target, ...extra] = process.argv.slice(2)
if (extra.length) { throw new Error('Build accepts exactly one Registry profile') }
const project = getProject(target)
await prepareProject(project)
await rm(project.ideRoot, { recursive: true, force: true })
run(process.execPath, [
  compilerCli(),
  'build',
  project.consumerRoot,
  '--config',
  resolve(appRoot, 'vite.config.mjs'),
  '--platform',
  project.profile.compilerPlatform,
], {
  cwd: project.consumerRoot,
  env: { ...process.env, VARO_SMOKE_TARGET: project.profile.id },
})
await verifyProject(project)
