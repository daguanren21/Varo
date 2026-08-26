<script setup lang="ts">
import { computed } from 'wevu'
import { cn, type ClassValue } from '../../lib/cn'
import { agentShieldAlertIcon } from './agent-icons'

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    description?: string
    details?: Array<{ label: string; value: string }>
    remember?: boolean
    tool: string
  }>(),
  {
    description: '',
    details: () => [],
    remember: false
  }
)

const emit = defineEmits<{
  allow: [options: { remember: boolean }]
  deny: []
  'update:remember': [value: boolean]
}>()

const rootClass = computed(() =>
  cn('agent-tool-approval overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-white to-amber-50 shadow-sm', props.className)
)
</script>

<template>
  <view :class="rootClass" role="group" :aria-label="`Approve ${tool}`">
    <view class="flex items-start gap-3 p-3.5">
      <view class="grid h-9 w-9 flex-none place-items-center rounded-xl bg-amber-100" aria-hidden="true">
        <image class="h-5 w-5" :src="agentShieldAlertIcon" mode="aspectFit" />
      </view>
      <view class="grid min-w-0 flex-1 gap-0.5">
        <text class="text-[9px] font-bold uppercase tracking-[.1em] text-amber-700">Tool permission</text>
        <text class="truncate text-[13px] font-bold text-amber-950">{{ tool }}</text>
        <text v-if="description" class="mt-1 text-[11px] leading-4 text-amber-800">{{ description }}</text>
      </view>
    </view>

    <view v-if="details.length" class="mx-3.5 mb-2.5 grid grid-cols-[auto_minmax(0,1fr)] gap-x-2.5 gap-y-1 rounded-xl border border-amber-200/70 bg-white/70 p-2.5 text-[10px]">
      <template v-for="detail in details" :key="detail.label">
        <text class="text-amber-700">{{ detail.label }}</text>
        <text class="truncate text-right font-semibold text-amber-950">{{ detail.value }}</text>
      </template>
    </view>

    <button class="mx-3.5 mb-3 inline-flex min-h-8 items-center gap-2 border-0 bg-transparent p-0 text-[10px] text-amber-800" type="button" role="checkbox" :aria-checked="remember" @click="emit('update:remember', !remember)">
      <text :class="cn('grid h-4 w-4 place-items-center rounded border text-[10px] font-bold', remember ? 'border-amber-700 bg-amber-700 text-white' : 'border-amber-300 bg-white text-transparent')">✓</text>
      Remember this permission
    </button>

    <view class="agent-tool-approval__actions flex min-h-12 items-center justify-end gap-2 border-t border-amber-100 px-3">
      <button class="min-h-[34px] rounded-[10px] border border-amber-200 bg-white px-3 text-[10px] font-bold text-amber-800" type="button" @click="emit('deny')">Deny</button>
      <button class="min-h-[34px] rounded-[10px] border border-amber-800 bg-amber-800 px-3 text-[10px] font-bold text-white" type="button" @click="emit('allow', { remember })">Allow once</button>
    </view>
  </view>
</template>

<style scoped>
.agent-tool-approval button::after { border: 0; }
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
