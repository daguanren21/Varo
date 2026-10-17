# 移动数据工作区

四个可独立安装的 Registry Block，目标为稳定 `h5`（Vue）与 `weapp`（Wevu）。这是有明确规模边界的移动子集，不承诺桌面功能完全等价。唯一作者源为 `registry/blocks/{metrics-chart,schedule-calendar,task-board,data-grid}`，安装目录由生成器投影。

| Block               | 移动能力                                               | 明确限制                         |
| ------------------- | ------------------------------------------------------ | -------------------------------- |
| `metrics-chart`     | 带正负号的条形比较、精确数值/单位文本、受控分类详情    | 0–12 个分类，仅有限数值          |
| `schedule-calendar` | ISO 日期选择、有界日/滚动七日列表、注入事件/时段可用性 | 1970–2100 年，最多注入 50 个事件 |
| `task-board`        | 纵向列、详情、明确移动与批准按钮                       | 1–6 列，0–50 张卡片              |
| `data-grid`         | Base、Columns、Editing、Expansion、Filtering、Grouping | 1–8 列，每页 1–50 条，默认 20    |

不包含 canvas、任意图表类型、时区转换、重复日程、日历服务、拖放、虚拟滚动或设备性能承诺。拖放和虚拟化属于独立 B5-3；分页不是虚拟化。Manifest 不自动准入实验性 profile。

## 安装与 ownership

按目标独立安装 `blocks/metrics-chart`、`blocks/schedule-calendar`、`blocks/task-board` 或 `blocks/data-grid`。渲染器位于 `src/components/blocks/<name>.vue`，可移植类型/纯 helper 位于 `src/components/blocks/<name>-actions.ts`。

四个 Block 都仅依赖已有 `components/button`；日程额外依赖已准入的 `utils/date-utils`；表格额外依赖 `components/input`。日/周列表使用 Varo 按钮与现有中立日期 helper，不创建第二套日期控件运行时，也不向 native 引入 H5 日历渲染器。本切片不修改已有共享基础组件。

每个 Block 只发出单对象、类型化 `intent`。应用是选中 ID、视图日期、记录、编辑草稿、筛选/分组结果、权限与业务提交的唯一所有者。应用提交前必须重新检查当前状态与授权。意图不等于业务完成、持久化或服务成功。

通用 props：`title?`、`loading?`、`busy?`、`disabled?`、`error?`；布尔值默认 false，error 默认空串。loading/busy/disabled 禁止新操作，但保留已有内容。error 只显示反馈，不隐式锁住纠错路径；错误需要锁定时由应用设置 busy/disabled。非法结构配置会明确显示拒绝消息并停止交互式数据展示，不裁剪、不静默截断、无自动重试。

Native 的集合属性（包括 TS 必填集合）显式声明 `Array`/`[]` host metadata，覆盖父绑定前阶段。表格可选 draft 使用 null metadata：未提供或 null 都表示无编辑器，不创建内部草稿。事件只有一个对象，无须跨目标多参数事件桥接。

## Metrics chart {#metrics-chart}

`metrics-chart-actions.ts` 导出 `MetricsChartProps`、`MetricCategory`、`MetricsChartIntent`。

| Prop         | 形状 / 默认值                                   |
| ------------ | ----------------------------------------------- |
| `items`      | 必填 `MetricCategory[]`；native 预绑定默认 `[]` |
| `unit`       | 必填非空白文本，每个数值均显示单位              |
| `selectedId` | 受控分类 ID，默认 `''`                          |
| `title`      | 默认 `Metrics comparison`                       |

分类形状：`{ id: string, label: string, value: number, detail?: string, disabled?: boolean }`。ID 非空且唯一，label 非空白，value 必须有限。空集合有效，显示 `No chart data`。零值条宽为零，但数值 `0` 和单位始终可读；负数保留符号与 `Negative` 文本。条宽按最大绝对值比较**绝对大小**，不是堆叠图，也不是以零居中的坐标轴。长标签完整换行，信息不只依赖颜色或几何形状。

`{ action: 'select', id }` 请求分类详情。缺失、禁用、已选中或全局锁定时不发出意图。外部替换不改写 `selectedId`；选中分类已删除时不显示旧详情，由应用替换选择。超过 12 类、缺少单位、重复 ID 或非有限数值拒绝整组配置。

```vue
<MetricsChart
  :items="metrics"
  unit="planned hours"
  :selected-id="selectedMetric"
  :busy="selectionPending"
  @intent="onMetricIntent"
/>
```

## Schedule calendar {#schedule-calendar}

`schedule-calendar-actions.ts` 导出 `ScheduleCalendarProps`、`ScheduleEvent`、`ScheduleIntent`。

| Prop                 | 契约                                             |
| -------------------- | ------------------------------------------------ |
| `minDate`、`maxDate` | 必填，有序、包含端点的严格 `YYYY-MM-DD` 日期边界 |
| `viewDate`           | 必填，当前可见列表起点，必须在边界内             |
| `selectedDate`       | 必填严格日历日期，与视图日期独立                 |
| `mode`               | 必填 `'day'` 或 `'week'`                         |
| `events`             | 必填 `ScheduleEvent[]`，最多 50 条               |
| `disabledDates`      | 日期字符串数组，默认 `[]`                        |
| `selectedEventId`    | 受控时段 ID，默认 `''`                           |
| `title`              | 默认 `Schedule`                                  |

事件形状：`{ id, date, label, available, detail?, disabled?, busy? }`。ID 唯一、日期有效、label 非空白。`available` 由应用注入，不通过时钟猜测。当前日期窗口之外的事件不显示，这是明确的日期筛选，不是数量截断。`week` 从 `viewDate` 开始展示连续最多七天，末端止于 `maxDate`，不暗示周一对齐。前后导航分别移动一天或七天，并停在包含端点的边界。禁用日期仍可浏览，不能选择；不可用、禁用或 busy 的事件不能选择。

意图：

- `{ action: 'view', date, mode }`：导航或模式请求，不修改选中日期。
- `{ action: 'date', date }`：选择当前窗口内可用且不同的日期。
- `{ action: 'choose', id, date }`：选择当前窗口内可用且不同的事件。

接受 choose 后是否同步选中日期由应用决定（demo 会同步）。替换 events、disabledDates 或 bounds **不会静默重置选择**。已选日期变为不可用或超出新边界时，继续显示日期与说明，由应用显式替换。`viewDate` 本身必须在边界内；非法视图配置明确拒绝。Block 不解释时间戳、时区，也不执行外部日历预约。

## Task board {#task-board}

`task-board-actions.ts` 导出 `TaskBoardProps`、`BoardColumn`、`BoardCard`、`BoardIntent`。

- `columns`：必填 `{ id, label, disabled? }[]`，1–6 列，ID 唯一。
- `cards`：必填 `{ id, title, columnId, allowedDestinationIds, detail?, canApprove?, disabled?, busy? }[]`，最多 50 张；ID 唯一，所在列/目标授权必须引用已有列。
- `selectedId`：受控详情 ID，默认 `''`。
- `title`：默认 `Task board`。

```ts
type BoardIntent
  = | { action: 'select', id: string }
    | { action: 'move', id: string, fromColumnId: string, toColumnId: string }
    | { action: 'approve', id: string, columnId: string }
```

操作发生时重新查找当前卡片与列。来源/目标列禁用、卡片禁用/busy、缺少目标授权、同列移动、无批准授权或全局锁定均不发意图。应用必须重新核对 `fromColumnId`/`columnId` 和授权后再提交。通过 error 显示应用拒绝，卡片不乐观移动。详情读取当前注入记录，而不是缓存副本。按钮提供明确、可访问的移动操作，**不是拖放**。

## Basic data grid {#data-grid}

`data-grid-actions.ts` 导出 `DataGridProps`、`GridColumn`、`GridRecord`、`GridDraft`、`GridIntent`。

| 维度      | 保留的移动行为                                            |
| --------- | --------------------------------------------------------- |
| Base      | 稳定 ID、始终显示的主字段、明确分页和总数                 |
| Columns   | 受控可见列；隐藏全部可选列仍保留主字段                    |
| Editing   | 受控文本字段、应用字段/提交错误、保存与取消，无自动持久化 |
| Expansion | 受控逐条长详情，明确展开/收起                             |
| Filtering | 受控查询意图，应用提供匹配记录和总数                      |
| Grouping  | 受控分组请求，标题使用应用指定的 `record.group`           |

列：`{ id: string, label: string, editable?: boolean, disabled?: boolean }`。禁用列不能切换可见性或编辑。记录：`{ id: string, primary: string, cells: Record<string,string>, detail: string, group?: string, canEdit?: boolean, disabled?: boolean, busy?: boolean }`。缺失展示字段显示 `Not supplied`，不编造零值。开启 grouped 时每条记录必须具备非空白 group。渲染器仅在**当前页**内按应用提供的同名 group 汇集行，标题顺序采用首次出现顺序；分组归属、结果和跨页排序由应用负责。

必填受控 props：`records`、`columns`、`columnIds`、`expandedIds`、`query`、`grouped`、`page`、`total`。页码从 1 开始。`pageSize` 默认 20，允许 1–50。应用只传请求页，不能传完整数据集期待组件裁剪。页内条数可以不足 pageSize，但不能超出 pageSize 或声明总数的剩余数量。非法页码、总数、ID、列或边界明确拒绝。columnIds 唯一且引用已有列；expandedIds 可跨页保留。

可选 props：`draft?: { rowId, values: Record<string,string> } | null`、`fieldErrors?: Record<string,string>`（默认 `{}`）及通用 props。title 默认 `Basic data grid`。所有可编辑字段均为字符串，应用自行解析数值、验证业务规则。缺失/禁用/busy 记录不能编辑；无变化保存禁用。Demo 要求标题非空且唯一、工时为 0–8 整数，这些是 demo 应用规则，不是隐藏在 Block 中的业务验证。

保存时按当前 `columns` 检查实际提交值：已修改字段的列若被禁用、移除或撤销 `editable`，整次 `save` 都会被拒绝，不会静默丢弃该字段。受控草稿保留，取消仍可用；应用恢复权限或回退该字段值后可再次保存。未修改的只读字段可以随其他有效修改一起提交。

| 意图 action | Payload                               |
| ----------- | ------------------------------------- |
| `columns`   | `ids: string[]`                       |
| `expand`    | `id`、`expanded: boolean`             |
| `filter`    | `query: string`                       |
| `group`     | `grouped: boolean`                    |
| `page`      | `page: number`                        |
| `edit`      | `id`                                  |
| `field`     | `id`、`fieldId`、`value: string`      |
| `save`      | `id`、`values: Record<string,string>` |
| `cancel`    | `id`                                  |

应用接受 edit 后创建草稿，接受 field 后替换受控字段；接受 save 时验证，拒绝则保留草稿与错误，成功则更新真实记录并清空草稿。草稿打开期间禁止筛选、分组、翻页，防止意外丢失上下文。loading/busy/disabled 或外部删除编辑记录时，取消仍可用；记录缺失显示说明，不伪造可编辑记录。已展开详情在锁定期间仍可收起。

## 本地 demo 与验证边界

由 playground 集成者接入：H5 `/?demo=data-workspace`，native `/blocks-lab/data-workspace/index`。应用持有同一份 Alpha/Beta/Gamma/Delta 内存任务，图表对工时求和；看板移动和表格接受编辑实际修改同一数据。日程选中日期可实际筛选表格。十二分类样例对没有记录的分类计算零值。非法配置控件故意传入 13 个分类、非法日历日期、51 张卡片或每页 51 条，属于标记的错误输入示例，不冒充服务响应。

未批准 Alpha 移到 Done 会被应用拒绝，明确批准后可移动；Beta 的目标授权受限；Gamma 锁定。本地占用开关让 Alpha 时段与应用台账冲突。表格字段错误或标题重复时保留草稿，纠正后更新记录。loading/busy/disabled/empty/error 开关仅注入展示状态，不伪装网络任务。

H5/native 对应 E2E 源码含七个同名场景：图表值/零/详情/12 与 13 边界；日期导航和禁用日期；时段拒绝、日期筛选和选择保留；拒绝/批准移动与图表变化；表格全部展示维度和分页；拒绝/接受编辑与 busy 时取消；四个 Block 的状态、错误和配置路径。测试通过真实控件操作并断言渲染记录，不使用 setData、页面方法或事件计数器代替用户流程。H5 请求截图；native 仅 DevTools 模式请求截图。

这里描述已编写场景，不表示已通过验收。Main 负责生成、路由、manifest/navigation、required-pair gate 和新构建后的真实 H5/native 验证。已配置的受支持 native engine/DevTools 环境与有效本地 host 配置仍是真实验证前提。本地 demo 不需要服务密钥。视觉/设备、有限数值边界探针和 profile 认证必须由独立实际验证给出，不能从源码推断。
