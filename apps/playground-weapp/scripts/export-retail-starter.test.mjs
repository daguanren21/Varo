import assert from 'node:assert/strict'
import { lstat, mkdir, mkdtemp, readdir, readFile, readlink, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { it } from 'vitest'
import { exportRetailStarter } from './export-retail-starter.mjs'

async function sandbox(t) {
  const directory = await mkdtemp(resolve(tmpdir(), 'varo-export-contract-'))
  t.onTestFinished(() => rm(directory, { recursive: true, force: true }))
  return directory
}

it('occupied destination preserves existing nested files and directory identity', async (t) => {
  const root = await sandbox(t)
  const destination = resolve(root, 'retail')
  await mkdir(resolve(destination, 'customer-data'), { recursive: true })
  const sentinel = resolve(destination, 'customer-data/orders.json')
  const content = '[{"id":"existing-order","amount":1200}]\n'
  await writeFile(sentinel, content)
  const before = await lstat(destination)

  await assert.rejects(exportRetailStarter(destination), /Destination is occupied/)

  assert.equal(await readFile(sentinel, 'utf8'), content)
  assert.deepEqual(await readdir(destination), ['customer-data'])
  assert.equal((await lstat(destination)).ino, before.ino)
  assert.deepEqual(await readdir(root), ['retail'])
})

it('a hidden environment file makes an otherwise empty destination occupied', async (t) => {
  const root = await sandbox(t)
  const destination = resolve(root, 'retail')
  await mkdir(destination)
  await writeFile(resolve(destination, '.env.local'), 'LOCAL_SETTING=preserve\n')

  await assert.rejects(exportRetailStarter(destination), /Destination is occupied/)

  assert.equal(await readFile(resolve(destination, '.env.local'), 'utf8'), 'LOCAL_SETTING=preserve\n')
  assert.deepEqual(await readdir(destination), ['.env.local'])
})

it('a file destination is never replaced with a directory', async (t) => {
  const root = await sandbox(t)
  const destination = resolve(root, 'retail')
  await writeFile(destination, 'existing file\n')

  await assert.rejects(exportRetailStarter(destination), /never a file or symlink/)

  assert.equal(await readFile(destination, 'utf8'), 'existing file\n')
  assert.equal((await lstat(destination)).isFile(), true)
})

it('a symlink to an empty directory is rejected without following or replacing it', async (t) => {
  const root = await sandbox(t)
  const target = resolve(root, 'owned-directory')
  const destination = resolve(root, 'retail')
  await mkdir(target)
  await symlink(target, destination, 'dir')

  await assert.rejects(exportRetailStarter(destination), /never a file or symlink/)

  assert.equal(await readlink(destination), target)
  assert.deepEqual(await readdir(target), [])
  assert.deepEqual((await readdir(root)).sort(), ['owned-directory', 'retail'])
})

it('a dangling destination symlink is not treated as a new destination', async (t) => {
  const root = await sandbox(t)
  const target = resolve(root, 'missing-directory')
  const destination = resolve(root, 'retail')
  await symlink(target, destination, 'dir')

  await assert.rejects(exportRetailStarter(destination), /never a file or symlink/)

  assert.equal(await readlink(destination), target)
  assert.deepEqual(await readdir(root), ['retail'])
})

it('an unsupported framework never falls back to publishing a different project', async (t) => {
  const root = await sandbox(t)

  await assert.rejects(exportRetailStarter(resolve(root, 'retail'), { framework: 'flutter' }), /Unsupported framework: flutter/)

  assert.deepEqual(await readdir(root), [])
})

it('Taro selection rejects occupied and symlink destinations before creating staging files', async (t) => {
  const root = await sandbox(t)
  const occupied = resolve(root, 'occupied')
  const linked = resolve(root, 'linked')
  await mkdir(occupied)
  await writeFile(resolve(occupied, '.env.local'), 'KEEP_THIS_SETTING=1\n')
  await symlink(occupied, linked, 'dir')
  await assert.rejects(exportRetailStarter(occupied, { framework: 'taro' }), /Destination is occupied/)
  await assert.rejects(exportRetailStarter(linked, { framework: 'taro' }), /never a file or symlink/)
  assert.equal(await readFile(resolve(occupied, '.env.local'), 'utf8'), 'KEEP_THIS_SETTING=1\n')
  assert.equal(await readlink(linked), occupied)
  assert.deepEqual((await readdir(root)).sort(), ['linked', 'occupied'])
})
