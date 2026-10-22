# Profile Edit Block

`Profile Edit` 是可安装的双端资料编辑区块，包含姓名、手机号、城市搜索、个人简介、加载、取消与提交状态。

## Registry

- Targets: `h5`、`weapp`
- Dependencies: `components/button`、`components/input`、`components/select`、`utils/cn`
- File: `src/components/blocks/profile-edit.vue`

```bash
pnpm dlx @varo-ui/cli add --target weapp blocks/profile-edit
pnpm dlx @varo-ui/cli add --target h5 blocks/profile-edit
```

## 边界

Block 组合本地表单并发出类型化事件。应用通过 `initialProfile` 和 `cities` 传入数据，处理 `submit` / `cancel`，并负责用户接口、鉴权、远程城市字典及保存策略。

## 相关文档

- [构建你自己的 Block](/blocks/build-your-own)
