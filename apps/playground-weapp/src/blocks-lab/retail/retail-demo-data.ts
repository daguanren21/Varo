import type { RetailProduct } from '../../lib/retail'
import blanket from '../../assets/retail/blanket.jpg'
import earbuds from '../../assets/retail/earbuds.jpg'
import plate from '../../assets/retail/plate-set.jpg'
import link from '../../assets/retail/varo-link.jpg'

export const longRetailCopy = '这是用于阅读边界的完整本地说明：商品的材质、维护方法、适用场景与售后条件均应由应用提供。窄屏中不能把重要限制藏在省略号或悬停内容里。订单与服务承诺请以真实商家的确认结果为准。'
export const demoProducts: RetailProduct[] = [
  { id: 'blanket', name: '云感午休毯', category: 'home', description: '可折叠的轻量午休毯。仅为本地演示商品。', image: blanket, price: 8900, linePrice: 8900, sales: 0, stock: 4, tags: ['本地商品'] },
  { id: 'plates', name: '雾蓝餐盘组', category: 'home', description: '当前无库存，保留收藏与商品详情入口。', image: plate, price: 12900, linePrice: 12900, sales: 0, stock: 0, tags: ['缺货'] },
  { id: 'link', name: 'Varo Link', category: 'digital', description: '应用限制查看和加购，真实库存仍然展示。', image: link, price: 24900, linePrice: 24900, sales: 0, stock: 2, tags: ['权限受限'] },
  { id: 'earbuds', name: 'Varo Buds Mini', category: 'digital', description: '用作比较上限和筛选结果的本地商品。', image: earbuds, price: 19900, linePrice: 19900, sales: 0, stock: 3, tags: ['本地商品'] },
]
