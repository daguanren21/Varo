import { computed, defineComponent, h, ref, watch, type PropType } from 'vue'
import { buildMonthDays, normalizeMonth, shiftMonth, shiftYear } from './date-utils'

export const VCalendarCard = defineComponent({
  name: 'VCalendarCard',
  props: {
    maxDate: {
      type: String,
      default: undefined
    },
    minDate: {
      type: String,
      default: undefined
    },
    month: {
      type: String,
      default: undefined
    },
    value: {
      type: String as PropType<string | undefined>,
      default: undefined
    }
  },
  emits: ['update:month', 'update:value', 'select'],
  setup(props, { emit }) {
    const currentMonth = ref(normalizeMonth(props.month ?? props.value))
    const days = computed(() => buildMonthDays(currentMonth.value))
    const title = computed(() => currentMonth.value)

    watch(
      () => props.month,
      (month) => {
        if (month) currentMonth.value = normalizeMonth(month)
      }
    )

    function isDisabled(date: string) {
      return Boolean((props.minDate && date < props.minDate) || (props.maxDate && date > props.maxDate))
    }

    function select(date: string) {
      if (isDisabled(date)) return
      emit('update:value', date)
      emit('select', date)
    }

    function updateMonth(month: string) {
      currentMonth.value = month
      emit('update:month', month)
    }

    return () =>
      h('div', { class: 'varo-calendar-card' }, [
        h('div', { class: 'varo-calendar-card__toolbar' }, [
          h('button', { class: 'varo-calendar-card__nav', type: 'button', 'data-action': 'prev-year', onClick: () => updateMonth(shiftYear(currentMonth.value, -1)) }, '«'),
          h('button', { class: 'varo-calendar-card__nav', type: 'button', 'data-action': 'prev-month', onClick: () => updateMonth(shiftMonth(currentMonth.value, -1)) }, '‹'),
          h('div', { class: 'varo-calendar-card__title' }, title.value),
          h('button', { class: 'varo-calendar-card__nav', type: 'button', 'data-action': 'next-month', onClick: () => updateMonth(shiftMonth(currentMonth.value, 1)) }, '›'),
          h('button', { class: 'varo-calendar-card__nav', type: 'button', 'data-action': 'next-year', onClick: () => updateMonth(shiftYear(currentMonth.value, 1)) }, '»')
        ]),
        h(
          'div',
          { class: 'varo-calendar-card__days' },
          days.value.map((day) =>
            h(
              'button',
              {
                class: 'varo-calendar-card__day',
                type: 'button',
                'data-active': String(day.date === props.value),
                'data-date': day.date,
                disabled: isDisabled(day.date),
                onClick: () => select(day.date)
              },
              String(day.day)
            )
          )
        )
      ])
  }
})

export const VCalendar = defineComponent({
  name: 'VCalendar',
  props: {
    confirmText: {
      type: String,
      default: 'Confirm'
    },
    month: {
      type: String,
      default: undefined
    },
    value: {
      type: String as PropType<string | undefined>,
      default: undefined
    },
    visible: Boolean
  },
  emits: ['update:value', 'update:visible', 'confirm', 'select'],
  setup(props, { emit }) {
    const selected = ref(props.value)
    const currentMonth = ref(normalizeMonth(props.month ?? props.value))

    watch(
      () => props.value,
      (value) => {
        selected.value = value
      }
    )
    watch(
      () => props.month,
      (month) => {
        if (month) currentMonth.value = normalizeMonth(month)
      }
    )

    function select(date: string) {
      selected.value = date
      emit('select', date)
      emit('update:value', date)
    }

    return () =>
      props.visible
        ? h('div', { class: 'varo-calendar' }, [
            h(VCalendarCard, {
              month: currentMonth.value,
              value: selected.value,
              'onUpdate:month': (month: string) => {
                currentMonth.value = month
              },
              'onUpdate:value': select
            }),
            h(
              'button',
              {
                class: 'varo-calendar__confirm',
                type: 'button',
                onClick: () => {
                  emit('confirm', selected.value)
                  emit('update:visible', false)
                }
              },
              props.confirmText
            )
          ])
        : null
  }
})
