<script setup lang="ts">
import { VTimeField } from '@varo-ui/h5'
import { computed, shallowRef } from 'vue'
import DocsDeviceFrame from './DocsDeviceFrame.vue'

const props = withDefaults(defineProps<{ locale?: 'en' | 'zh' }>(), { locale: 'zh' })
const value = shallowRef('09:30')
const visible = shallowRef(false)
const status = shallowRef('')
const copy = computed(() => props.locale === 'en'
  ? {
      title: 'Appointment time',
      hint: '09:00–18:00 · 15-minute steps',
      placeholder: 'Select time',
      confirm: 'Confirm',
      cancel: 'Cancel',
      clear: 'Clear',
      draft: 'Draft',
      confirmed: 'Confirmed',
      cancelled: 'Selection cancelled; the committed time was preserved.',
      empty: 'Not selected',
      readonly: 'Read only',
      disabled: 'Disabled',
    }
  : {
      title: '预约时间',
      hint: '09:00–18:00 · 每 15 分钟',
      placeholder: '请选择时间',
      confirm: '确认',
      cancel: '取消',
      clear: '清空',
      draft: '草稿',
      confirmed: '已确认',
      cancelled: '已取消，保留原时间。',
      empty: '尚未选择',
      readonly: '只读',
      disabled: '禁用',
    })
function preview(next: string) {
  status.value = `${copy.value.draft}：${next}`
}
function confirm(next: string) {
  status.value = `${copy.value.confirmed}：${next}`
}
function cancel() {
  status.value = copy.value.cancelled
}
</script>

<template>
  <DocsDeviceFrame>
    <div class="time-field-demo">
      <section class="time-field-demo__section" data-docs-case="appointment-time">
        <h3>{{ copy.title }}</h3>
        <p>{{ copy.hint }}</p>
        <VTimeField
          v-model:value="value"
          v-model:visible="visible"
          min="09:00"
          max="18:00"
          :minute-step="15"
          clearable
          :cancel-text="copy.cancel"
          :confirm-text="copy.confirm"
          :clear-text="copy.clear"
          :placeholder="copy.placeholder"
          :title="copy.title"
          @cancel="cancel"
          @change="preview"
          @confirm="confirm"
          @clear="status = ''"
        />
        <output class="time-field-demo__status" data-docs-state="time" aria-live="polite">{{ status || value || copy.empty }}</output>
      </section>
      <section class="time-field-demo__section" data-docs-state="readonly">
        <h3>{{ copy.readonly }}</h3>
        <VTimeField readonly clearable value="09:30" :clear-text="copy.clear" :title="copy.title" />
      </section>
      <section class="time-field-demo__section" data-docs-state="disabled">
        <h3>{{ copy.disabled }}</h3>
        <VTimeField disabled clearable value="09:30" :clear-text="copy.clear" :title="copy.title" />
      </section>
    </div>
  </DocsDeviceFrame>
</template>

<style scoped>
.time-field-demo,
.time-field-demo__section {
  display: grid;
  gap: 12px;
  min-width: 0;
}

.time-field-demo {
  gap: 24px;
}

.time-field-demo__section h3,
.time-field-demo__section p {
  margin: 0;
  font-size: 13px;
}

.time-field-demo__section p,
.time-field-demo__status {
  font-size: 13px;
  color: var(--varo-muted);
  overflow-wrap: anywhere;
}
</style>
