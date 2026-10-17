# 物料集市原型交付

视觉确认：用户“确认，请继续”，对应 Trade V2 最终视觉稿。标题“塞我点物料吧”，栏目“物料集市”，蓝色状态标签与按钮。Community V2 修订没有获批，本批不替换其样式。

实现：活动详情入口 → 列表与区域筛选 → 公告详情 → 发布/编辑 → 我的公告 → 五种状态切换。四项必填，备注/照片选填；本地照片限制 PNG/JPEG/WebP、500 KB。草稿按活动与公告身份隔离，刷新恢复。关闭公告仍在我的公告中，可恢复换物中；公共列表不显示关闭公告。

边界：当前为本地演示。没有发布到服务器、真实账号、私信、交易、地图定位或支付。sessionStorage 只保证同一浏览器标签会话恢复；存储失败会显示仅当前页面保留。样例 ongoing 活动允许发布；walk 保持 upcoming，不变造为进行中；ended/cancelled/incomplete 禁止发布编辑。Me、角色与投稿的下一批视觉审批尚未完成。

工具与方案：生成结构前使用 Interaction Design、Apple Design、Hallmark；executing-plans 执行，requesting-code-review 独立审查。GitHub 复核 Sharetribe Web Template 的列表/编辑隔离和可访问性修复；Apache-2.0，组织维护，测试命令存在。优势是编辑草稿与列表分离，局限是依赖 Sharetribe 配置且交易体系远大于活动物料集市。本批无代码复制和新依赖。参考：https://github.com/sharetribe/web-template 、https://github.com/sharetribe/web-template/releases 、https://github.com/sharetribe/web-template/blob/main/package.json 。

验证：70 项自动检查通过（24 状态单测；9 行程、10 纪念卡、1 沙箱、5 已确认票根、8 Community、8 Trade、4 补充浏览器检查、1 照片异步竞态）。Trade 六种宽度 48 个页面样本；包含键盘、reduced-motion、返回筛选/滚动恢复、照片上传移除、损坏存储、存储失败、HTML 直接入口。独立审查发现编辑草稿混用和延迟照片串入另一公告，均有失败后通过的回归证据。无照片的移除按钮被基础 CSS 覆盖 hidden，补入限定作用域 hidden 规则并回归通过。修复旧独立 HTML 入口缺控制器依赖。首页、Logo、行程/纪念卡状态与视图、票根 CSS 共 7 个受保护文件 SHA-256 与原 Community 版本一致。

Open Design：文件同步到现有项目 trade-implemented，哈希核对 0 差异。实际打开 trade.html，点我的公告、发布页、填写并保存本地测试公告，显示“公告已保存到本地演示”，截图 evidence/OPEN_DESIGN_VERIFIED.png。此结果证明 Open Design 预览和交互可用，不代表其 Antigravity 生成引擎故障已修复。

启动：在 prototype 目录执行 node server.mjs，地址 http://127.0.0.1:4316/events/ongoing/trade 。原版本目录保留，无提交、合并或部署。

执行决策：草稿随字段输入保存，避免返回后丢失；可变更活动状态仅来自既有合成 fixture；历史副本作为回退保留。这些选择的限制是演示会话数据不代表服务端持久化。

追加分区修订：活动详情入口与物料集市列表加入亚麻底、湖蓝边线和章节标题。16 项 Trade/Community 浏览器检查重新通过；未改业务状态与受保护文件。
