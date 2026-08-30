<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { BadgeTone } from '../ui/badge'
import { computed } from 'vue'
import { cn } from '../../lib/cn'
import { VAvatar } from '../ui/avatar'
import { VBadge } from '../ui/badge'
import { VButton } from '../ui/button'

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
  <section :class="rootClass" aria-label="用户资料">
    <header class="flex items-start gap-4">
      <VAvatar
        :src="user.avatar"
        :alt="user.name"
        :fallback="user.fallback || user.name.slice(0, 2)"
        :size="64"
      />
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <h2 class="m-0 truncate text-lg font-bold text-slate-950">
            {{ user.name }}
          </h2>
          <VBadge v-if="user.status" :tone="user.statusTone || 'primary'" variant="soft">
            {{ user.status }}
          </VBadge>
        </div>
        <p v-if="user.subtitle" class="mt-1 text-sm leading-6 text-slate-500">
          {{ user.subtitle }}
        </p>
      </div>
      <VButton v-if="editable" size="sm" variant="outline" @click="emit('edit')">
        编辑
      </VButton>
    </header>

    <div v-if="stats.length" class="mt-5 grid grid-cols-3 divide-x divide-slate-200 border-t border-slate-100 pt-4">
      <VButton
        v-for="(stat, index) in stats"
        :key="`${stat.label}-${index}`"
        size="sm"
        variant="ghost"
        tone="default"
        class="!grid !min-h-0 !gap-1 !rounded-none !bg-transparent !px-2 !text-center"
        @click="emit('selectStat', { index, stat })"
      >
        <strong class="text-base text-slate-950">{{ stat.value }}</strong>
        <span class="text-xs text-slate-500">{{ stat.label }}</span>
      </VButton>
    </div>

    <div v-if="$slots.default" class="mt-4 border-t border-slate-100 pt-4">
      <slot />
    </div>
  </section>
</template>
