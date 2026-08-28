<script setup lang="ts">
import { withBase } from 'vitepress'
import { computed } from 'vue'

type Locale = 'en' | 'zh'

type LocalizedText = Record<Locale, string>

interface CatalogItem {
  id: string
  name: string
  label: LocalizedText
}

interface CatalogGroup {
  id: string
  title: LocalizedText
  summary: LocalizedText
  items: CatalogItem[]
}

const props = withDefaults(defineProps<{ locale?: Locale }>(), { locale: 'zh' })

const catalog: CatalogGroup[] = [
  {
    id: 'basic',
    title: { zh: '基础组件', en: 'Basic' },
    summary: { zh: '建立页面内容与基础操作。', en: 'Build page content and primary actions.' },
    items: [
      { id: 'button', name: 'Button', label: { zh: '按钮', en: 'Button' } },
      { id: 'cell', name: 'Cell', label: { zh: '单元格', en: 'Cell' } },
      { id: 'image', name: 'Image', label: { zh: '图片', en: 'Image' } },
      { id: 'input', name: 'Input', label: { zh: '输入框', en: 'Input' } },
    ],
  },
  {
    id: 'form',
    title: { zh: '表单与选择', en: 'Forms and Selection' },
    summary: { zh: '覆盖录入、选择、校验与复杂移动端输入。', en: 'Handle entry, selection, validation, and mobile input.' },
    items: [
      { id: 'calendar', name: 'Calendar', label: { zh: '日历', en: 'Calendar' } },
      { id: 'calendar-card', name: 'CalendarCard', label: { zh: '日历卡片', en: 'Calendar Card' } },
      { id: 'cascader', name: 'Cascader', label: { zh: '级联选择器', en: 'Cascader' } },
      { id: 'checkbox', name: 'Checkbox', label: { zh: '复选按钮', en: 'Checkbox' } },
      { id: 'date-picker', name: 'DatePicker', label: { zh: '日期选择器', en: 'Date Picker' } },
      { id: 'form', name: 'Form', label: { zh: '表单', en: 'Form' } },
      { id: 'input-number', name: 'InputNumber', label: { zh: '数字输入框', en: 'Input Number' } },
      { id: 'number-keyboard', name: 'NumberKeyboard', label: { zh: '数字键盘', en: 'Number Keyboard' } },
      { id: 'picker', name: 'Picker', label: { zh: '选择器', en: 'Picker' } },
      { id: 'radio', name: 'Radio', label: { zh: '单选按钮', en: 'Radio' } },
      { id: 'select', name: 'Select', label: { zh: '选择器', en: 'Select' } },
      { id: 'switch', name: 'Switch', label: { zh: '开关', en: 'Switch' } },
      { id: 'range', name: 'Range', label: { zh: '区间选择器', en: 'Range' } },
      { id: 'rate', name: 'Rate', label: { zh: '评分', en: 'Rate' } },
      { id: 'searchbar', name: 'Searchbar', label: { zh: '搜索栏', en: 'Searchbar' } },
      { id: 'short-password', name: 'ShortPassword', label: { zh: '短密码', en: 'Short Password' } },
      { id: 'textarea', name: 'Textarea', label: { zh: '文本域', en: 'Textarea' } },
      { id: 'uploader', name: 'Uploader', label: { zh: '上传', en: 'Uploader' } },
    ],
  },
  {
    id: 'layout',
    title: { zh: '布局组件', en: 'Layout' },
    summary: { zh: '组织页面节奏、间距与吸附关系。', en: 'Structure rhythm, spacing, and sticky regions.' },
    items: [
      { id: 'divider', name: 'Divider', label: { zh: '分割线', en: 'Divider' } },
      { id: 'grid', name: 'Grid', label: { zh: '宫格', en: 'Grid' } },
      { id: 'layout', name: 'Layout', label: { zh: '布局', en: 'Layout' } },
      { id: 'space', name: 'Space', label: { zh: '间距', en: 'Space' } },
      { id: 'sticky', name: 'Sticky', label: { zh: '粘性布局', en: 'Sticky' } },
    ],
  },
  {
    id: 'navigation',
    title: { zh: '导航组件', en: 'Navigation' },
    summary: { zh: '处理页面层级、局部切换与移动端路径。', en: 'Support page hierarchy, local switching, and mobile journeys.' },
    items: [
      { id: 'elevator', name: 'Elevator', label: { zh: '电梯楼层', en: 'Elevator' } },
      { id: 'fixed-nav', name: 'FixedNav', label: { zh: '悬浮导航', en: 'Fixed Navigation' } },
      { id: 'indicator', name: 'Indicator', label: { zh: '指示器', en: 'Indicator' } },
      { id: 'menu', name: 'Menu', label: { zh: '菜单', en: 'Menu' } },
      { id: 'navbar', name: 'Navbar', label: { zh: '头部导航', en: 'Navbar' } },
      { id: 'pagination', name: 'Pagination', label: { zh: '分页', en: 'Pagination' } },
      { id: 'side-navbar', name: 'SideNavbar', label: { zh: '侧边栏导航', en: 'Side Navbar' } },
      { id: 'tabbar', name: 'Tabbar', label: { zh: '标签栏', en: 'Tabbar' } },
      { id: 'tabs', name: 'Tabs', label: { zh: '选项卡', en: 'Tabs' } },
    ],
  },
  {
    id: 'feedback',
    title: { zh: '反馈组件', en: 'Feedback' },
    summary: { zh: '表达进度、遮罩、浮层与轻量结果。', en: 'Communicate progress, overlays, surfaces, and transient results.' },
    items: [
      { id: 'loading', name: 'Loading', label: { zh: '加载', en: 'Loading' } },
      { id: 'overlay', name: 'Overlay', label: { zh: '遮罩层', en: 'Overlay' } },
      { id: 'popup', name: 'Popup', label: { zh: '弹出层', en: 'Popup' } },
      { id: 'toast', name: 'Toast', label: { zh: '轻提示', en: 'Toast' } },
    ],
  },
  {
    id: 'advanced',
    title: { zh: '高级组件', en: 'Advanced' },
    summary: { zh: '组合焦点、遮罩与高风险确认流程。', en: 'Compose focus, overlays, and high-risk confirmation flows.' },
    items: [
      { id: 'dialog', name: 'Dialog', label: { zh: '对话框', en: 'Dialog' } },
    ],
  },
]

const copy = computed(() => props.locale === 'zh'
  ? {
      count: '个组件',
      eyebrow: 'H5 与小程序同页对照',
      open: '查看文档',
      summary: '从任务类型进入组件，再在同一页面检查 H5 与小程序的行为、代码和平台差异。',
    }
  : {
      count: 'components',
      eyebrow: 'H5 and mini-program side by side',
      open: 'Open docs',
      summary: 'Start from the task category, then inspect H5 and mini-program behavior, code, and platform differences on one page.',
    })

const groups = computed(() => catalog.map(group => ({
  ...group,
  summary: group.summary[props.locale],
  title: group.title[props.locale],
  items: group.items.map(item => ({
    ...item,
    href: withBase(`${props.locale === 'en' ? '/en' : ''}/components/${item.id}`),
    label: item.label[props.locale],
  })),
})))

const componentCount = computed(() => catalog.reduce((count, group) => count + group.items.length, 0))
</script>

<template>
  <div class="component-catalog">
    <header class="component-catalog__intro">
      <div>
        <span>{{ copy.eyebrow }}</span>
        <p>{{ copy.summary }}</p>
      </div>
      <strong>{{ componentCount }} {{ copy.count }}</strong>
    </header>

    <div class="component-catalog__groups">
      <section v-for="group in groups" :key="group.id" class="component-catalog__group">
        <header>
          <div>
            <h2>{{ group.title }}</h2>
            <p>{{ group.summary }}</p>
          </div>
          <span>{{ group.items.length }}</span>
        </header>

        <div class="component-catalog__links">
          <a v-for="item in group.items" :key="item.id" :href="item.href">
            <span>
              <strong>{{ item.name }}</strong>
              <small>{{ item.label }}</small>
            </span>
            <em aria-hidden="true">↗</em>
            <span class="component-catalog__sr-only">{{ copy.open }}</span>
          </a>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.component-catalog {
  display: grid;
  gap: 22px;
  margin: 24px 0 40px;
}

.component-catalog__intro {
  display: flex;
  gap: 20px;
  align-items: flex-end;
  justify-content: space-between;
  padding: 18px 20px;
  background: color-mix(in srgb, var(--varo-accent-soft) 56%, var(--varo-card-solid));
  border: 1px solid var(--varo-border);
  border-radius: var(--varo-radius-lg);
}

.component-catalog__intro > div {
  min-width: 0;
}

.component-catalog__intro span {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--varo-accent);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.component-catalog__intro p {
  max-width: 68ch;
  margin: 7px 0 0;
  line-height: 1.65;
  color: var(--varo-muted);
}

.component-catalog__intro strong {
  flex: none;
  font-size: 0.9rem;
  color: var(--varo-foreground);
}

.component-catalog__groups {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.component-catalog__group {
  min-width: 0;
  padding: 18px;
  background: color-mix(in srgb, var(--varo-card) 82%, transparent);
  border: 1px solid var(--varo-border);
  border-radius: var(--varo-radius-lg);
}

.component-catalog__group > header {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.component-catalog__group h2 {
  padding: 0;
  margin: 0;
  font-size: 1.05rem;
  color: var(--varo-foreground);
  letter-spacing: -0.02em;
  border: 0;
}

.component-catalog__group p {
  margin: 5px 0 0;
  font-size: 0.82rem;
  line-height: 1.55;
  color: var(--varo-muted);
}

.component-catalog__group > header > span {
  display: inline-grid;
  place-items: center;
  min-width: 30px;
  height: 26px;
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--varo-muted);
  background: var(--varo-surface-strong);
  border: 1px solid var(--varo-border);
  border-radius: 7px;
}

.component-catalog__links {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px;
}

.component-catalog__links a {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  min-height: 58px;
  padding: 9px 11px;
  color: var(--varo-foreground);
  text-decoration: none;
  background: color-mix(in srgb, var(--varo-surface-strong) 72%, transparent);
  border: 1px solid transparent;
  border-radius: var(--varo-radius);
  transition:
    border-color 160ms ease,
    background 160ms ease,
    color 160ms ease;
}

.component-catalog__links a:hover {
  color: var(--varo-accent);
  background: var(--varo-accent-soft);
  border-color: color-mix(in srgb, var(--varo-accent) 36%, var(--varo-border));
}

.component-catalog__links a:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--varo-accent) 72%, transparent);
  outline-offset: 2px;
}

.component-catalog__links a > span:first-child {
  display: grid;
  min-width: 0;
}

.component-catalog__links strong,
.component-catalog__links small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.component-catalog__links strong {
  font-size: 0.84rem;
  color: inherit;
}

.component-catalog__links small {
  font-size: 0.72rem;
  color: var(--varo-muted);
}

.component-catalog__links em {
  flex: none;
  font-style: normal;
  color: var(--varo-muted);
}

.component-catalog__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  white-space: nowrap;
  border: 0;
  clip-path: inset(50%);
}

@media (max-width: 760px) {
  .component-catalog__groups {
    grid-template-columns: minmax(0, 1fr);
  }

  .component-catalog__intro {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .component-catalog__group {
    padding: 14px;
  }

  .component-catalog__links {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
