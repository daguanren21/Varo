<script setup lang="ts">
import type { SignatureStroke } from '@varo-ui/h5'
import { VSignature } from '@varo-ui/h5'
import { computed, shallowRef } from 'vue'

const props = withDefaults(defineProps<{ locale?: 'en' | 'zh' }>(), {
  locale: 'zh',
})

const value = shallowRef<SignatureStroke[]>([])
const status = shallowRef('')
const copy = computed(() => props.locale === 'en'
  ? {
      aria: 'Draw signature',
      clear: 'Clear signature',
      empty: 'Draw in the canvas with a pointer or touch.',
      strokes: 'Committed strokes',
    }
  : {
      aria: '绘制签名',
      clear: '清除签名',
      empty: '请在画布中使用指针或触摸绘制。',
      strokes: '已提交笔画',
    })

function change(strokes: SignatureStroke[]) {
  status.value = `${copy.value.strokes}：${strokes.length}`
}

function clear() {
  status.value = copy.value.empty
}
</script>

<template>
  <section class="signature-demo">
    <VSignature
      v-model:value="value"
      :aria-label="copy.aria"
      :clear-text="copy.clear"
      @change="change"
      @clear="clear"
    />
    <output class="signature-demo__status" aria-live="polite">
      {{ status || copy.empty }}
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

.signature-demo__status {
  min-height: 20px;
  font-size: 13px;
  color: var(--varo-muted);
}
</style>
