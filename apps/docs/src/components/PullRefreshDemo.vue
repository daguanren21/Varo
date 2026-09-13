<script setup lang="ts">
import { VPullRefresh } from '@varo-ui/h5'
import { computed, onBeforeUnmount, shallowRef } from 'vue'

const props = withDefaults(defineProps<{ locale?: 'en' | 'zh' }>(), {
  locale: 'zh',
})

const loading = shallowRef(false)
const refreshCount = shallowRef(0)
let refreshTimer: number | undefined
const copy = computed(() => props.locale === 'en'
  ? {
      idle: 'Pull down inside the list, then release after the threshold.',
      loading: 'Refreshing',
      prefix: 'Update',
      refreshed: 'Refresh completed',
      release: 'Release to refresh',
      pull: 'Pull to refresh',
    }
  : {
      idle: '在列表内向下拖动，超过阈值后释放。',
      loading: '正在刷新',
      prefix: '动态',
      refreshed: '刷新完成',
      release: '释放刷新',
      pull: '下拉刷新',
    })
const items = computed(() => Array.from({ length: 8 }, (_, index) => ({
  id: `${refreshCount.value}-${index}`,
  label: `${copy.value.prefix} ${refreshCount.value + 1}.${index + 1}`,
})))
const status = computed(() => loading.value
  ? copy.value.loading
  : refreshCount.value > 0
    ? `${copy.value.refreshed} #${refreshCount.value}`
    : copy.value.idle)

function refresh() {
  if (loading.value) {
    return
  }
  loading.value = true
  refreshTimer = window.setTimeout(() => {
    refreshCount.value += 1
    loading.value = false
    refreshTimer = undefined
  }, 500)
}

onBeforeUnmount(() => {
  if (refreshTimer !== undefined) {
    window.clearTimeout(refreshTimer)
  }
})
</script>

<template>
  <section class="pull-refresh-demo">
    <VPullRefresh
      class="pull-refresh-demo__surface"
      :loading="loading"
      :loading-text="copy.loading"
      :pull-text="copy.pull"
      :release-text="copy.release"
      @refresh="refresh"
    >
      <article v-for="item in items" :key="item.id" class="pull-refresh-demo__item">
        {{ item.label }}
      </article>
    </VPullRefresh>
    <output class="pull-refresh-demo__status" aria-live="polite">
      {{ status }}
    </output>
  </section>
</template>

<style scoped>
.pull-refresh-demo {
  display: grid;
  gap: 10px;
  width: min(100%, 420px);
  margin: 16px 0 24px;
}

.pull-refresh-demo__surface {
  height: 240px;
  background: var(--varo-card-solid);
  border: 1px solid var(--varo-border);
  border-radius: 16px;
}

.pull-refresh-demo__item {
  min-height: 52px;
  padding: 14px 16px;
  color: var(--varo-foreground);
  border-bottom: 1px solid var(--varo-border);
}

.pull-refresh-demo__status {
  min-height: 20px;
  font-size: 13px;
  color: var(--varo-muted);
}
</style>
