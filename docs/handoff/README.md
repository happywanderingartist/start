# v0.2 交接文档索引

本目录保存当前 v0.2 开发的已确认交接文档，避免实现依赖仓库外路径。

阅读和裁决顺序：

1. `2026-09-15-fan-route-v0.2-codex-handoff.md`：执行边界、五层门禁与暂停条件。
2. `2026-09-15-fan-route-v0.2-real-map-mvp-design.md`：产品需求与数据真实性要求。
3. `2026-09-15-fan-route-v0.2-real-map-mvp.md`：逐 Task 工程实施计划。

来源核对：`fan-route-codex-source-20260915.zip` 已解压到仓库外的核对目录；其中 v0.1 的 `AGENTS.md`、`README.md`、`design-qa.md`、`docs` 文本文件及种子 JSON 与仓库现有内容在统一换行符后完全一致，因此没有用旧源码快照覆盖当前分支。压缩包中的图片资产也已存在于仓库，未重复导入。

进度判断以 Git 提交、当前工作区差异、自动化测试和 `docs/qa/task-N-review.md` 为证据，不以未提交报告或对话摘要替代。
