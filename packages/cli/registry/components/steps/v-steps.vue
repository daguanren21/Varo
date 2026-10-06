<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'

interface StepItem {
  description?: string
  disabled?: boolean
  icon?: string
  title: string
}

type StepsDirection = 'horizontal' | 'vertical'
type StepStatus = 'pending' | 'current' | 'completed'

interface RenderedStep {
  ariaCurrent: 'step' | undefined
  disabledData: string
  index: number
  item: StepItem
  key: string
  marker: string | number
  showLine: boolean
  status: StepStatus
  triggerDisabled: boolean
}

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    clickable?: boolean
    current?: number
    direction?: StepsDirection
    items?: Array<StepItem | string>
  }>(),
  {
    className: undefined,
    clickable: false,
    current: 0,
    direction: 'horizontal',
    items: () => [],
  },
)

const emit = defineEmits<{
  select: [payload: { index: number, item: StepItem }]
  'update:current': [current: number]
}>()

function statusFor(index: number): StepStatus {
  if (index < props.current) { return 'completed' }
  if (index === props.current) { return 'current' }
  return 'pending'
}

const classes = computed(() => cn('varo-steps', props.className))
const normalizedItems = computed<StepItem[]>(() =>
  props.items.map(item => (typeof item === 'string' ? { title: item } : item)),
)
const renderedSteps = computed<RenderedStep[]>(() =>
  normalizedItems.value.map((item, index) => {
    const status = statusFor(index)
    return {
      ariaCurrent: status === 'current' ? 'step' : undefined,
      disabledData: String(Boolean(item.disabled)),
      index,
      item,
      key: `${index}-${item.title}`,
      marker: item.icon ?? index + 1,
      showLine: index < normalizedItems.value.length - 1,
      status,
      triggerDisabled: Boolean(item.disabled || !props.clickable),
    }
  }),
)

function select(step: RenderedStep) {
  if (!props.clickable || step.item.disabled) { return }
  emit('update:current', step.index)
  emit('select', { index: step.index, item: step.item })
}
</script>

<template>
  <view
    :class="classes"
    role="list"
    :data-direction="props.direction"
  >
    <view
      v-for="step in renderedSteps"
      :key="step.key"
      class="varo-steps__item"
      role="listitem"
      :data-disabled="step.disabledData"
      :data-status="step.status"
    >
      <button
        class="varo-steps__trigger"
        type="button"
        :aria-current="step.ariaCurrent"
        :disabled="step.triggerDisabled"
        @click="select(step)"
      >
        <text class="varo-steps__marker" aria-hidden="true">
          {{ step.marker }}
        </text>
        <view class="varo-steps__body">
          <text class="varo-steps__title">
            <slot name="title" :index="step.index" :item="step.item">
              {{ step.item.title }}
            </slot>
          </text>
          <text v-if="step.item.description" class="varo-steps__description">
            {{ step.item.description }}
          </text>
        </view>
      </button>
      <view v-if="step.showLine" class="varo-steps__line" />
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
