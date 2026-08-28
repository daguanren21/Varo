import { onMounted, onShow, onUnmounted, ref } from 'wevu'

import { readRouteParams } from '@/composables/useAedNavigation'
import { useAedNavigation, useJxFilter } from '../../hooks/index'
import { useJxUtils } from '../../hooks/useJxMap'
import * as api from '../../request/api/deviceMap'
import broadcast from '../../utils/event'

/**
 * 急救课堂主页
 */
interface Ttab {
  key: string
  icon: string
  text: string
  active?: boolean
}
export function useCollegeMain() {
  const tabList = ref<Ttab[]>([
    {
      key: 'newList',
      icon: 'news',
      text: '新闻资讯',
    },
    {
      key: 'knowLedgeList',
      icon: 'knowLedge',
      text: '急救知识库',
    },
    {
      key: 'courseList',
      icon: 'callHelp',
      text: '我要学急救',
    },
    {
      key: 'videoList',
      icon: 'video',
      text: '安装教程',
    },
  ])
  const tabIndex = ref<number>(0)
  tabList.value[0].active = true
  const componentId = ref<string>(tabList.value[tabIndex.value].key)
  onShow(() => handleRefresh(tabIndex.value))
  const changeTab = (index: number) => {
    tabIndex.value = index
    componentId.value = tabList.value[index].key
  }
  const handleRefresh = (index: number) => {
    const arr = ['news', 'knowLedge']
    if (arr.includes(tabList.value[index].icon)) {
      broadcast.emit('refreshCollege', tabList.value[index].icon.toUpperCase())
    }
  }
  return {
    tabList,
    changeTab,
    componentId,
    tabIndex,
  }
}
/**
 * 新闻资讯和知识库列表
 */
export function useVideoList() {
  const params = ref<WechatMiniprogram.IAnyObject>({
    page: 1,
    size: 10,
  })
  const filterFn = useJxFilter()
  const { toRoute } = useAedNavigation()
  const totalPage = ref<number>(0)
  const videoList = ref<WechatMiniprogram.IAnyObject[]>([])
  async function refreshVideos() {
    params.value.page = 1
    const { content, total } = await getVideoList()
    videoList.value = content
    totalPage.value = total
  }
  onShow(refreshVideos)
  onMounted(() => broadcast.on('refreshCollege', refreshVideos))
  onUnmounted(() => broadcast.off('refreshCollege', refreshVideos))
  const getVideoList = async (loading = true): Promise<WechatMiniprogram.IAnyObject> => {
    try {
      const { content, totalPage: total } = await api.getVideoList(params.value, loading)
      return {
        content,
        total,
      }
    }
    catch (error) {
      loadingStatus.value = ''
      return {
        content: [],
        total: 1,
      }
    }
  }
  let loadingStatus = ref<string>('')
  const handleReachBottom = () => {
    if (params.value.page > totalPage.value) {
      loadingStatus.value = 'noMore'
      return
    }
    params.value.page++
    if (params.value.page <= totalPage.value) {
      loadingStatus.value = 'loading'
      getVideoList(false).then((res: WechatMiniprogram.IAnyObject) => {
        const { content } = res
        loadingStatus.value = ''
        if (!content.length) {
          loadingStatus.value = 'noMore'
        }
        else {
          videoList.value = [...videoList.value, ...content]
        }
      })
    }
  }

  const goToVideo = (id: string) => {
    toRoute('videoInfo', 'coursePages', { params: { id } })
  }
  return {
    handleReachBottom,
    videoList,
    loadingStatus,
    ...filterFn,
    goToVideo,
  }
}
export function useVideoLike() {
  const handleLike = async (item: WechatMiniprogram.IAnyObject) => {
    await api.updateLikes(item.id)
    setTimeout(() => {
      wx.showToast({
        icon: 'none',
        title: '点赞成功',
        duration: 4000,
      })
      item.active = true
      item.likeCount++
    }, 1000)
  }
  return {
    handleLike,
  }
}
/**
 * 新闻资讯和知识库列表
 */
export function useCollegeList(type = 'NEWS') {
  const newsParams = ref<WechatMiniprogram.IAnyObject>({
    newsKnowledgeType: type,
    page: 1,
    size: 10,
  })
  const filterFn = useJxFilter()
  const { toRoute } = useAedNavigation()
  const totalPage = ref<number>(0)
  const newsList = ref<WechatMiniprogram.IAnyObject[]>([])
  onMounted(() => {
    getNewsList().then((res: WechatMiniprogram.IAnyObject) => {
      const { content, total } = res
      newsList.value = content
      totalPage.value = total
    })
    broadcast.on('refreshCollege', (type) => {
      newsParams.value.newsKnowledgeType = type
      newsParams.value.page = 1
      getNewsList().then((res: WechatMiniprogram.IAnyObject) => {
        const { content, total } = res
        newsList.value = content
        totalPage.value = total
      })
    })
  })
  const getNewsList = async (loading = true): Promise<WechatMiniprogram.IAnyObject> => {
    try {
      const { content, totalPage: total } = await api.getNewsKnowledgeList(newsParams.value, loading)
      return {
        content,
        total,
      }
    }
    catch (error) {
      loadingStatus.value = ''
      return {
        content: [],
        total: 1,
      }
    }
  }
  let loadingStatus = ref<string>('')
  const handleReachBottom = () => {
    if (newsParams.value.page > totalPage.value) {
      loadingStatus.value = 'noMore'
      return
    }
    newsParams.value.page++
    if (newsParams.value.page <= totalPage.value) {
      loadingStatus.value = 'loading'
      getNewsList(false).then((res: WechatMiniprogram.IAnyObject) => {
        const { content } = res
        loadingStatus.value = ''
        if (!content.length) {
          loadingStatus.value = 'noMore'
        }
        else {
          newsList.value = [...newsList.value, ...content]
        }
      })
    }
  }
  const goToNews = (id: string) => {
    toRoute('newsInfo', 'coursePages', { params: { id } })
  }
  return {
    handleReachBottom,
    newsList,
    loadingStatus,
    ...filterFn,
    goToNews,
  }
}
/**
 * 视频详情
 * @returns
 */
export function useVideoInfo() {
  let { id, q } = readRouteParams<{ id?: string, q?: string }>()
  if (!id && q && decodeURIComponent(q).split('id=')[1]) {
    id = decodeURIComponent(q).split('id=')[1].split('&')[0]
    console.log(id)
  }
  const filterFn = useJxFilter()
  const info = ref<WechatMiniprogram.IAnyObject>({
    content: '',
    playVolume: 0,
    likeCount: 0,
    createdDate: '',
    name: '',
    url: '',
    type: '',
  })
  const getVideoInfo = async () => {
    if (id) {
      info.value = await api.getVideoInfo(id)
    }
  }
  const saveReadRecord = async () => {
    if (id) {
      await api.updatePlayVolumes(id)
    }
  }
  saveReadRecord().then(() => {
    getVideoInfo()
  })
  return {
    ...filterFn,
    info,
  }
}
/**
 * 新闻资讯和知识库详情
 * @returns
 */
export function useCollegeInfo() {
  const { id } = readRouteParams<{ id?: string }>()
  const filterFn = useJxFilter()
  const info = ref<WechatMiniprogram.IAnyObject>({
    content: '',
    readCount: 0,
    publishTime: '',
    newsKnowledgeType: 'NEWS',
    title: '',
    titleImagePath: '',
  })
  const getCollegeInfo = async () => {
    if (id) {
      info.value = await api.getNewsKnowledgeInfo(id)
      const { newsKnowledgeType: type } = info.value
      const title = type == 'NEWS' ? '新闻详情' : '知识库详情'
      wx.setNavigationBarTitle({
        title,
      })
    }
  }
  const saveReadRecord = async () => {
    if (id) {
      await api.saveNewsKnowledgeRead(id)
    }
  }
  saveReadRecord().then(() => {
    getCollegeInfo()
  })
  return {
    ...filterFn,
    info,
  }
}
/**
 * 课程列表
 */

export function useCourseList() {
  const searchParams = ref<WechatMiniprogram.IAnyObject>({
    courseType: '',
    page: 1,
    size: 2,
  })
  const busList = ref<WechatMiniprogram.IAnyObject[]>([])
  const hahList = ref<WechatMiniprogram.IAnyObject[]>([])
  const otherList = ref<WechatMiniprogram.IAnyObject[]>([])
  const busCount = ref<number>(0)
  const ahaCount = ref<number>(0)
  const otherCount = ref<number>(0)
  const { toRoute } = useAedNavigation()
  const filterFn = useJxFilter()
  const { makePhoneCall } = useJxUtils()
  const getBusList = async () => {
    searchParams.value.courseType = 'BUSINESS'
    const { content, totalCount } = await api.getCourseList(searchParams.value)
    busList.value = content
    busCount.value = totalCount
  }
  const getHahList = async () => {
    searchParams.value.courseType = 'AHA'
    const { content, totalCount } = await api.getCourseList(searchParams.value)
    hahList.value = content
    ahaCount.value = totalCount
  }
  const getOtherList = async () => {
    searchParams.value.courseType = 'OTHER'
    const { content, totalCount } = await api.getCourseList(searchParams.value)
    otherList.value = content
    otherCount.value = totalCount
  }
  getBusList()
  getHahList()
  getOtherList()
  const goToInfo = (id: string) => {
    toRoute('courseInfo', 'coursePages', { params: { id } })
  }
  const goToList = (type: string) => {
    toRoute('list', 'coursePages', { params: { type } })
  }
  return {
    busList,
    hahList,
    otherList,
    busCount,
    ahaCount,
    otherCount,
    goToInfo,
    goToList,
    ...filterFn,
    makePhoneCall,
  }
}
/**
 * 课程列表更多
 * @returns
 */
export function useMoreCourseList() {
  const { type } = readRouteParams<{ type?: string }>()
  const filterFn = useJxFilter()
  const { makePhoneCall } = useJxUtils()
  const { toRoute } = useAedNavigation()
  const searchParams = ref<WechatMiniprogram.IAnyObject>({
    courseType: type,
    page: 1,
    size: 10,
  })
  const { courseTypeFilter } = filterFn
  wx.setNavigationBarTitle({
    title: `${courseTypeFilter(type)}列表`,
  })
  const trainList = ref<WechatMiniprogram.IAnyObject[]>([])
  const total = ref<number>(0)
  const loadingStatus = ref<string>('')
  const getTrainList = async (loading = true) => {
    if (type) {
      return await api.getCourseList(searchParams.value, loading)
    }
    return {
      content: [],
      totalPage: 1,
    }
  }
  getTrainList().then((res: WechatMiniprogram.IAnyObject) => {
    const { totalPage, content } = res
    trainList.value = content
    total.value = totalPage
  })
  const handleReachBottom = () => {
    if (searchParams.value.page > total.value) {
      loadingStatus.value = 'noMore'
      return
    }
    searchParams.value.page++
    if (searchParams.value.page <= total.value) {
      loadingStatus.value = 'loading'
      getTrainList(false).then((res: WechatMiniprogram.IAnyObject) => {
        const { content } = res
        loadingStatus.value = ''
        if (!content.length) {
          loadingStatus.value = 'noMore'
        }
        else {
          trainList.value = [...trainList.value, ...content]
        }
      })
    }
  }
  const goToInfo = (id: string) => {
    toRoute('courseInfo', 'coursePages', { params: { id } })
  }
  return {
    trainList,
    handleReachBottom,
    loadingStatus,
    ...filterFn,
    makePhoneCall,
    goToInfo,
  }
}
/**
 * 课程详情
 */
export function useCourseInfo() {
  const { id } = readRouteParams<{ id?: string }>()
  const filterFn = useJxFilter()
  const { makePhoneCall } = useJxUtils()
  const info = ref<WechatMiniprogram.IAnyObject>({
    classAddress: '',
    classHour: 0,
    classTime: '',
    content: '',
    endTime: '',
    imagePath: '',
    name: '',
    introduction: '',
    personNumber: '',
    phoneNumber: '',
    price: '',
    startTime: '',
    url: '',
    userName: '',
  })
  const getCourseInfo = async () => {
    if (id) {
      info.value = await api.getCourseInfo(id)
    }
  }
  getCourseInfo()
  return {
    info,
    makePhoneCall,
    ...filterFn,
  }
}
