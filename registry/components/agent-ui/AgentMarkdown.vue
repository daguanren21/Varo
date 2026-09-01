<script setup lang="ts">
import type { AgentMarkdownViewNode, StreamingMarkdownParser } from '@varo-ui/ai'
import type { PropType } from 'wevu'
import type { ClassValue } from '../../lib/cn'
import {

  createStreamingMarkdownParser,
  normalizeMarkdownNodes,

} from '@varo-ui/ai'
import { computed, shallowRef, watch } from 'wevu'
import { cn } from '../../lib/cn'
import AgentMarkdownNode from './AgentMarkdownNode.vue'

const props = defineProps({
  className: { type: null as unknown as PropType<ClassValue>, default: undefined },
  content: { type: null as unknown as PropType<string>, default: '' },
  customHtmlTags: { type: null as unknown as PropType<string[]>, default: () => [] },
  final: { type: Boolean, default: false },
})

const emit = defineEmits<{
  error: [message: string]
  link: [href: string]
}>()
const customHtmlTags = Array.isArray(props.customHtmlTags) ? props.customHtmlTags : []

let parser: StreamingMarkdownParser | undefined
try {
  parser = createStreamingMarkdownParser({ customHtmlTags })
}
catch (error) {
  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error)
  emit('error', message)
}
let previousContent = ''
const nodes = shallowRef<AgentMarkdownViewNode[]>([])

function updateNodes(content: string, final: boolean) {
  if (!parser) {
    nodes.value = content ? [{ kind: 'text', text: content }] : []
    return
  }
  if (!content.startsWith(previousContent)) {
    parser.reset()
  }
  previousContent = content
  try {
    nodes.value = normalizeMarkdownNodes(parser.parse(content, { final }))
  }
  catch (error) {
    const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error)
    emit('error', message)
    nodes.value = content ? [{ kind: 'text', text: content }] : []
  }
}

watch(
  () => [String(props.content ?? ''), props.final] as const,
  ([content, final]) => updateNodes(content, final),
  { immediate: true },
)
const rootClass = computed(() =>
  cn('agent-markdown break-words text-sm leading-7 text-inherit', props.className),
)
</script>

<template>
  <view :class="rootClass" :data-final="String(final)">
    <AgentMarkdownNode v-for="(node, index) in nodes" :key="index" :node="node" @link="emit('link', $event)" />
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
