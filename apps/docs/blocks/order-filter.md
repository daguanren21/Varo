# Order Filter Block

`Order Filter` 是可安装的双端订单筛选区块，包含多状态选择、最低/最高金额、区间校验、活动条件计数、结果数量、重置与应用事件。

## Registry

- Targets: `h5`、`weapp-vite`
- Dependencies: `components/button`、`components/checkbox`、`components/input-number`、`components/tag`、`utils/cn`
- File: `src/components/blocks/order-filter.vue`

```bash
pnpm dlx @varo-ui/cli add --target weapp-vite blocks/order-filter
pnpm dlx @varo-ui/cli add --target h5 blocks/order-filter
```

## 边界

Block 只维护 UI 筛选状态。远程状态字典、分页、接口参数映射和结果请求属于业务 wrapper；业务层监听 `apply` / `reset` 事件。

## 相关文档

- [构建你自己的 Block](/blocks/build-your-own)
