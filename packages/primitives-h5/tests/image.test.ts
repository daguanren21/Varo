import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { createSSRApp, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { ImageRoot } from '../src/image'

describe('primitives-h5 image', () => {
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
        round: true,
      },
    })

    expect(wrapper.attributes('data-fit')).toBe('cover')
    expect(wrapper.attributes('data-round')).toBe('true')
    expect(wrapper.attributes('style')).toContain('width: 120px')
    expect(wrapper.attributes('style')).toContain('height: 80px')
    expect(wrapper.attributes('style')).toContain('border-radius: 50%')
    expect(wrapper.get('img').attributes('src')).toBe('/avatar.png')
    expect(wrapper.get('img').attributes('alt')).toBe('Avatar')
    expect(wrapper.get('img').attributes('style')).toContain('object-fit: cover')
    expect(wrapper.get('img').attributes('style')).toContain('object-position: top')
  })

  it('emits load and error while switching placeholders', async () => {
    const onLoad = vi.fn()
    const onError = vi.fn()
    const wrapper = mount(ImageRoot, {
      props: {
        src: '/broken.png',
        onLoad,
        onError,
      },
    })

    expect(wrapper.attributes('data-loading')).toBe('true')
    expect(wrapper.find('.varo-image__loading').exists()).toBe(true)

    const loadEvent = new Event('load')
    wrapper.get('img').element.dispatchEvent(loadEvent)
    await nextTick()

    expect(onLoad).toHaveBeenCalledTimes(1)
    expect(onLoad).toHaveBeenCalledWith(loadEvent)
    expect(wrapper.attributes('data-loading')).toBe('false')

    const errorEvent = new Event('error')
    wrapper.get('img').element.dispatchEvent(errorEvent)
    await nextTick()

    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledWith(errorEvent)
    expect(wrapper.attributes('data-error')).toBe('true')
    expect(wrapper.find('.varo-image__error').exists()).toBe(true)
  })

  it('uses custom loading and error slots', async () => {
    const wrapper = mount(ImageRoot, {
      props: {
        src: '/loading.png',
      },
      slots: {
        loading: () => '加载中',
        error: () => '加载失败',
      },
    })

    expect(wrapper.get('.varo-image__loading').text()).toBe('加载中')

    await wrapper.get('img').trigger('error')

    expect(wrapper.get('.varo-image__error').text()).toBe('加载失败')
  })

  it.each([
    { naturalWidth: 0, failed: true },
    { naturalWidth: 64, failed: false },
  ])('reconciles an image resolved before hydration (failed: $failed)', async ({ naturalWidth, failed }) => {
    const props = { src: '/resolved.png', errorText: 'Unavailable' }
    const container = document.createElement('div')
    container.innerHTML = await renderToString(createSSRApp(ImageRoot, props))
    const element = container.querySelector('img')!
    Object.defineProperties(element, {
      complete: { value: true },
      naturalWidth: { value: naturalWidth },
    })
    const onLoad = vi.fn()
    const onError = vi.fn()
    const app = createSSRApp(ImageRoot, { ...props, onLoad, onError })

    try {
      app.mount(container)
      await nextTick()

      expect(container.querySelector('img')).toBe(element)
      expect(container.firstElementChild?.getAttribute('data-loading')).toBe('false')
      expect(container.firstElementChild?.getAttribute('data-error')).toBe(String(failed))
      expect(container.querySelector('.varo-image__loading')).toBeNull()
      expect(Boolean(container.querySelector('.varo-image__error'))).toBe(failed)
      expect(onLoad).not.toHaveBeenCalled()
      expect(onError).not.toHaveBeenCalled()
    }
    finally {
      app.unmount()
    }
  })

  it('resets source state and reconciles the newly rendered resource', async () => {
    const complete = vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockImplementation(function (this: HTMLImageElement) {
      return this.getAttribute('src') !== '/pending.png'
    })
    const naturalWidth = vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockImplementation(function (this: HTMLImageElement) {
      return this.getAttribute('src') === '/success.png' ? 64 : 0
    })
    const wrapper = mount(ImageRoot, { props: { src: '/failed.png' } })

    try {
      await nextTick()
      expect(wrapper.attributes('data-error')).toBe('true')
      expect(wrapper.attributes('data-loading')).toBe('false')

      await wrapper.setProps({ src: '/pending.png' })
      expect(wrapper.attributes('data-error')).toBe('false')
      expect(wrapper.attributes('data-loading')).toBe('true')
      expect(wrapper.find('.varo-image__error').exists()).toBe(false)

      await wrapper.setProps({ src: '/success.png' })
      expect(wrapper.attributes('data-error')).toBe('false')
      expect(wrapper.attributes('data-loading')).toBe('false')
      expect(wrapper.find('.varo-image__loading').exists()).toBe(false)

      await wrapper.setProps({ src: undefined })
      expect(wrapper.attributes('data-error')).toBe('false')
      expect(wrapper.attributes('data-loading')).toBe('false')
      expect(wrapper.find('img').exists()).toBe(false)

      await wrapper.setProps({ src: '/failed.png' })
      expect(wrapper.attributes('data-error')).toBe('true')
      expect(wrapper.find('.varo-image__error').exists()).toBe(true)
      expect(wrapper.emitted('load')).toBeUndefined()
      expect(wrapper.emitted('error')).toBeUndefined()
    }
    finally {
      wrapper.unmount()
      complete.mockRestore()
      naturalWidth.mockRestore()
    }
  })
})
