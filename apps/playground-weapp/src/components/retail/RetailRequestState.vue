<script setup lang="ts">
import VEmpty from '../ui/empty.vue'
import VButton from '../ui/v-button.vue'
import VCard from '../ui/v-card.vue'

withDefaults(defineProps<{ loading?: boolean, error?: string, empty?: boolean, emptyTitle?: string }>(), {
  loading: false,
  error: '',
  empty: false,
  emptyTitle: '暂无数据',
})
defineEmits<{ retry: [] }>()
</script>

<template>
  <VCard v-if="loading || error || empty" class-name="m-3 grid gap-3 text-center" variant="default">
    <text v-if="loading" class="py-6 text-sm text-slate-500">
      正在加载，请稍候…
    </text>
    <VEmpty v-else-if="error" title="请求未完成" :description="error">
      <VButton size="sm" @click="$emit('retry')">
        重试
      </VButton>
    </VEmpty>
    <VEmpty v-else :title="emptyTitle" description="可以返回浏览或稍后再试" />
  </VCard>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
