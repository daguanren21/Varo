import { readFileSync } from 'node:fs'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const docsRoot = resolve(__dirname, '..')
const configPath = resolve(docsRoot, '.vitepress/config.ts')

describe('docs navigation', () => {
  it('groups display layout components separately from navigation components', () => {
    const config = readFileSync(configPath, 'utf8')

    expect(config).toContain("text: '布局组件'")
    expect(config).toContain("text: '导航组件'")
    expect(config).toContain("{ text: 'Divider 分割线', link: '/components/divider' }")
    expect(config).toContain("{ text: 'Grid 宫格', link: '/components/grid' }")
    expect(config).toContain("{ text: 'Tabs 选项卡切换', link: '/components/tabs' }")
    expect(config).toContain("{ text: 'Menu 菜单', link: '/components/menu' }")
  })

  it('adds a primitives entry for interactive behavior primitives only', () => {
    const config = readFileSync(configPath, 'utf8')
    const primitiveZh = readFileSync(resolve(docsRoot, 'primitives/index.md'), 'utf8')
    const primitiveEn = readFileSync(resolve(docsRoot, 'en/primitives/index.md'), 'utf8')

    expect(config).toContain("{ text: 'Primitives', link: '/primitives/' }")
    expect(config).toContain("{ text: 'Primitives', link: '/en/primitives/' }")
    expect(primitiveZh).toContain('Dialog')
    expect(primitiveZh).toContain('Overlay')
    expect(primitiveZh).toContain('Popup')
    expect(primitiveZh).toContain('Sticky')
    expect(primitiveZh).not.toContain('Divider')
    expect(primitiveZh).not.toContain('Grid')
    expect(primitiveZh).not.toContain('Layout')
    expect(primitiveZh).not.toContain('Space')
    expect(primitiveEn).toContain('interactive or behavioral primitives')
  })

  it('lists form components and has matching zh/en pages', () => {
    const config = readFileSync(configPath, 'utf8')
    const components = [
      'calendar',
      'calendar-card',
      'cascader',
      'checkbox',
      'date-picker',
      'form',
      'input-number',
      'number-keyboard',
      'picker',
      'radio',
      'range',
      'rate',
      'searchbar',
      'short-password',
      'textarea',
      'uploader'
    ]

    expect(config).toContain("text: '表单组件'")
    expect(config).toContain("text: 'Form Components'")
    expect(config).toContain("'@varo/ui-h5/source/style.css'")

    components.forEach((name) => {
      expect(config).toContain(`/components/${name}`)
      expect(config).toContain(`/en/components/${name}`)
      expect(existsSync(resolve(docsRoot, `components/${name}.md`))).toBe(true)
      expect(existsSync(resolve(docsRoot, `en/components/${name}.md`))).toBe(true)
    })
  })

  it('documents the Base Kit Phase 1 scope and VSelect boundaries', () => {
    const config = readFileSync(configPath, 'utf8')
    const selectZh = readFileSync(resolve(docsRoot, 'components/select.md'), 'utf8')
    const selectEn = readFileSync(resolve(docsRoot, 'en/components/select.md'), 'utf8')
    const requiredPages = [
      'components/select.md',
      'components/switch.md',
      'components/loading.md',
      'components/toast.md',
      'en/components/select.md',
      'en/components/switch.md',
      'en/components/loading.md',
      'en/components/toast.md'
    ]

    ;[
      '/components/select',
      '/components/switch',
      '/components/loading',
      '/components/toast',
      '/en/components/select',
      '/en/components/switch',
      '/en/components/loading',
      '/en/components/toast'
    ].forEach((route) => {
      expect(config).toContain(route)
    })

    requiredPages.forEach((page) => {
      expect(existsSync(resolve(docsRoot, page))).toBe(true)
    })

    expect(selectZh).toContain('默认使用 `picker` 模式')
    expect(selectZh).toContain('分组、远程搜索、异步分页属于二次封装组件能力')
    expect(selectEn).toContain('uses `picker` mode by default')
    expect(selectEn).toContain('Grouped options, remote search, and async paging belong in secondary wrappers')
  })
})
