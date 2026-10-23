<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef, watch } from 'wevu'

defineOptions({
  properties: {
    startedAt: { type: null, value: null },
  },
})

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
    variant: 'grid',
  },
)

const elapsed = shallowRef(0)
let timer: ReturnType<typeof setInterval> | undefined
const mountedAt = Date.now()
const elapsedLabel = computed(() => `${elapsed.value.toFixed(1)}s`)
const pixelCount = computed(() => (props.variant === 'dots' ? 3 : 9))
const inactiveClass = computed(() => (props.active ? '' : 'agent-loading--inactive'))
const indicatorClass = computed(() => {
  if (props.variant === 'dots') {
    return 'flex h-5 w-[30px] flex-none items-center gap-1 bg-transparent'
  }
  return 'box-border grid h-[30px] w-[30px] flex-none grid-cols-3 grid-rows-3 gap-[3px] rounded-[10px] bg-[var(--varo-agent-fill)] p-1'
})
const pixelClass = computed(() => props.variant === 'dots' ? 'h-1.5 w-1.5 rounded-full' : 'h-full w-full rounded-sm')

function updateElapsed() {
  elapsed.value = Math.max(0, (Date.now() - (props.startedAt ?? mountedAt)) / 1000)
}

function start() {
  if (timer || !props.active) { return }
  updateElapsed()
  timer = setInterval(updateElapsed, 100)
}

function stop() {
  clearInterval(timer)
  timer = undefined
}

watch(() => props.active, active => (active ? start() : stop()))
if (props.active) { start() }
onBeforeUnmount(stop)
</script>

<template>
  <view class="agent-loading flex min-h-12 items-center gap-3 text-[var(--varo-agent-foreground)]" :class="inactiveClass" :data-active="String(active)" role="status">
    <view
      v-if="variant !== 'orbit'"
      :class="indicatorClass"
      aria-hidden="true"
    >
      <text
        v-for="index in pixelCount"
        :key="index"
        class="agent-loading__pixel block flex-none bg-[var(--varo-agent-primary)] opacity-20"
        :class="pixelClass"
        :style="{ animationDelay: `${index * 45}ms` }"
      />
    </view>
    <view v-else class="agent-loading__orbit relative h-[30px] w-[30px] flex-none rounded-full border border-[var(--varo-agent-border-strong)]" aria-hidden="true">
      <text class="agent-loading__orbit-dot absolute left-1/2 top-[-2px] h-2 w-2 -translate-x-1/2 rounded-full bg-[var(--varo-agent-primary)]" />
    </view>
    <view class="flex min-w-0 flex-1 items-baseline justify-between gap-3">
      <text class="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-semibold">
        {{ label }}
      </text>
      <text class="flex-none text-[12px] tabular-nums text-[var(--varo-agent-muted)]">
        {{ elapsedLabel }}
      </text>
    </view>
  </view>
</template>

<style>
.agent-loading__pixel {
  animation: agent-pixel 1.1s ease-in-out infinite;
}

.agent-loading__orbit {
  animation: agent-orbit 1.2s linear infinite;
}

.agent-loading--inactive .agent-loading__pixel,
.agent-loading--inactive .agent-loading__orbit {
  animation-play-state: paused;
}

.agent-loading__orbit-dot {
  box-shadow: 0 0 0 3px var(--varo-agent-primary-soft);
}

@keyframes agent-orbit {
  to {
    transform: rotate(360deg);
  }
}

@keyframes agent-pixel {
  0%,
  100% {
    opacity: 0.18;
    transform: scale(0.82);
  }

  50% {
    opacity: 1;
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .agent-loading__pixel,
  .agent-loading__orbit {
    animation: none;
  }
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
