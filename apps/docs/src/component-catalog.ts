import registryCatalog from './registry-catalog.json'

export type DocsLocale = 'en' | 'zh'
export type ComponentTarget = 'h5' | 'weapp'

export interface LocalizedText {
  en: string
  zh: string
}

export interface ComponentCatalogItem {
  id: string
  name: string
  label: LocalizedText
  targets: readonly ComponentTarget[]
  platforms: readonly string[]
}

export interface ComponentCatalogGroup {
  id: string
  title: LocalizedText
  summary: LocalizedText
  items: readonly ComponentCatalogItem[]
}

const catalogPresentation = [
  {
    id: 'basic',
    title: { zh: '基础组件', en: 'Basic' },
    summary: { zh: '建立页面内容与基础操作。', en: 'Build page content and primary actions.' },
    items: [
      { id: 'button', name: 'Button', label: { zh: '按钮', en: 'Button' } },
      { id: 'badge', name: 'Badge', label: { zh: '徽标', en: 'Badge' } },
      { id: 'cell', name: 'Cell', label: { zh: '单元格', en: 'Cell' } },
      { id: 'image', name: 'Image', label: { zh: '图片', en: 'Image' } },
      { id: 'input', name: 'Input', label: { zh: '输入框', en: 'Input' } },
      { id: 'input-otp', name: 'InputOtp', label: { zh: '一次性密码', en: 'Input OTP' } },
    ],
  },
  {
    id: 'form',
    title: { zh: '表单组件', en: 'Form Components' },
    summary: { zh: '覆盖录入、选择、校验与复杂移动端输入。', en: 'Handle entry, selection, validation, and mobile input.' },
    items: [
      { id: 'calendar', name: 'Calendar', label: { zh: '日历', en: 'Calendar' } },
      { id: 'calendar-card', name: 'CalendarCard', label: { zh: '日历卡片', en: 'Calendar Card' } },
      { id: 'cascader', name: 'Cascader', label: { zh: '级联选择器', en: 'Cascader' } },
      { id: 'checkbox', name: 'Checkbox', label: { zh: '复选按钮', en: 'Checkbox' } },
      { id: 'date-field', name: 'DateField', label: { zh: '日期字段', en: 'Date Field' } },
      { id: 'date-picker', name: 'DatePicker', label: { zh: '日期选择器', en: 'Date Picker' } },
      { id: 'form', name: 'Form', label: { zh: '表单', en: 'Form' } },
      { id: 'input-number', name: 'InputNumber', label: { zh: '数字输入框', en: 'Input Number' } },
      { id: 'number-keyboard', name: 'NumberKeyboard', label: { zh: '数字键盘', en: 'Number Keyboard' } },
      { id: 'picker', name: 'Picker', label: { zh: '选择器', en: 'Picker' } },
      { id: 'radio', name: 'Radio', label: { zh: '单选按钮', en: 'Radio' } },
      { id: 'select', name: 'Select', label: { zh: '选择器', en: 'Select' } },
      { id: 'switch', name: 'Switch', label: { zh: '开关', en: 'Switch' } },
      { id: 'range', name: 'Range', label: { zh: '区间选择器', en: 'Range' } },
      { id: 'rate', name: 'Rate', label: { zh: '评分', en: 'Rate' } },
      { id: 'searchbar', name: 'Searchbar', label: { zh: '搜索栏', en: 'Searchbar' } },
      { id: 'short-password', name: 'ShortPassword', label: { zh: '短密码', en: 'Short Password' } },
      { id: 'textarea', name: 'Textarea', label: { zh: '文本域', en: 'Textarea' } },
      { id: 'uploader', name: 'Uploader', label: { zh: '上传', en: 'Uploader' } },
    ],
  },
  {
    id: 'layout',
    title: { zh: '布局组件', en: 'Layout' },
    summary: { zh: '组织页面节奏、间距与吸附关系。', en: 'Structure rhythm, spacing, and sticky regions.' },
    items: [
      { id: 'divider', name: 'Divider', label: { zh: '分割线', en: 'Divider' } },
      { id: 'grid', name: 'Grid', label: { zh: '宫格', en: 'Grid' } },
      { id: 'layout', name: 'Layout', label: { zh: '布局', en: 'Layout' } },
      { id: 'list', name: 'List', label: { zh: '列表加载', en: 'List Loading' } },
      { id: 'space', name: 'Space', label: { zh: '间距', en: 'Space' } },
      { id: 'sticky', name: 'Sticky', label: { zh: '粘性布局', en: 'Sticky' } },
    ],
  },
  {
    id: 'navigation',
    title: { zh: '导航组件', en: 'Navigation' },
    summary: { zh: '处理页面层级、局部切换与移动端路径。', en: 'Support page hierarchy, local switching, and mobile journeys.' },
    items: [
      { id: 'breadcrumb', name: 'Breadcrumb', label: { zh: '面包屑', en: 'Breadcrumb' } },
      { id: 'elevator', name: 'Elevator', label: { zh: '电梯楼层', en: 'Elevator' } },
      { id: 'fixed-nav', name: 'FixedNav', label: { zh: '悬浮导航', en: 'Fixed Navigation' } },
      { id: 'indicator', name: 'Indicator', label: { zh: '指示器', en: 'Indicator' } },
      { id: 'menu', name: 'Menu', label: { zh: '菜单', en: 'Menu' } },
      { id: 'navbar', name: 'Navbar', label: { zh: '头部导航', en: 'Navbar' } },
      { id: 'pagination', name: 'Pagination', label: { zh: '分页', en: 'Pagination' } },
      { id: 'side-navbar', name: 'SideNavbar', label: { zh: '侧边栏导航', en: 'Side Navbar' } },
      { id: 'tabbar', name: 'Tabbar', label: { zh: '标签栏', en: 'Tabbar' } },
      { id: 'tabs', name: 'Tabs', label: { zh: '选项卡切换', en: 'Tabs' } },
    ],
  },
  {
    id: 'feedback',
    title: { zh: '反馈组件', en: 'Feedback' },
    summary: { zh: '表达进度、遮罩、浮层与轻量结果。', en: 'Communicate progress, overlays, surfaces, and transient results.' },
    items: [
      { id: 'loading', name: 'Loading', label: { zh: '加载', en: 'Loading' } },
      { id: 'skeleton', name: 'Skeleton', label: { zh: '骨架屏', en: 'Skeleton' } },
      { id: 'overlay', name: 'Overlay', label: { zh: '遮罩层', en: 'Overlay' } },
      { id: 'watermark', name: 'Watermark', label: { zh: '水印', en: 'Watermark' } },
      { id: 'popup', name: 'Popup', label: { zh: '弹出层', en: 'Popup' } },
      { id: 'pull-refresh', name: 'PullRefresh', label: { zh: '下拉刷新', en: 'Pull Refresh' } },
      { id: 'toast', name: 'Toast', label: { zh: '轻提示', en: 'Toast' } },
    ],
  },
  {
    id: 'advanced',
    title: { zh: '高级组件', en: 'Advanced' },
    summary: { zh: '组合浮层、原生能力与高风险确认流程。', en: 'Compose floating layers, native capabilities, and high-risk flows.' },
    items: [
      { id: 'popover', name: 'Popover', label: { zh: '气泡浮层', en: 'Popover' } },
      { id: 'dialog', name: 'Dialog', label: { zh: '对话框', en: 'Dialog' } },
      { id: 'drawer', name: 'Drawer', label: { zh: '抽屉', en: 'Drawer' } },
      { id: 'region-picker', name: 'RegionPicker', label: { zh: '地区选择', en: 'Region Picker' } },
      { id: 'signature', name: 'Signature', label: { zh: '签名', en: 'Signature' } },
      { id: 'map', name: 'Map', label: { zh: '小程序地图', en: 'Map' } },
      { id: 'robot-chat', name: 'RobotChat', label: { zh: '机器人对话', en: 'Robot Chat' } },
    ],
  },
]

export const componentCatalog: readonly ComponentCatalogGroup[] = catalogPresentation.map(group => ({
  ...group,
  items: group.items.map((item) => {
    const registryId = item.id === 'calendar-card' ? 'calendar' : item.id
    const coverage = registryCatalog.components[registryId as keyof typeof registryCatalog.components]
    if (!coverage) { throw new Error(`Documentation component has no Registry owner: ${registryId}`) }
    return { ...item, targets: coverage.targets as ComponentTarget[], platforms: coverage.platforms }
  }),
}))

export const componentCatalogItems: readonly ComponentCatalogItem[] = componentCatalog.flatMap(group => group.items)
export const componentCount = componentCatalogItems.length

export function componentDocsRoute(id: string, locale: DocsLocale): string {
  return `${locale === 'en' ? '/en' : ''}/components/${id}`
}

export function createComponentSidebarGroups(locale: DocsLocale) {
  return componentCatalog.map(group => ({
    text: group.title[locale],
    collapsed: true,
    items: group.items.map(item => ({
      text: locale === 'zh' ? `${item.name} ${item.label.zh}` : item.name,
      link: componentDocsRoute(item.id, locale),
    })),
  }))
}
