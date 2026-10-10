<script setup lang="ts">
import { computed } from 'wevu'
import AgentModelSelector from '../../components/agent-ui/AgentModelSelector.vue'
import AgentChat from '../../components/blocks/agent-chat.vue'
import AgentModelCompare from '../../components/blocks/agent-model-compare.vue'
import VButton from '../../components/ui/v-button.vue'
import { useModelCompareDemo } from './useModelCompareDemo'

const { models, boundPrompt, uncontrolled, rejectPrompt, disabled, visible, ordinaryChat, loading, catalogError, notice, leftState, rightState, leftLifecycle, rightLifecycle, busy, chatDisabled, disabledLabel, promptModeLabel, rejectionLabel, metricsLabel, selection, showMetrics, updatePrompt, changeModel, run, retry, stop, sendChat, newConversation, toggleMode, togglePromptMode, clearPrompt, setCatalog, toggleAvailability, close } = useModelCompareDemo()
const modeLabel = computed(() => ordinaryChat.value ? '显示双侧比较' : '显示普通 Chat 组合')
</script>

<template>
  <view class="box-border grid min-h-screen min-w-0 gap-4 bg-[var(--varo-ui-bg)] p-4 pb-[calc(env(safe-area-inset-bottom)+32px)] text-[var(--varo-ui-text)]" aria-label="模型比较本地演示">
    <view class="grid gap-2">
      <text class="text-2xl font-semibold">
        比较两个独立转换
      </text>
      <text>本地确定性异步演示，不是模型回答。大写、逐词反转和 Unicode 字符计数都实际计算；没有模型服务、网络、价格或 token 测量。</text>
      <text class="text-sm">
        左侧首次执行故意失败；重试保留原提示词且只重启左侧。切换模型清空本侧旧结果，不清空另一侧。可在禁用输入后单独停止。
      </text>
    </view>
    <view v-if="visible" class="flex flex-wrap gap-2" aria-label="应用演示控制">
      <VButton variant="outline" :disabled="busy" @click="toggleMode">
        {{ modeLabel }}
      </VButton>
      <VButton variant="outline" @click="disabled = !disabled">
        {{ disabledLabel }}
      </VButton>
      <VButton variant="outline" :disabled="busy" @click="togglePromptMode">
        {{ promptModeLabel }}
      </VButton>
      <VButton variant="outline" :disabled="busy || uncontrolled" @click="rejectPrompt = !rejectPrompt">
        {{ rejectionLabel }}
      </VButton>
      <VButton variant="outline" :disabled="busy || uncontrolled" @click="clearPrompt">
        外部清空提示词
      </VButton>
      <VButton variant="outline" @click="showMetrics = !showMetrics">
        {{ metricsLabel }}
      </VButton>
      <VButton variant="outline" :disabled="busy" @click="toggleAvailability">
        切换左侧可用性
      </VButton>
      <VButton variant="outline" :disabled="busy" @click="setCatalog('loading')">
        目录加载态
      </VButton>
      <VButton variant="outline" :disabled="busy" @click="setCatalog('error')">
        目录错误态
      </VButton>
      <VButton variant="outline" :disabled="busy" @click="setCatalog('empty')">
        空目录
      </VButton>
      <VButton variant="outline" :disabled="busy" @click="setCatalog('ready')">
        恢复目录
      </VButton>
      <VButton variant="outline" @click="close">
        关闭并清理比较
      </VButton>
    </view>
    <text class="whitespace-pre-wrap break-words text-sm" role="status" data-compare-demo="notice">
      {{ notice }}
    </text>
    <text class="break-words text-xs" data-compare-demo="selection">
      {{ selection }}
    </text>
    <view class="grid gap-1 text-xs" aria-label="本地资源生命周期">
      <text data-compare-demo="left-lifecycle">
        左侧 {{ leftLifecycle }}
      </text>
      <text data-compare-demo="right-lifecycle">
        右侧 {{ rightLifecycle }}
      </text>
    </view>
    <template v-if="visible">
      <view v-if="ordinaryChat" class="grid min-w-0 gap-4" data-compare-demo="ordinary-chat">
        <AgentModelSelector :models="models" :model-value="leftState.modelId" :excluded-id="rightState.modelId" label="普通会话模型" :disabled="disabled || busy" :loading="loading" :error="catalogError" @update:modelValue="changeModel({ side: 'left', modelId: $event })" />
        <AgentChat :model-value="boundPrompt" :messages="leftState.messages" :snapshot="leftState.snapshot" :busy="leftState.busy" :disabled="chatDisabled" title="普通 Chat 与独立选择器" subtitle="选择器在 Chat 外组合，不扩大 Chat 的会话依赖闭包。此处只执行左侧本地转换。" @update:modelValue="updatePrompt" @submit="sendChat" @stop="stop('left')" @retry="retry('left')" @newConversation="newConversation" @close="close" />
      </view>
      <AgentModelCompare v-else :model-value="boundPrompt" :models="models" :left="leftState" :right="rightState" :disabled="disabled" :loading="loading" :error="catalogError" @update:modelValue="updatePrompt" @modelChange="changeModel" @run="run" @retry="retry" @stop="stop" />
    </template>
  </view>
</template>

<json lang="jsonc">
{ "$schema": "https://vite.icebreaker.top/page.json", "navigationBarTitleText": "本地模型比较", "usingComponents": {} }
</json>
