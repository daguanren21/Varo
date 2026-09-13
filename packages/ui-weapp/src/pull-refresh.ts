import { defineComponent, h } from 'vue'

export const VPullRefresh = defineComponent({
  name: 'VPullRefresh',
  props: {
    disabled: Boolean,
    loading: Boolean,
    loadingText: {
      type: String,
      default: '加载中',
    },
    threshold: {
      type: Number,
      default: 64,
    },
  },
  emits: ['refresh'],
  setup(props, { attrs, emit, slots }) {
    function refresh() {
      if (!props.disabled && !props.loading) {
        emit('refresh')
      }
    }

    return () => h('scroll-view', {
      ...attrs,
      'aria-busy': String(props.loading),
      'class': ['varo-pull-refresh', attrs.class],
      'data-disabled': String(props.disabled),
      'data-state': props.loading ? 'loading' : 'idle',
      'onRefresherrefresh': refresh,
      'refresherEnabled': !props.disabled,
      'refresherThreshold': props.threshold,
      'refresherTriggered': props.loading,
      'scrollY': true,
    }, [
      slots.default?.(),
      props.loading
        ? h('view', { 'class': 'varo-pull-refresh__native-status', 'aria-live': 'polite' }, props.loadingText)
        : null,
    ])
  },
})
