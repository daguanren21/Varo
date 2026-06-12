import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import MiniProgramBlocksGallery from './MiniProgramBlocksGallery.vue'

describe('MiniProgramBlocksGallery', () => {
  it('renders a catalog of reusable business blocks instead of a crowded gallery', () => {
    const wrapper = mount(MiniProgramBlocksGallery, {
      props: {
        locale: 'zh'
      }
    })

    const cards = wrapper.findAll('.varo-block-card')

    expect(cards.length).toBeGreaterThanOrEqual(9)
    expect(wrapper.text()).toContain('订单履约详情')
    expect(wrapper.text()).toContain('收货地址表单')
    expect(wrapper.text()).toContain('商品筛选抽屉')
    expect(wrapper.text()).toContain('支付确认面板')
    expect(wrapper.text()).toContain('生鲜到家首页')
    expect(wrapper.text()).toContain('会员权益中心')
    expect(wrapper.text()).toContain('SaaS 审批工作台')
    expect(wrapper.text()).toContain('门店补货看板')
    expect(wrapper.text()).toContain('账户安全设置')
    expect(wrapper.text()).not.toContain('Empty State')
    expect(wrapper.find('.varo-block-gallery').exists()).toBe(false)
    expect(wrapper.find('.varo-block-library-head').exists()).toBe(true)
    expect(wrapper.find('.varo-block-filter-strip').exists()).toBe(true)
    expect(wrapper.find('.varo-block-workspace').exists()).toBe(true)
    expect(wrapper.find('.varo-block-preview-panel').exists()).toBe(true)
    expect(wrapper.find('.varo-block-code-drawer').exists()).toBe(true)
  })

  it('shows copyable H5 and mini-program snippets for the active block', async () => {
    const writeText = vi.fn((text: string) => Promise.resolve(text))
    const clipboard = { writeText }

    vi.stubGlobal('navigator', { clipboard })

    const wrapper = mount(MiniProgramBlocksGallery, {
      props: {
        locale: 'zh'
      }
    })

    expect(wrapper.get('.varo-block-code-head').text()).toContain('H5')
    expect(wrapper.get('.varo-block-code-panel code').text()).toContain("from '@varo/ui-h5'")
    expect(wrapper.get('.varo-block-code-panel code').text()).toContain('<VNavbar')
    expect(wrapper.get('.varo-block-code-panel code').text()).not.toContain("from '@varo/ui-weapp'")

    const tabs = wrapper.findAll('.varo-block-code-tab')
    await tabs[1]!.trigger('click')

    expect(tabs[0]!.attributes('data-active')).toBe('false')
    expect(tabs[1]!.attributes('data-active')).toBe('true')
    expect(wrapper.get('.varo-block-code-head').text()).toContain('小程序')
    expect(wrapper.get('.varo-block-code-panel code').text()).toContain("from '@varo/ui-weapp'")
    expect(wrapper.get('.varo-block-code-panel code').text()).toContain('<VNavbar')
    expect(wrapper.get('.varo-block-code-panel code').text()).not.toContain("from '@varo/ui-h5'")

    const copyButton = wrapper.get('.varo-block-copy')

    expect(copyButton.attributes('aria-label')).toBe('复制小程序代码')
    expect(copyButton.text()).not.toContain('复制')
    expect(copyButton.get('.varo-block-copy-icon').exists()).toBe(true)

    await copyButton.trigger('click')

    expect(writeText).toHaveBeenCalledTimes(1)
    expect(writeText.mock.calls[0]![0]).toContain("from '@varo/ui-weapp'")

    vi.unstubAllGlobals()
  })

  it('resets to the default code tab and clears copied state when switching blocks', async () => {
    const writeText = vi.fn((text: string) => Promise.resolve(text))
    const clipboard = { writeText }

    vi.stubGlobal('navigator', { clipboard })

    const wrapper = mount(MiniProgramBlocksGallery, {
      props: {
        locale: 'zh'
      }
    })

    const tabs = wrapper.findAll('.varo-block-code-tab')
    await tabs[1]!.trigger('click')
    await wrapper.get('.varo-block-copy').trigger('click')

    expect(wrapper.get('.varo-block-copy').attributes('aria-label')).toBe('已复制')
    expect(wrapper.get('.varo-block-code-head').text()).toContain('小程序')

    await wrapper.findAll('.varo-block-card')[1]!.trigger('click')

    expect(wrapper.get('.varo-block-copy').attributes('aria-label')).toBe('复制H5代码')
    expect(wrapper.get('.varo-block-code-head').text()).toContain('H5')
    expect(wrapper.get('.varo-block-code-panel code').text()).toContain("from '@varo/ui-h5'")

    vi.unstubAllGlobals()
  })
})
