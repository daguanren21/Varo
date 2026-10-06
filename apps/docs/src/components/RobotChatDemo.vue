<script setup lang="ts">
import { computed, shallowRef } from 'vue'

type Locale = 'en' | 'zh'
interface Message { role: 'assistant' | 'user', text: string }

const props = withDefaults(defineProps<{ locale?: Locale }>(), { locale: 'zh' })

const draft = shallowRef('')
const queryCount = shallowRef(0)
const lastQuery = shallowRef(props.locale === 'en' ? 'No query yet' : '尚未发送')
const status = shallowRef(props.locale === 'en' ? 'Local example ready · no connection' : '本地示例就绪 · 未连接机器人')
const messages = shallowRef<Message[]>([{
  role: 'assistant',
  text: props.locale === 'en' ? 'Hello, how can I help?' : '你好，请问需要什么帮助？',
}])

const copy = computed(() => props.locale === 'en'
  ? {
      eyebrow: 'Local browser illustration',
      title: 'VRobotChat session illustration',
      body: 'This example uses local message state only. It does not load chatbotwidget, connect a robot, or execute the compiled native component.',
      placeholder: 'Ask about an order',
      send: 'Send',
      back: 'Back',
      note: 'Messages and counters are illustrative local state, not native callbacks or platform verification.',
    }
  : {
      eyebrow: '本地浏览器示例',
      title: 'VRobotChat 会话示意',
      body: '这里仅使用本地消息状态，不加载 chatbotwidget、不连接机器人，也不执行编译后的原生组件。',
      placeholder: '请输入问题',
      send: '发送',
      back: '返回',
      note: '消息和计数均为本地交互示意，不是原生回调或平台验证证据。',
    })

const canSend = computed(() => draft.value.trim().length > 0)
const diagnostic = computed(() =>
  `status=${status.value};query=${lastQuery.value};count=${queryCount.value};messages=${messages.value.length}`,
)

function send() {
  const query = draft.value.trim()
  if (!query) { return }
  draft.value = ''
  lastQuery.value = query
  queryCount.value += 1
  status.value = props.locale === 'en'
    ? `Local example message #${queryCount.value}`
    : `本地示例消息 #${queryCount.value}`
  messages.value = [
    ...messages.value,
    { role: 'user', text: query },
    {
      role: 'assistant',
      text: props.locale === 'en'
        ? `Local echo: “${query}”. No request was sent to a robot service.`
        : `本地回显：「${query}」。没有向机器人服务发送请求。`,
    },
  ]
}

function backHome() {
  status.value = props.locale === 'en' ? 'Left the local example' : '已退出本地示例'
}
</script>

<template>
  <section class="robot-demo" :data-locale="props.locale">
    <header>
      <small>{{ copy.eyebrow }}</small>
      <strong>{{ copy.title }}</strong>
      <p>{{ copy.body }}</p>
    </header>

    <div class="robot-demo__surface" role="log" aria-live="polite" data-preview-field="robot-surface">
      <p
        v-for="(message, index) in messages"
        :key="`${message.role}-${index}`"
        class="robot-demo__message"
        :data-role="message.role"
      >
        {{ message.text }}
      </p>
    </div>

    <form class="robot-demo__operate" @submit.prevent="send">
      <input
        v-model="draft"
        :placeholder="copy.placeholder"
        aria-label="对话内容"
      >
      <button type="button" @click="backHome">
        {{ copy.back }}
      </button>
      <button type="submit" :disabled="!canSend">
        {{ copy.send }}
      </button>
    </form>

    <dl data-preview-field="robot-state" :data-preview-value="diagnostic">
      <div>
        <dt>{{ props.locale === 'en' ? 'Status' : '状态' }}</dt>
        <dd data-preview-field="robot-status">
          {{ status }}
        </dd>
      </div>
      <div>
        <dt>{{ props.locale === 'en' ? 'Last query' : '最近查询' }}</dt>
        <dd data-preview-field="robot-last-query">
          {{ lastQuery }}
        </dd>
      </div>
      <div>
        <dt>{{ props.locale === 'en' ? 'Local sends' : '本地发送次数' }}</dt>
        <dd data-preview-field="robot-query-count">
          {{ queryCount }}
        </dd>
      </div>
      <div>
        <dt>{{ props.locale === 'en' ? 'Messages' : '消息数' }}</dt>
        <dd data-preview-field="robot-message-count">
          {{ messages.length }}
        </dd>
      </div>
    </dl>

    <p class="robot-demo__note">
      {{ copy.note }}
    </p>
  </section>
</template>

<style scoped>
.robot-demo {
  display: grid;
  gap: 14px;
  padding: 18px;
  margin: 24px 0 32px;
  color: var(--varo-foreground);
  background: var(--varo-demo-surface);
  border: 1px solid var(--varo-demo-border);
  border-radius: 20px;
}

.robot-demo header {
  display: grid;
  gap: 6px;
}

.robot-demo small {
  font-size: 11px;
  font-weight: 800;
  color: var(--varo-primary);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.robot-demo strong {
  font-size: 18px;
  letter-spacing: -0.03em;
}

.robot-demo p,
.robot-demo dd,
.robot-demo dt {
  margin: 0;
  font-size: 13px;
}

.robot-demo__surface {
  display: grid;
  gap: 8px;
  align-content: start;
  min-height: 240px;
  padding: 12px;
  overflow: auto;
  background: color-mix(in srgb, var(--varo-foreground) 4%, var(--varo-demo-surface));
  border: 1px solid var(--varo-demo-border);
  border-radius: 16px;
}

.robot-demo__message {
  max-width: 86%;
  padding: 8px 12px;
  border-radius: 16px;
}

.robot-demo__message[data-role='assistant'] {
  justify-self: start;
  background: var(--varo-surface);
  border: 1px solid var(--varo-demo-border);
}

.robot-demo__message[data-role='user'] {
  justify-self: end;
  color: #fff;
  background: color-mix(in srgb, var(--varo-foreground) 78%, transparent);
}

.robot-demo__operate {
  display: flex;
  gap: 8px;
  align-items: center;
}

.robot-demo__operate input {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 40px;
  padding: 0 12px;
  font: inherit;
  color: var(--varo-foreground);
  background: var(--varo-surface);
  border: 1px solid var(--varo-demo-border);
  border-radius: 12px;
}

.robot-demo__operate button {
  min-height: 40px;
  padding: 0 12px;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  color: var(--varo-foreground);
  cursor: pointer;
  background: var(--varo-surface);
  border: 1px solid var(--varo-demo-border);
  border-radius: 12px;
}

.robot-demo__operate button[disabled] {
  cursor: not-allowed;
  opacity: 0.5;
}

.robot-demo dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.robot-demo dt,
.robot-demo__note {
  color: var(--varo-muted);
}
</style>
