import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { h } from 'vue'
import VAvatar from '../native/src/components/ui/avatar.vue'
import VAvatarGroup from '../native/src/components/ui/v-avatar-group.vue'
import VPagination from '../native/src/components/ui/v-pagination.vue'
import VTab from '../native/src/components/ui/v-tab.vue'
import VTabs from '../native/src/components/ui/v-tabs.vue'

enableAutoUnmount(afterEach)

const members = ['Ada', 'Bo', 'Chen', 'Dee', 'Eli'].map(name => ({ id: name, alt: name, fallback: name[0] }))

describe('native avatar group and navigation', () => {
  it('renders three real avatars and an overflow count, forwarding size and labels', async () => {
    const wrapper = mount(VAvatarGroup, {
      props: { items: members, max: 3, size: 32, overlap: 8, ariaLabel: 'Reviewers' },
    })
    expect(wrapper.findAllComponents(VAvatar).map(avatar => avatar.props('alt'))).toEqual(['Ada', 'Bo', 'Chen'])
    expect(wrapper.findAllComponents(VAvatar).every(avatar => avatar.props('size') === 32)).toBe(true)
    expect(wrapper.get('.varo-avatar-group__more').text()).toBe('+2')
    expect(wrapper.get('.varo-avatar-group__more').attributes('style')).toContain('width: 32px')
    expect(wrapper.attributes('aria-label')).toBe('Reviewers')
    expect(wrapper.attributes('style')).toContain('--varo-avatar-group-overlap: 8px')
    await wrapper.setProps({ items: members.slice(0, 4) })
    expect(wrapper.get('.varo-avatar-group__more').text()).toBe('+1')
    await wrapper.setProps({ max: 0 })
    expect(wrapper.findAllComponents(VAvatar)).toHaveLength(0)
    expect(wrapper.get('.varo-avatar-group__more').text()).toBe('+4')
  })

  it('treats native null max as unlimited and handles empty groups', async () => {
    const wrapper = mount(VAvatarGroup, { props: { items: members, max: null as unknown as undefined } })
    expect(wrapper.findAllComponents(VAvatar)).toHaveLength(5)
    expect(wrapper.find('.varo-avatar-group__more').exists()).toBe(false)
    await wrapper.setProps({ max: 3 })
    expect(wrapper.attributes('aria-label')).toBe('2 more')
    await wrapper.setProps({ items: [] })
    expect(wrapper.findAllComponents(VAvatar)).toHaveLength(0)
    expect(wrapper.find('.varo-avatar-group__more').exists()).toBe(false)
  })

  it.each([1, 3, 4, 20, 38, 40])('bounds the 40-page window at page %i', (page) => {
    const wrapper = mount(VPagination, { props: { modelValue: page, pageCount: 40 } })
    const buttons = wrapper.findAll('.varo-pagination__page')
    const labels = buttons.map(button => Number(button.text()))
    expect(labels).toContain(1)
    expect(labels).toContain(page)
    expect(labels).toContain(40)
    expect(buttons.length + wrapper.findAll('.varo-pagination__ellipsis').length).toBe(5)
    expect(wrapper.get('[aria-current="page"]').text()).toBe(String(page))
    expect(wrapper.findAll('button.varo-pagination__ellipsis')).toHaveLength(0)
  })

  it('ignores current-page and ellipsis taps, retaining controlled page events', async () => {
    const wrapper = mount(VPagination, { props: { modelValue: 20, pageCount: 40 } })
    await wrapper.get('[aria-current="page"]').trigger('click')
    await wrapper.get('.varo-pagination__ellipsis').trigger('click')
    expect(wrapper.emitted('change')).toBeUndefined()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await wrapper.get('.varo-pagination__next').trigger('click')
    expect(wrapper.emitted('change')).toEqual([[21]])
    expect(wrapper.emitted('update:modelValue')).toEqual([[21]])
    expect(wrapper.get('[aria-current="page"]').text()).toBe('20')
    await wrapper.setProps({ modelValue: 21 })
    expect(wrapper.get('[aria-current="page"]').text()).toBe('21')
    await wrapper.setProps({ pageCount: 1_000_000_000, modelValue: 500_000_000 })
    expect(wrapper.findAll('.varo-pagination__page').map(button => button.text())).toEqual(['1', '500000000', '1000000000'])
  })

  it('retains simple mode and makes unavailable navigation inert', async () => {
    const wrapper = mount(VPagination, { props: { modelValue: 40, pageCount: 40, mode: 'simple' } })
    expect(wrapper.get('.varo-pagination__simple').text()).toBe('40/40')
    expect(wrapper.findAll('.varo-pagination__page')).toHaveLength(0)
    await wrapper.get('.varo-pagination__next').trigger('click')
    expect(wrapper.emitted('change')).toBeUndefined()
    await wrapper.get('.varo-pagination__prev').trigger('click')
    expect(wrapper.emitted('change')).toEqual([[39]])
    await wrapper.setProps({ modelValue: 1, pageCount: 0, mode: 'multi' })
    expect(wrapper.findAll('.varo-pagination__page')).toHaveLength(0)
    expect(wrapper.get<HTMLButtonElement>('.varo-pagination__prev').element.disabled).toBe(true)
    expect(wrapper.get<HTMLButtonElement>('.varo-pagination__next').element.disabled).toBe(true)
    await wrapper.get('.varo-pagination__prev').trigger('click')
    await wrapper.get('.varo-pagination__next').trigger('click')
    expect(wrapper.emitted('change')).toEqual([[39]])
  })

  it('distinguishes absent native active state from an explicitly selected empty name', async () => {
    const wrapper = mount(VTabs, {
      props: { active: null as unknown as undefined },
      slots: { default: () => h(VTab, { name: '', title: 'Empty name' }, { default: () => 'Selected' }) },
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[role="tabpanel"]').exists()).toBe(false)
    await wrapper.get('[role="tab"]').trigger('click')
    expect(wrapper.emitted('update:active')).toEqual([['']])
    await wrapper.setProps({ active: '' })
    expect(wrapper.get('[role="tabpanel"]').text()).toBe('Selected')
    await wrapper.get('[role="tab"]').trigger('click')
    expect(wrapper.emitted('update:active')).toEqual([['']])
    expect(wrapper.emitted('clickTab')).toHaveLength(2)
  })

  it('keeps clickTab intent without no-op update/change events and ignores disabled tabs', async () => {
    const wrapper = mount(VTabs, {
      props: { active: 0 },
      slots: {
        default: () => [
          h(VTab, { name: 0, title: 'First' }, { default: () => 'First panel' }),
          h(VTab, { name: 1, title: 'Second' }, { default: () => 'Second panel' }),
          h(VTab, { name: 2, title: 'Disabled', disabled: true }),
        ],
      },
    })
    await wrapper.vm.$nextTick()
    const tabs = wrapper.findAll('[role="tab"]')
    await tabs[0]!.trigger('click')
    await tabs[0]!.trigger('click')
    await tabs[2]!.trigger('click')
    expect(wrapper.emitted('clickTab')).toEqual([[{ name: 0, title: 'First' }], [{ name: 0, title: 'First' }]])
    expect(wrapper.emitted('update:active')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
    await tabs[1]!.trigger('click')
    expect(wrapper.emitted('update:active')).toEqual([[1]])
    expect(wrapper.emitted('change')).toEqual([[1]])
    expect(wrapper.get('[role="tabpanel"]').text()).toBe('First panel')
    await wrapper.setProps({ active: 1 })
    await tabs[1]!.trigger('click')
    expect(wrapper.emitted('change')).toEqual([[1]])
    expect(wrapper.emitted('clickTab')).toHaveLength(4)
  })

  it.each([
    { change: 'same-update name swap', before: ['a', 'b'], after: ['b', 'a'] },
    { change: 'zero and empty-name swap', before: [0, ''], after: ['', 0] },
    { change: 'overlapping renames', before: ['a', 'b'], after: ['b', 'c'] },
    { change: 'rename to an unused name', before: ['a', 'b'], after: ['c', 'b'] },
  ])('retains both native registrations and order after $change', async ({ before, after }) => {
    const wrapper = mount({
      components: { VTabs, VTab },
      data: () => ({
        items: [
          { id: 'first', name: before[0]!, title: 'First' },
          { id: 'second', name: before[1]!, title: 'Second' },
        ],
      }),
      template: `
        <VTabs active="outside">
          <VTab v-for="item in items" :key="item.id" :name="item.name" :title="item.title" />
        </VTabs>
      `,
    })
    await wrapper.vm.$nextTick()
    const tabs = wrapper.getComponent(VTabs)
    const instances = wrapper.findAllComponents(VTab).map(tab => tab.vm.$)
    expect(tabs.findAll('[role="tab"]').map(tab => tab.text())).toEqual(['First', 'Second'])

    await wrapper.setData({
      items: [
        { id: 'first', name: after[0]!, title: 'First' },
        { id: 'second', name: after[1]!, title: 'Second' },
      ],
    })
    const buttons = tabs.findAll('[role="tab"]')
    expect(buttons.map(tab => tab.text())).toEqual(['First', 'Second'])
    wrapper.findAllComponents(VTab).forEach((tab, index) => expect(tab.vm.$).toBe(instances[index]))
    expect(tabs.emitted('update:active')).toBeUndefined()
    expect(tabs.emitted('change')).toBeUndefined()
    for (const button of buttons) { await button.trigger('click') }
    expect(tabs.emitted('clickTab')).toEqual([
      [{ name: after[0], title: 'First' }],
      [{ name: after[1], title: 'Second' }],
    ])
    expect(tabs.emitted('update:active')).toEqual(after.map(name => [name]))
    expect(tabs.emitted('change')).toEqual(after.map(name => [name]))
    expect(tabs.find('[role="tabpanel"]').exists()).toBe(false)

    await wrapper.setData({ items: [{ id: 'second', name: after[0]!, title: 'Survivor' }] })
    expect(wrapper.getComponent(VTab).vm.$).toBe(instances[1])
    expect(tabs.findAll('[role="tab"]').map(tab => tab.text())).toEqual(['Survivor'])
    await tabs.get('[role="tab"]').trigger('click')
    expect(tabs.emitted('clickTab')?.at(-1)).toEqual([{ name: after[0], title: 'Survivor' }])
    await wrapper.setData({ items: [] })
    expect(tabs.findAll('[role="tab"]')).toHaveLength(0)
  })

  it.each([
    { mutation: 'remove', nextActive: 'b', entryTitle: 'A' },
    { mutation: 'disable', nextActive: 'b', entryTitle: 'A' },
    { mutation: 'rename', nextActive: 'b', entryTitle: 'A' },
    { mutation: 'remove', nextActive: 'c', entryTitle: 'C' },
    { mutation: 'disable', nextActive: 'c', entryTitle: 'C' },
    { mutation: 'rename', nextActive: 'c', entryTitle: 'C' },
  ])('restores an enabled entry after focused tab $mutation with active=$nextActive', async ({ mutation, nextActive, entryTitle }) => {
    const wrapper = mount({
      components: { VTabs, VTab },
      data: () => ({
        active: 'a',
        showB: true,
        disabledB: false,
        nameB: 'b',
      }),
      template: `
        <VTabs v-model:active="active">
          <VTab name="a" title="A" />
          <VTab v-if="showB" :name="nameB" title="B" :disabled="disabledB" />
          <VTab name="c" title="C" />
        </VTabs>
      `,
    })
    await wrapper.vm.$nextTick()
    const tabs = wrapper.getComponent(VTabs)
    await tabs.findAll('[role="tab"]')[1]!.trigger('click')
    expect(wrapper.vm.active).toBe('b')
    expect(tabs.get('[role="tab"][tabindex="0"]').text()).toBe('B')

    await wrapper.setData({
      active: nextActive,
      showB: mutation !== 'remove',
      disabledB: mutation === 'disable',
      nameB: mutation === 'rename' ? 'renamed' : 'b',
    })
    const entries = tabs.findAll<HTMLButtonElement>('[role="tab"][tabindex="0"]')
    expect(entries).toHaveLength(1)
    expect(entries[0]!.text()).toBe(entryTitle)
    expect(entries[0]!.element.disabled).toBe(false)
    expect(tabs.findAll('[role="tab"][disabled][tabindex="0"]')).toHaveLength(0)
    expect(wrapper.vm.active).toBe(nextActive)
    expect(tabs.emitted('update:active')).toEqual([['b']])
    expect(tabs.emitted('change')).toEqual([['b']])
    expect(tabs.emitted('clickTab')).toEqual([[{ name: 'b', title: 'B' }]])
  })

  it('restores focus after all tabs are disabled without accepting disabled actions', async () => {
    const wrapper = mount({
      components: { VTabs, VTab },
      data: () => ({ active: 'a', disabledA: false, disabledB: false }),
      template: `
        <VTabs v-model:active="active">
          <VTab name="a" title="A" :disabled="disabledA" />
          <VTab name="b" title="B" :disabled="disabledB" />
        </VTabs>
      `,
    })
    await wrapper.vm.$nextTick()
    const tabs = wrapper.getComponent(VTabs)
    await tabs.findAll('[role="tab"]')[1]!.trigger('click')
    await wrapper.setData({ disabledA: true, disabledB: true })
    expect(tabs.findAll('[role="tab"][tabindex="0"]')).toHaveLength(0)
    for (const button of tabs.findAll('[role="tab"]')) { await button.trigger('click') }
    expect(tabs.emitted('clickTab')).toEqual([[{ name: 'b', title: 'B' }]])
    expect(tabs.emitted('update:active')).toEqual([['b']])
    await wrapper.setData({ disabledA: false })
    expect(tabs.get('[role="tab"][tabindex="0"]').text()).toBe('A')
    expect(wrapper.vm.active).toBe('b')
    expect(tabs.emitted('change')).toEqual([['b']])
    await tabs.get('[role="tab"][tabindex="0"]').trigger('keydown', { key: 'Home' })
    expect(wrapper.vm.active).toBe('a')
    expect(tabs.emitted('update:active')).toEqual([['b'], ['a']])
  })

  it('navigates current native registration order with arrows, Home, and End', async () => {
    const wrapper = mount({
      components: { VTabs, VTab },
      data: () => ({ active: 0, lastName: '' }),
      template: `
        <VTabs v-model:active="active">
          <VTab :name="0" title="First" />
          <VTab name="locked" title="Locked" disabled />
          <VTab :name="lastName" title="Last" />
        </VTabs>
      `,
    })
    await wrapper.vm.$nextTick()
    const tabs = wrapper.getComponent(VTabs)
    let buttons = tabs.findAll('[role="tab"]')
    await buttons[0]!.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.vm.active).toBe('')
    expect(tabs.get('[role="tab"][tabindex="0"]').text()).toBe('Last')
    await buttons[2]!.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.vm.active).toBe(0)
    await buttons[0]!.trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.vm.active).toBe('')
    await buttons[2]!.trigger('keydown', { key: 'Home' })
    expect(wrapper.vm.active).toBe(0)
    await wrapper.setData({ lastName: 'renamed' })
    buttons = tabs.findAll('[role="tab"]')
    await buttons[0]!.trigger('keydown', { key: 'End' })
    expect(wrapper.vm.active).toBe('renamed')
    expect(tabs.emitted('update:active')).toEqual([[''], [0], [''], [0], ['renamed']])
    expect(tabs.emitted('change')).toEqual([[''], [0], [''], [0], ['renamed']])
  })
})
