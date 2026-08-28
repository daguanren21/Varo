export interface RetailScreenField {
  label: string
  placeholder: string
  type?: 'text' | 'textarea'
}

export interface RetailScreenSection {
  detail: string
  status?: string
  title: string
}

export interface RetailScreenConfig {
  description: string
  eyebrow: string
  fields?: RetailScreenField[]
  primaryAction?: string
  primaryPath?: string
  sections: RetailScreenSection[]
  title: string
}

export const retailScreens: Record<string, RetailScreenConfig> = {
  'comments': {
    description: '查看真实购买用户留下的评价、规格与体验反馈。',
    eyebrow: 'REVIEWS',
    sections: [
      { title: '林女士 · 米白色 M', detail: '面料柔软，版型比预期更显瘦，通勤穿很合适。', status: '五星' },
      { title: '陈先生 · 默认规格', detail: '配送速度快，包装完整，实际颜色和详情页一致。', status: '五星' },
      { title: 'Varo 会员 · 黑色', detail: '使用两周后状态稳定，会考虑再次购买。', status: '四星' },
    ],
    primaryAction: '写评价',
    primaryPath: '/retail-goods/comments/create/index',
    title: '商品评价',
  },
  'comments-create': {
    description: '对商品、物流与服务进行评价，帮助其他用户决策。',
    eyebrow: 'WRITE A REVIEW',
    fields: [
      { label: '评价内容', placeholder: '分享商品体验', type: 'textarea' },
      { label: '规格说明', placeholder: '例如：米白色 M' },
    ],
    sections: [{ title: '综合评分', detail: '商品 5.0 · 物流 5.0 · 服务 5.0', status: '待提交' }],
    primaryAction: '提交评价',
    title: '发表评价',
  },
  'receipt': {
    description: '选择微信支付并确认本次交易金额。',
    eyebrow: 'PAYMENT',
    sections: [
      { title: '微信支付', detail: '推荐使用，支付结果实时同步', status: '已选择' },
      { title: '支付保障', detail: '平台担保交易 · 退款原路返回' },
    ],
    primaryAction: '确认支付',
    primaryPath: '/retail-order/pay-result/index',
    title: '收银台',
  },
  'apply-service': {
    description: '选择售后类型、原因并补充问题说明。',
    eyebrow: 'AFTER SALE',
    fields: [
      { label: '售后原因', placeholder: '请选择或输入原因' },
      { label: '问题说明', placeholder: '请描述商品问题', type: 'textarea' },
    ],
    sections: [
      { title: '仅退款', detail: '未收到货或与商家协商无需退货' },
      { title: '退货退款', detail: '寄回商品后退款' },
    ],
    primaryAction: '提交申请',
    title: '申请售后',
  },
  'after-service-list': {
    description: '查看退货、退款与换货申请的处理进度。',
    eyebrow: 'SERVICE RECORDS',
    sections: [
      { title: 'AS20260826001 · 退货退款', detail: '迷你触控蓝牙耳机 · ¥290.00', status: '等待寄回' },
      { title: 'AS20260812002 · 仅退款', detail: '简约耐热餐盘套装 · ¥129.00', status: '退款完成' },
    ],
    primaryAction: '查看售后详情',
    primaryPath: '/retail-order/after-service-detail/index',
    title: '售后列表',
  },
  'after-service-detail': {
    description: '售后申请已通过，请在有效期内寄回商品。',
    eyebrow: 'SERVICE DETAIL',
    sections: [
      { title: '申请已通过', detail: '平台已同意退货退款申请', status: '当前进度' },
      { title: '寄回商品', detail: '请在 7 天内填写退货物流信息' },
      { title: '商家收货并退款', detail: '验收完成后原路退款' },
    ],
    primaryAction: '填写退货物流',
    primaryPath: '/retail-order/fill-tracking-no/index',
    title: '售后详情',
  },
  'fill-tracking-no': {
    description: '填写退货快递公司与运单号。',
    eyebrow: 'RETURN LOGISTICS',
    fields: [
      { label: '快递公司', placeholder: '例如：顺丰速运' },
      { label: '运单号', placeholder: '请输入退货运单号' },
    ],
    sections: [{ title: '退货地址', detail: '上海市浦东新区 Varo 售后中心 1 号库' }],
    primaryAction: '提交物流信息',
    title: '退货物流',
  },
  'delivery-detail': {
    description: '订单正在配送，最新物流节点会自动更新。',
    eyebrow: 'DELIVERY',
    sections: [
      { title: '派送中', detail: '快递员正在为你派送，请保持电话畅通', status: '今天 09:30' },
      { title: '运输中', detail: '快件已到达上海浦东转运中心', status: '今天 06:18' },
      { title: '已发货', detail: '商家已将商品交给顺丰速运', status: '昨天 18:20' },
    ],
    primaryAction: '联系配送员',
    title: '物流详情',
  },
  'invoice': {
    description: '填写发票抬头与税号，电子发票将发送到订单账户。',
    eyebrow: 'INVOICE',
    fields: [
      { label: '发票抬头', placeholder: '个人或企业名称' },
      { label: '纳税人识别号', placeholder: '企业发票必填' },
    ],
    sections: [{ title: '电子普通发票', detail: '商品明细 · 订单完成后开具', status: '推荐' }],
    primaryAction: '保存发票信息',
    title: '发票信息',
  },
  'coupon-detail': {
    description: '新人满减券适用于 Varo Retail 自营商品。',
    eyebrow: 'COUPON DETAIL',
    sections: [
      { title: '¥30 满减券', detail: '订单商品金额满 299 元可用', status: '可领取' },
      { title: '使用范围', detail: '除特殊活动商品外，全场自营商品可用' },
      { title: '有效期', detail: '领取后 30 天内有效' },
    ],
    primaryAction: '立即领取',
    title: '优惠券详情',
  },
  'coupon-activity-goods': {
    description: '以下商品可使用新人满减券。',
    eyebrow: 'COUPON PRODUCTS',
    sections: [
      { title: '服饰精选', detail: '连衣裙、短袖和卫衣参与满减' },
      { title: '数码好物', detail: '极光盒子与蓝牙耳机参与满减' },
    ],
    primaryAction: '去选购',
    primaryPath: '/retail-goods/list/index',
    title: '优惠券可用商品',
  },
  'promotion': {
    description: 'Varo 会员季：跨品类满减、限时折扣与会员加赠。',
    eyebrow: 'MEMBER WEEK',
    sections: [
      { title: '满 299 减 30', detail: '服饰、数码和家居自营商品可用', status: '进行中' },
      { title: 'PLUS 会员加赠', detail: '支付完成后额外获得双倍积分' },
      { title: '限时秒杀', detail: '每日 10:00、16:00 两场' },
    ],
    primaryAction: '进入活动会场',
    primaryPath: '/retail-goods/list/index',
    title: '会员季活动',
  },
  'person-info': {
    description: '管理头像、昵称、手机号与会员资料。',
    eyebrow: 'PROFILE',
    sections: [
      { title: '头像与昵称', detail: 'Varo 用户', status: '已完善' },
      { title: '绑定手机', detail: '138****2026' },
      { title: '会员等级', detail: 'PLUS 三级会员 · 2,680 积分' },
    ],
    primaryAction: '编辑昵称',
    primaryPath: '/retail-user/name-edit/index',
    title: '个人信息',
  },
  'name-edit': {
    description: '修改昵称后将在订单、评价与客服会话中展示。',
    eyebrow: 'DISPLAY NAME',
    fields: [{ label: '昵称', placeholder: '请输入 2–20 个字符' }],
    sections: [{ title: '命名规则', detail: '不包含联系方式、广告或不友善内容' }],
    primaryAction: '保存昵称',
    title: '编辑昵称',
  },
}
