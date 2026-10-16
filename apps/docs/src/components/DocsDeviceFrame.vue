<script setup lang="ts">
withDefaults(defineProps<{ overflow?: boolean }>(), { overflow: false })
</script>

<template>
  <div class="docs-device-frame">
    <div class="docs-device-frame__bezel">
      <div class="docs-device-frame__screen" :data-overflow="overflow">
        <div class="docs-device-frame__content">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.docs-device-frame {
  display: flex;
  justify-content: center;
  min-width: 0;
  padding: 12px 0 6px;
}

.docs-device-frame__bezel {
  position: relative;
  box-sizing: border-box;
  width: min(100%, 397px);
  padding: 10px;
  background: linear-gradient(145deg, #34363a 0%, #111214 34%, #050506 100%);
  border: 1px solid color-mix(in srgb, #fff 18%, transparent);
  border-radius: 54px;
  box-shadow:
    0 24px 56px rgb(0 0 0 / 28%),
    inset 0 0 0 1px rgb(255 255 255 / 6%);
}

.docs-device-frame__bezel::before {
  position: absolute;
  top: 18px;
  left: 50%;
  z-index: 3;
  width: 96px;
  height: 25px;
  pointer-events: none;
  content: '';
  background: #050506;
  border-radius: 999px;
  transform: translateX(-50%);
}

.docs-device-frame__bezel::after {
  position: absolute;
  bottom: 17px;
  left: 50%;
  z-index: 3;
  width: 112px;
  height: 4px;
  pointer-events: none;
  content: '';
  background: color-mix(in srgb, var(--vp-c-text-1) 58%, transparent);
  border-radius: 999px;
  transform: translateX(-50%);
}

.docs-device-frame__screen {
  position: relative;
  min-height: 667px;
  overflow: hidden;
  color: var(--vp-c-text-1);
  background: var(--varo-demo-phone-screen);
  border-radius: 44px;
}

.docs-device-frame__screen[data-overflow='true'] {
  overflow: visible;
}

.docs-device-frame__content {
  position: relative;
  z-index: 1;
  min-width: 0;
  padding: 52px 16px 38px;
}

@media (max-width: 760px) {
  .docs-device-frame__bezel {
    width: 100%;
  }

  .docs-device-frame__screen {
    min-height: 480px;
  }
}
</style>
