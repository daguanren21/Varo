export type Locale = 'zh' | 'en'
export type PrimitiveExampleName =
  | 'checkbox'
  | 'radio-group'
  | 'switch'
  | 'tabs'
  | 'select'
  | 'collapsible'
  | 'accordion'
  | 'popover'

export interface PrimitiveExampleData {
  h5Code: string
  weappCode: string
  contractRows: Array<{ label: string; value: string }>
}

const checkbox = {
  h5: `<script setup lang="ts">
import { ref } from 'vue'
import { CheckboxRoot, CheckboxIndicator } from '@varo/primitives-h5'

const checked = ref(false)
</script>

<template>
  <CheckboxRoot v-model:checked="checked">
    <CheckboxIndicator>✓</CheckboxIndicator>
    Enable state
  </CheckboxRoot>
</template>`,
  weapp: `<script setup lang="ts">
import { ref } from 'vue'
import { CheckboxRoot, CheckboxIndicator } from '@varo/primitives-weapp'

const checked = ref(false)
</script>

<template>
  <CheckboxRoot v-model:checked="checked">
    <CheckboxIndicator>✓</CheckboxIndicator>
    Enable state
  </CheckboxRoot>
</template>`
}

const radio = {
  h5: `<script setup lang="ts">
import { ref } from 'vue'
import { RadioGroup, RadioItem, RadioIndicator } from '@varo/primitives-h5'

const value = ref('h5')
</script>

<template>
  <RadioGroup v-model:value="value">
    <RadioItem value="h5"><RadioIndicator>•</RadioIndicator>H5</RadioItem>
    <RadioItem value="weapp"><RadioIndicator>•</RadioIndicator>Weapp</RadioItem>
  </RadioGroup>
</template>`,
  weapp: `<script setup lang="ts">
import { ref } from 'vue'
import { RadioGroup, RadioItem, RadioIndicator } from '@varo/primitives-weapp'

const value = ref('h5')
</script>

<template>
  <RadioGroup v-model:value="value">
    <RadioItem value="h5"><RadioIndicator>•</RadioIndicator>H5</RadioItem>
    <RadioItem value="weapp"><RadioIndicator>•</RadioIndicator>Weapp</RadioItem>
  </RadioGroup>
</template>`
}

const switchExample = {
  h5: `<script setup lang="ts">
import { ref } from 'vue'
import { SwitchRoot, SwitchThumb } from '@varo/primitives-h5'

const on = ref(false)
</script>

<template>
  <SwitchRoot v-model:checked="on">
    <SwitchThumb />
  </SwitchRoot>
</template>`,
  weapp: `<script setup lang="ts">
import { ref } from 'vue'
import { SwitchRoot, SwitchThumb } from '@varo/primitives-weapp'

const on = ref(false)
</script>

<template>
  <SwitchRoot v-model:checked="on">
    <SwitchThumb />
  </SwitchRoot>
</template>`
}

const tabs = {
  h5: `<script setup lang="ts">
import { ref } from 'vue'
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from '@varo/primitives-h5'

const tab = ref('a')
</script>

<template>
  <TabsRoot v-model:value="tab">
    <TabsList>
      <TabsTrigger value="a">A</TabsTrigger>
      <TabsTrigger value="b">B</TabsTrigger>
    </TabsList>
    <TabsContent value="a">Panel A</TabsContent>
    <TabsContent value="b">Panel B</TabsContent>
  </TabsRoot>
</template>`,
  weapp: `<script setup lang="ts">
import { ref } from 'vue'
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from '@varo/primitives-weapp'

const tab = ref('a')
</script>

<template>
  <TabsRoot v-model:value="tab">
    <TabsList>
      <TabsTrigger value="a">A</TabsTrigger>
      <TabsTrigger value="b">B</TabsTrigger>
    </TabsList>
    <TabsContent value="a">Panel A</TabsContent>
    <TabsContent value="b">Panel B</TabsContent>
  </TabsRoot>
</template>`
}

const select = {
  h5: `<script setup lang="ts">
import { ref } from 'vue'
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@varo/primitives-h5'

const value = ref()
const options = [
  { label: 'Starter', value: 'starter' },
  { label: 'Base Kit', value: 'base-kit' }
]
</script>

<template>
  <SelectRoot v-model:value="value" :options="options">
    <SelectTrigger>
      <SelectValue placeholder="Pick a layer" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem v-for="option in options" :key="option.value" :option="option">
        {{ option.label }}
      </SelectItem>
    </SelectContent>
  </SelectRoot>
</template>`,
  weapp: `<script setup lang="ts">
import { ref } from 'vue'
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@varo/primitives-weapp'

const value = ref()
const options = [
  { label: 'Starter', value: 'starter' },
  { label: 'Base Kit', value: 'base-kit' }
]
</script>

<template>
  <SelectRoot v-model:value="value" :options="options">
    <SelectTrigger>
      <SelectValue placeholder="Pick a layer" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem v-for="option in options" :key="option.value" :option="option">
        {{ option.label }}
      </SelectItem>
    </SelectContent>
  </SelectRoot>
</template>`
}

const collapsible = {
  h5: `<script setup lang="ts">
import { ref } from 'vue'
import {
  CollapsibleRoot,
  CollapsibleTrigger,
  CollapsibleContent
} from '@varo/primitives-h5'

const open = ref(false)
</script>

<template>
  <CollapsibleRoot v-model:open="open">
    <CollapsibleTrigger>Toggle details</CollapsibleTrigger>
    <CollapsibleContent>Hidden content becomes visible when open.</CollapsibleContent>
  </CollapsibleRoot>
</template>`,
  weapp: `<script setup lang="ts">
import { ref } from 'vue'
import {
  CollapsibleRoot,
  CollapsibleTrigger,
  CollapsibleContent
} from '@varo/primitives-weapp'

const open = ref(false)
</script>

<template>
  <CollapsibleRoot v-model:open="open">
    <CollapsibleTrigger>Toggle details</CollapsibleTrigger>
    <CollapsibleContent>Hidden content becomes visible when open.</CollapsibleContent>
  </CollapsibleRoot>
</template>`
}

const accordion = {
  h5: `<script setup lang="ts">
import { ref } from 'vue'
import {
  AccordionRoot,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from '@varo/primitives-h5'

const value = ref('one')
</script>

<template>
  <AccordionRoot v-model:value="value" type="single" collapsible>
    <AccordionItem value="one">
      <AccordionTrigger>One</AccordionTrigger>
      <AccordionContent>Body one</AccordionContent>
    </AccordionItem>
    <AccordionItem value="two">
      <AccordionTrigger>Two</AccordionTrigger>
      <AccordionContent>Body two</AccordionContent>
    </AccordionItem>
  </AccordionRoot>
</template>`,
  weapp: `<script setup lang="ts">
import { ref } from 'vue'
import {
  AccordionRoot,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from '@varo/primitives-weapp'

const value = ref('one')
</script>

<template>
  <AccordionRoot v-model:value="value" type="single" collapsible>
    <AccordionItem value="one">
      <AccordionTrigger>One</AccordionTrigger>
      <AccordionContent>Body one</AccordionContent>
    </AccordionItem>
    <AccordionItem value="two">
      <AccordionTrigger>Two</AccordionTrigger>
      <AccordionContent>Body two</AccordionContent>
    </AccordionItem>
  </AccordionRoot>
</template>`
}

const popover = {
  h5: `<script setup lang="ts">
import { ref } from 'vue'
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
  PopoverClose
} from '@varo/primitives-h5'

const open = ref(false)
</script>

<template>
  <PopoverRoot v-model:open="open">
    <PopoverTrigger>Open</PopoverTrigger>
    <PopoverContent>
      Lightweight floating content
      <PopoverClose>Close</PopoverClose>
    </PopoverContent>
  </PopoverRoot>
</template>`,
  weapp: `<script setup lang="ts">
import { ref } from 'vue'
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
  PopoverClose
} from '@varo/primitives-weapp'

const open = ref(false)
</script>

<template>
  <PopoverRoot v-model:open="open">
    <PopoverTrigger>Open</PopoverTrigger>
    <PopoverContent>
      Lightweight floating content
      <PopoverClose>Close</PopoverClose>
    </PopoverContent>
  </PopoverRoot>
</template>`
}

const catalog: Record<PrimitiveExampleName, { h5: string; weapp: string }> = {
  checkbox,
  'radio-group': radio,
  switch: switchExample,
  tabs,
  select,
  collapsible,
  accordion,
  popover
}

const contractsZh: Record<PrimitiveExampleName, Array<{ label: string; value: string }>> = {
  checkbox: [
    { label: '状态', value: 'checked / disabled' },
    { label: '事件', value: 'update:checked, checkedChange' },
    { label: 'Parts', value: 'CheckboxRoot, CheckboxIndicator' },
    { label: '差异', value: '不模拟浏览器焦点环' }
  ],
  'radio-group': [
    { label: '状态', value: 'value / disabled' },
    { label: '事件', value: 'update:value, valueChange' },
    { label: 'Parts', value: 'RadioGroup, RadioItem, RadioIndicator' },
    { label: '差异', value: '选项焦点由页面容器处理' }
  ],
  switch: [
    { label: '状态', value: 'checked / disabled / loading' },
    { label: '事件', value: 'update:checked, checkedChange' },
    { label: 'Parts', value: 'SwitchRoot, SwitchThumb' },
    { label: '差异', value: 'loading 时保持不可切换' }
  ],
  tabs: [
    { label: '状态', value: 'value / orientation / disabled' },
    { label: '事件', value: 'update:value, valueChange' },
    { label: 'Parts', value: 'TabsRoot, TabsList, TabsTrigger, TabsContent' },
    { label: '差异', value: 'H5 支持方向键；小程序保留 ARIA 与 value 关联' }
  ],
  select: [
    { label: '状态', value: 'value / open / disabled / readonly' },
    { label: '事件', value: 'update:value, valueChange, update:open, openChange' },
    { label: 'Parts', value: 'SelectRoot, Trigger, Value, Content, Item' },
    { label: '差异', value: '浮层定位由 UI wrapper 负责' }
  ],
  collapsible: [
    { label: '状态', value: 'open / disabled' },
    { label: '事件', value: 'update:open, openChange' },
    { label: 'Parts', value: 'CollapsibleRoot, Trigger, Content' },
    { label: '差异', value: '动画与高度过渡留给 UI 层' }
  ],
  accordion: [
    { label: '状态', value: 'value / type / collapsible / disabled' },
    { label: '事件', value: 'update:value, valueChange' },
    { label: 'Parts', value: 'AccordionRoot, Item, Trigger, Content' },
    { label: '差异', value: 'item value 必须唯一' }
  ],
  popover: [
    { label: '状态', value: 'open / disabled' },
    { label: '事件', value: 'update:open, openChange' },
    { label: 'Parts', value: 'PopoverRoot, Trigger, Content, Close' },
    { label: '差异', value: '小程序用显式 Close/遮罩 dismiss，不依赖 document' }
  ]
}

const contractsEn: Record<PrimitiveExampleName, Array<{ label: string; value: string }>> = {
  checkbox: [
    { label: 'State', value: 'checked / disabled' },
    { label: 'Events', value: 'update:checked, checkedChange' },
    { label: 'Parts', value: 'CheckboxRoot, CheckboxIndicator' },
    { label: 'Difference', value: 'No browser focus-ring simulation' }
  ],
  'radio-group': [
    { label: 'State', value: 'value / disabled' },
    { label: 'Events', value: 'update:value, valueChange' },
    { label: 'Parts', value: 'RadioGroup, RadioItem, RadioIndicator' },
    { label: 'Difference', value: 'Option focus stays page-owned' }
  ],
  switch: [
    { label: 'State', value: 'checked / disabled / loading' },
    { label: 'Events', value: 'update:checked, checkedChange' },
    { label: 'Parts', value: 'SwitchRoot, SwitchThumb' },
    { label: 'Difference', value: 'Loading keeps the control non-toggleable' }
  ],
  tabs: [
    { label: 'State', value: 'value / orientation / disabled' },
    { label: 'Events', value: 'update:value, valueChange' },
    { label: 'Parts', value: 'TabsRoot, TabsList, TabsTrigger, TabsContent' },
    { label: 'Difference', value: 'H5 arrow keys; Weapp keeps ARIA and value association' }
  ],
  select: [
    { label: 'State', value: 'value / open / disabled / readonly' },
    { label: 'Events', value: 'update:value, valueChange, update:open, openChange' },
    { label: 'Parts', value: 'SelectRoot, Trigger, Value, Content, Item' },
    { label: 'Difference', value: 'Floating placement belongs to UI wrappers' }
  ],
  collapsible: [
    { label: 'State', value: 'open / disabled' },
    { label: 'Events', value: 'update:open, openChange' },
    { label: 'Parts', value: 'CollapsibleRoot, Trigger, Content' },
    { label: 'Difference', value: 'Height animation stays in the UI layer' }
  ],
  accordion: [
    { label: 'State', value: 'value / type / collapsible / disabled' },
    { label: 'Events', value: 'update:value, valueChange' },
    { label: 'Parts', value: 'AccordionRoot, Item, Trigger, Content' },
    { label: 'Difference', value: 'Item values must stay unique' }
  ],
  popover: [
    { label: 'State', value: 'open / disabled' },
    { label: 'Events', value: 'update:open, openChange' },
    { label: 'Parts', value: 'PopoverRoot, Trigger, Content, Close' },
    { label: 'Difference', value: 'Weapp dismiss uses explicit Close/mask, not document events' }
  ]
}

export function resolvePrimitiveExample(
  name: PrimitiveExampleName,
  locale: Locale = 'zh'
): PrimitiveExampleData {
  const sample = catalog[name]
  return {
    h5Code: sample.h5,
    weappCode: sample.weapp,
    contractRows: locale === 'en' ? contractsEn[name] : contractsZh[name]
  }
}
