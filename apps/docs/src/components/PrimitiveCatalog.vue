<script setup lang="ts">
import { withBase } from 'vitepress'

type Locale = 'zh' | 'en'
type Category = 'foundation' | 'controls' | 'content' | 'disclosure' | 'layers'

interface CatalogItemDefinition {
  id: string
  title: string
  parts: string
  summary: Record<Locale, string>
  category: Category
}

const props = withDefaults(
  defineProps<{
    locale?: Locale
  }>(),
  {
    locale: 'zh',
  },
)

const copy = props.locale === 'en'
  ? {
      categories: {
        foundation: 'Foundation',
        controls: 'Selection & Toggle',
        content: 'Content & Layout',
        disclosure: 'Disclosure & Floating',
        layers: 'Layers',
      },
      parts: 'Parts',
      open: 'Open page',
    }
  : {
      categories: {
        foundation: '基础控件',
        controls: '选择与切换',
        content: '内容与布局',
        disclosure: '展开与轻浮层',
        layers: '遮罩与弹层',
      },
      parts: 'Parts',
      open: '打开文档',
    }

const definitions: CatalogItemDefinition[] = [
  {
    id: 'button',
    title: 'Button',
    parts: 'ButtonRoot / usePressableRoot',
    summary: {
      zh: '统一 pressed、disabled、loading 与原生激活语义。',
      en: 'Shared pressed, disabled, loading, and native activation semantics.',
    },
    category: 'foundation',
  },
  {
    id: 'input',
    title: 'Input',
    parts: 'InputRoot / useFieldRoot',
    summary: {
      zh: '文本值、格式化、只读、校验与输入事件基座。',
      en: 'Text value, formatting, readonly, invalid, and input-event foundation.',
    },
    category: 'foundation',
  },
  {
    id: 'number-field',
    title: 'Number Field',
    parts: 'NumberFieldRoot / Decrement / Input / Increment',
    summary: {
      zh: '数值边界、步进、精度与组合式加减控件。',
      en: 'Numeric bounds, step, precision, and composable increment controls.',
    },
    category: 'controls',
  },
  {
    id: 'image',
    title: 'Image',
    parts: 'ImageRoot / useImageRoot',
    summary: {
      zh: '图片加载、失败、占位与尺寸适配状态。',
      en: 'Image loading, failure, placeholder, and sizing state.',
    },
    category: 'content',
  },
  {
    id: 'cell',
    title: 'Cell',
    parts: 'CellGroupRoot / CellRoot',
    summary: {
      zh: '列表行、设置项、链接行与键盘激活契约。',
      en: 'List row, settings item, link row, and keyboard activation contract.',
    },
    category: 'content',
  },
  {
    id: 'sticky',
    title: 'Sticky',
    parts: 'StickyRoot',
    summary: {
      zh: '吸顶状态、偏移量与滚动事件适配。',
      en: 'Sticky state, offset, and runtime-specific scroll events.',
    },
    category: 'content',
  },
  {
    id: 'checkbox',
    title: 'Checkbox',
    parts: 'CheckboxRoot / CheckboxIndicator',
    summary: {
      zh: '选中态、禁用态与 indicator 渲染契约。',
      en: 'Checked state, disabled behavior, and indicator rendering.',
    },
    category: 'controls',
  },
  {
    id: 'radio-group',
    title: 'Radio Group',
    parts: 'RadioGroup / RadioItem / RadioIndicator',
    summary: {
      zh: '单选组 value 与选项级 disabled 语义。',
      en: 'Single-select group value with item-level disabled support.',
    },
    category: 'controls',
  },
  {
    id: 'switch',
    title: 'Switch',
    parts: 'SwitchRoot / SwitchThumb',
    summary: {
      zh: '开关态、loading 与 disabled 契约。',
      en: 'Binary toggle with loading and disabled contracts.',
    },
    category: 'controls',
  },
  {
    id: 'tabs',
    title: 'Tabs',
    parts: 'TabsRoot / TabsList / TabsTrigger / TabsContent',
    summary: {
      zh: '当前 tab value、orientation 与 panel 关联。',
      en: 'Tab value ownership, orientation, and panel association.',
    },
    category: 'controls',
  },
  {
    id: 'select',
    title: 'Select',
    parts: 'SelectRoot / Trigger / Value / Content / Item',
    summary: {
      zh: '选择器状态、open 契约与选项组合。',
      en: 'Composable select state, open contract, and option rendering.',
    },
    category: 'controls',
  },
  {
    id: 'collapsible',
    title: 'Collapsible',
    parts: 'CollapsibleRoot / Trigger / Content',
    summary: {
      zh: '单个展开区域的 open 状态契约。',
      en: 'Single disclosure open state for expandable content.',
    },
    category: 'disclosure',
  },
  {
    id: 'accordion',
    title: 'Accordion',
    parts: 'AccordionRoot / Item / Trigger / Content',
    summary: {
      zh: 'single/multiple 展开集合与 item disabled。',
      en: 'Single or multiple expandable sections with item disable.',
    },
    category: 'disclosure',
  },
  {
    id: 'popover',
    title: 'Popover',
    parts: 'PopoverRoot / Trigger / Content / Close',
    summary: {
      zh: '轻量浮层开关与显式 dismiss 契约。',
      en: 'Lightweight floating layer open/close and explicit dismiss contract.',
    },
    category: 'disclosure',
  },
  {
    id: 'dialog',
    title: 'Dialog',
    parts: 'DialogRoot / Trigger / Overlay / Content / Close',
    summary: {
      zh: '模态打开态、遮罩、内容与退出动作。',
      en: 'Modal open state, overlay, content, and exit actions.',
    },
    category: 'layers',
  },
  {
    id: 'overlay',
    title: 'Overlay',
    parts: 'OverlayRoot',
    summary: {
      zh: '遮罩可见态、点击关闭与滚动锁定。',
      en: 'Overlay visibility, click dismiss, and scroll locking.',
    },
    category: 'layers',
  },
  {
    id: 'popup',
    title: 'Popup',
    parts: 'PopupRoot',
    summary: {
      zh: '带定位、遮罩、安全区与关闭行为的弹出层。',
      en: 'Positioned popup with overlay, safe area, and close behavior.',
    },
    category: 'layers',
  },
]

const routePrefix = props.locale === 'en' ? '/en' : ''
const groups = (['foundation', 'controls', 'content', 'disclosure', 'layers'] as const).map(id => ({
  id,
  title: copy.categories[id],
  items: definitions
    .filter(item => item.category === id)
    .map(item => ({
      ...item,
      href: `${routePrefix}/primitives/${item.id}`,
      summary: item.summary[props.locale],
    })),
}))
</script>

<template>
  <div class="primitive-catalog">
    <section v-for="group in groups" :key="group.id" class="primitive-catalog__group">
      <header class="primitive-catalog__group-head">
        <h3>{{ group.title }}</h3>
        <span>{{ group.items.length }}</span>
      </header>
      <div class="primitive-catalog__grid">
        <a
          v-for="item in group.items"
          :key="item.id"
          class="primitive-catalog__card"
          :href="withBase(item.href)"
        >
          <div class="primitive-catalog__card-top">
            <strong>{{ item.title }}</strong>
            <span>{{ copy.open }}</span>
          </div>
          <p>{{ item.summary }}</p>
          <small>
            <em>{{ copy.parts }}</em>
            {{ item.parts }}
          </small>
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped>
.primitive-catalog {
  display: grid;
  gap: 18px;
  margin: 18px 0 28px;
}

.primitive-catalog__group {
  display: grid;
  gap: 12px;
}

.primitive-catalog__group-head {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.primitive-catalog__group-head h3 {
  margin: 0;
  font-size: 1rem;
  letter-spacing: -0.02em;
}

.primitive-catalog__group-head span {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 700;
  color: var(--varo-muted);
  background: color-mix(in srgb, var(--varo-demo-surface-strong, var(--varo-card-solid)) 92%, transparent);
  border: 1px solid var(--varo-demo-border, var(--varo-border));
  border-radius: 999px;
}

.primitive-catalog__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.primitive-catalog__card {
  display: grid;
  gap: 10px;
  min-height: 132px;
  padding: 14px;
  color: inherit;
  text-decoration: none;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--varo-demo-surface, var(--varo-card-solid)) 94%, transparent),
    var(--varo-demo-surface-strong, var(--varo-card-solid))
  );
  border: 1px solid var(--varo-demo-border, var(--varo-border));
  border-radius: 16px;
  box-shadow: var(--varo-demo-shadow, var(--varo-shadow-sm));
  transition:
    border-color 160ms ease,
    transform 160ms ease,
    box-shadow 160ms ease;
}

.primitive-catalog__card:hover {
  border-color: color-mix(in srgb, var(--varo-primary) 42%, var(--varo-demo-border, var(--varo-border)));
  box-shadow: 0 12px 28px color-mix(in srgb, var(--varo-primary) 12%, transparent);
  transform: translateY(-1px);
}

.primitive-catalog__card:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--varo-primary) 70%, transparent);
  outline-offset: 2px;
}

.primitive-catalog__card-top {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
}

.primitive-catalog__card-top strong {
  font-size: 0.98rem;
}

.primitive-catalog__card-top span {
  font-size: 12px;
  font-weight: 700;
  color: var(--varo-demo-brand, var(--varo-primary));
}

.primitive-catalog__card p {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--varo-muted);
}

.primitive-catalog__card small {
  font-size: 12px;
  line-height: 1.45;
  color: var(--varo-foreground);
}

.primitive-catalog__card small em {
  display: block;
  margin-bottom: 2px;
  font-style: normal;
  font-weight: 700;
  color: var(--varo-muted);
}
</style>
