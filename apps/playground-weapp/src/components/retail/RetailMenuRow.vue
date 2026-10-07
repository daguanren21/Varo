<script setup lang="ts">
import { computed } from 'wevu'
import VButton from '../ui/v-button.vue'
import VIcon from '../ui/v-icon.vue'

const props = withDefaults(
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
const rowClass = computed(() => props.bordered ? 'border-b border-[#dcd6cb]' : '')
</script>

<template>
  <view :class="rowClass">
    <VButton
      block
      variant="ghost"
      tone="default"
      class-name="!min-h-[52px] !w-full !rounded-none !border-0 !px-0 !py-3 !text-left !shadow-none"
      @click="emit('click')"
    >
      <view class="flex w-full min-w-0 items-center justify-between gap-4">
        <view class="grid min-w-0 flex-1 justify-items-start gap-1">
          <text class="text-base font-medium leading-6 text-[#292722]">
            {{ title }}
          </text>
          <text v-if="meta" class="text-[15px] font-normal leading-6 text-[#625e55]">
            {{ meta }}
          </text>
        </view>
        <slot name="trailing">
          <VIcon name="chevron-right" :size="18" color="#625e55" />
        </slot>
      </view>
    </VButton>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
