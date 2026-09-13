# Cell

列表行基座：适合设置项、详情项、链接行和可点击信息单元。

## 运行时归属

H5 与小程序 adapters 保持相同公开 API；键盘和导航细节由目标处理。

## 演示

<PrimitiveExample name="cell" locale="zh" />

## Parts

| Part            | 作用                       |
| --------------- | -------------------------- |
| `CellGroupRoot` | 分组标题与容器             |
| `CellRoot`      | 标题、内容、描述与激活行为 |

## 状态与事件

- 状态：`clickable`、`isLink`、`to`、`size`、`center`
- 事件：`click`。

::: info 平台差异
H5 为可点击非链接行补充 Enter/Space；小程序使用原生点击。
:::
