<script setup lang="ts">
import type { AgentChoice } from './types'
import { computed, shallowRef } from 'wevu'
import VButton from '../ui/v-button.vue'
import VCard from '../ui/v-card.vue'
import { agentShieldAlertIcon } from './agent-icons'

const props = withDefaults(
  defineProps<{
    approveText?: string
    choices?: AgentChoice[]
    defaultValue?: string
    description?: string
    rejectText?: string
    title: string
    value?: string
    warning?: string
  }>(),
  {
    approveText: '确认执行',
    choices: () => [],
    defaultValue: '',
    description: '',
    rejectText: '取消',
    value: undefined,
    warning: '',
  },
)

const emit = defineEmits<{
  'approve': [value: string]
  'reject': []
  'update:value': [value: string]
}>()

const internalValue = shallowRef(props.value ?? props.defaultValue)
const currentValue = computed(() => props.value ?? internalValue.value)

function select(value: string) {
  internalValue.value = value
  emit('update:value', value)
}

function approve() {
  if (currentValue.value) { emit('approve', currentValue.value) }
}
</script>

<template>
  <VCard class="agent-approval !overflow-visible" :padding="false" variant="outline" role="group" :aria-label="title">
    <view class="agent-approval__body">
      <view class="agent-approval__header">
        <view class="agent-approval__icon" aria-hidden="true">
          <image :src="agentShieldAlertIcon" mode="aspectFit" />
        </view>
        <view class="agent-approval__heading">
          <text class="agent-approval__eyebrow">
            需要你的确认
          </text>
          <text class="agent-approval__title">
            {{ title }}
          </text>
          <text v-if="description" class="agent-approval__description">
            {{ description }}
          </text>
        </view>
      </view>

      <view v-if="choices.length" class="agent-approval__choices" role="radiogroup">
        <button
          v-for="choice in choices"
          :key="choice.value"
          class="agent-approval__choice"
          type="button"
          role="radio"
          :disabled="choice.disabled"
          :aria-checked="choice.value === currentValue"
          :data-disabled="String(Boolean(choice.disabled))"
          :data-selected="String(choice.value === currentValue)"
          hover-class="agent-approval__choice--pressed"
          :hover-start-time="20"
          :hover-stay-time="70"
          @click="select(choice.value)"
        >
          <text class="agent-approval__radio" aria-hidden="true" />
          <view class="agent-approval__choice-copy">
            <text class="agent-approval__choice-title">
              {{ choice.label }}
            </text>
            <text v-if="choice.description" class="agent-approval__choice-description">
              {{ choice.description }}
            </text>
          </view>
        </button>
      </view>

      <text v-if="warning" class="agent-approval__warning" role="alert">
        {{ warning }}
      </text>
      <slot />

      <view class="agent-approval__footer">
        <VButton class="agent-approval__reject" tone="default" variant="outline" @click="emit('reject')">
          {{ rejectText }}
        </VButton>
        <VButton class="agent-approval__approve" :disabled="choices.length > 0 && !currentValue" @click="approve">
          {{ approveText }}
        </VButton>
      </view>
    </view>
  </VCard>
</template>

<style scoped>
.agent-approval {
  color: var(--varo-ui-text);
  background: var(--varo-ui-surface);
  border-color: var(--varo-ui-border);
  border-radius: 14px;
}

.agent-approval__body {
  display: grid;
  gap: 14px;
  padding: 16px;
}

.agent-approval__header {
  display: flex;
  gap: 11px;
  align-items: flex-start;
}

.agent-approval__icon {
  display: grid;
  flex: none;
  place-items: center;
  width: 32px;
  height: 32px;
  font-weight: 850;
  color: var(--varo-ui-warning-dark);
  background: var(--varo-ui-warning-soft);
  border-radius: 9px;
}

.agent-approval__icon image {
  width: 20px;
  height: 20px;
}

.agent-approval__heading,
.agent-approval__choice-copy {
  display: grid;
  min-width: 0;
}

.agent-approval__heading {
  gap: 2px;
}

.agent-approval__eyebrow {
  font-size: 10px;
  font-weight: 800;
  color: var(--varo-ui-warning);
  letter-spacing: 0.08em;
}

.agent-approval__title {
  font-size: 15px;
  font-weight: 760;
  line-height: 1.4;
  color: var(--varo-ui-text);
}

.agent-approval__description {
  font-size: 12px;
  line-height: 1.55;
  color: var(--varo-ui-text-regular);
}

.agent-approval__choices {
  display: grid;
  gap: 8px;
}

.agent-approval__choice {
  display: flex;
  gap: 10px;
  align-items: center;
  min-height: 52px;
  padding: 8px 11px;
  color: var(--varo-ui-text);
  text-align: left;
  background: var(--varo-ui-fill-light);
  border: 1px solid var(--varo-ui-border);
  border-radius: 10px;
}

.agent-approval__choice[data-selected='true'] {
  background: var(--varo-ui-primary-soft);
  border-color: var(--varo-ui-primary);
}

.agent-approval__choice[data-disabled='true'] {
  opacity: 0.5;
}

.agent-approval__choice--pressed {
  transform: scale(0.985);
}

.agent-approval__radio {
  box-sizing: border-box;
  width: 18px;
  height: 18px;
  background: var(--varo-ui-surface);
  border: 1px solid var(--varo-ui-border-strong);
  border-radius: 999px;
}

.agent-approval__choice[data-selected='true'] .agent-approval__radio {
  background: var(--varo-ui-primary);
  border: 4px solid var(--varo-ui-surface);
  box-shadow: 0 0 0 1px var(--varo-ui-primary);
}

.agent-approval__choice-copy {
  gap: 2px;
}

.agent-approval__choice-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--varo-ui-text);
}

.agent-approval__choice-description {
  font-size: 11px;
  color: var(--varo-ui-text-muted);
}

.agent-approval__warning {
  padding: 8px 10px;
  font-size: 11px;
  line-height: 1.45;
  color: var(--varo-ui-danger-dark);
  background: var(--varo-ui-danger-soft);
  border-radius: 8px;
}

.agent-approval__footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.agent-approval__reject,
.agent-approval__approve {
  min-height: 36px;
}

@media (prefers-reduced-motion: reduce) {
  .agent-approval__choice {
    transition: none;
  }
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
