<script setup lang="ts">
import VEmpty from '../ui/empty.vue'
import VButton from '../ui/v-button.vue'

withDefaults(defineProps<{ loading?: boolean, error?: string, empty?: boolean, emptyTitle?: string }>(), {
  loading: false,
  error: '',
  empty: false,
  emptyTitle: '暂无数据',
})
defineEmits<{ retry: [] }>()
</script>

<template>
  <view v-if="loading || error || empty" class="mx-[18px] my-4 text-center">
    <text v-if="loading" class="block py-8 text-[15px] leading-7 text-[#625e55]" role="status">
      正在加载，请稍候…
    </text>
    <VEmpty v-else-if="error" title="请求未完成" :description="error" icon="warning" size="sm">
      <template #title>
        <text class="retail-heading text-xl leading-7 text-[#292722]">
          请求未完成
        </text>
      </template>
      <template #description>
        <text class="break-words text-[15px] leading-7 text-[#625e55]">
          {{ error }}
        </text>
      </template>
      <VButton size="lg" class-name="!min-h-11 !rounded-[3px] !text-base !shadow-none" @click="$emit('retry')">
        重试
      </VButton>
    </VEmpty>
    <VEmpty v-else :title="emptyTitle" description="可以返回浏览或稍后再试" size="sm">
      <template #title>
        <text class="retail-heading text-xl leading-7 text-[#292722]">
          {{ emptyTitle }}
        </text>
      </template>
      <template #description>
        <text class="text-[15px] leading-7 text-[#625e55]">
          可以返回浏览或稍后再试
        </text>
      </template>
    </VEmpty>
  </view>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
