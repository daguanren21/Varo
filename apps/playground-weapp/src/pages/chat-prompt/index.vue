<script setup lang="ts">
import { computed, shallowRef } from 'wevu'
import AgentChat from '../../components/blocks/agent-chat.vue'
import VButton from '../../components/ui/v-button.vue'

const controlled = shallowRef(false)
const accepting = shallowRef(true)
const busy = shallowRef(false)
const prompt = shallowRef('')
const offered = shallowRef('')
const submitted = shallowRef('')
const submissions = shallowRef(0)
const suppliedPrompt = computed(() => controlled.value ? prompt.value : undefined)
const ownershipLabel = computed(() => controlled.value ? '使用组件草稿' : '使用应用草稿')
const acceptanceLabel = computed(() => accepting.value ? '暂停接收修改' : '接收输入修改')
const receipt = computed(() => `提交 ${submissions.value} 次：${submitted.value}`)

function updatePrompt(value: string) {
  offered.value = value
  if (controlled.value && accepting.value) { prompt.value = value }
}
function submit(value: string) {
  submitted.value = value
  submissions.value += 1
}
</script>

<template>
  <view class="grid min-h-screen min-w-0 gap-4 bg-[var(--varo-ui-bg)] p-4 text-[var(--varo-ui-text)]">
    <text class="text-xl font-semibold">
      Chat 输入所有权
    </text>
    <text>属性演示，不连接模型。组件草稿由 Block 保存；应用草稿只反映宿主接受的值。处理中仍可编辑，但不能再次提交。</text>
    <view class="flex flex-wrap gap-2">
      <VButton variant="outline" :disabled="busy" @click="controlled = !controlled">
        {{ ownershipLabel }}
      </VButton>
      <VButton variant="outline" :disabled="!controlled" @click="accepting = !accepting">
        {{ acceptanceLabel }}
      </VButton>
      <VButton variant="outline" :disabled="!controlled" @click="prompt = ''">
        清空应用草稿
      </VButton>
      <VButton variant="outline" :disabled="busy" @click="busy = true">
        开始处理
      </VButton>
    </view>
    <AgentChat
      title="输入契约演示"
      :model-value="suppliedPrompt"
      :busy="busy"
      @update:modelValue="updatePrompt"
      @submit="submit"
      @stop="busy = false"
    />
    <text class="whitespace-pre-wrap break-words" data-prompt-demo="offered">
      {{ offered }}
    </text>
    <text class="whitespace-pre-wrap break-words" data-prompt-demo="receipt">
      {{ receipt }}
    </text>
  </view>
</template>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationBarTitleText": "Chat 输入所有权",
  "usingComponents": {}
}
</json>
