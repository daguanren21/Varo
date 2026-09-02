import type { ThemeConfig } from '@varo-ui/theme'
import type { Plugin } from 'vue'
import { createTheme, VaroConfigProvider } from '@varo-ui/theme'
import { VCalendar as WeappCalendar } from '@varo-ui/weapp'
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import FormComponentDemo from './FormComponentDemo.vue'

const themeConfig: ThemeConfig = {
  theme: createTheme({
    primary: '#2563eb',
    success: '#16a34a',
    warning: '#d97706',
    error: '#dc2626',
    neutral: '#0f172a',
  }),
}
const themePlugin: [Plugin, ThemeConfig] = [VaroConfigProvider, themeConfig]

describe('FormComponentDemo', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('expands one active code sample and switches between H5 and mini-program code', async () => {
    const writeText = vi.fn((text: string) => Promise.resolve(text))
    vi.stubGlobal('navigator', { clipboard: { writeText } })

    const wrapper = mount(FormComponentDemo, {
      global: {
        plugins: [themePlugin],
      },
      props: {
        example: 'picker',
        locale: 'zh',
      },
    })

    expect(wrapper.find('.form-demo__code').exists()).toBe(false)
    const toggle = wrapper.get('.form-demo__code-toggle')
    expect(toggle.attributes('aria-label')).toBe('展开代码')
    expect(toggle.text()).toContain('展开代码')

    await toggle.trigger('click')
    const code = wrapper.get('.form-demo__code')
    const tabs = code.findAll('.form-demo__tab')

    expect(toggle.attributes('aria-label')).toBe('收起代码')
    expect(toggle.text()).toContain('收起代码')
    expect(tabs).toHaveLength(2)
    expect(tabs[0]!.attributes('data-active')).toBe('true')
    expect(code.get('code').text()).toContain('from \'@varo-ui/h5\'')
    expect(code.get('code').text()).not.toContain('from \'@varo-ui/weapp\'')

    const copyButton = code.get('.form-demo__code-copy')
    expect(copyButton.attributes('aria-label')).toBe('复制 H5 代码')

    await tabs[1]!.trigger('click')

    expect(tabs[0]!.attributes('data-active')).toBe('false')
    expect(tabs[1]!.attributes('data-active')).toBe('true')
    expect(code.get('code').text()).toContain('from \'@varo-ui/weapp\'')
    expect(code.get('code').text()).not.toContain('from \'@varo-ui/h5\'')
    expect(code.get('code').text()).toContain('from \'wevu\'')
    expect(code.get('code').text()).not.toContain('from \'vue\'')
    expect(copyButton.attributes('aria-label')).toBe('复制小程序代码')

    await copyButton.trigger('click')
    await flushPromises()

    expect(writeText).toHaveBeenCalledTimes(1)
    expect(writeText.mock.calls[0]![0]).toContain('from \'@varo-ui/weapp\'')
    expect(copyButton.attributes('aria-label')).toBe('已复制')
    expect(code.get('.form-demo__code-toast').text()).toContain('已复制到剪贴板')

    await tabs[0]!.trigger('click')
    expect(copyButton.attributes('aria-label')).toBe('复制 H5 代码')
    expect(code.find('.form-demo__code-toast').exists()).toBe(false)
  })

  it('turns Picker into a delivery-window flow with controlled visibility', async () => {
    const wrapper = mount(FormComponentDemo, {
      global: {
        plugins: [themePlugin],
      },
      props: {
        example: 'picker',
        locale: 'zh',
      },
    })

    expect(wrapper.find('.varo-picker').exists()).toBe(true)
    expect(wrapper.get('.form-demo__context-head').text()).toContain('配送时段')
    await wrapper.findAll('.varo-picker__option')[1]!.trigger('click')
    await wrapper.get('.varo-picker__confirm').trigger('click')
    await flushPromises()

    expect(wrapper.find('.varo-picker').exists()).toBe(false)
    expect(wrapper.get('.form-demo__selection-result').text()).toContain('下午 · 13:00–17:00')

    await wrapper.get('.form-demo__selection-result .varo-button').trigger('click')
    expect(wrapper.find('.varo-picker').exists()).toBe(true)
  })
  it('turns Calendar into a constrained booking flow with confirmation feedback', async () => {
    const wrapper = mount(FormComponentDemo, {
      global: {
        plugins: [themePlugin],
      },
      props: {
        example: 'calendar',
        locale: 'zh',
      },
    })

    expect(wrapper.get('.form-demo__context-head').text()).toContain('预约服务')
    expect(wrapper.get('.form-demo__context-head').text()).toContain('2026-05-14')
    expect(wrapper.find('.varo-calendar').exists()).toBe(true)
    const runtimeTabs = wrapper.findAll('.form-demo__platform-switch [role="tab"]')
    expect(runtimeTabs).toHaveLength(2)
    expect(wrapper.get('.form-demo__stage').attributes('data-platform')).toBe('h5')
    await runtimeTabs[1]!.trigger('click')
    expect(wrapper.get('.form-demo__stage').attributes('data-platform')).toBe('weapp')
    expect(wrapper.findComponent(WeappCalendar).exists()).toBe(true)

    await wrapper.get('.varo-calendar__confirm').trigger('click')
    await flushPromises()

    expect(wrapper.find('.varo-calendar').exists()).toBe(false)
    expect(wrapper.get('.form-demo__selection-result').attributes('role')).toBe('status')
    expect(wrapper.get('.form-demo__selection-result').text()).toContain('预约日期已确认')
    expect(wrapper.get('.form-demo__selection-result').text()).toContain('2026-05-14')

    await wrapper.get('.form-demo__selection-result .varo-button').trigger('click')
    expect(wrapper.find('.varo-calendar').exists()).toBe(true)
  })
  it('presents CalendarCard as an inline delivery-date selector', async () => {
    const wrapper = mount(FormComponentDemo, {
      global: {
        plugins: [themePlugin],
      },
      props: {
        example: 'calendar-card',
        locale: 'zh',
      },
    })

    expect(wrapper.get('.form-demo__calendar-card-scenario').text()).toContain('选择配送日期')
    expect(wrapper.get('.form-demo__context-head').text()).toContain('预计送达')
    expect(wrapper.get('.form-demo__context-head').text()).toContain('2026-05-14')

    await wrapper.get('[data-date="2026-05-20"]').trigger('click')
    expect(wrapper.get('.form-demo__context-head').text()).toContain('2026-05-20')
  })
  it('turns Cascader into a delivery-region flow with a persistent result', async () => {
    const wrapper = mount(FormComponentDemo, {
      global: {
        plugins: [themePlugin],
      },
      props: {
        example: 'cascader',
        locale: 'zh',
      },
    })

    expect(wrapper.get('.form-demo__context-head').text()).toContain('配送地区')
    expect(wrapper.get('.varo-cascader__title').text()).toBe('选择城市')
    await wrapper.get('.varo-cascader__option').trigger('click')
    await wrapper.get('.varo-cascader__confirm').trigger('click')
    await flushPromises()

    expect(wrapper.find('.varo-cascader').exists()).toBe(false)
    expect(wrapper.get('.form-demo__selection-result').text()).toContain('浙江 / 杭州')

    await wrapper.get('.form-demo__selection-result .varo-button').trigger('click')
    expect(wrapper.find('.varo-cascader').exists()).toBe(true)
  })
  it('presents Checkbox as a bounded notification-channel choice', async () => {
    const wrapper = mount(FormComponentDemo, {
      global: {
        plugins: [themePlugin],
      },
      props: {
        example: 'checkbox',
        locale: 'zh',
      },
    })

    const choices = wrapper.findAll('.varo-checkbox')
    expect(choices).toHaveLength(3)
    expect(wrapper.get('.form-demo__control-head').text()).toContain('最多选择两种')
    expect(wrapper.get('.form-demo__control-head output').text()).toContain('1/2')

    await choices[1]!.trigger('click')
    expect(wrapper.get('.form-demo__control-head output').text()).toContain('2/2')
    await choices[2]!.trigger('click')

    expect(choices[0]!.attributes('data-state')).toBe('checked')
    expect(choices[1]!.attributes('data-state')).toBe('checked')
    expect(choices[2]!.attributes('data-state')).toBe('unchecked')
    expect(wrapper.get('.form-demo__control-head output').text()).toContain('2/2')
  })
  it('presents DatePicker as an invoice-date confirmation flow', async () => {
    const wrapper = mount(FormComponentDemo, {
      global: {
        plugins: [themePlugin],
      },
      props: {
        example: 'date-picker',
        locale: 'zh',
      },
    })

    expect(wrapper.get('.form-demo__context-head').text()).toContain('发票日期')
    await wrapper.get('[data-date="2026-05-18"]').trigger('click')
    await wrapper.get('.varo-date-picker__confirm').trigger('click')
    await flushPromises()

    expect(wrapper.find('.varo-date-picker').exists()).toBe(false)
    expect(wrapper.get('.form-demo__selection-result').text()).toContain('已选择开票日期')
    expect(wrapper.get('.form-demo__selection-result').text()).toContain('2026-05-18')

    await wrapper.get('.form-demo__selection-result .varo-button').trigger('click')
    expect(wrapper.find('.varo-date-picker').exists()).toBe(true)
  })

  it('shows a full form example with change validation and save errors', async () => {
    const wrapper = mount(FormComponentDemo, {
      global: {
        plugins: [themePlugin],
      },
      props: {
        example: 'form',
        locale: 'zh',
      },
    })
    expect(wrapper.get('.form-demo__form-intro').text()).toContain('提交合作需求')
    expect(wrapper.findAll('.form-demo__form-section-title')).toHaveLength(3)
    expect(wrapper.findAll('.form-demo__form-field--wide').length).toBeGreaterThanOrEqual(4)

    expect(wrapper.findAll('.varo-form-item').length).toBeGreaterThanOrEqual(8)
    expect(wrapper.find('.varo-checkbox-group').exists()).toBe(true)
    expect(wrapper.find('.varo-radio-group').exists()).toBe(true)
    expect(wrapper.find('.varo-input-number').exists()).toBe(true)
    expect(wrapper.find('.varo-rate').exists()).toBe(true)
    expect(wrapper.find('.varo-short-password').exists()).toBe(true)
    expect(wrapper.find('.varo-uploader').exists()).toBe(true)
    expect(wrapper.find('.form-demo__submit.varo-button').exists()).toBe(true)
    expect(wrapper.get('.form-demo__submit').attributes('form')).toBe(wrapper.get('.form-demo__save').attributes('id'))

    await wrapper.findAll('input')[0]!.setValue('A')
    await flushPromises()

    expect(wrapper.find('.varo-form-item__error').text()).toContain('商户名称')

    await wrapper.get('.form-demo__save').trigger('submit')
    await flushPromises()

    expect(wrapper.findAll('.varo-form-item__error').length).toBeGreaterThanOrEqual(4)
    expect(wrapper.get('.form-demo__form-status').text()).toContain('保存失败')
  })
  it('presents InputNumber as a bounded seat purchase with live subtotal', async () => {
    const wrapper = mount(FormComponentDemo, {
      global: {
        plugins: [themePlugin],
      },
      props: {
        example: 'input-number',
        locale: 'zh',
      },
    })

    expect(wrapper.get('.form-demo__control-head').text()).toContain('购买席位')
    expect(wrapper.get('.form-demo__control-head output').text()).toContain('¥78')

    await wrapper.get('.varo-input-number__plus').trigger('click')
    expect(wrapper.get('.form-demo__control-head output').text()).toContain('¥117')
    expect(wrapper.get<HTMLInputElement>('.varo-input-number__input').element.value).toBe('3')
  })
  it('turns NumberKeyboard into an amount entry flow with delete and confirmation', async () => {
    const wrapper = mount(FormComponentDemo, {
      global: {
        plugins: [themePlugin],
      },
      props: {
        example: 'number-keyboard',
        locale: 'zh',
      },
    })

    expect(wrapper.get('.form-demo__amount-display').text()).toContain('¥128')
    await wrapper.get('[data-key="."]').trigger('click')
    await wrapper.get('[data-key="5"]').trigger('click')
    expect(wrapper.get('.form-demo__amount-display').text()).toContain('¥128.5')

    await wrapper.get('.varo-number-keyboard__delete').trigger('click')
    expect(wrapper.get('.form-demo__amount-display').text()).toContain('¥128.')
    await wrapper.get('.varo-number-keyboard__close').trigger('click')
    await flushPromises()

    expect(wrapper.find('.varo-number-keyboard').exists()).toBe(false)
    expect(wrapper.get('.form-demo__selection-result').text()).toContain('¥128.')
    await wrapper.get('.form-demo__selection-result .varo-button').trigger('click')
    expect(wrapper.find('.varo-number-keyboard').exists()).toBe(true)
  })
  it('presents Radio as a payment-method decision with visible selection', async () => {
    const wrapper = mount(FormComponentDemo, {
      global: {
        plugins: [themePlugin],
      },
      props: {
        example: 'radio',
        locale: 'zh',
      },
    })

    const options = wrapper.findAll('.varo-radio')
    expect(options).toHaveLength(3)
    expect(wrapper.get('.form-demo__control-head').text()).toContain('订单 #1042')
    expect(wrapper.get('.form-demo__inline-result').text()).toContain('微信支付')

    await options[1]!.trigger('click')
    expect(options[1]!.attributes('aria-checked')).toBe('true')
    expect(wrapper.get('.form-demo__inline-result').text()).toContain('支付宝')
  })
  it('presents Range as an accessible campaign-budget allocator', async () => {
    const wrapper = mount(FormComponentDemo, {
      global: {
        plugins: [themePlugin],
      },
      props: {
        example: 'range',
        locale: 'zh',
      },
    })

    const input = wrapper.get<HTMLInputElement>('.varo-range__input')
    expect(input.attributes('aria-label')).toBe('月度推广预算')
    expect(wrapper.get('.form-demo__control-head output').text()).toContain('¥4000')

    await input.setValue('70')
    expect(wrapper.get('.form-demo__control-head output').text()).toContain('¥7000')
  })
  it('presents Rate as an accessible delivery review with live feedback', async () => {
    const wrapper = mount(FormComponentDemo, {
      global: {
        plugins: [themePlugin],
      },
      props: {
        example: 'rate',
        locale: 'zh',
      },
    })

    const rate = wrapper.get('.varo-rate')
    const stars = wrapper.findAll('.varo-rate__item')
    expect(rate.attributes('aria-label')).toBe('服务评分')
    expect(stars).toHaveLength(5)
    expect(wrapper.get('.form-demo__rate-field [role="status"]').text()).toBe('不错')

    await stars[4]!.trigger('click')
    expect(wrapper.get('.form-demo__control-head output').text()).toBe('5/5')
    expect(wrapper.get('.form-demo__rate-field [role="status"]').text()).toBe('超出预期')
  })
  it('presents Searchbar as an accessible component finder with live results', async () => {
    const wrapper = mount(FormComponentDemo, {
      global: {
        plugins: [themePlugin],
      },
      props: {
        example: 'searchbar',
        locale: 'zh',
      },
    })

    const input = wrapper.get<HTMLInputElement>('.varo-input__control')
    expect(input.attributes('aria-label')).toBe('搜索组件')
    expect(wrapper.findAll('.form-demo__search-results > span')).toHaveLength(2)

    await input.setValue('Search')
    expect(wrapper.findAll('.form-demo__search-results > span')).toHaveLength(1)
    expect(wrapper.get('.form-demo__search-results').text()).toContain('Searchbar')

    await wrapper.get('.varo-searchbar__action').trigger('click')
    expect(input.element.value).toBe('')
    expect(wrapper.find('.form-demo__search-results').exists()).toBe(false)
    expect(wrapper.get('.form-demo__control-head output').text()).toContain('0')
  })
  it('presents ShortPassword as an accessible payment-PIN entry', async () => {
    const wrapper = mount(FormComponentDemo, {
      global: {
        plugins: [themePlugin],
      },
      props: {
        example: 'short-password',
        locale: 'zh',
      },
    })

    const input = wrapper.get<HTMLInputElement>('.varo-short-password__input')
    expect(input.attributes('aria-label')).toBe('支付密码')
    expect(wrapper.get('.varo-short-password__cells').attributes('aria-hidden')).toBe('true')
    expect(wrapper.get('.form-demo__control-head output').text()).toBe('3/6')

    await input.setValue('123456')
    expect(wrapper.get('.form-demo__control-head output').text()).toBe('输入完成')
    expect(wrapper.findAll('.varo-short-password__cell[data-filled="true"]')).toHaveLength(6)
  })
  it('presents Textarea as an accessible issue report with live count', async () => {
    const wrapper = mount(FormComponentDemo, {
      global: {
        plugins: [themePlugin],
      },
      props: {
        example: 'textarea',
        locale: 'zh',
      },
    })

    const textarea = wrapper.get<HTMLTextAreaElement>('textarea.varo-input__control')
    expect(textarea.attributes('aria-label')).toBe('问题描述')
    await textarea.setValue('点击确认后没有响应')
    expect(wrapper.get('.varo-input__word-limit').text()).toBe('9/120')
  })
  it('presents Uploader as a bounded business-document workflow', async () => {
    const wrapper = mount(FormComponentDemo, {
      global: {
        plugins: [themePlugin],
      },
      props: {
        example: 'uploader',
        locale: 'zh',
      },
    })

    expect(wrapper.get('.form-demo__control-head').text()).toContain('资质材料')
    expect(wrapper.get('.form-demo__control-head output').text()).toBe('2/3')
    expect(wrapper.findAll('.varo-uploader__item')).toHaveLength(2)
    expect(wrapper.get('[role="progressbar"]').attributes('aria-valuenow')).toBe('64')

    await wrapper.findAll('.varo-uploader__delete')[0]!.trigger('click')
    expect(wrapper.findAll('.varo-uploader__item')).toHaveLength(1)
    expect(wrapper.get('.form-demo__control-head output').text()).toBe('1/3')
  })

  it('validates dynamic company array fields', async () => {
    const wrapper = mount(FormComponentDemo, {
      global: {
        plugins: [themePlugin],
      },
      props: {
        example: 'form-array',
        locale: 'zh',
      },
    })

    expect(wrapper.findAll('.form-demo__array-item')).toHaveLength(1)

    await wrapper.get('.form-demo__array-add').trigger('click')
    await flushPromises()
    expect(wrapper.findAll('.form-demo__array-item')).toHaveLength(2)
    const companyInputs = wrapper.findAll<HTMLInputElement>('.varo-input__control')
    await companyInputs[0]!.setValue('V')
    await companyInputs[2]!.setValue('123')

    await wrapper.get('.form-demo__save').trigger('submit')
    await flushPromises()

    expect(wrapper.findAll('.varo-form-item__error').some(node => node.text().includes('公司 1 联系人'))).toBe(true)
    expect(wrapper.findAll('.varo-form-item__error').some(node => node.text().includes('公司 2 电话'))).toBe(true)
    expect(wrapper.findAll('.varo-form-item__error').some(node => node.text().includes('公司 2 公司类型'))).toBe(true)
    expect(wrapper.findAll('.varo-form-item__error').some(node => node.text().includes('公司名称至少 2 个字符'))).toBe(true)
    expect(wrapper.findAll('.varo-form-item__error').some(node => node.text().includes('请输入 11 位手机号'))).toBe(true)

    await wrapper.get('.form-demo__code-toggle').trigger('click')
    const code = wrapper.get('.form-demo__code code').text()
    expect(code).toContain('z.object')
    expect(code).toContain(':validation-schema="validationSchema"')
    expect(code).not.toContain('Object.fromEntries')

    await wrapper.findAll('.form-demo__array-remove')[1]!.trigger('click')
    await flushPromises()

    expect(wrapper.findAll('.form-demo__array-item')).toHaveLength(1)
    expect(wrapper.findAll('.varo-form-item__error').some(node => node.text().includes('公司 2'))).toBe(false)
  })

  it('renders select, switch, toast, loading, and skeleton demos', async () => {
    const select = mount(FormComponentDemo, {
      global: { plugins: [themePlugin] },
      props: { example: 'select', locale: 'zh' },
    })
    expect(select.find('.varo-select').exists()).toBe(true)
    expect(select.get('.varo-select__value').text()).toContain('杭州')
    expect(select.get('.form-demo__control-head').text()).toContain('默认发货仓')
    expect(select.get('.form-demo__select-row [role="status"]').text()).toBe('杭州仓')
    await select.get('.varo-select__trigger').trigger('click')
    await select.findAll('.varo-select__option')[0]!.trigger('click')
    expect(select.get('.form-demo__select-row [role="status"]').text()).toBe('上海仓')

    const switchDemo = mount(FormComponentDemo, {
      global: { plugins: [themePlugin] },
      props: { example: 'switch', locale: 'zh' },
    })
    const switches = switchDemo.findAll('.varo-switch')
    expect(switches).toHaveLength(2)
    expect(switches[0]!.attributes('aria-checked')).toBe('true')
    expect(switches[1]!.attributes('disabled')).toBeDefined()
    expect(switchDemo.get('.form-demo__control-head').text()).toContain('通知设置')
    expect(switches[0]!.attributes('aria-label')).toBe('产品与活动通知')
    expect(switches[1]!.attributes('aria-label')).toBe('订单状态通知')
    await switches[0]!.trigger('click')
    expect(switchDemo.get('.form-demo__control-head output').text()).toBe('已关闭')

    const toast = mount(FormComponentDemo, {
      global: { plugins: [themePlugin] },
      props: { example: 'toast', locale: 'zh' },
    })
    const toasts = toast.findAll('.varo-toast')
    expect(toasts).toHaveLength(4)
    expect(toasts.map(item => item.attributes('data-type'))).toEqual(['text', 'warning', 'danger', 'success'])
    expect(toast.text()).toContain('信息已更新')
    expect(toast.text()).toContain('请检查必填项')
    expect(toast.text()).toContain('请求失败')
    expect(toast.text()).toContain('保存成功')
    expect(toast.find('.varo-toast__close').exists()).toBe(false)

    const loading = mount(FormComponentDemo, {
      global: { plugins: [themePlugin] },
      props: { example: 'loading', locale: 'en' },
    })
    expect(loading.findAll('.varo-loading').length).toBeGreaterThanOrEqual(3)
    expect(loading.text()).toContain('Loading')

    vi.useFakeTimers()
    const skeleton = mount(FormComponentDemo, {
      global: { plugins: [themePlugin] },
      props: { example: 'skeleton', locale: 'zh' },
    })
    await vi.advanceTimersByTimeAsync(180)
    expect(skeleton.findAll('.varo-skeleton')).toHaveLength(1)
    expect(skeleton.get('.varo-skeleton').attributes('aria-busy')).toBe('true')
    expect(skeleton.find('.varo-skeleton__avatar').exists()).toBe(true)
    expect(skeleton.findAll('.varo-skeleton__row')).toHaveLength(4)

    await skeleton.get('.form-demo__skeleton-cases [data-case="image"]').trigger('click')
    await vi.advanceTimersByTimeAsync(180)
    expect(skeleton.get('.varo-skeleton__media').attributes('data-kind')).toBe('image')

    await skeleton.get('.form-demo__skeleton-cases [data-case="video"]').trigger('click')
    await vi.advanceTimersByTimeAsync(180)
    expect(skeleton.get('.varo-skeleton__media').attributes('data-kind')).toBe('video')

    await skeleton.get('.form-demo__skeleton-card > header button').trigger('click')
    expect(skeleton.find('.varo-skeleton').exists()).toBe(false)
    expect(skeleton.get('.form-demo__skeleton-media-content').text()).toContain('教学视频已加载')
  })
})
