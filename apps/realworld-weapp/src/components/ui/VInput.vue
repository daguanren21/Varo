<script setup lang="ts">
import { computed, shallowRef, watch } from 'wevu'

type InputType = 'digit' | 'idcard' | 'nickname' | 'number' | 'password' | 'phone' | 'safe-password' | 'tel' | 'text' | 'textarea'
type NativeInputType = 'digit' | 'idcard' | 'nickname' | 'number' | 'safe-password' | 'text'

const props = withDefaults(
  defineProps<{
    align?: 'left' | 'center' | 'right'
    clearable?: boolean
    disabled?: boolean
    errorMessage?: string
    formatTrigger?: 'onInput' | 'onBlur'
    formatter?: (value: string) => string
    invalid?: boolean
    label?: string
    maxLength?: number | string
    placeholder?: string
    readonly?: boolean
    rows?: number | string
    showWordLimit?: boolean
    size?: 'sm' | 'md' | 'lg'
    type?: InputType
    value?: string
  }>(),
  {
    align: 'left',
    clearable: false,
    disabled: false,
    errorMessage: '',
    formatTrigger: 'onInput',
    invalid: false,
    label: '',
    maxLength: 140,
    placeholder: '',
    readonly: false,
    rows: 3,
    showWordLimit: false,
    size: 'md',
    type: 'text',
    value: '',
  },
)

const emit = defineEmits<{
  'blur': [event: unknown]
  'clear': [event: unknown]
  'focus': [event: unknown]
  'update:value': [value: string]
  'valueChange': [value: string]
}>()

const focused = shallowRef(false)
const localValue = shallowRef(props.value)
const isTextarea = computed(() => props.type === 'textarea')
const maxLength = computed(() => Number(props.maxLength) || 140)
const nativeType = computed<NativeInputType>(() => {
  if (props.type === 'tel' || props.type === 'phone') { return 'number' }
  if (props.type === 'password' || props.type === 'textarea') { return 'text' }
  return props.type
})

watch(
  () => props.value,
  (value) => {
    localValue.value = value
  },
)

function normalize(value: string, trigger: 'onInput' | 'onBlur') {
  return props.formatter && props.formatTrigger === trigger ? props.formatter(value) : value
}

function update(value: string, trigger: 'onInput' | 'onBlur') {
  const next = normalize(value, trigger)
  localValue.value = next
  emit('update:value', next)
  emit('valueChange', next)
}

function eventValue(event: Event) {
  const miniEvent = event as Event & { detail?: { value?: string } }
  const target = event.target as HTMLInputElement | HTMLTextAreaElement | null
  return miniEvent.detail?.value ?? target?.value
}

function input(event: Event) {
  update(eventValue(event) ?? '', 'onInput')
}

function focus(event: Event) {
  focused.value = true
  emit('focus', event)
}

function blur(event: Event) {
  focused.value = false
  update(eventValue(event) ?? localValue.value, 'onBlur')
  emit('blur', event)
}

function clear(event: unknown) {
  update('', 'onInput')
  emit('clear', event)
}
</script>

<template>
  <view
    class="varo-input"
    :data-align="align"
    :data-disabled="String(disabled)"
    :data-focused="String(focused)"
    :data-invalid="String(invalid)"
    :data-readonly="String(readonly)"
    :data-size="size"
  >
    <text v-if="label || $slots.label" class="varo-input__label">
      <slot name="label">
        {{ label }}
      </slot>
    </text>
    <view class="varo-input__body">
      <slot name="prefix" />
      <textarea
        v-if="isTextarea"
        class="varo-input__control varo-input__control--textarea"
        :value="localValue"
        :placeholder="placeholder"
        :disabled="disabled || readonly"
        :maxlength="maxLength"
        :auto-height="false"
        :style="{ minHeight: `${Math.max(1, Number(rows)) * 22}px`, height: `${Math.max(1, Number(rows)) * 22}px`, textAlign: align }"
        @input="input"
        @focus="focus"
        @blur="blur"
      />
      <input
        v-else
        class="varo-input__control"
        :value="localValue"
        :password="type === 'password'"
        :type="nativeType"
        :placeholder="placeholder"
        :disabled="disabled || readonly"
        :maxlength="maxLength"
        :style="{ textAlign: align }"
        @input="input"
        @focus="focus"
        @blur="blur"
      >
      <button
        v-if="clearable && localValue && !disabled && !readonly"
        class="varo-input__clear"
        type="default"
        aria-label="Clear input"
        @click="clear"
      >
        ×
      </button>
      <slot name="suffix" />
    </view>
    <view v-if="showWordLimit || errorMessage" class="varo-input__footer">
      <text v-if="errorMessage" class="varo-input__error">
        {{ errorMessage }}
      </text>
      <text v-if="showWordLimit" class="varo-input__count">
        {{ localValue.length }}/{{ maxLength }}
      </text>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
