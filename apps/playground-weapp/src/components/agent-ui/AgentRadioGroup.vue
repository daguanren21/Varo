<script setup lang="ts">
import type { AgentChoice } from './types'
import { computed } from 'wevu'

const props = withDefaults(
  defineProps<{
    choices?: AgentChoice[]
    orientation?: 'horizontal' | 'vertical'
    reducedMotion?: boolean
    value?: string
  }>(),
  {
    choices: () => [],
    orientation: 'vertical',
    reducedMotion: false,
    value: '',
  },
)

const emit = defineEmits<{
  'change': [value: string]
  'update:value': [value: string]
}>()

const selectedIndex = computed(() => Math.max(0, props.choices.findIndex(choice => choice.value === props.value)))
const rootStyle = computed(() => ({
  '--agent-choice-count': String(Math.max(1, props.choices.length)),
  '--agent-choice-index': String(selectedIndex.value),
  'gridTemplateColumns': props.orientation === 'horizontal' ? `repeat(${Math.max(1, props.choices.length)}, minmax(0, 1fr))` : undefined,
}))
const rootClass = computed(() => [
  'agent-radio relative grid overflow-hidden rounded-[14px] border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)]',
  props.orientation === 'horizontal' && 'agent-radio--horizontal grid-flow-col bg-[var(--varo-agent-fill)] p-1',
  props.reducedMotion && 'agent-radio--reduced-motion',
])

function itemClass(choice: AgentChoice) {
  return [
    'agent-radio__item relative z-10 flex w-full items-center gap-3 border-0 bg-transparent text-left text-[var(--varo-agent-text)] transition-[transform,color] duration-200',
    props.orientation === 'horizontal' ? 'min-h-11 justify-center px-2.5 py-1.5 text-center' : 'min-h-14 px-3.5 py-2',
    choice.value === props.value && 'text-[var(--varo-agent-foreground)]',
    choice.disabled && 'agent-radio__item--disabled',
  ]
}

function indicatorClass(choice: AgentChoice) {
  return [
    'h-[18px] w-[18px] flex-none rounded-full border-2 transition-colors',
    choice.value === props.value ? 'border-[var(--varo-agent-primary)]' : 'border-[var(--varo-agent-border-strong)]',
  ]
}

function select(choice: AgentChoice) {
  if (choice.disabled || choice.value === props.value) { return }
  emit('update:value', choice.value)
  emit('change', choice.value)
}
</script>

<template>
  <view
    :class="rootClass"
    role="radiogroup"
    :data-orientation="orientation"
    :data-reduced-motion="String(reducedMotion)"
    :style="rootStyle"
  >
    <text v-if="choices.length" class="agent-radio__indicator absolute z-20 rounded-full bg-[var(--varo-agent-primary)] pointer-events-none" aria-hidden="true" />
    <button
      v-for="choice in choices"
      :key="choice.value"
      :class="itemClass(choice)"
      type="button"
      role="radio"
      :disabled="choice.disabled"
      :aria-checked="choice.value === value"
      :data-selected="String(choice.value === value)"
      :data-disabled="String(Boolean(choice.disabled))"
      hover-class="agent-radio__item--pressed"
      :hover-start-time="20"
      :hover-stay-time="70"
      @click="select(choice)"
    >
      <text
        v-if="orientation === 'vertical'"
        :class="indicatorClass(choice)"
        aria-hidden="true"
      />
      <view class="grid min-w-0 flex-1 gap-0.5">
        <text class="text-[13px] font-bold">
          {{ choice.label }}
        </text>
        <text v-if="choice.description && orientation === 'vertical'" class="text-[12px] leading-4 text-[var(--varo-agent-muted)]">
          {{ choice.description }}
        </text>
      </view>
    </button>
  </view>
</template>

<style>
.agent-radio {
  --agent-radio-spring: cubic-bezier(0.2, 0.9, 0.25, 1.18);
}

.agent-radio__item--pressed {
  transform: scale(0.975);
}

.agent-radio__item--disabled {
  opacity: 0.45;
}

.agent-radio__indicator {
  top: 22px;
  left: 20px;
  width: 10px;
  height: 10px;
  transform: translateY(calc(var(--agent-choice-index) * 56px));
  transition: transform 0.32s var(--agent-radio-spring);
}

.agent-radio--horizontal .agent-radio__indicator {
  top: 4px;
  bottom: 4px;
  left: 4px;
  width: calc((100% - 8px) / var(--agent-choice-count));
  height: auto;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgb(15 23 42 / 12%);
  transform: translateX(calc(var(--agent-choice-index) * 100%));
}

.agent-radio--reduced-motion .agent-radio__indicator,
.agent-radio--reduced-motion .agent-radio__item {
  transition: none;
}

@media (prefers-reduced-motion: reduce) {
  .agent-radio__indicator,
  .agent-radio__item {
    transition: none;
  }
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
