<script setup lang="ts">
withDefaults(
  defineProps<{
    disabled?: boolean
    suggestions?: string[]
  }>(),
  {
    disabled: false,
    suggestions: () => [],
  },
)

const emit = defineEmits<{
  select: [value: string]
}>()
</script>

<template>
  <scroll-view class="agent-prompt-suggestions box-border w-full whitespace-nowrap" scroll-x :show-scrollbar="false">
    <view class="inline-flex min-w-full gap-2 p-px">
      <button
        v-for="suggestion in suggestions"
        :key="suggestion"
        class="box-border inline-flex min-h-9 flex-none items-center justify-center rounded-full border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] px-3 disabled:opacity-45"
        type="button"
        :disabled="disabled"
        @click="emit('select', suggestion)"
      >
        <text class="whitespace-nowrap text-[12px] font-semibold text-[var(--varo-agent-foreground)]">
          {{ suggestion }}
        </text>
      </button>
    </view>
  </scroll-view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
