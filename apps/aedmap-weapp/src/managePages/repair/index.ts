import { reactive, ref, toRefs, watchEffect } from 'wevu'

import { readRouteData } from '@/composables/useAedNavigation'
import { useAedNavigation, useGolbalData, useJxToast } from '../../hooks/index'
import * as api from '../../request/api/manage'
import { useCheckIn } from '../check/index'

/**
 * 报修模块
 */
export function useRepair() {
  const routeInfo = readRouteData<{ info?: WechatMiniprogram.IAnyObject }>()?.info ?? {}
  const { id: deviceId = '', serialNumber = '' } = routeInfo
  const { showErrToast, showSuccessToast } = useJxToast()
  const { handleChangeImg, imageUrls } = useCheckIn()
  const { globalTip } = useGolbalData()
  const { back } = useAedNavigation()
  const deviceRepairRecord = reactive({
    content: '',
    deviceId,
    imageUrls: [] as string[],
  })
  const deviceSn = ref(serialNumber)
  watchEffect(() => {
    deviceRepairRecord.imageUrls = imageUrls.value.map(image => image.url)
  })

  // 提交报修申请
  const onSubmit = async () => {
    try {
      await api.addReportToRepairRecord(deviceRepairRecord)
      showSuccessToast('提交成功')
      setTimeout(() => {
        back()
      }, 1000)
    }
    catch (error) {
      showErrToast(error)
    }
  }
  return {
    handleChangeImg,
    onSubmit,
    ...toRefs(deviceRepairRecord),
    imageUrls,
    globalTip,
    deviceSn,
  }
}
