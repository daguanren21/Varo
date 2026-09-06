# Select 选择器

`VSelect` 是 Base Kit 的低层选择组件，用于表单、筛选和业务组件二次封装。H5 / 完整 Vue 封装与 `--target weapp` 安装的原生 Registry 组件面向不同运行时，API 以各自章节为准。

<RegistryInstallStrip item="components/select" :targets="['h5', 'weapp']" locale="zh" />

## 演示

<FormComponentDemo example="select" locale="zh" />

## H5 / 完整 Vue 封装

H5 Registry 入口与完整 Vue 封装默认使用 `picker` 模式，受控契约使用 `v-model:value`、`value`、`update:value` 和 `valueChange`。

### 多选与确认

多选时默认需要确认提交；设置 `:confirmable="false"` 可即时更新选中值。

### 搜索与 Dropdown

`filterable` 让 Select 字段本身直接输入并过滤本地选项；展开面板不会再重复渲染第二个搜索框。`mode="dropdown"` 切换为下拉展示。

### 只读与禁用

`readonly` 保留组件的操作能力：仍可打开、关闭和浏览选项，但不会更新选中值，也不会触发清空或多选确认提交；面板打开后再切换到只读，尚未确认的草稿同样会被丢弃。`disabled` 则阻止打开和值变更，不提供只读浏览入口。

H5 的 `filterable` 只读字段使用原生只读输入语义。

### Props

| Prop           | 类型                                          | 默认值       | 描述                                 |
| -------------- | --------------------------------------------- | ------------ | ------------------------------------ |
| `value`        | `string \| number \| Array<string \| number>` | `undefined`  | 当前选中值                           |
| `options`      | `VSelectOption[]`                             | `[]`         | 选项                                 |
| `mode`         | `'picker' \| 'dropdown'`                      | `'picker'`   | 展示模式                             |
| `placeholder`  | `string`                                      | `'请选择'`   | 占位文本                             |
| `disabled`     | `boolean`                                     | `false`      | 禁用                                 |
| `readonly`     | `boolean`                                     | `false`      | 只读                                 |
| `clearable`    | `boolean`                                     | `false`      | 可清空                               |
| `multiple`     | `boolean`                                     | `false`      | 多选                                 |
| `max`          | `number`                                      | `undefined`  | 最多选择数量                         |
| `filterable`   | `boolean`                                     | `false`      | 允许直接在 Select 字段中搜索本地选项 |
| `confirmable`  | `boolean`                                     | `true`       | 多选时是否确认提交                   |
| `filterOption` | `(query, option) => boolean`                  | `undefined`  | 自定义本地过滤                       |
| `loading`      | `boolean`                                     | `false`      | 加载状态展示                         |
| `emptyText`    | `string`                                      | `'暂无数据'` | 空状态文案                           |

### Events

| Event          | Payload                                                    | 描述             |
| -------------- | ---------------------------------------------------------- | ---------------- |
| `update:value` | `string \| number \| Array<string \| number> \| undefined` | 选中值更新       |
| `valueChange`  | `string \| number \| Array<string \| number> \| undefined` | 选中值变化       |
| `clear`        | `void`                                                     | 清空             |
| `open`         | `void`                                                     | 打开             |
| `close`        | `void`                                                     | 关闭             |
| `confirm`      | `Array<string \| number>`                                  | 多选确认         |
| `cancel`       | `void`                                                     | 取消             |
| `search`       | `string`                                                   | 搜索输入变化     |
| `limit`        | `{ max: number }`                                          | 超过最大选择数量 |

## 原生 Registry Weapp

`--target weapp` 安装的是原生 Wevu SFC `src/components/ui/select.vue`，使用更小的运行时契约。`readonly` 仍可打开、关闭和浏览选项，但不会更新选中值；清空按钮和筛选输入不可用。小程序原生输入框无法可靠表达相同的只读契约，因此 `filterable + readonly` 会使用按钮式触发器。

多选没有草稿或确认提交阶段：每次点击选项都会立即触发值更新。底部“完成”按钮只关闭面板，不再次提交，也不触发确认事件。

### Props

| Prop          | 类型                                                                    | 默认值      | 描述                                           |
| ------------- | ----------------------------------------------------------------------- | ----------- | ---------------------------------------------- |
| `value`       | `string \| number \| Array<string \| number>`                           | `undefined` | 当前选中值                                     |
| `options`     | `Array<{ label: string; value: string \| number; disabled?: boolean }>` | `[]`        | 原生选项                                       |
| `placeholder` | `string`                                                                | `'请选择'`  | 占位文本                                       |
| `disabled`    | `boolean`                                                               | `false`     | 阻止打开和值变更                               |
| `readonly`    | `boolean`                                                               | `false`     | 允许浏览，但阻止值变更、清空和筛选输入         |
| `clearable`   | `boolean`                                                               | `false`     | 有选中值且可交互时显示清空按钮                 |
| `multiple`    | `boolean`                                                               | `false`     | 多选；每个选项立即提交                         |
| `filterable`  | `boolean`                                                               | `false`     | 按选项标签进行本地包含匹配，并触发搜索输入事件 |

### Events

| Event          | Payload                                                    | 描述             |
| -------------- | ---------------------------------------------------------- | ---------------- |
| `update:value` | `string \| number \| Array<string \| number> \| undefined` | 选中值更新       |
| `change`       | `string \| number \| Array<string \| number> \| undefined` | 与值更新同时触发 |
| `clear`        | `void`                                                     | 清空成功         |
| `search`       | `string`                                                   | 筛选输入变化     |

原生 Registry Weapp 不提供 `mode`、`max`、`confirmable`、`filterOption`、`loading` 或 `emptyText`，也不触发 `valueChange`、`open`、`close`、`confirm`、`cancel` 或 `limit`。

## 二次封装边界

分组、远程搜索、异步分页属于二次封装组件能力，不属于 Base Kit。业务组件应基于 `VSelect` 封装 `UserSelect`、`DepartmentSelect`、`CitySelect`、`ProductSelect`。
