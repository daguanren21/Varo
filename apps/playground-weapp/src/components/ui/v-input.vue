<script setup lang="ts">
import type { PropType } from 'wevu'
import { useFieldRoot } from '@varo-ui/headless'
import { computed, shallowRef, toRef } from 'wevu'
import { varoReactiveRuntime } from '../../lib/varo-primitives'

const props = defineProps({
  align: { type: String as PropType<'left' | 'center' | 'right'>, default: 'left' },
  clearable: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
  formatTrigger: { type: String as PropType<'onInput' | 'onBlur'>, default: 'onInput' },
  formatter: { type: Function as PropType<(value: string) => string>, default: undefined },
  invalid: { type: Boolean, default: false },
  label: { type: String, default: '' },
  maxLength: { type: [Number, String] as PropType<number | string>, default: 140 },
  placeholder: { type: String, default: '' },
  readonly: { type: Boolean, default: false },
  rows: { type: [Number, String] as PropType<number | string>, default: 3 },
  showWordLimit: { type: Boolean, default: false },
  size: { type: String as PropType<'sm' | 'md' | 'lg'>, default: 'md' },
  type: { type: String, default: 'text' },
  value: { type: null as unknown as PropType<string>, default: '' },
})

const emit = defineEmits<{
  'blur': [event: unknown]
  'clear': [event: unknown]
  'focus': [event: unknown]
  'update:value': [value: string]
  'valueChange': [value: string]
}>()

const focused = shallowRef(false)
const controlled = computed(() => true)
const inactive = computed(() => props.disabled || props.readonly)
const normalizedValue = computed(() => props.value || '')
const field = useFieldRoot({
  runtime: varoReactiveRuntime,
  value: normalizedValue,
  valueControlled: controlled,
  disabled: inactive,
  invalid: toRef(props, 'invalid'),
  onValueChange: update,
})
const fieldDisabled = computed(() => field.state.disabled.value)
const fieldInteractive = computed(() => field.state.interactive.value)
const fieldInvalid = computed(() => field.state.invalid.value)
const fieldValue = computed(() => field.state.value.value)
const isTextarea = computed(() => props.type === 'textarea')
const maxLength = computed(() => Number(props.maxLength) || 140)
const nativeType = computed(() => (props.type === 'tel' ? 'number' : props.type))
const controlStyle = computed(() => ({
  minHeight: isTextarea.value ? `${Math.max(1, Number(props.rows)) * 22}px` : undefined,
  height: isTextarea.value ? `${Math.max(1, Number(props.rows)) * 22}px` : undefined,
  textAlign: props.align,
}))

function normalize(value: string, trigger: 'onInput' | 'onBlur') {
  return props.formatter && props.formatTrigger === trigger ? props.formatter(value) : value
}

function eventValue(event: Event) {
  const miniEvent = event as Event & { detail?: { value?: string } }
  const target = event.target as HTMLInputElement | HTMLTextAreaElement | null
  return miniEvent.detail?.value ?? target?.value ?? ''
}

function update(value: string) {
  emit('update:value', value)
  emit('valueChange', value)
}

function input(event: Event) {
  field.events.input(normalize(eventValue(event), 'onInput'))
}

function focus(event: unknown) {
  focused.value = true
  emit('focus', event)
}

function blur(event: Event) {
  focused.value = false
  if (props.formatTrigger === 'onBlur') { field.events.input(normalize(eventValue(event), 'onBlur')) }
  emit('blur', event)
}

function clear(event: unknown) {
  field.api.clear()
  emit('clear', event)
}
</script>

<template>
  <view
    class="varo-input"
    :data-align="props.align"
    :data-disabled="String(fieldDisabled)"
    :data-focused="String(focused)"
    :data-invalid="String(fieldInvalid)"
    :data-readonly="String(props.readonly)"
    :data-size="props.size"
  >
    <text v-if="props.label || $slots.label" class="varo-input__label">
      <slot name="label">
        {{ props.label }}
      </slot>
    </text>
    <view class="varo-input__body">
      <slot name="prefix" />
      <textarea
        v-if="isTextarea"
        class="varo-input__control varo-input__control--textarea"
        :value="fieldValue"
        :placeholder="props.placeholder"
        :disabled="fieldDisabled"
        :maxlength="maxLength"
        :auto-height="false"
        :style="controlStyle"
        @input="input"
        @focus="focus"
        @blur="blur"
      />
      <input
        v-else
        class="varo-input__control"
        :value="fieldValue"
        :password="props.type === 'password'"
        :type="nativeType"
        :placeholder="props.placeholder"
        :disabled="fieldDisabled"
        :maxlength="maxLength"
        :style="controlStyle"
        @input="input"
        @focus="focus"
        @blur="blur"
      >
      <button
        v-if="props.clearable && fieldValue && fieldInteractive"
        class="varo-input__clear"
        type="button"
        aria-label="Clear input"
        @click="clear"
      >
        ×
      </button>
      <slot name="suffix" />
    </view>
    <view v-if="props.showWordLimit || props.errorMessage" class="varo-input__footer">
      <text v-if="props.errorMessage" class="varo-input__error">
        {{ props.errorMessage }}
      </text>
      <text v-if="props.showWordLimit" class="varo-input__count">
        {{ fieldValue.length }}/{{ maxLength }}
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
