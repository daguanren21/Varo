# RobotChat 微信机器人对话

`VRobotChat` 是微信对话开放平台 `chatbotwidget` 小程序插件的 Wevu 封装，仅支持 `weapp` target。它负责插件初始化、加载与失败状态、事件转发，并提供一份可直接编辑的 `operateCard` 抽象节点实现。

该组件面向微信插件接入；需要供应商无关的流式 Agent UI 时，请使用 [Agent Chat](/ai/agent-chat)。

## 安装

```bash
pnpm dlx @varo-ui/cli add --target weapp robot-chat
```

## 前置配置

Registry 安装器不会修改应用清单。小程序必须先获得 `chatbotwidget` 插件权限，并在 `app.json` 中使用固定别名 `varoRobot` 声明插件：

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

`1.1.15` 是微信官方复写示例所用版本；发布前应按小程序后台实际获准版本调整。插件申请、版本和原生能力以 [chatbotwidget 插件文档](https://mp.weixin.qq.com/wxopen/plugindevdoc?appid=wx8c631f7e9f2465e1) 为准。

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

## `operateCard` 自定义

[Taro #14063](https://github.com/NervJS/taro/issues/14063) 的核心问题不是动态 prop 命名，而是微信抽象节点要求 `generic:operateCard` 的值必须是静态组件别名，不能使用数据绑定。

`VRobotChat` 已固定生成：

```html
<wechat-robot-chat generic:operateCard="varo-robot-operate-card" />
```

安装后直接编辑 `src/components/ui/v-robot-operate-card.vue` 即可定制输入区，不需要向 `VRobotChat` 传组件对象。这个文件默认实现文字发送和返回首页；其 `focus`、`inputText`、`inputing`、`height` props 由插件注入。详细规则见[微信小程序抽象节点](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/generics.html)。

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

`VaroRobotChatOptions` 只描述官方示例中的常用初始化字段，并允许传入插件新增字段。完整初始化参数、消息类型和事件载荷请参考 [chatbotwidget 插件文档](https://mp.weixin.qq.com/wxopen/plugindevdoc?appid=wx8c631f7e9f2465e1)。
