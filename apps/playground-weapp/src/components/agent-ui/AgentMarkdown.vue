<script setup lang="ts">
import type { AgentMarkdownViewNode, StreamingMarkdownParser } from '@varo-ui/ai'
import type { ClassValue } from '../../lib/cn'
import {

  createStreamingMarkdownParser,
  normalizeMarkdownNodes,

} from '@varo-ui/ai'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'
import AgentMarkdownNode from './AgentMarkdownNode.vue'

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    content?: string
    customHtmlTags?: string[]
    final?: boolean
  }>(),
  {
    content: '',
    customHtmlTags: () => [],
    final: false,
  },
)

const emit = defineEmits<{
  error: [message: string]
  link: [href: string]
}>()

let parser: StreamingMarkdownParser | undefined
try {
  parser = createStreamingMarkdownParser({ customHtmlTags: props.customHtmlTags })
}
catch (error) {
  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error)
  emit('error', message)
}
let previousContent = ''
const nodes = computed<AgentMarkdownViewNode[]>(() => {
  const content = String(props.content ?? '')
  if (!parser) {
    return content ? [{ kind: 'text', text: content }] : []
  }
  if (!content.startsWith(previousContent)) {
    parser.reset()
  }
  previousContent = content
  try {
    return normalizeMarkdownNodes(parser.parse(content, { final: props.final }))
  }
  catch (error) {
    const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error)
    emit('error', message)
    return content ? [{ kind: 'text', text: content }] : []
  }
})
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
