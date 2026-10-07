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
  <view class="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
    <view class="grid min-w-0 gap-1">
      <text v-if="eyebrow" class="text-[15px] leading-6 text-[#625e55]">
        {{ eyebrow }}
      </text>
      <text class="retail-heading text-[22px] leading-8 text-[#292722]">
        {{ title }}
      </text>
      <text v-if="subtitle" class="whitespace-normal text-[15px] leading-6 text-[#625e55]">
        {{ subtitle }}
      </text>
    </view>
    <VButton
      v-if="action"
      size="md"
      variant="ghost"
      tone="default"
      class-name="!min-h-11 !flex-none !rounded-[3px] !px-2 !text-[15px] !font-medium !text-[#86543c]"
      @click="emit('action')"
    >
      {{ action }}
    </VButton>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
