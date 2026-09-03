import type { ComputedRef } from 'wevu'
import { computed, ref, watchEffect } from 'wevu'
import { useAedStore } from '@/store'

interface BrandTarget {
  brandId?: number | string
  brandNameEn?: string
}

/** 获取品牌列表并同步当前设备品牌。 */
export function useBrand(device: ComputedRef<BrandTarget>, brandName = 'Jousing') {
  const aedStore = useAedStore()
  const { state } = aedStore
  const brandList = computed(() => state.brandList)
  if (!brandList.value.length) {
    aedStore.loadBrands()
  }
  const brandDefault = brandList.value.findIndex((value: WechatMiniprogram.IAnyObject) => value.id == 0)
  if (brandDefault == -1) {
    brandList.value.unshift({ id: 0, nameEn: 'SELECT', nameCh: '请选择' })
  }
  const index = brandList.value.findIndex((value: WechatMiniprogram.IAnyObject) => value.nameEn == brandName)
  const brandIndex = ref<number>(index == -1 ? 0 : index)
  watchEffect(() => {
    if (!brandList.value.length) {
      return
    }
    const currentIndex = brandList.value.findIndex(
      (value: WechatMiniprogram.IAnyObject) => value.id === device.value.brandId,
    )
    if (currentIndex !== -1) {
      brandIndex.value = currentIndex
    }
    device.value.brandId = brandList.value[brandIndex.value].id
    device.value.brandNameEn = brandList.value[brandIndex.value].nameEn
  })
  const isJs = computed(() => brandList.value[brandIndex.value] && brandList.value[brandIndex.value].nameEn == 'Jousing')
  const changeBrand = (event: WechatMiniprogram.IAnyObject) => {
    brandIndex.value = event.detail.value
    device.value.brandId = brandList.value[brandIndex.value].id
    device.value.brandNameEn = brandList.value[brandIndex.value].nameEn
  }
  return {
    changeBrand,
    brandList,
    brandIndex,
    isJs,
  }
}
