# START Journey / Memory 原型交付

本批完成本地演示闭环：Route START → Journey → Arrival → Finish → Ticket → Editor → START Book，并补最小 Me 入口。地址 http://127.0.0.1:4313/；旧 Discovery 服务 4312 保留。首页原稿、四卡排布和 Logo 输入保持原样。

Journey 包含路线快照、手动到达、跳过、返回补走、刷新恢复和自由结束；票根只记录到访站点，支持零站结束、标题与注记、照片替换/移除、两种版式及星芒开关。编辑取消保留旧卡，加入临时卡册后可重新打开。九色组合与 Apple Music 系统底座已写入独立 UI 合约，并通过设计 skills 检查。

验证结果：13 项状态测试、9 项 Journey 浏览器场景、10 项 Memory 浏览器场景、1 项禁用表单沙箱回归，共 33 项通过。测试使用合成路线；屏幕证据及 JSON 报告在 evidence/。原 Discovery 的 31 项历史结果保留，本批不把它们计为重新执行的检查。

Open Design 项目 23d86b85-b67b-42f0-8b1b-d7c118a9d81c 的 journey-memory/ 已同步可编辑源。实际预览操作确认结束、票根、编辑保存与加入卡册；生成引擎调用失败仍未解决。原生成任务的颜色提示早于用户最新色卡，当前实际源码以 PALETTE_AND_UI_CONTRACT.md 为准。OPEN_DESIGN_SYNC.json 登记当前源码一致性，INPUT_PROVENANCE.json 登记旧基线，不覆盖原项目根目录或 baseline。

修复了 Arrival 恢复站点、编辑版式标签、存储异常内存保留和 Open Design 沙箱保存问题。最后一项先复现失败，再修改显式保存动作，回归通过；未放宽沙箱权限、切换模型或绕过额度。

仍未完成：用户对新页面的视觉验收、正式 Figma 一致性及 Phase C 最终验收、真实 API/定位/导航/登录、长期存储、真实生成服务、导出分享、投稿、Community 和完整 Me。当前仅为本浏览器 sessionStorage 演示，地图不能导航，合成内容不是艺人到访证据；Open Design 刷新还可能重置记录。没有合并、部署或实地路线验收。

下一批按既定计划推进投稿路线的来源录入、站点排序、预览与模拟审核状态，再推进 Community / Event Hub；正式接口接入另按阶段条件执行。
