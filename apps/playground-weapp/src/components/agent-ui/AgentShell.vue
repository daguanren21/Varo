<script setup lang="ts">
import type { AgentWorkspacePlacement } from './advanced-types'
import { computed } from 'wevu'
import { agentCloseIcon } from './agent-icons'

const props = withDefaults(
  defineProps<{
    closeLabel?: string
    open?: boolean
    placement?: AgentWorkspacePlacement
    title?: string
  }>(),
  {
    closeLabel: '关闭工作区',
    open: true,
    placement: 'page',
    title: 'Agent 工作区',
  },
)

const emit = defineEmits<{
  close: []
}>()

const isSheet = computed(() => props.placement === 'sheet')
const isVisible = computed(() => props.open)
const rootClass = computed(() => `agent-shell agent-shell--${props.placement}`)

function lockTouchMove() {
  return false
}
</script>

<template>
  <view
    v-if="isVisible && isSheet"
    :class="rootClass"
    :data-placement="placement"
    @touchmove.stop="lockTouchMove"
  >
    <button
      class="agent-shell__overlay"
      type="button"
      :aria-label="closeLabel"
      hover-class="none"
      @click="emit('close')"
    />

    <view class="agent-shell__panel" role="dialog" :aria-label="title" aria-modal="true">
      <view class="agent-shell__header">
        <text class="agent-shell__title">
          {{ title }}
        </text>
        <button
          class="agent-shell__close"
          type="button"
          :aria-label="closeLabel"
          hover-class="agent-shell__close--pressed"
          :hover-start-time="20"
          :hover-stay-time="70"
          @click="emit('close')"
        >
          <image class="agent-shell__close-icon" :src="agentCloseIcon" mode="aspectFit" aria-hidden="true" />
        </button>
      </view>

      <scroll-view class="agent-shell__content agent-shell__content--scroll" scroll-y :show-scrollbar="false">
        <slot />
      </scroll-view>
    </view>
  </view>

  <view v-else-if="isVisible" :class="rootClass" :data-placement="placement">
    <view class="agent-shell__panel" role="region" :aria-label="title">
      <view class="agent-shell__header">
        <text class="agent-shell__title">
          {{ title }}
        </text>
        <button
          class="agent-shell__close"
          type="button"
          :aria-label="closeLabel"
          hover-class="agent-shell__close--pressed"
          :hover-start-time="20"
          :hover-stay-time="70"
          @click="emit('close')"
        >
          <image class="agent-shell__close-icon" :src="agentCloseIcon" mode="aspectFit" aria-hidden="true" />
        </button>
      </view>

      <view v-if="placement === 'page'" class="agent-shell__content agent-shell__content--page">
        <slot />
      </view>
      <scroll-view v-else class="agent-shell__content agent-shell__content--scroll" scroll-y :show-scrollbar="false">
        <slot />
      </scroll-view>
    </view>
  </view>
</template>

<style scoped>
.agent-shell {
  box-sizing: border-box;
  min-width: 0;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  color: var(--varo-agent-foreground);
}

.agent-shell__panel {
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-width: 0;
  width: 100%;
  max-width: 100%;
  min-height: 0;
  overflow: hidden;
  background: var(--varo-agent-surface);
  border: 1px solid var(--varo-agent-border);
}

.agent-shell__header {
  box-sizing: border-box;
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
  padding: 6px 8px 6px 14px;
  border-bottom: 1px solid var(--varo-agent-border);
}

.agent-shell__title {
  min-width: 0;
  overflow: hidden;
  font-size: 14px;
  font-weight: 750;
  color: var(--varo-agent-foreground);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.agent-shell__close {
  position: relative;
  box-sizing: border-box;
  display: grid;
  flex: none;
  width: 40px;
  height: 40px;
  margin: 0 0 0 auto;
  padding: 0;
  place-items: center;
  background: transparent;
  border: 0;
  border-radius: 10px;
}

.agent-shell__close::before {
  position: absolute;
  inset: -2px;
  content: '';
}

.agent-shell__close::after,
.agent-shell__overlay::after {
  border: 0;
}

.agent-shell__close-icon {
  width: 18px;
  height: 18px;
}

.agent-shell__close--pressed {
  background: var(--varo-agent-fill);
}

.agent-shell__content {
  box-sizing: border-box;
  min-width: 0;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  min-height: 0;
}

.agent-shell__content--page {
  width: 100%;
}

.agent-shell--page .agent-shell__panel {
  min-height: 100vh;
  border-radius: 0;
}

.agent-shell--docked {
  display: flex;
  justify-content: flex-end;
}

.agent-shell--docked .agent-shell__panel {
  max-width: 420px;
  max-height: calc(100vh - 32px);
  border-radius: 18px;
  box-shadow: var(--varo-agent-shadow);
}

.agent-shell--docked .agent-shell__content--scroll {
  max-height: calc(100vh - 89px);
}

.agent-shell--sheet {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: flex-end;
}

.agent-shell__overlay {
  position: fixed;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  background: var(--varo-agent-foreground);
  opacity: 0.42;
  border: 0;
  border-radius: 0;
  animation: agent-shell-overlay-in 180ms ease-out;
}

.agent-shell--sheet .agent-shell__panel {
  z-index: 1;
  max-height: 86vh;
  padding-bottom: env(safe-area-inset-bottom);
  border-radius: 22px 22px 0 0;
  box-shadow: var(--varo-agent-shadow);
  animation: agent-shell-sheet-in 200ms ease-out;
}

.agent-shell--sheet .agent-shell__content--scroll {
  max-height: calc(86vh - 56px - env(safe-area-inset-bottom));
}

@keyframes agent-shell-overlay-in {
  from {
    opacity: 0;
  }
}

@keyframes agent-shell-sheet-in {
  from {
    transform: translateY(16px);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .agent-shell__overlay,
  .agent-shell--sheet .agent-shell__panel {
    animation: none;
  }
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
