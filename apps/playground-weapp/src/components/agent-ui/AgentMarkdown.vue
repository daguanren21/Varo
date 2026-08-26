<script setup lang="ts">
import {
  createStreamingMarkdownParser,
  normalizeMarkdownNodes,
  type AgentMarkdownViewNode,
  type StreamingMarkdownParser
} from '@varo/agent-core'
import { computed } from 'wevu'
import AgentMarkdownNode from './AgentMarkdownNode.vue'
import { cn, type ClassValue } from '../../lib/cn'

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
    final: false
  }
)

const emit = defineEmits<{
  link: [href: string]
}>()

let parser: StreamingMarkdownParser | undefined
try {
  parser = createStreamingMarkdownParser({ customHtmlTags: props.customHtmlTags })
} catch (error) {
  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error)
  console.error(`[Varo AgentMarkdown] ${message}`)
}
let previousContent = ''
const nodes = computed<AgentMarkdownViewNode[]>(() => {
  const content = String(props.content ?? '')
  if (!parser) return content ? [{ kind: 'text', text: content }] : []
  if (!content.startsWith(previousContent)) parser.reset()
  previousContent = content
  try {
    return normalizeMarkdownNodes(parser.parse(content, { final: props.final }))
  } catch (error) {
    const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error)
    console.error(`[Varo AgentMarkdown] ${message}`)
    return content ? [{ kind: 'text', text: content }] : []
  }
})
const rootClass = computed(() =>
  cn('agent-markdown break-words text-sm leading-7 text-inherit', props.className)
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
