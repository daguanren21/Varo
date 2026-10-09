<script setup lang="ts">
import type { MarketingHeroAction, MarketingHeroContent } from './marketing-hero.types'
import { computed } from 'vue'
import { VButton } from '../ui/button'
import { VImage } from '../ui/image'

const props = withDefaults(defineProps<{
  content: MarketingHeroContent | null
  loading?: boolean
  error?: string
  disabled?: boolean
  pendingActionId?: string
  emptyText?: string
}>(), { loading: false, error: '', disabled: false, pendingActionId: '', emptyText: 'No introduction available.' })
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
  <section class="grid min-w-0 gap-4 break-words" aria-label="Introduction" :aria-busy="loading">
    <p v-if="loading" role="status">
      Loading introduction…
    </p>
    <p v-if="error" role="alert" class="text-[var(--varo-ui-danger)]">
      {{ error }}
    </p>
    <template v-if="content">
      <p class="m-0 text-sm text-[var(--varo-ui-text-regular)]">
        {{ content.eyebrow }}
      </p>
      <h2 class="m-0 text-3xl font-semibold leading-tight">
        {{ content.title }}
      </h2>
      <p class="m-0 whitespace-pre-wrap text-base leading-relaxed">
        {{ content.description }}
      </p>
      <VImage v-if="content.image" :src="content.image.src" :alt="content.image.alt" width="100%" :height="180" fit="contain" loading-text="Loading illustration…" error-text="Illustration unavailable" />
      <div class="flex flex-wrap gap-3">
        <div v-for="action in actions" :key="action.id" class="grid min-w-0 gap-1">
          <VButton class="h-auto min-h-11 max-w-full whitespace-normal break-words" :variant="action.variant" :disabled="action.blocked" :loading="action.pending" loading-text="Awaiting host…" @click="activate(action.id)">
            {{ action.label }}
          </VButton>
          <p v-if="action.description" class="m-0 text-xs text-[var(--varo-ui-text-regular)]">
            {{ action.description }}
          </p>
        </div>
      </div>
    </template>
    <p v-else-if="!loading && !error" role="status">
      {{ emptyText }}
    </p>
  </section>
</template>

<style>
/* Registry styles: generated from the dependency closure. */
@import '../../styles/varo.css';
@import '../../styles/varo-button.css';
@import '../../styles/varo-image.css';
</style>
