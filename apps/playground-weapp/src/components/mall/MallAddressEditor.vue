<script setup lang="ts">
import { computed, shallowRef, watch } from 'wevu'
import VButton from '../ui/v-button.vue'
import VInput from '../ui/v-input.vue'
import VSwitch from '../ui/v-switch.vue'
import type { MallAddress, MallAddressDraft } from '../../features/mall/useMallAgent'

const props = defineProps<{
  initial?: MallAddress
}>()

const emit = defineEmits<{
  cancel: []
  save: [address: MallAddressDraft]
}>()

const detail = shallowRef('')
const isDefault = shallowRef(true)
const name = shallowRef('')
const phone = shallowRef('')
const canSave = computed(() => name.value.trim() && /^1\d{10}$/.test(phone.value) && detail.value.trim())

function reset(address?: MallAddress) {
  detail.value = address?.detail ?? ''
  isDefault.value = address?.isDefault ?? true
  name.value = address?.name ?? ''
  phone.value = address?.phone ?? ''
}

watch(() => props.initial, reset, { immediate: true })

function formatPhone(value: string) {
  return value.replace(/\D/g, '')
}

function save() {
  if (!canSave.value) return
  emit('save', {
    detail: detail.value.trim(),
    id: props.initial?.id,
    isDefault: isDefault.value,
    name: name.value.trim(),
    phone: phone.value
  })
}
</script>

<template>
  <view class="grid gap-3.5 rounded-2xl border border-blue-200 bg-blue-50/60 p-3.5">
    <view>
      <text class="text-[10px] font-extrabold tracking-[.12em] text-blue-700">ADDRESS</text>
      <text class="mt-1 block text-[15px] font-extrabold text-slate-950">配置收货地址</text>
    </view>
    <form class="grid gap-3" @submit="save">
      <VInput v-model:value="name" label="收货人" clearable placeholder="请输入姓名" />
      <VInput v-model:value="phone" label="手机号" type="tel" :formatter="formatPhone" :max-length="11" clearable placeholder="请输入手机号" />
      <VInput v-model:value="detail" label="详细地址" type="textarea" :rows="3" :max-length="120" show-word-limit placeholder="省市区、街道和门牌号" />
      <view class="flex min-h-11 items-center justify-between gap-3 rounded-xl bg-white px-3">
        <view class="grid gap-0.5">
          <text class="text-xs font-bold text-slate-700">设为默认地址</text>
          <text class="text-[10px] text-slate-400">AI 下单时优先使用</text>
        </view>
        <VSwitch v-model="isDefault" />
      </view>
      <view class="flex justify-end gap-2 pt-1">
        <VButton variant="ghost" native-type="button" @click="emit('cancel')">取消</VButton>
        <VButton native-type="submit" :disabled="!canSave">保存地址</VButton>
      </view>
    </form>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
