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
  change: [value: number]
  'update:value': [value: number]
}>()

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
      ariaChecked: active,
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
        <view class="varo-rate__star" :data-active="item.activeData" aria-hidden="true">
          <view v-if="!item.active" class="varo-rate__star-cutout" />
        </view>
      </slot>
    </button>
  </view>
</template>

<style scoped>
.varo-rate__star {
  position: relative;
  display: block;
  width: 1em;
  height: 1em;
  background: currentcolor;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 94%, 50% 72%, 21% 94%, 32% 57%, 2% 35%, 39% 35%);
}

.varo-rate__star-cutout {
  position: absolute;
  top: 22%;
  left: 22%;
  width: 56%;
  height: 56%;
  background: var(--varo-ui-bg, #fff);
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 94%, 50% 72%, 21% 94%, 32% 57%, 2% 35%, 39% 35%);
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
