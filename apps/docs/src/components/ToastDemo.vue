<script setup lang="ts">
import type { VToastType } from '@varo-ui/h5'
import { VButton, VToast, VToastRegion } from '@varo-ui/h5'
import { computed, onBeforeUnmount, shallowRef } from 'vue'

interface DemoToast {
  actionText?: string
  id: string
  message: string
  title: string
  type: VToastType
}

const props = withDefaults(defineProps<{ locale?: 'en' | 'zh' }>(), {
  locale: 'zh',
})

const copy = computed(() => props.locale === 'en'
  ? {
      deploy: 'Deploy update',
      deploying: 'Deploying the latest component build.',
      done: 'The component build is available.',
      loading: 'Deploying',
      success: 'Deployment complete',
      retry: 'Retry',
      close: 'Dismiss notification',
      action: 'Toast action',
    }
  : {
      deploy: '发布更新',
      deploying: '正在发布最新组件构建。',
      done: '组件构建已可用。',
      loading: '正在发布',
      success: '发布完成',
      retry: '重试',
      close: '关闭通知',
      action: 'Toast 操作',
    })

const deployType = shallowRef<VToastType>('loading')
const deployTitle = shallowRef(copy.value.loading)
const deployMessage = shallowRef(copy.value.deploying)
const actionStatus = shallowRef('')
const visibleIds = shallowRef(new Set(['deploy', 'warning', 'danger']))
let deployTimer: ReturnType<typeof setTimeout> | undefined

const staticToasts = computed<DemoToast[]>(() => [
  {
    id: 'warning',
    message: props.locale === 'en' ? 'Two fields still need attention.' : '还有两个字段需要检查。',
    title: props.locale === 'en' ? 'Review required' : '需要检查',
    type: 'warning',
  },
  {
    actionText: copy.value.retry,
    id: 'danger',
    message: props.locale === 'en' ? 'The request did not complete.' : '请求未能完成。',
    title: props.locale === 'en' ? 'Request failed' : '请求失败',
    type: 'danger',
  },
])

function deploy() {
  clearTimeout(deployTimer)
  visibleIds.value = new Set([...visibleIds.value, 'deploy'])
  deployType.value = 'loading'
  deployTitle.value = copy.value.loading
  deployMessage.value = copy.value.deploying
  deployTimer = setTimeout(() => {
    deployTimer = undefined
    deployType.value = 'success'
    deployTitle.value = copy.value.success
    deployMessage.value = copy.value.done
  }, 900)
}

function dismiss(id: string) {
  const next = new Set(visibleIds.value)
  next.delete(id)
  visibleIds.value = next
}

function act(id: string) {
  actionStatus.value = `${copy.value.action}: ${id}`
}

onBeforeUnmount(() => clearTimeout(deployTimer))
</script>

<template>
  <section class="toast-demo">
    <div class="toast-demo__controls">
      <VButton size="sm" @click="deploy">
        {{ copy.deploy }}
      </VButton>
      <output aria-live="polite">{{ actionStatus }}</output>
    </div>

    <VToastRegion inline class="toast-demo__region">
      <VToast
        :visible="visibleIds.has('deploy')"
        :type="deployType"
        :title="deployTitle"
        :message="deployMessage"
        closeable
        :close-label="copy.close"
        @close="dismiss('deploy')"
      />
      <VToast
        v-for="toast in staticToasts"
        :key="toast.id"
        :visible="visibleIds.has(toast.id)"
        :type="toast.type"
        :title="toast.title"
        :message="toast.message"
        :action-text="toast.actionText"
        :action-label="toast.actionText"
        closeable
        :close-label="copy.close"
        @action="act(toast.id)"
        @close="dismiss(toast.id)"
      />
    </VToastRegion>
  </section>
</template>

<style scoped>
.toast-demo {
  display: grid;
  gap: 14px;
  width: min(100%, 520px);
  margin: 16px 0 24px;
}

.toast-demo__controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.toast-demo__controls output {
  min-width: 0;
  font-size: 12px;
  color: var(--varo-muted);
}

.toast-demo__region {
  min-height: 180px;
}
</style>
