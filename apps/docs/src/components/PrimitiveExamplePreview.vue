<script setup lang="ts">
import { ref } from 'vue'
import {
  AccordionContent,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
  CheckboxIndicator,
  CheckboxRoot,
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleTrigger,
  PopoverClose,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
  RadioGroup,
  RadioIndicator,
  RadioItem,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SwitchRoot,
  SwitchThumb,
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger
} from '@varo/primitives-h5'
import type { PrimitiveExampleName } from './primitiveExamples'

const props = defineProps<{ name: PrimitiveExampleName }>()

const checkboxChecked = ref(false)
const radioValue = ref('h5')
const switchChecked = ref(false)
const tabsValue = ref('a')
const selectValue = ref<string | number | undefined>()
const selectOptions = [
  { label: 'Starter', value: 'starter' },
  { label: 'Base Kit', value: 'base-kit' }
]
const collapsibleOpen = ref(false)
const accordionValue = ref<string | string[] | undefined>('one')
const popoverOpen = ref(false)
</script>

<template>
  <div class="primitive-example-preview">
    <CheckboxRoot v-if="name === 'checkbox'" v-model:checked="checkboxChecked" class="pe-chip">
      <CheckboxIndicator class="pe-mark">✓</CheckboxIndicator>
      <span>Enable state</span>
    </CheckboxRoot>

    <RadioGroup v-else-if="name === 'radio-group'" v-model:value="radioValue" class="pe-stack">
      <RadioItem value="h5" class="pe-chip">
        <RadioIndicator class="pe-dot">•</RadioIndicator>
        <span>H5</span>
      </RadioItem>
      <RadioItem value="weapp" class="pe-chip">
        <RadioIndicator class="pe-dot">•</RadioIndicator>
        <span>Weapp</span>
      </RadioItem>
    </RadioGroup>

    <SwitchRoot v-else-if="name === 'switch'" v-model:checked="switchChecked" class="pe-switch" type="button">
      <SwitchThumb class="pe-switch-thumb" />
    </SwitchRoot>

    <TabsRoot v-else-if="name === 'tabs'" v-model:value="tabsValue" class="pe-stack">
      <TabsList class="pe-row">
        <TabsTrigger value="a" class="pe-chip">A</TabsTrigger>
        <TabsTrigger value="b" class="pe-chip">B</TabsTrigger>
      </TabsList>
      <TabsContent value="a" class="pe-panel">Panel A</TabsContent>
      <TabsContent value="b" class="pe-panel">Panel B</TabsContent>
    </TabsRoot>

    <div v-else-if="name === 'select'" class="pe-float">
      <SelectRoot v-model:value="selectValue" :options="selectOptions">
        <SelectTrigger class="pe-chip pe-chip--trigger" type="button">
          <span class="pe-trigger-label">
            <SelectValue placeholder="Pick a layer" />
          </span>
          <span class="pe-caret" aria-hidden="true"></span>
        </SelectTrigger>
        <SelectContent class="pe-menu pe-menu--floating">
          <span class="pe-menu-arrow" aria-hidden="true"></span>
          <SelectItem
            v-for="option in selectOptions"
            :key="String(option.value)"
            :option="option"
            class="pe-item"
            type="button"
          >
            {{ option.label }}
          </SelectItem>
        </SelectContent>
      </SelectRoot>
    </div>

    <CollapsibleRoot v-else-if="name === 'collapsible'" v-model:open="collapsibleOpen" class="pe-stack">
      <CollapsibleTrigger class="pe-chip">Toggle details</CollapsibleTrigger>
      <CollapsibleContent class="pe-panel">Hidden content becomes visible when open.</CollapsibleContent>
    </CollapsibleRoot>

    <AccordionRoot
      v-else-if="name === 'accordion'"
      v-model:value="accordionValue"
      type="single"
      collapsible
      class="pe-stack"
    >
      <AccordionItem value="one" class="pe-panel">
        <AccordionTrigger class="pe-chip">One</AccordionTrigger>
        <AccordionContent>Body one</AccordionContent>
      </AccordionItem>
      <AccordionItem value="two" class="pe-panel">
        <AccordionTrigger class="pe-chip">Two</AccordionTrigger>
        <AccordionContent>Body two</AccordionContent>
      </AccordionItem>
    </AccordionRoot>

    <div v-else-if="name === 'popover'" class="pe-float">
      <PopoverRoot v-model:open="popoverOpen">
        <PopoverTrigger class="pe-chip pe-chip--trigger" type="button">
          <span class="pe-trigger-label">Open</span>
          <span class="pe-caret" aria-hidden="true"></span>
        </PopoverTrigger>
        <PopoverContent class="pe-menu pe-menu--floating">
          <span class="pe-menu-arrow" aria-hidden="true"></span>
          <div class="pe-menu-body">Lightweight floating content</div>
          <PopoverClose class="pe-chip" type="button">Close</PopoverClose>
        </PopoverContent>
      </PopoverRoot>
    </div>
  </div>
</template>

<style scoped>
.primitive-example-preview {
  display: grid;
  gap: 10px;
}

.pe-stack {
  display: grid;
  gap: 8px;
}

.pe-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pe-chip,
.pe-switch,
.pe-item {
  display: inline-flex;
  min-width: 44px;
  min-height: 44px;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--varo-demo-border, var(--varo-border));
  border-radius: 999px;
  background: color-mix(in srgb, var(--varo-demo-surface-strong, var(--varo-card-solid)) 92%, transparent);
  color: var(--varo-foreground);
  padding: 0 12px;
  font-size: 13px;
  font-weight: 650;
  cursor: pointer;
}

.pe-switch {
  width: 58px;
  min-height: 44px;
  justify-content: flex-start;
  padding: 3px;
  border-radius: 999px;
  background: var(--varo-neutral-7);
  transition: background var(--varo-motion-state) var(--varo-ease-out);
}

.pe-switch[data-state='checked'] {
  background: var(--varo-primary);
}

.pe-switch-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--varo-primary-foreground);
  box-shadow: 0 1px 3px color-mix(in srgb, var(--varo-foreground) 24%, transparent);
  transition: transform var(--varo-motion-move) var(--varo-ease-move);
}

.pe-switch[data-state='checked'] .pe-switch-thumb {
  transform: translateX(26px);
}

.pe-mark,
.pe-dot {
  color: var(--varo-primary);
  font-weight: 800;
}

.pe-panel,
.pe-menu {
  padding: 12px;
  border: 1px solid var(--varo-demo-border, var(--varo-border));
  border-radius: 14px;
  background: color-mix(in srgb, var(--varo-demo-surface, var(--varo-card-solid)) 94%, transparent);
}

.pe-menu {
  display: grid;
  gap: 8px;
}

.pe-item {
  justify-content: flex-start;
  width: 100%;
  border-radius: 10px;
}

.pe-float {
  position: relative;
  display: grid;
  width: 100%;
  gap: 8px;
  justify-items: stretch;
}

.pe-chip--trigger {
  display: inline-flex;
  width: 100%;
  min-height: 44px;
  justify-content: space-between;
  gap: 12px;
  padding: 0 14px;
  border-radius: 999px;
}

.pe-trigger-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}

.pe-caret {
  flex: none;
  width: 8px;
  height: 8px;
  margin-left: auto;
  border-right: 1.6px solid currentColor;
  border-bottom: 1.6px solid currentColor;
  opacity: 0.8;
  transform: translateY(-1px) rotate(45deg);
  transition: transform var(--varo-motion-move) var(--varo-ease-move);
}

.pe-chip--trigger[data-state='open'] .pe-caret,
.pe-float:has([data-state='open']) .pe-caret {
  transform: translateY(2px) rotate(225deg);
}

.pe-menu--floating {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  left: 0;
  z-index: 40;
  display: grid;
  gap: 8px;
  width: 100%;
  min-width: 0;
  padding: 14px 12px 12px;
  background: var(--varo-card-solid, #fff);
  border: 1px solid var(--varo-demo-border, var(--varo-border));
  border-radius: 14px;
  box-shadow: var(--varo-shadow-popover);
  opacity: 1;
  scale: 1;
  transform-origin: top right;
  transition:
    opacity var(--varo-motion-enter) var(--varo-ease-out),
    scale var(--varo-motion-enter) var(--varo-ease-out);
}

@starting-style {
  .pe-menu--floating {
    opacity: 0;
    scale: 0.98;
  }
}

.pe-menu-arrow {
  position: absolute;
  top: -6px;
  right: 18px;
  left: auto;
  width: 12px;
  height: 12px;
  border-top: 1px solid var(--varo-demo-border, var(--varo-border));
  border-left: 1px solid var(--varo-demo-border, var(--varo-border));
  border-top-left-radius: 3px;
  background: var(--varo-card-solid, #fff);
  transform: rotate(45deg);
  box-shadow: -2px -2px 6px color-mix(in srgb, var(--varo-foreground) 6%, transparent);
}

.pe-menu-body {
  color: var(--varo-foreground);
  font-size: 13px;
  line-height: 1.5;
}


.pe-chip:focus-visible,
.pe-switch:focus-visible,
.pe-item:focus-visible {
  outline: 2px solid var(--varo-ring);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .pe-switch,
  .pe-switch-thumb,
  .pe-caret,
  .pe-menu--floating {
    transition-duration: 0ms;
  }
}
</style>
