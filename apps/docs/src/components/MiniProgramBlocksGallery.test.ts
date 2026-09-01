import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import MiniProgramBlocksGallery from './MiniProgramBlocksGallery.vue'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('MiniProgramBlocksGallery', () => {
  it('renders every registry Block as a screenshot card', () => {
    const wrapper = mount(MiniProgramBlocksGallery, { props: { locale: 'zh' } })
    const cards = wrapper.findAll('.varo-block-card')

    expect(cards).toHaveLength(13)
    expect(wrapper.find('table').exists()).toBe(false)
    expect(wrapper.text()).toContain('登录表单')
    expect(wrapper.text()).toContain('Agent 对话')
    expect(wrapper.text()).toContain('零售首页')
    expect(wrapper.text()).toContain('会员中心')
    expect(wrapper.findAll('.varo-block-card__preview img')).toHaveLength(13)
    expect(cards[0].get('img').attributes('src')).toContain('/blocks/login-form.png')
  })

  it('filters screenshot cards by category and search text', async () => {
    const wrapper = mount(MiniProgramBlocksGallery, { props: { locale: 'zh' } })
    const retailFilter = wrapper.findAll('.varo-block-gallery__filters button')
      .find(button => button.text() === '零售')

    await retailFilter?.trigger('click')
    expect(wrapper.findAll('.varo-block-card')).toHaveLength(7)

    await wrapper.get('input[type="search"]').setValue('retail-cart')
    expect(wrapper.findAll('.varo-block-card')).toHaveLength(1)
    expect(wrapper.get('.varo-block-card').attributes('data-block')).toBe('retail-cart')
  })

  it('expands usage, switches target, and copies the exact install command', async () => {
    const writeText = vi.fn((text: string) => Promise.resolve(text))
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    const wrapper = mount(MiniProgramBlocksGallery, { props: { locale: 'zh' } })
    const card = wrapper.get('[data-block=\"login-form\"]')

    expect(card.get('.varo-block-card__command code').text()).toContain(
      'add --target weapp blocks/login-form',
    )
    expect(card.get('summary').text()).toContain('查看代码与使用方法')
    expect(card.get('pre code').text()).toContain('from \'@/components/blocks/login-form.vue\'')

    await card.findAll('.varo-block-card__target-tabs button')[1].trigger('click')
    expect(card.get('.varo-block-card__command code').text()).toContain(
      'add --target h5 blocks/login-form',
    )

    await card.get('.varo-block-card__command button').trigger('click')
    expect(writeText).toHaveBeenCalledWith(
      'pnpm dlx @varo-ui/cli add --target h5 blocks/login-form',
    )
    expect(card.get('.varo-block-card__command button').text()).toBe('已复制')
  })
})
