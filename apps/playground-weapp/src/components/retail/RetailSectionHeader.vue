<script setup lang="ts">
import VButton from '../ui/v-button.vue'

withDefaults(
  defineProps<{
    action?: string
    eyebrow?: string
    subtitle?: string
    title: string
  }>(),
  {
    action: '',
    eyebrow: '',
    subtitle: '',
  },
)

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <view class="flex items-end justify-between gap-3">
    <view class="grid min-w-0 gap-0.5">
      <text v-if="eyebrow" class="text-[9px] font-black uppercase tracking-[0.16em] text-teal-700">
        {{ eyebrow }}
      </text>
      <text class="text-lg font-black tracking-tight text-slate-950">
        {{ title }}
      </text>
      <text v-if="subtitle" class="truncate text-[10px] text-slate-400">
        {{ subtitle }}
      </text>
    </view>
    <VButton
      v-if="action"
      size="sm"
      variant="ghost"
      tone="default"
      class-name="!min-h-8 !flex-none !p-0 !text-[11px] !font-bold !text-teal-700"
      @click="emit('action')"
    >
      {{ action }}
      <text aria-hidden="true">
        ›
      </text>
    </VButton>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
