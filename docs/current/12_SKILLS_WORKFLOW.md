# Skill、参考项目与协作约束

用户2026-10-16明确：后续所有任务先调用成熟相关skill，写好文档确认再开发。不是只在汇报中列skill名称；需先读真实SKILL.md，把适用原则写进本批决策与验收。用户最新指令优先于skill的通用建议。

| 工作 | 原机skill | 用法 |
| --- | --- | --- |
| 交互结构/状态 | D:/AI-Data/Codex/skills/interaction-design/SKILL.md | 信息顺序、主次操作、加载/错误/返回、可见反馈 |
| 系统底座 | D:/AI-Data/Codex/skills/apple-design/SKILL.md | 物理一致性、可中断手势、触按反馈、克制材料和reduced-motion |
| 去AI模板 | D:/AI-Data/Codex/skills/hallmark/SKILL.md | 参考约束、独特性、层级、留白与内容结构 |
| 动效 | emil-design-eng / animate / review-animations | 先判断动效目的，再选工具和数值；不要用缩放形变冒充角色动画 |
| 多步开发 | 已安装superpowers writing-plans / executing-plans | 明确接口/文件/测试、顺序执行、记录偏差 |
| 测试/修复 | test-driven-development / systematic-debugging / verification-before-completion | 先复现失败，定位原因，验证后声明完成 |
| GitHub研究 | D:/AI-Data/Shared/skills/agent-reach/SKILL.md | 优先成熟项目；维护者、提交、许可证、测试及实际使用；无法获取如实记录 |
| 文档交接 | D:/AI-Data/Codex/skills/neat-freak/SKILL.md | 同步代码/运行态/规则/证据；保留历史与待确认清场 |

本轮交接实际使用Neat Freak；此前Book计划已读取Interaction Design、Apple Design、Writing Plans、Agent Reach，开发又读取Executing Plans、TDD与Verification Before Completion。安装版本路径可能更新，新环境须重新发现，不能把目录存在当成skill已加载或已生效。本包只列来源，不复制所有第三方skill或本机插件缓存。

## 工程研究前置

任何代码/产品工程实现前先查功能相似成熟GitHub项目，至少写一个可复用优势和一个明确局限，审许可证、维护/测试与实际用法。没有合适结果要记录范围与原因后再实现。不直接复制未审代码，也不把星标当成正确性证明。

已经记录的参考：Payload内容权限/版本、Medusa事务思路、Sharetribe物料和申请分离、Immich私人记录与选定分享、SortableJS拖动、Embla轮播。它们各有框架/服务/许可局限，START没有采用全部系统，详见各计划与历史资料。

## 文档确认与权限

需求/结构文档 → 对应批次确认 → 新视觉稿和直接图片 → 对应视觉确认 → 前后端实现 → 回归与审查。确认限本批，不自动批准下一页。常规读取、本地可逆修复、测试已经授权，减少重复权限询问；云付费、公开部署、真实账号权限、破坏性清理及阶段审批不因一般“继续”自动越过。

自动审核拒绝时明确告诉用户动作和原因，不绕过。用户要求不要切模型、买额度或重置卡绕限制。自动恢复只针对指定START对话的原额度中断工作；不因空闲启动别的项目。没有明确要求不新增用户可见对话或并行agent。

## 写作与文件

中文自然段，阅读效率优先，少无关解释；只在比较和并列事项时用表格列表。所有新文件/数据/图片/导出/下载/skill默认D盘；现有D项目保留原位置。不要为方便写C盘临时目录，工具强制时说明。

当前代码、测试、已配置、视觉确认、真机、上线六类状态分开。发现旧文档冲突时写明覆盖，不删历史冒称无问题。未经复核后的明确授权，不清工作树、测试库、原图或备份。
