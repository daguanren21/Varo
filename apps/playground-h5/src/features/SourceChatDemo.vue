<script setup lang="ts">
import AgentSourceChat from '../components/blocks/agent-source-chat.vue'
import { VButton } from '../components/ui/button'
import { useSourceChatDemo } from './useSourceChatDemo'

const { sources, uncontrolled, boundPrompt, promptModeLabel, disabled, disabledLabel, visible, messages, retrieval, receipts, citations, responseState, responseDetail, ticket, ticketRequest, documentTitle, documentContent, question, locked, canResolve, canRead, connectionDisabled, availabilityLabel, diagnostic, updatePrompt, submit, read, resolve, retryRetrieval, toggleSource, connectSource, completeConnection, toggleAvailability, openCitation, openReceipt, connectReceipt, createTicket, stop, newConversation, togglePromptMode, close } = useSourceChatDemo()
</script>

<template>
  <section id="source-chat-demo" class="mx-auto grid w-full max-w-3xl min-w-0 gap-4" aria-label="Source Chat 演示">
    <header class="grid gap-2">
      <h2 class="m-0 text-xl font-semibold">
        知识来源与客服转交
      </h2>
      <p class="m-0">
        本地确定性演示。数据由页面注入；没有模型、网络、账号连接、存储或真实工单。请先提问，再用下方控制推进演示。
      </p>
    </header>
    <div class="flex flex-wrap gap-2" role="group" aria-label="本地演示控制">
      <VButton variant="outline" @click="disabled = !disabled">
        {{ disabledLabel }}
      </VButton>
      <VButton variant="outline" :disabled="locked" @click="toggleAvailability">
        {{ availabilityLabel }}
      </VButton>
      <VButton variant="outline" :disabled="connectionDisabled" @click="completeConnection">
        完成演示连接
      </VButton>
      <VButton variant="outline" :disabled="locked" @click="togglePromptMode">
        {{ promptModeLabel }}
      </VButton>
      <VButton variant="outline" :disabled="!canRead" @click="read">
        演示读取
      </VButton>
      <VButton variant="outline" :disabled="!canResolve" @click="resolve('answered')">
        演示成功
      </VButton>
      <VButton variant="outline" :disabled="!canResolve" @click="resolve('failed')">
        演示失败
      </VButton>
      <VButton variant="outline" :disabled="!canResolve" @click="resolve('empty')">
        演示空结果
      </VButton>
      <VButton variant="outline" :disabled="!canResolve" @click="resolve('out-of-scope')">
        演示超出范围
      </VButton>
    </div>
    <output class="break-words text-xs" data-source-demo="state">{{ diagnostic }}</output>
    <p class="m-0 break-words" data-source-demo="question">
      当前问题：{{ question }}
    </p>
    <p class="m-0 break-words" data-source-demo="ticket">
      {{ ticketRequest }}
    </p>
    <aside v-if="documentTitle" class="grid gap-2 rounded-xl border border-[var(--varo-ui-border-lighter)] bg-[var(--varo-ui-surface-muted)] p-4" aria-label="本地来源预览" data-source-demo="document">
      <strong>{{ documentTitle }}</strong>
      <p class="m-0 whitespace-pre-wrap break-words">
        {{ documentContent }}
      </p>
    </aside>
    <AgentSourceChat v-if="visible" :key="String(uncontrolled)" :model-value="boundPrompt" title="本地知识问答" :disabled="disabled" :sources="sources" :messages="messages" :retrieval="retrieval" :receipts="receipts" :citations="citations" :response-state="responseState" :response-detail="responseDetail" :ticket="ticket" :suggestions="['如何申请退货？']" @update:model-value="updatePrompt" @submit="submit" @toggle-source="toggleSource" @connect-source="connectSource" @retry-retrieval="retryRetrieval" @open-receipt="openReceipt" @connect-receipt="connectReceipt" @open-citation="openCitation" @create-ticket="createTicket" @stop="stop" @new-conversation="newConversation" @close="close" />
    <VButton v-else variant="outline" @click="visible = true">
      打开知识问答
    </VButton>
  </section>
</template>
