<script setup lang="ts">
import type { ChatClientSnapshot } from '@tanstack/ai-client'
import type { A2uiInteraction, A2uiSurfaceView } from './components/session'
import type { PickupLayout } from './pickup-fixture'
import type { PickupCommand, PickupReceipt } from './pickup-run'
import { ChatClient, fetchHttpStream, stream } from '@tanstack/ai-client'
import { computed, onLoad, onUnload, onUnmounted, shallowRef } from 'wevu'
import { agentConversationHistory } from '../../components/agent-ui/presentation'
import AgentChat from '../../components/blocks/agent-chat.vue'
import VButton from '../../components/ui/v-button.vue'
import { createA2uiSession } from './components/session'
import VAgentSurface from './components/VAgentSurface.vue'
import { pickupSurfaceId } from './pickup-fixture'
import { createPickupRunner, pickupReceiptEvent, pickupSurfaceEvent } from './pickup-run'

const surfaces = shallowRef<readonly A2uiSurfaceView[]>([])
const snapshot = shallowRef<ChatClientSnapshot | undefined>(undefined)
const messages = computed(() => snapshot.value ? agentConversationHistory(snapshot.value) : [])
const pending = shallowRef(false)
const unavailable = computed(() => !snapshot.value || pending.value)
const surfaceControlsDisabled = computed(() => unavailable.value || !surfaces.value.length)
const networkTest = shallowRef(false)
const receipt = shallowRef<PickupReceipt | undefined>(undefined)
const receiptText = computed(() => receipt.value ? JSON.stringify(receipt.value.message, null, 2) : '')
const received = computed(() => receipt.value?.count ?? 0)
const receiptSource = computed(() => networkTest.value ? '测试服务端' : '本地连接')
const error = shallowRef('')
let client: ChatClient | undefined
let unsubscribe: (() => void) | undefined
let disposed = false

function showError(cause: unknown) {
  if (!disposed) { error.value = cause instanceof Error ? cause.message : String(cause) }
}

function isPickupReceipt(value: unknown): value is PickupReceipt {
  return typeof value === 'object' && value !== null
    && 'count' in value && typeof value.count === 'number' && Number.isSafeInteger(value.count) && value.count > 0
    && 'message' in value && typeof value.message === 'object' && value.message !== null
}

async function run(prompt: string, pickup: PickupCommand) {
  if (!client || pending.value || disposed) { return }
  error.value = ''
  pending.value = true
  if (pickup.type === 'create') { receipt.value = undefined }
  try {
    await client.sendMessage(prompt, { pickup })
  }
  catch (cause) {
    showError(cause)
  }
  finally {
    pending.value = false
  }
}

const session = createA2uiSession({
  onSurfaces: (views) => { surfaces.value = views },
  onAction: message => run('确认取件时间', { type: 'action', message }),
})

onLoad((query) => {
  const port = query?.testPort
  networkTest.value = typeof port === 'string' && /^[1-9]\d{0,4}$/.test(port) && Number(port) <= 65535
  const localRun = createPickupRunner()
  const next = new ChatClient({
    threadId: 'varo-a2ui-pickup-demo',
    connection: networkTest.value
      ? fetchHttpStream(`http://127.0.0.1:${port}/a2ui`)
      : stream((_messages, _data, _signal, input) => localRun(input)),
    onCustomEvent(name, value) {
      if (disposed) { return }
      try {
        if (name === pickupSurfaceEvent) { session.receive(value) }
        if (name === pickupReceiptEvent) {
          if (!isPickupReceipt(value)) { throw new Error('测试服务返回了无效的取件回执') }
          receipt.value = value
        }
      }
      catch (cause) {
        showError(cause)
      }
    },
    onError: showError,
  })
  client = next
  snapshot.value = next.getSnapshot()
  unsubscribe = next.subscribeSnapshot(() => { snapshot.value = next.getSnapshot() })
})

function selectLayout(layout: PickupLayout) {
  return run(layout === 'flat' ? '创建单层取件卡片' : '创建嵌套取件卡片', { type: 'create', layout })
}

function reset() {
  client?.clear()
  receipt.value = undefined
  error.value = ''
  session.receive({ version: '1.0', deleteSurface: { surfaceId: pickupSurfaceId } })
}

function close() {
  void wx.navigateBack({ fail: () => { void wx.reLaunch({ url: '/pages/retail-home/index' }) } })
}

function stop() {
  client?.stop()
}

async function interact(surfaceId: string, event: A2uiInteraction) {
  if (pending.value || disposed) { return }
  try {
    await session.interact(surfaceId, event)
  }
  catch (cause) {
    showError(cause)
  }
}

function dispose() {
  if (disposed) { return }
  disposed = true
  unsubscribe?.()
  client?.dispose()
  session.dispose()
}

onUnload(dispose)
onUnmounted(dispose)
</script>

<template>
  <view class="grid gap-4 p-4">
    <text class="text-lg font-semibold">
      A2UI 取件卡片
    </text>
    <text class="text-sm">
      两套布局通过 TanStack AI 的 AG-UI 自定义事件更新同一个原生渲染器。
    </text>
    <view class="flex flex-wrap gap-2">
      <VButton aria-label="布局 A" variant="outline" :disabled="unavailable" @click="selectLayout('flat')">
        A · 单层卡片
      </VButton>
      <VButton aria-label="布局 B" variant="outline" :disabled="unavailable" @click="selectLayout('nested')">
        B · 嵌套卡片
      </VButton>
      <VButton aria-label="下发数据更新" variant="outline" :disabled="surfaceControlsDisabled" @click="run('下发数据更新', { type: 'update' })">
        下发数据更新
      </VButton>
      <VButton aria-label="删除卡片" variant="outline" :disabled="surfaceControlsDisabled" @click="run('删除取件卡片', { type: 'delete' })">
        删除卡片
      </VButton>
    </view>
    <AgentChat
      title="A2UI 取件会话"
      subtitle="卡片位于会话的 context 插槽"
      :busy="pending"
      :messages="messages"
      :snapshot="snapshot"
      :suggestions="['打开取件卡片']"
      @submit="run($event, { type: 'create', layout: 'flat' })"
      @stop="stop"
      @newConversation="reset"
      @close="close"
    >
      <template #context>
        <VAgentSurface
          v-for="surface in surfaces"
          :key="surface.id"
          :surface="surface"
          :disabled="pending"
          @interaction="interact(surface.id, $event)"
        />
      </template>
    </AgentChat>
    <text v-if="error" id="a2ui-error" role="alert">
      {{ error }}
    </text>
    <text id="a2ui-action-count">
      {{ receiptSource }}收到 action：{{ received }} 次
    </text>
    <text v-if="receiptText" id="a2ui-action-payload" user-select class="whitespace-pre-wrap break-words text-xs">
      {{ receiptText }}
    </text>
  </view>
</template>

<json lang="jsonc">
{
  "navigationBarTitleText": "A2UI 取件卡片"
}
</json>
