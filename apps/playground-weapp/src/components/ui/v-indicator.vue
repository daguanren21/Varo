<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'

type IndicatorType = 'dot' | 'line'

const props = withDefaults(
  defineProps<{
    ariaLabel?: string
    className?: ClassValue
    current?: number
    itemAriaLabel?: string
    total?: number
    type?: IndicatorType
  }>(),
  {
    ariaLabel: '轮播进度',
    current: 0,
    itemAriaLabel: '第 {index} 项，共 {total} 项',
    total: 0,
    type: 'dot',
  },
)

const emit = defineEmits<{
  'change': [index: number]
  'update:current': [index: number]
}>()

const classes = computed(() => cn('varo-indicator', props.className))
const items = computed(() =>
  Array.from({ length: props.total }, (_, index) => {
    const active = index === props.current
    const ariaCurrent: 'step' | undefined = active ? 'step' : undefined
    return {
      activeData: String(active),
      ariaCurrent,
      ariaLabel: props.itemAriaLabel
        .replaceAll('{index}', String(index + 1))
        .replaceAll('{total}', String(props.total)),
      index,
    }
  }),
)

function setCurrent(index: number) {
  if (index === props.current) { return }
  emit('update:current', index)
  emit('change', index)
}
</script>

<template>
  <view
    :class="classes"
    role="navigation"
    :aria-label="props.ariaLabel"
    :data-current="String(props.current)"
    :data-total="String(props.total)"
    :data-type="props.type"
  >
    <button
      v-for="item in items"
      :key="item.index"
      class="varo-indicator__item"
      :data-active="item.activeData"
      :aria-current="item.ariaCurrent"
      :aria-label="item.ariaLabel"
      @click="setCurrent(item.index)"
    />
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
