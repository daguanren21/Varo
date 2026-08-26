# 构建你自己的 Block

这份指南教你如何从 Base Kit 组件沉淀一个可本地维护、可安装、可贡献的业务区块（block）。示例使用匿名的筛选区块，不包含真实 API、凭证、私有 URL 或内部需求编号。

## 当前可安装 Blocks

| Registry 名称 | 用途 | Targets |
| --- | --- | --- |
| `login-form` | 登录、记住状态、错误和加载反馈 | H5 / Weapp |
| `profile-card` | 用户身份、状态和统计信息 | H5 / Weapp |
| `profile-edit` | 资料编辑与城市选择 | H5 / Weapp |
| `product-list` | 商品列表、库存、价格和加购动作 | H5 / Weapp |
| `order-filter` | 订单状态与金额筛选 | H5 / Weapp |
| `agent-chat` | 增量对话、推理、工具、审批与输入组合 | H5 / Weapp |

```bash
pnpm dlx @varo/cli add --target weapp-vite blocks/product-list
pnpm dlx @varo/cli add --target h5 blocks/product-list
pnpm dlx @varo/cli add --target weapp-vite blocks/agent-chat
pnpm dlx @varo/cli add --target h5 blocks/agent-chat
```

文档展示必须来自这些真实 registry source；不得再用未导出的 `VCard`、`VBadge` 或不可编译的 JSX 字符串模拟 Block。

## 1. 先分清分层

| 层 | 负责 | 不负责 |
| --- | --- | --- |
| **Primitives** | 状态、事件、parts、跨端交互语义 | 视觉 token、业务文案 |
| **Base Kit / UI** | 可复制的低层组件源码与默认样式 | 远程数据、权限、领域模型 |
| **业务 wrapper** | 接口、权限、字段映射、产品文案 | 通用交互状态机 |
| **Blocks** | 可复用页面切片与本地组合 | 私有后端细节、一次性页面胶水 |

经验法则：block 应该像“可搬运的页面切片”，不是“绑死某业务接口的页面”。

## 2. 定义 block 契约

在写代码前先写清合同：

```ts
// 示例：本地筛选 block 的契约
export interface StatusOption {
  label: string
  value: string
  disabled?: boolean
}

export interface FilterBarProps {
  /** 可选状态列表，由业务层注入 */
  options: StatusOption[]
  /** 受控选中值 */
  modelValue?: string[]
  /** 是否禁用 */
  disabled?: boolean
}

export interface FilterBarEmits {
  (e: 'update:modelValue', value: string[]): void
  (e: 'change', value: string[]): void
}
```

契约里要写明：

- **输入**：options、默认值、disabled
- **输出**：`update:modelValue` / `change`
- **本地状态**：仅 UI 需要的临时状态
- **依赖**：Base Kit 组件名（如 `select`）
- **排除项**：远程字典、鉴权、埋点 SDK、私有域名

## 3. 选择 Base Kit 依赖

优先依赖业务项目中的：

```text
src/components/ui/*
```

而不是在 block 里直接 import registry 源码路径。远程数据和产品策略放在业务 wrapper，不放进 block。

安装底座组件：

```bash
pnpm dlx @varo/cli add --target weapp-vite components/select
```

## 4. 创建本地 block

建议路径：

```text
src/components/blocks/status-filter.vue
```

最小实现示例：

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { VSelect } from '../ui/select'

export interface StatusOption {
  label: string
  value: string
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    options: StatusOption[]
    modelValue?: string[]
    disabled?: boolean
    placeholder?: string
  }>(),
  {
    modelValue: () => [],
    disabled: false,
    placeholder: '选择状态'
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  change: [value: string[]]
}>()

const value = computed({
  get: () => props.modelValue,
  set: (next) => {
    const normalized = next ?? []
    emit('update:modelValue', normalized)
    emit('change', normalized)
  }
})
</script>

<template>
  <section class="status-filter">
    <header class="status-filter__head">
      <strong>状态筛选</strong>
      <span>{{ value.length }} 项</span>
    </header>
    <VSelect
      v-model:value="value"
      multiple
      :disabled="disabled"
      :options="options"
      :placeholder="placeholder"
    />
  </section>
</template>
```

要求：

- props / emits 类型完整
- 布局小而可读
- 不写死业务接口

## 5. 测试 block

至少覆盖：

- 初始渲染
- 用户选择后的 emit 值
- disabled 行为
- 依赖边界（不请求网络、不读私有环境变量）

```ts
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import StatusFilter from '../status-filter.vue'

describe('StatusFilter', () => {
  it('emits selected statuses', async () => {
    const wrapper = mount(StatusFilter, {
      props: {
        options: [
          { label: '待支付', value: 'pending' },
          { label: '已完成', value: 'done' }
        ],
        modelValue: []
      }
    })

    await wrapper.setProps({ modelValue: ['pending'] })
    expect(wrapper.props('modelValue')).toEqual(['pending'])
  })
})
```

## 6. 本地使用与维护

```vue
<script setup lang="ts">
import { ref } from 'vue'
import StatusFilter from '@/components/blocks/status-filter.vue'

const statuses = ref<string[]>([])
const options = [
  { label: '待支付', value: 'pending' },
  { label: '已完成', value: 'done' }
]
</script>

<template>
  <StatusFilter v-model="statuses" :options="options" />
</template>
```

复制进业务仓库的源码归业务团队所有，可以继续改布局、token 和交互，不必回灌到 Varo。

## 7. 准备 registry 元数据

若要让别人通过 CLI 安装，新增：

```text
registry/blocks/status-filter/registry.json
registry/blocks/status-filter/status-filter.vue
```

`registry.json` 示例：

```json
{
  "name": "status-filter",
  "type": "block",
  "title": "Status Filter",
  "description": "A local filter bar for selecting multiple anonymized statuses with VSelect.",
  "targets": ["weapp-vite"],
  "dependencies": ["vue"],
  "registryDependencies": ["components/select"],
  "files": [
    {
      "target": "weapp-vite",
      "from": "registry/blocks/status-filter/status-filter.vue",
      "to": "src/components/blocks/status-filter.vue"
    }
  ],
  "docs": "/blocks/status-filter"
}
```

字段要点：

- `type`：`block`
- `targets`：如 `weapp-vite`
- `registryDependencies`：递归安装的底座组件
- `files`：from/to 映射
- `docs`：文档路由

## 8. 补充双语文档

每个公开 block 至少说明：

- 用途
- 依赖
- target
- 安装后的文件落点
- 可定制边界 / 不可放入的业务逻辑

现有示例：

- [Profile Edit](/blocks/profile-edit)
- [Order Filter](/blocks/order-filter)

## 9. 校验安装

建议清单：

```bash
# 类型与测试
pnpm typecheck
pnpm test

# 打包 CLI 后在临时目录验证安装
pnpm --filter @varo/cli build
pnpm dlx @varo/cli add --target weapp-vite blocks/status-filter
```

确认：

- 依赖组件会递归安装
- 目标文件已存在时默认不覆盖（no-clobber）
- 需要覆盖时使用显式 force 流程
- 安装结果不带私有域名、token、内部任务号

## 10. 贡献回 Varo

提交前过一遍隐私与可移植清单：

- [ ] 无真实 API / 凭证 / 私有 URL
- [ ] 无内部需求号、工单号、客户名
- [ ] 依赖写在 `registryDependencies`，拼写正确
- [ ] 中英文档齐全
- [ ] 单测覆盖主路径
- [ ] packed CLI 安装通过

贡献物通常包括：源码、`registry.json`、测试、双语文档。

## 故障排查

| 现象 | 处理 |
| --- | --- |
| 依赖没装上 | 检查 `registryDependencies` 拼写，如 `components/select` |
| 目标文件冲突 | 确认 `to` 路径；默认 no-clobber，覆盖需显式 force |
| block 难复用 | 把远程数据/权限/埋点移到业务 wrapper |
| 小程序不可用 | 删除 H5-only API，保持双端契约 |
| 单测过但安装失败 | 用 packed CLI + 临时 fixture 复现，检查 files 映射 |

## 安装现有 block

```bash
pnpm dlx @varo/cli add --target weapp-vite blocks/profile-edit
pnpm dlx @varo/cli add --target weapp-vite blocks/order-filter
```

安装后：

```text
src/components/ui/*        # 底座组件源码
src/components/blocks/*    # block 源码
src/components/biz/*       # 建议放置业务二次封装
```

## 相关文档

- [shadcn 模式](/guide/shadcn-mode)
- [安装指南](/guide/installation)
- [Primitives 总览](/primitives/)
- [组件文档](/components/button)
