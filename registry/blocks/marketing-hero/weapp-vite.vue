<script setup lang="ts">
import type { MarketingHeroAction, MarketingHeroContent } from './marketing-hero.types'
import { computed } from 'wevu'
import VButton from '../ui/v-button.vue'
import VImage from '../ui/v-image.vue'

const props = withDefaults(defineProps<{
  content: MarketingHeroContent | null
  loading?: boolean
  error?: string
  disabled?: boolean
  pendingActionId?: string
  emptyText?: string
}>(), { content: null, loading: false, error: '', disabled: false, pendingActionId: '', emptyText: 'No introduction available.' })
const emit = defineEmits<{ action: [action: MarketingHeroAction] }>()
const blocked = computed(() => props.loading || !!props.error || props.disabled || !!props.pendingActionId)
const actions = computed(() => (props.content?.actions ?? []).map((action, index) => ({
  ...action,
  variant: index === 0 ? 'solid' as const : 'outline' as const,
  blocked: blocked.value || !action.allowed || !!action.disabled,
  pending: props.pendingActionId === action.id,
})))
function activate(id: string) {
  const action = props.content?.actions.find(item => item.id === id)
  if (blocked.value || !action?.allowed || action.disabled) { return }
  emit('action', action)
}
</script>

<template>
  <view class="grid min-w-0 gap-4 break-words" aria-label="Introduction">
    <text v-if="loading" role="status">
      Loading introduction…
    </text>
    <text v-if="error" role="alert" class="text-[var(--varo-ui-danger)]">
      {{ error }}
    </text>
    <view v-if="content" class="grid min-w-0 gap-4">
      <text class="text-sm text-[var(--varo-ui-text-regular)]">
        {{ content.eyebrow }}
      </text>
      <text class="text-3xl font-semibold leading-tight">
        {{ content.title }}
      </text>
      <text class="whitespace-pre-wrap text-base leading-relaxed">
        {{ content.description }}
      </text>
      <VImage v-if="content.image" :src="content.image.src" :alt="content.image.alt" width="100%" :height="180" fit="contain" loading-text="Loading illustration…" error-text="Illustration unavailable" />
      <view class="flex flex-wrap gap-3">
        <view v-for="action in actions" :key="action.id" class="grid min-w-0 gap-1">
          <VButton class-name="h-auto min-h-11 max-w-full whitespace-normal break-words" :variant="action.variant" :disabled="action.blocked" :loading="action.pending" loading-text="Awaiting host…" @click="activate(action.id)">
            {{ action.label }}
          </VButton>
          <text v-if="action.description" class="text-xs text-[var(--varo-ui-text-regular)]">
            {{ action.description }}
          </text>
        </view>
      </view>
    </view>
    <text v-else-if="!loading && !error" role="status">
      {{ emptyText }}
    </text>
  </view>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
