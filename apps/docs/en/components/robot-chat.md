# RobotChat

`VRobotChat` is a Wevu wrapper for the WeChat Conversational Open Platform `chatbotwidget` Mini Program plugin. It supports only the `weapp` target. The wrapper owns plugin initialization, loading and failure states, event forwarding, and an editable `operateCard` abstract-node implementation.

This component bridges the WeChat plugin. For provider-neutral streaming Agent UI, use [Agent Chat](/en/ai/agent-chat).

## Install

```bash
pnpm dlx @varo-ui/cli add --target weapp robot-chat
```

## App configuration

The Registry installer does not modify the application manifest. The Mini Program must be approved to use `chatbotwidget` and declare the plugin under the fixed `varoRobot` alias in `app.json`:

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

`1.1.15` is the version pinned by WeChat's official override example. Before release, set the version approved for the application. Treat the [chatbotwidget plugin documentation](https://mp.weixin.qq.com/wxopen/plugindevdoc?appid=wx8c631f7e9f2465e1) as authoritative for access, versions, and native capabilities.

## Usage

```vue
<script setup lang="ts">
import type { VaroRobotChatOptions } from '@/components/ui/robot-chat'
import { computed } from 'wevu'
import { VRobotChat } from '@/components/ui/robot-chat'

const props = defineProps<{ robotAppId: string }>()

const options = computed<VaroRobotChatOptions>(() => ({
  appid: props.robotAppId,
  history: true,
  welcome: 'Hello. How can I help?'
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

## Customizing `operateCard`

The core constraint behind [Taro #14063](https://github.com/NervJS/taro/issues/14063) is not dynamic prop naming. WeChat abstract nodes require the value of `generic:operateCard` to be a static component alias; data binding is not supported.

`VRobotChat` always compiles:

```html
<wechat-robot-chat generic:operateCard="varo-robot-operate-card" />
```

After installation, edit `src/components/ui/v-robot-operate-card.vue` directly instead of passing a component object to `VRobotChat`. The shipped implementation supports text submission and returning home. Its `focus`, `inputText`, `inputing`, and `height` props are injected by the plugin. See [WeChat Mini Program abstract nodes](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/generics.html) for the native contract.

## VRobotChat-owned API

| Prop          | Type                   | Default            | Description                                  |
| ------------- | ---------------------- | ------------------ | -------------------------------------------- |
| `options`     | `VaroRobotChatOptions` | required           | Passed to plugin `init`; `appid` must be set |
| `className`   | `string`               | `''`               | Merges with the root class                   |
| `ariaLabel`   | `string`               | `'机器人对话'`     | Accessible name for the conversation region  |
| `loadingText` | `string`               | `'正在连接机器人'` | Initialization status text                   |
| `errorText`   | `string`               | `'机器人连接失败'` | Failure status text                          |
| `retryText`   | `string`               | `'重新连接'`       | Retry button text                            |

## Events

| Event           | Description                              |
| --------------- | ---------------------------------------- |
| `ready`         | Plugin initialization succeeded          |
| `error`         | Plugin initialization failed; raw error  |
| `queryCallback` | Forwards the plugin query callback       |
| `backHome`      | Forwards the plugin return-home callback |

`VaroRobotChatOptions` types the common initialization fields shown in WeChat's example and accepts additional plugin fields. For the full initialization options, message types, and event payloads, see the [chatbotwidget plugin documentation](https://mp.weixin.qq.com/wxopen/plugindevdoc?appid=wx8c631f7e9f2465e1).
