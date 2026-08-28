<script setup lang="ts">
import { createStore, onHide, onLaunch, onShow } from 'wevu'
import { useLoginInit } from './hooks'
import { useAedStore } from './store'

createStore()
const aedStore = useAedStore()

const initialSearch = {
  brandId: 0,
  brandNameEn: '',
  institutionId: 0,
  institutionName: '',
  countryRegionId: 0,
  countryStateId: 0,
  cityId: 0,
  regionId: 0,
  fullRegionName: '',
  placeId: 0,
  placeName: '',
  batterySelfTestResult: '',
  electrodeSelfTestResult: '',
  deviceRunningState: '',
  devicePositionState: '',
  deviceNetworkState: '',
  hasChecked: '',
  keyword: '',
  page: 1,
  size: 10,
}

function resetSearch() {
  aedStore.setManageSearch({ ...initialSearch })
}

defineAppJson({
  pages: [
    'pages/index/index',
    'pages/devices/index',
    'pages/college/index',
    'pages/myCenter/index',
  ],
  subPackages: [
    {
      root: 'homePages',
      pages: [
        'login/index',
        'register/index',
        'deviceDetail/index',
        'openAEDLock/index',
        'posCorrection/index',
        'shop/index',
      ],
    },
    {
      root: 'improvePages',
      pages: [
        'controllerGuide/index',
        'deviceGuide/index',
        'improveDeviceInfo/index',
        'institutionSearch/index',
        'institutionSelect/index',
      ],
    },
    {
      root: 'managePages',
      pages: [
        'detail/index',
        'check/index',
        'checkShanghai/index',
        'repair/index',
        'module/index',
        'highSearch/index',
      ],
    },
    {
      root: 'coursePages',
      pages: ['courseInfo/index', 'newsInfo/index', 'videoInfo/index', 'list/index'],
    },
    {
      root: 'centerPages',
      pages: [
        'editUserInfo/index',
        'honorInfo/index',
        'editHonorInfo/index',
        'integralInfo/index',
        'inspectionRecord/index',
        'inspectionTask/index',
        'taskDeviceList/index',
        'inspectionInfo/index',
        'repairRecord/index',
        'repairInfo/index',
        'editAddress/index',
        'addCertificate/index',
        'questionNaire/index',
        'customer/index',
        'customerInfo/index',
        'notification/index',
        'notificationInfo/index',
        'feedBack/index',
        'serviceAgreement/index',
        'privacyPolicy/index',
        'firstAidMap/index',
        'wifiConfig/index',
        'provision/index',
        'smartConfig/index',
        'softAp/index',
        'noticeConfig/index',
      ],
    },
  ],
  tabBar: {
    backgroundColor: '#ffffff',
    color: '#7a7a7a',
    selectedColor: '#FE6215',
    list: [
      {
        pagePath: 'pages/index/index',
        text: 'AED地图',
        iconPath: 'static/images/icon-volunteer-map1.png',
        selectedIconPath: 'static/images/icon-volunteer-map-active1.png',
      },
      {
        pagePath: 'pages/devices/index',
        text: 'AED管理',
        iconPath: 'static/images/icon-device-management1.png',
        selectedIconPath: 'static/images/icon-device-management-active1.png',
      },
      {
        pagePath: 'pages/college/index',
        text: '急救学院',
        iconPath: 'static/images/icon-edu-center1.png',
        selectedIconPath: 'static/images/icon-edu-center-active1.png',
      },
      {
        pagePath: 'pages/myCenter/index',
        text: '个人中心',
        iconPath: 'static/images/icon-user-center1.png',
        selectedIconPath: 'static/images/icon-user-center-active1.png',
      },
    ],
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black',
  },
  networkTimeout: {
    request: 1000000,
    connectSocket: 10000,
    uploadFile: 50000,
    downloadFile: 10000,
  },
  lazyCodeLoading: 'requiredComponents',
  preloadRule: {
    'pages/index/index': {
      network: 'all',
      packages: ['homePages'],
    },
    'pages/devices/index': {
      network: 'all',
      packages: ['managePages'],
    },
    'pages/college/index': {
      network: 'all',
      packages: ['coursePages'],
    },
    'pages/myCenter/index': {
      network: 'all',
      packages: ['centerPages'],
    },
  },
  permission: {
    'scope.userLocation': {
      desc: '您的位置将用于查找周边布放的AED设备',
    },
  },
  requiredPrivateInfos: ['getLocation', 'chooseLocation', 'onLocationChange', 'startLocationUpdate'],
})

onLaunch(async (options) => {
  wx.showLoading({ title: '初始化', mask: true })
  try {
    const { checkProgramNeedUpdate, wxLogin } = useLoginInit()
    checkProgramNeedUpdate()
    await wxLogin()
    if (options?.path === 'pages/index/index') {
      await wx.switchTab({ url: '/pages/index/index' })
    }
  }
  finally {
    wx.hideLoading()
  }
})

onShow(resetSearch)
onHide(resetSearch)
</script>

<style lang="scss" src="./app.scss"></style>
