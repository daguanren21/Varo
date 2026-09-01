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

Block 只拥有本地表单组合和类型化事件，不包含用户接口、鉴权、远程城市字典或保存策略。业务层通过 `initialProfile` 与 `cities` 注入数据，监听 `submit` / `cancel` 执行真实业务。

## 相关文档

- [构建你自己的 Block](/blocks/build-your-own)
