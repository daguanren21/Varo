import '../../styles/varo.css'
import { computed, defineComponent, h, type PropType, type StyleValue } from 'vue'

export const VPagination = defineComponent({
  name: 'VPagination',
  props: {
    modelValue: {
      type: Number,
      default: 1
    },
    pageCount: {
      type: Number,
      default: 1
    },
    mode: {
      type: String as PropType<'multi' | 'simple'>,
      default: 'multi'
    },
    prevText: {
      type: String,
      default: '上一页'
    },
    nextText: {
      type: String,
      default: '下一页'
    }
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

    return () =>
      h(
        'nav',
        {
          ...attrs,
          class: ['varo-pagination', attrs.class],
          style: attrs.style as StyleValue,
          'data-mode': props.mode
        },
        [
          h('button', {
            type: 'button',
            class: 'varo-pagination__prev',
            disabled: props.modelValue <= 1,
            onClick: () => setPage(props.modelValue - 1)
          }, props.prevText),
          props.mode === 'simple'
            ? h('span', { class: 'varo-pagination__simple' }, `${props.modelValue}/${props.pageCount}`)
            : pages.value.map((page) =>
                h(
                  'button',
                  {
                    key: page,
                    type: 'button',
                    class: 'varo-pagination__page',
                    'data-active': String(page === props.modelValue),
                    onClick: () => setPage(page)
                  },
                  String(page)
                )
              ),
          h('button', {
            type: 'button',
            class: 'varo-pagination__next',
            disabled: props.modelValue >= props.pageCount,
            onClick: () => setPage(props.modelValue + 1)
          }, props.nextText)
        ]
      )
  }
})
