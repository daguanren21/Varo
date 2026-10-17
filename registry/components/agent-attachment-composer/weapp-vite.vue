<script setup lang="ts">
import type { AttachmentAction, AttachmentActionIntent, AttachmentItem, AttachmentSubmitIntent } from './agent-attachment-composer.types'
import { useControllableState } from '@varo-ui/headless'
import { computed } from 'wevu'
import { varoReactiveRuntime } from '../../lib/varo-primitives'
import VButton from '../ui/v-button.vue'
import { attachmentActionAllowed, attachmentCanSubmit, attachmentPresentation } from './agent-attachment-composer.types'
import AgentComposer from './AgentComposer.vue'

defineOptions({ properties: {
  items: { type: Array, value: [] },
  suggestions: { type: Array, value: [] },
  modelValue: { type: null, value: null },
} })
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
const rows = computed(() => props.items.map(item => ({ ...attachmentPresentation(item, props.disabled || props.busy), mimeLabel: item.file.mime || 'MIME 未知' })))
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
  <view class="grid min-w-0 gap-3" aria-label="附件输入">
    <view class="flex flex-wrap gap-2">
      <VButton variant="outline" :disabled="!canChoose || disabled || busy || choosing" @click="choose">
        选择附件
      </VButton>
      <VButton v-if="choosing" variant="outline" @click="cancelSelection">
        取消选择
      </VButton>
    </view>
    <view class="grid min-w-0 gap-3" aria-label="附件列表">
      <view v-for="row in rows" :key="row.file.id" class="grid min-w-0 gap-2 rounded-xl border border-[var(--varo-ui-border-lighter)] p-3" :data-attachment-id="row.file.id" :data-attachment-status="row.status">
        <text class="break-all font-semibold">
          {{ row.file.name }}
        </text>
        <text class="text-sm">
          {{ row.file.size }} 字节 · {{ row.mimeLabel }}
        </text>
        <text role="status">
          {{ row.statusLabel }}
        </text>
        <text class="text-xs" data-attachment-progress="true">
          {{ row.progressLabel }}
        </text>
        <text v-if="row.failureLabel" class="whitespace-pre-wrap break-all text-sm" role="alert">
          {{ row.failureLabel }}
        </text>
        <view class="flex flex-wrap gap-2">
          <VButton v-for="control in row.actions" :key="control.action" variant="outline" :disabled="control.disabled" :aria-label="control.label" @click="act(row.file.id, control.action)">
            {{ control.label }}
          </VButton>
        </view>
      </view>
    </view>
    <text v-if="transferBlocked" class="text-sm" role="status">
      附件尚未全部获得服务确认；请上传、重试或移除后发送。
    </text>
    <AgentComposer :model-value="currentPrompt" :disabled="disabled" :busy="busy" :submit-disabled="transferBlocked" :suggestions="suggestions" aria-label="附件消息" placeholder="输入附件说明" @update:modelValue="updatePrompt" @submit="submit" />
  </view>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
