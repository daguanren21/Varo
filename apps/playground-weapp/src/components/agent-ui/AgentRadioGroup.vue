<script setup lang="ts">
import { computed } from 'wevu'
import type { AgentChoice } from './types'

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
    value: ''
  }
)

const emit = defineEmits<{
  change: [value: string]
  'update:value': [value: string]
}>()

const selectedIndex = computed(() => Math.max(0, props.choices.findIndex((choice) => choice.value === props.value)))
const rootStyle = computed(() => ({
  '--agent-choice-count': String(Math.max(1, props.choices.length)),
  '--agent-choice-index': String(selectedIndex.value),
  gridTemplateColumns: props.orientation === 'horizontal' ? `repeat(${Math.max(1, props.choices.length)}, minmax(0, 1fr))` : undefined
}))

function select(choice: AgentChoice) {
  if (choice.disabled || choice.value === props.value) return
  emit('update:value', choice.value)
  emit('change', choice.value)
}
</script>

<template>
  <view
    :class="[
      'agent-radio relative grid overflow-hidden rounded-[14px] border border-slate-200 bg-white',
      orientation === 'horizontal' && 'grid-flow-col bg-slate-100 p-1'
    ]"
    role="radiogroup"
    :data-orientation="orientation"
    :data-reduced-motion="String(reducedMotion)"
    :style="rootStyle"
  >
    <text v-if="choices.length" class="agent-radio__indicator absolute z-20 rounded-full bg-teal-700 pointer-events-none" aria-hidden="true" />
    <button
      v-for="choice in choices"
      :key="choice.value"
      :class="[
        'agent-radio__item relative z-10 flex w-full items-center gap-3 border-0 bg-transparent text-left text-slate-600 transition-[transform,color] duration-200',
        orientation === 'horizontal' ? 'min-h-11 justify-center px-2.5 py-1.5 text-center' : 'min-h-14 px-3.5 py-2',
        choice.value === value && 'text-slate-950'
      ]"
      type="button"
      role="radio"
      :disabled="choice.disabled"
      :aria-checked="choice.value === value"
      :data-selected="String(choice.value === value)"
      hover-class="agent-radio__item--pressed"
      :hover-start-time="20"
      :hover-stay-time="70"
      @click="select(choice)"
    >
      <text
        v-if="orientation === 'vertical'"
        :class="['h-[18px] w-[18px] flex-none rounded-full border-2 transition-colors', choice.value === value ? 'border-teal-700' : 'border-slate-300']"
        aria-hidden="true"
      />
      <view class="grid min-w-0 flex-1 gap-0.5">
        <text class="text-[13px] font-bold">{{ choice.label }}</text>
        <text v-if="choice.description && orientation === 'vertical'" class="text-[11px] leading-4 text-slate-400">{{ choice.description }}</text>
      </view>
    </button>
  </view>
</template>

<style scoped>
.agent-radio { --agent-radio-spring: cubic-bezier(.2, .9, .25, 1.18); }
.agent-radio__item--pressed { transform: scale(.975); }
.agent-radio__item:disabled { opacity: .45; }
.agent-radio__indicator { top: 22px; left: 20px; width: 10px; height: 10px; transform: translateY(calc(var(--agent-choice-index) * 56px)); transition: transform .32s var(--agent-radio-spring); }
.agent-radio[data-orientation='horizontal'] .agent-radio__indicator { top: 4px; bottom: 4px; left: 4px; width: calc((100% - 8px) / var(--agent-choice-count)); height: auto; border-radius: 10px; background: #fff; box-shadow: 0 1px 4px rgba(15, 23, 42, .12); transform: translateX(calc(var(--agent-choice-index) * 100%)); }
.agent-radio[data-reduced-motion='true'] .agent-radio__indicator, .agent-radio[data-reduced-motion='true'] .agent-radio__item { transition: none; }
@media (prefers-reduced-motion: reduce) { .agent-radio__indicator, .agent-radio__item { transition: none; } }
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
