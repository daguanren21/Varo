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
  cn(
    'box-border w-full bg-[var(--varo-ui-surface)] p-6 text-sm leading-6 text-[var(--varo-ui-text)]',
    '[&_.varo-badge]:!max-w-full [&_.varo-badge]:!whitespace-normal [&_.varo-badge]:!break-words [&_.varo-badge]:!text-xs [&_.varo-badge]:!font-medium [&_.varo-badge]:!leading-5 [&_.varo-badge]:!text-[var(--varo-ui-text)]',
    props.className,
  ),
)
</script>

<template>
  <section :class="rootClass" aria-label="用户资料">
    <header class="flex items-start gap-4">
      <VAvatar
        :src="user.avatar"
        :alt="user.name"
        :fallback="user.fallback || user.name.slice(0, 2)"
        :size="56"
      />
      <div class="min-w-0 flex-1">
        <h2 class="m-0 break-words text-xl font-semibold leading-7">
          {{ user.name }}
        </h2>
        <p v-if="user.subtitle" class="mb-0 mt-1 break-words text-xs leading-5 text-[var(--varo-ui-text-regular)]">
          {{ user.subtitle }}
        </p>
        <div v-if="user.status" class="mt-2 flex min-w-0">
          <VBadge :tone="user.statusTone || 'primary'" variant="soft">
            <span class="block min-w-0 break-words">{{ user.status }}</span>
          </VBadge>
        </div>
      </div>
    </header>

    <div v-if="stats.length" class="mt-6 grid grid-cols-3 gap-2 border-t border-[var(--varo-ui-border-lighter)] pt-4">
      <VButton
        v-for="(stat, index) in stats"
        :key="`${stat.label}-${index}`"
        block
        variant="ghost"
        tone="default"
        class="!min-h-16 !min-w-0 !whitespace-normal !rounded-lg !px-2 !py-3 !font-normal"
        @click="emit('selectStat', { index, stat })"
      >
        <span class="grid w-full min-w-0 grid-cols-1 gap-1 text-center">
          <strong class="break-words text-lg font-semibold leading-6 tabular-nums text-[var(--varo-ui-text)]">{{ stat.value }}</strong>
          <span class="break-words text-xs leading-5 text-[var(--varo-ui-text-regular)]">{{ stat.label }}</span>
        </span>
      </VButton>
    </div>

    <div v-if="$slots.default" class="mt-6 border-t border-[var(--varo-ui-border-lighter)] pt-6 text-sm leading-6">
      <slot />
    </div>

    <VButton
      v-if="editable"
      block
      size="lg"
      color="var(--varo-ui-text)"
      foreground-color="var(--varo-ui-surface)"
      class="!mt-6 !min-h-12 !rounded-lg !text-sm !shadow-none"
      @click="emit('edit')"
    >
      编辑资料
    </VButton>
  </section>
</template>
