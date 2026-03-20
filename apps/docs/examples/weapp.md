# 小程序示例

## 官方 UI 封装

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VInput } from '@varo/ui-weapp'

const mobile = ref('')
</script>

<template>
  <view class="demo-stack">
    <VInput v-model:value="mobile" placeholder="请输入手机号" />
    <VButton size="lg">提交</VButton>
  </view>
</template>

<style>
.demo-stack {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}
</style>
```

## 接入说明

- 当前小程序侧依赖固定为 `wevu@6.10.2`
- 主题层仍然建议统一接入 `@varo/theme`
- 如果你需要企业内部再封一层，优先从 `@varo/primitives-weapp` 开始