<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'

type ButtonTone = 'default' | 'primary' | 'success' | 'warning' | 'danger'
type ButtonVariant = 'solid' | 'outline' | 'ghost'
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
const classes = computed(() =>
  cn(
    'varo-button',
    `varo-button--size-${props.size}`,
    `varo-button--variant-${visualVariant.value}`,
    `varo-button--tone-${props.tone}`,
    `varo-button--shape-${props.shape}`,
    props.className,
  ),
)
const formType = computed(() => (props.nativeType === 'submit' || props.nativeType === 'reset' ? props.nativeType : undefined))
const hoverClass = computed(() => (props.disabled || props.loading ? 'none' : 'varo-button--pressed'))

function click(event: unknown) {
  if (!props.disabled && !props.loading) { emit('click', event) }
}
</script>

<template>
  <button
    :class="classes"
    :disabled="disabled || loading"
    :form-type="formType"
    :hover-class="hoverClass"
    :hover-start-time="20"
    :hover-stay-time="70"
    :data-block="String(block)"
    :data-disabled="String(disabled)"
    :data-hairline="String(hairline)"
    :data-loading="String(loading)"
    :data-plain="String(plain)"
    :data-shape="shape"
    :data-size="size"
    :data-tone="tone"
    :data-variant="visualVariant"
    @click="click"
  >
    <template v-if="loading">
      <text class="varo-button__loading-icon" aria-hidden="true" />
      <text>{{ loadingText || '加载中...' }}</text>
    </template>
    <template v-else>
      <text v-if="$slots.icon || (icon && iconPosition === 'left')" class="varo-button__icon" data-position="left">
        <slot name="icon">
          {{ icon }}
        </slot>
      </text>
      <slot />
      <text v-if="icon && iconPosition === 'right'" class="varo-button__icon" data-position="right">
        {{ icon }}
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
