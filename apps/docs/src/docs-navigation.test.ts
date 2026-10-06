import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { componentCatalogItems, componentDocsRoute, createComponentSidebarGroups } from './component-catalog'

const docsRoot = resolve(__dirname, '..')
const workspaceRoot = resolve(docsRoot, '../..')

describe('docs navigation', () => {
  it('resolves every component sidebar link to a page in its selected locale', () => {
    for (const locale of ['zh', 'en'] as const) {
      const links = createComponentSidebarGroups(locale).flatMap(group => group.items)
      for (const item of componentCatalogItems) {
        const route = componentDocsRoute(item.id, locale)
        expect(links.some(link => link.link === route), route).toBe(true)
        expect(existsSync(resolve(docsRoot, `${route.slice(1)}.md`)), route).toBe(true)
      }
    }
  })

  it('keeps documented target availability aligned with Registry manifests', () => {
    const registryNameByDocsId: Record<string, string> = { 'calendar-card': 'calendar' }
    for (const item of componentCatalogItems) {
      const registryName = registryNameByDocsId[item.id] ?? item.id
      const manifest = JSON.parse(
        readFileSync(resolve(workspaceRoot, `registry/components/${registryName}/registry.json`), 'utf8'),
      ) as { targets: string[], platforms?: string[] }
      expect(item.targets, item.id).toEqual(manifest.targets)
      expect(item.platforms, item.id).toEqual([...manifest.targets, ...manifest.platforms ?? []])
    }
  })
})
