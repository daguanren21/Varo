# RobotChat

`VRobotChat` is a Wevu wrapper for the `chatbotwidget` Mini Program plugin. It supports only the `weapp` target and provides initialization states, event forwarding, and an editable input area.

## Install

```bash
pnpm dlx @varo-ui/cli add --target weapp robot-chat
```

## App configuration

Enable the plugin for the Mini Program, then declare it under the fixed `varoRobot` alias in `app.json`:

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

Use the plugin version enabled for the Mini Program. See the [chatbotwidget plugin documentation](https://mp.weixin.qq.com/wxopen/plugindevdoc?appid=wx8c631f7e9f2465e1) for configuration details.

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

## Custom input area

Edit `src/components/ui/v-robot-operate-card.vue` after installation. It provides text submission and return actions; the plugin injects `focus`, `inputText`, `inputing`, and `height`.

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

For other initialization options, message types, and event payloads, see the [chatbotwidget plugin documentation](https://mp.weixin.qq.com/wxopen/plugindevdoc?appid=wx8c631f7e9f2465e1).
