<script setup lang="ts">
import AgentAttachmentComposer from '../components/agent-ui/AgentAttachmentComposer.vue'
import { VButton } from '../components/ui/button'
import { useAttachmentDemo } from './useAttachmentDemo'

const { prompt, boundPrompt, uncontrolled, rejectPrompt, disabled, grantsEnabled, rejectService, paced, choosing, visible, notice, items, messages, acknowledgements, lifecycle, choose, cancelSelection, updatePrompt, action, submit, close } = useAttachmentDemo()
</script>

<template>
  <section class="mx-auto grid w-full max-w-3xl min-w-0 gap-4" aria-label="本地附件传输演示">
    <header class="grid gap-2">
      <h1 class="m-0 text-2xl font-semibold">
        附件：选择、传输、确认
      </h1>
      <p class="m-0">
        真实本地文件传输服务，不是生产后端或模型。最多 3 个文件，每个不超过 8 MiB，只接受 .txt / .md；服务另外检查 UTF-8 文本内容。
      </p>
      <p class="m-0 text-sm">
        开启慢速时，服务每读取 16 KiB 等待 40ms，使用实际流背压；进度来自浏览器，不能证明服务已保存。服务器关闭时清理其专属临时目录。
      </p>
    </header>
    <div v-if="visible" class="flex flex-wrap gap-2" aria-label="应用演示控制">
      <VButton variant="outline" @click="disabled = !disabled">
        {{ disabled ? '启用输入' : '禁用输入' }}
      </VButton>
      <VButton variant="outline" @click="grantsEnabled = !grantsEnabled">
        {{ grantsEnabled ? '撤销选择和上传授权' : '恢复选择和上传授权' }}
      </VButton>
      <VButton variant="outline" @click="rejectService = !rejectService">
        {{ rejectService ? '恢复本地服务接收' : '让本地服务拒绝上传' }}
      </VButton>
      <VButton variant="outline" @click="paced = !paced">
        {{ paced ? '关闭实际慢速背压' : '启用实际慢速背压' }}
      </VButton>
      <VButton variant="outline" @click="uncontrolled = !uncontrolled">
        {{ uncontrolled ? '使用受控输入' : '使用非受控输入' }}
      </VButton>
      <VButton variant="outline" :disabled="uncontrolled" @click="rejectPrompt = !rejectPrompt">
        {{ rejectPrompt ? '接受提示词更新' : '拒绝提示词更新' }}
      </VButton>
      <VButton variant="outline" :disabled="uncontrolled" @click="prompt = ''">
        外部清空提示词
      </VButton>
      <VButton variant="outline" @click="close">
        关闭并释放附件
      </VButton>
    </div>
    <p class="m-0 whitespace-pre-wrap break-all text-sm" role="status" data-attachment-demo="notice">
      {{ notice }}
    </p>
    <p class="m-0 break-all text-xs" data-attachment-demo="lifecycle">
      {{ lifecycle }}
    </p>
    <AgentAttachmentComposer v-if="visible" :items="items" :model-value="boundPrompt" :disabled="disabled" :can-choose="grantsEnabled" :choosing="choosing" @choose="choose" @cancel-selection="cancelSelection" @update:model-value="updatePrompt" @action="action" @submit="submit" />
    <section class="grid min-w-0 gap-2" aria-label="实际服务确认">
      <h2 class="m-0 text-lg font-semibold">
        实际服务确认
      </h2>
      <p v-if="!acknowledgements.length" class="m-0 text-sm">
        尚无服务确认
      </p>
      <p v-for="receipt in acknowledgements" :key="receipt.id" class="m-0 break-all text-xs" data-attachment-demo="receipt">
        {{ receipt.name }} · id={{ receipt.id }};bytes={{ receipt.bytes }};sha256={{ receipt.sha256 }}
      </p>
    </section>
    <section class="grid min-w-0 gap-2" aria-label="应用接受的消息">
      <h2 class="m-0 text-lg font-semibold">
        应用接受的消息
      </h2>
      <p v-if="!messages.length" class="m-0 text-sm">
        尚未提交消息
      </p>
      <article v-for="message in messages" :key="message.id" class="grid min-w-0 gap-1" data-attachment-demo="message">
        <p class="m-0 whitespace-pre-wrap break-all">
          {{ message.prompt }}
        </p>
        <span class="text-xs">已确认附件数：{{ message.receipts.length }}</span>
        <span v-for="receipt in message.receipts" :key="receipt.id" class="break-all text-xs">{{ receipt.id }} · {{ receipt.bytes }} 字节 · {{ receipt.sha256 }}</span>
      </article>
    </section>
  </section>
</template>
