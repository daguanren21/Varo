<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'

type Locale = 'zh' | 'en'
type Target = 'h5' | 'weapp-vite'

interface BlockDefinition {
  dependencies: string[]
  description: Record<Locale, string>
  id: string
  title: Record<Locale, string>
  useCase: Record<Locale, string>
}

const { locale = 'zh' } = defineProps<{
  locale?: Locale
}>()

const blocks: BlockDefinition[] = [
  {
    id: 'login-form',
    title: { zh: '登录表单', en: 'Login Form' },
    description: { zh: '手机号、密码、记住状态、错误与加载反馈。', en: 'Phone, password, remember, error, and loading states.' },
    useCase: { zh: '账户登录与找回密码入口', en: 'Account sign-in and recovery entry' },
    dependencies: ['button', 'input', 'switch'],
  },
  {
    id: 'profile-card',
    title: { zh: '用户资料卡', en: 'Profile Card' },
    description: { zh: '头像、身份状态、统计信息与编辑动作。', en: 'Avatar, identity status, statistics, and edit action.' },
    useCase: { zh: '个人中心与会员主页', en: 'Account centers and membership pages' },
    dependencies: ['avatar', 'badge', 'button'],
  },
  {
    id: 'profile-edit',
    title: { zh: '资料编辑', en: 'Profile Edit' },
    description: { zh: '姓名、手机号、城市搜索、简介与提交状态。', en: 'Name, phone, searchable city, biography, and submit state.' },
    useCase: { zh: '账户资料维护', en: 'Account profile maintenance' },
    dependencies: ['button', 'input', 'select'],
  },
  {
    id: 'product-list',
    title: { zh: '商品列表', en: 'Product List' },
    description: { zh: '商品、库存、价格、空状态、选择与加购动作。', en: 'Products, inventory, pricing, empty state, selection, and cart actions.' },
    useCase: { zh: '商城推荐、搜索结果与分类页', en: 'Recommendations, search results, and category pages' },
    dependencies: ['badge', 'button', 'empty', 'image'],
  },
  {
    id: 'order-filter',
    title: { zh: '订单筛选', en: 'Order Filter' },
    description: { zh: '多状态选择、金额区间校验、重置与应用事件。', en: 'Multi-status selection, amount validation, reset, and apply events.' },
    useCase: { zh: '订单列表与售后记录筛选', en: 'Order and after-sales record filtering' },
    dependencies: ['button', 'checkbox', 'input-number', 'tag'],
  },
  {
    id: 'agent-chat',
    title: { zh: 'Agent 对话', en: 'Agent Chat' },
    description: { zh: '增量 Markdown、推理、工具、审批与输入组合。', en: 'Incremental Markdown, reasoning, tools, approval, and composer.' },
    useCase: { zh: 'AI 助手、导购与执行型 Agent', en: 'AI assistants, shopping agents, and action agents' },
    dependencies: ['agent-ui', '@varo-ui/ai'],
  },
]

const selectedId = shallowRef(blocks[0].id)
const target = shallowRef<Target>('weapp-vite')
const copied = shallowRef(false)
const selected = computed(() => blocks.find(block => block.id === selectedId.value) ?? blocks[0])
const command = computed(() => `pnpm dlx @varo-ui/cli add --target ${target.value} blocks/${selected.value.id}`)
const filePath = computed(() => `src/components/blocks/${selected.value.id}.vue`)
const usage = computed(() => {
  const componentName = selected.value.id
    .split('-')
    .map(part => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join('')

  return `<script setup lang="ts">\nimport ${componentName} from '@/components/blocks/${selected.value.id}.vue'\n\nfunction handleAction(payload: unknown) {\n  console.log(payload)\n}\n<\/script>\n\n<template>\n  <${componentName} @submit="handleAction" @apply="handleAction" />\n</template>`
})

watch([selectedId, target], () => {
  copied.value = false
})

async function copyCommand() {
  await navigator.clipboard?.writeText(command.value)
  copied.value = true
  window.setTimeout(() => {
    copied.value = false
  }, 1200)
}
</script>

<template>
  <section class="varo-real-blocks" :aria-label="locale === 'zh' ? '可安装 Blocks' : 'Installable Blocks'">
    <header class="varo-real-blocks__header">
      <div>
        <p class="varo-real-blocks__eyebrow">
          REGISTRY BLOCKS
        </p>
        <h2>{{ locale === 'zh' ? '六个真实、双端、可安装的页面切片' : 'Six real, dual-target, installable page slices' }}</h2>
        <p>{{ locale === 'zh' ? '目录、依赖、命令和代码均来自当前 registry，不再展示不存在的组件。' : 'Catalog, dependencies, commands, and code all match the current registry.' }}</p>
      </div>
      <div class="varo-real-blocks__targets" role="tablist" :aria-label="locale === 'zh' ? '运行目标' : 'Runtime target'">
        <button v-for="item in (['weapp-vite', 'h5'] as Target[])" :key="item" type="button" role="tab" :aria-selected="target === item" @click="target = item">
          {{ item }}
        </button>
      </div>
    </header>

    <div class="varo-real-blocks__workspace">
      <nav class="varo-real-blocks__catalog" :aria-label="locale === 'zh' ? 'Blocks 目录' : 'Blocks catalog'">
        <button v-for="block in blocks" :key="block.id" type="button" :data-active="String(selectedId === block.id)" @click="selectedId = block.id">
          <span>{{ block.title[locale] }}</span>
          <small>{{ block.description[locale] }}</small>
        </button>
      </nav>

      <article class="varo-real-blocks__detail">
        <div class="varo-real-blocks__detail-head">
          <div>
            <p>{{ selected.id }}</p>
            <h3>{{ selected.title[locale] }}</h3>
            <span>{{ selected.useCase[locale] }}</span>
          </div>
          <strong>{{ target }}</strong>
        </div>

        <div class="varo-real-blocks__contract">
          <div>
            <span>{{ locale === 'zh' ? '安装文件' : 'Installed file' }}</span>
            <code>{{ filePath }}</code>
          </div>
          <div>
            <span>{{ locale === 'zh' ? '递归依赖' : 'Recursive dependencies' }}</span>
            <p><code v-for="dependency in selected.dependencies" :key="dependency">{{ dependency }}</code></p>
          </div>
        </div>

        <div class="varo-real-blocks__command">
          <code>{{ command }}</code>
          <button type="button" @click="copyCommand">
            {{ copied ? (locale === 'zh' ? '已复制' : 'Copied') : (locale === 'zh' ? '复制命令' : 'Copy command') }}
          </button>
        </div>

        <pre><code>{{ usage }}</code></pre>
      </article>
    </div>
  </section>
</template>

<style scoped>
.varo-real-blocks {
  display: grid;
  gap: 18px;
  margin: 28px 0;
  color: var(--varo-foreground);
}

.varo-real-blocks__header {
  display: flex;
  gap: 20px;
  align-items: end;
  justify-content: space-between;
}

.varo-real-blocks__eyebrow,
.varo-real-blocks__detail-head p {
  margin: 0 0 6px;
  font-size: 11px;
  font-weight: 800;
  color: var(--varo-accent);
  letter-spacing: 0.14em;
}

.varo-real-blocks__header h2,
.varo-real-blocks__detail-head h3 {
  margin: 0;
  letter-spacing: -0.025em;
}

.varo-real-blocks__header > div > p:last-child {
  max-width: 62ch;
  margin: 8px 0 0;
  line-height: 1.65;
  color: var(--varo-muted);
}

.varo-real-blocks__targets {
  display: inline-flex;
  flex: none;
  gap: 4px;
  padding: 4px;
  background: var(--varo-surface);
  border: 1px solid var(--varo-border);
  border-radius: 10px;
}

.varo-real-blocks__targets button {
  min-height: 34px;
  padding: 0 11px;
  font-weight: 700;
  color: var(--varo-muted);
  background: transparent;
  border: 0;
  border-radius: 7px;
}

.varo-real-blocks__targets button[aria-selected='true'] {
  color: var(--varo-accent);
  background: var(--varo-accent-soft);
}

.varo-real-blocks__workspace {
  display: grid;
  grid-template-columns: minmax(210px, 0.72fr) minmax(0, 1.7fr);
  overflow: hidden;
  background: var(--varo-surface);
  border: 1px solid var(--varo-border);
  border-radius: var(--varo-radius-lg);
}

.varo-real-blocks__catalog {
  display: grid;
  align-content: start;
  background: color-mix(in srgb, var(--varo-surface) 82%, var(--varo-bg));
  border-right: 1px solid var(--varo-border);
}

.varo-real-blocks__catalog button {
  display: grid;
  gap: 4px;
  padding: 14px 16px;
  color: inherit;
  text-align: left;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--varo-border);
}

.varo-real-blocks__catalog button[data-active='true'] {
  background: var(--varo-accent-soft);
  box-shadow: inset 3px 0 var(--varo-accent);
}

.varo-real-blocks__catalog span {
  font-weight: 750;
}

.varo-real-blocks__catalog small {
  line-height: 1.45;
  color: var(--varo-muted);
}

.varo-real-blocks__detail {
  display: grid;
  gap: 16px;
  min-width: 0;
  padding: 18px;
}

.varo-real-blocks__detail-head {
  display: flex;
  gap: 16px;
  align-items: start;
  justify-content: space-between;
}

.varo-real-blocks__detail-head span {
  display: block;
  margin-top: 5px;
  font-size: 13px;
  color: var(--varo-muted);
}

.varo-real-blocks__detail-head strong {
  padding: 4px 8px;
  font-size: 11px;
  color: var(--varo-accent);
  border: 1px solid var(--varo-border);
  border-radius: 999px;
}

.varo-real-blocks__contract {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.varo-real-blocks__contract > div {
  display: grid;
  gap: 7px;
  padding: 12px;
  background: var(--varo-bg);
  border: 1px solid var(--varo-border);
  border-radius: 10px;
}

.varo-real-blocks__contract span {
  font-size: 11px;
  font-weight: 700;
  color: var(--varo-muted);
}

.varo-real-blocks__contract p {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin: 0;
}

.varo-real-blocks__contract code {
  font-size: 11px;
}

.varo-real-blocks__command {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: var(--varo-bg);
  border: 1px solid var(--varo-border);
  border-radius: 10px;
}

.varo-real-blocks__command code {
  min-width: 0;
  overflow: auto;
  white-space: nowrap;
}

.varo-real-blocks__command button {
  flex: none;
  min-height: 34px;
  padding: 0 11px;
  font-weight: 700;
  color: #fff;
  background: var(--varo-accent);
  border: 0;
  border-radius: 8px;
}

.varo-real-blocks pre {
  max-height: 330px;
  margin: 0;
  overflow: auto;
}

@media (max-width: 760px) {
  .varo-real-blocks__header {
    flex-direction: column;
    align-items: stretch;
  }

  .varo-real-blocks__targets {
    width: fit-content;
  }

  .varo-real-blocks__workspace {
    grid-template-columns: 1fr;
  }

  .varo-real-blocks__catalog {
    grid-auto-columns: minmax(170px, 1fr);
    grid-auto-flow: column;
    overflow-x: auto;
    border-right: 0;
    border-bottom: 1px solid var(--varo-border);
  }

  .varo-real-blocks__contract {
    grid-template-columns: 1fr;
  }
}
</style>
