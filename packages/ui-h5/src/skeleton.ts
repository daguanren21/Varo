import { computed, defineComponent, h, onBeforeUnmount, shallowRef, watch } from 'vue'

export const VSkeleton = defineComponent({
  name: 'VSkeleton',
  props: {
    animated: {
      type: Boolean,
      default: true,
    },
    avatar: Boolean,
    contentFade: {
      type: Boolean,
      default: true,
    },
    delay: {
      type: Number,
      default: 180,
    },
    loading: {
      type: Boolean,
      default: true,
    },
    round: Boolean,
    rows: {
      type: Number,
      default: 3,
    },
    title: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, { attrs, slots }) {
    const rows = computed(() => Array.from({ length: Math.max(0, Math.floor(props.rows)) }, (_, index) => index))
    const showSkeleton = shallowRef(false)
    let delayTimer: ReturnType<typeof setTimeout> | undefined

    function clearDelayTimer() {
      if (delayTimer === undefined) { return }
      clearTimeout(delayTimer)
      delayTimer = undefined
    }

    function syncVisibility() {
      clearDelayTimer()
      if (!props.loading) {
        showSkeleton.value = false
        return
      }

      const delay = Math.max(0, Number.isFinite(props.delay) ? props.delay : 0)
      if (delay === 0) {
        showSkeleton.value = true
        return
      }

      showSkeleton.value = false
      delayTimer = setTimeout(() => {
        showSkeleton.value = true
        delayTimer = undefined
      }, delay)
    }

    watch([() => props.loading, () => props.delay], syncVisibility, { immediate: true })
    onBeforeUnmount(clearDelayTimer)

    return () => {
      if (!props.loading) {
        return h(
          'div',
          {
            ...attrs,
            'class': ['varo-skeleton__loaded', attrs.class],
            'data-fade': String(props.contentFade),
            'data-state': 'loaded',
          },
          slots.default?.(),
        )
      }

      if (!showSkeleton.value) {
        return h('div', {
          ...attrs,
          'class': ['varo-skeleton', 'varo-skeleton--pending', attrs.class],
          'aria-busy': 'true',
          'aria-label': 'Loading',
          'data-state': 'pending',
        })
      }

      return h(
        'div',
        {
          ...attrs,
          'class': ['varo-skeleton', attrs.class],
          'aria-busy': 'true',
          'aria-label': 'Loading',
          'data-animated': String(props.animated),
          'data-round': String(props.round),
          'data-state': 'visible',
        },
        [
          props.avatar ? h('span', { class: 'varo-skeleton__avatar' }) : null,
          h('div', { class: 'varo-skeleton__content' }, [
            props.title ? h('span', { class: 'varo-skeleton__title' }) : null,
            ...rows.value.map(row =>
              h('span', {
                key: row,
                class: 'varo-skeleton__row',
                style: row === rows.value.length - 1 ? { width: '64%' } : undefined,
              }),
            ),
          ]),
        ],
      )
    }
  },
})
