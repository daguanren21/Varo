import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { verifyScriptReferences } from '../scripts/verify-script-references.mjs'

const directories = []
afterEach(async () => {
  await Promise.all(directories.splice(0).map(path => rm(path, { recursive: true, force: true })))
})

async function fixture(sources) {
  const root = await mkdtemp(join(tmpdir(), 'varo-script-references-'))
  directories.push(root)
  const files = []
  for (const [name, source] of Object.entries(sources)) {
    const path = join(root, name)
    await mkdir(dirname(path), { recursive: true })
    await writeFile(path, source)
    files.push(path)
  }
  return { root, files }
}

const subPackages = [
  { root: 'managePages' },
  { root: 'centerPages' },
  { root: 'isolated', independent: true },
]

describe('compiled native script references', () => {
  it('accepts page-bundled helpers and renamed chunks without legacy standalone files', async () => {
    const { root, files } = await fixture({
      'app.js': 'require("./weapp-vendors/common.js")',
      'weapp-vendors/common.js': 'exports.check = () => "main-shared check-in"',
      'managePages/check/index.js': 'require("../../weapp-vendors/common.js"); require("../shared-new.js")',
      'managePages/shared-new.js': 'exports.canvas = () => "bundled helper"',
    })
    expect(await verifyScriptReferences(root, subPackages, files)).toBe(3)
  })

  it.each([
    ['main to subpackage', 'app.js', './managePages/shared.js', 'managePages/shared.js'],
    ['sibling subpackage', 'managePages/page.js', '../centerPages/shared.js', 'centerPages/shared.js'],
    ['independent to main', 'isolated/page.js', '../shared.js', 'shared.js'],
  ])('rejects a %s synchronous dependency', async (_label, importer, reference, target) => {
    const { root, files } = await fixture({ [importer]: `require(${JSON.stringify(reference)})`, [target]: 'exports.value = 1' })
    await expect(verifyScriptReferences(root, subPackages, files)).rejects.toThrow('Forbidden synchronous package reference')
  })

  it('rejects a dangling dependency even when no legacy chunk names are present', async () => {
    const { root, files } = await fixture({ 'managePages/page.js': 'require("./renamed-missing.js")' })
    await expect(verifyScriptReferences(root, subPackages, files)).rejects.toThrow('Unresolved generated JS import: managePages/page.js -> ./renamed-missing.js')
  })

  it('rejects references escaping the compiled output', async () => {
    const { root, files } = await fixture({ 'app.js': 'require("../outside.js")' })
    await expect(verifyScriptReferences(root, subPackages, files)).rejects.toThrow('Native reference escapes output')
  })

  it('does not mistake diagnostic text or comments for module dependencies', async () => {
    const { root, files } = await fixture({ 'app.js': 'const diagnostic = "require(\'./missing.js\')"; /* require("./also-missing.js") */' })
    expect(await verifyScriptReferences(root, subPackages, files)).toBe(0)
  })
})
