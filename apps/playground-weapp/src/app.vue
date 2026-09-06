<script setup lang="ts">
</script>

<template>
  <view class="app-root">
    <slot />
  </view>
</template>

<style>
page {
  /* Retail accents keep white foregrounds above AA contrast in both press states. */
  --varo-ui-primary: #0f766e;
  --varo-ui-primary-dark: #0d645e;
  --varo-ui-primary-hover: #115e59;
  --varo-ui-primary-soft: #e7f1f1;
  --varo-ui-primary-foreground: #fff;
  --varo-ui-primary-hover-foreground: #fff;
  --varo-ui-primary-text: #205451;
  --varo-ui-success: #15803d;
  --varo-ui-success-dark: #126d34;
  --varo-ui-success-hover: #166534;
  --varo-ui-success-soft: #e8f2ec;
  --varo-ui-success-foreground: #fff;
  --varo-ui-success-hover-foreground: #fff;
  --varo-ui-success-text: #235938;
  --varo-ui-warning: #a16207;
  --varo-ui-warning-dark: #895306;
  --varo-ui-warning-hover: #854d0e;
  --varo-ui-warning-soft: #f6efe6;
  --varo-ui-warning-foreground: #fff;
  --varo-ui-warning-hover-foreground: #fff;
  --varo-ui-warning-text: #694a1d;
  --varo-ui-danger: #b91c1c;
  --varo-ui-danger-dark: #9d1818;
  --varo-ui-danger-hover: #991b1b;
  --varo-ui-danger-soft: #f8e8e8;
  --varo-ui-danger-foreground: #fff;
  --varo-ui-danger-hover-foreground: #fff;
  --varo-ui-danger-text: #752728;
  --varo-ui-info: #475569;
  --varo-ui-info-dark: #3c4859;
  --varo-ui-info-hover: #334155;
  --varo-ui-info-soft: #edeef0;
  --varo-ui-info-foreground: #fff;
  --varo-ui-info-hover-foreground: #fff;
  --varo-ui-info-text: #3c434e;
  --varo-ui-ring: rgb(15 118 110 / 16%);

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
  }

  to {
    opacity: 1;
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
    "pages/robot-chat-showcase/index",
    "pages/agent-workspace/index",
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
    },
    {
      "root": "registry-catalog",
      "pages": ["index/index"]
    }
  ],
  "plugins": {
    "varoRobot": {
      "version": "1.1.15",
      "provider": "wx8c631f7e9f2465e1"
    }
  },
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
  "style": "v2",
  "componentFramework": "glass-easel",
  "lazyCodeLoading": "requiredComponents"
}
</json>
