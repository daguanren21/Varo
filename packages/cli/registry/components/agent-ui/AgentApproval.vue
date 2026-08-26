<script setup lang="ts">
import { computed, shallowRef } from 'wevu'
import VButton from '../ui/v-button.vue'
import VCard from '../ui/v-card.vue'
import AgentRadioGroup from './AgentRadioGroup.vue'
import type { AgentChoice } from './types'

const props = withDefaults(
  defineProps<{
    approveText?: string
    choices?: AgentChoice[]
    defaultValue?: string
    description?: string
    rejectText?: string
    title: string
    value?: string
    warning?: string
  }>(),
  {
    approveText: '确认执行',
    choices: () => [],
    defaultValue: '',
    description: '',
    rejectText: '取消',
    value: undefined,
    warning: ''
  }
)

const emit = defineEmits<{
  approve: [value: string]
  reject: []
  'update:value': [value: string]
}>()

const internalValue = shallowRef(props.value ?? props.defaultValue)
const currentValue = computed(() => props.value ?? internalValue.value)


function select(value: string) {
  internalValue.value = value
  emit('update:value', value)
}

function approve() {
  if (currentValue.value) emit('approve', currentValue.value)
}
</script>

<template>
  <VCard class="agent-approval !overflow-visible" :padding="false" variant="outline" role="group" :aria-label="title">
    <view class="grid gap-3.5 rounded-2xl bg-[linear-gradient(145deg,#fff_0%,#fffbeb_100%)] p-[15px] shadow-[0_8px_24px_rgba(120,53,15,.08)]">
    <view class="flex items-start gap-3">
      <view class="grid h-[34px] w-[34px] flex-none place-items-center rounded-[11px] bg-orange-100 font-extrabold text-orange-700" aria-hidden="true">
        <text>!</text>
      </view>
      <view class="grid min-w-0 flex-1 gap-[3px]">
        <text class="text-[10px] font-extrabold tracking-[.12em] text-orange-700">需要你的确认</text>
        <text class="text-[15px] font-extrabold leading-[1.45] text-orange-950">{{ title }}</text>
        <text v-if="description" class="text-xs leading-[1.55] text-orange-800">{{ description }}</text>
      </view>
    </view>

    <AgentRadioGroup v-if="choices.length" :choices="choices" :value="currentValue" @update:value="select" />
    <text v-if="warning" class="rounded-[9px] bg-red-50 px-2.5 py-2 text-[11px] leading-[1.45] text-red-700" role="alert">{{ warning }}</text>
    <slot />

    <view class="flex justify-end gap-2">
      <VButton variant="ghost" @click="emit('reject')">{{ rejectText }}</VButton>
      <VButton :disabled="choices.length > 0 && !currentValue" @click="approve">{{ approveText }}</VButton>
    </view>
    </view>
  </VCard>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
