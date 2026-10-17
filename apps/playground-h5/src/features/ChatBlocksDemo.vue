<script setup lang="ts">
import AgentAssistantSheet from '../components/blocks/agent-assistant-sheet.vue'
import AgentChat from '../components/blocks/agent-chat.vue'
import { VButton } from '../components/ui/button'
import { VInput } from '../components/ui/input'
import { useChatBlocksDemo } from './useChatBlocksDemo'

const { activeHistoryId, busy, chatVisible, close, closeChat, context, diagnostic, disabled, draft, expanded, fail, history, insert, layout, messages, newConversation, open, prompt, quote, removeContext, retry, selectedResponse, selectHistory, send, snapshot, stop } = useChatBlocksDemo()
</script>

<template>
  <section id="chat-blocks-demo" class="grid min-w-0 gap-4" aria-label="Chat Blocks 演示">
    <header>
      <h2 class="m-0 text-xl font-semibold">
        对话与上下文助手
      </h2>
      <p>本地确定性流演示。停止会取消控制器；插入只修改下方草稿，不调用外部服务。</p>
    </header>
    <div class="flex flex-wrap gap-2">
      <VButton variant="outline" @click="layout = layout === 'panel' ? 'page' : 'panel'">
        切换页面布局
      </VButton>
      <VButton variant="outline" @click="disabled = !disabled">
        {{ disabled ? '启用输入' : '禁用输入' }}
      </VButton>
      <VButton variant="outline" :disabled="disabled" @click="fail">
        演示错误
      </VButton>
      <VButton variant="outline" :disabled="disabled" @click="quote(false)">
        引用此段
      </VButton>
      <VButton variant="outline" :disabled="disabled" @click="quote(true)">
        引用长段落
      </VButton>
    </div>
    <p class="m-0">
      把复杂任务拆成可以确认的小步骤，保留用户的决定权。
    </p>
    <VInput v-model:value="draft" type="textarea" label="草稿" aria-label="草稿" :rows="4" />
    <output class="break-words text-xs" data-chat-demo="state">{{ diagnostic }}</output>
    <pre class="whitespace-pre-wrap break-words" data-chat-demo="draft">{{ draft }}</pre>
    <AgentChat v-if="chatVisible && !open" v-model="prompt" title="本地写作会话" :layout="layout" :busy="busy" :disabled="disabled" :history="history" :active-history-id="activeHistoryId" :messages="messages" :snapshot="snapshot" :suggestions="['写一段建议']" @submit="send" @stop="stop" @close="closeChat" @history-select="selectHistory" @new-conversation="newConversation" @retry="retry" />
    <VButton v-if="!chatVisible && !open" variant="outline" @click="chatVisible = true">
      打开会话
    </VButton>
    <AgentAssistantSheet v-model="prompt" v-model:open="open" v-model:expanded="expanded" :busy="busy" :disabled="disabled" :context="context" :history="history" :active-history-id="activeHistoryId" :messages="messages" :snapshot="snapshot" :selected-response="selectedResponse" :suggestions="['写一段建议']" @submit="send" @stop="stop" @close="close" @history-select="selectHistory" @new-conversation="newConversation" @remove-context="removeContext" @insert="insert" @retry="retry" />
  </section>
</template>
