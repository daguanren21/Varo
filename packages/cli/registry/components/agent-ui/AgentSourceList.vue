<script setup lang="ts">
export interface AgentSourceItem {
  description?: string
  domain?: string
  id: string
  title: string
  url: string
}

withDefaults(
  defineProps<{
    sources?: AgentSourceItem[]
    title?: string
  }>(),
  {
    sources: () => [],
    title: '来源'
  }
)

const emit = defineEmits<{
  open: [source: AgentSourceItem]
}>()
</script>

<template>
  <view class="agent-sources grid gap-2">
    <text class="text-xs font-bold text-slate-700">{{ title }}</text>
    <button
      v-for="(source, index) in sources"
      :key="source.id"
      class="flex min-h-11 w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 text-left"
      type="button"
      @click="emit('open', source)"
    >
      <text class="grid h-6 w-6 flex-none place-items-center rounded-full bg-slate-100 text-[10px] font-bold">{{ index + 1 }}</text>
      <view class="grid min-w-0 flex-1">
        <text class="truncate text-xs font-semibold text-slate-700">{{ source.title }}</text>
        <text class="truncate text-[10px] text-slate-400">{{ source.domain || source.description || source.url }}</text>
      </view>
    </button>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
