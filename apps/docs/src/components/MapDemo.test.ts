import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MapDemo from './MapDemo.vue'

describe('MapDemo', () => {
  it('exposes map center, markers, and regionchange as observable state', async () => {
    const wrapper = mount(MapDemo, { props: { locale: 'zh' } })
    expect(wrapper.get('[data-preview-field="map-center"]').text()).toContain('杭州西湖')
    expect(wrapper.get('[data-preview-field="map-coordinates"]').text()).toContain('30.274')
    expect(wrapper.get('[data-preview-field="map-marker-count"]').text()).toBe('1')
    expect(wrapper.get('[data-preview-field="map-state"]').attributes('data-preview-value')).toContain('region=0')

    await wrapper.get('.map-demo__surface').trigger('click')
    expect(wrapper.get('[data-preview-field="map-region-count"]').text()).toBe('1')
    expect(wrapper.get('[data-preview-field="map-last-event"]').text()).toContain('regionchange #1')

    await wrapper.get('.map-demo__actions button').trigger('click')
    expect(wrapper.get('[data-preview-field="map-center"]').text()).toContain('上海外滩')
    expect(wrapper.get('[data-preview-field="map-coordinates"]').text()).toContain('31.23')
    expect(wrapper.get('[data-preview-field="map-state"]').attributes('data-preview-value')).toContain('center=上海外滩')
  })
})
