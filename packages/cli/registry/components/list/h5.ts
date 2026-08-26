import '../../styles/varo.css'
import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  watch
} from 'vue'
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
    const intersecting = shallowRef(false)
    const loadRequested = shallowRef(false)
    const sentinel = shallowRef<Element>()
    let observer: IntersectionObserver | undefined
    const canLoad = computed(() => !props.disabled && !props.finished && !props.loading && !props.errorText)

    function requestLoad() {
      if (!canLoad.value || loadRequested.value) return
      loadRequested.value = true
      emit('load')
    }

    function retry() {
      emit('retry')
      requestLoad()
    }

    onMounted(() => {
      if (typeof IntersectionObserver === 'undefined') {
        if (props.immediate) requestLoad()
        return
      }

      observer = new IntersectionObserver(
        (entries) => {
          intersecting.value = entries.some((entry) => entry.isIntersecting)
          if (intersecting.value) requestLoad()
        },
        { rootMargin: `0px 0px ${props.lowerThreshold}px 0px` }
      )
      if (sentinel.value) observer.observe(sentinel.value)
      if (props.immediate) requestLoad()
    })

    onBeforeUnmount(() => observer?.disconnect())
    watch(
      () => props.loading,
      (loading, previous) => {
        if (previous && !loading) loadRequested.value = false
      }
    )
    watch(canLoad, (ready) => {
      if (ready && intersecting.value) requestLoad()
    })

    return () =>
      h(
        'div',
        {
          ...attrs,
          class: ['varo-list', attrs.class],
          'aria-busy': String(props.loading),
          'data-finished': String(props.finished)
        },
        [
          slots.default?.(),
          h('div', { ref: sentinel, class: 'varo-list__sentinel', 'aria-hidden': 'true' }),
          h('footer', { class: 'varo-list__footer', 'aria-live': 'polite' }, [
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
