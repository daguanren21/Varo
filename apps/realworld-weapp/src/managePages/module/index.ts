import { ref } from 'wevu'

import { readRouteParams } from '@/composables/useAedNavigation'
import { useJxFilter } from '../../hooks/index'
import * as api from '../../request/api/manage'

/**
 * 网络模块
 */
interface ModuleInfo {
  batterySelfTestResult: string
  batteryVoltage: string
  bluetoothModuleSelfTestResult: string
  cabinetDoorState: string
  deviceSerialNumber: string
  openBagSelfTestResult: string
  powerSupplyMode: string
  selfTestResult: string
  serialNumber: string
  terminalRunningState: string
}

export function useModuleInfo() {
  const filterFn = useJxFilter()
  const { module = '', moduleId = '' } = readRouteParams<{ module?: string, moduleId?: string }>()
  const info = ref<ModuleInfo>({
    serialNumber: '',
    terminalRunningState: '',
    selfTestResult: '',
    openBagSelfTestResult: '',
    batterySelfTestResult: '',
    batteryVoltage: '',
    bluetoothModuleSelfTestResult: '',
    deviceSerialNumber: '',
    powerSupplyMode: '',
    cabinetDoorState: '',
  })
  const communicationModuleType = ref<string>(module)
  const getModuleInfo = async () => {
    const id = Number(moduleId)
    if (!Number.isFinite(id)) { return }
    info.value = module === 'CONTROLLER'
      ? await api.getCabinetControllerDetail<ModuleInfo>(id)
      : await api.getConnectorDetail<ModuleInfo>(id)
  }
  getModuleInfo()
  return {
    info,
    communicationModuleType,
    ...filterFn,
  }
}
