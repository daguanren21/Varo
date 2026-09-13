<script setup lang="ts">
import { VWatermark } from '@varo-ui/h5'
import { computed, shallowRef } from 'vue'

const props = withDefaults(defineProps<{ locale?: 'en' | 'zh' }>(), {
  locale: 'zh',
})

const actionCount = shallowRef(0)
const copy = computed(() => props.locale === 'en'
  ? {
      action: 'Review document',
      amount: 'Approved amount',
      label: 'CONFIDENTIAL · VARO',
      owner: 'Mobile platform team',
      title: 'Quarterly settlement',
    }
  : {
      action: '查看文档',
      amount: '已审批金额',
      label: '机密 · VARO',
      owner: '移动平台团队',
      title: '季度结算单',
    })
</script>

<template>
  <section class="watermark-demo">
    <VWatermark
      :content="copy.label"
      color="var(--varo-ui-text)"
      :font-size="13"
      :gap-x="170"
      :gap-y="92"
      :opacity="0.18"
      :rotate="-20"
    >
      <article class="watermark-demo__document">
        <header>
          <div>
            <span>VARO FINANCE</span>
            <h3>{{ copy.title }}</h3>
          </div>
          <strong>Q3 / 2026</strong>
        </header>
        <div class="watermark-demo__amount">
          <span>{{ copy.amount }}</span>
          <strong>¥ 482,600</strong>
        </div>
        <footer>
          <span>{{ copy.owner }}</span>
          <button type="button" @click="actionCount += 1">
            {{ copy.action }} · {{ actionCount }}
          </button>
        </footer>
      </article>
    </VWatermark>
  </section>
</template>

<style scoped>
.watermark-demo {
  width: min(100%, 620px);
  margin: 16px 0 24px;
  border: 1px solid var(--varo-border);
  border-radius: 14px;
}

.watermark-demo__document {
  display: grid;
  gap: 24px;
  min-height: 260px;
  padding: 28px;
  background: var(--varo-card-solid);
}

.watermark-demo__document header,
.watermark-demo__document footer {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
}

.watermark-demo__document header span,
.watermark-demo__amount span,
.watermark-demo__document footer > span {
  font-size: 12px;
  color: var(--varo-muted);
}

.watermark-demo__document h3 {
  margin: 4px 0 0;
  font-size: 22px;
}

.watermark-demo__amount {
  display: grid;
  gap: 6px;
}

.watermark-demo__amount strong {
  font-size: 34px;
  letter-spacing: -0.03em;
}

.watermark-demo__document button {
  min-height: 38px;
  padding: 0 14px;
  font: inherit;
  font-weight: 700;
  color: var(--varo-primary-foreground);
  cursor: pointer;
  background: var(--varo-primary);
  border: 0;
  border-radius: 8px;
}

@media (max-width: 560px) {
  .watermark-demo__document header,
  .watermark-demo__document footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
