<script setup lang="ts">
import { computed, ref, shallowRef } from 'wevu'
import VButton from '../../components/ui/v-button.vue'
import VTimeField from '../../components/ui/v-time-field.vue'

const cases = ref([
  { id: 'normal', label: '每分钟', value: '09:30', min: '00:00', max: '23:59', step: 1, disabled: false, readonly: false, description: '选择小时和分钟后确认。取消时保留已接受的时间。' },
  { id: 'step', label: '15 分钟步长', value: '09:07', min: '09:00', max: '18:00', step: 15, disabled: false, readonly: false, description: '外部传入的 09:07 保持原样显示，确认合法候选后才更新。' },
  { id: 'overnight', label: '跨午夜', value: '23:45', min: '22:30', max: '02:15', step: 15, disabled: false, readonly: false, description: '22:30–02:15 跨过午夜，晚间与凌晨均可选择。' },
  { id: 'empty', label: '无可选时间', value: '10:07', min: '10:01', max: '10:14', step: 15, disabled: false, readonly: false, description: '10:01–10:14 内没有符合 15 分钟步长的候选，确认按钮禁用。' },
  { id: 'disabled', label: '禁用', value: '09:30', min: '00:00', max: '23:59', step: 15, disabled: true, readonly: false, description: '父级强制展开后，选择、清空和确认仍不可操作。取消可以关闭。' },
  { id: 'readonly', label: '只读', value: '09:30', min: '00:00', max: '23:59', step: 15, disabled: false, readonly: true, description: '可阅读已接受时间；父级强制展开也不能修改。' },
])
const selected = shallowRef(0)
const current = computed(() => cases.value[selected.value])
const scenarios = computed(() => cases.value.map((item, index) => {
  const variant: 'solid' | 'outline' = selected.value === index ? 'solid' : 'outline'
  return { id: item.id, label: item.label, index, variant, active: selected.value === index }
}))
const visible = shallowRef(true)
const draft = shallowRef('尚未编辑')
const status = shallowRef('选择时间以开始')
const intent = shallowRef('尚未确认')
const rejectNext = shallowRef(false)
const acceptedLabel = computed(() => current.value.value || '空值')
const visibilityLabel = computed(() => visible.value ? '收起选择器' : '展开选择器')
const rejectionLabel = computed(() => rejectNext.value ? '将拒绝下次更新' : '拒绝下次更新')

function selectCase(index: number) {
  selected.value = index
  visible.value = true
  draft.value = '尚未编辑'
  intent.value = '尚未确认'
  status.value = '已切换场景'
}

function accept(value: string) {
  if (rejectNext.value) {
    rejectNext.value = false
    status.value = `父级保留 ${current.value.value || '空值'}；拒绝 ${value || '清空'}`
    return
  }
  current.value.value = value
  status.value = `父级接受 ${value || '空值'}`
}
</script>

<template>
  <view class="box-border min-h-screen min-w-0 bg-[var(--varo-ui-bg)] p-4 text-[var(--varo-ui-text)]">
    <view class="mx-auto grid max-w-2xl min-w-0 gap-6">
      <view class="grid gap-2">
        <text class="text-xs tracking-widest text-[var(--varo-ui-text-muted)]">
          VARO / TIME FIELD
        </text>
        <text class="text-2xl font-bold">
          选择时间
        </text>
        <text class="text-sm leading-relaxed">
          精确到分钟，明确确认，已接受值始终由父级控制。
        </text>
      </view>
      <view class="flex flex-wrap gap-2">
        <VButton
          v-for="item in scenarios" :key="item.id" size="sm"
          :variant="item.variant" :aria-pressed="item.active" @click="selectCase(item.index)"
        >
          {{ item.label }}
        </VButton>
      </view>
      <view class="grid min-w-0 gap-4 border-t border-[var(--varo-ui-border)] pt-6">
        <text class="text-xl font-bold">
          {{ current.label }}
        </text>
        <text class="text-sm leading-relaxed">
          {{ current.description }}
        </text>
        <VTimeField
          :value="current.value" :visible="visible" :min="current.min" :max="current.max"
          :minute-step="current.step" :disabled="current.disabled" :readonly="current.readonly"
          clearable title="选择时间" placeholder="请选择时间" confirm-text="确认" cancel-text="取消" clear-text="清空"
          @update:value="accept" @update:visible="visible = $event" @change="draft = $event"
          @confirm="intent = `已确认 ${$event}`" @cancel="intent = '已取消；保留原值'"
        />
        <view class="grid gap-3 text-sm">
          <text>已接受：{{ acceptedLabel }}</text>
          <text>最近草稿：{{ draft }}</text>
          <text>范围：{{ current.min }}–{{ current.max }} / {{ current.step }} 分钟</text>
        </view>
        <view class="flex flex-wrap gap-2">
          <VButton variant="outline" @click="visible = !visible">
            {{ visibilityLabel }}
          </VButton>
          <VButton variant="outline" :aria-pressed="rejectNext" @click="rejectNext = !rejectNext">
            {{ rejectionLabel }}
          </VButton>
        </view>
        <view class="grid min-h-12 gap-2 text-sm text-[var(--varo-ui-text-muted)]">
          <text>{{ intent }}</text>
          <text>{{ status }}</text>
        </view>
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
