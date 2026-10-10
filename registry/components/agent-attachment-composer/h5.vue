<script setup lang="ts">
import type { AttachmentAction, AttachmentActionIntent, AttachmentItem, AttachmentSubmitIntent } from './agent-attachment-composer.types'
import { useControllableState } from '@varo-ui/headless'
import { computed } from 'vue'
import { varoReactiveRuntime } from '../../lib/varo-primitives'
import { VButton } from '../ui/button'
import { attachmentActionAllowed, attachmentCanSubmit, attachmentPresentation } from './agent-attachment-composer.types'
import { AgentComposer } from './conversation'

const props = withDefaults(defineProps<{
  items?: AttachmentItem[]
  modelValue?: string
  disabled?: boolean
  busy?: boolean
  canChoose?: boolean
  choosing?: boolean
  suggestions?: string[]
}>(), { items: () => [], disabled: false, busy: false, canChoose: false, choosing: false, suggestions: () => [] })
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'choose': []
  'cancelSelection': []
  'action': [intent: AttachmentActionIntent]
  'submit': [intent: AttachmentSubmitIntent]
}>()
const promptState = useControllableState<string>({
  runtime: varoReactiveRuntime,
  controlled: computed(() => props.modelValue != null),
  value: computed(() => props.modelValue ?? ''),
  defaultValue: '',
  onUpdate: value => emit('update:modelValue', value),
})
const currentPrompt = computed(() => promptState.current.value)
const transferBlocked = computed(() => props.choosing || !attachmentCanSubmit(props.items))
const rows = computed(() => props.items.map(item => attachmentPresentation(item, props.disabled || props.busy)))
function updatePrompt(value: string) {
  if (!props.disabled && value !== currentPrompt.value) { promptState.current.value = value }
}
function choose() {
  if (props.canChoose && !props.disabled && !props.busy && !props.choosing) { emit('choose') }
}
function cancelSelection() {
  if (props.choosing) { emit('cancelSelection') }
}
function act(id: string, action: AttachmentAction) {
  const item = props.items.find(candidate => candidate.file.id === id)
  if (item && attachmentActionAllowed(item, action, props.disabled || props.busy)) { emit('action', { id, action }) }
}
function submit(prompt: string) {
  if (props.disabled || props.busy || props.choosing || !prompt.trim() || !attachmentCanSubmit(props.items)) { return }
  emit('submit', { prompt: prompt.trim(), attachments: props.items.map(item => ({ file: item.file, receipt: item.receipt })) })
}
</script>

<template>
  <section class="grid min-w-0 gap-3" aria-label="附件输入">
    <div class="flex flex-wrap gap-2">
      <VButton variant="outline" :disabled="!canChoose || disabled || busy || choosing" @click="choose">
        选择附件
      </VButton>
      <VButton v-if="choosing" variant="outline" @click="cancelSelection">
        取消选择
      </VButton>
    </div>
    <ul class="m-0 grid min-w-0 list-none gap-3 p-0" aria-label="附件列表">
      <li v-for="row in rows" :key="row.file.id" class="grid min-w-0 gap-2 rounded-xl border border-[var(--varo-ui-border-lighter)] p-3" :data-attachment-id="row.file.id" :data-attachment-status="row.status">
        <strong class="break-all">{{ row.file.name }}</strong>
        <span class="text-sm">{{ row.file.size }} 字节 · {{ row.file.mime || 'MIME 未知' }}</span>
        <span role="status">{{ row.statusLabel }}</span>
        <span class="text-xs" data-attachment-progress>{{ row.progressLabel }}</span>
        <p v-if="row.failureLabel" class="m-0 whitespace-pre-wrap break-all text-sm" role="alert">
          {{ row.failureLabel }}
        </p>
        <div class="flex flex-wrap gap-2">
          <VButton v-for="control in row.actions" :key="control.action" variant="outline" :disabled="control.disabled" :aria-label="control.label" @click="act(row.file.id, control.action)">
            {{ control.label }}
          </VButton>
        </div>
      </li>
    </ul>
    <p v-if="transferBlocked" class="m-0 text-sm" role="status">
      附件尚未全部获得服务确认；请上传、重试或移除后发送。
    </p>
    <AgentComposer :model-value="currentPrompt" :disabled="disabled" :busy="busy" :submit-disabled="transferBlocked" :suggestions="suggestions" aria-label="附件消息" placeholder="输入附件说明" @update:model-value="updatePrompt" @submit="submit" />
  </section>
</template>

<style>
/* Registry styles: generated from the dependency closure. */
@import '../../styles/varo.css';
@import '../../styles/varo-agent.css';
@import './agent-conversation.css';
@import './agent-markdown.css';
@import '../../styles/varo-button.css';
</style>
