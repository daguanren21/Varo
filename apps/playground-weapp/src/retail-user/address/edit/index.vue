<script setup lang="ts">
import type { RetailAddress } from '../../../features/retail/types'
import { onLoad, shallowRef } from 'wevu'
import VButton from '../../../components/ui/v-button.vue'
import VCard from '../../../components/ui/v-card.vue'
import VInput from '../../../components/ui/v-input.vue'
import VSwitch from '../../../components/ui/v-switch.vue'
import { useRetailStore } from '../../../features/retail/store'

const { addresses, saveAddress } = useRetailStore()
const id = shallowRef(`address-${Date.now()}`)
const name = shallowRef('')
const phone = shallowRef('')
const city = shallowRef('上海市')
const district = shallowRef('浦东新区')
const detail = shallowRef('')
const isDefault = shallowRef(false)

onLoad((options) => {
  const requestedId = String(options?.id ?? '')
  const current = addresses.value.find(address => address.id === requestedId)
  if (!current) { return }
  id.value = current.id
  name.value = current.name
  phone.value = current.phone
  city.value = current.city
  district.value = current.district
  detail.value = current.detail
  isDefault.value = current.isDefault
})

function submit() {
  if (!name.value.trim() || !phone.value.trim() || !detail.value.trim()) {
    wx.showToast({ title: '请完善地址信息', icon: 'none' })
    return
  }
  const address: RetailAddress = {
    city: city.value,
    detail: detail.value,
    district: district.value,
    id: id.value,
    isDefault: isDefault.value,
    name: name.value,
    phone: phone.value,
  }
  saveAddress(address)
  wx.showToast({ title: '地址已保存', icon: 'success' })
  setTimeout(() => wx.navigateBack(), 350)
}
</script>

<template>
  <view class="min-h-screen bg-[#f4f6f8] pb-28 text-slate-950">
    <view class="grid gap-3 px-3 py-3">
      <VCard class-name="grid gap-3" variant="default">
        <VInput :value="name" label="收货人" placeholder="请输入姓名" @update:value="name = $event" />
        <VInput :value="phone" label="手机号码" placeholder="请输入手机号" type="tel" @update:value="phone = $event" />
        <VInput :value="city" label="省市" placeholder="请选择省市" @update:value="city = $event" />
        <VInput :value="district" label="区县" placeholder="请选择区县" @update:value="district = $event" />
        <VInput :value="detail" label="详细地址" placeholder="街道、楼牌号等" type="textarea" :rows="3" @update:value="detail = $event" />
      </VCard>

      <VCard class-name="flex items-center justify-between" variant="default">
        <view class="grid gap-0.5">
          <text class="text-sm font-bold">
            设为默认地址
          </text>
          <text class="text-[10px] text-slate-400">
            结算时优先使用该地址
          </text>
        </view>
        <VSwitch v-model:checked="isDefault" />
      </VCard>
    </view>

    <view class="fixed inset-x-0 bottom-0 z-20 bg-white px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-3">
      <VButton block size="lg" @click="submit">
        保存地址
      </VButton>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/page.json",
  "navigationBarTitleText": "编辑地址",
  "usingComponents": {}
}
</json>
