import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RobotChatDemo from './RobotChatDemo.vue'

describe('RobotChatDemo', () => {
  it('shows a visible conversation and queryCallback after send', async () => {
    const wrapper = mount(RobotChatDemo, { props: { locale: 'zh' } })
    expect(wrapper.get('[data-preview-field="robot-status"]').text()).toContain('机器人已连接')
    expect(wrapper.get('[data-preview-field="robot-message-count"]').text()).toBe('1')
    expect(wrapper.get('[data-role="assistant"]').text()).toContain('你好')

    await wrapper.get('input').setValue('查订单')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.get('[data-preview-field="robot-last-query"]').text()).toContain('查订单')
    expect(wrapper.get('[data-preview-field="robot-query-count"]').text()).toBe('1')
    expect(wrapper.get('[data-preview-field="robot-message-count"]').text()).toBe('3')
    expect(wrapper.get('[data-role="user"]').text()).toBe('查订单')
  })
})
