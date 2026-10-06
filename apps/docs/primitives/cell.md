# Cell

列表行基座：适合设置项、详情项、链接行和可点击信息单元。

## 运行时归属

本页 Parts 与交互示例仅属于 `@varo-ui/h5/primitives`。原生端使用 Wevu `VCell` / `VCellGroup` SFC，不承诺 Parts API 等价；原生标签页仅展示源码/证据。键盘与导航能力由各自运行时决定。

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
