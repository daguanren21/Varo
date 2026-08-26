<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef } from 'wevu'

const props = withDefaults(
  defineProps<{
    active?: boolean
    label?: string
    startedAt?: number
    variant?: 'grid' | 'dots' | 'orbit'
  }>(),
  {
    active: true,
    label: 'Agent 正在处理',
    startedAt: undefined,
    variant: 'grid'
  }
)

const elapsed = shallowRef(0)
let timer: ReturnType<typeof setInterval> | undefined
const effectiveStartedAt = props.startedAt ?? Date.now()
const elapsedLabel = computed(() => `${elapsed.value.toFixed(1)}s`)

function updateElapsed() {
  elapsed.value = Math.max(0, (Date.now() - effectiveStartedAt) / 1000)
}

function start() {
  if (timer || !props.active) return
  updateElapsed()
  timer = setInterval(updateElapsed, 100)
}

function stop() {
  clearInterval(timer)
  timer = undefined
}

if (props.active) start()
onBeforeUnmount(stop)
</script>

<template>
  <view class="agent-loading flex min-h-12 items-center gap-3 text-slate-700" :data-active="String(active)" role="status">
    <view
      v-if="variant !== 'orbit'"
      :class="variant === 'dots' ? 'flex h-5 w-[30px] items-center gap-1 bg-transparent' : 'grid h-[30px] w-[30px] grid-cols-3 gap-[3px] rounded-[10px] bg-slate-100 p-1'"
      aria-hidden="true"
    >
      <text
        v-for="index in variant === 'dots' ? 3 : 9"
        :key="index"
        class="agent-loading__pixel rounded-sm bg-teal-700 opacity-20"
        :style="{ animationDelay: `${index * 45}ms` }"
      />
    </view>
    <view v-else class="agent-loading__orbit relative h-[30px] w-[30px] flex-none rounded-full border border-teal-100" aria-hidden="true">
      <text class="agent-loading__orbit-dot absolute left-1/2 top-[-2px] h-2 w-2 -translate-x-1/2 rounded-full bg-teal-700" />
    </view>
    <view class="flex min-w-0 flex-1 items-baseline justify-between gap-3">
      <text class="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-semibold">{{ label }}</text>
      <text class="text-[11px] tabular-nums text-slate-400">{{ elapsedLabel }}</text>
    </view>
  </view>
</template>

<style scoped>
.agent-loading__pixel { animation: agent-pixel 1.1s ease-in-out infinite; }
.agent-loading__orbit { animation: agent-orbit 1.2s linear infinite; }
.agent-loading__orbit-dot { box-shadow: 0 0 0 3px rgba(204,251,241,.9); }
@keyframes agent-orbit { to { transform: rotate(360deg); } }
@keyframes agent-pixel { 0%, 100% { opacity: .18; transform: scale(.82); } 50% { opacity: 1; transform: scale(1); } }
@media (prefers-reduced-motion: reduce) { .agent-loading__pixel, .agent-loading__orbit { animation: none; } }
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
