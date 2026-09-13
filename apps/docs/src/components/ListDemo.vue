<script setup lang="ts">
import { VList } from '@varo-ui/h5'
import { computed, onBeforeUnmount, shallowRef } from 'vue'

const props = withDefaults(defineProps<{ locale?: 'en' | 'zh' }>(), {
  locale: 'zh',
})

const items = shallowRef(Array.from({ length: 8 }, (_, index) => index + 1))
const loading = shallowRef(false)
const finished = shallowRef(false)
let loadTimer: number | undefined
const copy = computed(() => props.locale === 'en'
  ? {
      finished: 'No more records',
      hint: 'Scroll to the bottom to load the next page.',
      loading: 'Loading next page',
      row: 'Record',
    }
  : {
      finished: '没有更多了',
      hint: '滚动到底部加载下一页。',
      loading: '正在加载下一页',
      row: '记录',
    })

function load() {
  if (loading.value || finished.value) {
    return
  }
  loading.value = true
  loadTimer = window.setTimeout(() => {
    const start = items.value.length
    items.value = [...items.value, ...Array.from({ length: 5 }, (_, index) => start + index + 1)]
    loading.value = false
    finished.value = items.value.length >= 18
    loadTimer = undefined
  }, 400)
}

onBeforeUnmount(() => {
  if (loadTimer !== undefined) {
    window.clearTimeout(loadTimer)
  }
})
</script>

<template>
  <section class="list-demo">
    <p>{{ copy.hint }}</p>
    <div class="list-demo__surface">
      <VList
        :finished="finished"
        :finished-text="copy.finished"
        :immediate="false"
        :loading="loading"
        :loading-text="copy.loading"
        @load="load"
      >
        <article v-for="item in items" :key="item" class="list-demo__item">
          {{ copy.row }} {{ item }}
        </article>
      </VList>
    </div>
  </section>
</template>

<style scoped>
.list-demo {
  display: grid;
  gap: 8px;
  width: min(100%, 420px);
  margin: 16px 0 24px;
}

.list-demo > p {
  margin: 0;
  font-size: 13px;
  color: var(--varo-muted);
}

.list-demo__surface {
  height: 240px;
  overflow: auto;
  background: var(--varo-card-solid);
  border: 1px solid var(--varo-border);
  border-radius: 16px;
}

.list-demo__item {
  min-height: 52px;
  padding: 14px 16px;
  color: var(--varo-foreground);
  border-bottom: 1px solid var(--varo-border);
}
</style>
