<script setup lang="ts">
type Locale = 'zh' | 'en'
type Category = 'controls' | 'disclosure'

interface CatalogItem {
  id: string
  href: string
  title: string
  parts: string
  summary: string
  category: Category
}

const props = withDefaults(
  defineProps<{
    locale?: Locale
  }>(),
  {
    locale: 'zh'
  }
)

const copy = props.locale === 'en'
  ? {
      controls: 'Controls',
      disclosure: 'Disclosure & Floating',
      parts: 'Parts',
      open: 'Open page'
    }
  : {
      controls: '选择控件',
      disclosure: '展开与浮层',
      parts: 'Parts',
      open: '打开文档'
    }

const items: CatalogItem[] =
  props.locale === 'en'
    ? [
        {
          id: 'checkbox',
          href: '/en/primitives/checkbox',
          title: 'Checkbox',
          parts: 'CheckboxRoot / CheckboxIndicator',
          summary: 'Checked state, disabled behavior, and indicator rendering.',
          category: 'controls'
        },
        {
          id: 'radio-group',
          href: '/en/primitives/radio-group',
          title: 'Radio Group',
          parts: 'RadioGroup / RadioItem / RadioIndicator',
          summary: 'Single-select group value with item-level disabled support.',
          category: 'controls'
        },
        {
          id: 'switch',
          href: '/en/primitives/switch',
          title: 'Switch',
          parts: 'SwitchRoot / SwitchThumb',
          summary: 'Binary toggle with loading and disabled contracts.',
          category: 'controls'
        },
        {
          id: 'tabs',
          href: '/en/primitives/tabs',
          title: 'Tabs',
          parts: 'TabsRoot / TabsList / TabsTrigger / TabsContent',
          summary: 'Tab value ownership, orientation, and panel association.',
          category: 'controls'
        },
        {
          id: 'select',
          href: '/en/primitives/select',
          title: 'Select',
          parts: 'SelectRoot / Trigger / Value / Content / Item',
          summary: 'Composable select state, open contract, and option rendering.',
          category: 'controls'
        },
        {
          id: 'collapsible',
          href: '/en/primitives/collapsible',
          title: 'Collapsible',
          parts: 'CollapsibleRoot / Trigger / Content',
          summary: 'Single disclosure open state for expandable content.',
          category: 'disclosure'
        },
        {
          id: 'accordion',
          href: '/en/primitives/accordion',
          title: 'Accordion',
          parts: 'AccordionRoot / Item / Trigger / Content',
          summary: 'Single or multiple expandable sections with item disable.',
          category: 'disclosure'
        },
        {
          id: 'popover',
          href: '/en/primitives/popover',
          title: 'Popover',
          parts: 'PopoverRoot / Trigger / Content / Close',
          summary: 'Lightweight floating layer open/close and dismiss contract.',
          category: 'disclosure'
        }
      ]
    : [
        {
          id: 'checkbox',
          href: '/primitives/checkbox',
          title: 'Checkbox',
          parts: 'CheckboxRoot / CheckboxIndicator',
          summary: '选中态、禁用态与 indicator 渲染契约。',
          category: 'controls'
        },
        {
          id: 'radio-group',
          href: '/primitives/radio-group',
          title: 'Radio Group',
          parts: 'RadioGroup / RadioItem / RadioIndicator',
          summary: '单选组 value 与选项级 disabled 语义。',
          category: 'controls'
        },
        {
          id: 'switch',
          href: '/primitives/switch',
          title: 'Switch',
          parts: 'SwitchRoot / SwitchThumb',
          summary: '开关态、loading 与 disabled 契约。',
          category: 'controls'
        },
        {
          id: 'tabs',
          href: '/primitives/tabs',
          title: 'Tabs',
          parts: 'TabsRoot / TabsList / TabsTrigger / TabsContent',
          summary: '当前 tab value、orientation 与 panel 关联。',
          category: 'controls'
        },
        {
          id: 'select',
          href: '/primitives/select',
          title: 'Select',
          parts: 'SelectRoot / Trigger / Value / Content / Item',
          summary: '选择器状态、open 契约与选项组合。',
          category: 'controls'
        },
        {
          id: 'collapsible',
          href: '/primitives/collapsible',
          title: 'Collapsible',
          parts: 'CollapsibleRoot / Trigger / Content',
          summary: '单个展开区域的 open 状态契约。',
          category: 'disclosure'
        },
        {
          id: 'accordion',
          href: '/primitives/accordion',
          title: 'Accordion',
          parts: 'AccordionRoot / Item / Trigger / Content',
          summary: 'single/multiple 展开集合与 item disabled。',
          category: 'disclosure'
        },
        {
          id: 'popover',
          href: '/primitives/popover',
          title: 'Popover',
          parts: 'PopoverRoot / Trigger / Content / Close',
          summary: '轻量浮层开关与 dismiss 契约。',
          category: 'disclosure'
        }
      ]

const groups = [
  {
    id: 'controls' as const,
    title: copy.controls,
    items: items.filter((item) => item.category === 'controls')
  },
  {
    id: 'disclosure' as const,
    title: copy.disclosure,
    items: items.filter((item) => item.category === 'disclosure')
  }
]
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
          :href="item.href"
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
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.primitive-catalog__group-head h3 {
  margin: 0;
  font-size: 1rem;
  letter-spacing: -0.02em;
}

.primitive-catalog__group-head span {
  display: inline-flex;
  min-height: 24px;
  align-items: center;
  border: 1px solid var(--varo-demo-border, var(--varo-border));
  border-radius: 999px;
  background: color-mix(in srgb, var(--varo-demo-surface-strong, var(--varo-card-solid)) 92%, transparent);
  color: var(--varo-muted);
  padding: 0 10px;
  font-size: 12px;
  font-weight: 700;
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
  border: 1px solid var(--varo-demo-border, var(--varo-border));
  border-radius: 16px;
  background:
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--varo-demo-surface, var(--varo-card-solid)) 94%, transparent),
      var(--varo-demo-surface-strong, var(--varo-card-solid))
    );
  box-shadow: var(--varo-demo-shadow, var(--varo-shadow-sm));
  color: inherit;
  text-decoration: none;
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
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.primitive-catalog__card-top strong {
  font-size: 0.98rem;
}

.primitive-catalog__card-top span {
  color: var(--varo-demo-brand, var(--varo-primary));
  font-size: 12px;
  font-weight: 700;
}

.primitive-catalog__card p {
  margin: 0;
  color: var(--varo-muted);
  font-size: 13px;
  line-height: 1.5;
}

.primitive-catalog__card small {
  color: var(--varo-foreground);
  font-size: 12px;
  line-height: 1.45;
}

.primitive-catalog__card small em {
  display: block;
  margin-bottom: 2px;
  color: var(--varo-muted);
  font-style: normal;
  font-weight: 700;
}
</style>
