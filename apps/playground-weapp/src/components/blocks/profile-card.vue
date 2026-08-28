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
  cn('w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm', props.className),
)
</script>

<template>
  <view :class="rootClass" aria-label="用户资料">
    <view class="flex items-start gap-4">
      <VAvatar
        :src="user.avatar"
        :alt="user.name"
        :fallback="user.fallback || user.name.slice(0, 2)"
        :size="64"
      />
      <view class="min-w-0 flex-1">
        <view class="flex flex-wrap items-center gap-2">
          <text class="truncate text-lg font-bold text-slate-950">
            {{ user.name }}
          </text>
          <VBadge v-if="user.status" :tone="user.statusTone || 'primary'" variant="soft">
            {{ user.status }}
          </VBadge>
        </view>
        <text v-if="user.subtitle" class="mt-1 block text-sm leading-6 text-slate-500">
          {{ user.subtitle }}
        </text>
      </view>
      <VButton v-if="editable" size="sm" variant="outline" @click="emit('edit')">
        编辑
      </VButton>
    </view>

    <view v-if="stats.length" class="mt-5 grid grid-cols-3 divide-x divide-slate-200 border-t border-slate-100 pt-4">
      <VButton
        v-for="(stat, index) in stats"
        :key="`${stat.label}-${index}`"
        size="sm"
        variant="ghost"
        tone="default"
        class-name="!grid !min-h-0 !gap-1 !rounded-none !bg-transparent !px-2 !text-center"
        @click="emit('selectStat', { index, stat })"
      >
        <text class="text-base font-bold text-slate-950">
          {{ stat.value }}
        </text>
        <text class="text-xs text-slate-500">
          {{ stat.label }}
        </text>
      </VButton>
    </view>

    <view v-if="$slots.default" class="mt-4 border-t border-slate-100 pt-4">
      <slot />
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
