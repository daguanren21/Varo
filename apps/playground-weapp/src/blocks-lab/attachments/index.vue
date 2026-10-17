<script setup lang="ts">
import { computed } from 'wevu'
import AgentAttachmentComposer from '../../components/agent-ui/AgentAttachmentComposer.vue'
import VButton from '../../components/ui/v-button.vue'
import VInput from '../../components/ui/v-input.vue'
import { useAttachmentDemo } from './useAttachmentDemo'

const { prompt, boundPrompt, uncontrolled, rejectPrompt, disabled, grantsEnabled, rejectService, paced, choosing, visible, notice, items, messages, acknowledgements, lifecycle, serviceUrl, serviceNotice, running, updateService, choose, cancelSelection, updatePrompt, action, submit, close } = useAttachmentDemo()
const disabledLabel = computed(() => disabled.value ? '启用输入' : '禁用输入')
const grantsLabel = computed(() => grantsEnabled.value ? '撤销选择和上传授权' : '恢复选择和上传授权')
const serviceLabel = computed(() => rejectService.value ? '恢复本地服务接收' : '让本地服务拒绝上传')
const pacingLabel = computed(() => paced.value ? '关闭实际慢速背压' : '启用实际慢速背压')
const modeLabel = computed(() => uncontrolled.value ? '使用受控输入' : '使用非受控输入')
const promptLabel = computed(() => rejectPrompt.value ? '接受提示词更新' : '拒绝提示词更新')
</script>

<template>
  <view class="box-border grid min-h-screen min-w-0 gap-4 bg-[var(--varo-ui-bg)] p-4 pb-[calc(env(safe-area-inset-bottom)+32px)] text-[var(--varo-ui-text)]" aria-label="本地附件传输演示">
    <view class="grid gap-2">
      <text class="text-2xl font-semibold">
        附件：选择、传输、确认
      </text>
      <text>真实本地文件传输服务，不是生产后端或模型。最多 3 个文件，每个不超过 8 MiB，只接受 .txt / .md；服务另外检查 UTF-8 文本内容。</text>
      <text class="text-sm">
        慢速服务每读取 16 KiB 等待 40ms，使用实际背压。进度来自 UploadTask，不代表服务确认。原生选择、权限和上传需要真实授权宿主；取消仅作废选择结果，不能保证关闭系统选择器。
      </text>
    </view>
    <view v-if="visible" class="grid gap-2">
      <VInput :value="serviceUrl" :disabled="running" :max-length="2048" label="应用配置的服务 URL" aria-label="应用配置的服务 URL" placeholder="填写设备可达的完整上传服务 URL" @update:value="updateService" />
      <text class="break-all text-sm" role="status" data-attachment-demo="service">
        {{ serviceNotice }}
      </text>
      <view class="flex flex-wrap gap-2" aria-label="应用演示控制">
        <VButton variant="outline" @click="disabled = !disabled">
          {{ disabledLabel }}
        </VButton>
        <VButton variant="outline" @click="grantsEnabled = !grantsEnabled">
          {{ grantsLabel }}
        </VButton>
        <VButton variant="outline" @click="rejectService = !rejectService">
          {{ serviceLabel }}
        </VButton>
        <VButton variant="outline" @click="paced = !paced">
          {{ pacingLabel }}
        </VButton>
        <VButton variant="outline" @click="uncontrolled = !uncontrolled">
          {{ modeLabel }}
        </VButton>
        <VButton variant="outline" :disabled="uncontrolled" @click="rejectPrompt = !rejectPrompt">
          {{ promptLabel }}
        </VButton>
        <VButton variant="outline" :disabled="uncontrolled" @click="prompt = ''">
          外部清空提示词
        </VButton>
        <VButton variant="outline" @click="close">
          关闭并释放附件
        </VButton>
      </view>
    </view>
    <text class="whitespace-pre-wrap break-all text-sm" role="status" data-attachment-demo="notice">
      {{ notice }}
    </text>
    <text class="break-all text-xs" data-attachment-demo="lifecycle">
      {{ lifecycle }}
    </text>
    <AgentAttachmentComposer v-if="visible" :items="items" :model-value="boundPrompt" :disabled="disabled" :can-choose="grantsEnabled" :choosing="choosing" @choose="choose" @cancelSelection="cancelSelection" @update:modelValue="updatePrompt" @action="action" @submit="submit" />
    <view class="grid min-w-0 gap-2" aria-label="实际服务确认">
      <text class="text-lg font-semibold">
        实际服务确认
      </text>
      <text v-if="!acknowledgements.length" class="text-sm">
        尚无服务确认
      </text>
      <text v-for="receipt in acknowledgements" :key="receipt.id" class="break-all text-xs" data-attachment-demo="receipt">
        {{ receipt.name }} · id={{ receipt.id }};bytes={{ receipt.bytes }};sha256={{ receipt.sha256 }}
      </text>
    </view>
    <view class="grid min-w-0 gap-2" aria-label="应用接受的消息">
      <text class="text-lg font-semibold">
        应用接受的消息
      </text>
      <text v-if="!messages.length" class="text-sm">
        尚未提交消息
      </text>
      <view v-for="message in messages" :key="message.id" class="grid min-w-0 gap-1" data-attachment-demo="message">
        <text class="whitespace-pre-wrap break-all">
          {{ message.prompt }}
        </text>
        <text class="text-xs">
          已确认附件数：{{ message.receipts.length }}
        </text>
        <text v-for="receipt in message.receipts" :key="receipt.id" class="break-all text-xs">
          {{ receipt.id }} · {{ receipt.bytes }} 字节 · {{ receipt.sha256 }}
        </text>
      </view>
    </view>
  </view>
</template>

<json lang="jsonc">
{ "$schema": "https://vite.icebreaker.top/page.json", "navigationBarTitleText": "本地附件传输", "usingComponents": {} }
</json>
