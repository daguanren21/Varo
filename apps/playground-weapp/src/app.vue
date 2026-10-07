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
  --varo-ui-bg: #f7f4ee;
  --varo-ui-surface: #fffdf8;
  --varo-ui-surface-muted: #efeae1;
  --varo-ui-surface-overlay: #fffdf8;
  --varo-ui-text: #292722;
  --varo-ui-text-regular: #625e55;
  --varo-ui-text-muted: #625e55;
  --varo-ui-text-placeholder: #6c665d;
  --varo-ui-text-disabled: #8d8780;
  --varo-ui-border: #dcd6cb;
  --varo-ui-border-strong: #8f8373;
  --varo-ui-border-dark: #c4bbae;
  --varo-ui-border-light: #e4ded3;
  --varo-ui-border-lighter: #e9e3d9;
  --varo-ui-fill: #efeae1;
  --varo-ui-fill-darker: #dfd7cb;
  --varo-ui-fill-light: #f3eee5;
  --varo-ui-primary: #86543c;
  --varo-ui-primary-dark: #73432e;
  --varo-ui-primary-hover: #6f432e;
  --varo-ui-primary-soft: #efe4da;
  --varo-ui-primary-text: #71452f;
  --varo-ui-button-radius: 3px;
  --varo-ui-input-radius: 3px;
  --varo-ui-button-height-sm: 44px;
  --varo-ui-input-height-sm: 44px;
  --varo-ui-radius: 3px;
  --varo-ui-radius-sm: 3px;
  --varo-ui-shadow-sm: none;
  --varo-ui-shadow-md: none;
  --varo-ui-ring: rgb(134 84 60 / 20%);
  --varo-ui-focus: #86543c;

  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: var(--varo-ui-text);
  background: var(--varo-ui-bg);
  animation: retail-page-in 220ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.retail-page-enter .retail-heading {
  font-family: 'Songti SC', 'Noto Serif CJK SC', STSong, serif;
  font-weight: 600;
}

.retail-page-enter .retail-price {
  font-family: Georgia, 'Times New Roman', serif;
  font-variant-numeric: tabular-nums;
}

.retail-page-enter .varo-button,
.retail-page-enter .varo-input__label {
  font-size: 15px;
}

.retail-page-enter .varo-input,
.retail-page-enter .varo-input-number {
  font-size: 16px;
}

.retail-page-enter .varo-input,
.retail-page-enter .varo-input-number,
.retail-page-enter .varo-checkbox,
.retail-page-enter .varo-switch {
  --varo-ui-border: var(--varo-ui-border-strong);
}

.retail-page-enter .varo-checkbox {
  min-width: 44px;
}

.retail-page-enter .varo-input__clear.varo-input__clear {
  width: 44px;
  height: 44px;
}

.retail-page-enter .varo-empty__visual {
  background: transparent;
  box-shadow: none;
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

.retail-product-card .varo-button--pressed .varo-image__img {
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
    transform: translateY(6px);
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
