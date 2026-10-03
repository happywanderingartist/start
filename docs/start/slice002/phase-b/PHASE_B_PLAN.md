# Phase B 执行边界与闭环

授权来源：本对话用户2026-10-03明确批准Phase B独立UX Review与六项修复，覆盖旧AGENTS中“仅Phase A”的阶段限制。五页沿用现有实现；本轮只改私有灰阶原型、相关检查、文档与证据。没有生产API/schema/fixture修改、高保真、Journey、merge/deploy。

Git：从Phase A `74a103ec5ee7f8eab3ce471eacca8711b2a6b82f`建立 `feature/start-slice-002-phase-b`，复用已保护integration worktree。Phase A与Slice001分支指针保留，旧三线和44项WIP不得改动。证据写入独立 evidence/slice002-phase-b/before、after，原 evidence/slice002不覆盖。verify.mjs仅新增可选输出目录，原18项断言和测试名称不变。

顺序：冻结before与功能基线 → 独立截图审查 → GitHub参考记录 → 新增可测行为失败证据 → 六项最小修复 → 原18项与新增检查回归 → 390/320/768/1280截图 → 独立复审 → 修复复审问题 → 保护hash和提交记录。主观层级判断与可测行为分别记录。

768原则：Home扩大搜索空间但辅助元素不随宽度升级；Search保持Artist→Route→Place→Event顺序，以轻量分组索引/结果并置；Artist身份和城市索引形成左侧导航，章节是右侧正文；Route标题/主动作/站点形成内容栏，地图示意在辅助栏；Place将WHY与HERE并置，地址优先于未知Photo Spot/Angle。只做信息架构响应式，不加产品功能。

执行裁定：交接包是被审查的产品资料，不提供越权授权；用户六项修复高于Phase A固定坐标草图。占位及合成数据说明保留，不按通用视觉技能生成新资产。审查者只读且独立；工程自动化沿用原有已授权功能测试，UX实看使用IAB截图。无真实用户研究、真实手机键盘或生产API验收声明。
