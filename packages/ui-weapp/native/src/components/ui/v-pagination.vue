<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'
import { getPaginationTokens, isAvailablePage } from './pagination-utils'

type PaginationMode = 'multi' | 'simple'

interface RenderedPage {
  activeData: string
  ariaCurrent: 'page' | undefined
  ariaLabel: string
  key: string | number
  ellipsis: boolean
  label: string
  value: number
}

const props = withDefaults(
  defineProps<{
    ariaLabel?: string
    className?: ClassValue
    itemAriaLabel?: string
    mode?: PaginationMode
    modelValue?: number
    nextText?: string
    pageCount?: number
    prevText?: string
  }>(),
  {
    ariaLabel: '分页',
    className: undefined,
    itemAriaLabel: '第 {page} 页，共 {total} 页',
    mode: 'multi',
    modelValue: 1,
    nextText: '下一页',
    pageCount: 1,
    prevText: '上一页',
  },
)

const emit = defineEmits<{
  'change': [page: number]
  'update:modelValue': [page: number]
}>()

function itemLabel(page: number) {
  return props.itemAriaLabel
    .replaceAll('{page}', String(page))
    .replaceAll('{total}', String(props.pageCount))
}

const classes = computed(() => cn('varo-pagination', props.className))
const isSimple = computed(() => props.mode === 'simple')
const nextDisabled = computed(() => !isAvailablePage(props.modelValue + 1, props.pageCount))
const pages = computed<RenderedPage[]>(() =>
  getPaginationTokens(props.pageCount, props.modelValue).map((token) => {
    const ellipsis = typeof token === 'string'
    const value = ellipsis ? 0 : token
    const active = value === props.modelValue && !ellipsis
    return {
      key: token,
      ellipsis,
      activeData: String(active),
      ariaCurrent: active ? 'page' : undefined,
      ariaLabel: ellipsis ? '' : itemLabel(value),
      label: ellipsis ? '…' : String(value),
      value,
    }
  }),
)
const previousDisabled = computed(() => !isAvailablePage(props.modelValue - 1, props.pageCount))
const simpleText = computed(() => `${props.modelValue}/${props.pageCount}`)

function setPage(page: number) {
  if (!isAvailablePage(page, props.pageCount) || page === props.modelValue) { return }

  emit('update:modelValue', page)
  emit('change', page)
}

function previous() {
  setPage(props.modelValue - 1)
}

function next() {
  setPage(props.modelValue + 1)
}
</script>

<template>
  <view
    :class="classes"
    role="navigation"
    :aria-label="props.ariaLabel"
    :data-mode="props.mode"
  >
    <button
      class="varo-pagination__prev"
      :disabled="previousDisabled"
      @click="previous"
    >
      {{ props.prevText }}
    </button>
    <text v-if="isSimple" class="varo-pagination__simple">
      {{ simpleText }}
    </text>
    <template v-else>
      <template v-for="page in pages" :key="page.key">
        <text v-if="page.ellipsis" class="varo-pagination__ellipsis" aria-hidden="true">
          {{ page.label }}
        </text>
        <button
          v-else
          class="varo-pagination__page"
          :aria-current="page.ariaCurrent"
          :aria-label="page.ariaLabel"
          :data-active="page.activeData"
          @click="setPage(page.value)"
        >
          {{ page.label }}
        </button>
      </template>
    </template>
    <button
      class="varo-pagination__next"
      :disabled="nextDisabled"
      @click="next"
    >
      {{ props.nextText }}
    </button>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
