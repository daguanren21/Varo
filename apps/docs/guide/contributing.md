# 如何贡献

## 推荐落地顺序

1. 先在 `primitives-core` 定义状态模型或交互行为
2. 再分别在 `primitives-h5` 与 `primitives-weapp` 做平台适配
3. 然后在 `ui-h5` 与 `ui-weapp` 提供官方封装
4. 最后补齐单测、文档与必要的演示页

## 提交要求

- 保持 workspace 正式包引用，不使用临时跨包相对路径
- 为核心状态与封装行为补齐 Vitest 单测
- 文档至少覆盖安装、主题、国际化与使用示例