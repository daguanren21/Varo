import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { ButtonRoot } from '../src/button'

describe('primitives-weapp button', () => {
  it('exposes size and variant state attrs', () => {
    const wrapper = mount(ButtonRoot, {
      props: {
        size: 'lg',
        variant: 'outline'
      },
      slots: {
        default: () => 'Action'
      }
    })

    expect(wrapper.attributes('data-size')).toBe('lg')
    expect(wrapper.attributes('data-variant')).toBe('outline')
  })

  it('blocks click when loading', async () => {
    const onClick = vi.fn()
    const wrapper = mount(ButtonRoot, {
      props: {
        loading: true,
        onClick
      },
      slots: {
        default: () => 'Action'
      }
    })

    await wrapper.trigger('click')
    expect(onClick).not.toHaveBeenCalled()
    expect(wrapper.attributes('aria-busy')).toBe('true')
  })

  it('tracks pressed state through pointer lifecycle', async () => {
    const wrapper = mount(ButtonRoot, {
      slots: {
        default: () => 'Action'
      }
    })

    await wrapper.trigger('mousedown')
    expect(wrapper.attributes('data-pressed')).toBe('true')
    await wrapper.trigger('mouseup')
    expect(wrapper.attributes('data-pressed')).toBe('false')
  })
})
