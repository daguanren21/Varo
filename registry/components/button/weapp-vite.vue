<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { usePressableRoot } from '@varo-ui/headless'
import { computed, toRef } from 'wevu'
import { cn } from '../../lib/cn'
import { varoReactiveRuntime } from '../../lib/varo-primitives'

type ButtonTone = 'default' | 'primary' | 'success' | 'warning' | 'danger'
type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'text'
type ButtonSize = 'sm' | 'md' | 'lg'
type ButtonShape = 'default' | 'square' | 'round'

const props = withDefaults(
  defineProps<{
    block?: boolean
    className?: ClassValue
    disabled?: boolean
    hairline?: boolean
    icon?: string
    iconPosition?: 'left' | 'right'
    loading?: boolean
    loadingText?: string
    nativeType?: 'button' | 'submit' | 'reset'
    plain?: boolean
    shape?: ButtonShape
    size?: ButtonSize
    tone?: ButtonTone
    variant?: ButtonVariant
  }>(),
  {
    block: false,
    disabled: false,
    hairline: false,
    icon: '',
    iconPosition: 'left',
    loading: false,
    loadingText: '',
    nativeType: 'button',
    plain: false,
    shape: 'default',
    size: 'md',
    tone: 'primary',
    variant: 'solid',
  },
)

const emit = defineEmits<{
  click: [event: unknown]
}>()

const visualVariant = computed(() => (props.plain ? 'outline' : props.variant))
const pressable = usePressableRoot({
  runtime: varoReactiveRuntime,
  disabled: toRef(props, 'disabled'),
  loading: toRef(props, 'loading'),
  size: toRef(props, 'size'),
  variant: visualVariant,
})
const disabled = computed(() => pressable.state.disabled.value)
const interactive = computed(() => pressable.state.interactive.value)
const loading = computed(() => pressable.state.loading.value)
const pressed = computed(() => pressable.state.pressed.value)
const size = computed(() => pressable.state.size.value)
const variant = computed(() => pressable.state.variant.value)
const classes = computed(() =>
  cn(
    'varo-button',
    `varo-button--size-${pressable.state.size.value}`,
    `varo-button--variant-${pressable.state.variant.value}`,
    `varo-button--tone-${props.tone}`,
    `varo-button--shape-${props.shape}`,
    props.className,
  ),
)
const formType = computed(() => (props.nativeType === 'submit' || props.nativeType === 'reset' ? props.nativeType : undefined))
const hoverClass = computed(() => (pressable.state.interactive.value ? 'varo-button--pressed' : 'none'))

function click(event: unknown) {
  if (pressable.events.click(event as Event)) { emit('click', event) }
}

function pressStart() {
  pressable.events.pressStart()
}

function pressEnd() {
  pressable.events.pressEnd()
}

function pressCancel() {
  pressable.events.pressCancel()
}
</script>

<template>
  <button
    :class="classes"
    :disabled="!interactive"
    :form-type="formType"
    :hover-class="hoverClass"
    :hover-start-time="20"
    :hover-stay-time="70"
    :data-block="String(props.block)"
    :data-disabled="String(disabled)"
    :data-hairline="String(props.hairline)"
    :data-loading="String(loading)"
    :data-plain="String(props.plain)"
    :data-pressed="String(pressed)"
    :data-shape="props.shape"
    :data-size="size"
    :data-tone="props.tone"
    :data-variant="variant"
    @touchstart="pressStart"
    @touchend="pressEnd"
    @touchcancel="pressCancel"
    @click="click"
  >
    <template v-if="loading">
      <text class="varo-button__loading-icon" aria-hidden="true" />
      <text>{{ props.loadingText || '加载中...' }}</text>
    </template>
    <template v-else>
      <text v-if="$slots.icon || (props.icon && props.iconPosition === 'left')" class="varo-button__icon" data-position="left">
        <slot name="icon">
          {{ props.icon }}
        </slot>
      </text>
      <slot />
      <text v-if="props.icon && props.iconPosition === 'right'" class="varo-button__icon" data-position="right">
        {{ props.icon }}
      </text>
    </template>
  </button>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
