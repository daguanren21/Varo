<script setup lang="ts">
import type { SignatureStroke } from '@varo-ui/h5'
import { VButton, VSignature } from '@varo-ui/h5'
import { computed, shallowRef } from 'vue'

const props = withDefaults(defineProps<{ locale?: 'en' | 'zh' }>(), {
  locale: 'zh',
})

const value = shallowRef<SignatureStroke[]>([])
const status = shallowRef('')
const rejectNext = shallowRef(false)
const disabled = shallowRef(false)
const copy = computed(() => props.locale === 'en'
  ? {
      aria: 'Draw signature',
      clear: 'Clear',
      undo: 'Undo',
      redo: 'Redo',
      empty: 'Draw two strokes, then try undo, redo, or clear.',
      strokes: 'Accepted strokes',
      reject: 'Reject next update',
      armed: 'Rejection armed',
      rejected: 'Update rejected. The accepted signature and history are unchanged.',
      disable: 'Disable pad',
      enable: 'Enable pad',
    }
  : {
      aria: '绘制签名',
      clear: '清除',
      undo: '撤销',
      redo: '重做',
      empty: '请画两笔，再尝试撤销、重做或清除。',
      strokes: '已接受笔画',
      reject: '拒绝下一次更新',
      armed: '下一次将拒绝',
      rejected: '已拒绝更新，签名和历史仍保持已接受的状态。',
      disable: '禁用画布',
      enable: '启用画布',
    })

function update(strokes: SignatureStroke[]) {
  if (rejectNext.value) {
    rejectNext.value = false
    status.value = copy.value.rejected
    return
  }
  value.value = strokes
  status.value = ''
}
</script>

<template>
  <section class="signature-demo">
    <VSignature
      :value="value"
      :disabled="disabled"
      :aria-label="copy.aria"
      :clear-text="copy.clear"
      :undo-text="copy.undo"
      :redo-text="copy.redo"
      show-history
      @update:value="update"
    />
    <div class="signature-demo__controls">
      <VButton variant="outline" :disabled="disabled" @click="rejectNext = !rejectNext">
        {{ rejectNext ? copy.armed : copy.reject }}
      </VButton>
      <VButton variant="outline" @click="disabled = !disabled">
        {{ disabled ? copy.enable : copy.disable }}
      </VButton>
    </div>
    <output class="signature-demo__status" aria-live="polite">
      {{ copy.strokes }}: {{ value.length }}. {{ status || copy.empty }}
    </output>
  </section>
</template>

<style scoped>
.signature-demo {
  display: grid;
  gap: 10px;
  width: min(100%, 480px);
  margin: 16px 0 24px;
}

.signature-demo__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.signature-demo__status {
  min-height: 20px;
  font-size: 13px;
  color: var(--varo-muted);
}
</style>
