<script setup lang="ts">
import { computed, shallowRef } from 'vue'

type Locale = 'en' | 'zh'
interface Message { role: 'assistant' | 'user', text: string }

const props = withDefaults(defineProps<{ locale?: Locale }>(), { locale: 'zh' })

const draft = shallowRef('')
const queryCount = shallowRef(0)
const lastQuery = shallowRef(props.locale === 'en' ? 'No query yet' : '尚未发送')
const status = shallowRef(props.locale === 'en' ? 'Robot connected' : '机器人已连接')
const messages = shallowRef<Message[]>([{
  role: 'assistant',
  text: props.locale === 'en' ? 'Hello, how can I help?' : '你好，请问需要什么帮助？',
}])

const copy = computed(() => props.locale === 'en'
  ? {
      eyebrow: 'Weapp-only plugin host',
      title: 'VRobotChat observable preview',
      body: 'Docs cannot load chatbotwidget. This surface shows the same session: welcome, operateCard, send, and queryCallback.',
      placeholder: 'Ask about an order',
      send: 'Send',
      back: 'Back',
      note: 'This is the docs/Web Preview host, not WeChat Dialog Open Platform.',
    }
  : {
      eyebrow: '仅 weapp 的插件宿主',
      title: 'VRobotChat 可观察预览',
      body: '文档站不能加载 chatbotwidget。这里画出同一套会话面：欢迎语、operateCard、发送和 queryCallback。',
      placeholder: '请输入问题',
      send: '发送',
      back: '返回',
      note: '这是文档/Web Preview 的可见宿主，不是微信对话开放平台。',
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
    ? `queryCallback #${queryCount.value}`
    : `已收到查询回调 #${queryCount.value}`
  messages.value = [
    ...messages.value,
    { role: 'user', text: query },
    {
      role: 'assistant',
      text: props.locale === 'en'
        ? `Received “${query}”. This is the docs host for chatbotwidget, not WeChat Dialog Open Platform.`
        : `已收到「${query}」。这是文档对 chatbotwidget 会话面的可见宿主，不是微信对话开放平台。`,
    },
  ]
}

function backHome() {
  status.value = props.locale === 'en' ? 'Left the robot session' : '已退出机器人会话'
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
        <dt>queryCallback</dt>
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
