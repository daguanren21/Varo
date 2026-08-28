<script setup lang="ts">
import { computed } from 'wevu'

interface GridIcon {
  value?: string
}

interface GridItem {
  iconInfo?: GridIcon
  key?: string | number
  value?: string
}

const props = withDefaults(defineProps<{
  columnNum?: number | string
  data?: GridItem[]
}>(), {
  columnNum: 3,
  data: () => [],
})

const emit = defineEmits<{
  click: [item: GridItem, index: number]
}>()

const gridStyle = computed(() => ({ gridTemplateColumns: `repeat(${Number(props.columnNum) || 3}, minmax(0, 1fr))` }))
</script>

<template>
  <view class="grid gap-3 py-2" :style="gridStyle">
    <button
      v-for="(item, index) in data"
      :key="item.key ?? index"
      class="m-0 flex flex-col items-center gap-2 bg-transparent px-2 py-3 text-center"
      @tap="emit('click', item, index)"
    >
      <VIcon v-if="item.iconInfo && item.iconInfo.value" :name="item.iconInfo.value" size="24" />
      <text class="text-sm text-slate-700">
        {{ item.value }}
      </text>
    </button>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
