# Popup

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)
</script>

<template>
  <VButton @click="visible = true">打开弹出层</VButton>
  <VPopup v-model:visible="visible" position="bottom" round closeable>
    <div class="popup-body">弹层内容</div>
  </VPopup>
</template>
```

## 弹出位置

```vue
<template>
  <VPopup v-model:visible="visible" position="top" />
  <VPopup v-model:visible="visible" position="bottom" />
  <VPopup v-model:visible="visible" position="left" />
  <VPopup v-model:visible="visible" position="right" />
  <VPopup v-model:visible="visible" position="center" />
</template>
```

## 关闭按钮

```vue
<template>
  <VPopup v-model:visible="visible" closeable close-icon-position="top-right" />
</template>
```

## 跨端演示

<PlatformTabsDemo example="popup" locale="zh" />

## Props

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `visible` | `boolean \| undefined` | `undefined` | 受控显示状态 |
| `defaultVisible` | `boolean` | `false` | 非受控初始显示状态 |
| `disabled` | `boolean \| undefined` | `undefined` | 禁止内部触发显隐变更 |
| `position` | `'center' \| 'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom'` | 弹出位置 |
| `overlay` | `boolean` | `true` | 是否显示遮罩 |
| `closeable` | `boolean` | `false` | 是否显示关闭按钮 |
| `closeIcon` | `string` | `'×'` | 关闭按钮内容 |
| `closeIconPosition` | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` | `'top-right'` | 关闭按钮位置标记 |
| `round` | `boolean` | `false` | 是否开启圆角态 |
| `safeAreaInsetBottom` | `boolean` | `false` | 是否标记底部安全区 |
| `lockScroll` | `boolean` | `false` | 显示时锁定页面滚动 |
| `closeOnClickOverlay` | `boolean` | `true` | 点击遮罩是否关闭 |
| `zIndex` | `number \| string` | `undefined` | 弹层层级 |
| `duration` | `number \| string` | `undefined` | 动画时长，数字按秒处理 |
| `destroyOnClose` | `boolean` | `true` | 关闭时是否销毁内容 |

## Events

| Event | Payload | 描述 |
| --- | --- | --- |
| `update:visible` | `boolean` | 受控同步事件 |
| `visibleChange` | `boolean` | 显隐状态变更 |
| `close` | `void` | 请求关闭 |
| `clickOverlay` | `void` | 点击遮罩 |

## Slots

| Slot | 描述 |
| --- | --- |
| `default` | 弹层主体内容 |
| `closeIcon` | 自定义关闭按钮内容 |

## Primitives

`PopupRoot` 使用 `usePopupRoot` 管理显隐、遮罩点击和 `Escape` 关闭；UI 包只保留 Varo 风格组件入口。
