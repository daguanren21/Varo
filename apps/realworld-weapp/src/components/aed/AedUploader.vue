<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'

interface UploadFile {
  path?: string
  url?: string
}

const props = withDefaults(defineProps<{
  className?: ClassValue
  count?: number | string
  files?: UploadFile[]
  length?: number | string
  multiple?: boolean
  showAddBtn?: boolean
}>(), {
  count: 9,
  files: () => [],
  length: 4,
  multiple: false,
  showAddBtn: true,
})

const emit = defineEmits<{
  change: [files: UploadFile[], operation: 'add' | 'remove', index?: number]
  fail: [error: unknown]
  imageClick: [index: number, file: UploadFile]
}>()

const columns = computed(() => Number(props.length) || 4)
const itemStyle = computed(() => ({ width: `${100 / columns.value}%` }))
const canAdd = computed(() => props.showAddBtn && props.files.length < Number(props.count))
const classes = computed(() => cn('aed-uploader flex flex-wrap', props.className))

async function add() {
  try {
    const remaining = Math.max(1, Number(props.count) - props.files.length)
    const result = await wx.chooseMedia({
      count: props.multiple ? remaining : 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
    })
    const additions = result.tempFiles.map(file => ({ path: file.tempFilePath, url: file.tempFilePath }))
    emit('change', [...props.files, ...additions], 'add')
  }
  catch (error: unknown) {
    emit('fail', error)
  }
}

function remove(index: number) {
  emit('change', props.files.filter((_file, fileIndex) => fileIndex !== index), 'remove', index)
}
</script>

<template>
  <view :class="classes">
    <view v-for="(file, index) in files" :key="file.url || file.path || index" class="relative p-1" :style="itemStyle">
      <image class="aspect-square w-full rounded-lg bg-slate-100" mode="aspectFill" :src="file.url || file.path" @tap="emit('imageClick', index, file)" />
      <button class="absolute right-1 top-1 m-0 h-6 w-6 rounded-full bg-black/60 p-0 text-xs text-white" @tap.stop="remove(index)">
        ×
      </button>
    </view>
    <button v-if="canAdd" class="m-1 flex aspect-square items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-3xl text-slate-400" :style="itemStyle" @tap="add">
      +
    </button>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
