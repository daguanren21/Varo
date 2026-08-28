import type { InjectionKey, PropType } from 'vue'
import { useVaroTheme } from '@varo-ui/theme'
import { CheckboxIndicator, CheckboxRoot } from '@varo/primitives-weapp'
import { createVariantClass } from '@varo/shared'
import { computed, defineComponent, h, inject, provide } from 'vue'

export type SelectionDirection = 'horizontal' | 'vertical'
export type CheckboxValue = string | number | boolean
export type RadioValue = string | number | boolean

interface CheckboxGroupContext {
  disabled: () => boolean
  isChecked: (value: CheckboxValue) => boolean
  toggle: (value: CheckboxValue) => void
}

interface RadioGroupContext {
  disabled: () => boolean
  isChecked: (value: RadioValue) => boolean
  select: (value: RadioValue) => void
}

const checkboxGroupKey: InjectionKey<CheckboxGroupContext> = Symbol('varo-checkbox-group')
const radioGroupKey: InjectionKey<RadioGroupContext> = Symbol('varo-radio-group')

function normalizeArray(value: CheckboxValue[] | undefined): CheckboxValue[] {
  return Array.isArray(value) ? [...value] : []
}

export const VCheckboxGroup = defineComponent({
  name: 'VCheckboxGroup',
  props: {
    disabled: Boolean,
    direction: {
      type: String as PropType<SelectionDirection>,
      default: 'vertical',
    },
    max: {
      type: Number,
      default: undefined,
    },
    value: {
      type: Array as PropType<CheckboxValue[]>,
      default: () => [],
    },
  },
  emits: ['update:value', 'change'],
  setup(props, { attrs, emit, slots }) {
    provide(checkboxGroupKey, {
      disabled: () => props.disabled,
      isChecked: value => props.value.includes(value),
      toggle: (value) => {
        const next = normalizeArray(props.value)
        const index = next.indexOf(value)

        if (index >= 0) {
          next.splice(index, 1)
        }
        else {
          if (props.max !== undefined && next.length >= props.max) { return }
          next.push(value)
        }

        emit('update:value', next)
        emit('change', next)
      },
    })

    return () =>
      h(
        'div',
        {
          ...attrs,
          'class': ['varo-checkbox-group', attrs.class],
          'data-direction': props.direction,
          'data-disabled': String(props.disabled),
        },
        slots.default?.() ?? [],
      )
  },
})

export const VCheckbox = defineComponent({
  name: 'VCheckbox',
  props: {
    checked: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    disabled: Boolean,
    label: {
      type: String,
      default: undefined,
    },
    value: {
      type: [String, Number, Boolean] as PropType<CheckboxValue>,
      default: true,
    },
  },
  emits: ['update:checked', 'change'],
  setup(props, { attrs, emit, slots }) {
    const theme = useVaroTheme()
    const group = inject(checkboxGroupKey, undefined)
    const isChecked = computed(() => group?.isChecked(props.value) ?? Boolean(props.checked))
    const isDisabled = computed(() => props.disabled || Boolean(group?.disabled()))
    const classes = computed(() =>
      createVariantClass('varo-checkbox', {
        radius: theme.value.components.button.borderRadius,
        checked: isChecked.value,
        disabled: isDisabled.value,
      }),
    )

    function update(checked: boolean) {
      if (group) {
        group.toggle(props.value)
        return
      }
      emit('update:checked', checked)
      emit('change', checked)
    }

    return () =>
      h(CheckboxRoot, {
        ...attrs,
        'class': [classes.value, attrs.class],
        'checked': isChecked.value,
        'disabled': isDisabled.value,
        'onUpdate:checked': update,
      }, {
        default: () => [
          h('span', { 'class': 'varo-checkbox__icon', 'aria-hidden': 'true' }, [
            h(CheckboxIndicator, { as: 'span' }, () => '✓'),
          ]),
          h('span', { class: 'varo-checkbox__label' }, slots.default?.() ?? props.label),
        ],
      })
  },
})

export const VRadioGroup = defineComponent({
  name: 'VRadioGroup',
  props: {
    disabled: Boolean,
    direction: {
      type: String as PropType<SelectionDirection>,
      default: 'vertical',
    },
    value: {
      type: [String, Number, Boolean] as PropType<RadioValue | undefined>,
      default: undefined,
    },
  },
  emits: ['update:value', 'change'],
  setup(props, { attrs, emit, slots }) {
    provide(radioGroupKey, {
      disabled: () => props.disabled,
      isChecked: value => props.value === value,
      select: (value) => {
        if (props.value === value) { return }
        emit('update:value', value)
        emit('change', value)
      },
    })

    return () =>
      h(
        'div',
        {
          ...attrs,
          'class': ['varo-radio-group', attrs.class],
          'data-direction': props.direction,
          'data-disabled': String(props.disabled),
        },
        slots.default?.() ?? [],
      )
  },
})

export const VRadio = defineComponent({
  name: 'VRadio',
  props: {
    checked: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    disabled: Boolean,
    label: {
      type: String,
      default: undefined,
    },
    value: {
      type: [String, Number, Boolean] as PropType<RadioValue>,
      required: true,
    },
  },
  emits: ['update:checked', 'change'],
  setup(props, { attrs, emit, slots }) {
    const theme = useVaroTheme()
    const group = inject(radioGroupKey, undefined)
    const isChecked = computed(() => group?.isChecked(props.value) ?? Boolean(props.checked))
    const isDisabled = computed(() => props.disabled || Boolean(group?.disabled()))
    const classes = computed(() =>
      createVariantClass('varo-radio', {
        radius: theme.value.components.button.borderRadius,
        checked: isChecked.value,
        disabled: isDisabled.value,
      }),
    )

    function select() {
      if (isDisabled.value) { return }

      if (group) {
        group.select(props.value)
        return
      }

      emit('update:checked', true)
      emit('change', props.value)
    }

    return () =>
      h(
        'button',
        {
          ...attrs,
          'class': [classes.value, attrs.class],
          'type': 'button',
          'role': 'radio',
          'aria-checked': String(isChecked.value),
          'aria-disabled': String(isDisabled.value),
          'data-checked': String(isChecked.value),
          'data-disabled': String(isDisabled.value),
          'disabled': isDisabled.value,
          'onClick': select,
        },
        [
          h('span', { 'class': 'varo-radio__icon', 'aria-hidden': 'true' }, isChecked.value ? '●' : ''),
          h('span', { class: 'varo-radio__label' }, slots.default?.() ?? props.label),
        ],
      )
  },
})
