# RobotChat 微信机器人对话

`VRobotChat` 是 `chatbotwidget` 小程序插件的 Wevu 封装，仅支持 `weapp` target，提供初始化状态、事件转发和可编辑输入区。

## 安装

```bash
pnpm dlx @varo-ui/cli add --target weapp robot-chat
```

## 前置配置

小程序需先开通插件，并在 `app.json` 中使用固定别名 `varoRobot`：

```json
{
  "plugins": {
    "varoRobot": {
      "version": "1.1.15",
      "provider": "wx8c631f7e9f2465e1"
    }
  }
}
```

版本按小程序后台已启用版本调整。插件配置详见 [chatbotwidget 插件文档](https://mp.weixin.qq.com/wxopen/plugindevdoc?appid=wx8c631f7e9f2465e1)。

## 使用

```vue
<script setup lang="ts">
import type { VaroRobotChatOptions } from '@/components/ui/robot-chat'
import { computed } from 'wevu'
import { VRobotChat } from '@/components/ui/robot-chat'

const props = defineProps<{ robotAppId: string }>()

const options = computed<VaroRobotChatOptions>(() => ({
  appid: props.robotAppId,
  history: true,
  welcome: '你好，请问需要什么帮助？'
}))
</script>

<template>
  <VRobotChat
    :options="options"
    @ready="onReady"
    @error="onError"
    @query-callback="onQuery"
    @back-home="onBackHome"
  />
</template>
```

## 自定义输入区

安装后编辑 `src/components/ui/v-robot-operate-card.vue`。默认提供文字发送和返回操作；`focus`、`inputText`、`inputing`、`height` 由插件注入。

## VRobotChat 自有 API

| Prop          | Type                   | Default            | 说明                              |
| ------------- | ---------------------- | ------------------ | --------------------------------- |
| `options`     | `VaroRobotChatOptions` | 必填               | 传给插件 `init`；`appid` 必须非空 |
| `className`   | `string`               | `''`               | 合并到根节点类名                  |
| `ariaLabel`   | `string`               | `'机器人对话'`     | 会话区域无障碍名称                |
| `loadingText` | `string`               | `'正在连接机器人'` | 初始化提示                        |
| `errorText`   | `string`               | `'机器人连接失败'` | 失败提示                          |
| `retryText`   | `string`               | `'重新连接'`       | 重试按钮文本                      |

## Events

| Event           | 说明                           |
| --------------- | ------------------------------ |
| `ready`         | 插件初始化成功                 |
| `error`         | 插件初始化失败，参数为原始错误 |
| `queryCallback` | 转发插件查询回调               |
| `backHome`      | 转发插件返回首页回调           |

其他初始化参数、消息类型和事件载荷请参考 [chatbotwidget 插件文档](https://mp.weixin.qq.com/wxopen/plugindevdoc?appid=wx8c631f7e9f2465e1)。
