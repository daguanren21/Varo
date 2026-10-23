<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { createVariantClass } from '@varo-ui/headless'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'

interface RenderedRateItem {
  active: boolean
  activeData: string
  ariaChecked: boolean
  ariaLabel: string
  starClass: string
  value: number
}

const props = withDefaults(
  defineProps<{
    allowClear?: boolean
    className?: ClassValue
    count?: number
    disabled?: boolean
    readonly?: boolean
    value?: number
  }>(),
  {
    allowClear: true,
    className: undefined,
    count: 5,
    disabled: false,
    readonly: false,
    value: 0,
  },
)

const emit = defineEmits<{
  'change': [value: number]
  'update:value': [value: number]
}>()

const starStyle = {
  'maskImage': 'var(--varo-rate-star-mask)',
  'maskPosition': 'center',
  'maskRepeat': 'no-repeat',
  'maskSize': 'contain',
  '-webkit-mask-image': 'var(--varo-rate-star-mask)',
  '-webkit-mask-position': 'center',
  '-webkit-mask-repeat': 'no-repeat',
  '-webkit-mask-size': 'contain',
}

const classes = computed(() =>
  cn(
    createVariantClass('varo-rate', {
      radius: '12px',
      disabled: props.disabled,
      readonly: props.readonly,
    }),
    props.className,
  ),
)
const disabledData = computed(() => String(props.disabled))
const items = computed<RenderedRateItem[]>(() =>
  Array.from({ length: props.count }, (_, index) => {
    const value = index + 1
    const active = value <= props.value
    return {
      active,
      activeData: String(active),
      ariaLabel: String(value),
      ariaChecked: value === props.value,
      starClass: active ? 'varo-rate__star varo-rate__star--filled' : 'varo-rate__star',
      value,
    }
  }),
)
const readonlyData = computed(() => String(props.readonly))

function update(next: number) {
  if (props.disabled || props.readonly) { return }
  const value = props.allowClear && props.value === next ? 0 : next
  emit('update:value', value)
  emit('change', value)
}
</script>

<template>
  <view
    :class="classes"
    role="radiogroup"
    :data-disabled="disabledData"
    :data-readonly="readonlyData"
  >
    <button
      v-for="item in items"
      :key="item.value"
      class="varo-rate__item"
      type="button"
      role="radio"
      :aria-label="item.ariaLabel"
      :aria-checked="item.ariaChecked"
      :data-active="item.activeData"
      :disabled="props.disabled"
      @click="update(item.value)"
    >
      <slot name="icon" :active="item.active" :value="item.value">
        <view :class="item.starClass" :style="starStyle" :data-active="item.activeData" aria-hidden="true" />
      </slot>
    </button>
  </view>
</template>

<style>
.varo-rate__star {
  --varo-rate-star-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 3l2.78 5.63L21 9.54l-4.5 4.39L17.56 20 12 17.13 6.44 20l1.06-6.07L3 9.54l6.22-.91Z' fill='none' stroke='%23000' stroke-width='1.8' stroke-linejoin='round'/%3E%3C/svg%3E");

  display: block;
  width: 1em;
  height: 1em;
  background: currentcolor;
}

.varo-rate__star--filled {
  --varo-rate-star-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 3l2.78 5.63L21 9.54l-4.5 4.39L17.56 20 12 17.13 6.44 20l1.06-6.07L3 9.54l6.22-.91Z'/%3E%3C/svg%3E");
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
