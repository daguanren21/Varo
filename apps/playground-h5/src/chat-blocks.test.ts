// @vitest-environment jsdom

import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { computeAccessibleName } from 'dom-accessibility-api'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import AgentAssistantSheet from './components/blocks/agent-assistant-sheet.vue'
import AgentChat from './components/blocks/agent-chat.vue'
import ChatBlocksDemo from './features/ChatBlocksDemo.vue'
import { useAgentDemo } from './features/useAgentDemo'

const mounted: VueWrapper[] = []
afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount())
  vi.useRealTimers()
})

function button(wrapper: VueWrapper, label: string) {
  const match = wrapper.findAll('button').find(item => item.text() === label)
  if (!match) { throw new Error(`Missing button: ${label}`) }
  return match
}

describe('chat block contracts', () => {
  it('emits history/new-conversation without mutating injected data', async () => {
    const history = [{ id: 'saved', title: '已保存的会话' }]
    const wrapper = mount(AgentChat, { props: { history, layout: 'page' } })
    mounted.push(wrapper)
    expect(wrapper.attributes('data-layout')).toBe('page')
    await button(wrapper, '已保存的会话').trigger('click')
    await button(wrapper, '新建会话').trigger('click')
    expect(wrapper.emitted('historySelect')).toEqual([['saved']])
    expect(wrapper.emitted('newConversation')).toEqual([[]])
    expect(history).toEqual([{ id: 'saved', title: '已保存的会话' }])
    await wrapper.setProps({ activeHistoryId: 'saved' })
    await button(wrapper, '已保存的会话').trigger('click')
    expect(wrapper.emitted('historySelect')).toHaveLength(1)
  })

  it('shows stop only while busy and keeps cancellation available when input is disabled', async () => {
    const wrapper = mount(AgentChat)
    mounted.push(wrapper)
    expect(wrapper.find('[aria-label="停止生成"]').exists()).toBe(false)
    await wrapper.setProps({ busy: true, disabled: true, history: [{ id: 'one', title: '历史' }] })
    await wrapper.get('[aria-label="停止生成"]').trigger('click')
    await button(wrapper, '新建会话').trigger('click')
    await button(wrapper, '历史').trigger('click')
    expect(wrapper.emitted('stop')).toEqual([[]])
    expect(wrapper.emitted('newConversation')).toBeUndefined()
    expect(wrapper.emitted('historySelect')).toBeUndefined()
    expect(wrapper.get('textarea').attributes('disabled')).toBeDefined()
    await wrapper.setProps({ busy: false })
    expect(wrapper.find('[aria-label="停止生成"]').exists()).toBe(false)
  })

  it('rejects disabled-only edits, Enter, send and suggestions at the consumer boundary', async () => {
    const wrapper = mount(AgentChat, { props: { disabled: true, busy: false, modelValue: '保留草稿', suggestions: ['建议问题'] } })
    mounted.push(wrapper)
    const textarea = wrapper.get<HTMLTextAreaElement>('textarea')
    const send = wrapper.get<HTMLButtonElement>('button[aria-label="发送"]')
    const suggestion = button(wrapper, '建议问题')
    expect(textarea.element.disabled).toBe(true)
    expect(send.element.disabled).toBe(true)
    expect(suggestion.attributes('disabled')).toBeDefined()
    textarea.element.value = '不应接受的编辑'
    textarea.element.dispatchEvent(new Event('input', { bubbles: true }))
    textarea.element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    send.element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    suggestion.element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.props('modelValue')).toBe('保留草稿')
    await wrapper.setProps({ disabled: false })
    await send.trigger('click')
    expect(wrapper.emitted('submit')).toEqual([['保留草稿']])
  })

  it('keeps a supplied empty prompt controlled without an update listener', async () => {
    const wrapper = mount(AgentChat, { props: { modelValue: '' } })
    mounted.push(wrapper)
    await wrapper.get('textarea').setValue('不要替宿主修改受控值')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['不要替宿主修改受控值'])
    expect(wrapper.props('modelValue')).toBe('')
    expect(wrapper.get<HTMLButtonElement>('button[aria-label="发送"]').element.disabled).toBe(true)
    await wrapper.get('textarea').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('submit')).toBeUndefined()
    await wrapper.setProps({ modelValue: '提交这个问题' })
    await wrapper.get('button[aria-label="发送"]').trigger('click')
    expect(wrapper.emitted('submit')?.[0]).toEqual(['提交这个问题'])
    await wrapper.setProps({ modelValue: '' })
    expect(wrapper.get<HTMLTextAreaElement>('textarea').element.value).toBe('')
    expect(wrapper.get<HTMLButtonElement>('button[aria-label="发送"]').element.disabled).toBe(true)
  })

  it('retains an omitted local prompt after submitting its trimmed text', async () => {
    const wrapper = mount(AgentChat)
    mounted.push(wrapper)
    await wrapper.get('textarea').setValue('  local question  ')
    await wrapper.get('button[aria-label="发送"]').trigger('click')
    expect(wrapper.emitted('submit')).toEqual([['local question']])
    expect(wrapper.get<HTMLTextAreaElement>('textarea').element.value).toBe('  local question  ')
  })
})

describe('assistant sheet contracts', () => {
  it.each(['close button', 'Escape'])('restores focus to the floating opener after %s dismissal', async (dismissal) => {
    const wrapper = mount(AgentAssistantSheet, { attachTo: document.body })
    mounted.push(wrapper)
    const launcher = wrapper.get<HTMLButtonElement>('button[aria-label="打开助手"]')
    launcher.element.focus()
    await launcher.trigger('click')
    await nextTick()
    expect(wrapper.get('[role="dialog"]').element.contains(document.activeElement)).toBe(true)
    if (dismissal === 'Escape') {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    }
    else {
      await wrapper.get('button[aria-label="关闭助手"]').trigger('click')
    }
    await nextTick()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(document.activeElement).toBe(launcher.element)
  })

  it('supports an omitted open model, explicit expansion/back, quote removal and typed insertion intents', async () => {
    const context = { id: 'quote', label: '选中段落', text: `<script>not HTML</script>\n${'长上下文'.repeat(100)}` }
    const selectedResponse = { id: 'answer', content: '可插入的回答' }
    const wrapper = mount(AgentAssistantSheet, { attachTo: document.body, props: { context, selectedResponse, title: '引用写作助手' } })
    mounted.push(wrapper)
    await button(wrapper, '打开助手').trigger('click')
    expect(wrapper.findAll('[role="dialog"]')).toHaveLength(1)
    expect(computeAccessibleName(wrapper.get('[role="dialog"]').element)).toBe('引用写作助手')
    await wrapper.setProps({ title: '段落改写助手' })
    expect(computeAccessibleName(wrapper.get('[role="dialog"]').element)).toBe('段落改写助手')
    expect(wrapper.text()).toContain(context.text)
    expect(wrapper.find('script').exists()).toBe(false)
    await button(wrapper, '展开助手').trigger('click')
    expect(wrapper.find('[data-expanded="true"]').exists()).toBe(true)
    await button(wrapper, '返回助手面板').trigger('click')
    expect(wrapper.find('[data-expanded="false"]').exists()).toBe(true)
    await button(wrapper, '移除引用').trigger('click')
    expect(wrapper.emitted('removeContext')).toEqual([[context]])
    expect(wrapper.text()).toContain(context.text)
    await button(wrapper, '插入到草稿').trigger('click')
    expect(wrapper.emitted('insert')).toEqual([[selectedResponse]])
    await wrapper.get('button[aria-label="关闭助手"]').trigger('click')
    expect(wrapper.emitted('close')).toEqual([[]])
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('honors controlled false and disables insert until a nonempty response is supplied', async () => {
    const wrapper = mount(AgentAssistantSheet, { props: { open: false } })
    mounted.push(wrapper)
    await button(wrapper, '打开助手').trigger('click')
    expect(wrapper.emitted('update:open')).toEqual([[true]])
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    await wrapper.setProps({ open: true })
    expect(button(wrapper, '插入到草稿').attributes('disabled')).toBeDefined()
    await wrapper.setProps({ selectedResponse: { id: 'blank', content: '  ' } })
    expect(button(wrapper, '插入到草稿').attributes('disabled')).toBeDefined()
    await wrapper.setProps({ selectedResponse: { id: 'answer', content: '回答' }, busy: true })
    await button(wrapper, '插入到草稿').trigger('click')
    expect(wrapper.emitted('insert')).toBeUndefined()
    await wrapper.setProps({ busy: false, disabled: true })
    expect(button(wrapper, '插入到草稿').attributes('disabled')).toBeDefined()
  })

  it('routes overlay close through the same close intent', async () => {
    const wrapper = mount(AgentAssistantSheet)
    mounted.push(wrapper)
    await button(wrapper, '打开助手').trigger('click')
    await wrapper.get('.varo-drawer__overlay').trigger('click')
    expect(wrapper.emitted('close')).toEqual([[]])
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })
})

describe('real local demo state', () => {
  it('cancels the existing local event-channel demo through the same stop intent', async () => {
    vi.useFakeTimers()
    const wrapper = mount(defineComponent({
      setup() {
        const demo = useAgentDemo()
        return () => h(AgentChat, {
          busy: demo.busy.value,
          snapshot: demo.snapshot.value,
          messages: demo.messages.value,
          suggestions: ['取消演示'],
          onSubmit: demo.send,
          onStop: demo.stop,
          onNewConversation: demo.newConversation,
        })
      },
    }))
    mounted.push(wrapper)
    await button(wrapper, '取消演示').trigger('click')
    await vi.advanceTimersByTimeAsync(600)
    await button(wrapper, '停止生成').trigger('click')
    const chat = wrapper.findComponent(AgentChat)
    const stopped = chat.props('snapshot')
    expect(stopped?.status).toBe('cancelled')
    await vi.advanceTimersByTimeAsync(5000)
    expect(chat.props('snapshot')).toEqual(stopped)
    await button(wrapper, '新建会话').trigger('click')
    expect(chat.props('snapshot')?.status).toBe('idle')
    expect(chat.props('messages')).toEqual([])
    expect(chat.text()).toContain('有什么可以帮你？')
  })

  it('cancels production and the actual stream controller, retaining a stable stopped state', async () => {
    vi.useFakeTimers()
    const wrapper = mount(ChatBlocksDemo)
    mounted.push(wrapper)
    await button(wrapper, '写一段建议').trigger('click')
    await vi.advanceTimersByTimeAsync(360)
    expect(wrapper.get('[data-chat-demo="state"]').text()).toContain('status=streaming')
    await button(wrapper, '禁用输入').trigger('click')
    await button(wrapper, '停止生成').trigger('click')
    const stopped = wrapper.get('[data-chat-demo="state"]').text()
    expect(stopped).toContain('status=cancelled')
    expect(stopped).toContain('action=stopped')
    await vi.advanceTimersByTimeAsync(5000)
    expect(wrapper.get('[data-chat-demo="state"]').text()).toBe(stopped)
  })

  it('selects history, quotes/removes context, inserts the supplied response into the draft and clears a conversation', async () => {
    const wrapper = mount(ChatBlocksDemo)
    mounted.push(wrapper)
    await button(wrapper, '已保存的写作建议').trigger('click')
    await button(wrapper, '引用此段').trigger('click')
    expect(wrapper.get('[data-chat-demo="state"]').text()).toContain('context=passage')
    await button(wrapper, '移除引用').trigger('click')
    expect(wrapper.get('[data-chat-demo="state"]').text()).toContain('context=none')
    await button(wrapper, '插入到草稿').trigger('click')
    expect(wrapper.get('[data-chat-demo="draft"]').text()).toContain('先写清楚目标，再说明下一步。')
    expect(wrapper.get('[data-chat-demo="state"]').text()).toContain('inserts=1')
    await button(wrapper, '新建会话').trigger('click')
    expect(wrapper.text()).toContain('有什么可以帮你？')
    expect(wrapper.get('[data-chat-demo="state"]').text()).toContain('history=new')
  })

  it('retains the completed answer through a pre-message failure and history roundtrip', async () => {
    vi.useFakeTimers()
    const wrapper = mount(ChatBlocksDemo)
    mounted.push(wrapper)
    await wrapper.get('.agent-composer textarea').setValue('保留这次回答')
    await wrapper.get('.agent-composer button[aria-label="发送"]').trigger('click')
    await vi.advanceTimersByTimeAsync(5000)
    const chat = wrapper.findComponent(AgentChat)
    const answer = chat.props('snapshot')?.message?.source
    expect(chat.props('snapshot')?.status).toBe('completed')
    expect(answer).toContain('建议草稿：先说明目标')
    await button(wrapper, '演示错误').trigger('click')
    expect(chat.props('snapshot')?.status).toBe('failed')
    expect(chat.props('snapshot')?.message).toBeUndefined()
    await button(wrapper, '新建会话').trigger('click')
    await button(wrapper, '保留这次回答').trigger('click')
    expect(chat.props('snapshot')?.status).toBe('idle')
    expect(chat.props('messages')?.filter(message => message.role === 'assistant').map(message => message.content)).toEqual([answer])
    expect(chat.text()).toContain(answer)
  })

  it('closes and reopens the standalone conversation without discarding its history', async () => {
    const wrapper = mount(ChatBlocksDemo)
    mounted.push(wrapper)
    await button(wrapper, '已保存的写作建议').trigger('click')
    await wrapper.get('button[aria-label="关闭 Agent"]').trigger('click')
    expect(wrapper.findComponent(AgentChat).exists()).toBe(false)
    await button(wrapper, '打开会话').trigger('click')
    expect(wrapper.findComponent(AgentChat).text()).toContain('先写清楚目标，再说明下一步。')
  })

  it('finishes a real generated response and inserts it, and cancels owned timers on unmount', async () => {
    vi.useFakeTimers()
    const wrapper = mount(ChatBlocksDemo)
    mounted.push(wrapper)
    await button(wrapper, '打开助手').trigger('click')
    await button(wrapper, '写一段建议').trigger('click')
    await vi.advanceTimersByTimeAsync(5000)
    expect(wrapper.get('[data-chat-demo="state"]').text()).toContain('status=completed')
    await button(wrapper, '插入到草稿').trigger('click')
    expect(wrapper.get('[data-chat-demo="draft"]').text()).toContain('建议草稿：先说明目标')
    await button(wrapper, '写一段建议').trigger('click')
    wrapper.unmount()
    mounted.pop()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('recovers from the demo error and preserves state when disabled', async () => {
    vi.useFakeTimers()
    const wrapper = mount(ChatBlocksDemo)
    mounted.push(wrapper)
    await button(wrapper, '禁用输入').trigger('click')
    await button(wrapper, '写一段建议').trigger('click')
    expect(wrapper.get('[data-chat-demo="state"]').text()).toContain('status=idle')
    await button(wrapper, '启用输入').trigger('click')
    await button(wrapper, '演示错误').trigger('click')
    expect(wrapper.get('[data-chat-demo="state"]').text()).toContain('status=failed')
    expect(wrapper.text()).toContain('演示错误：请重试本地生成。')
    await button(wrapper, '重试').trigger('click')
    expect(wrapper.get('[data-chat-demo="state"]').text()).toContain('status=streaming')
    await vi.advanceTimersByTimeAsync(5000)
    expect(wrapper.get('[data-chat-demo="state"]').text()).toContain('status=completed')
  })
})
