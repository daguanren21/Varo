<script setup lang="ts">
import type { RetailAddress } from '../../../features/retail/types'
import { computed, onLoad, shallowRef } from 'wevu'
import RetailRequestState from '../../../components/retail/RetailRequestState.vue'
import VButton from '../../../components/ui/v-button.vue'
import VCard from '../../../components/ui/v-card.vue'
import VInput from '../../../components/ui/v-input.vue'
import VSwitch from '../../../components/ui/v-switch.vue'
import { errorMessage, RetailServiceError } from '../../../features/retail/service'
import { useRetailStore } from '../../../features/retail/store'
import { runRetailAction } from '../../../features/retail/use-retail-page'

const { addresses, saveAddress, load, loading, loadError } = useRetailStore()
const requestedId = shallowRef('')
const ready = shallowRef(false)
const saving = shallowRef(false)
const formError = shallowRef('')
const saveDisabled = computed(() => !ready.value || saving.value)
const id = shallowRef(`address-${Date.now()}`)
const name = shallowRef('')
const phone = shallowRef('')
const city = shallowRef('上海市')
const district = shallowRef('浦东新区')
const detail = shallowRef('')
const isDefault = shallowRef(false)

function loadForm() {
  return runRetailAction(async () => {
    ready.value = false
    formError.value = ''
    await load()
    const current = addresses.value.find(address => address.id === requestedId.value)
    if (requestedId.value && !current) {
      formError.value = '该地址不存在，请返回地址列表'
      throw new RetailServiceError('NOT_FOUND', formError.value)
    }
    if (current) {
      id.value = current.id
      name.value = current.name
      phone.value = current.phone
      city.value = current.city
      district.value = current.district
      detail.value = current.detail
      isDefault.value = current.isDefault
    }
    ready.value = true
  })
}

onLoad((options) => {
  requestedId.value = String(options?.id ?? '')
  return loadForm()
})

async function submit() {
  if (saveDisabled.value) { return }
  saving.value = true
  formError.value = ''
  const address: RetailAddress = {
    city: city.value.trim(),
    detail: detail.value.trim(),
    district: district.value.trim(),
    id: id.value,
    isDefault: isDefault.value,
    name: name.value.trim(),
    phone: phone.value.trim(),
  }
  try {
    await saveAddress(address)
    wx.showToast({ title: '地址已保存并选中', icon: 'success' })
    wx.navigateBack({ fail: () => wx.showToast({ title: '返回失败，请手动返回地址列表', icon: 'none' }) })
  }
  catch (error) { formError.value = errorMessage(error) }
  finally { saving.value = false }
}
</script>

<template>
  <view class="min-h-screen bg-[#f4f6f8] pb-28 text-slate-950">
    <RetailRequestState :loading="loading" :error="loadError" @retry="loadForm" />
    <VCard v-if="formError" class-name="m-3 text-sm text-red-600">
      {{ formError }}
    </VCard>
    <view v-if="ready" class="grid gap-3 px-3 py-3">
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
        <VSwitch v-model="isDefault" />
      </VCard>
    </view>

    <view class="fixed inset-x-0 bottom-0 z-20 bg-white px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-3">
      <VButton block size="lg" :disabled="saveDisabled" :loading="saving" @click="submit">
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
