<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed, shallowRef } from 'wevu'
import VInput from './v-input.vue'

type InputAlign = 'left' | 'center' | 'right'
type InputClearTrigger = 'focus' | 'always'
type InputFormatTrigger = 'onInput' | 'onBlur'
type InputAutosize = boolean | { minRows?: number, maxRows?: number }
type InputConfirmType = 'send' | 'search' | 'next' | 'go' | 'done'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    adjustPosition?: boolean
    align?: InputAlign
    ariaControls?: string
    ariaDescribedby?: string
    ariaLabel?: string
    ariaLabelledby?: string
    autoBlur?: boolean
    autoFocus?: boolean
    autosize?: InputAutosize
    className?: ClassValue
    clearable?: boolean
    clearTrigger?: InputClearTrigger
    confirmHold?: boolean
    confirmType?: InputConfirmType
    controlled?: boolean
    cursor?: number
    cursorSpacing?: number
    customStyle?: string
    defaultValue?: string
    disableDefaultPadding?: boolean
    disabled?: boolean
    errorMessage?: string
    fixed?: boolean
    focus?: boolean
    form?: string
    formatTrigger?: InputFormatTrigger
    formatter?: (value: string) => string
    hidden?: boolean
    holdKeyboard?: boolean
    ignoreCompositionEvent?: boolean
    inputId?: string
    invalid?: boolean
    label?: string
    labelWidth?: number | string
    maxLength?: number | string
    name?: string
    placeholder?: string
    placeholderClass?: string
    placeholderStyle?: string
    prefixIcon?: string
    readonly?: boolean
    role?: string
    rows?: number | string
    selectionEnd?: number
    selectionStart?: number
    showConfirmBar?: boolean
    showWordLimit?: boolean
    size?: 'sm' | 'md' | 'lg'
    suffixIcon?: string
    tabindex?: number | string
    value?: string
  }>(),
  {
    adjustPosition: true,
    align: 'left',
    autoBlur: false,
    autoFocus: false,
    autosize: false,
    clearable: false,
    clearTrigger: 'focus',
    confirmHold: false,
    controlled: false,
    cursor: -1,
    cursorSpacing: 0,
    customStyle: '',
    defaultValue: '',
    disableDefaultPadding: false,
    disabled: false,
    fixed: false,
    focus: false,
    formatTrigger: 'onInput',
    hidden: false,
    holdKeyboard: false,
    ignoreCompositionEvent: true,
    invalid: false,
    readonly: false,
    selectionEnd: -1,
    selectionStart: -1,
    showConfirmBar: true,
    showWordLimit: false,
    size: 'md',
    value: undefined,
  },
)

const emit = defineEmits<{
  'blur': [event: unknown]
  'clear': [event: unknown]
  'confirm': [event: unknown]
  'focus': [event: unknown]
  'input': [event: unknown]
  'click': [event: unknown]
  'keyboardheightchange': [event: unknown]
  'linechange': [event: unknown]
  'longpress': [event: unknown]
  'touchcancel': [event: unknown]
  'touchend': [event: unknown]
  'touchmove': [event: unknown]
  'touchstart': [event: unknown]
  'update:value': [value: string]
  'valueChange': [value: string]
}>()
const valueControlled = computed(() => props.value !== undefined)
const localValue = shallowRef(props.defaultValue)
const currentValue = computed(() => {
  if (!valueControlled.value) {
    return localValue.value
  }

  return props.value ?? ''
})

function update(value: string) {
  if (!valueControlled.value) {
    localValue.value = value
  }

  emit('update:value', value)
}

function valueChange(value: string) {
  emit('valueChange', value)
}

function input(event: unknown) {
  emit('input', event)
}

function focus(event: unknown) {
  emit('focus', event)
}

function blur(event: unknown) {
  emit('blur', event)
}

function clear(event: unknown) {
  emit('clear', event)
}

function confirm(event: unknown) {
  emit('confirm', event)
}

function click(event: unknown) {
  emit('click', event)
}

function keyboardHeightChange(event: unknown) {
  emit('keyboardheightchange', event)
}

function lineChange(event: unknown) {
  emit('linechange', event)
}

function longpress(event: unknown) {
  emit('longpress', event)
}

function touchcancel(event: unknown) {
  emit('touchcancel', event)
}

function touchend(event: unknown) {
  emit('touchend', event)
}

function touchmove(event: unknown) {
  emit('touchmove', event)
}

function touchstart(event: unknown) {
  emit('touchstart', event)
}
</script>

<template>
  <VInput
    :adjust-position="props.adjustPosition"
    :align="props.align"
    :aria-controls="props.ariaControls"
    :aria-describedby="props.ariaDescribedby"
    :aria-label="props.ariaLabel"
    :aria-labelledby="props.ariaLabelledby"
    :auto-blur="props.autoBlur"
    :auto-focus="props.autoFocus"
    :autosize="props.autosize"
    :class-name="props.className"
    :custom-style="props.customStyle"
    :clearable="props.clearable"
    :clear-trigger="props.clearTrigger"
    :confirm-hold="props.confirmHold"
    :controlled="props.controlled"
    :cursor="props.cursor"
    :cursor-spacing="props.cursorSpacing"
    :confirm-type="props.confirmType"
    :default-value="props.defaultValue"
    :disable-default-padding="props.disableDefaultPadding"
    :disabled="props.disabled"
    :error-message="props.errorMessage"
    :fixed="props.fixed"
    :focus="props.focus"
    :form="props.form"
    :format-trigger="props.formatTrigger"
    :formatter="props.formatter"
    :hidden="props.hidden"
    :hold-keyboard="props.holdKeyboard"
    :ignore-composition-event="props.ignoreCompositionEvent"
    :input-id="props.inputId"
    :invalid="props.invalid"
    :label="props.label"
    :label-width="props.labelWidth"
    :max-length="props.maxLength"
    :name="props.name"
    :placeholder="props.placeholder"
    :placeholder-class="props.placeholderClass"
    :placeholder-style="props.placeholderStyle"
    :prefix-icon="props.prefixIcon"
    :readonly="props.readonly"
    :role="props.role"
    :rows="props.rows"
    :selection-end="props.selectionEnd"
    :selection-start="props.selectionStart"
    :show-confirm-bar="props.showConfirmBar"
    :show-word-limit="props.showWordLimit"
    :size="props.size"
    :suffix-icon="props.suffixIcon"
    :tabindex="props.tabindex"
    type="textarea"
    :value="currentValue"
    @blur="blur"
    @clear="clear"
    @confirm="confirm"
    @focus="focus"
    @input="input"
    @update:value="update"
    @value-change="valueChange"
    @click="click"
    @keyboardheightchange="keyboardHeightChange"
    @linechange="lineChange"
    @longpress="longpress"
    @touchcancel="touchcancel"
    @touchend="touchend"
    @touchmove="touchmove"
    @touchstart="touchstart"
  >
    <template v-if="$slots.label" #label>
      <slot name="label" />
    </template>
    <template v-if="$slots.prefix" #prefix>
      <slot name="prefix" />
    </template>
    <template v-if="$slots.suffix" #suffix>
      <slot name="suffix" />
    </template>
  </VInput>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
