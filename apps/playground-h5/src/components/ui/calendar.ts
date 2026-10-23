import type { PropType } from 'vue'
import { computed, defineComponent, h, shallowRef, watch } from 'vue'
import { buildMonthDays, normalizeMonth, shiftMonth, shiftYear } from './date-utils'
import { VIcon } from './icon'
import '../../styles/varo.css'
import '../../styles/varo-icon.css'
import '../../styles/varo-calendar.css'

function isDateDisabled(date: string, minDate: string | undefined, maxDate: string | undefined) {
  return Boolean((minDate && date < minDate) || (maxDate && date > maxDate))
}

export const VCalendarCard = defineComponent({
  name: 'VCalendarCard',
  props: {
    maxDate: {
      type: String,
      default: undefined,
    },
    minDate: {
      type: String,
      default: undefined,
    },
    month: {
      type: String,
      default: undefined,
    },
    value: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
  },
  emits: ['update:month', 'update:value', 'select'],
  setup(props, { emit }) {
    const currentMonth = shallowRef(normalizeMonth(props.month ?? props.value))
    const days = computed(() => buildMonthDays(currentMonth.value))
    const title = computed(() => currentMonth.value)

    watch(
      () => props.month,
      (month) => {
        if (month) { currentMonth.value = normalizeMonth(month) }
      },
    )

    function updateMonth(month: string) {
      currentMonth.value = month
      emit('update:month', month)
    }

    function select(date: string) {
      if (isDateDisabled(date, props.minDate, props.maxDate)) { return }
      emit('update:value', date)
      emit('select', date)
    }

    return () =>
      h('div', { class: 'varo-calendar-card' }, [
        h('div', { class: 'varo-calendar-card__toolbar' }, [
          h('button', { 'aria-label': 'Previous year', 'class': 'varo-calendar-card__nav', 'type': 'button', 'data-action': 'prev-year', 'onClick': () => updateMonth(shiftYear(currentMonth.value, -1)) }, h(VIcon, { name: 'chevronsLeft' })),
          h('button', { 'aria-label': 'Previous month', 'class': 'varo-calendar-card__nav', 'type': 'button', 'data-action': 'prev-month', 'onClick': () => updateMonth(shiftMonth(currentMonth.value, -1)) }, h(VIcon, { name: 'chevronLeft' })),
          h('div', { class: 'varo-calendar-card__title' }, title.value),
          h('button', { 'aria-label': 'Next month', 'class': 'varo-calendar-card__nav', 'type': 'button', 'data-action': 'next-month', 'onClick': () => updateMonth(shiftMonth(currentMonth.value, 1)) }, h(VIcon, { name: 'chevronRight' })),
          h('button', { 'aria-label': 'Next year', 'class': 'varo-calendar-card__nav', 'type': 'button', 'data-action': 'next-year', 'onClick': () => updateMonth(shiftYear(currentMonth.value, 1)) }, h(VIcon, { name: 'chevronsRight' })),
        ]),
        h(
          'div',
          { class: 'varo-calendar-card__days' },
          days.value.map(day =>
            h(
              'button',
              {
                'class': 'varo-calendar-card__day',
                'type': 'button',
                'data-active': String(day.date === props.value),
                'data-date': day.date,
                'disabled': isDateDisabled(day.date, props.minDate, props.maxDate),
                'onClick': () => select(day.date),
              },
              String(day.day),
            ),
          ),
        ),
      ])
  },
})

export const VCalendar = defineComponent({
  name: 'VCalendar',
  props: {
    confirmText: {
      type: String,
      default: 'Confirm',
    },
    maxDate: {
      type: String,
      default: undefined,
    },
    minDate: {
      type: String,
      default: undefined,
    },
    month: {
      type: String,
      default: undefined,
    },
    value: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    visible: Boolean,
  },
  emits: ['update:value', 'update:visible', 'confirm', 'select'],
  setup(props, { emit }) {
    const selected = shallowRef(props.value)
    const currentMonth = shallowRef(normalizeMonth(props.month ?? props.value))
    const canConfirm = computed(() => selected.value === undefined
      || !isDateDisabled(selected.value, props.minDate, props.maxDate))

    watch(
      () => props.value,
      (value) => {
        selected.value = value
      },
    )
    watch(
      () => props.month,
      (month) => {
        if (month) { currentMonth.value = normalizeMonth(month) }
      },
    )

    function select(date: string) {
      if (isDateDisabled(date, props.minDate, props.maxDate)) { return }
      selected.value = date
      emit('select', date)
      emit('update:value', date)
    }

    return () =>
      props.visible
        ? h('div', { class: 'varo-calendar' }, [
            h(VCalendarCard, {
              'maxDate': props.maxDate,
              'minDate': props.minDate,
              'month': currentMonth.value,
              'value': selected.value,
              'onUpdate:month': (month: string) => {
                currentMonth.value = month
              },
              'onUpdate:value': select,
            }),
            h(
              'button',
              {
                class: 'varo-calendar__confirm',
                type: 'button',
                disabled: !canConfirm.value,
                onClick: () => {
                  if (!canConfirm.value) { return }
                  emit('confirm', selected.value)
                  emit('update:visible', false)
                },
              },
              props.confirmText,
            ),
          ])
        : null
  },
})
