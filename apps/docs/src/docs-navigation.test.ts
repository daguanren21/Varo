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
})
