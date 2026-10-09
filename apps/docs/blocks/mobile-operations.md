# 移动运营工作台

一个可编辑的移动工作台，覆盖 **CRM、AI Ops、Dev Ops、Agents、Analytics、Files**。H5 使用 Vue，微信原生使用 Wevu。领域记录、字段、文案、权限与业务决策由应用注入；Block 不会根据领域标题偷偷选择业务 API。

## 安装与职责

```bash
pnpm dlx @varo-ui/cli add --target h5 blocks/mobile-operations
pnpm dlx @varo-ui/cli add --target weapp blocks/mobile-operations
```

Manifest 仅准入稳定的 `h5` / `weapp`，不自动准入实验原生平台。直接依赖 Button、Input，以及它们声明的传递工具/样式。CLI 只报告 npm 依赖，不替应用安装。

安装产物：

- `src/components/blocks/mobile-operations.vue`：受控筛选、有界列表、分页。
- `src/components/blocks/mobile-operations-detail.vue`：详情字段与显式授权的操作，由工作台组合。
- `src/components/blocks/mobile-operations-actions.ts`：跨目标纯类型、常量和当前记录守卫。

应用从安装目录导入，不越过公开安装边界导入仓库 Registry。原生通过 `weapp.styles` 全局加载安装样式，不把 H5 renderer 或全局 CSS 导入组件局部 WXSS。不存在第二套跨平台渲染运行时。

## 完全受控的分页契约

| 属性                                          | 含义                                                             |
| --------------------------------------------- | ---------------------------------------------------------------- |
| `items: OperationRecord[]`                    | 应用提供的当前页，不是完整数据库                                 |
| `page: number`                                | 从 1 开始的页码；空数据也使用 1                                  |
| `total: number`                               | 当前筛选后的非负整数总数                                         |
| `pageSize?: number`                           | 默认 **20**，最小 1，最大 **50**，必须为整数                     |
| `filters: OperationFilters`                   | 受控 `{ search, status, category }`，均为字符串                  |
| `statuses`, `categories`: `OperationChoice[]` | 注入 `{ id, label, disabled? }`；需要“全部”时显式提供空字符串 ID |
| `selectedId: string`                          | 当前页选中记录；`''` 表示关闭详情                                |
| `title?: string`                              | 标题，默认 `Operations`                                          |
| `loading`, `busy`, `disabled`                 | 默认 false；保留已有内容，同时禁止变更与分页                     |
| `error?: string`                              | 应用加载错误；保留列表/详情，清除错误前不允许业务操作            |

应用执行搜索、筛选与切页，并决定是否接受事件。**Block 不查询、不筛选、不静默裁剪 `items`。** 当前页可以少于 `pageSize` 条，但不能超过页大小或总数声明下的剩余条数。页码越界、无效大小/总数、空或重复记录 ID、无效 revision、空或重复字段/操作 ID 均显示明确配置错误，并停止渲染可操作列表。这是有界分页，**不是虚拟化**。

接受筛选时，应一次提供新筛选、第 1 页与对应总数。示例在领域、筛选、分页改变时关闭详情；应用可以采用其他策略，但只能为当前页中存在的记录保留 `selectedId`。记录消失或失去 `canView` 后，详情显示不可用提示并保留关闭入口，不擅自改选其他记录。

原生必需集合通过显式宿主 property metadata 初始化为空数组；`filters` 也有完整空对象初值，避免父绑定前访问 null。调用者仍需提供完整、类型正确的属性，外部数据解析属于应用边界。

## 记录与操作类型

```ts
interface OperationRecord {
  id: string
  revision: number
  title: string
  summary: string
  detail: string
  status: string
  statusLabel: string
  category: string
  fields: { id: string, label: string, value: string }[]
  actions: OperationAction[]
  canView: boolean
  disabled?: boolean
  busy?: boolean
  error?: string
}
interface OperationAction {
  id: string
  kind: 'approve' | 'reject' | 'mutate' | 'remove' | 'open' | 'download'
  label: string
  allowed: boolean
  disabled?: boolean
  completed?: boolean
  reason?: string
}
```

ID 必须稳定。记录内容或授权变化时，递增非负整数 `revision`。字段值是应用提供的显示文本，单位与来源也由应用说明。未提供的指标不会显示为 0。长标题、摘要、字段与详情自然换行，不依赖 hover 获取完整内容。

`allowed` 是明确的 UI 操作许可，**不是鉴权系统**。`completed` 阻止已经完成的无效重复请求；`reason` 在按钮禁用时仍可阅读。缺失、禁用、忙碌、无查看许可或旧 revision 的记录不能触发有效变更，缺失/禁止/禁用/已完成的操作同样不能触发。激活时重新从**当前 props**查找记录及操作，检查捕获的 revision、操作 ID 和种类，不能靠旧列表对象绕过新授权。选择详情也检查 ID 和 revision。Block 不乐观报告业务完成。

## 单一类型化事件

两端均通过 `intent(OperationsIntent)` 发送**一个对象**：

```ts
type OperationsIntent
  = | { type: 'filter', filters: OperationFilters }
    | { type: 'page', page: number }
    | { type: 'select', id: string, revision: number }
    | { type: 'close' }
    | {
      type: 'action'
      id: string
      revision: number
      actionId: string
      kind: OperationAction['kind']
    }
```

相同筛选、当前页、当前选择、不可用选项和页码越界均不产生接受事件。加载、忙碌、禁用、错误、旧选择状态仍可关闭详情。记录级 `error` 用于应用拒绝原因，不会阻止仍有许可的修正操作；不可恢复错误应由应用收回相应操作许可。

纯函数 `canViewOperation`、`canRequestOperation`、`operationFilterChanged`、`operationsPageError` 可供应用复用。应用收到事件后必须重新读取权威记录、鉴权与业务规则；异步操作在 await 后、提交前再次检查，并在处理期间注入 busy。UI 守卫不能替代服务端安全边界。

两端组合形式相同：

```vue
<MobileOperations
  :items="currentPage" :total="filteredTotal" :page="page" :page-size="20"
  :filters="filters" :statuses="statusChoices" :categories="categoryChoices"
  :selected-id="selectedId" :loading="loading" :busy="pending" :error="loadError"
  @intent="handleIntent"
/>
```

这里的绑定全部由应用维护：`handleIntent` 接受或拒绝筛选/分页、设置详情、进行必要确认、执行真实工作，并以递增 revision 的记录替换旧数据。业务服务、存储、密钥、认证、授权、网络取消、导航均不藏在 Block 中。

### Files 只发送宿主意图

`open` / `download` 只携带记录与操作身份、revision；没有 URL 字段、浏览器链接、自动下载、文件选择器或权限弹窗。应用宿主适配器解析自己有权访问的文件句柄/URL，并提供真实的处理中、成功或失败状态。缺少适配器时，应明确告知前提缺失，而不是显示下载成功。

## 六个完整本地场景

集成入口：H5 `/?demo=operations`；原生 `/blocks-lab/operations/index`。示例持有 18 条内存记录，使用每页 2 条展示边界，重载后重置，不连接生产服务。

| 领域      | 特有字段与真实本地任务                                                                       | 应用拒绝与修正                                                                            |
| --------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| CRM       | 客户负责人、联系许可、标明为样例的报价；把负责人修改为 Avery，批准/拒绝商机                  | 缺失联系许可时拒绝批准；由应用控制记录本地许可后再审                                      |
| AI Ops    | 每条记录持有本地 actual/expected 样例；逐条字符串比较得出 3 条样例中 2 条命中，批准/拒绝评估 | 缺少 expected 标签时拒绝审核与评估；修正操作实际写入这些本地样例的标签                    |
| Dev Ops   | 样例 commit、回滚检查表、环境；暂存本地发布计划并批准/拒绝                                   | 未审查回滚清单时拒绝任务与审核；应用将清单标记已审。没有部署或 CI 执行声明                |
| Agents    | Prompt 版本、工具范围、调度配置；启用本地调度并批准/拒绝配置                                 | 通配符工具范围触发应用拒绝；修正为只读本地范围。不实际运行 Agent                          |
| Analytics | 内存订单数组、条数、求和；追加金额 25，使第一份报告从 3 条/60 变为 4 条/85                   | 少于 3 条时拒绝快照；可实际追加足够数据或使用明确修正入口。样例上限 12 条；审核后冻结变更 |
| Files     | MIME、分类、存储来源；批准/拒绝分类，应用展示真正保存在内存中的文本                          | 未分类时拒绝批准；下载入口明确报告没有宿主适配器并保留文本，绝不声称访问了设备文件        |

每个领域都有归档只读记录、无许可操作、状态/类别/关键词筛选和会被应用拒绝的审核。已经记录的审核结果禁止重复批准/拒绝，也冻结本地变更任务。Files 的文本预览始终属于应用/宿主。删除需要二次确认，提交时再次检查当前 revision 和操作许可；实际删除后修正总数、分页与选择。打开删除确认后撤销授权，可观察旧确认被拒绝且记录不丢失。

状态开关明确表示**注入的展示状态**，不是伪装的网络结果：加载、待决、禁用、错误、非法页大小。适用时保留已有证据，关闭/取消仍可操作。空态来自真实筛选。Analytics 数值来自本地数组，AI 命中数来自实际字符串比较，均非虚构服务或模型遥测。

## 验证入口与目标差异

配套用例：

- `apps/e2e/tests/h5/operations.e2e.ts`
- `apps/e2e/tests/weapp-native/operations.e2e.ts`

六个领域分别覆盖第一页/末页、归档/禁止/无效重复操作、领域专属任务的可见结果、批准、三种筛选、空结果、应用拒绝、修正与审核员拒绝。额外场景覆盖授权撤销、旧删除确认、真实删除、加载/忙碌/禁用/错误时关闭和非法大小拒绝。H5 在 375px 捕获各领域审核后的截图；原生另有仅 DevTools 执行的 CRM 详情截图用例。测试操作真实控件、断言实际列表与详情变化，不用 page 方法、`setData` 或事件计数替代结果。

用例已编写**不等于已通过验收**。集成方需要先生成安装源码、注册路由，再运行对应真实套件并审阅截图。原生 headless 观察不证明真机表现；DevTools 需要受支持的运行时和获授权的本地 AppID/工程配置。真实文件打开/下载需要宿主适配器与必要权限；生产 CRM、评估、部署、Agent、分析、持久化服务均是外部前提。

这是移动单列列表/详情/审核工作台，不承诺桌面控制台、无限数据、虚拟滚动、多栏编辑、任意图表、后台 Agent、部署执行或通用跨宿主文件能力。
