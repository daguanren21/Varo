<script setup lang="ts">
</script>

<template>
  <view class="app-root">
    <slot />
  </view>
</template>

<style>
@import './styles.css';
@import './styles/varo.css';

page {
  background: #f4f7fb;
  color: #172033;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.app-root {
  min-height: 100vh;
}
</style>

<json lang="jsonc">
{
  "$schema": "https://vite.icebreaker.top/app.json",
  "pages": [
    "pages/retail-home/index",
    "pages/retail-category/index",
    "pages/retail-cart/index",
    "pages/retail-profile/index",
    "pages/mall/index",
    "pages/index/index"
  ],
  "subPackages": [
    {
      "root": "retail-goods",
      "pages": [
        "list/index",
        "details/index",
        "search/index",
        "result/index",
        "comments/index",
        "comments/create/index"
      ]
    },
    {
      "root": "retail-order",
      "pages": [
        "order-confirm/index",
        "receipt/index",
        "pay-result/index",
        "order-list/index",
        "order-detail/index",
        "apply-service/index",
        "after-service-list/index",
        "after-service-detail/index",
        "fill-tracking-no/index",
        "delivery-detail/index",
        "invoice/index"
      ]
    },
    {
      "root": "retail-coupon",
      "pages": [
        "coupon-list/index",
        "coupon-detail/index",
        "coupon-activity-goods/index"
      ]
    },
    {
      "root": "retail-promotion",
      "pages": ["promotion-detail/index"]
    },
    {
      "root": "retail-showcase",
      "pages": ["index/index"]
    },
    {
      "root": "retail-user",
      "pages": [
        "person-info/index",
        "address/list/index",
        "address/edit/index",
        "name-edit/index"
      ]
    }
  ],
  "tabBar": {
    "color": "#94a3b8",
    "selectedColor": "#0f766e",
    "backgroundColor": "#ffffff",
    "borderStyle": "white",
    "list": [
      {
        "pagePath": "pages/retail-home/index",
        "text": "首页"
      },
      {
        "pagePath": "pages/retail-category/index",
        "text": "分类"
      },
      {
        "pagePath": "pages/retail-cart/index",
        "text": "购物车"
      },
      {
        "pagePath": "pages/retail-profile/index",
        "text": "我的"
      }
    ]
  },
  "window": {
    "navigationBarTitleText": "Varo Retail",
    "navigationBarBackgroundColor": "#ffffff",
    "navigationBarTextStyle": "black",
    "backgroundColor": "#f4f6f8"
  },
  "lazyCodeLoading": "requiredComponents"
}
</json>
