# Select 选择器

`VSelect` 是 Base Kit 的基础选择组件，用于表单、筛选和业务封装。H5 / 完整 Vue 封装与 `--target weapp` 原生 Registry 组件的运行时和 API 不同，请查阅对应章节。

## 演示

<FormComponentDemo example="select" locale="zh" />

## H5 / 完整 Vue 封装

H5 Registry 入口与完整 Vue 封装默认使用 `picker` 模式，通过 `v-model:value`、`value`、`update:value` 和 `valueChange` 控制选中值。

### 多选与确认

多选时默认需要确认提交；设置 `:confirmable="false"` 可即时更新选中值。

### 搜索与 Dropdown

`filterable` 允许直接在 Select 字段中输入并过滤本地选项，面板不另设搜索框。`mode="dropdown"` 切换为下拉展示。

### 只读与禁用

`readonly` 允许打开、关闭和浏览选项，但禁止改值、清空和多选确认；面板打开后切换到只读会丢弃未确认的草稿。`disabled` 禁止打开和改值，不提供只读浏览入口。

H5 的 `filterable` 只读字段使用原生只读输入语义。

通过 `aria-label` 或 `aria-labelledby` 为字段命名；标签会应用到实际的 `combobox` 按钮或搜索输入框，选中值保持独立。

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

`--target weapp` 安装原生 Wevu SFC `src/components/ui/select.vue`，API 较少。`readonly` 允许打开、关闭和浏览选项，但禁止改值、清空和筛选输入。原生输入框无法可靠支持这种只读行为，因此 `filterable + readonly` 使用按钮式触发器。

多选没有草稿或确认提交阶段：每次点击选项都会立即触发值更新。底部“完成”按钮只关闭面板，不再次提交，也不触发确认事件。

筛选框再次展开时保留已选标签，开始输入后才显示搜索词；清空搜索词不会清空选中值。点击面板外部会收起面板并恢复已选标签。单选时点击任一可用选项都会收起面板，包括再次点击当前选项；值未变化时不会重复触发值更新事件。

展开时的已选标签使用次级文字色；开始输入搜索词或收起面板后恢复正常文字色。边框、图标和焦点提示不降低透明度。

### Props

| Prop          | 类型                                                                    | 默认值      | 描述                                                           |
| ------------- | ----------------------------------------------------------------------- | ----------- | -------------------------------------------------------------- |
| `value`       | `string \| number \| Array<string \| number>`                           | `undefined` | 当前选中值                                                     |
| `options`     | `Array<{ label: string; value: string \| number; disabled?: boolean }>` | `[]`        | 原生选项                                                       |
| `placeholder` | `string`                                                                | `'请选择'`  | 占位文本                                                       |
| `disabled`    | `boolean`                                                               | `false`     | 阻止打开和值变更                                               |
| `readonly`    | `boolean`                                                               | `false`     | 允许浏览，但阻止值变更、清空和筛选输入                         |
| `clearable`   | `boolean`                                                               | `false`     | 有选中值且可交互时，在点击或聚焦展开后显示清空按钮；收起后隐藏 |
| `multiple`    | `boolean`                                                               | `false`     | 多选；每个选项立即提交                                         |
| `filterable`  | `boolean`                                                               | `false`     | 按选项标签进行本地包含匹配，并触发搜索输入事件                 |

### Events

| Event          | Payload                                                    | 描述             |
| -------------- | ---------------------------------------------------------- | ---------------- |
| `update:value` | `string \| number \| Array<string \| number> \| undefined` | 选中值更新       |
| `change`       | `string \| number \| Array<string \| number> \| undefined` | 与值更新同时触发 |
| `clear`        | `void`                                                     | 清空成功         |
| `search`       | `string`                                                   | 筛选输入变化     |

原生 Registry Weapp 不提供 `mode`、`max`、`confirmable`、`filterOption`、`loading` 或 `emptyText`，也不触发 `valueChange`、`open`、`close`、`confirm`、`cancel` 或 `limit`。

::: info 二次封装
Base Kit 不提供分组、远程搜索和异步分页；可基于 `VSelect` 封装 `UserSelect`、`DepartmentSelect`、`CitySelect`、`ProductSelect` 等业务组件来实现。
:::
