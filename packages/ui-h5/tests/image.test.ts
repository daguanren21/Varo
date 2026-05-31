import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { VImage } from '../src/image'

describe('ui-h5 image', () => {
  it('wraps ImageRoot with Varo classes and image props', () => {
    const wrapper = mount(VImage, {
      props: {
        src: '/cover.png',
        alt: 'Cover',
        width: '100%',
        height: 96,
        fit: 'cover',
        radius: '10px'
      }
    })

    expect(wrapper.classes().join(' ')).toContain('varo-image')
    expect(wrapper.attributes('data-fit')).toBe('cover')
    expect(wrapper.attributes('style')).toContain('width: 100%')
    expect(wrapper.attributes('style')).toContain('height: 96px')
    expect(wrapper.get('img').attributes('alt')).toBe('Cover')
  })
})
