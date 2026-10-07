# RobotChat 微信机器人对话

`VRobotChat` 是 `chatbotwidget` 小程序插件的 Wevu 封装，仅支持 `weapp` target，提供初始化状态、事件转发和可编辑输入区。

## 演示

<RobotChatDemo locale="zh" />

这是本地浏览器交互示意，不是原生 SFC、编译产物预览或已连接的 chatbotwidget 插件。欢迎语、回复、连接状态与 `queryCallback` 计数均由示例本地生成，不表示真实服务连接、网络请求成功或微信对话开放平台回调。插件、权限和业务 AppID 必须在真实微信宿主中另行配置与验证，不能从此示意推断设备支持。

::: warning 小程序配置
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
:::

## 在 playground 中启用

默认不注册插件或两条机器人路由，总览入口禁用；零售页面和 Blocks 无需插件权限。

先为自己的小程序开通 `chatbotwidget`，再从仓库根目录启用：

```bash
WEAPP_ROBOT_CHAT=1 pnpm --filter @varo/playground-weapp build
pnpm --filter @varo/playground-weapp open
```

开发使用 `WEAPP_ROBOT_CHAT=1 pnpm --filter @varo/playground-weapp dev`。去掉环境变量并重新构建即可关闭。

`provider` 是插件提供方 AppID，不能换成自己的小程序 AppID 或 `options.appid`（机器人应用 ID）。自己的 AppID 放在忽略的 `project.local.json` 或 `WEAPP_APP_ID`；测试号登录不授予插件权限。

浏览器用 `pnpm --filter @varo/playground-weapp-preview dev` / `build`，产物独立写入 `dist/browser/mp-weixin`，不覆盖 `devtools/build/mp-weixin`。预览配置无 AppID，不能用于开发者工具登录，也不证明插件授权或真机行为。

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
