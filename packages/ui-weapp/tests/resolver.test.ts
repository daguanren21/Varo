// @vitest-environment node

import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { buildTestArtifact } from 'weapp-vite/test'
import { VaroResolver } from '../src/resolver'

const packageRoot = resolve(__dirname, '..')

let projectRoot: string | undefined

function writeComponent(relativePath: string): string {
  const path = join(projectRoot!, 'src/components/ui', relativePath)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, '<template><view /></template>\n')
  return path
}

afterEach(() => {
  if (projectRoot) {
    rmSync(projectRoot, { force: true, recursive: true })
    projectRoot = undefined
  }
})

describe('VaroResolver', () => {
  it('registers copied Varo SFCs and resolves Pascal or kebab template names', () => {
    projectRoot = mkdtempSync(join(tmpdir(), 'varo-resolver-'))
    const buttonPath = writeComponent('VButton.vue')
    const checkboxGroupPath = writeComponent('v-checkbox-group.vue')
    const inputPath = writeComponent('forms/vInput.vue')
    writeComponent('Helper.vue')

    const resolver = VaroResolver({ root: projectRoot })

    expect(resolver.componentLookupStrategy).toBe('runtime')
    expect(resolver.supportFilesStrategy).toBe('used')
    expect(resolver.components).toEqual({
      'v-button': '/components/ui/VButton',
      'v-checkbox-group': '/components/ui/v-checkbox-group',
      'v-input': '/components/ui/forms/vInput',
    })
    expect(resolver.resolve?.('VButton', 'pages/index/index')).toEqual({
      name: 'VButton',
      from: '/components/ui/VButton',
      resolvedId: buttonPath,
      sourceType: 'wevu-sfc',
      typeImport: true,
    })
    expect(resolver.resolve?.('v-checkbox-group', 'pages/index/index')).toMatchObject({
      from: '/components/ui/v-checkbox-group',
      resolvedId: checkboxGroupPath,
    })
    expect(resolver.resolve?.('VInput', 'pages/index/index')).toMatchObject({
      from: '/components/ui/forms/vInput',
      resolvedId: inputPath,
    })
    expect(resolver.resolve?.('VSelect', 'pages/index/index')).toBeUndefined()
  })

  it('supports full IDE metadata without changing runtime resolution', () => {
    projectRoot = mkdtempSync(join(tmpdir(), 'varo-resolver-'))
    writeComponent('VTag.vue')

    const resolver = VaroResolver({ root: projectRoot, supportFilesStrategy: 'full' })

    expect(resolver.supportFilesStrategy).toBe('full')
    expect(resolver.resolve?.('VTag', 'pages/index/index')?.from).toBe('/components/ui/VTag')
  })

  it('rejects component directories outside sourceRoot', () => {
    projectRoot = mkdtempSync(join(tmpdir(), 'varo-resolver-'))

    expect(() => VaroResolver({
      componentsDir: '../external-components',
      root: projectRoot,
    })).toThrow(/componentsDir must stay inside sourceRoot/)
  })

  it('rejects duplicate Pascal and kebab filenames for one public tag', () => {
    projectRoot = mkdtempSync(join(tmpdir(), 'varo-resolver-'))
    writeComponent('VButton.vue')
    writeComponent('v-button.vue')

    expect(() => VaroResolver({ root: projectRoot })).toThrow(
      /component name collision for "v-button"/,
    )
  })
})

it('emits referenced Registry SFCs without promoting unused candidates to entries', async () => {
  const fixturesRoot = join(packageRoot, '.tmp')
  mkdirSync(fixturesRoot, { recursive: true })
  projectRoot = mkdtempSync(join(fixturesRoot, 'varo-resolver-integration-'))

  writeFileSync(
    join(projectRoot, 'package.json'),
    JSON.stringify({ name: 'varo-resolver-integration', private: true, type: 'module' }),
  )
  writeFileSync(
    join(projectRoot, 'project.config.json'),
    JSON.stringify({
      appid: '',
      compileType: 'miniprogram',
      miniprogramRoot: 'dist/',
      projectname: 'varo-resolver-integration',
    }),
  )
  mkdirSync(join(projectRoot, 'src/pages/index'), { recursive: true })
  writeFileSync(
    join(projectRoot, 'src/app.vue'),
    `<script setup lang="ts">
defineAppJson({ pages: ['pages/index/index'] })
</script>
`,
  )
  writeFileSync(
    join(projectRoot, 'src/pages/index/index.vue'),
    `<script setup lang="ts">
definePageJson({ navigationBarTitleText: 'Resolver' })
</script>

<template>
  <view><VButton /></view>
</template>
`,
  )
  writeComponent('v-button.vue')
  writeComponent('VUnused.vue')
  writeFileSync(
    join(projectRoot, 'vite.config.ts'),
    `import { defineConfig } from 'weapp-vite/config'
import { VaroResolver } from '../../src/resolver'

const root = import.meta.dirname

export default defineConfig({
  build: { outDir: 'dist' },
  weapp: {
    autoImportComponents: {
      resolvers: [VaroResolver({ root })],
    },
    platform: 'weapp',
    srcRoot: 'src',
  },
})
`,
  )

  const artifact = await buildTestArtifact({
    configFile: join(projectRoot, 'vite.config.ts'),
    cwd: projectRoot,
    outDir: 'dist',
    skipNpm: true,
  })
  const pageJson = JSON.parse(
    readFileSync(join(artifact.miniprogramRootPath, 'pages/index/index.json'), 'utf8'),
  ) as { usingComponents?: Record<string, string> }

  expect(pageJson.usingComponents?.['v-button']).toBe('/components/ui/v-button')
  expect(existsSync(join(artifact.miniprogramRootPath, 'components/ui/v-button.js'))).toBe(true)
  expect(existsSync(join(artifact.miniprogramRootPath, 'components/ui/v-button.json'))).toBe(true)
  expect(existsSync(join(artifact.miniprogramRootPath, 'components/ui/v-button.wxml'))).toBe(true)
  expect(existsSync(join(artifact.miniprogramRootPath, 'components/ui/VUnused.js'))).toBe(false)
})
