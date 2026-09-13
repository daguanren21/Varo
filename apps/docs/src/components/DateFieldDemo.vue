<script setup lang="ts">
import { VDateField } from '@varo-ui/h5'
import { computed, shallowRef } from 'vue'

const props = withDefaults(defineProps<{ locale?: 'en' | 'zh' }>(), {
  locale: 'zh',
})

const value = shallowRef('2026-05-18')
const visible = shallowRef(false)
const status = shallowRef('')
const copy = computed(() => props.locale === 'en'
  ? {
      cancel: 'Cancel',
      cancelled: 'Selection cancelled; the committed date was preserved.',
      confirm: 'Confirm',
      confirmed: 'Confirmed',
      placeholder: 'Select date',
      preview: 'Draft',
      title: 'Invoice date',
    }
  : {
      cancel: '取消',
      cancelled: '已取消，保留原日期。',
      confirm: '确认',
      confirmed: '已确认',
      placeholder: '请选择日期',
      preview: '草稿',
      title: '开票日期',
    })

function preview(next: string) {
  status.value = `${copy.value.preview}：${next}`
}

function confirm(next: string) {
  status.value = `${copy.value.confirmed}：${next}`
}

function cancel() {
  status.value = copy.value.cancelled
}
</script>

<template>
  <section class="date-field-demo">
    <VDateField
      v-model:value="value"
      v-model:visible="visible"
      :cancel-text="copy.cancel"
      :confirm-text="copy.confirm"
      :max-year="2027"
      :min-year="2025"
      :placeholder="copy.placeholder"
      :title="copy.title"
      @cancel="cancel"
      @change="preview"
      @confirm="confirm"
    />
    <output class="date-field-demo__status" aria-live="polite">
      {{ status || value }}
    </output>
  </section>
</template>

<style scoped>
.date-field-demo {
  display: grid;
  gap: 10px;
  width: min(100%, 360px);
  margin: 16px 0 24px;
}

.date-field-demo__status {
  min-height: 20px;
  font-size: 13px;
  color: var(--varo-muted);
}
</style>
