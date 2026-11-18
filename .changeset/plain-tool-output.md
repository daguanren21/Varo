---
"@varo-ui/cli": patch
---

fix(agent): 展示工具的实际 output，避免把 input/output 内部包装对象打印到对话。

保留 SDK 消息、工具输入、失败状态及历史结果关联。H5 与原生共享同一展示投影；字符串输出直接呈现，结构化输出保持 JSON 内容。
