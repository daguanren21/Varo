import type { PropType, StyleValue } from 'vue'
import { computed, defineComponent, h } from 'vue'

export const VPagination = defineComponent({
  name: 'VPagination',
  props: {
    ariaLabel: {
      type: String,
      default: '分页',
    },
    itemAriaLabel: {
      type: String,
      default: '第 {page} 页，共 {total} 页',
    },
    modelValue: {
      type: Number,
      default: 1,
    },
    pageCount: {
      type: Number,
      default: 1,
    },
    mode: {
      type: String as PropType<'multi' | 'simple'>,
      default: 'multi',
    },
    prevText: {
      type: String,
      default: '上一页',
    },
    nextText: {
      type: String,
      default: '下一页',
    },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { attrs, emit }) {
    const pages = computed(() => Array.from({ length: Math.max(props.pageCount, 0) }, (_, index) => index + 1))

    function setPage(page: number) {
      const next = Math.min(Math.max(page, 1), props.pageCount)
      if (next === props.modelValue) {
        return
      }

      emit('update:modelValue', next)
      emit('change', next)
    }

    function itemLabel(page: number) {
      return props.itemAriaLabel
        .replaceAll('{page}', String(page))
        .replaceAll('{total}', String(props.pageCount))
    }

    return () =>
      h(
        'nav',
        {
          ...attrs,
          'class': ['varo-pagination', attrs.class],
          'style': attrs.style as StyleValue,
          'data-mode': props.mode,
          'aria-label': props.ariaLabel,
        },
        [
          h('button', {
            type: 'button',
            class: 'varo-pagination__prev',
            disabled: props.modelValue <= 1,
            onClick: () => setPage(props.modelValue - 1),
          }, props.prevText),
          props.mode === 'simple'
            ? h('span', { class: 'varo-pagination__simple' }, `${props.modelValue}/${props.pageCount}`)
            : pages.value.map(page =>
                h(
                  'button',
                  {
                    'key': page,
                    'type': 'button',
                    'class': 'varo-pagination__page',
                    'data-active': String(page === props.modelValue),
                    'aria-current': page === props.modelValue ? 'page' : undefined,
                    'aria-label': itemLabel(page),
                    'onClick': () => setPage(page),
                  },
                  String(page),
                ),
              ),
          h('button', {
            type: 'button',
            class: 'varo-pagination__next',
            disabled: props.modelValue >= props.pageCount,
            onClick: () => setPage(props.modelValue + 1),
          }, props.nextText),
        ],
      )
  },
})
