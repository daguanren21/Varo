# Agent Attachment Composer 附件输入

选择真实本地文件、传输实际字节、校验服务确认，再提交包含已接受附件的文本消息。这是四个不同的应用状态：**选中文件和上传进度都不等于上传成功**。

## 安装与状态归属

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-attachment-composer
pnpm dlx @varo-ui/cli add --target weapp components/agent-attachment-composer
```

按项目选择一个目标，并单独安装 CLI 报告的 npm 依赖。原生全局样式配置见 [Wevu Registry](/guide/shadcn-mode)。仅准入稳定 H5/Weapp，不代表实验平台或设备认证。此可选单元组合 `agent-conversation`、Button、primitives 与 `utils/attachment-transfer`，不扩大 AgentChat 的依赖闭包，也不导入完整 `agent-ui` / advanced 聚合。传输工具也可独立安装。

- `src/components/agent-ui/AgentAttachmentComposer.vue`：展示和受保护意图，不拥有传输状态。
- `src/components/agent-ui/agent-attachment-composer.types.ts`：展示契约。
- `src/lib/attachment-transfer/attachment-transfer.ts`：元数据、策略、任务、错误与纯校验。
- `src/lib/attachment-transfer/attachment-transfer.h5.ts`：浏览器适配器。
- `src/lib/attachment-transfer/attachment-transfer.weapp.ts`：原生适配器。安装器只复制所选目标；不同文件名避免覆盖公共类型。

每个应用所有者创建独立适配器，不使用单例。File / 原生路径由适配器私有保留，不进入 UI 快照。应用拥有条目、尝试身份、服务确认、已接受消息和草稿，决定 URL、headers、浏览器凭据、响应校验、重试、取消、保留周期及远程删除策略。

## 真实传输 API

```ts
import { createAttachmentTransfer } from './lib/attachment-transfer/attachment-transfer.h5'
// 原生导入 './lib/attachment-transfer/attachment-transfer.weapp'

const transfer = createAttachmentTransfer<MyReceipt>({
  maxCount: 3,
  maxBytes: 8 * 1024 * 1024,
  extensions: ['.txt', '.md'],
})
```

`MyReceipt` 是应用自己定义的服务确认类型。`select()`、`upload(id, options)` 返回 `{ promise, cancel() }`。必须在真实用户操作中同步调用 `select()`，再由应用等待 promise。选择结果是 `{ id, name, size, mime? }`；原生没有提供 MIME 时保持缺省，不根据后缀伪造 MIME。

`maxCount` 限制**所有仍保留的源文件数量**；`maxBytes` 是单文件上限。两者必须是正安全整数，后缀允许列表必须明确。原生配置超过宿主 100 个文件的限制时直接报错，不截断配置。非法或超限选择整批拒绝，不悄悄切片；宿主文件过滤器只是提示，返回元数据仍要校验。后缀和 MIME 都不能证明内容真实性，服务端必须独立检查。

| 上传选项                   | 含义                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------ |
| `url`                      | 应用选择的 endpoint，POST multipart 上传                                             |
| `headers?`                 | 应用配置的请求头；multipart Content-Type/boundary 交给宿主生成                       |
| `withCredentials?`         | 浏览器 XHR 凭据标志，默认 false；原生 cookie 行为由 wx.uploadFile 决定               |
| `fieldName?`               | 文件表单字段，默认 `file`                                                            |
| `parseReceipt(body, file)` | 应用同步校验 2xx 响应；返回非空确认或抛错                                            |
| `onProgress?`              | 真实宿主 `{ sentBytes, totalBytes? }`；可能包含 multipart 封装，不保证等于源文件大小 |

浏览器使用实际 `input[type=file]` 和 XMLHttpRequest 上传进度/abort。选择未结束时，输入可通过 `input[type="file"][data-varo-attachment-input="true"]` 定位，结束后移除。真正的 chooser `cancel` 不是选择成功。原生直接使用 `wx.chooseMessageFile`、`wx.uploadFile`、UploadTask 进度与 abort，不依赖浏览器 AbortController。

失败以 `AttachmentTransferError` 拒绝：`validation`、`unavailable`、`permission`、`transport`、`http`（带状态码）、`receipt`、`cancelled`、`disposed`、`missing`。原生权限错误保留宿主消息；浏览器 XHR 无法区分的 CORS/权限问题如实属于 transport。2xx 缺少有效确认也不是成功。取消只结算一次，并抑制后续进度/完成回调。**原生没有承诺可以关闭已打开的系统选择器**：cancel 只使结果失效，用户可能仍需手动关闭系统 UI。取消不保证远程回滚。

`release(id)` 取消该 ID 的活动上传并释放保留源；`dispose()` 取消所有任务并释放所有源。两者不会删除远端对象或宿主拥有的临时文件，应用也应释放自己的引用。已 dispose 的实例不可复用，需创建新所有者。演示应用额外按尝试身份守卫每个回调，取消、移除、替换、卸载后的旧结果不能进入当前状态。

## 展示组件与受控文本

`AttachmentItem<R>` 包含 `file`、`status: ready | uploading | uploaded | failed | cancelled`、可选真实 `progress` / `failure` / `receipt`，以及 `upload`、`retry`、`cancel`、`remove` 的 `grants`。

| Prop                 | 含义                                               |
| -------------------- | -------------------------------------------------- |
| `items?`             | 应用当前条目，默认空数组                           |
| `modelValue?`        | 可选受控文本；不传则内部拥有初始空草稿             |
| `disabled?`、`busy?` | 保留已有 Composer 的编辑/busy 语义，阻止新传输动作 |
| `canChoose?`         | 显式选择授权，默认 false                           |
| `choosing?`          | 应用有未结束选择；阻止提交并显示取消入口           |
| `suggestions?`       | 转交已有 Composer；附件未解决时同样禁止提交建议    |

两个目标的事件均为单值/单对象：`choose`、`cancelSelection`、`update:modelValue(string)`、`action({ id, action })`、`submit({ prompt, attachments: [{ file, receipt }] })`。激活时重新查找当前 ID 与授权，不乐观修改状态。只要正在上传且有 cancel 授权，禁用/busy 输入时仍可取消；上传过程中不能移除，必须先取消。长文件名和错误完整换行展示。

提交要求去空白后文本非空，且**所有已选条目均为 uploaded 并带非空 receipt**。ready、uploading、failed、cancelled、缺少确认的条目会阻止 Send、Enter/原生 confirm 和建议提交，但不会因此禁用正常草稿编辑。包装层传入共享 `AgentComposer.submitDisabled`，不会重写 textarea/send 控件。应用必须校验自身 receipt，并在接受意图时重新检查状态与授权。组件不会自动清空文本或附件。

文本使用 `useControllableState` 的存在性契约：显式 `''` 仍是受控，原生缺省元数据为 `null`，必需集合明确声明 Array/[]。切换为非受控不会把外部草稿复制到第二个状态所有者。

## 真实本地服务演示

- H5：`/?demo=attachments`，`apps/playground-h5/src/features/AttachmentDemo.vue` 和 `useAttachmentDemo.ts`。
- 原生：`/blocks-lab/attachments/index` 及独立的 `useAttachmentDemo.ts`。
- 仅开发服务：`apps/playground-h5/scripts/attachment-demo.ts`，导出 `attachmentDemoPlugin()`，由 H5 Vite 配置集成。
- 唯一上传入口：`POST /__varo_attachment_demo/upload`；不接受 query，没有下载或远程删除路由。

这是**本地文件传输服务，不是生产后端或模型**。服务使用 Node 内置 multipart 解析，按实际流读取字节执行上限，仅接受一个 `file` part，校验 .txt/.md 与无 NUL 的 UTF-8 内容，以生成 UUID 写入独占 OS 临时目录。实际写入后才返回 HTTP 201 `{ id, bytes, sha256 }`。应用校验 ID、精确源字节数、SHA-256 格式；浏览器 E2E 对照真实测试文件摘要。客户端文件名永不作为存储路径。

限制：单文件 8 MiB，multipart 总体 8 MiB + 64 KiB，最多 4 个并发请求、64 个已保存文件、32 MiB 已保存/预留总配额。拒绝异常 method/path/body/content-encoding、外部 Origin 与异常 Host。请求必须显式携带 `X-Varo-Attachment-Demo: local-transfer`，它只是调用意图，**不是认证**。原生可不带 Origin；浏览器 Origin 必须匹配开发服务器实际解析的源。不添加 CORS 绕过。不要公开部署开发服务、提供私人文件或凭据；配额满返回真实 507，需要重启服务清理专属存储，不会静默删除文件。

每个请求有 30 秒总时限。关闭时先销毁本插件自己的活动请求，等待任务结算，再删除专属存储。

“让本地服务拒绝上传”发送 `X-Varo-Demo-Mode: reject`，真实 HTTP 请求经过解析/内容校验后以 503 拒绝且不保存。“恢复本地服务接收”让后续请求使用 `accept`，重试是新的 HTTP 请求。可选 `X-Varo-Demo-Pacing: paced` 每读取 16 KiB 等待 40ms，通过实际流背压故意放慢，不合成客户端进度。浏览器/socket 缓冲可能在服务仍读取时显示发送 100%；只有确认响应才能进入 uploaded。

移除仅释放本地保留，不删除先前已接受消息和服务文件。关闭演示 abort/dispose 本地任务；关闭开发服务器清理其专属临时目录。客户端取消与服务器接受竞态时，文件可能仍保存到服务关闭为止。此服务没有生产认证、持久化承诺、恶意文件扫描、模型附件协议或远程删除 API。

## 原生连接设备验收门禁

应用初始服务 URL **为空**，不写死开发者 IP，不假设设备 localhost 可用。源码、构建产物或 headless 执行都不是选择器、权限或设备认证。真实验收步骤：

1. 使用已授权微信宿主/设备与有效本地 AppID，确保实际支持 `wx.chooseMessageFile`、`wx.uploadFile`、UploadTask progress/abort。在宿主可选择的消息中准备已知 UTF-8 .txt/.md 文件，独立记录字节数与 SHA-256。
2. 显式选择设备可达的开发服务器监听地址，并在原生页面输入完整 `/__varo_attachment_demo/upload` URL。按授权宿主配置上传合法域名/TLS；不得通过关闭安全机制或伪造凭据替代。插件只接受自己的 resolved Host/origin，未配置代理 URL 不会自动放行。
3. 打开真实选择器，先取消，再选择实际文件；检查名称/实际大小、缺省 MIME、ready 状态与禁止提交。验证权限拒绝与非法/超限选择，保留真实宿主错误，不为缺失 API 生成文件 fixture。
4. 开启实际背压，上传较大合法文件。观察真实进度、禁止提交/直接移除，禁用输入后取消；仍打开的系统选择器由用户关闭。移除重新选择或重试，确认迟到回调不会恢复旧条目/确认。
5. 执行真实 503 拒绝、恢复、重试；检查服务存储，将确认字节数/摘要与已知文件比较后才承认 uploaded。输入不可达服务，记录真实 transport/domain 失败。
6. 以非空文本提交已确认附件，检查文本/附件保留、外部清空、撤销授权及关闭/卸载释放。关闭开发服务器，检查只移除了其拥有的临时资源。

这些步骤未在授权连接宿主执行前，原生选择器/权限/进度/abort/上传认证仍然是**外部门禁**，不能由已编写代码宣称通过。

## 已编写 E2E 的边界

`apps/e2e/tests/h5/attachments.e2e.ts` 创建/清理真正独占的临时文件，通过公共 `webRuntime.interceptFileChoosers()` 保持真实选择器待处理，再以 `setInputFiles(selector, paths)` 操作 DOM 输入。成功路径对照真实上传字节和摘要；另覆盖上传状态截图、整批选择上限、实际 HTTP 拒绝/重试、服务文本校验、禁用时取消/迟到结果、dispose、授权与受控文本。不使用 DataTransfer/evaluate。独立的故障注入场景刻意返回缺字段、非法 UUID、字节数不符或摘要格式错误的 2xx 响应，确认它们不能产生 receipt 或解锁提交；这些响应不是成功上传证据。

`apps/e2e/tests/weapp-native/attachments.e2e.ts` 仅验证可到达的原生组合：未配置服务提示、没有伪造附件/确认、授权、可选受控文本、禁用输入及释放。它不跳过必需设备断言，也不把 headless fixture 当系统选择器。上述连接设备步骤是单独必需外部门禁。已编写场景/文档不是已运行证据；集成所有者独立执行生成、类型/构建/安装闭包、服务安全/清理、真实截图与原生包预算验证。
