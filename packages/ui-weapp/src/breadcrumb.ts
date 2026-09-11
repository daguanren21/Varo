import type { PropType } from 'vue'
import { computed, defineComponent, h } from 'vue'
import { VIcon } from './icon'

export interface BreadcrumbItem {
  disabled?: boolean
  /** Present for shared item arrays. Weapp emits it on `select` and does not auto-navigate. */
  href?: string
  label: string
  value?: string
}

export const VBreadcrumb = defineComponent({
  name: 'VBreadcrumb',
  props: {
    items: {
      type: Array as PropType<Array<BreadcrumbItem | string>>,
      default: () => [],
    },
    label: {
      type: String,
      default: 'Breadcrumb',
    },
    separator: {
      type: String,
      default: undefined,
    },
  },
  emits: ['select'],
  setup(props, { attrs, emit, slots }) {
    const normalizedItems = computed<BreadcrumbItem[]>(() =>
      props.items.map(item => (typeof item === 'string' ? { label: item } : item)),
    )

    function select(index: number, item: BreadcrumbItem) {
      if (item.disabled || index === normalizedItems.value.length - 1) {
        return
      }

      emit('select', { index, item })
    }

    return () =>
      h(
        'nav',
        {
          ...attrs,
          'aria-label': props.label,
          'class': ['varo-breadcrumb', attrs.class],
        },
        h(
          'ol',
          { class: 'varo-breadcrumb__list' },
          normalizedItems.value.map((item, index) => {
            const current = index === normalizedItems.value.length - 1
            const content = slots.item?.({ current, index, item }) ?? item.label

            return h(
              'li',
              {
                'key': `${index}-${item.value ?? item.label}`,
                'class': 'varo-breadcrumb__item',
                'data-current': String(current),
                'data-disabled': String(Boolean(item.disabled)),
              },
              [
                current
                  ? h('span', { 'aria-current': 'page', 'class': 'varo-breadcrumb__current' }, content)
                  : h('button', {
                      class: 'varo-breadcrumb__link',
                      disabled: item.disabled,
                      type: 'button',
                      onClick: () => select(index, item),
                    }, content),
                current
                  ? null
                  : h('span', { 'aria-hidden': 'true', 'class': 'varo-breadcrumb__separator' }, slots.separator?.() ?? (props.separator === undefined ? h(VIcon, { name: 'chevronRight', size: 12 }) : props.separator)),
              ],
            )
          }),
        ),
      )
  },
})
