<script setup lang="ts">
import { computed, shallowRef } from 'wevu'
import { navigateRetail } from '../../features/retail/navigation'
import { retailScreens } from '../../features/retail/screens'
import VButton from '../ui/v-button.vue'
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
  }
}
</script>

<template>
  <view class="retail-page-enter min-h-screen bg-[#f7f4ee] pb-[calc(env(safe-area-inset-bottom)+32px)] text-[#292722]">
    <view class="mx-auto max-w-3xl px-[18px]">
      <view class="retail-section-enter border-b border-[#dcd6cb] py-6">
        <text class="retail-heading block text-[26px] leading-snug">
          {{ screen.title }}
        </text>
        <text class="mt-3 block text-[15px] leading-7 text-[#625e55]">
          以下为静态示例内容，未接入真实支付、物流、售后或资料保存。
        </text>
        <text class="mt-3 block text-base leading-7">
          {{ screen.description }}
        </text>
      </view>

      <view class="retail-section-enter">
        <view
          v-for="section in screen.sections"
          :key="section.title"
          class="grid gap-2 border-b border-[#dcd6cb] py-5"
        >
          <view class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
            <text class="retail-heading min-w-0 text-lg leading-7">
              {{ section.title }}
            </text>
            <text v-if="section.status" class="text-[15px] leading-6 text-[#625e55]">
              {{ section.status }}
            </text>
          </view>
          <text class="text-base leading-7 text-[#625e55]">
            {{ section.detail }}
          </text>
        </view>

        <view v-if="hasFields" class="grid gap-6 py-6">
          <VInput
            v-for="field in visibleFields"
            :key="field.label"
            :value="field.value"
            :label="field.label"
            :placeholder="field.placeholder"
            :type="field.inputType"
            :rows="field.rows"
            size="lg"
            @update:value="updateField(field.label, $event)"
          />
          <text class="text-[15px] leading-7 text-[#625e55]">
            输入内容仅用于当前页面预览，不会保存或提交。
          </text>
        </view>
      </view>

      <view v-if="screen.primaryAction && screen.primaryPath" class="pt-6">
        <VButton block size="lg" class-name="!min-h-12 !rounded-[3px] !text-base !shadow-none" @click="submit">
          {{ screen.primaryAction }}
        </VButton>
      </view>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
