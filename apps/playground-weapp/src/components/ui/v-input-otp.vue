<script setup lang="ts">
import type { InputOtpInputMode, InputOtpPattern } from '@varo-ui/headless'
import type { ClassValue } from '../../lib/cn'
import { useInputOtpRoot } from '@varo-ui/headless'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'
import { varoReactiveRuntime } from '../../lib/varo-primitives'

defineOptions({
  properties: {
    value: { type: null, value: null },
  },
})

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    customStyle?: string | Record<string, string | number>
    value?: string
    defaultValue?: string
    length?: number
    pattern?: InputOtpPattern
    inputMode?: InputOtpInputMode
    inputAriaLabel?: string
    size?: 'sm' | 'md' | 'lg'
    separator?: string
    mask?: boolean
    disabled?: boolean
    invalid?: boolean
    readonly?: boolean
  }>(),
  {
    defaultValue: '',
    inputAriaLabel: 'One-time password',
    inputMode: 'numeric',
    length: 6,
    pattern: '[0-9]',
    size: 'md',
  },
)

const emit = defineEmits<{
  'update:value': [value: string]
  'valueChange': [value: string]
  'complete': [value: string]
  'focus': [event: Event]
  'blur': [event: Event]
}>()

const valueControlled = computed(() => props.value != null)
const otp = useInputOtpRoot({
  runtime: varoReactiveRuntime,
  value: computed(() => props.value),
  valueControlled,
  defaultValue: props.defaultValue,
  length: computed(() => props.length),
  pattern: computed(() => props.pattern),
  inputMode: computed(() => props.inputMode),
  disabled: computed(() => props.disabled),
  invalid: computed(() => props.invalid),
  readonly: computed(() => props.readonly),
  accessibleLabel: computed(() => props.inputAriaLabel),
  onValueChange(value) {
    emit('update:value', value)
    emit('valueChange', value)
  },
  onComplete(value) {
    emit('complete', value)
  },
})

const currentValue = computed(() => otp.state.value.value)
const currentLength = computed(() => otp.state.length.value)
const currentActiveIndex = computed(() => otp.state.activeIndex.value)
const currentFocused = computed(() => otp.state.focused.value)
const currentComplete = computed(() => otp.state.complete.value)
const dataComplete = computed(() => String(currentComplete.value))
const dataDisabled = computed(() => String(Boolean(props.disabled)))
const dataFocused = computed(() => String(currentFocused.value))
const dataInvalid = computed(() => String(Boolean(props.invalid)))
const dataLength = computed(() => String(currentLength.value))
const dataReadonly = computed(() => String(Boolean(props.readonly)))
const dataState = computed(() => {
  if (props.disabled) { return 'disabled' }
  if (props.invalid) { return 'invalid' }
  return currentComplete.value ? 'complete' : 'incomplete'
})
const inputType = computed(() => 'text')
const cells = computed(() => Array.from({ length: currentLength.value }, (_, index) => ({
  active: currentFocused.value && currentActiveIndex.value === index,
  filled: Boolean(currentValue.value[index]),
  index,
  value: currentValue.value[index] || '',
})))
const classes = computed(() => cn('varo-input-otp', props.className))

function readInputValue(event: Event) {
  const miniEvent = event as Event & { detail?: { value?: string } }
  const input = event.target as HTMLInputElement | null
  return miniEvent.detail?.value || input?.value || ''
}

function handleInput(event: Event) {
  otp.events.input(readInputValue(event))
}

function handleFocus(event: Event) {
  otp.events.focus()
  emit('focus', event)
}

function handleBlur(event: Event) {
  otp.events.blur()
  emit('blur', event)
}
function displayCell(cell: { value: string }) {
  return props.mask && cell.value ? '•' : cell.value
}
</script>

<template>
  <view
    :class="classes"
    :style="props.customStyle"
    :aria-disabled="props.disabled"
    :aria-invalid="props.invalid"
    :aria-readonly="props.readonly"
    :data-complete="dataComplete"
    :data-disabled="dataDisabled"
    :data-focused="dataFocused"
    :data-invalid="dataInvalid"
    :data-length="dataLength"
    :data-readonly="dataReadonly"
    :data-size="props.size"
    :data-state="dataState"
  >
    <input
      class="varo-input-otp__input"
      :aria-label="props.inputAriaLabel"
      autocomplete="one-time-code"
      :disabled="props.disabled"
      :inputmode="props.inputMode"
      :maxlength="currentLength"
      :readonly="props.readonly"
      :type="inputType"
      :value="currentValue"
      @blur="handleBlur"
      @focus="handleFocus"
      @input="handleInput"
    >
    <view class="varo-input-otp__cells" aria-hidden="true">
      <text
        v-for="cell in cells"
        :key="cell.index"
        class="varo-input-otp__cell"
        :data-active="String(cell.active)"
        :data-filled="String(cell.filled)"
        :data-index="String(cell.index)"
      >
        {{ displayCell(cell) }}
      </text>
      <text v-if="props.separator" class="varo-input-otp__separator">
        {{ props.separator }}
      </text>
    </view>
    <slot />
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
