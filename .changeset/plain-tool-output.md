---
"@varo-ui/cli": patch
---

fix(agent): H5 对话展示工具的实际 output，避免把 input/output 内部包装对象打印到对话。

保留 SDK 消息、工具输入、失败状态及历史结果关联。H5 直接展示字符串输出，结构化输出以 JSON 展示。原生对话不直接展示 SDK 工具载荷，只通过 `toolCallPreviews` 展示应用提供的安全文本。
