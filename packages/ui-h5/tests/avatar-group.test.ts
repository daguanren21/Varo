import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { createCommentVNode, createTextVNode, defineComponent, Fragment, h } from 'vue'
import { VAvatar, VAvatarGroup } from '../src/avatar'

enableAutoUnmount(afterEach)

const members = ['Ada', 'Bo', 'Chen', 'Dee', 'Eli']

const slotShapes = {
  direct: () => members.map(name => h(VAvatar, { key: name, alt: name, fallback: name[0] })),
  fragment: () => [h(Fragment, null, members.map(name => h(VAvatar, { key: name, alt: name, fallback: name[0] })))],
  conditional: () => [
    createCommentVNode('v-if'),
    createTextVNode(' \n '),
    h(Fragment, null, [
      h(VAvatar, { alt: 'Ada', fallback: 'A' }),
      createCommentVNode('v-if'),
      h(Fragment, null, members.slice(1).map(name => h(VAvatar, { key: name, alt: name, fallback: name[0] }))),
    ]),
  ],
}

describe('AvatarGroup rendered membership', () => {
  it.each(Object.entries(slotShapes))('limits %s slots to three avatars and two hidden members', (_shape, slot) => {
    const wrapper = mount(VAvatarGroup, { props: { max: 3 }, slots: { default: slot } })
    expect(wrapper.findAll('.varo-avatar').map(avatar => avatar.attributes('aria-label'))).toEqual(members.slice(0, 3))
    expect(wrapper.get('.varo-avatar-group__more').text()).toBe('+2')
    expect(wrapper.attributes('aria-label')).toBe('2 more')
  })

  it('tracks v-for and conditional membership after parent updates', async () => {
    const Host = defineComponent({
      components: { VAvatar, VAvatarGroup },
      props: { includeLast: { type: Boolean, default: true } },
      setup: () => ({ members }),
      template: `
        <VAvatarGroup :max="3">
          <VAvatar v-if="false" fallback="Absent" />
          <template v-for="(name, index) in members" :key="name">
            <VAvatar v-if="index < 4 || includeLast" :alt="name" :fallback="name[0]" />
          </template>
        </VAvatarGroup>
      `,
    })
    const wrapper = mount(Host)
    expect(wrapper.findAll('.varo-avatar')).toHaveLength(3)
    expect(wrapper.get('.varo-avatar-group__more').text()).toBe('+2')
    await wrapper.setProps({ includeLast: false })
    expect(wrapper.findAll('.varo-avatar')).toHaveLength(3)
    expect(wrapper.get('.varo-avatar-group__more').text()).toBe('+1')
  })

  it('preserves local avatar identity when keyed fragment members and groups reorder', async () => {
    const StatefulAvatar = defineComponent({
      props: { name: { type: String, required: true } },
      setup(props) {
        const initialName = props.name
        return () => h(VAvatar, { alt: props.name, fallback: initialName })
      },
    })
    const Host = defineComponent({
      props: { reverseMembers: Boolean, reverseGroups: Boolean, includeRight: { type: Boolean, default: true } },
      setup: props => () => h(VAvatarGroup, { max: 3 }, {
        default: () => (props.reverseGroups ? ['right', 'left'] : ['left', 'right'])
          .filter(group => props.includeRight || group !== 'right')
          .map(group => h(Fragment, { key: group }, (props.reverseMembers ? ['b', 'a'] : ['a', 'b']).map(key =>
            h(StatefulAvatar, { key, name: `${group}-${key}` }),
          ))),
      }),
    })
    const wrapper = mount(Host)
    const labels = () => wrapper.findAll('.varo-avatar').map(avatar => [avatar.attributes('aria-label'), avatar.text()])
    expect(labels()).toEqual([['left-a', 'left-a'], ['left-b', 'left-b'], ['right-a', 'right-a']])
    const leftInstances = wrapper.findAllComponents(StatefulAvatar).slice(0, 2).map(avatar => avatar.vm)
    await wrapper.setProps({ reverseMembers: true })
    expect(labels()).toEqual([['left-b', 'left-b'], ['left-a', 'left-a'], ['right-b', 'right-b']])
    expect(wrapper.findAllComponents(StatefulAvatar)[0]!.vm).toBe(leftInstances[1])
    expect(wrapper.findAllComponents(StatefulAvatar)[1]!.vm).toBe(leftInstances[0])
    const rightB = wrapper.findAllComponents(StatefulAvatar)[2]!.vm
    await wrapper.setProps({ reverseGroups: true })
    expect(labels()).toEqual([['right-b', 'right-b'], ['right-a', 'right-a'], ['left-b', 'left-b']])
    expect(wrapper.findAllComponents(StatefulAvatar)[0]!.vm).toBe(rightB)
    expect(wrapper.get('.varo-avatar-group__more').text()).toBe('+1')
    await wrapper.setProps({ includeRight: false })
    expect(labels()).toEqual([['left-b', 'left-b'], ['left-a', 'left-a']])
    expect(wrapper.findAllComponents(StatefulAvatar)[0]!.vm).toBe(leftInstances[1])
    expect(wrapper.find('.varo-avatar-group__more').exists()).toBe(false)
  })

  it('keeps reusable slot fragments intact across different group limits', async () => {
    const fragment = h(Fragment, { key: 'members' }, slotShapes.direct())
    const slots = { default: () => [fragment] }
    const limited = mount(VAvatarGroup, { props: { max: 1 }, slots })
    const unlimited = mount(VAvatarGroup, { slots })
    expect(limited.findAll('.varo-avatar').map(avatar => avatar.attributes('aria-label'))).toEqual(['Ada'])
    expect(limited.get('.varo-avatar-group__more').text()).toBe('+4')
    expect(unlimited.findAll('.varo-avatar').map(avatar => avatar.attributes('aria-label'))).toEqual(members)
    await limited.setProps({ max: 3 })
    expect(limited.findAll('.varo-avatar').map(avatar => avatar.attributes('aria-label'))).toEqual(members.slice(0, 3))
    expect(limited.get('.varo-avatar-group__more').text()).toBe('+2')
    expect(unlimited.findAll('.varo-avatar').map(avatar => avatar.attributes('aria-label'))).toEqual(members)
  })

  it('preserves caller attributes, avatar labels, and unlimited/zero limits', async () => {
    const wrapper = mount(VAvatarGroup, {
      attrs: { 'id': 'reviewers', 'class': 'team', 'aria-label': 'Reviewers' },
      props: { overlap: 8 },
      slots: { default: slotShapes.fragment },
    })
    expect(wrapper.findAll('.varo-avatar')).toHaveLength(5)
    expect(wrapper.find('.varo-avatar-group__more').exists()).toBe(false)
    expect(wrapper.classes()).toContain('team')
    expect(wrapper.attributes('id')).toBe('reviewers')
    expect(wrapper.attributes('style')).toContain('--varo-avatar-group-overlap: 8px')
    await wrapper.setProps({ max: 0 })
    expect(wrapper.findAll('.varo-avatar')).toHaveLength(0)
    expect(wrapper.get('.varo-avatar-group__more').text()).toBe('+5')
    expect(wrapper.attributes('aria-label')).toBe('Reviewers')
    await wrapper.setProps({ max: 10 })
    expect(wrapper.findAll('.varo-avatar')).toHaveLength(5)
    expect(wrapper.find('.varo-avatar-group__more').exists()).toBe(false)
  })
})
