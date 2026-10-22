# Order Filter Block

`Order Filter` 是可安装的双端订单筛选区块，包含多状态选择、最低/最高金额、区间校验、活动条件计数、结果数量、重置与应用事件。

## Registry

- Targets: `h5`、`weapp`
- Dependencies: `components/button`、`components/checkbox`、`components/input-number`、`components/tag`、`utils/cn`
- File: `src/components/blocks/order-filter.vue`

```bash
pnpm dlx @varo-ui/cli add --target weapp blocks/order-filter
pnpm dlx @varo-ui/cli add --target h5 blocks/order-filter
```

## 边界

Block 维护界面筛选状态。业务 wrapper 处理 `apply` / `reset`，负责远程状态字典、分页、接口参数映射和结果请求。

## 相关文档

- [构建你自己的 Block](/blocks/build-your-own)
