<script setup lang="ts">
withDefaults(
  defineProps<{
    disabled?: boolean
    suggestions?: string[]
  }>(),
  {
    disabled: false,
    suggestions: () => []
  }
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
        class="box-border inline-flex min-h-[34px] flex-none items-center justify-center rounded-full border border-slate-200 bg-white px-3 disabled:opacity-45"
        type="button"
        :disabled="disabled"
        @click="emit('select', suggestion)"
      >
        <text class="whitespace-nowrap text-[11px] font-semibold text-slate-700">{{ suggestion }}</text>
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
