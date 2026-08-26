import '../../styles/varo.css'
import { computed, defineComponent, h, shallowRef, type PropType, type StyleValue } from 'vue'

export interface FixedNavItem {
  id?: string | number
  text: string
  icon?: string
  num?: number | string
}

export const VFixedNav = defineComponent({
  name: 'VFixedNav',
  props: {
    visible: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined
    },
    defaultVisible: Boolean,
    navList: {
      type: Array as PropType<FixedNavItem[]>,
      default: () => []
    },
    position: {
      type: String as PropType<'left' | 'right'>,
      default: 'right'
    },
    activeText: {
      type: String,
      default: '导航'
    }
  },
  emits: ['update:visible', 'visibleChange', 'select'],
  setup(props, { attrs, emit }) {
    const localVisible = shallowRef(props.defaultVisible)
    const open = computed(() => props.visible ?? localVisible.value)

    function setVisible(visible: boolean) {
      if (props.visible === undefined) {
        localVisible.value = visible
      }

      emit('update:visible', visible)
      emit('visibleChange', visible)
    }

    return () =>
      h(
        'div',
        {
          ...attrs,
          class: ['varo-fixed-nav', attrs.class],
          style: attrs.style as StyleValue,
          'data-position': props.position,
          'data-visible': String(open.value)
        },
        [
          h(
            'button',
            {
              type: 'button',
              class: 'varo-fixed-nav__trigger',
              onClick: () => setVisible(!open.value)
            },
            props.activeText
          ),
          open.value
            ? h(
                'div',
                { class: 'varo-fixed-nav__list' },
                props.navList.map((item, index) =>
                  h(
                    'button',
                    {
                      key: item.id ?? index,
                      type: 'button',
                      class: 'varo-fixed-nav__item',
                      onClick: () => emit('select', item, index)
                    },
                    [
                      item.icon ? h('span', { class: 'varo-fixed-nav__icon' }, item.icon) : null,
                      h('span', { class: 'varo-fixed-nav__text' }, item.text),
                      item.num != null ? h('sup', { class: 'varo-fixed-nav__badge' }, String(item.num)) : null
                    ]
                  )
                )
              )
            : null
        ]
      )
  }
})
