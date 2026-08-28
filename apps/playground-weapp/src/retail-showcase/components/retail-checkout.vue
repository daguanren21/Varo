<script setup lang="ts">
import type { PropType } from 'wevu'
import type { RetailAddressSummary, RetailCartLine } from '../../lib/retail'
import { computed } from 'wevu'
import VTag from '../../components/ui/tag.vue'
import VButton from '../../components/ui/v-button.vue'
import VCard from '../../components/ui/v-card.vue'
import VImage from '../../components/ui/v-image.vue'
import { formatRetailMoney, normalizeRetailProduct } from '../../lib/retail'

const props = defineProps({
  address: { type: null as unknown as PropType<RetailAddressSummary>, default: undefined },
  couponCount: { type: null as unknown as PropType<number>, default: 0 },
  discount: { type: null as unknown as PropType<number>, default: 0 },
  items: { type: null as unknown as PropType<RetailCartLine[]>, default: () => [] },
  shipping: { type: null as unknown as PropType<number>, default: 0 },
  total: { type: null as unknown as PropType<number>, default: 0 },
})
const emit = defineEmits<{
  address: []
  coupon: []
  invoice: []
  submit: []
  view: [productId: string]
}>()
const safeAddress = computed(() => ({
  detail: String(props.address?.detail ?? '请选择收货地址'),
  isDefault: Boolean(props.address?.isDefault),
  name: String(props.address?.name ?? '未选择地址'),
  phone: String(props.address?.phone ?? ''),
}))
const safeCouponCount = computed(() => Number(props.couponCount) || 0)
const safeDiscount = computed(() => Number(props.discount) || 0)
const safeItems = computed(() => (Array.isArray(props.items) ? props.items : []).map((item) => {
  const product = normalizeRetailProduct(item?.product)
  return {
    product,
    priceLabel: formatRetailMoney(product.price),
    quantity: Number(item?.quantity) || 1,
    selected: Boolean(item?.selected),
  }
}))
const safeShipping = computed(() => Number(props.shipping) || 0)
const safeTotal = computed(() => Number(props.total) || 0)
const discountLabel = computed(() => formatRetailMoney(safeDiscount.value))
const payableLabel = computed(() => formatRetailMoney(Math.max(0, safeTotal.value + safeShipping.value - safeDiscount.value)))
const shippingLabel = computed(() => formatRetailMoney(safeShipping.value))
const totalLabel = computed(() => formatRetailMoney(safeTotal.value))
</script>

<template>
  <view class="grid gap-3 bg-[#f4f6f8] p-3 pb-24 text-slate-950">
    <VCard interactive variant="elevated" @click="emit('address')">
      <view class="grid gap-2">
        <view class="flex items-center gap-2">
          <text class="text-sm font-black">
            {{ safeAddress.name }}
          </text>
          <text class="text-xs text-slate-500">
            {{ safeAddress.phone }}
          </text>
          <VTag v-if="safeAddress.isDefault" label="默认" tone="primary" variant="soft" size="sm" />
        </view>
        <text class="text-xs leading-5 text-slate-600">
          {{ safeAddress.detail }}
        </text>
      </view>
    </VCard>

    <VCard>
      <view class="grid gap-3">
        <text class="text-sm font-black">
          Varo Retail 自营店
        </text>
        <VButton
          v-for="item in safeItems"
          :key="item.product.id"
          block
          variant="ghost"
          tone="default"
          class-name="!min-h-0 !rounded-xl !bg-slate-50 !p-2 !text-left"
          @click="emit('view', item.product.id)"
        >
          <view class="grid w-full grid-cols-[72px_minmax(0,1fr)] gap-3">
            <VImage :src="item.product.image" :alt="item.product.name" fit="cover" width="72px" height="72px" radius="12px" />
            <view class="grid min-w-0 content-between gap-2">
              <text class="line-clamp-2 text-xs font-semibold leading-[18px]">
                {{ item.product.name }}
              </text>
              <view class="flex items-center justify-between text-[10px] text-slate-400">
                <text>¥{{ item.priceLabel }}</text>
                <text>× {{ item.quantity }}</text>
              </view>
            </view>
          </view>
        </VButton>
      </view>
    </VCard>

    <VCard>
      <view class="grid gap-1">
        <VButton block variant="ghost" tone="default" class-name="!flex !min-h-12 !w-full !justify-between !rounded-none !border-b !border-slate-100 !p-0" @click="emit('coupon')">
          <text>优惠券</text><text class="text-[#f04438]">
            {{ safeCouponCount }} 张可用
          </text>
        </VButton>
        <VButton block variant="ghost" tone="default" class-name="!flex !min-h-12 !w-full !justify-between !rounded-none !p-0" @click="emit('invoice')">
          <text>发票</text><text class="text-slate-400">
            暂不开具
          </text>
        </VButton>
      </view>
    </VCard>

    <VCard>
      <view class="grid gap-2 text-xs">
        <view class="flex justify-between">
          <text>商品金额</text><text>¥{{ totalLabel }}</text>
        </view>
        <view class="flex justify-between">
          <text>运费</text><text>¥{{ shippingLabel }}</text>
        </view>
        <view class="flex justify-between">
          <text>活动优惠</text><text class="text-[#f04438]">
            -¥{{ discountLabel }}
          </text>
        </view>
      </view>
    </VCard>

    <view class="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 bg-white px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-3">
      <text class="text-xl font-black text-[#f04438]">
        ¥{{ payableLabel }}
      </text>
      <VButton size="lg" tone="danger" shape="round" @click="emit('submit')">
        提交订单
      </VButton>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
