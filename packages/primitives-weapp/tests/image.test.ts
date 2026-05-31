import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { ImageRoot } from '../src/image'

describe('primitives-weapp image', () => {
  it('renders image attributes, sizing, and fit metadata', () => {
    const wrapper = mount(ImageRoot, {
      props: {
        src: '/avatar.png',
        alt: 'Avatar',
        width: 120,
        height: '80px',
        fit: 'cover',
        position: 'top',
        radius: '12px',
        round: true
      }
    })

    expect(wrapper.attributes('data-fit')).toBe('cover')
    expect(wrapper.attributes('data-round')).toBe('true')
    expect(wrapper.attributes('style')).toContain('width: 120px')
    expect(wrapper.attributes('style')).toContain('height: 80px')
    expect(wrapper.attributes('style')).toContain('border-radius: 50%')
    expect(wrapper.get('img').attributes('src')).toBe('/avatar.png')
    expect(wrapper.get('img').attributes('alt')).toBe('Avatar')
  })

  it('emits load and error while switching placeholders', async () => {
    const onLoad = vi.fn()
    const onError = vi.fn()
    const wrapper = mount(ImageRoot, {
      props: {
        src: '/broken.png',
        onLoad,
        onError
      }
    })

    expect(wrapper.find('.varo-image__loading').exists()).toBe(true)

    await wrapper.get('img').trigger('load')
    expect(onLoad).toHaveBeenCalledTimes(1)

    await wrapper.get('img').trigger('error')
    expect(onError).toHaveBeenCalledTimes(1)
    expect(wrapper.find('.varo-image__error').exists()).toBe(true)
  })
})
