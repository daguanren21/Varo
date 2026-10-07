import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import MiniProgramBlocksGallery from './MiniProgramBlocksGallery.vue'

beforeEach(() => {
  window.history.replaceState(null, '', '/examples/')
})

afterEach(() => {
  vi.unstubAllGlobals()
  window.history.replaceState(null, '', '/')
})

describe('MiniProgramBlocksGallery', () => {
  it('filters screenshot cards by category and search text', async () => {
    const wrapper = mount(MiniProgramBlocksGallery, { props: { locale: 'zh' } })
    const retailFilter = wrapper.findAll('.varo-block-gallery__filters button')
      .find(button => button.text() === '零售')

    await retailFilter?.trigger('click')
    expect(wrapper.findAll('.varo-block-card')).toHaveLength(7)

    await wrapper.get('input[type="search"]').setValue('retail-cart')
    expect(wrapper.findAll('.varo-block-card')).toHaveLength(1)
    expect(wrapper.get('.varo-block-card').attributes('data-block')).toBe('retail-cart')
    const params = new URL(window.location.href).searchParams
    expect(params.get('category')).toBe('retail')
    expect(params.get('q')).toBe('retail-cart')
  })

  it('restores shareable gallery filters and the selected Block target from the URL', async () => {
    window.history.replaceState(
      null,
      '',
      '/examples/?q=login-form&category=business&block=login-form&target=h5',
    )
    const wrapper = mount(MiniProgramBlocksGallery, { props: { locale: 'en' } })
    await flushPromises()
    const filters = wrapper.get('.varo-block-gallery__filters')
    const business = filters.findAll('button').find(button => button.text() === 'Business')
    const card = wrapper.get('[data-block="login-form"]')

    expect(filters.attributes('role')).toBe('group')
    expect(business?.attributes('aria-pressed')).toBe('true')
    expect((wrapper.get('input[type="search"]').element as HTMLInputElement).value).toBe('login-form')
    expect(wrapper.findAll('.varo-block-card')).toHaveLength(1)
    expect(card.attributes('data-target')).toBe('h5')
    expect(card.get('.varo-block-card__command code').text()).toContain(
      'add --target h5 blocks/login-form',
    )
  })

  it('expands usage, switches target, and copies the exact install command', async () => {
    const writeText = vi.fn((text: string) => Promise.resolve(text))
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    const wrapper = mount(MiniProgramBlocksGallery, { props: { locale: 'zh' } })
    const card = wrapper.get('[data-block=\"login-form\"]')

    expect(card.get('.varo-block-card__command code').text()).toContain(
      'add --target weapp blocks/login-form',
    )

    const targetGroup = card.get('.varo-block-card__target-tabs')
    expect(targetGroup.attributes('role')).toBe('group')
    expect(targetGroup.findAll('button')[0]!.attributes('aria-pressed')).toBe('true')

    await targetGroup.findAll('button')[1]!.trigger('click')
    expect(card.get('.varo-block-card__command code').text()).toContain(
      'add --target h5 blocks/login-form',
    )
    expect(card.attributes('data-target')).toBe('h5')
    expect(card.findAll('.varo-block-card__target-tabs button')[1]!.attributes('aria-pressed')).toBe('true')
    const params = new URL(window.location.href).searchParams
    expect(params.get('block')).toBe('login-form')
    expect(params.get('target')).toBe('h5')

    await card.get('.varo-block-card__command button').trigger('click')
    expect(writeText).toHaveBeenCalledWith(
      'pnpm dlx @varo-ui/cli add --target h5 blocks/login-form',
    )
  })
})
