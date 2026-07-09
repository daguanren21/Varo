# Order Filter Block

`Order Filter` 是一个基于 Base Kit 的筛选区块，用 `VSelect` 多选订单状态。它面向 `weapp-vite` registry 安装，适合作为订单列表筛选栏的基础版本。

## Registry

- Target: `weapp-vite`
- Dependencies: `components/select`
- File: `src/components/blocks/order-filter.vue`

## 边界

这个 block 保持轻量，只提供本地状态选择和基础布局。远程状态字典、分组、分页搜索和接口参数映射应在业务二次封装层实现。
