import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import MiniProgramBlocksGallery from './MiniProgramBlocksGallery.vue'

describe('MiniProgramBlocksGallery', () => {
  it('renders only registry-backed dual-target blocks', () => {
    const wrapper = mount(MiniProgramBlocksGallery, { props: { locale: 'zh' } })
    const catalog = wrapper.findAll('.varo-real-blocks__catalog button')

    expect(catalog).toHaveLength(6)
    expect(wrapper.text()).toContain('登录表单')
    expect(wrapper.text()).toContain('用户资料卡')
    expect(wrapper.text()).toContain('资料编辑')
    expect(wrapper.text()).toContain('商品列表')
    expect(wrapper.text()).toContain('订单筛选')
    expect(wrapper.text()).toContain('Agent 对话')
    expect(wrapper.text()).not.toContain('VNavbar')
    expect(wrapper.text()).not.toContain('订单履约详情')
    expect(wrapper.get('.varo-real-blocks__detail-head strong').text()).toBe('weapp-vite')
  })

  it('switches targets and copies the exact CLI command', async () => {
    const writeText = vi.fn((text: string) => Promise.resolve(text))
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    const wrapper = mount(MiniProgramBlocksGallery, { props: { locale: 'zh' } })

    expect(wrapper.get('.varo-real-blocks__command code').text()).toContain(
      'add --target weapp-vite blocks/login-form',
    )

    await wrapper.findAll('.varo-real-blocks__targets button')[1].trigger('click')
    expect(wrapper.get('.varo-real-blocks__detail-head strong').text()).toBe('h5')
    expect(wrapper.get('.varo-real-blocks__command code').text()).toContain('add --target h5 blocks/login-form')

    await wrapper.get('.varo-real-blocks__command button').trigger('click')
    expect(writeText).toHaveBeenCalledWith('pnpm dlx @varo-ui/cli add --target h5 blocks/login-form')
    expect(wrapper.get('.varo-real-blocks__command button').text()).toBe('已复制')
    vi.unstubAllGlobals()
  })

  it('keeps the selected target while changing the active block', async () => {
    const wrapper = mount(MiniProgramBlocksGallery, { props: { locale: 'en' } })
    await wrapper.findAll('.varo-real-blocks__targets button')[1].trigger('click')
    await wrapper.findAll('.varo-real-blocks__catalog button')[3].trigger('click')

    expect(wrapper.get('.varo-real-blocks__detail-head h3').text()).toBe('Product List')
    expect(wrapper.get('.varo-real-blocks__command code').text()).toContain('add --target h5 blocks/product-list')
    expect(wrapper.get('pre code').text()).toContain('from \'@/components/blocks/product-list.vue\'')
  })
})
