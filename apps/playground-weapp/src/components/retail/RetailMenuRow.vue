<script setup lang="ts">
import VButton from '../ui/v-button.vue'

withDefaults(
  defineProps<{
    bordered?: boolean
    meta?: string
    title: string
  }>(),
  {
    bordered: true,
    meta: '',
  },
)

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <VButton
    block
    variant="ghost"
    tone="default"
    class-name="!flex !min-h-12 !w-full !items-center !justify-between !rounded-none !border-0 !bg-transparent !p-0 !text-left !shadow-none"
    :class="bordered ? 'border-b border-slate-100' : ''"
    @click="emit('click')"
  >
    <view class="grid min-w-0 flex-1 justify-items-start gap-0.5">
      <text class="text-sm font-bold text-slate-900">
        {{ title }}
      </text>
      <text v-if="meta" class="text-[9px] text-slate-400">
        {{ meta }}
      </text>
    </view>
    <slot name="trailing">
      <text class="text-slate-300" aria-hidden="true">
        ›
      </text>
    </slot>
  </VButton>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
