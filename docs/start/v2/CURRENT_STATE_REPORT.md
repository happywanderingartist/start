# START 当前状态报告 — V2 对齐版

日期：2026-10-01（Asia/Shanghai）。当前阶段：产品规格 V2 已接收，开发计划已重新对齐，等待确认；没有开始 Slice 000/001 执行。本文件是新版当前报告，替代旧报告中的产品范围和首切片建议；旧报告原件保留为历史审查证据，不覆盖旧工作区。

## 1. 新基线与本轮阅读

用户上传的实际文件为 `D:/Downloads/2START_PRODUCT_SPEC_V2_PACKAGE_2026-10-01.zip`，包名为 START_PRODUCT_SPEC_V2_PACKAGE。ZIP SHA-256：`994E926C855F6DB11E05D7450FF27491941C89EBC821D465820F70CCDAC3597B`。审查副本为本目录 `source/START_PRODUCT_SPEC_V2_PACKAGE/`。16 个文件全部读取、ZIP 与解压文件逐项哈希一致；MANIFEST 列出15个内容文件，不包括自身，15/15 的大小与哈希一致，不存在漏文件。

先读 00_README，再按用户优先序读取 01 PRD、02 Flows、03 IA、04 Domain、11 Roadmap、12 Alignment Patch、13 Decision Log；随后完整读取05 Search、06 Trust、07 Journey/Memory、08 Community/Event/Trade、09 Me/Card/Doll、10 Design/Figma、SOURCE_NOTE及MANIFEST。V2未含新视觉图片，继续使用此前完整读取的 START_CODEX_VISUAL_REFERENCE_PACK_v2；不把旧粉紫确认图重新提升为权威。

当前用户要求优先；产品依赖链按V2 README为 PRD → Flows → IA → Domain → 专项规格 → Roadmap → Figma → Engineering，Decision Log核对锁定项。旧Fan-route/旧PRD/旧计划冲突内容为历史。本包内“后续应实现”“建议API/文件”的说明是设计资料，本轮授权仅限计划对齐，不能当作创建源码、migration、seed、Figma或部署的指令。

新版文档放在外层 `D:/Downloads/fan-route-codex-handoff/start-v2-alignment/2026-10-01/`，该目录不是Git integration工作区。三个旧工作区只读，原计划/报告不改；确认后由 Slice 000 将本轮文档及完整来源/provenance纳入独立START工作区的文档基线。现有 INTEGRATION_BASELINE_PLAN 的Git/资产保护方案继续有效，里面的1A/1B编号、旧产品发布门槛和UI范围由本轮V2文档替代，不整体照搬。

## 2. 仓库真实状态与进度

| 工作区（相对外层目录） | HEAD / 分支 | 已完成成果与当前局限 |
| --- | --- | --- |
| `fan-route-codex-handoff/` | `1def607be517cb2e5bbf7c183125836a113ea5ce` / master | React/TS/Vite/Router与原型检查入口；单路线详情、进行中、localStorage、导航模拟、收藏/分享原型。不是V2正式产品 |
| `.worktrees/fan-route-v0.2/` | `b9a4623292ca373869b9feb8343d6d36e0b1d36f` / feat/fan-route-v0.2 | Task 1–6地图领域、AMap适配/错误/缓存/局部重算、Worker API、南京POI确认链、QA4–6。Task7有未提交client/repository/tests，首页仍未接真实搜索。后续Task8–11没有完整验收 |
| `.worktrees/character-asset-baseline/` | `a8ece9707afca3a8106ec09b8d2a215dd30aa456` / feature/character-asset-baseline | 18张正式透明资产、R01/R02身份、manifest与门禁；验收加强未提交。未接Doll runtime，无sit/look等连续动作系统，不重新生产已有母版 |

本轮读取三处Git HEAD、完整dirty清单与dirty文件SHA-256。既有状态为master 24项、v0.2 13项、角色7项，共44项（含上轮3个计划）；没有本轮新增旧工作区文件或改动。明细沿用原INTEGRATION_BASELINE_PLAN：视觉/角色规范、参考图/拒绝草稿、研究/ADR/旧产品计划、搜索半成品、角色验收脚本/测试均保留。master旧角色规范与角色分支已验收服装规范冲突，正式承接使用角色分支，旧稿保存历史，不能覆盖同名文件。

历史 Task/聊天定位、提交来源、原型与角色验收详见旧 CURRENT_STATE_REPORT；本轮未向旧Task发送新任务。已检查现有文档/目录，未发现已经完成的新START integration、PostgreSQL迁移、四实体Search/API、Artist Hub、Place Detail或正式Figma交接，不能把计划复选项当实现。

### 测试证据的时间边界

本轮未重跑测试、构建或真实provider调用，避免触碰旧工作区生成物。沿用上一轮2026-10-01实际日志，不将旧结果说成本轮新验证。

| 工作区 | 最近已记录结果 | 证据位置（外层） |
| --- | --- | --- |
| master | check退出0，Vitest21/21、Node5/5、typecheck/build通过 | `handoff-review-2026-10-01/main-check.log` |
| v0.2 | frontend47/52，5项App失败；typecheck/build通过；Worker60/60 | 同目录 `v02-frontend.log`、`v02-typecheck.log`、`v02-build.log`、`v02-worker.log` |
| character | check退出0；资产13/13，正式18张/0错误；Vitest21/21、Node18/18、typecheck/build通过 | 同目录 `character-check.log` |

v0.2测试既有选择器漂移，也有真实搜索状态缺失；不能仅改label使其转绿。以上不证明V2验收、真PG、国内访问、实机导航或目标用户闭环通过。批准执行后在独立新工作区重跑对应保留测试和新基础测试。

## 3. V2 与现有实现/旧计划的差异

| V2锁定要求 | 实现/旧计划现状 | 本轮对齐与后续归属 |
| --- | --- | --- |
| START先是追星产品，完整价值含发现/现场/记忆/UGC/现场换物 | 原型和原首切片只覆盖单路线读链 | 旧三页链仅技术验证；采用Slice000–007，不能声称三页完成即START完成 |
| Search四实体Artist/Route/Place/Event | 实现只有本地RouteBundle，旧新计划仍Route-only | 001固定多实体SearchProvider/DTO/PG查询；002实现多实体呈现，空实体也保持合法section |
| 城市Artist→Route→Place→Event；艺人用户点击进入Hub | 旧计划按route score输出，Artist仅内部识别 | 显示section优先级与组内rank分离；001Artist Hub读API，002实体页；无固定跳转 |
| Artist Hub身份/足迹城市/推荐路线/optional events | 无页面、无读模型 | 纳入001读取基础与002正式发现结构，不当百科页 |
| 首页输入+少量推荐气泡+Doll低频轻互动 | 旧计划纯搜索为主，娃娃可有可无 | 002设计必须容纳三者；推荐算法可渐进，Doll runtime在003，不能永久删出首页 |
| Route第一屏Hero/title/artist/city/why/story；可信→想去→怎么走 | 旧详情/计划偏统计、站序与核验指标 | 001DTO补why/story/relation summary；002按V2信息层级设计，地图/交通后置 |
| 主CTA开始路线，次CTA分享给朋友 | 旧计划将查看站点定为主动作 | 正式CTA恢复；003接Journey。002阶段可disabled/feature flag/design-only，不用查看站点替代长期CTA |
| Place真实、艺人关联、具体claim证据、发布状态分开 | 旧POI confirmed被误读为全事实，计划门槛偏全核验 | Claim/Evidence独立模型及public字段；approved且合规未核验可发布并展示，严重争议/隐私/侵权仍禁止 |
| RouteRevision冻结，可重现 | 旧routeStop混visitStatus、算路version不是内容revision | 保留map version历史，001新canonical内容版本；Journey进度003单独实现 |
| Event正式Search实体，最小Event/EventArtist | 旧计划Event全后置 | 001实现最小schema/公共投影/查询；006才做完整Event Hub/Live Trade |
| 轻量Poster编辑、册子式Book、自由结束、GPS提示需人确认 | 旧原型模拟推进；海报曾写后续版本 | 分别003/004；已有规则可复用，不把旧状态/UI直接认作V2完成 |
| UGC统一新建路线、证据/初筛/人工审核，可未核验发布 | 原型没有写链，旧计划严格已核验才能发布 | 005执行，001只实现必要状态/发布验证与受控seed工具，不建完整CMS |
| Me层级Card/Doll/Book；无匹配分、无养成 | 老StarPet、旧功能入口和角色静态资产 | 003/007接runtime与身份；资产保留，宠物/复杂衣柜不扩P0 |
| Figma正式source，001技术参考不能长期定稿Search | 旧三页Figma计划尚未执行 | 本轮Figma计划重界定为001非正式验证边界+002五页正式Discovery计划，Event Hub设计006 |

## 4. 保留、迁移与历史保留

保留React/TS/Vite、Router、统一测试/打包基础；map adapter、nullable指标语义、缓存/局部重算/幂等/错误校验及配套测试按职责迁移，算法不重做。南京五POI四路段原确认材料保留：1496米/1198秒是历史交通结果，非总游玩时间；关联事实未审核，不能自动公开或标“已核验”。已验收R01/R02、18资产及门禁保持身份authority；二进制哈希保护，不生成新脸。

routeSession恢复、防重复到达等用例留作003输入，旧Task7查询/错误/取消用例留作001/002输入；重构为canonical接口，不采用单路线published数组。v0.3 Proposed ADR的modular monolith、版本/Journey分离、地图边界可用，旧IA与P0排除项不再有效。固定南京定时跳转、四项导航、玻璃视觉、老星宠UI、模拟导航与匿名收藏只历史保留；不删除原件，也不迁入新产品作为正式方向。

原INTEGRATION_BASELINE_PLAN的固定master起点/独立工作区建议、WIP/bundle/ignored证据备份与provenance办法总体保留；本轮不执行。旧1A映射001，旧1B由002吸收并扩为五页Discovery，角色runtime属于003而非001。备份时以重新读取的44项及本轮外层文档为准，不能继续使用旧41项计数漏掉上轮计划。

## 5. 技术债、风险与下一执行边界

主要债务仍为硬编码单路线、全局session与内容耦合、JS Worker/TS domain双合同、成功response裸as类型、进程Map持久化、providerID混canonicalID与不完整来源。新增风险是只在DTO增加type但仍只有route查询、把城市section顺序做成跨实体score、Hub城市块混淆已核验足迹与未核验线索，以及以published表示verified。新计划分别用四类PG投影/测试、section顺序、逐项trust summary与审查门槛解决。

先执行经确认的Slice000保护，再执行001Catalog & Discovery Foundation。001建立真实PG、canonical表/版本、multi-entity查询/Hub读模型/public DTO、状态及基础测试；不制作正式发现页，不执行migration/seed直到执行批准。001技术通过不代表真实内容已可发布，002通过不代表完整P0。所有写链、GPS、Journey、Poster、UGC、Community、Trade、Card、Doll runtime按roadmap后续实现。

## 6. 仍需用户确认的阻塞性产品决策

当前Slice001架构/合同设计没有尚未锁定且真正阻塞实施的产品决策，因此不追加产品问题。多实体、Artist Hub、城市顺序、首页三元素、Route信息层级/CTA、未核验发布、三导航及slice归属已由V2锁定。当前等待的是本轮计划的执行批准，不是重新询问这些产品方向。

首批真实艺人/路线、Event来源和素材授权属于真实内容就绪/发布门禁，不阻塞用隔离synthetic fixture完成基础测试；未确认的数据不公开。匿名Journey登录时点、Poster分享、Community轻内容、Trade轻响应、地图/托管vendor分别在后续切片临近执行时细化，不列作001阻塞问题。实现遇到具体无法套用V2规则的内容审核案例，再就该案例提交确认，不泛化为全架构阻塞。

本轮文件：本报告、SLICE_001_IMPLEMENTATION_PLAN、FIGMA_PLAN_SLICE_001、SLICE_ROADMAP_V2；新源包和旧来源均原样保留。完成对齐后停止，等待确认。
