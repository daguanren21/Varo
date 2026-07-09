# Profile Edit Block

`Profile Edit` 是一个基于 Base Kit 的表单区块，用 `VSelect` 选择城市。它面向 `weapp-vite` registry 安装，适合作为业务资料编辑页的起点。

## Registry

- Target: `weapp-vite`
- Dependencies: `components/select`
- File: `src/components/blocks/profile-edit.vue`

## 边界

这个 block 只组合底座组件，不内置远程城市数据、用户接口或表单提交逻辑。业务侧可以基于它继续封装头像、昵称、地区联动和保存流程。
