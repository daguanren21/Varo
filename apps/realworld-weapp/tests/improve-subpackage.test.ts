import { access } from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const srcRoot = path.resolve(import.meta.dirname, '../src')
const componentNames = [
  'ascriptionInfo',
  'basicInfo',
  'deployInfo',
  'openInfo',
  'partsInfo',
]

describe('improve subpackage ownership', () => {
  it('keeps improve-only components inside the improvePages root', async () => {
    await expect(Promise.all(componentNames.map(name => access(path.join(
      srcRoot,
      'improvePages/improveDeviceInfo/components',
      name,
      'index.vue',
    ))))).resolves.toHaveLength(componentNames.length)
    await expect(access(path.join(srcRoot, 'components/improveDeviceInfo'))).rejects.toMatchObject({
      code: 'ENOENT',
    })
  })
})
