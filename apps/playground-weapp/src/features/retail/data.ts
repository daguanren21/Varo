import type { RetailAddress, RetailCoupon, RetailOrder, RetailProduct } from './types'
import blanketImage from '../../assets/retail/blanket.jpg'
import cutleryImage from '../../assets/retail/cutlery.jpg'
import dressWhiteImage from '../../assets/retail/dress-white.jpg'
import earbudsImage from '../../assets/retail/earbuds.jpg'
import hoodieGreenImage from '../../assets/retail/hoodie-green.jpg'
import plateSetImage from '../../assets/retail/plate-set.jpg'
import teeCoralImage from '../../assets/retail/tee-coral.jpg'

import varoLinkImage from '../../assets/retail/varo-link.jpg'

export const retailCategories = [
  { id: 'women', label: '女装', shortLabel: '女装' },
  { id: 'men', label: '男装', shortLabel: '男装' },
  { id: 'digital', label: '数码', shortLabel: '数码' },
  { id: 'home', label: '家居', shortLabel: '家居' },
  { id: 'outdoor', label: '运动', shortLabel: '运动' },
]

export const retailProducts: RetailProduct[] = [
  {
    category: 'women',
    description: '荷叶边裙摆与轻盈面料，适合通勤和周末出游。',
    id: 'dress-white',
    image: dressWhiteImage,
    linePrice: 40000,
    name: '雾白轻盈连衣裙',
    price: 29800,
    sales: 1020,
    stock: 510,
    tags: ['限时抢购', '夏季新品'],
  },
  {
    category: 'women',
    description: '亲肤纯棉圆领版型，日常单穿或叠搭都舒适。',
    id: 'tee-coral',
    image: teeCoralImage,
    linePrice: 31900,
    name: '珊瑚色纯棉短袖',
    price: 25900,
    sales: 860,
    stock: 260,
    tags: ['夏季新款'],
  },
  {
    category: 'women',
    description: '轻薄连帽开衫，柔软细绒适合晨跑与日常通勤。',
    id: 'hoodie-green',
    image: hoodieGreenImage,
    linePrice: 39900,
    name: '苔绿色轻量连帽衫',
    price: 25900,
    sales: 632,
    stock: 180,
    tags: ['2026 新款'],
  },
  {
    category: 'digital',
    description: '本地联动、家庭场景快捷控制与简洁状态反馈。',
    id: 'aurora-box',
    image: varoLinkImage,
    linePrice: 69900,
    name: 'Varo Link 智能家居中枢',
    price: 59900,
    sales: 438,
    stock: 72,
    tags: ['Varo 自研'],
  },
  {
    category: 'home',
    description: '可披可盖的加厚午休毯，办公室和车内都适用。',
    id: 'nap-blanket',
    image: blanketImage,
    linePrice: 36900,
    name: '云感便携午休毯',
    price: 29900,
    sales: 1290,
    stock: 96,
    tags: ['限时抢购'],
  },
  {
    category: 'digital',
    description: '低延迟蓝牙连接、触控操作与轻量便携充电盒。',
    id: 'mini-earbuds',
    image: earbudsImage,
    linePrice: 32900,
    name: 'Varo Buds Mini',
    price: 29000,
    sales: 784,
    stock: 3,
    tags: ['低库存'],
  },
  {
    category: 'home',
    description: '耐热家用餐盘，哑光釉面适合日常摆盘。',
    id: 'dinner-plate',
    image: plateSetImage,
    linePrice: 16800,
    name: '雾蓝陶瓷餐盘组',
    price: 12900,
    sales: 510,
    stock: 88,
    tags: ['掌柜热卖'],
  },
  {
    category: 'home',
    description: '不锈钢刀叉勺组合，圆润边缘与耐用拉丝表面。',
    id: 'cutlery-set',
    image: cutleryImage,
    linePrice: 18800,
    name: '不锈钢旅行餐具',
    price: 15900,
    sales: 428,
    stock: 140,
    tags: ['秋季新款'],
  },
]

export const initialRetailAddresses: RetailAddress[] = [
  {
    city: '上海市',
    detail: '张江路 88 号 Varo 大厦 8 楼',
    district: '浦东新区',
    id: 'address-default',
    isDefault: true,
    name: '李一',
    phone: '138****2026',
  },
]

export const initialRetailCoupons: RetailCoupon[] = [
  { condition: '满 299 元可用', discount: 3000, id: 'coupon-30', title: '新人满减券', validUntil: '2026-12-31' },
  { condition: '全场通用', discount: 1000, id: 'coupon-10', title: '会员专享券', validUntil: '2026-10-31' },
]

export const initialRetailOrders: RetailOrder[] = [
  {
    createdAt: '2026-08-26 18:30',
    id: 'VR20260826001',
    items: [{ productId: 'aurora-box', quantity: 1 }],
    status: 'pending-receipt',
    total: 59900,
  },
  {
    createdAt: '2026-08-18 09:12',
    id: 'VR20260818002',
    items: [{ productId: 'dress-white', quantity: 1 }],
    status: 'completed',
    total: 29800,
  },
]
