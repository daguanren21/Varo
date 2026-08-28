import WifiNo1Active from '../static/images/wifi-no-1-active.svg'
import WifiNo1 from '../static/images/wifi-no-1.svg'
import WifiNo2Active from '../static/images/wifi-no-2-active.svg'
import WifiNo2 from '../static/images/wifi-no-2.svg'
import WifiNo3Active from '../static/images/wifi-no-3-active.svg'
import WifiNo3 from '../static/images/wifi-no-3.svg'
import WifiSecret1Active from '../static/images/wifi-secret-1-active.svg'
import WifiSecret1 from '../static/images/wifi-secret-1.svg'
import WifiSecret2Active from '../static/images/wifi-secret-2-active.svg'
import WifiSecret2 from '../static/images/wifi-secret-2.svg'
import WifiSecret3Active from '../static/images/wifi-secret-3-active.svg'
import WifiSecret3 from '../static/images/wifi-secret-3.svg'

export interface WifiNetwork extends WechatMiniprogram.IAnyObject {
  BSSID: string
  bssid: string
  SSID: string
  frequency: number
  icon?: string
  secure: boolean
  signalStrength: number
}

type WifiIconName = 'wifi-no-1' | 'wifi-no-2' | 'wifi-no-3' | 'wifi-secret-1' | 'wifi-secret-2' | 'wifi-secret-3'

const ACTIVE_ICON_BY_NAME: Record<WifiIconName, string> = {
  'wifi-no-1': WifiNo1Active,
  'wifi-no-2': WifiNo2Active,
  'wifi-no-3': WifiNo3Active,
  'wifi-secret-1': WifiSecret1Active,
  'wifi-secret-2': WifiSecret2Active,
  'wifi-secret-3': WifiSecret3Active,
}

const ICON_BY_NAME: Record<WifiIconName, string> = {
  'wifi-no-1': WifiNo1,
  'wifi-no-2': WifiNo2,
  'wifi-no-3': WifiNo3,
  'wifi-secret-1': WifiSecret1,
  'wifi-secret-2': WifiSecret2,
  'wifi-secret-3': WifiSecret3,
}

export function resolveWifiIcon(options: {
  active: boolean
  secure: boolean
  signalStrength: number
}) {
  const level: 1 | 2 | 3 = options.signalStrength >= 66 ? 3 : options.signalStrength >= 33 ? 2 : 1
  const security: 'no' | 'secret' = options.secure ? 'secret' : 'no'
  const name: WifiIconName = `wifi-${security}-${level}`
  return (options.active ? ACTIVE_ICON_BY_NAME : ICON_BY_NAME)[name]
}
