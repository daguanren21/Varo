<script setup lang="ts">
interface IndexItem {
  id?: number | string
  name?: string
}

interface IndexGroup {
  items?: IndexItem[]
  key: string
  title?: string
}

withDefaults(defineProps<{
  height?: number | string
  list?: IndexGroup[]
}>(), {
  height: '100%',
  list: () => [],
})

const emit = defineEmits<{
  click: [item: IndexItem]
  scrollIntoView: [key: string]
}>()
</script>

<template>
  <scroll-view scroll-y class="h-full bg-white" :style="{ height: typeof height === 'number' ? `${height}px` : height }">
    <slot />
    <view v-for="group in list" :id="`index-${group.key}`" :key="group.key">
      <view class="sticky top-0 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-500" @tap="emit('scrollIntoView', group.key)">
        {{ group.title || group.key }}
      </view>
      <button
        v-for="(item, index) in group.items || []"
        :key="item.id || `${group.key}-${index}`"
        class="m-0 block w-full rounded-none border-b border-slate-100 bg-white px-4 py-3 text-left text-base text-slate-800"
        @tap="emit('click', item)"
      >
        {{ item.name }}
      </button>
    </view>
  </scroll-view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
