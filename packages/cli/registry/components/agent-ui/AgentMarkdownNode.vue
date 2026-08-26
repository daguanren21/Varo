<script setup lang="ts">
import type { AgentMarkdownViewNode } from '@varo/agent-core'

const props = defineProps<{
  node: AgentMarkdownViewNode
}>()

const emit = defineEmits<{
  link: [href: string]
}>()

function headingClass(level?: number) {
  if (level === 1) return 'mt-4 mb-2 text-[22px] font-black leading-tight text-inherit'
  if (level === 2) return 'mt-3.5 mb-2 text-[19px] font-black leading-tight text-inherit'
  if (level === 3) return 'mt-3 mb-1.5 text-[16px] font-extrabold leading-snug text-inherit'
  return 'mt-2.5 mb-1 text-sm font-extrabold text-inherit'
}
</script>

<template>
  <text v-if="node.kind === 'text'">{{ node.text }}</text>

  <view v-else-if="node.kind === 'heading'" :class="headingClass(node.level)">
    <AgentMarkdownNode v-for="(child, index) in node.children" :key="index" :node="child" @link="emit('link', $event)" />
  </view>

  <view v-else-if="node.kind === 'paragraph'" class="my-1.5 leading-7">
    <AgentMarkdownNode v-for="(child, index) in node.children" :key="index" :node="child" @link="emit('link', $event)" />
  </view>

  <view v-else-if="node.kind === 'list'" class="my-2 grid gap-1.5">
    <view v-for="(child, index) in node.children" :key="index" class="flex items-start gap-2 pl-1">
      <text class="w-5 flex-none pt-1 text-right font-bold text-inherit">{{ node.ordered ? (node.start ?? 1) + index + '.' : '•' }}</text>
      <view class="min-w-0 flex-1"><AgentMarkdownNode :node="child" @link="emit('link', $event)" /></view>
    </view>
  </view>

  <view v-else-if="node.kind === 'list-item'" class="min-w-0">
    <AgentMarkdownNode v-for="(child, index) in node.children" :key="index" :node="child" @link="emit('link', $event)" />
  </view>

  <view v-else-if="node.kind === 'code-block'" class="my-2 overflow-hidden rounded-[14px] border border-slate-800 bg-slate-950 text-slate-200">
    <view class="flex min-h-8 items-center border-b border-slate-800 bg-slate-900 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">{{ node.language || 'text' }}</view>
    <scroll-view class="max-w-full" scroll-x>
      <text class="block whitespace-pre px-3 py-2.5 font-mono text-[11px] leading-5">{{ node.text }}</text>
    </scroll-view>
  </view>

  <text v-else-if="node.kind === 'inline-code' || node.kind === 'math-inline'" class="rounded-md border border-current/25 bg-current/10 px-1 py-0.5 font-mono text-[12px] text-inherit">{{ node.text }}</text>

  <text v-else-if="node.kind === 'link'" class="font-semibold text-inherit underline" role="link" @click="node.href && emit('link', node.href)">
    <AgentMarkdownNode v-for="(child, index) in node.children" :key="index" :node="child" @link="emit('link', $event)" />
    <text v-if="!node.children?.length">{{ node.text }}</text>
  </text>

  <image v-else-if="node.kind === 'image' && node.href" class="my-2 h-48 w-full rounded-xl bg-slate-100" :src="node.href" :alt="node.alt" mode="aspectFit" />
  <view v-else-if="node.kind === 'thematic-break'" class="my-3 h-px bg-slate-200" />

  <view v-else-if="node.kind === 'blockquote'" class="my-2 border-l-[3px] border-current/50 pl-3 text-inherit">
    <AgentMarkdownNode v-for="(child, index) in node.children" :key="index" :node="child" @link="emit('link', $event)" />
  </view>

  <scroll-view v-else-if="node.kind === 'table'" class="my-2 max-w-full" scroll-x>
    <view class="min-w-[480px] overflow-hidden rounded-xl border border-slate-200">
      <AgentMarkdownNode v-for="(child, index) in node.children" :key="index" :node="child" @link="emit('link', $event)" />
    </view>
  </scroll-view>

  <view v-else-if="node.kind === 'table-row'" class="flex border-b border-slate-200 last:border-0">
    <AgentMarkdownNode v-for="(child, index) in node.children" :key="index" :node="child" @link="emit('link', $event)" />
  </view>

  <view v-else-if="node.kind === 'table-cell'" :class="['min-w-32 flex-1 border-r border-current/20 px-2.5 py-2 text-xs last:border-0', node.header && 'bg-current/5 font-bold text-inherit']">
    <AgentMarkdownNode v-for="(child, index) in node.children" :key="index" :node="child" @link="emit('link', $event)" />
  </view>

  <view v-else-if="node.kind === 'strong'" class="inline font-extrabold text-inherit">
    <AgentMarkdownNode v-for="(child, index) in node.children" :key="index" :node="child" @link="emit('link', $event)" />
  </view>
  <view v-else-if="node.kind === 'emphasis'" class="inline italic"><AgentMarkdownNode v-for="(child, index) in node.children" :key="index" :node="child" @link="emit('link', $event)" /></view>
  <view v-else-if="node.kind === 'strikethrough'" class="inline line-through"><AgentMarkdownNode v-for="(child, index) in node.children" :key="index" :node="child" @link="emit('link', $event)" /></view>
  <view v-else-if="node.kind === 'highlight'" class="inline rounded bg-amber-100 px-0.5"><AgentMarkdownNode v-for="(child, index) in node.children" :key="index" :node="child" @link="emit('link', $event)" /></view>
  <view v-else-if="node.kind === 'insert'" class="inline underline"><AgentMarkdownNode v-for="(child, index) in node.children" :key="index" :node="child" @link="emit('link', $event)" /></view>
  <view v-else-if="node.kind === 'subscript' || node.kind === 'superscript'" class="inline text-[10px]"><AgentMarkdownNode v-for="(child, index) in node.children" :key="index" :node="child" @link="emit('link', $event)" /></view>

  <text v-else-if="node.kind === 'checkbox'" class="mr-1 text-inherit">{{ node.checked ? '☑' : '☐' }}</text>
  <view v-else-if="node.kind === 'hardbreak'" class="h-2" />
  <view v-else-if="node.kind === 'math-block'" class="my-2 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs">{{ node.text }}</view>

  <view v-else-if="node.kind === 'admonition'" class="my-2 rounded-xl border border-teal-200 bg-teal-50 p-3">
    <text v-if="node.title" class="mb-1 block font-bold text-teal-900">{{ node.title }}</text>
    <AgentMarkdownNode v-for="(child, index) in node.children" :key="index" :node="child" @link="emit('link', $event)" />
  </view>

  <view v-else-if="node.kind === 'definition-list' || node.kind === 'definition' || node.kind === 'footnote'" :class="['my-1', node.header && 'font-bold']">
    <text v-if="node.text">{{ node.text }}</text>
    <AgentMarkdownNode v-for="(child, index) in node.children" :key="index" :node="child" @link="emit('link', $event)" />
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
