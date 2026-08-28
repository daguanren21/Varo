export type BlockCategory = 'agent' | 'business' | 'retail'
export type BlockGalleryLocale = 'en' | 'zh'
export type BlockTarget = 'h5' | 'weapp-vite'

export interface BlockGalleryDefinition {
  category: BlockCategory
  componentName: string
  dependencies: string[]
  description: Record<BlockGalleryLocale, string>
  id: string
  setup?: string
  targets: BlockTarget[]
  title: Record<BlockGalleryLocale, string>
  usage: string
}

export const blockGalleryDefinitions: BlockGalleryDefinition[] = [
  {
    category: 'business',
    componentName: 'LoginForm',
    dependencies: ['button', 'input', 'switch'],
    id: 'login-form',
    targets: ['weapp-vite', 'h5'],
    title: { zh: '登录表单', en: 'Login Form' },
    description: { zh: '手机号、密码、记住状态、错误与加载反馈。', en: 'Phone, password, remember, error, and loading states.' },
    usage: '<LoginForm @submit="handleLogin" />',
    setup: 'function handleLogin(credentials: unknown) {\n  console.log(credentials)\n}',
  },
  {
    category: 'business',
    componentName: 'ProfileCard',
    dependencies: ['avatar', 'badge', 'button'],
    id: 'profile-card',
    targets: ['weapp-vite', 'h5'],
    title: { zh: '用户资料卡', en: 'Profile Card' },
    description: { zh: '头像、身份状态、统计信息与编辑动作。', en: 'Avatar, identity status, statistics, and edit action.' },
    usage: '<ProfileCard :user="user" :stats="stats" @edit="openEditor" />',
    setup: 'const user = { name: \'Varo User\', status: \'Active\' }\nconst stats = [{ label: \'Orders\', value: 12 }]\nfunction openEditor() {}',
  },
  {
    category: 'business',
    componentName: 'ProfileEdit',
    dependencies: ['button', 'input', 'select'],
    id: 'profile-edit',
    targets: ['weapp-vite', 'h5'],
    title: { zh: '资料编辑', en: 'Profile Edit' },
    description: { zh: '姓名、手机号、城市搜索、简介与提交状态。', en: 'Name, phone, searchable city, biography, and submit state.' },
    usage: '<ProfileEdit :cities="cities" @submit="saveProfile" />',
    setup: 'const cities = [{ label: \'杭州\', value: \'hangzhou\' }]\nfunction saveProfile(profile: unknown) {\n  console.log(profile)\n}',
  },
  {
    category: 'business',
    componentName: 'ProductList',
    dependencies: ['badge', 'button', 'empty', 'image'],
    id: 'product-list',
    targets: ['weapp-vite', 'h5'],
    title: { zh: '商品列表', en: 'Product List' },
    description: { zh: '商品、库存、价格、空状态、选择与加购动作。', en: 'Products, inventory, pricing, empty state, selection, and cart actions.' },
    usage: '<ProductList :items="products" @add-to-cart="addToCart" />',
    setup: 'const products = []\nfunction addToCart(payload: unknown) {\n  console.log(payload)\n}',
  },
  {
    category: 'business',
    componentName: 'OrderFilter',
    dependencies: ['button', 'checkbox', 'input-number', 'tag'],
    id: 'order-filter',
    targets: ['weapp-vite', 'h5'],
    title: { zh: '订单筛选', en: 'Order Filter' },
    description: { zh: '多状态选择、金额区间校验、重置与应用事件。', en: 'Status selection, amount validation, reset, and apply events.' },
    usage: '<OrderFilter :result-count="128" @apply="loadOrders" />',
    setup: 'function loadOrders(filters: unknown) {\n  console.log(filters)\n}',
  },
  {
    category: 'agent',
    componentName: 'AgentChat',
    dependencies: ['agent-ui', '@varo-ui/ai'],
    id: 'agent-chat',
    targets: ['weapp-vite', 'h5'],
    title: { zh: 'Agent 对话', en: 'Agent Chat' },
    description: { zh: '增量 Markdown、工具状态、审批与输入组合。', en: 'Incremental Markdown, tool state, approvals, and composer.' },
    usage: '<AgentChat :messages="messages" @submit="runAgent" />',
    setup: 'const messages = [{ id: \'welcome\', role: \'assistant\', content: \'你好\' }]\nfunction runAgent(prompt: string) {\n  console.log(prompt)\n}',
  },
  {
    category: 'retail',
    componentName: 'RetailHome',
    dependencies: ['button', 'card', 'image', 'input', 'tag'],
    id: 'retail-home',
    targets: ['weapp-vite'],
    title: { zh: '零售首页', en: 'Retail Home' },
    description: { zh: '搜索、分类、精选商品与购物车入口。', en: 'Search, categories, featured products, and cart entry.' },
    usage: '<RetailHome :categories="categories" :products="products" />',
    setup: 'const categories = []\nconst products = []',
  },
  {
    category: 'retail',
    componentName: 'RetailCategory',
    dependencies: ['button', 'card', 'image', 'tag'],
    id: 'retail-category',
    targets: ['weapp-vite'],
    title: { zh: '零售分类', en: 'Retail Category' },
    description: { zh: '双栏分类导航、商品网格与加购动作。', en: 'Two-column category navigation, product grid, and cart actions.' },
    usage: '<RetailCategory v-model:active-id="activeId" :categories="categories" :products="products" />',
    setup: 'const activeId = shallowRef(\'women\')\nconst categories = []\nconst products = []',
  },
  {
    category: 'retail',
    componentName: 'RetailCart',
    dependencies: ['button', 'checkbox', 'empty', 'image', 'input-number'],
    id: 'retail-cart',
    targets: ['weapp-vite'],
    title: { zh: '购物车', en: 'Retail Cart' },
    description: { zh: '商品选择、数量、合计、空状态与结算。', en: 'Selection, quantity, totals, empty state, and checkout.' },
    usage: '<RetailCart :items="cartItems" :total="total" @checkout="checkout" />',
    setup: 'const cartItems = []\nconst total = 0\nfunction checkout() {}',
  },
  {
    category: 'retail',
    componentName: 'RetailProductDetail',
    dependencies: ['badge', 'button', 'card', 'image', 'input-number', 'tag'],
    id: 'retail-product-detail',
    targets: ['weapp-vite'],
    title: { zh: '商品详情', en: 'Product Detail' },
    description: { zh: '商品主图、价格、库存、数量、加购与购买。', en: 'Product image, pricing, stock, quantity, cart, and buy actions.' },
    usage: '<RetailProductDetail v-model:quantity="quantity" :product="product" />',
    setup: 'const quantity = shallowRef(1)\nconst product = {}',
  },
  {
    category: 'retail',
    componentName: 'RetailCheckout',
    dependencies: ['button', 'card', 'image', 'tag'],
    id: 'retail-checkout',
    targets: ['weapp-vite'],
    title: { zh: '结算确认', en: 'Retail Checkout' },
    description: { zh: '地址、商品、优惠、发票、金额与提交订单。', en: 'Address, products, coupons, invoice, totals, and order submission.' },
    usage: '<RetailCheckout :address="address" :items="items" :total="total" @submit="submitOrder" />',
    setup: 'const address = {}\nconst items = []\nconst total = 0\nfunction submitOrder() {}',
  },
  {
    category: 'retail',
    componentName: 'RetailOrderList',
    dependencies: ['button', 'card', 'empty', 'image', 'tag'],
    id: 'retail-order-list',
    targets: ['weapp-vite'],
    title: { zh: '订单列表', en: 'Retail Order List' },
    description: { zh: '订单状态、商品摘要与履约操作。', en: 'Order status, product summaries, and fulfillment actions.' },
    usage: '<RetailOrderList :orders="orders" @action="handleOrder" />',
    setup: 'const orders = []\nfunction handleOrder(order: unknown) {\n  console.log(order)\n}',
  },
  {
    category: 'retail',
    componentName: 'RetailProfile',
    dependencies: ['avatar', 'button', 'card', 'tag'],
    id: 'retail-profile',
    targets: ['weapp-vite'],
    title: { zh: '会员中心', en: 'Retail Profile' },
    description: { zh: '会员信息、订单、地址、优惠券与售后入口。', en: 'Membership, orders, addresses, coupons, and service entry.' },
    usage: '<RetailProfile name="Varo User" :points="2680" :order-counts="orderCounts" />',
    setup: 'const orderCounts = {}',
  },
]

export function blockInstallCommand(block: BlockGalleryDefinition, target: BlockTarget) {
  return `pnpm dlx @varo-ui/cli add --target ${target} blocks/${block.id}`
}

export function blockUsageSource(block: BlockGalleryDefinition, target: BlockTarget) {
  const importPath = `@/components/blocks/${block.id}.vue`
  const runtimeImport = block.setup?.includes('shallowRef')
    ? `import { shallowRef } from '${target === 'weapp-vite' ? 'wevu' : 'vue'}'\n`
    : ''
  const setup = block.setup ? `\n${block.setup}\n` : '\n'

  return `<script setup lang="ts">\n${runtimeImport}import ${block.componentName} from '${importPath}'\n${setup}<\/script>\n\n<template>\n  ${block.usage}\n</template>`
}
