import type { PropType, StyleValue } from 'vue'
import { computed, defineComponent, h } from 'vue'
import { getPaginationTokens, isAvailablePage } from './pagination-utils'
import '../../styles/varo.css'
import '../../styles/varo-pagination.css'

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
    const pages = computed(() => getPaginationTokens(props.pageCount, props.modelValue))

    function setPage(page: number) {
      if (!isAvailablePage(page, props.pageCount) || page === props.modelValue) { return }

      emit('update:modelValue', page)
      emit('change', page)
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
            disabled: !isAvailablePage(props.modelValue - 1, props.pageCount),
            onClick: () => setPage(props.modelValue - 1),
          }, props.prevText),
          props.mode === 'simple'
            ? h('span', { class: 'varo-pagination__simple' }, `${props.modelValue}/${props.pageCount}`)
            : pages.value.map(page =>
                typeof page === 'string'
                  ? h('span', { 'key': page, 'class': 'varo-pagination__ellipsis', 'aria-hidden': 'true' }, '…')
                  : h(
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
            disabled: !isAvailablePage(props.modelValue + 1, props.pageCount),
            onClick: () => setPage(props.modelValue + 1),
          }, props.nextText),
        ],
      )
  },
})
