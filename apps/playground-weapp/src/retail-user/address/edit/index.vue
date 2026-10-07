<script setup lang="ts">
import type { RetailAddress } from '../../../features/retail/types'
import { computed, onLoad, shallowRef } from 'wevu'
import RetailRequestState from '../../../components/retail/RetailRequestState.vue'
import VButton from '../../../components/ui/v-button.vue'
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
  }, () => loadError.value || formError.value)
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
  <view class="retail-page-enter min-h-screen bg-[#f7f4ee] pb-32 text-[#292722]">
    <view class="mx-auto max-w-xl px-[18px] pb-5 pt-6">
      <text class="retail-heading block text-[26px] leading-9">
        收货地址
      </text>
      <text class="mt-3 block text-[15px] leading-7 text-[#625e55]">
        用于模拟订单，不会安排真实配送。
      </text>
    </view>
    <RetailRequestState :loading="loading" :error="loadError" @retry="loadForm" />
    <view class="mx-auto grid max-w-xl gap-5 px-[18px]">
      <view v-if="formError" class="border-l-2 border-[#a12116] py-2 pl-4 text-base leading-7 text-[#a12116]">
        {{ formError }}
      </view>
      <view v-if="ready" class="grid gap-6">
        <view class="grid gap-5 border-t border-[#dcd6cb] pt-5">
          <VInput :value="name" size="lg" label="收货人" placeholder="请输入姓名" @update:value="name = $event" />
          <VInput :value="phone" size="lg" label="手机号码" placeholder="请输入手机号" type="tel" @update:value="phone = $event" />
          <VInput :value="city" size="lg" label="省市" placeholder="请输入省市" @update:value="city = $event" />
          <VInput :value="district" size="lg" label="区县" placeholder="请输入区县" @update:value="district = $event" />
          <VInput :value="detail" size="lg" label="详细地址" placeholder="街道、楼牌号等" type="textarea" :rows="3" @update:value="detail = $event" />
        </view>

        <view class="flex items-center justify-between gap-4 border-y border-[#dcd6cb] py-5">
          <view class="grid min-w-0 gap-1">
            <text class="text-base font-semibold leading-7">
              设为默认地址
            </text>
            <text class="text-[15px] leading-7 text-[#625e55]">
              结算时优先使用该地址
            </text>
          </view>
          <VSwitch v-model="isDefault" aria-label="设为默认地址" />
        </view>
      </view>
    </view>

    <view class="fixed inset-x-0 bottom-0 z-20 border-t border-[#dcd6cb] bg-[#f7f4ee] px-[18px] pb-[calc(env(safe-area-inset-bottom)+16px)] pt-4">
      <view class="mx-auto max-w-xl">
        <VButton block size="lg" class-name="!min-h-12 !rounded-[3px] !text-base" :disabled="saveDisabled" :loading="saving" loading-text="正在保存…" @click="submit">
          保存地址
        </VButton>
      </view>
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
