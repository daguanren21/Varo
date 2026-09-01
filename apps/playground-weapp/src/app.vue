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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: var(--varo-ui-text);
  background: var(--varo-ui-bg);
}

.app-root {
  min-height: 100vh;
}

.retail-page-enter {
  animation: retail-page-in 220ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.retail-section-enter {
  animation: retail-section-in 220ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.retail-section-enter:nth-child(2) {
  animation-delay: 35ms;
}

.retail-section-enter:nth-child(3) {
  animation-delay: 70ms;
}

.retail-section-enter:nth-child(4) {
  animation-delay: 105ms;
}

.retail-section-enter:nth-child(5) {
  animation-delay: 140ms;
}

.retail-pressable {
  transition:
    transform 90ms ease,
    opacity 90ms ease;
}

.retail-pressable--active {
  opacity: 0.9;
  transform: scale(0.985);
}

.retail-product-card .varo-image__img {
  transition: transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.retail-product-card.varo-card--pressed .varo-image__img {
  transform: scale(0.975);
}

@keyframes retail-page-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes retail-section-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .retail-page-enter,
  .retail-section-enter {
    animation: none;
  }

  .retail-pressable {
    transition: none;
  }

  .retail-product-card .varo-image__img {
    transition: none;
  }
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
    "pages/form-showcase/index",
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
        "text": "首页",
        "iconPath": "assets/tabbar/home.png",
        "selectedIconPath": "assets/tabbar/home-active.png"
      },
      {
        "pagePath": "pages/retail-category/index",
        "text": "分类",
        "iconPath": "assets/tabbar/category.png",
        "selectedIconPath": "assets/tabbar/category-active.png"
      },
      {
        "pagePath": "pages/retail-cart/index",
        "text": "购物车",
        "iconPath": "assets/tabbar/cart.png",
        "selectedIconPath": "assets/tabbar/cart-active.png"
      },
      {
        "pagePath": "pages/retail-profile/index",
        "text": "我的",
        "iconPath": "assets/tabbar/profile.png",
        "selectedIconPath": "assets/tabbar/profile-active.png"
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
