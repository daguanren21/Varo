<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

type Locale = 'zh' | 'en'
type Runtime = 'h5' | 'weapp'
type Category = 'commerce' | 'fresh' | 'operations' | 'account'

interface BlockCopy {
  title: string
  kicker: string
  description: string
  tags: string[]
  metrics: [string, string]
  action: string
  preview: {
    heading: string
    subheading: string
    rows: [string, string][]
  }
}

interface Block {
  id: string
  category: Category
  accent: string
  zh: BlockCopy
  en: BlockCopy
  snippets: Record<Runtime, string>
}

const props = withDefaults(
  defineProps<{
    locale?: Locale
  }>(),
  {
    locale: 'zh'
  }
)

const categoryCopy: Record<Category | 'all', Record<Locale, string>> = {
  all: { zh: '全部', en: 'All' },
  commerce: { zh: '电商交易', en: 'Commerce' },
  fresh: { zh: '生鲜到家', en: 'Fresh Grocery' },
  operations: { zh: 'SaaS / 运营', en: 'SaaS / Ops' },
  account: { zh: '账户与服务', en: 'Account' }
}

function kebabCase(value: string) {
  return value.replace(/[A-Z]/g, (char, index) => `${index === 0 ? '' : '-'}${char.toLowerCase()}`)
}

function createSnippet(packageName: string, componentName: string, title: string, action: string, tags: string[]) {
  return `import { VButton, VCard, VCell, VGrid, VNavbar } from '${packageName}'

export function ${componentName}() {
  return (
    <section class="${kebabCase(componentName)}">
      <VNavbar title="${title}" />
      <VCard>
        <VCell title="${tags[0] ?? 'Status'}" desc="${tags[1] ?? 'Ready'}" />
        <VGrid :columns="4" :items={${JSON.stringify(tags)}} />
      </VCard>
      <VButton tone="primary" block>${action}</VButton>
    </section>
  )
}`
}

function createWeappSnippet(componentName: string, title: string, action: string, tags: string[]) {
  return `import { VButton, VCard, VCell, VGrid, VNavbar } from '@varo/ui-weapp'

export default {
  setup() {
    return () => (
      <view class="${kebabCase(componentName)}">
        <VNavbar title="${title}" />
        <VCard>
          <VCell title="${tags[0] ?? 'Status'}" desc="${tags[1] ?? 'Ready'}" />
          <VGrid :columns="4" :items={${JSON.stringify(tags)}} />
        </VCard>
        <VButton tone="primary" block>${action}</VButton>
      </view>
    )
  }
}`
}

function snippets(componentName: string, title: string, action: string, tags: string[]): Record<Runtime, string> {
  return {
    h5: createSnippet('@varo/ui-h5', componentName, title, action, tags),
    weapp: createWeappSnippet(componentName, title, action, tags)
  }
}

const blocks: Block[] = [
  {
    id: 'order',
    category: 'commerce',
    accent: '#13c2c2',
    zh: {
      title: '订单履约详情',
      kicker: 'Order Flow',
      description: '把导航、状态、物流、商品和底部操作收在一个可复用页面块里。',
      tags: ['Navbar', 'Card', 'Badge', 'Stepper'],
      metrics: ['3 个状态区', '1 个吸底操作'],
      action: '确认发货',
      preview: {
        heading: '订单 #VX-2048',
        subheading: '商家已接单，等待仓库出库',
        rows: [
          ['已支付', '¥268.00'],
          ['仓库', '杭州 2 号仓'],
          ['配送', '顺丰同城']
        ]
      }
    },
    en: {
      title: 'Order Fulfillment Detail',
      kicker: 'Order Flow',
      description: 'A reusable screen block combining navigation, status, logistics, items, and sticky actions.',
      tags: ['Navbar', 'Card', 'Badge', 'Stepper'],
      metrics: ['3 status zones', '1 sticky action'],
      action: 'Ship order',
      preview: {
        heading: 'Order #VX-2048',
        subheading: 'Merchant accepted, warehouse pending',
        rows: [
          ['Paid', '$268.00'],
          ['Warehouse', 'Hangzhou 2'],
          ['Delivery', 'Express']
        ]
      }
    },
    snippets: {
      h5: `import { VBadge, VButton, VCard, VNavbar, VStepper } from '@varo/ui-h5'

export function OrderFulfillmentBlock() {
  return (
    <section class="vx-order-block">
      <VNavbar title="订单履约详情" fixed />
      <VCard>
        <VBadge type="primary">待出库</VBadge>
        <VStepper active={2} items={['已支付', '备货中', '待配送']} />
      </VCard>
      <VButton type="primary" block>确认发货</VButton>
    </section>
  )
}`,
      weapp: `import { VBadge, VButton, VCard, VNavbar, VStepper } from '@varo/ui-weapp'

export default {
  setup() {
    return () => (
      <view class="vx-order-block">
        <VNavbar title="订单履约详情" fixed />
        <VCard>
          <VBadge type="primary">待出库</VBadge>
          <VStepper active={2} items={['已支付', '备货中', '待配送']} />
        </VCard>
        <VButton type="primary" block>确认发货</VButton>
      </view>
    )
  }
}`
    }
  },
  {
    id: 'address',
    category: 'account',
    accent: '#16a34a',
    zh: {
      title: '收货地址表单',
      kicker: 'Smart Form',
      description: '面向小程序表单的地址、校验、默认标签和提交反馈组合。',
      tags: ['Form', 'Input', 'Switch', 'Toast'],
      metrics: ['4 个字段', '2 个校验态'],
      action: '保存地址',
      preview: {
        heading: '默认收货地址',
        subheading: '浙江省 杭州市 西湖区',
        rows: [
          ['收货人', '林青'],
          ['手机号', '138 **** 2048'],
          ['门牌号', '未来科技城 8 幢']
        ]
      }
    },
    en: {
      title: 'Shipping Address Form',
      kicker: 'Smart Form',
      description: 'Address, validation, default labels, and submit feedback composed for mini-program forms.',
      tags: ['Form', 'Input', 'Switch', 'Toast'],
      metrics: ['4 fields', '2 validation states'],
      action: 'Save address',
      preview: {
        heading: 'Default address',
        subheading: 'Xihu District, Hangzhou',
        rows: [
          ['Receiver', 'Lin Qing'],
          ['Phone', '138 **** 2048'],
          ['Door', 'Future City 8']
        ]
      }
    },
    snippets: {
      h5: `import { VButton, VForm, VFormItem, VInput, VNavbar } from '@varo/ui-h5'

export function AddressFormBlock() {
  return (
    <section class="vx-address-block">
      <VNavbar title="收货地址表单" />
      <VForm labelPosition="top">
        <VFormItem label="收货人"><VInput placeholder="请输入姓名" /></VFormItem>
        <VFormItem label="手机号"><VInput type="tel" /></VFormItem>
      </VForm>
      <VButton type="success" block>保存地址</VButton>
    </section>
  )
}`,
      weapp: `import { VButton, VForm, VFormItem, VInput, VNavbar } from '@varo/ui-weapp'

export default {
  setup() {
    return () => (
      <view class="vx-address-block">
        <VNavbar title="收货地址表单" />
        <VForm labelPosition="top">
          <VFormItem label="收货人"><VInput placeholder="请输入姓名" /></VFormItem>
          <VFormItem label="手机号"><VInput type="tel" /></VFormItem>
        </VForm>
        <VButton type="success" block>保存地址</VButton>
      </view>
    )
  }
}`
    }
  },
  {
    id: 'filter',
    category: 'commerce',
    accent: '#f59e0b',
    zh: {
      title: '商品筛选抽屉',
      kicker: 'Filter Drawer',
      description: '把分类、多选、价格区间和重置确认放进一个高频交易筛选块。',
      tags: ['Popup', 'Checkbox', 'Range', 'Button'],
      metrics: ['5 个筛选组', '即时预估'],
      action: '应用筛选',
      preview: {
        heading: '智能筛选',
        subheading: '已选 6 个条件，预计 128 件商品',
        rows: [
          ['类目', '数码配件'],
          ['价格', '¥99 - ¥499'],
          ['服务', '次日达 / 包邮']
        ]
      }
    },
    en: {
      title: 'Product Filter Drawer',
      kicker: 'Filter Drawer',
      description: 'Category, multi-select, price range, and reset confirmation for commerce filtering.',
      tags: ['Popup', 'Checkbox', 'Range', 'Button'],
      metrics: ['5 filter groups', 'Live estimate'],
      action: 'Apply filters',
      preview: {
        heading: 'Smart filters',
        subheading: '6 conditions, about 128 products',
        rows: [
          ['Category', 'Accessories'],
          ['Price', '$99 - $499'],
          ['Service', 'Next-day / free']
        ]
      }
    },
    snippets: {
      h5: `import { VButton, VCheckboxGroup, VNavbar, VPopup, VRange } from '@varo/ui-h5'

export function ProductFilterBlock() {
  return (
    <VPopup position="right" class="vx-filter-block">
      <VNavbar title="商品筛选抽屉" />
      <VCheckboxGroup options={['次日达', '包邮', '新品']} />
      <VRange min={0} max={999} />
      <VButton type="warning" block>应用筛选</VButton>
    </VPopup>
  )
}`,
      weapp: `import { VButton, VCheckboxGroup, VNavbar, VPopup, VRange } from '@varo/ui-weapp'

export default {
  setup() {
    return () => (
      <VPopup position="right" class="vx-filter-block">
        <VNavbar title="商品筛选抽屉" />
        <VCheckboxGroup options={['次日达', '包邮', '新品']} />
        <VRange min={0} max={999} />
        <VButton type="warning" block>应用筛选</VButton>
      </VPopup>
    )
  }
}`
    }
  },
  {
    id: 'payment',
    category: 'commerce',
    accent: '#ef4444',
    zh: {
      title: '支付确认面板',
      kicker: 'Payment Sheet',
      description: '支付金额、优惠、风控提示和短密码输入组成的确认面板。',
      tags: ['Dialog', 'Password', 'Notice', 'Button'],
      metrics: ['2 个风险态', '6 位密码'],
      action: '确认支付',
      preview: {
        heading: '确认支付',
        subheading: '检测到新设备登录，请二次确认',
        rows: [
          ['订单金额', '¥268.00'],
          ['优惠抵扣', '-¥18.00'],
          ['需支付', '¥250.00']
        ]
      }
    },
    en: {
      title: 'Payment Confirmation Sheet',
      kicker: 'Payment Sheet',
      description: 'Amount, discount, risk notice, and short password entry in one confirmation sheet.',
      tags: ['Dialog', 'Password', 'Notice', 'Button'],
      metrics: ['2 risk states', '6 digits'],
      action: 'Confirm payment',
      preview: {
        heading: 'Confirm payment',
        subheading: 'New device detected, confirm again',
        rows: [
          ['Amount', '$268.00'],
          ['Discount', '-$18.00'],
          ['Pay', '$250.00']
        ]
      }
    },
    snippets: {
      h5: `import { VButton, VDialog, VNavbar, VShortPassword } from '@varo/ui-h5'

export function PaymentSheetBlock() {
  return (
    <VDialog title="支付确认面板" class="vx-payment-block">
      <VNavbar title="确认支付" />
      <strong>¥250.00</strong>
      <VShortPassword length={6} />
      <VButton type="danger" block>确认支付</VButton>
    </VDialog>
  )
}`,
      weapp: `import { VButton, VDialog, VNavbar, VShortPassword } from '@varo/ui-weapp'

export default {
  setup() {
    return () => (
      <VDialog title="支付确认面板" class="vx-payment-block">
        <VNavbar title="确认支付" />
        <strong>¥250.00</strong>
        <VShortPassword length={6} />
        <VButton type="danger" block>确认支付</VButton>
      </VDialog>
    )
  }
}`
    }
  }
  ,
  {
    id: 'fresh-home',
    category: 'fresh',
    accent: '#10b981',
    zh: {
      title: '生鲜到家首页',
      kicker: 'Fresh Grocery',
      description: '定位、今日达、秒杀、生鲜分类和购物车入口组成高频首页。',
      tags: ['Searchbar', 'Grid', 'Badge', 'Cart'],
      metrics: ['6 个货架区', '实时配送'],
      action: '加入购物车',
      preview: {
        heading: '叮咚式生鲜到家',
        subheading: '滨江区 · 29 分钟送达',
        rows: [
          ['今日爆款', '阳光玫瑰 / 牛奶'],
          ['履约', '前置仓 2.1km'],
          ['购物车', '3 件 · ¥86.90']
        ]
      }
    },
    en: {
      title: 'Fresh Grocery Home',
      kicker: 'Fresh Grocery',
      description: 'Location, same-day delivery, flash deals, categories, and cart entry for grocery apps.',
      tags: ['Searchbar', 'Grid', 'Badge', 'Cart'],
      metrics: ['6 shelf zones', 'Live delivery'],
      action: 'Add to cart',
      preview: {
        heading: 'Fresh delivery',
        subheading: 'Binjiang · arrives in 29 min',
        rows: [
          ['Deals', 'Grapes / milk'],
          ['Fulfillment', 'Warehouse 2.1km'],
          ['Cart', '3 items · $86.90']
        ]
      }
    },
    snippets: snippets('FreshGroceryHomeBlock', '生鲜到家首页', '加入购物车', ['Searchbar', 'Grid', 'Badge', 'Cart'])
  },
  {
    id: 'member',
    category: 'account',
    accent: '#6366f1',
    zh: {
      title: '会员权益中心',
      kicker: 'Membership',
      description: '会员等级、积分、优惠券、任务和续费入口组成可运营权益页。',
      tags: ['Tabs', 'Cell', 'Progress', 'Coupon'],
      metrics: ['4 个权益区', '可运营任务'],
      action: '领取权益',
      preview: {
        heading: 'Plus 会员',
        subheading: '本月已节省 ¥64.80',
        rows: [
          ['积分', '2,840'],
          ['优惠券', '6 张待用'],
          ['成长值', '78%']
        ]
      }
    },
    en: {
      title: 'Membership Center',
      kicker: 'Membership',
      description: 'Membership level, points, coupons, missions, and renewal entry for growth teams.',
      tags: ['Tabs', 'Cell', 'Progress', 'Coupon'],
      metrics: ['4 benefit zones', 'Growth missions'],
      action: 'Claim benefits',
      preview: {
        heading: 'Plus member',
        subheading: 'Saved $64.80 this month',
        rows: [
          ['Points', '2,840'],
          ['Coupons', '6 available'],
          ['Progress', '78%']
        ]
      }
    },
    snippets: snippets('MembershipCenterBlock', '会员权益中心', '领取权益', ['Tabs', 'Cell', 'Progress', 'Coupon'])
  },
  {
    id: 'approval',
    category: 'operations',
    accent: '#0ea5e9',
    zh: {
      title: 'SaaS 审批工作台',
      kicker: 'Approval Desk',
      description: '待办、单据摘要、审批意见和批量操作收进移动工作台。',
      tags: ['Tabs', 'Form', 'Dialog', 'Batch'],
      metrics: ['12 个待办', '批量处理'],
      action: '通过审批',
      preview: {
        heading: '采购审批 #PO-8321',
        subheading: '预算内 · 需今日处理',
        rows: [
          ['申请人', '杭州门店'],
          ['金额', '¥42,800'],
          ['状态', '经理待审']
        ]
      }
    },
    en: {
      title: 'SaaS Approval Desk',
      kicker: 'Approval Desk',
      description: 'Tasks, document summary, approval comment, and batch actions for mobile SaaS work.',
      tags: ['Tabs', 'Form', 'Dialog', 'Batch'],
      metrics: ['12 tasks', 'Batch actions'],
      action: 'Approve',
      preview: {
        heading: 'PO approval #8321',
        subheading: 'Within budget · due today',
        rows: [
          ['Requester', 'Hangzhou store'],
          ['Amount', '$42,800'],
          ['State', 'Manager review']
        ]
      }
    },
    snippets: snippets('ApprovalDeskBlock', 'SaaS 审批工作台', '通过审批', ['Tabs', 'Form', 'Dialog', 'Batch'])
  },
  {
    id: 'replenishment',
    category: 'operations',
    accent: '#84cc16',
    zh: {
      title: '门店补货看板',
      kicker: 'Retail Ops',
      description: '库存预警、销量趋势、补货建议和门店确认组成零售运营块。',
      tags: ['Cell', 'Rate', 'Stepper', 'Notice'],
      metrics: ['8 个 SKU', '智能建议'],
      action: '生成补货单',
      preview: {
        heading: '门店补货建议',
        subheading: '低库存 SKU 8 个，预计缺货 2 小时',
        rows: [
          ['鲜奶 950ml', '建议 +24'],
          ['鸡蛋 12 枚', '建议 +36'],
          ['香蕉', '建议 +18kg']
        ]
      }
    },
    en: {
      title: 'Store Replenishment Board',
      kicker: 'Retail Ops',
      description: 'Inventory alert, sales trend, replenishment suggestion, and store confirmation.',
      tags: ['Cell', 'Rate', 'Stepper', 'Notice'],
      metrics: ['8 SKUs', 'Smart suggestion'],
      action: 'Create order',
      preview: {
        heading: 'Replenishment advice',
        subheading: '8 low-stock SKUs, 2h shortage risk',
        rows: [
          ['Milk 950ml', '+24 suggested'],
          ['Eggs 12pc', '+36 suggested'],
          ['Banana', '+18kg suggested']
        ]
      }
    },
    snippets: snippets('StoreReplenishmentBlock', '门店补货看板', '生成补货单', ['Cell', 'Rate', 'Stepper', 'Notice'])
  },
  {
    id: 'security',
    category: 'account',
    accent: '#64748b',
    zh: {
      title: '账户安全设置',
      kicker: 'Security',
      description: '登录设备、二次验证、手机号换绑和风险提示组成设置页。',
      tags: ['Cell', 'Switch', 'Dialog', 'Password'],
      metrics: ['5 个安全项', '风险提醒'],
      action: '开启保护',
      preview: {
        heading: '账户保护',
        subheading: '新设备登录保护已开启',
        rows: [
          ['登录设备', '3 台'],
          ['手机号', '138 **** 2048'],
          ['支付密码', '已设置']
        ]
      }
    },
    en: {
      title: 'Account Security Settings',
      kicker: 'Security',
      description: 'Login devices, 2FA, phone binding, and risk notice for account settings.',
      tags: ['Cell', 'Switch', 'Dialog', 'Password'],
      metrics: ['5 controls', 'Risk notice'],
      action: 'Enable protection',
      preview: {
        heading: 'Account protection',
        subheading: 'New device protection is on',
        rows: [
          ['Devices', '3 active'],
          ['Phone', '138 **** 2048'],
          ['Pay PIN', 'Configured']
        ]
      }
    },
    snippets: snippets('AccountSecurityBlock', '账户安全设置', '开启保护', ['Cell', 'Switch', 'Dialog', 'Password'])
  },
  {
    id: 'after-sales',
    category: 'commerce',
    accent: '#f97316',
    zh: {
      title: '售后服务进度',
      kicker: 'After Sales',
      description: '退款、退货、客服沟通和物流回传组成售后状态页。',
      tags: ['Steps', 'Cell', 'Uploader', 'Chat'],
      metrics: ['4 个节点', '证据上传'],
      action: '补充凭证',
      preview: {
        heading: '退款处理中',
        subheading: '商家已同意，等待仓库验收',
        rows: [
          ['退款金额', '¥128.00'],
          ['退货单号', 'SF2048128'],
          ['客服', '2 条未读']
        ]
      }
    },
    en: {
      title: 'After-sales Progress',
      kicker: 'After Sales',
      description: 'Refund, return, support chat, and logistics updates for service flows.',
      tags: ['Steps', 'Cell', 'Uploader', 'Chat'],
      metrics: ['4 steps', 'Evidence upload'],
      action: 'Add evidence',
      preview: {
        heading: 'Refund in progress',
        subheading: 'Merchant approved, warehouse pending',
        rows: [
          ['Refund', '$128.00'],
          ['Return ID', 'SF2048128'],
          ['Support', '2 unread']
        ]
      }
    },
    snippets: snippets('AfterSalesProgressBlock', '售后服务进度', '补充凭证', ['Steps', 'Cell', 'Uploader', 'Chat'])
  },
  {
    id: 'delivery-slot',
    category: 'fresh',
    accent: '#06b6d4',
    zh: {
      title: '配送时段选择',
      kicker: 'Delivery Slot',
      description: '即时达、预约时段、运力告警和费用说明组成选择面板。',
      tags: ['Picker', 'Radio', 'Cell', 'Notice'],
      metrics: ['5 个时段', '运力提示'],
      action: '确认时段',
      preview: {
        heading: '选择配送时段',
        subheading: '18:00-18:30 运力紧张',
        rows: [
          ['最快送达', '29 分钟'],
          ['预约', '19:00-19:30'],
          ['配送费', '¥6.00']
        ]
      }
    },
    en: {
      title: 'Delivery Slot Picker',
      kicker: 'Delivery Slot',
      description: 'Instant delivery, reserved slots, capacity warning, and fee notes.',
      tags: ['Picker', 'Radio', 'Cell', 'Notice'],
      metrics: ['5 slots', 'Capacity alert'],
      action: 'Confirm slot',
      preview: {
        heading: 'Choose delivery slot',
        subheading: '18:00-18:30 is nearly full',
        rows: [
          ['Fastest', '29 min'],
          ['Reserved', '19:00-19:30'],
          ['Fee', '$6.00']
        ]
      }
    },
    snippets: snippets('DeliverySlotPickerBlock', '配送时段选择', '确认时段', ['Picker', 'Radio', 'Cell', 'Notice'])
  }
]

const activeId = ref(blocks[0]!.id)
const activeCategory = ref<Category | 'all'>('all')
const activeRuntime = ref<Runtime>('h5')
const copyState = ref<'idle' | 'copied' | 'unsupported'>('idle')
let copyFeedbackTimer: number | undefined

const categories = computed(() => {
  const availableCategories = Array.from(new Set(blocks.map((block) => block.category)))

  return ['all', ...availableCategories].map((id) => {
    const category = id as Category | 'all'

    return {
      id: category,
      label: categoryCopy[category][props.locale],
      count: category === 'all' ? blocks.length : blocks.filter((block) => block.category === category).length
    }
  })
})
const visibleBlocks = computed(() =>
  activeCategory.value === 'all' ? blocks : blocks.filter((block) => block.category === activeCategory.value)
)
const activeBlock = computed(() => blocks.find((block) => block.id === activeId.value) ?? blocks[0]!)
const activeCopy = computed(() => activeBlock.value[props.locale])
const runtimeLabel = computed(() => {
  if (props.locale === 'zh') {
    return activeRuntime.value === 'h5' ? 'H5' : '小程序'
  }

  return activeRuntime.value === 'h5' ? 'H5' : 'Mini-program'
})
const activeSnippet = computed(() => activeBlock.value.snippets[activeRuntime.value])
const copyLabel = computed(() => {
  if (copyState.value === 'copied') {
    return props.locale === 'zh' ? '已复制' : 'Copied'
  }

  if (copyState.value === 'unsupported') {
    return props.locale === 'zh' ? '手动复制代码' : 'Copy manually'
  }

  if (props.locale === 'zh') {
    return `复制${runtimeLabel.value}代码`
  }

  return `Copy ${runtimeLabel.value} code`
})

function selectBlock(id: string) {
  activeId.value = id
  activeRuntime.value = 'h5'
  resetCopyState()
}

function selectCategory(category: Category | 'all') {
  activeCategory.value = category

  if (!visibleBlocks.value.some((block) => block.id === activeId.value)) {
    const nextBlock = visibleBlocks.value[0]

    if (nextBlock) {
      selectBlock(nextBlock.id)
    }
  }
}

function setRuntime(runtime: Runtime) {
  activeRuntime.value = runtime
  resetCopyState()
}

function resetCopyState() {
  if (copyFeedbackTimer) {
    window.clearTimeout(copyFeedbackTimer)
    copyFeedbackTimer = undefined
  }

  copyState.value = 'idle'
}

async function copySnippet() {
  if (!navigator?.clipboard?.writeText) {
    copyState.value = 'unsupported'
    return
  }

  await navigator.clipboard.writeText(activeSnippet.value)
  copyState.value = 'copied'
  copyFeedbackTimer = window.setTimeout(() => {
    copyState.value = 'idle'
    copyFeedbackTimer = undefined
  }, 1800)
}

onBeforeUnmount(() => resetCopyState())
</script>

<template>
  <section class="varo-block-library">
    <header class="varo-block-library-head">
      <div>
        <span class="varo-block-kicker">{{ locale === 'zh' ? 'Business Blocks' : 'Business Blocks' }}</span>
        <h2>{{ locale === 'zh' ? '移动业务区块资产库' : 'Mobile Business Block Catalog' }}</h2>
        <p>
          {{
            locale === 'zh'
              ? '按真实 H5 与小程序场景组织，像 blocks catalog 一样浏览、预览和复制。'
              : 'Browse, preview, and copy real H5 and mini-program flows in a blocks-catalog structure.'
          }}
        </p>
      </div>
      <strong>{{ blocks.length }}</strong>
    </header>

    <div class="varo-block-filter-strip" role="tablist">
      <button
        v-for="category in categories"
        :key="category.id"
        type="button"
        :data-active="activeCategory === category.id"
        @click="selectCategory(category.id)"
      >
        <span>{{ category.label }}</span>
        <em>{{ category.count }}</em>
      </button>
    </div>

    <div class="varo-block-workspace">
      <div class="varo-block-card-list" aria-label="Varo mini-program blocks">
        <button
          v-for="block in visibleBlocks"
          :key="block.id"
          class="varo-block-card"
          :class="{ active: block.id === activeId }"
          type="button"
          :style="{ '--block-accent': block.accent }"
          @click="selectBlock(block.id)"
        >
          <span class="varo-block-kicker">{{ block[locale].kicker }}</span>
          <strong>{{ block[locale].title }}</strong>
          <p>{{ block[locale].description }}</p>
          <span class="varo-block-card-foot">
            <em>{{ block[locale].metrics[0] }}</em>
            <em>{{ block[locale].metrics[1] }}</em>
          </span>
        </button>
      </div>

      <div class="varo-block-preview-panel" :style="{ '--block-accent': activeBlock.accent }">
        <header class="varo-block-stage-head">
          <div>
            <span class="varo-block-kicker">{{ activeCopy.kicker }}</span>
            <h3>{{ activeCopy.title }}</h3>
            <p>{{ activeCopy.description }}</p>
          </div>
          <div class="varo-block-stage-metrics" aria-label="Block highlights">
            <span>{{ activeCopy.metrics[0] }}</span>
            <span>{{ activeCopy.metrics[1] }}</span>
          </div>
        </header>

        <div class="varo-block-preview-body">
          <div class="varo-phone-block" :data-block="activeBlock.id">
            <div class="varo-phone-window">
              <div class="varo-phone-status">
                <span>09:41</span>
                <span>Varo</span>
              </div>
              <div class="varo-phone-app">
                <div class="varo-phone-topbar">
                  <span>{{ activeCopy.kicker }}</span>
                  <strong>{{ activeCopy.preview.heading }}</strong>
                </div>
                <div class="varo-phone-card varo-phone-card-main">
                  <span>{{ activeCopy.preview.subheading }}</span>
                  <div class="varo-motion-scan varo-phone-progress"></div>
                  <div
                    v-for="row in activeCopy.preview.rows"
                    :key="row[0]"
                    class="varo-phone-list-row"
                  >
                    <span>{{ row[0] }}</span>
                    <b>{{ row[1] }}</b>
                  </div>
                </div>
                <div class="varo-phone-card varo-phone-state-card">
                  <div class="varo-mini-tags">
                    <span v-for="tag in activeCopy.tags" :key="tag">{{ tag }}</span>
                  </div>
                  <button class="varo-motion-pulse" type="button">{{ activeCopy.action }}</button>
                </div>
              </div>
            </div>
          </div>

          <aside class="varo-block-spec-panel">
            <span>{{ locale === 'zh' ? '适配运行时' : 'Runtimes' }}</span>
            <strong>H5 / Mini-program</strong>
            <div class="varo-mini-tags">
              <span v-for="tag in activeCopy.tags" :key="tag">{{ tag }}</span>
            </div>
            <div class="varo-block-spec-callout">
              {{
                locale === 'zh'
                  ? '每个 block 都优先表达业务结构，再绑定 Varo 组件。复制后替换字段、接口和局部样式即可进入业务项目。'
                  : 'Each block starts with product structure, then binds Varo components. Copy it, replace fields, APIs, and local styles.'
              }}
            </div>
          </aside>
        </div>

        <div class="varo-block-code varo-block-code-drawer">
          <div class="varo-block-code-head">
            <strong>{{ runtimeLabel }}</strong>
            <div class="varo-block-code-tabs" role="tablist">
              <button
                class="varo-block-code-tab"
                type="button"
                :data-active="activeRuntime === 'h5'"
                @click="setRuntime('h5')"
              >
                H5
              </button>
              <button
                class="varo-block-code-tab"
                type="button"
                :data-active="activeRuntime === 'weapp'"
                @click="setRuntime('weapp')"
              >
                {{ locale === 'zh' ? '小程序' : 'Mini' }}
              </button>
            </div>
            <button class="varo-block-copy" type="button" :aria-label="copyLabel" :title="copyLabel" @click="copySnippet">
              <span class="varo-block-copy-icon" aria-hidden="true"></span>
            </button>
          </div>
          <pre class="varo-block-code-panel"><code>{{ activeSnippet }}</code></pre>
        </div>
      </div>
    </div>
  </section>
</template>
