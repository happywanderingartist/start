# START Slice 001 Implementation Plan

> 执行者：确认后使用 superpowers:executing-plans 逐任务执行，完成行为测试、实现、复测和审查再提交；本计划不要求创建子代理。所有任务当前均未开始。

**Goal：** 先建立 canonical PostgreSQL 与共享公开读取 API（1A），再实现 Start 输入 → 已有内容结果 → 已发布 Route Detail（1B）。**Architecture：** 一个 Modular Monolith API 部署单元，Discovery 与 Catalog 为内部模块；SearchProvider 的第一实现直接读 PostgreSQL。Web/未来微信小程序/App 共用 API 和数据，不共用数据库凭据。**Tech Stack（待本计划批准）：** 保留 React/TypeScript/Vite/Router/Vitest；API 使用 Node.js + TypeScript + node-postgres 参数化 SQL，少量 Node HTTP 路由，不引入完整 CMS/微服务框架。SQL migrations/seed 从第一天版本化，使用真实 PostgreSQL 集成测试。未安装依赖或选择托管 vendor。

日期：2026-10-01。依据：已批准 CURRENT_STATE_REPORT.md、REFERENCE_NOTE_001.md、本轮需求、主交接 PRD/Product Design Spec/DATA_MODEL_V1/TECHNICAL_ARCHITECTURE_V1/Decision Log/视觉包 v2；本文件补充执行细节，不改变 P0。关联计划：INTEGRATION_BASELINE_PLAN.md、FIGMA_PLAN_SLICE_001.md。本轮只交付计划，不写源码、migration、seed 或测试代码。

## 1. 范围、顺序与决策门禁

中国大陆为第一市场，先 Mobile Web。主导航固定 Start / Community / Me，无 Go。1A 只提供匿名公开只读 API及可信离线 seed 工具；1B 不生成路线、不自动导航、不执行 Journey。登录、收藏、投稿/审核界面、Journey、Community/Event 功能、真实导航、海报均不提前实现；投稿与纪念海报仍是后续 P0，不移到 P1。无微服务、独立搜索集群、LLM、vector search、复杂 CQRS、后台队列或无用途的空模块。

依赖顺序：Git 保护基线通过 → 1A schema/迁移/seed/查询/API/集成验收 → 1A 审查通过 → Figma 低保真结构评审、高保真/状态/响应式与 prototype 批准 → 1B 页面实现和全链路验收。确认本轮三份文档后只进入 1A；1A 不受 Figma 高保真制作阻塞，也不借机先写页面。Figma 计划确认仅授权计划范围，具体低保真和正式交接仍须评审。

| 技术选择 | 采用/取舍 | 验证门禁 |
| --- | --- | --- |
| 单 Node API + PostgreSQL（推荐） | 延续 JS/TS 生态，清晰 API/SQL 边界；旧 Sites Worker 是历史部署，不假设其可直接连 PostgreSQL | 1A 首任务记录 ADR，验证 Node/driver/PG 版本、可运行环境、连接池和测试库。大陆托管/HTTPS/vendor 在实际部署前另做访问与成本验证 |
| 旧 Worker + 专有数据库代理 | 可沿用旧运行环境，但新增外部代理/平台绑定 | 当前不选，旧 Worker 仍保留，不迁入进程 Map 作替代数据库 |
| Supabase/Strapi 整套部署 | 现成能力多 | 当前读链路无需全平台/CMS/Auth，多服务超出范围，不选 |

生产运行目标需一个支持 Node 和 PostgreSQL 连接的环境；未锁定 cloud vendor。本机无 PG/Docker 时记录阻塞并取得可用的专用测试数据库，不能用 SQLite、内存 mock 或跳过 integration tests 宣称 1A 完成。不向生产库运行本地迁移/seed，不公开部署继承的模拟首页。

## 2. Reference Before Implementation

REFERENCE_NOTE_001 的三项目研究是本切片的主要学习依据：Meilisearch 学查询/展示合同和派生搜索边界，局限是引擎/队列不解决 canonical 发布事实；Supabase 学 Postgres 真源和版本化迁移，局限是整套平台多服务与默认云不可直接作为大陆方案；Strapi 学稳定内容身份、发布过滤和事务，局限是 CMS 生命周期不等于 START 验证语义、repository 不能裸返 public。各仓维护/星标/近期可见提交/许可证与已读文件详见原记录；网页缓存不是当前精确 HEAD，不复写虚假的“最新”数据。

2026-10-01 补查 GitHub 搜索并打开上述关键文件，以及 [node-postgres 仓库](https://github.com/brianc/node-postgres)、[query.js](https://github.com/brianc/node-postgres/blob/master/packages/pg/lib/query.js)、[查询用法](https://node-postgres.com/features/queries)、[LICENSE](https://github.com/brianc/node-postgres/blob/master/LICENSE) 与提交页。可见约 13.2k stars，Brian Carlson 等维护；README 要求真实 PostgreSQL 测试，提交页缓存不足以锁定当日 HEAD，本轮没有运行其测试。可复用优势是参数和值分离、错误与客户端职责清晰；明确局限是 driver 不负责审核、DTO、migration 或领域规则，不能因采用 pg 就宣称架构完成。根许可 MIT，未来安装精确版本和传递依赖另核验；不复制 query.js。该补查归入本实施计划，不另增第四份研究文件。

实施任务 A0 必须固定实际使用的参考 commit、driver/package/PG 版本及许可证台账，再修改工程。Meilisearch MIT/BUSL、Strapi Community/ee/cloud 边界延续原记录；参考截图、字体与地图数据不随代码许可自动授权。只复用 pattern，自行实现 START。

## 3. Slice 1A 数据模型与不变量

选择 `RouteRevision` 为唯一正式版本实体名：它既承载 reviewable revision，也保存发布后的不可变内容版本，避免并建意义相同的 RouteVersion 表。Route 是稳定 ID；`published_revision_id` 指向当前公开版本，`revision_id + revision_number` 是未来 Journey 的固定引用。旧 v0.2 算路 version 只是地图计算版本，不能直接当内容 revision。

| 实体/表 | 最小字段与关系 | 核心约束 |
| --- | --- | --- |
| Artist / artist | UUID、canonical_name、normalized_name、type、verification_state | 名称非空；验证 state 明确；canonical ID 与 provider 无关 |
| ArtistAlias / artist_alias | artist_id FK、alias、normalized_alias、locale | 同艺人同 normalized_alias 唯一；不同艺人可同名，必须保留歧义；不臆造别名/拼音 |
| City / city | UUID、name、normalized_name、country_code、administrative_code nullable | 中国大陆合法行政实体以来源核验；code 有值时唯一，不从字符串猜城市归属 |
| Place / place | UUID、city_id FK、name、address、longitude/latitude nullable、coordinate_system、verification_state、verified_at nullable | 坐标必须成对；有坐标则必须有 GCJ-02/WGS84 等明确体系及范围校验；unknown 不伪装为 confirmed |
| PlaceProviderRef / place_provider_ref | place_id FK、provider_key、provider_place_id、observed_at、source_ref | provider+外部 ID 唯一；AMap ID 不作为 START place 主键，保存历史确认时间 |
| Route / route | UUID、slug、city_id FK、linked_artist_id nullable FK、publication_state、published_revision_id nullable | slug 唯一；公开指针用复合 FK 确保 revision 属于本 route；不含用户 visitStatus |
| RouteRevision / route_revision | UUID、route_id FK、revision_number、title、summary、verification_state、review_state、published_at nullable、内容 snapshot | route+revision_number 唯一；冻结后不原地修改内容。发布快照含艺人/城市显示、媒体引用、统计与证据状态；新修订不能改已发布旧版 |
| RouteStop / route_stop | UUID、revision_id FK、place_id FK、sequence、stop_note、stay_minutes nullable、place_snapshot、relation_id nullable | revision+sequence 唯一、sequence>0；发布时顺序连续、至少一站；允许同一 Place 在路线中重复，不错误加 place 唯一约束。无到达/打卡进度字段 |
| ArtistPlaceRelation / artist_place_relation | UUID、artist_id/place_id FK、relation_type、explanation、verification_state | 表达“为什么相关”，独立于 POI 真实性；无需关联的中立站点不可写成艺人到访 |
| EvidenceSource / evidence_source | UUID、source_type、url nullable、public_title、public_excerpt nullable、observed_at、review_state、visibility | URL只允许 http/https；公开摘录需授权与清洗；私人提交者、原始截图和审核备注不返回 public API |
| RelationEvidence、RevisionEvidence、StopEvidence | relation/revision/stop_id + evidence_id FK | 用显式关联表保证 FK，不用无约束 entity_type/entity_id；StopEvidence 可表达具体 claim 与 verification_state，支持纠错定位 |
| MediaAsset / media_asset（只读最小注册） | UUID、object_key、mime、width/height、rights_state、visibility、source_evidence_id nullable | 只登记受控封面/来源元数据，不实现上传/存储服务。对象 key→public URL 使用允许来源配置；无授权时返回缺图而非盗用 REF 图片 |

本切片新增的 ArtistPlaceRelation、provider ref 和最小媒体注册是读链路正确表达来源/封面所需，不开展相应编辑产品。creator_user_id 在未有 User 表前不建悬空伪 FK，当前官方 seed 的署名用明确 editorial credit；后续账号切片通过迁移加真实 User FK。Event/Community/Submission/Journey 不建空表；未来引用 Artist/City/Place/Route 的稳定 UUID，新增关联表即可，不把这些关系塞入路线文本或通用 JSON。

快照只保存会影响版本重现的展示字段；实体关系、站序和证据 FK 仍是关系型数据。发布时 snapshot 包含 Place 名称/地址/坐标系/验证时间、事实摘录/核验状态及路段指标的来源和 computedAt，防止修改 canonical Place/Evidence 后旧 Journey 内容漂移。当前安全撤回/媒体禁用覆盖历史公开展示权限，但不抹掉审计快照；旧 revision 不自动开放 public 查询。

### 核验与公开状态

三个维度不混用：publication_state = unpublished / published / withdrawn；review_state = draft / pending / approved / rejected；verification_state = unverified / partial / verified / disputed。POI confirmed 只映射地点核验，艺人关联、每项事实、地图指标各有自己的状态和时间。Evidence review/visibility 不等于 route publication。

公开条件：Route published + 指针所属 revision approved/已冻结 + 至少一站 + 地点可公开 + 核心艺人关联/事实有可公开证据且已核验，无 disputed 的核心事实。非核心补充未核验可不公开该 claim，或在经批准规则下显示明确未核验，不能一枚“已验证”标签覆盖整条路线。历史内容后来失效时状态/警告从当前 eligibility 读取，不继续沿用“fresh”。source URL失效显示来源暂不可访问，不自动否认或自动证明历史事实。

跨表发布门槛不能写成跨行 CHECK；用事务内发布验证、同 route 复合 FK、公开视图/查询 eligibility 共同落实。[PostgreSQL 官方约束文档](https://www.postgresql.org/docs/current/ddl-constraints.html)说明 CHECK 不保证其它行数据。发布快照用 DB trigger 或写权限阻止 frozen 内容更新，生命周期字段变更与内容冻结分开；测试直接 SQL 非法写入也被拒绝。对同 route 发布操作加行锁，新 revision/stop/证据验证和切换指针在同一事务；本切片只由受控 seed 工具调用，没有公开写接口或审核后台。

距离/时长/stay_minutes 缺失是 null，不是 0。统计区分交通时长与停留估计；0 只在来源明确确为零时可用。不把旧合计 1198 秒写成完整游玩时间，不自行估算地图距离。路线详情只读历史快照，不现场调用算路；地图、搜索、未来登录/存储通过相应 provider boundary，当前只实例化真正使用的 SearchProvider。

## 4. Migration、seed 与搜索第一实现

### 迁移与种子

`001_catalog.sql` 建 canonical 表、FK、状态/坐标/站序约束；`002_public_read.sql` 建公开 eligibility 视图、冻结保护、必要索引。迁移 runner 保存文件 checksum/applied_at，事务、单执行锁和失败回滚；已应用脚本不得改内容，追加迁移修复。相同版本再运行无变更，checksum 不同则报错。不安装 PostGIS 或中文分词插件；pg_trgm 仅在真实中文样本和查询计划证明有必要后作为追加迁移，目前非验收依赖。[pg_trgm 官方文档](https://www.postgresql.org/docs/current/pgtrgm.html)作为后续优化依据，不认为它自动解决所有中文语义。

种子分三份：`historical-anpu-nanjing.json` 保留 Task 6 原始来源映射/5 POI/4 路段/1496m/1198s/原 computedAt，导入为未发布；`catalog-reviewed.json` 仅含经人工核验的真实艺人、别名、城市、事实/图片授权与可公开证据，未获确认时不自编；`tests/fixtures/catalog.ts` 包含明确 synthetic 的已发布、草稿、拒绝、撤回、歧义、多 revision 及缺指标用例，只导入 test 数据库。测试可用 synthetic 已发布内容验证完整协议，但不能把它当正式可用路线或展示给真实用户。

seed 按稳定 UUID/来源 external ref 幂等，整个导入事务化；相同数据再导入计数不变，已冻结 revision 的冲突报错，不 upsert 改写旧版。输出导入摘要与状态计数，不含 secrets。若真实发布 seed 的艺人关联证据仍不足，1A 技术验收可在测试 fixture 上完成；真实内容就绪/公开发布验收保持未通过，1B不伪造发布内容，只能显示诚实空状态。发布正式首条路线需要产品负责人确认来源与发布规则，不能用实现批准代替内容批准。

### SearchProvider + DiscoveryService

输入 `SearchInput { q, cityId?, limit, offset }`；输出 provider 候选仅有 canonical route/revision IDs 与匹配特征，由 Discovery 排序、Catalog 同一 SQL snapshot 校验公开条件并映射 DTO。内部接口固定为 `SearchProvider.search(input): Promise<SearchPage>`、`DiscoveryService.searchPublic(input): Promise<SearchResponseDTO>`、`RouteCatalogService.getPublished(routeId): Promise<RouteDetailDTO | null>`；SearchPage含已排序/过滤/分页候选和hasMore，provider调用同模块纯rank规则，避免先限额再排序漏掉最佳结果。使用普通 PG view/joins，无异步索引队列；发布过滤在 SQL 内完成再分页，避免草稿泄露和假空页。搜索与详情复用同一 eligibility 条件，响应以请求时一致性为准；已撤回路线从旧结果打开则 404。

首期只返回 Route 结果，Artist/Alias/City/Place 是识别与匹配实体，不制作点击后无页面的假结果。Event 模型和搜索结果属于后续切片：输入活动名无已支持内容时返回 empty；不把任何演唱会词转为南京路线，不提前开 Event 服务。

归一：NFKC、trim、合并空白、拉丁字符 lower，保留原 query 供 UI展示；只使用登记别名，不全量繁简/拼音猜测。最长实体名匹配支持 `安溥南京` 与 `南京安溥`；模糊的同名 alias保留多候选，matched reason可解释。残余词除“想去/路线/走走”等有限已记录连接词外仍参与 AND 筛选，不能识别一个“南京”就忽略“火星”。多个实体组合必须满足已识别约束；用户显式 cityId 优先且是硬过滤。

排序规则首版固定、服务端集中：精确 artist/alias +80，city +40，stop place +30，title 精确/包含 +20，残余文本命中 +10；同维度重复不累加，同一 artist 的多个 alias 不重复加分；city/artist 都命中优先于单实体。同分按稳定 route ID，返回 matchedReasons（artist/city/place/title/text）而非内部 score。规则仅用已有内容关系，不用账号、收藏、附近位置或 AI。空白 q 是 default 模式，仅返回已发布路线、按稳定 ID排列，文案“已收录路线”，不声称猜你喜欢。无匹配返回空数组，不默认推荐固定路线。

q 最长 120 Unicode code points；limit 默认 20、范围 1–50；offset 默认 0、范围 0–1000。参数错误返回 400；cityId 必须合法 UUID。SQL 参数化，`%/_` 在 LIKE 中转义作为文字，不拼接任意排序字段或表名。查询 timeout/连接失败可区分可重试错误；记录 requestId/耗时/返回数量，不默认记录完整 query。初次 1A对测试语料检查 EXPLAIN、N+1 与请求预算，目标本地固定数据集 p95≤500ms，注明机器/数据量；该指标不当作大陆网络实际延迟承诺。

## 5. Shared Read API 与 public DTO

| API | 返回与行为 | 公开边界 |
| --- | --- | --- |
| GET `/api/v1/search?q=...&cityId=...&limit=20&offset=0` | `{ query, mode: search/default, results: RouteSummaryDTO[], page: {limit, offset, hasMore}, requestId }`；明确空结果 | 每个结果含 id/slug、revisionId/number、title、artist/city display、cover nullable、stopCount、交通距离/时长 nullable、核验摘要、matchedReasons |
| GET `/api/v1/routes/:routeId` | `{ route: RouteDetailDTO, requestId }`；routeId 是 canonical UUID，当前公开 revision，未发布/撤回/不存在统一 404 | 详情含 identity/revision/publishedAt、summary、交通指标与 computedAt/status、ordered stops、place/relation 各自核验、公开来源标题/URL/日期/claim，授权媒体与 warning |

错误合同 `{ error: { code, message, retryable }, requestId }`：400 INVALID_QUERY，404 ROUTE_NOT_FOUND，503 DATA_UNAVAILABLE（可重试），500 INTERNAL_ERROR（安全文案、requestId）。不返回 SQL、stack、provider raw body、draft title、private excerpt、submitter/reviewer/contact 或精确用户位置。新合同放共享 package，服务端 mapper 做白名单，浏览器运行时校验成功/失败响应；仅 TS 类型不够。body 不符合 schema 时进入 error，不把 `as T` 当验证。

API runtime DB role 只读公开视图/受控读函数，migration/seed 单独凭据；两类连接配置和角色授权在专用库测试，不把公用客户端直连 DB。公开视图还需提供与eligible路线相关的artist/alias/city/place识别字段和白名单证据，不为意图识别放开canonical私有表权限；安全视图采用受控owner与schema权限。public HTTP 不暴露 map confirm/calculate、revision selector 或写接口。API handler只处理输入/状态码，业务规则留在服务；请求级同一事务/SQL快照避免先读指针后读内容出现混版。首期不缓存 public内容、响应 Cache-Control: no-store，以减少撤回后可见窗口；以后有缓存才明确失效语义。

## 6. 目标文件职责与任务

以下全部是未来推荐目标路径，尚不存在。新 START 工作区保留根 `src/` 的 Web，无需先移动为 apps/web。`apps/api` 是同一单体进程内部代码目录，不是每模块独立服务。开发依赖路径用 pnpm scripts/tsconfig 明确配置，不靠临时相对深路径补丁。

| 目录/文件 | 职责 |
| --- | --- |
| `packages/domain/src/catalog.ts`、`publication.ts` | 稳定实体/状态与冻结、公开资格规则，不 import React/pg/provider SDK |
| `packages/api-contracts/src/catalog.ts`、`search.ts`、`errors.ts`、`schemas.ts` | request/public DTO/运行时边界验证；不暴露 DB row |
| `apps/api/src/server.ts`、`http/read-routes.ts`、`http/error-response.ts` | Node 启动、两条路由、requestId、安全错误、输入限制 |
| `apps/api/src/modules/catalog/{service,repository,public-mapper}.ts` | 当前公开 revision 读取、资格共用与白名单输出 |
| `apps/api/src/modules/discovery/{service,normalize,intent,rank}.ts` | query识别、排序、分页，不散落 UI/SQL handler |
| `apps/api/src/providers/search/{contract,postgres}.ts`、`db/pool.ts` | SearchProvider 合同、参数化查询、连接生命周期 |
| `db/migrations/{001_catalog,002_public_read}.sql`、`db/seeds/*.json`、`tooling/db/{migrate,seed}.ts` | 数据演进、状态合法导入、失败回滚与幂等 |
| `tests/integration/{catalog-db,public-api,search-pg}.test.ts`、`tests/fixtures/catalog.ts` | 真 PG 约束、发布/泄露/中文/版本测试；fixture 与真实内容隔离 |
| `src/api/catalogClient.ts`、`src/features/search/{context,state}.ts` | 1B API schema验证、取消/竞态与返回上下文 |
| `src/pages/{HomePage,SearchResultsPage,RouteDetailPage}.tsx`、`src/components/catalog/*` | 1B Figma交接后的页面与必要组件；替换新工作区旧入口 |
| `src/App.tsx`、`src/components/AppChrome.tsx`、`src/App.test.tsx`、`tests/e2e/start-search.spec.ts` | 新路由/三导航/浏览器行为回归；未实现 Community/Me使用诚实的边界页，不画完整模块 |

### A0：保护与工程选择

- [ ] 按 INTEGRATION_BASELINE_PLAN 建立可读回的 Git/WIP 基线与独立工作区，来源清单验证通过后开始代码。
- [ ] 读取主规格/Reference Note/本计划，固定参考与实际依赖版本/许可证；写本切片 ADR，验证 Node + pg + PostgreSQL 可连接且测试库与生产隔离。
- [ ] 保存旧测试结果与失败原因；新增 API/DB 的 check 脚本并定义命令，不改变旧工作区脚本。每次修改只在新工作区提交。

### A1：canonical schema 与 migration

输入为本计划实体/不变量，输出为迁移与 domain 状态定义。先写真 DB 失败测试：孤儿 FK、坐标成对/范围/体系、跨 route revision 指针、重复站序、重复 alias 同艺人、不同艺人同名可行、冻结内容不可变、零站不能公开、空值统计。执行确认失败原因后实现 schema与受控发布验证，再复测。迁移连续执行两次不重复；人为中断事务不留下部分 schema；checksum变化报错。通过才提交 A1。

### A2：历史来源与合法 seed

输入为 v0.2原始种子/人工选择记录及确认的真实内容，输出为三类隔离 seed、ID映射和导入报告。先测历史 seed 不公开、providerID 与 UUID分离、GCJ-02/时间/空值不丢、两次导入不增行、冲突不改 frozen、错误引用整批回滚；实现后核对来源哈希/计数。受控测试 fixture含至少两城市、两艺人/别名、三条可发布路线及四种非公开状态，避免单条南京导致测试恒真。真实首条发布证据不足则如实记录，不猜来源。通过才提交 A2。

### A3：Postgres SearchProvider 与 Catalog 读取

输入 `SearchInput` 与 canonical IDs；输出候选和公开当前 revision读模型。先测中文连续词/别名/大小写/全半角、多实体AND/未知残余词/同名歧义、空默认、指定city过滤、稳定排序/分页、limit/offset限制、SQL注入与LIKE通配转义、不公开状态及发布新旧版一致性；实现纯识别/排序和 PG provider。直接更新 Place 后旧 revision snapshot不变、withdrawn在详情和搜索同步隐藏。真实 DB测试通过、查询计划无N+1才提交 A3。

### A4：公共 API/DTO/1A 验收

输入服务结果，输出两条 HTTP API/白名单DTO及安全错误。先测匿名搜索→手动选 route ID→详情 ordered stops，private source/review备注/旧 revision不可读取，缺图/null交通文案数据、数据库断开503、非法参数400、不存在和撤回统一404、响应schema、runtime DB只读权限。完成后验证服务重启仍读同一数据；用独立审查检查public filtering、快照、SQL及迁移。任何功能测试失败先定位修复，不删测试。1A验收与通过提交形成里程碑，停止等待1B设计/执行确认。

推荐脚本名（A0 创建后才可运行）：`pnpm db:migrate`、`pnpm db:seed:historical`、`pnpm db:seed:reviewed`、`pnpm test:domain`、`pnpm test:api`、`pnpm test:db`、`pnpm check:1a`。`check:1a` 必须包含 typecheck、domain/contracts、真PG集成、HTTP及build；DB缺失不得skip绿。旧原型全套和迁入资产检查另作为保留回归报告，不把旧App行为的通过当新产品完成。

### B0：Figma 交接门禁

- [ ] 按 FIGMA_PLAN_SLICE_001 完成文字流程与低保真结构评审，再制作正式 Figma 文件；得到页面/组件/状态/响应式/prototype 的确认。
- [ ] 将 file URL/node IDs、版本/确认日期、Tokens/媒体授权/交互状态矩阵落到新工作区设计交接索引；未确认前不写页面代码。不可用截图或Canva替代正式source。

### B1：Start 输入与 Results

输入两条共享 API 与 Figma，输出 Home/Results及查询上下文。`Start with [ ... ] ?`保持核心入口，可访问中文label“搜索已有内容”，主提交“搜索”；Enter与按钮一致，IME组合不误提交。提交才发查询，不做每个按键的网络搜索。页面状态 idle→loading→results/empty/error，retry用相同参数；AbortController + request sequence保证较晚旧响应不能覆盖新查询，输入可修改、成功不会自动打开route。

URL `/search?q=...&cityId=...`保留参数；history.state保存结果滚动/选中route，刷新时用URL重查；每tab sessionStorage可存轻量scroll/最近查询，限于恢复，不做账号或收藏持久化。结果来自API；新query重置分页和滚动，返回详情原context恢复、焦点回所选结果；旧结果已撤回可重查。测试空查询模式/未知字词empty/失败重试/连续搜索乱序/后退/刷新/中文键盘，禁止硬编码南京fallback。

### B2：已发布 Route Detail

输入 current RouteDetailDTO，输出hero/identity/metadata/有序站点/来源核验。Route path `/routes/:routeId`不依赖slug解析；source链接清洗、缺图保持版式、null指标显示“时长暂不可用”、交通与停留分开。核验按地点/艺人关联/事实分层显示，来源可展开；不宣称无证据到访。主动作只读“查看路线站点”，不展示可点击但未实现的开始Journey/收藏/投稿按钮。从搜索返回恢复context；直接链接无context时回Start；loading/error/retry/404撤回状态独立。按Figma落地并补边界测试，不复制旧详情的伪验证状态。

### B3：全链路与审查

- [ ] 从真实专用PG启动API/Web，按390×844运行输入→结果→选择→详情→返回，empty与断网retry；另验320/768/1280、键盘/屏幕阅读label、长文/缺图，无横向溢出。
- [ ] 对照Figma节点及视觉包复核三页与状态；截图作为实现证据，不反向成为设计规格。
- [ ] typecheck、前端/domain/contracts/API/PG/build/e2e全通过，旧保留逻辑回归和资产门禁单独报告；审查发布状态/快照/竞态/来源/范围，修复后回归。
- [ ] 记录真实内容已就绪与否、国内访问验证已完成与否；mock、测试库和本地browser都不能证明生产/用户验收。未经后续批准不merge或deploy。

## 7. 验收与回退

| 门禁 | 必须可观察的证据 | 不得冒充 |
| --- | --- | --- |
| 1A 数据 | 干净专用PG按migration+seed可重建，FK/state/冻结约束通过，历史seed未发布，导入幂等，重启仍可读取 | 内存RouteBundle、SQLite或只有schema文档 |
| 1A 查询/API | 两endpoint真DB测试、中文组合/歧义/unknown无fallback、稳定分页/排序、private字段不泄露、404/503/DTO校验 | adapter mock通过或强制把南京种子标published |
| 1A 真实内容 | 核心来源/署名/核验/照片授权经确认，正式发布状态有明确凭据 | POI确认、测试fixture、参考图或技术批准 |
| 1B设计 | Figma source、组件/Token/state/responsive/prototype及确认记录 | 生成截图/Canva全套页面/代码猜设计 |
| 1B产品行为 | 任意输入不自动跳转；loading/results/empty/error/retry；手动选路；context恢复；分层source展示 | 仅改5个失败测试label或继续固定页面 |
| 1B工程 | 新架构完整check/e2e及审查证据，真实browser viewport截图/操作分别记录 | 旧21项原型测试全绿=START完成 |

主要 Review Focus：核心事实无来源却公开（A2/A4）、canonical实体更新污染旧版（A1/A3）、中文连续词/未知残余命中错误（A3/B1）、撤回与旧响应竞态（A3/A4/B1）、来源摘录/URI/私有字段泄露（A4/B2）。这些都必须有对应测试，不只人工说明。

回退遵循Git计划：单任务单提交，来源/WIP不改；新分支用revert或从固定基线重建，不重置旧工作区。DB部署后只追加修复迁移，删除字段/表属于后续明确批准的收敛操作；测试库重建仅限显式专用测试库，命令需检查数据库名与环境。不得用“rollback”自动删除真实数据。1A未获确认不实施，1B未获Figma交接确认不编码。
