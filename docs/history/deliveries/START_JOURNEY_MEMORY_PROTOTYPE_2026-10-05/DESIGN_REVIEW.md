<!-- Hallmark · pre-emit critique: P4 H4 E3 S4 R4 V4 -->
# 第一批原型设计审查

2026-10-05。上述评分为源码与实测画面的自评，不是用户视觉验收。执行质量为 3：当前没有真实路线摄影、完整手势动效或正式 Figma 对照；不以几何封面替代最终摄影设计。

Apple Music 的底座用于系统字体层级、主要动作、渐进披露、连贯返回和即时反馈。START 保留旅行杂志的纸页章节和品牌资产。最新九色合约见 PALETTE_AND_UI_CONTRACT.md，批准首页和 Logo 原文件不变。

| Skill | 本批实际应用与检查 |
|---|---|
| Apple Design | Journey 地图与下一站分主次，全部站点默认折叠；动作及时更新状态，取消和返回保留上下文；768 起重新分栏 |
| Hallmark | Journey 是地图与过程，Arrival 是照片与资料，Ticket 是票券，Book 是层叠章节；没有整页卡墙、虚构摄影或指标，六个宽度无水平溢出 |
| Interaction Design | 到达需手动确认，跳过可补走，任意站数可结束；编辑先用草稿，保存和取消不同；存储失败保留当前卡并提示 |
| Emil Design Engineering | 按压反馈 120ms，页面进入 180ms，以 transform/opacity 实现，reduced-motion 禁用；未实现拖动翻页和物理弹簧 |
| Systematic Debugging | Open Design iframe 缺少 allow-forms，复现原保存按钮失效；改为显式按钮调用同一保存逻辑，保留表单校验，不改变应用沙箱权限 |
| Verification Before Completion | 状态、流程和沙箱检查实际运行；原输入及 Open Design 同步文件使用 SHA256 核对 |

| 修正前 | 修正后 | 原因 |
|---|---|---|
| Arrival 刷新可能回到下一个待到访站点 | stop 参数固定当前到达页 | 到达反馈属于当前站点，不能因恢复误指另一站 |
| 存储写入失败后重新读取可能丢失内存中的修改 | 文档生命周期只读取一次，当前记录继续可见 | 不能把写入失败变成页面数据丢失 |
| 编辑页使用 submit 按钮 | 明确保存动作，并复用表单验证及保存函数 | Open Design 的脚本预览可运行，但禁止表单提交 |

实测尺寸为 320 / 375 / 390 / 414 / 768 / 1280；截图保存在 evidence/journey-browser 与 evidence/memory-browser。检查包括来源 sheet 的 Escape 关闭、到达页操作目标至少 44px、reduced-motion 和运行错误。没有宣称完成屏幕阅读器、全键盘、所有对比度与长文本组合的完整可访问性审计。

Open Design 中实际操作了 Route → Journey → Arrival → Finish → Ticket，以及修复后的编辑保存 → Book。其生成任务仍显示“运行失败 7.5s”；本批源码由外部 Codex 完成后导入，不能宣称由生成引擎成功产出。沙箱预览刷新可能重置临时记录；长期保存不在本批范围。

后续视觉优化应使用真实可授权照片、用户确认的更多封面样式及更完整的交互验收。当前优先保证层级、版式差异和准确状态。
