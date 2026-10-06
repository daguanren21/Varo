<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'
import VAvatar from '../ui/avatar.vue'
import VBadge from '../ui/badge.vue'
import VButton from '../ui/v-button.vue'

type BadgeTone = 'default' | 'primary' | 'success' | 'warning' | 'danger'

interface ProfileCardUser {
  avatar?: string
  fallback?: string
  name: string
  status?: string
  statusTone?: BadgeTone
  subtitle?: string
}

interface ProfileStat {
  label: string
  value: number | string
}

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    editable?: boolean
    stats?: ProfileStat[]
    user: ProfileCardUser
  }>(),
  {
    editable: true,
    stats: () => [],
  },
)

const emit = defineEmits<{
  edit: []
  selectStat: [payload: { index: number, stat: ProfileStat }]
}>()

const rootClass = computed(() =>
  cn(
    'box-border w-full bg-[var(--varo-ui-surface)] p-6 text-sm leading-6 text-[var(--varo-ui-text)]',
    '[&_.varo-badge]:!max-w-full [&_.varo-badge]:!whitespace-normal [&_.varo-badge]:!break-words [&_.varo-badge]:!text-xs [&_.varo-badge]:!font-medium [&_.varo-badge]:!leading-5 [&_.varo-badge]:!text-[var(--varo-ui-text)]',
    props.className,
  ),
)
</script>

<template>
  <view :class="rootClass" aria-label="用户资料">
    <view class="flex items-start gap-4">
      <VAvatar
        :src="user.avatar"
        :alt="user.name"
        :fallback="user.fallback || user.name.slice(0, 2)"
        :size="56"
      />
      <view class="min-w-0 flex-1">
        <text class="block break-words text-xl font-semibold leading-7">
          {{ user.name }}
        </text>
        <text v-if="user.subtitle" class="mt-1 block break-words text-xs leading-5 text-[var(--varo-ui-text-regular)]">
          {{ user.subtitle }}
        </text>
        <view v-if="user.status" class="mt-2 flex min-w-0">
          <VBadge :tone="user.statusTone || 'primary'" variant="soft" class="min-w-0 max-w-full">
            <text class="block min-w-0 break-words">
              {{ user.status }}
            </text>
          </VBadge>
        </view>
      </view>
    </view>

    <view v-if="stats.length" class="mt-6 grid grid-cols-3 gap-2 border-t border-[var(--varo-ui-border-lighter)] pt-4">
      <view v-for="(stat, index) in stats" :key="`${stat.label}-${index}`" class="min-w-0">
        <VButton
          block
          variant="ghost"
          tone="default"
          class-name="!min-h-16 !min-w-0 !whitespace-normal !rounded-lg !px-2 !py-3 !font-normal"
          @click="emit('selectStat', { index, stat })"
        >
          <text class="block w-full min-w-0 text-center">
            <text class="block break-words text-lg font-semibold leading-6 tabular-nums text-[var(--varo-ui-text)]">
              {{ stat.value }}
            </text>
            <text class="mt-1 block break-words text-xs leading-5 text-[var(--varo-ui-text-regular)]">
              {{ stat.label }}
            </text>
          </text>
        </VButton>
      </view>
    </view>

    <view v-if="$slots.default" class="mt-6 border-t border-[var(--varo-ui-border-lighter)] pt-6 text-sm leading-6">
      <slot />
    </view>

    <VButton
      v-if="editable"
      block
      size="lg"
      color="var(--varo-ui-text)"
      foreground-color="var(--varo-ui-surface)"
      class-name="!mt-6 !min-h-12 !rounded-lg !text-sm !shadow-none"
      @click="emit('edit')"
    >
      编辑资料
    </VButton>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
