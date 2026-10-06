// @vitest-environment node
import type { Buffer } from 'node:buffer'
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  symlinkSync,
  utimesSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { projectFiles } from './registry-artifacts.mjs'

const roots: string[] = []
const inventory = 'scripts/registry-projections.json'
const oldPath = 'packages/ui-h5/src/old.ts'
const keptPath = 'packages/ui-h5/src/kept.ts'
const newPath = 'packages/ui-h5/src/renamed.ts'
const authoredPath = 'packages/ui-h5/src/authored.ts'

function temporaryRoot() {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'varo-projections-')))
  roots.push(root)
  return root
}

function write(root: string, path: string, content: string | Buffer) {
  mkdirSync(dirname(join(root, path)), { recursive: true })
  writeFileSync(join(root, path), content)
}

function read(root: string, path: string) {
  return readFileSync(join(root, path), 'utf8')
}

function sync(root: string, files: Map<string, string>, check = false, owner = 'registry') {
  return projectFiles(files, check, { owner, projectRoot: root })
}

afterEach(() => {
  for (const root of roots.splice(0)) { rmSync(root, { recursive: true, force: true }) }
})

describe('generated projection reconciliation', () => {
  it.each(['remove', 'rename'])('rejects a %s in check mode and safely reconciles the generated tree', async (operation) => {
    const root = temporaryRoot()
    await sync(root, new Map([[oldPath, 'original output\n'], [keptPath, 'previous version\n']]))
    write(root, authoredPath, 'authored neighbor\n')
    const inventoryBefore = read(root, inventory)
    utimesSync(join(root, inventory), 1234567890, 1234567890)
    const inventoryTime = statSync(join(root, inventory), { bigint: true }).mtimeNs
    const current = new Map([[keptPath, 'updated version\n']])
    if (operation === 'rename') { current.set(newPath, 'original output\n') }

    await expect(sync(root, current, true)).rejects.toThrow(`${oldPath} (obsolete)`)
    expect(read(root, oldPath)).toBe('original output\n')
    expect(read(root, keptPath)).toBe('previous version\n')
    expect(read(root, inventory)).toBe(inventoryBefore)
    expect(statSync(join(root, inventory), { bigint: true }).mtimeNs).toBe(inventoryTime)
    expect(existsSync(join(root, newPath))).toBe(false)

    await sync(root, current)
    expect(existsSync(join(root, oldPath))).toBe(false)
    expect(read(root, keptPath)).toBe('updated version\n')
    expect(read(root, authoredPath)).toBe('authored neighbor\n')
    if (operation === 'rename') { expect(read(root, newPath)).toBe('original output\n') }
    await expect(sync(root, current, true)).resolves.toBe(0)

    const cleanRoot = temporaryRoot()
    await sync(cleanRoot, new Map([...current].reverse()))
    expect(read(root, inventory)).toBe(read(cleanRoot, inventory))
    for (const path of current.keys()) { expect(read(root, path)).toBe(read(cleanRoot, path)) }
  })

  it.each([false, true])('preserves modified obsolete output and all planned mutations (check=%s)', async (check) => {
    const root = temporaryRoot()
    const unchangedStale = 'packages/ui-h5/src/safe-stale.ts'
    await sync(root, new Map([[unchangedStale, 'safe deletion\n'], [oldPath, 'generated\n'], [keptPath, 'previous\n']]))
    write(root, oldPath, 'local customization\n')
    write(root, authoredPath, 'authored neighbor\n')
    const inventoryBefore = read(root, inventory)

    await expect(sync(root, new Map([[keptPath, 'replacement\n'], [newPath, 'new\n']]), check))
      .rejects
      .toThrow(/Obsolete projection was locally modified/)
    expect(read(root, unchangedStale)).toBe('safe deletion\n')
    expect(read(root, oldPath)).toBe('local customization\n')
    expect(read(root, keptPath)).toBe('previous\n')
    expect(read(root, authoredPath)).toBe('authored neighbor\n')
    expect(read(root, inventory)).toBe(inventoryBefore)
    expect(existsSync(join(root, newPath))).toBe(false)
  })

  it('reports changed and missing projections without repairing them in check mode', async () => {
    const root = temporaryRoot()
    const files = new Map([[oldPath, 'first\n'], [keptPath, 'second\n']])
    await sync(root, files)
    write(root, oldPath, 'changed locally\n')
    rmSync(join(root, keptPath))
    const inventoryBefore = read(root, inventory)

    await expect(sync(root, files, true)).rejects.toThrow(oldPath)
    expect(read(root, oldPath)).toBe('changed locally\n')
    expect(existsSync(join(root, keptPath))).toBe(false)
    expect(read(root, inventory)).toBe(inventoryBefore)
    await sync(root, files)
    expect(read(root, oldPath)).toBe('first\n')
    expect(read(root, keptPath)).toBe('second\n')
  })

  it.each(['authored neighbor\n', 'generated replacement\n'])('does not claim a newly mapped authored file, even with matching bytes (%j)', async (authored) => {
    const root = temporaryRoot()
    await sync(root, new Map([[oldPath, 'stale\n'], [keptPath, 'previous\n']]))
    write(root, authoredPath, authored)
    const inventoryBefore = read(root, inventory)

    await expect(sync(root, new Map([[keptPath, 'replacement\n'], [authoredPath, 'generated replacement\n']])))
      .rejects
      .toThrow(/Unowned projection/)
    expect(read(root, oldPath)).toBe('stale\n')
    expect(read(root, keptPath)).toBe('previous\n')
    expect(read(root, authoredPath)).toBe(authored)
    expect(read(root, inventory)).toBe(inventoryBefore)
  })

  it('keeps other owners and authored renderer files outside deletion ownership', async () => {
    const root = temporaryRoot()
    const style = 'packages/ui-h5/src/style.css'
    const renderer = 'registry/components/example/h5.ts'
    await sync(root, new Map([[style, '.generated {}\n']]), false, 'styles')
    await sync(root, new Map([[keptPath, 'component\n']]))
    const inventoryBefore = read(root, inventory)
    write(root, renderer, 'authored renderer\n')
    await sync(root, new Map([[renderer, 'updated imports and authored renderer\n']]), false, 'component-styles')
    await sync(root, new Map(), false, 'component-styles')
    expect(read(root, renderer)).toBe('updated imports and authored renderer\n')
    expect(read(root, inventory)).toBe(inventoryBefore)

    await sync(root, new Map(), false, 'styles')
    expect(existsSync(join(root, style))).toBe(false)
    expect(read(root, keptPath)).toBe('component\n')
    expect(read(root, renderer)).toBe('updated imports and authored renderer\n')
    await expect(sync(root, new Map([[keptPath, 'component\n']]), true)).resolves.toBe(0)
  })

  it.each([
    '../outside.ts',
    '/absolute.ts',
    'C:\\outside.ts',
    'packages/ui-h5/src/../outside.ts',
    'packages/ui-h5/src//aliased.ts',
    'README.md',
    'packages/ui-h5/src/style.css',
  ])('rejects an unsafe or differently owned destination %s before mutation', async (unsafe) => {
    const root = temporaryRoot()
    await expect(sync(root, new Map([[keptPath, 'must not be written\n'], [unsafe, 'unsafe\n']])))
      .rejects
      .toThrow(/Invalid projection path|outside registry ownership/)
    expect(existsSync(join(root, keptPath))).toBe(false)
    expect(existsSync(join(root, inventory))).toBe(false)
  })

  it.each([
    ['packages/ui-h5/src/conflict', 'packages/ui-h5/src/conflict/child.ts'],
    ['packages/ui-h5/src/Case.ts', 'packages/ui-h5/src/case.ts'],
  ])('rejects conflicting planned paths %s and %s before mutation', async (first, second) => {
    const root = temporaryRoot()
    await expect(sync(root, new Map([[first, 'first\n'], [second, 'second\n']])))
      .rejects
      .toThrow(/Conflicting projection paths/)
    expect(existsSync(join(root, first))).toBe(false)
    expect(existsSync(join(root, second))).toBe(false)
    expect(existsSync(join(root, inventory))).toBe(false)
  })

  it.each(['../outside.ts', 'registry/components/authored.vue'])('rejects an unsafe previous ownership path %s before mutation', async (unsafe) => {
    const container = temporaryRoot()
    const root = join(container, 'project')
    mkdirSync(root)
    await sync(root, new Map([[oldPath, 'generated\n'], [keptPath, 'previous\n']]))
    write(container, 'outside.ts', 'generated\n')
    write(root, 'registry/components/authored.vue', 'generated\n')
    const metadata = JSON.parse(read(root, inventory))
    metadata.owners.registry[unsafe] = metadata.owners.registry[oldPath]
    write(root, inventory, `${JSON.stringify(metadata)}\n`)
    const inventoryBefore = read(root, inventory)

    await expect(sync(root, new Map([[keptPath, 'replacement\n']])))
      .rejects
      .toThrow(/Invalid projection path|outside registry ownership/)
    expect(read(container, 'outside.ts')).toBe('generated\n')
    expect(read(root, 'registry/components/authored.vue')).toBe('generated\n')
    expect(read(root, oldPath)).toBe('generated\n')
    expect(read(root, keptPath)).toBe('previous\n')
    expect(read(root, inventory)).toBe(inventoryBefore)
  })

  it.each(['destination', 'ancestor', 'obsolete', 'obsolete-ancestor', 'inventory'])('rejects a %s symlink without changing any output or external file', async (boundary) => {
    const root = temporaryRoot()
    const outside = temporaryRoot()
    const unsafePath = 'packages/ui-h5/src/nested/output.ts'
    await sync(root, new Map([[keptPath, 'previous\n'], [unsafePath, 'generated\n']]))
    write(outside, 'output.ts', 'external\n')
    let link: string
    const current = new Map([[keptPath, 'replacement\n']])
    if (boundary === 'inventory') {
      write(outside, 'inventory.json', read(root, inventory))
      link = join(root, inventory)
      rmSync(link)
      symlinkSync(join(outside, 'inventory.json'), link)
    }
    else if (boundary === 'ancestor' || boundary === 'obsolete-ancestor') {
      link = dirname(join(root, unsafePath))
      rmSync(link, { recursive: true })
      symlinkSync(outside, link, 'dir')
      if (boundary === 'ancestor') { current.set(unsafePath, 'replacement\n') }
    }
    else {
      link = join(root, unsafePath)
      rmSync(link)
      symlinkSync(join(outside, 'output.ts'), link)
      if (boundary === 'destination') { current.set(unsafePath, 'replacement\n') }
    }
    const inventoryBefore = read(root, inventory)

    await expect(sync(root, current)).rejects.toThrow(/symlink/)
    expect(read(root, keptPath)).toBe('previous\n')
    expect(read(outside, 'output.ts')).toBe('external\n')
    expect(lstatSync(link).isSymbolicLink()).toBe(true)
    expect(read(root, inventory)).toBe(inventoryBefore)
  })
})
