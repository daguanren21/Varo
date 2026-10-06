// Generated from registry/components/date-picker/date-picker.ts; edit the Registry source.
import type { PropType } from 'vue'
import { computed, defineComponent, h, shallowRef, watch } from 'vue'
import { VCalendarCard } from './calendar'
import { normalizeMonth } from './date-utils'
import './styles/varo.css'
import './styles/varo-icon.css'
import './styles/varo-calendar.css'
import './styles/varo-date-picker.css'

export const VDatePicker = defineComponent({
  name: 'VDatePicker',
  props: {
    confirmText: {
      type: String,
      default: 'Confirm',
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
  emits: ['update:value', 'update:visible', 'confirm', 'change'],
  setup(props, { emit }) {
    const selected = shallowRef(props.value)
    const currentMonth = computed(() => props.month ?? normalizeMonth(props.value))

    watch(
      () => props.value,
      (value) => {
        selected.value = value
      },
    )

    function select(date: string) {
      selected.value = date
      emit('update:value', date)
      emit('change', date)
    }

    return () =>
      props.visible
        ? h('div', { class: 'varo-date-picker' }, [
            h(VCalendarCard, {
              'month': currentMonth.value,
              'value': selected.value,
              'onUpdate:value': select,
            }),
            h(
              'button',
              {
                class: 'varo-date-picker__confirm',
                type: 'button',
                onClick: () => {
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
