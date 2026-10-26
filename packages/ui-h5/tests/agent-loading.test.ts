import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { AgentLoading } from '../../../apps/playground-h5/src/components/agent-ui/conversation'

describe('Agent loading feedback', () => {
  it('advances elapsed time without a supplied start time and pauses when inactive', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    const wrapper = mount(AgentLoading)
    try {
      await vi.advanceTimersByTimeAsync(1200)
      expect(wrapper.text()).toContain('1.2s')
      await wrapper.setProps({ active: false })
      await vi.advanceTimersByTimeAsync(1000)
      expect(wrapper.text()).toContain('1.2s')
      await wrapper.setProps({ active: true })
      expect(wrapper.text()).toContain('2.2s')
    }
    finally {
      wrapper.unmount()
      vi.useRealTimers()
    }
  })

  it('uses a supplied start time when activated', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    const wrapper = mount(AgentLoading, { props: { active: false, startedAt: Date.now() - 3000 } })
    try {
      expect(wrapper.text()).toContain('0.0s')
      await wrapper.setProps({ active: true })
      expect(wrapper.text()).toContain('3.0s')
    }
    finally {
      wrapper.unmount()
      vi.useRealTimers()
    }
  })
})
