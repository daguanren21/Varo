import '../../styles/varo.css'
import { computed, defineComponent, h, onMounted, shallowRef, watch } from 'vue'
import { VLoading } from './loading'

export const VList = defineComponent({
  name: 'VList',
  props: {
    disabled: Boolean,
    errorText: String,
    finished: Boolean,
    finishedText: {
      type: String,
      default: '没有更多了'
    },
    immediate: {
      type: Boolean,
      default: true
    },
    loading: Boolean,
    loadingText: {
      type: String,
      default: '加载中'
    },
    lowerThreshold: {
      type: Number,
      default: 80
    }
  },
  emits: ['load', 'retry'],
  setup(props, { attrs, emit, slots }) {
    const loadRequested = shallowRef(false)
    const canLoad = computed(() => !props.disabled && !props.finished && !props.loading && !props.errorText)

    function requestLoad() {
      if (!canLoad.value || loadRequested.value) return
      loadRequested.value = true
      emit('load')
    }

    function retry() {
      emit('retry')
    }

    onMounted(() => {
      if (props.immediate) requestLoad()
    })

    watch(
      () => props.loading,
      (loading, previous) => {
        if (previous && !loading) loadRequested.value = false
      }
    )

    return () =>
      h(
        'scroll-view',
        {
          ...attrs,
          class: ['varo-list', attrs.class],
          lowerThreshold: props.lowerThreshold,
          scrollY: true,
          'aria-busy': String(props.loading),
          'data-finished': String(props.finished),
          onScrolltolower: requestLoad
        },
        [
          slots.default?.(),
          h('view', { class: 'varo-list__sentinel', 'aria-hidden': 'true' }),
          h('view', { class: 'varo-list__footer', 'aria-live': 'polite' }, [
            props.loading
              ? slots.loading?.() ?? h(VLoading, { size: 'sm', text: props.loadingText })
              : props.errorText
                ? h(
                    'button',
                    { class: 'varo-list__retry', type: 'button', onClick: retry },
                    slots.error?.() ?? props.errorText
                  )
                : props.finished
                  ? slots.finished?.() ?? props.finishedText
                  : null
          ])
        ]
      )
  }
})
