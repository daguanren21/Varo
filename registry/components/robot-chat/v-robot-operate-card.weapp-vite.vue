<script setup lang="ts">
import type { VaroRobotChatPlugin } from './robot-chat.types'
import { computed, shallowRef, watch } from 'wevu'
import VButton from './v-button.vue'

const props = defineProps({
  focus: { type: Boolean, default: false },
  height: { type: Number, default: 72 },
  inputText: { type: String, default: '' },
  inputing: { type: Boolean, default: false },
})

const draft = shallowRef(props.inputText)
const canSend = computed(() => draft.value.trim().length > 0)
const rootStyle = computed(() => `min-height:${Math.max(56, Number(props.height) || 72)}px;`)

watch(
  () => props.inputText,
  (value) => {
    if (value !== draft.value) { draft.value = value }
  },
)

function requireRobotPlugin() {
  const runtime = globalThis as typeof globalThis & {
    requirePlugin?: (name: string) => VaroRobotChatPlugin
  }
  if (typeof runtime.requirePlugin !== 'function') {
    throw new Error('VRobotOperateCard requires the WeChat requirePlugin runtime')
  }
  return runtime.requirePlugin('varoRobot')
}

function getChatController() {
  const plugin = requireRobotPlugin()
  if (!plugin || typeof plugin.getChatComponent !== 'function') {
    throw new Error('VRobotOperateCard requires the varoRobot WeChat plugin')
  }
  return plugin.getChatComponent()
}

function eventValue(event: Event) {
  const miniEvent = event as Event & { detail?: { value?: string } }
  const target = event.target as HTMLInputElement | null
  return miniEvent.detail?.value ?? target?.value ?? ''
}

function input(event: Event) {
  draft.value = eventValue(event)
}

function send(event?: Event) {
  const query = event ? eventValue(event).trim() : draft.value.trim()
  if (!query) { return }
  getChatController().send(query)
  draft.value = ''
}

function backHome() {
  getChatController().backHome()
}
</script>

<template>
  <view
    class="box-border flex w-full items-center gap-2 border-t border-[var(--varo-ui-border)] bg-[var(--varo-ui-bg)] px-3 py-2"
    :style="rootStyle"
    :data-inputing="String(props.inputing)"
  >
    <input
      class="box-border h-10 min-w-0 flex-1 rounded-xl border border-[var(--varo-ui-border)] bg-[var(--varo-ui-surface)] px-3 text-sm text-[var(--varo-ui-text)]"
      :value="draft"
      :focus="props.focus"
      aria-label="对话内容"
      placeholder="请输入问题"
      confirm-type="send"
      @input="input"
      @confirm="send($event)"
    >
    <VButton size="sm" tone="default" variant="ghost" class-name="!min-h-10 !rounded-xl !px-3" @click="backHome">
      返回
    </VButton>
    <VButton size="sm" class-name="!min-h-10 !rounded-xl !px-4" :disabled="!canSend" @click="send()">
      发送
    </VButton>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
