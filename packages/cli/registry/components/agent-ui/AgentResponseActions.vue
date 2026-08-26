<script setup lang="ts">
import { onBeforeUnmount, shallowRef } from 'wevu'


const props = withDefaults(
  defineProps<{
    content?: string
    disabled?: boolean
  }>(),
  {
    content: '',
    disabled: false
  }
)

const emit = defineEmits<{
  copy: []
  dislike: []
  like: []
  retry: []
}>()

const copied = shallowRef(false)
let timer: ReturnType<typeof setTimeout> | undefined

function copy() {
  if (props.disabled || !props.content) return
  wx.setClipboardData({
    data: props.content,
    success: () => {
      copied.value = true
      clearTimeout(timer)
      timer = setTimeout(() => {
        copied.value = false
      }, 1200)
      emit('copy')
    }
  })
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <view class="agent-actions flex flex-wrap gap-1.5" role="toolbar" aria-label="回答操作">
    <button class="min-h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-600 disabled:opacity-45" :disabled="disabled" type="button" @click="copy">{{ copied ? '已复制' : '复制' }}</button>
    <button class="min-h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-600 disabled:opacity-45" :disabled="disabled" type="button" @click="emit('retry')">重试</button>
    <button class="min-h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-600 disabled:opacity-45" :disabled="disabled" type="button" @click="emit('like')">赞</button>
    <button class="min-h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-600 disabled:opacity-45" :disabled="disabled" type="button" @click="emit('dislike')">踩</button>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
