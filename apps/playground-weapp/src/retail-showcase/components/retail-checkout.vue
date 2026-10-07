<script setup lang="ts">
import type { RetailAddressSummary, RetailCartLine } from '../../lib/retail'
import { computed } from 'wevu'
import VTag from '../../components/ui/tag.vue'
import VButton from '../../components/ui/v-button.vue'
import VCard from '../../components/ui/v-card.vue'
import VImage from '../../components/ui/v-image.vue'
import { formatRetailMoney, normalizeRetailProduct } from '../../lib/retail'

const props = withDefaults(
  defineProps<{
    address?: RetailAddressSummary
    couponCount?: number
    discount?: number
    disabled?: boolean
    error?: string
    items?: RetailCartLine[]
    loading?: boolean
    shipping?: number
    submitting?: boolean
    total?: number
  }>(),
  {
    couponCount: 0,
    discount: 0,
    disabled: false,
    error: '',
    items: () => [],
    loading: false,
    shipping: 0,
    submitting: false,
    total: 0,
  },
)
const emit = defineEmits<{
  address: []
  coupon: []
  invoice: []
  retry: []
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
    quantity: Number(item?.quantity) || 0,
    selected: Boolean(item?.selected),
  }
}))
const safeShipping = computed(() => Number(props.shipping) || 0)
const safeTotal = computed(() => Number(props.total) || 0)
const discountLabel = computed(() => formatRetailMoney(safeDiscount.value))
const payableLabel = computed(() => formatRetailMoney(Math.max(0, safeTotal.value + safeShipping.value - safeDiscount.value)))
const shippingLabel = computed(() => formatRetailMoney(safeShipping.value))
const totalLabel = computed(() => formatRetailMoney(safeTotal.value))
const checkoutIssue = computed(() => {
  if (safeItems.value.length === 0) { return '暂无可结算商品' }
  if (!props.address?.name?.trim() || !props.address?.phone?.trim() || !props.address?.detail?.trim()) {
    return '请选择完整的收货地址'
  }
  if (!props.items.every(item => item.product?.id
    && Number.isSafeInteger(item.quantity) && item.quantity > 0
    && Number.isSafeInteger(item.product.stock) && item.quantity <= item.product.stock
    && Number.isSafeInteger(item.product.price) && item.product.price >= 0)) {
    return '商品数量或库存不可用，请返回购物车调整'
  }
  if (![props.total, props.shipping, props.discount].every(value => Number.isSafeInteger(value) && value >= 0)) {
    return '订单金额不可用，请重新加载'
  }
  return ''
})
const submitDisabled = computed(() => props.disabled || props.loading || props.submitting || Boolean(props.error) || Boolean(checkoutIssue.value))

function submit() {
  if (!submitDisabled.value) { emit('submit') }
}

function retry() {
  if (!props.loading && !props.submitting) { emit('retry') }
}
</script>

<template>
  <view class="grid grid-cols-1 gap-6 bg-[var(--varo-ui-surface)] text-sm leading-6 text-[var(--varo-ui-text)]">
    <view class="grid gap-2 px-4 pt-6">
      <text class="text-xl font-semibold leading-7">
        确认订单
      </text>
      <text class="text-xs leading-5 text-[var(--varo-ui-text-regular)]">
        核对商品与收货信息
      </text>
    </view>

    <view class="grid gap-6 px-4">
      <view v-if="props.loading" class="rounded-lg bg-[var(--varo-ui-surface-muted)] p-4" role="status">
        <text class="text-sm leading-6 text-[var(--varo-ui-text-regular)]">
          正在加载结算信息…
        </text>
      </view>
      <view v-else-if="props.error" class="grid grid-cols-1 gap-3 rounded-lg border border-[var(--varo-ui-danger)] p-4" role="alert">
        <text class="break-words text-sm leading-6 text-[var(--varo-ui-danger-text)]">
          {{ props.error }}
        </text>
        <VButton block variant="outline" tone="default" class-name="!min-h-11 !rounded-lg !shadow-none" :disabled="props.submitting" @click="retry">
          重新加载
        </VButton>
      </view>
      <view v-else-if="checkoutIssue" class="rounded-lg bg-[var(--varo-ui-surface-muted)] p-4" role="status">
        <text class="break-words text-sm leading-6 text-[var(--varo-ui-text-regular)]">
          {{ checkoutIssue }}
        </text>
      </view>

      <view class="grid gap-3">
        <text class="text-sm font-semibold leading-6">
          收货信息
        </text>
        <VCard :interactive="true" variant="outline" role="button" aria-label="选择收货地址" class-name="!rounded-xl !border-[var(--varo-ui-border-lighter)] !shadow-none" @click="emit('address')">
          <view class="grid min-w-0 grid-cols-1 gap-3">
            <view class="flex flex-wrap items-center gap-2">
              <text class="min-w-0 break-words text-sm font-semibold leading-6">
                {{ safeAddress.name }}
              </text>
              <VTag v-if="safeAddress.isDefault" label="默认" tone="default" variant="soft" />
            </view>
            <text v-if="safeAddress.phone" class="break-all text-sm tabular-nums leading-6 text-[var(--varo-ui-text-regular)]">
              {{ safeAddress.phone }}
            </text>
            <text class="break-words text-sm leading-6 text-[var(--varo-ui-text-regular)]">
              {{ safeAddress.detail }}
            </text>
            <text class="text-right text-sm font-medium leading-6">
              选择地址
            </text>
          </view>
        </VCard>
      </view>

      <view class="grid gap-4">
        <text class="text-sm font-semibold leading-6">
          商品明细
        </text>
        <VButton
          v-for="item in safeItems"
          :key="item.product.id"
          block
          variant="ghost"
          tone="default"
          :aria-label="item.product.name"
          class-name="!min-h-11 !w-full !min-w-0 !rounded-lg !p-0 !text-left !shadow-none"
          @click="emit('view', item.product.id)"
        >
          <view class="grid w-full min-w-0 grid-cols-[72px_minmax(0,1fr)] items-start gap-3">
            <VImage :src="item.product.image" :alt="item.product.name" fit="cover" width="72px" height="72px" radius="8px" />
            <view class="grid min-w-0 grid-cols-1 gap-2">
              <text class="break-words text-sm font-medium leading-6">
                {{ item.product.name }}
              </text>
              <view class="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-baseline gap-3 tabular-nums">
                <text class="break-all text-base font-semibold leading-6">
                  ¥{{ item.priceLabel }}
                </text>
                <text class="break-all text-right text-xs leading-6 text-[var(--varo-ui-text-regular)]">
                  × {{ item.quantity }}
                </text>
              </view>
            </view>
          </view>
        </VButton>
      </view>

      <view class="grid gap-1 border-y border-[var(--varo-ui-border-lighter)] py-2">
        <VButton block variant="ghost" tone="default" class-name="!min-h-12 !w-full !rounded-lg !p-0 !text-sm !shadow-none" @click="emit('coupon')">
          <view class="grid w-full grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-4 leading-6">
            <text class="text-left">
              优惠券
            </text>
            <text class="break-words text-right font-normal text-[var(--varo-ui-text-regular)]">
              {{ safeCouponCount }} 张可用
            </text>
          </view>
        </VButton>
        <VButton block variant="ghost" tone="default" class-name="!min-h-12 !w-full !rounded-lg !p-0 !text-sm !shadow-none" @click="emit('invoice')">
          <view class="grid w-full grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-4 leading-6">
            <text class="text-left">
              发票
            </text>
            <text class="text-right font-normal text-[var(--varo-ui-text-regular)]">
              暂不开具
            </text>
          </view>
        </VButton>
      </view>

      <view class="grid gap-4">
        <text class="text-sm font-semibold leading-6">
          金额明细
        </text>
        <view class="grid gap-3 text-sm leading-6 text-[var(--varo-ui-text-regular)]">
          <view class="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4">
            <text>商品金额</text><text class="break-all text-right tabular-nums">
              ¥{{ totalLabel }}
            </text>
          </view>
          <view class="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4">
            <text>运费</text><text class="break-all text-right tabular-nums">
              ¥{{ shippingLabel }}
            </text>
          </view>
          <view class="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4">
            <text>活动优惠</text><text class="break-all text-right tabular-nums">
              -¥{{ discountLabel }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <view class="sticky bottom-0 z-10 grid gap-4 border-t border-[var(--varo-ui-border-lighter)] bg-[var(--varo-ui-surface)] p-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
      <view class="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-4">
        <text class="text-sm leading-6 text-[var(--varo-ui-text-regular)]">
          应付金额
        </text>
        <text class="break-all text-right text-xl font-semibold tabular-nums leading-7">
          ¥{{ payableLabel }}
        </text>
      </view>
      <VButton block size="lg" tone="default" class-name="!min-h-12 !rounded-lg !bg-[var(--varo-ui-text)] !text-sm !text-[var(--varo-ui-surface)] !shadow-none" :disabled="submitDisabled" :loading="props.submitting" loading-text="正在提交…" @click="submit">
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
