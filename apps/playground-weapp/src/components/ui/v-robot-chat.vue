<script setup lang="ts">
import type { PropType } from 'wevu'
import type { VaroRobotChatOptions, VaroRobotChatPlugin } from './robot-chat.types'
import { computed, onMounted, onUnmounted, shallowRef } from 'wevu'

const props = defineProps({
  ariaLabel: { type: String, default: '机器人对话' },
  className: { type: String, default: '' },
  errorText: { type: String, default: '机器人连接失败' },
  loadingText: { type: String, default: '正在连接机器人' },
  options: { type: Object as PropType<VaroRobotChatOptions>, required: true },
  retryText: { type: String, default: '重新连接' },
})

const emit = defineEmits<{
  backHome: [event: unknown]
  error: [error: unknown]
  queryCallback: [event: unknown]
  ready: []
}>()

const state = shallowRef<'error' | 'loading' | 'ready'>('loading')
const rootClass = computed(() => ['varo-robot-chat', props.className].filter(Boolean).join(' '))
let mounted = false

function requireRobotPlugin() {
  const runtime = globalThis as typeof globalThis & {
    requirePlugin?: (name: string) => VaroRobotChatPlugin
  }
  if (typeof runtime.requirePlugin !== 'function') {
    throw new Error('VRobotChat requires the WeChat requirePlugin runtime')
  }
  return runtime.requirePlugin('varoRobot')
}
function normalizedOptions() {
  const appid = typeof props.options?.appid === 'string' ? props.options.appid.trim() : ''
  if (!appid) {
    throw new Error('VRobotChat requires a non-empty options.appid')
  }
  return {
    operateCardHeight: 72,
    ...props.options,
    appid,
  }
}

function fail(error: unknown) {
  if (!mounted) { return }
  state.value = 'error'
  emit('error', error)
}

function initialize() {
  const options = normalizedOptions()
  state.value = 'loading'

  try {
    const plugin = requireRobotPlugin()
    if (!plugin || typeof plugin.init !== 'function') {
      throw new Error('VRobotChat requires the varoRobot WeChat plugin')
    }
    plugin.init({
      ...options,
      fail,
      success: () => {
        if (!mounted) { return }
        state.value = 'ready'
        emit('ready')
      },
    })
  }
  catch (error) {
    fail(error)
  }
}

onMounted(() => {
  mounted = true
  initialize()
})

onUnmounted(() => {
  mounted = false
})
</script>

<template>
  <view :class="rootClass" :aria-label="props.ariaLabel" :aria-busy="state === 'loading'" role="region">
    <wechat-robot-chat
      v-if="state === 'ready'"
      class="block h-full min-h-[480px] w-full"
      generic:operateCard="varo-robot-operate-card"
      @query-callback="emit('queryCallback', $event)"
      @back-home="emit('backHome', $event)"
    />
    <view v-else-if="state === 'error'" class="grid min-h-48 place-items-center gap-3 rounded-2xl border border-[var(--varo-ui-border)] bg-[var(--varo-ui-bg)] p-6 text-center" role="alert">
      <text class="text-sm text-[var(--varo-ui-text-regular)]">
        {{ props.errorText }}
      </text>
      <button class="min-h-10 rounded-xl bg-[var(--varo-ui-primary)] px-4 text-sm font-semibold text-white" type="button" @click="initialize">
        {{ props.retryText }}
      </button>
    </view>
    <view v-else class="grid min-h-48 place-items-center rounded-2xl border border-[var(--varo-ui-border)] bg-[var(--varo-ui-bg)] p-6" role="status">
      <text class="text-sm text-[var(--varo-ui-text-regular)]">
        {{ props.loadingText }}
      </text>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared",
  "usingComponents": {
    "wechat-robot-chat": "plugin://varoRobot/chat",
    "varo-robot-operate-card": "./v-robot-operate-card"
  }
}
</json>
