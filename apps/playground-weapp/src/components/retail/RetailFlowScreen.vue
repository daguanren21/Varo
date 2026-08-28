<script setup lang="ts">
import { computed, shallowRef } from 'wevu'
import { navigateRetail } from '../../features/retail/navigation'
import { retailScreens } from '../../features/retail/screens'
import VTag from '../ui/tag.vue'
import VButton from '../ui/v-button.vue'
import VCard from '../ui/v-card.vue'
import VInput from '../ui/v-input.vue'

const props = defineProps<{
  screenId: string
}>()

const values = shallowRef<Record<string, string>>({})
const screen = computed(() => retailScreens[props.screenId] ?? {
  description: 'Varo Retail 业务页面',
  eyebrow: 'VARO RETAIL',
  sections: [],
  title: '零售服务',
})
const visibleSections = computed(() =>
  screen.value.sections.map((section, index) => ({
    ...section,
    tone: index === 0 ? 'primary' as const : 'default' as const,
    variant: index === 0 ? 'elevated' as const : 'default' as const,
  })),
)
const visibleFields = computed(() =>
  (screen.value.fields ?? []).map(field => ({
    ...field,
    inputType: field.type ?? 'text',
    rows: field.type === 'textarea' ? 4 : 1,
    value: values.value[field.label] ?? '',
  })),
)
const hasFields = computed(() => visibleFields.value.length > 0)

function updateField(label: string, value: string) {
  values.value = { ...values.value, [label]: value }
}

function submit() {
  if (screen.value.primaryPath) {
    navigateRetail(screen.value.primaryPath)
    return
  }
  wx.showToast({ title: `${screen.value.primaryAction ?? '操作'}成功`, icon: 'success' })
}
</script>

<template>
  <view class="retail-page-enter min-h-screen bg-[#f4f6f8] pb-28 text-slate-950">
    <view class="retail-section-enter bg-slate-950 px-4 pb-10 pt-7 text-white">
      <text class="text-[9px] font-black tracking-[0.18em] text-teal-300">
        {{ screen.eyebrow }}
      </text>
      <text class="mt-1 block text-2xl font-black">
        {{ screen.title }}
      </text>
      <text class="mt-2 block max-w-[88%] text-xs leading-5 text-slate-300">
        {{ screen.description }}
      </text>
    </view>

    <view class="retail-section-enter -mt-4 grid gap-3 px-3 pb-4">
      <VCard v-for="section in visibleSections" :key="section.title" :variant="section.variant">
        <view class="grid gap-2">
          <view class="flex items-center justify-between gap-3">
            <text class="text-sm font-black">
              {{ section.title }}
            </text>
            <VTag v-if="section.status" :label="section.status" :tone="section.tone" variant="soft" size="sm" />
          </view>
          <text class="text-xs leading-5 text-slate-500">
            {{ section.detail }}
          </text>
        </view>
      </VCard>

      <VCard v-if="hasFields" variant="default">
        <view class="grid gap-6">
          <VInput
            v-for="field in visibleFields"
            :key="field.label"
            :value="field.value"
            :label="field.label"
            :placeholder="field.placeholder"
            :type="field.inputType"
            :rows="field.rows"
            @update:value="updateField(field.label, $event)"
          />
        </view>
      </VCard>
    </view>

    <view v-if="screen.primaryAction" class="fixed inset-x-0 bottom-0 z-20 bg-white px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-3 shadow-[0_-8px_24px_rgba(15,23,42,.06)]">
      <VButton block size="lg" @click="submit">
        {{ screen.primaryAction }}
      </VButton>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
