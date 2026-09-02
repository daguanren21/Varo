// @vitest-environment jsdom

import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import VRobotChat from './components/ui/v-robot-chat.vue'
import VRobotOperateCard from './components/ui/v-robot-operate-card.vue'

interface PluginInitOptions {
  appid: string
  fail: (error: unknown) => void
  operateCardHeight: number
  success: () => void
}

afterEach(() => {
  vi.unstubAllGlobals()
})

const WechatRobotChatStub = defineComponent({
  name: 'WechatRobotChat',
  inheritAttrs: true,
  template: '<div />',
})

describe('VRobotChat', () => {
  it('initializes the WeChat plugin and binds the static operate-card generic', async () => {
    let initOptions: PluginInitOptions | undefined
    const init = vi.fn((options: PluginInitOptions) => {
      initOptions = options
      options.success()
    })
    vi.stubGlobal('requirePlugin', vi.fn(() => ({
      getChatComponent: vi.fn(),
      init,
    })))

    const wrapper = mount(VRobotChat, {
      props: {
        options: {
          appid: '  robot-app-id  ',
          operateCardHeight: 96,
          welcome: '你好',
        },
      },
      global: {
        components: {
          'wechat-robot-chat': WechatRobotChatStub,
        },
      },
    })
    await flushPromises()

    expect(init).toHaveBeenCalledOnce()
    expect(initOptions).toMatchObject({
      appid: 'robot-app-id',
      operateCardHeight: 96,
      welcome: '你好',
    })
    expect(wrapper.emitted('ready')).toHaveLength(1)

    const chat = wrapper.getComponent(WechatRobotChatStub)
    const generic = chat.attributes()['generic:operatecard'] ?? chat.attributes()['generic:operateCard']
    expect(generic).toBe('varo-robot-operate-card')

    chat.vm.$emit('queryCallback', { detail: { query: '订单' } })
    chat.vm.$emit('backHome')
    await flushPromises()
    expect(wrapper.emitted('queryCallback')).toHaveLength(1)
    expect(wrapper.emitted('backHome')).toHaveLength(1)
  })

  it('shows plugin failures and retries initialization', async () => {
    let attempt = 0
    const init = vi.fn((options: PluginInitOptions) => {
      attempt += 1
      if (attempt === 1) {
        options.fail(new Error('unavailable'))
      }
      else { options.success() }
    })
    vi.stubGlobal('requirePlugin', vi.fn(() => ({
      getChatComponent: vi.fn(),
      init,
    })))

    const wrapper = mount(VRobotChat, {
      props: { options: { appid: 'robot-app-id' } },
    })
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('机器人连接失败')
    expect(wrapper.emitted('error')).toHaveLength(1)

    await wrapper.get('button').trigger('click')
    await flushPromises()
    expect(init).toHaveBeenCalledTimes(2)
    expect(wrapper.find('wechat-robot-chat').exists()).toBe(true)
  })
})

describe('VRobotOperateCard', () => {
  it('sends trimmed text and returns through the plugin controller', async () => {
    const send = vi.fn()
    const backHome = vi.fn()
    vi.stubGlobal('requirePlugin', vi.fn(() => ({
      getChatComponent: () => ({
        backHome,
        inputVoiceEnd: vi.fn(),
        inputVoiceStart: vi.fn(),
        send,
      }),
      init: vi.fn(),
    })))

    const wrapper = mount(VRobotOperateCard)
    await wrapper.get('input').setValue('  查询订单  ')
    const buttons = wrapper.findAll('button')
    await buttons[1]!.trigger('click')
    expect(send).toHaveBeenCalledWith('查询订单')
    expect(wrapper.get<HTMLInputElement>('input').element.value).toBe('')

    await buttons[0]!.trigger('click')
    expect(backHome).toHaveBeenCalledOnce()
  })
})
