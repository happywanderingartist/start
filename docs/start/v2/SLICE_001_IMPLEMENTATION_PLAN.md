# START Slice 001 — Catalog & Discovery Foundation Implementation Plan

> 执行者：本轮只规划。批准执行后使用 superpowers:executing-plans逐任务完成测试、实现、审查、修复、回归与记录。当前全部任务未开始；不创建子代理、不执行源码/migration/seed。本计划替代旧001的产品合同与任务，不覆盖历史文件。

**Goal：** 建立可被正式Discovery及后续切片共同使用的canonical PostgreSQL、四实体搜索、Artist Hub/Place基础读模型及公共读取API。**Architecture：** Modular Monolith，一个API部署单元，Catalog和Discovery是内部职责模块；PostgresSearchProvider第一实现、read projection由canonical数据派生、public DTO不暴露数据库行或provider对象。**Tech Stack（执行前固定版本）：** 保留React/TS/Vite；沿用拟议Node/TS、node-postgres参数化SQL和真PG集成测试，不另换框架、不引入微服务/搜索集群/LLM/vector。**Spec：** 同目录source/START_PRODUCT_SPEC_V2_PACKAGE的01/04/05/06/11/12/13及CURRENT_STATE_REPORT、SLICE_ROADMAP_V2。

日期：2026-10-01。当前等待计划确认；技术选型需实施时验证运行环境/许可证，未安装包或锁定托管vendor。

## 1. 全局约束与范围

中国大陆首发，Mobile Web → 微信小程序 → App，共享后端/数据/合同。Start / Community / Me，无Go。001是Foundation，不是完整START或正式三页发现体验；旧1A属于本001，旧1B改归002且扩为Home/Search/Artist/Route/Place。正式Journey/Memory/UGC/Community/Me等按003–007实施。

001包括真实数据表、迁移与隔离seed、四实体查询能力、公开读API、Artist Hub和Place Detail的数据合同、分层核验与发布状态、基础测试。Artist/Route可先有真实内容，Place/Event真实结果可暂空，但四者schema/查询/测试均有实现目标，不能只添加type占位后仍返回Route[]。不建立User/Follow/Community/Journey/Poster/Trade/Doll runtime空表，不做对应UI/API或推荐算法。受控导入和必要发布验证是数据基础，不是完整CMS/UGC审核系统。

先完成000（原Git保护计划）才能启动001工程：固定旧HEAD、WIP/ignored证据可恢复、provenance/hash、旧测试记录、独立START工作区。建议起点仍为固定master `1def607be517cb2e5bbf7c183125836a113ea5ce`，工作区候选 `.worktrees/start-slice-001`；不覆盖已有同名路径，不reset/clean/删分支/整体merge，本轮未创建。旧计划的角色迁移保护有效，runtime归003；旧严格全核验门槛与route-only合同失效。

## 2. Reference Before Implementation 与审查重点

沿用已批准REFERENCE_NOTE_001的Meilisearch/Supabase/Strapi实际阅读与许可证边界：查询结果与canonical真源分离；PG迁移可重现；稳定内容身份/发布事务和独立public mapper。优势是职责边界清晰、可测试；局限分别为独立搜索引擎超出规模、整个平台多服务与国内默认托管不适用、CMS发布状态不覆盖START的claim核验。旧Note中的Route-only方案/严格发布要求仅为旧方案，不复用为V2合同。

本轮GitHub补查多实体/发布方向，范围为Meilisearch多搜索、Strapi Document Service与Supabase迁移。Meilisearch `multi_search.rs`网页读取失败，不称已读源码；已读官方[meilisearch-rails多模型搜索用法](https://github.com/meilisearch/meilisearch-rails#-multi-search)，仅借鉴“不同模型保留分组”而非flatten全局score。另打开[Strapi repository.ts](https://github.com/strapi/strapi/blob/develop/packages/core/core/src/services/document-service/repository.ts)与[Supabase迁移文档](https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/deployment/database-migrations.mdx)。均未运行参考项目或引入代码，页面缓存不冒充最新HEAD；维护/星标/测试方式/许可证沿用原Note，正式实施前补固定精确commit/文件许可证。Rails样例只是额外产品模式线索，不作为拟引入依赖，也不复制其代码。

Review Focus：四实体仅名义存在（任务4/6）；城市组顺序被跨实体分数打乱（4/6）；approved未核验被误隐藏或verified误公开（2/3/5/6）；Place修改污染RouteRevision（2/6）；Artist城市块把未核验线索称到访事实或private evidence泄漏（3/5/6）。各项均有测试，不能靠说明或旧原型全绿代替。

## 3. 当前实体、只预留合同与后续边界

| 范围 | 001实际建模/读取 | 当前不实现 |
| --- | --- | --- |
| Artist、ArtistAlias、City | canonical身份/别名/城市、公开资格、Artist Hub投影 | Follow、账号兴趣、个人画像 |
| Place、PlaceProviderRef、ArtistPlaceRelation | 地点与外部ID分离、关联解释/核验、Place Detail投影 | 新POI地图采集UI、实时报路、导航 |
| EvidenceSource、Claim、ClaimEvidence、显式证据关联 | 来源与具体主张一等对象，分别review/verification/visibility | 自动事实判定、完整纠错/举报后台 |
| Route、RouteRevision、RouteStop | 稳定身份、冻结版本、有序站点、why/story、逐项trust和快照 | Journey进度、路线编辑器/UGC写API |
| Event、EventArtist | 最小schema、公开search/summary读API、艺人/城市聚合 | Event Hub正式UI、VenueZone、Trade、社群 |
| MediaAsset | 受控只读注册与授权状态，缺图合法 | 上传、存储vendor、媒体处理服务 |
| Search Projection / SearchProvider | 四实体SQL派生投影、独立组分页/排序 | 独立索引集群、异步队列、向量/LLM |
| Journey/Memory/UGC/Community/Card/Doll | 文档预留稳定ID引用和目标entity route；DTO只保留能力说明所需约定 | 不建空表/运行时/控制器；不把后续功能串成001验收 |

“当前实现”是本计划的实施目标，不表示现在已有这些表/API。Event/Place可没有正式seed，但需synthetic测试证明查询与公开边界。保留扩展接口不等于建立所有未来模块。

## 4. Canonical模型与版本不变量

| 实体 | 最小字段/约束 |
| --- | --- |
| Artist | UUID、canonical_name、normalized_name、type、primary_media_id nullable、verification_state；额外公开控制字段publication_state/review_state/visibility用于独立公开identity，不能因为没有Route就隐藏合法Artist |
| ArtistAlias | artist_id FK、alias/normalized_alias/locale；同艺人同别名唯一，不同艺人同名允许歧义。只登记有依据别名，不猜拼音 |
| City | UUID、name、country_code、administrative_code nullable；有行政code时按country唯一。大陆是第一市场，不等于禁止搜索台北等城市；不从自由文本猜行政归属 |
| Place | UUID、city_id FK、name/address、经纬度nullable成对、coordinate_system、verification_state/verified_at；经纬范围与坐标系校验；独立publication/review/visibility防止敏感地点从Place搜索泄露 |
| PlaceProviderRef | place_id FK、provider_key/provider_place_id组合唯一、observed_at、source_ref；外部ID不作canonical主键，不把GCJ-02改写WGS84 |
| ArtistPlaceRelation | UUID、artist_id/place_id FK、relation_type、explanation、verification_state、review_state、visibility；相关不等于到访，公开关联须review允许和地点/艺人可公开 |
| EvidenceSource | UUID、source_type、url/public_title/public_excerpt、observed_at、review_state、visibility、availability、last_checked_at nullable；URL http/https、摘录/媒体需可公开，失效不自动改变claim真假 |
| Claim | UUID、statement、verification_state、verified_at nullable、review_state、public_caveat nullable；与relation/revision/stop/place/event通过明确nullable FK绑定，CHECK恰好一个target非空，不用entity_type+自由ID；routeStop的claim仍能定位具体事实 |
| ClaimEvidence | claim_id/evidence_source_id FK、support_role；source允许公开不等于statement已核验，不能用source HTTP可达判真 |
| RelationEvidence、RevisionEvidence、StopEvidence、PlaceEvidence、EventEvidence | 显式owner/evidence FK关联；供主体来源目录，不能代替ClaimEvidence对具体主张的支持关系。不同关系复用同一个EvidenceSource，不复制自由文本 |
| Route | UUID、slug唯一、city_id/linked_artist_id FK、publication_state、published_revision_id nullable；无visitStatus/用户进度 |
| RouteRevision | UUID、route_id FK、revision_number、title、summary、why_worth_replicating、short_story、hero_media_id、verification_summary、review_state、published_at/frozen_at、snapshot；route+revision_number唯一；公开指针复合FK保证属于本Route |
| RouteStop | UUID、revision_id/place_id FK、sequence>0、stop_note、stay_minutes nullable、artist_place_relation_id nullable、place_snapshot、verification summary；revision+sequence唯一；同Place允许重复；关联的artist/place一致性在导入/发布验证中检查 |
| Event | UUID、title、starts_at/ends_at nullable尾时、place_id FK、status、publication_state/review_state/visibility、hero_media_id、source_observed_at、verification summary；开始时间/公开场馆与城市可解释，结束≥开始，时间带保存UTC并保留来源时区说明 |
| EventArtist | event_id/artist_id FK、role；关联pair唯一（角色多值如实际需要再迁移），不存在以Route字符串替代的艺人关系 |
| MediaAsset | UUID、object_key、mime、width/height、rights_state、visibility、source_evidence_id FK nullable；无授权返回null/缺图，不剪参考图/生成到访照 |

上述公开控制字段是V2要求draft/withdrawn不可泄漏的工程补充；state名称统一published/unpublished/withdrawn、draft/pending/approved/rejected、unverified/partial/verified/disputed，另有visibility，不创造一枚万能verified。Event cancelled是活动状态，不是withdrawn：已公开取消活动可以被搜到并明确显示取消，撤回则不可见。City是检索上下文，不新增第五种搜索entity或Artist×City独立页。

发布冻结包含当时artist/city显示、why/story、Place地址/坐标系、stop order、claim/公开证据摘要、媒体引用与路段computedAt/nullable指标。冻结内容禁止原地写，新修改新revision；生命周期/撤回状态独立于snapshot，不删历史。Place/Evidence后续修正不能让旧RouteRevision漂移，公开读时仍执行当前安全/权利撤回资格。provider算路version不是内容revision。未来Journey引用route_id+revision_id，进度写JourneyStop，不写RouteStop。

具体发布验证至少：approved revision、至少一站、站序连续、公共地点、有效核心关联说明、公开证据或符合V2的已审核未核验线索、无严重争议/敏感地址/侵权媒体；不要求每个claim verified。允许approved+unverified/partial且显式披露；禁止核心路线完全无可信关联、严重disputed核心无解释。允许发布不代表官方认证。需要人工判断的边界案例由review决定与理由记录，schema不能替人判断事实。

审核/验证记录需who/when/subject/decision/reason/evidence；001用受控导入的私有review元数据及不可覆盖的导入记录保存，不搭完整ModerationCase/User系统、不暴露审查者或备注。以后005接审核写链，不用001seed自动批准旧内容。

## 5. Multi-entity Search与读模型

### 查询、优先级与分页

SearchEntityType固定 `artist | route | place | event`。公共SearchInput为q、cityId?、section?、limit、offset。q≤120 Unicode code points，limit默认10/范围1–30，offset默认0/范围0–1000；首次section省略返回四组各limit项、offset必须0。后续“更多”指定section+offset，仅该组查下一页；响应仍保留四组，未请求组status=not_requested，不把其空items解释为无结果。当前001四组均支持查询，实际内容为空用status=searched/items=[]；未来adapter暂未启用需status=not_enabled显式区分，不能假empty。

归一NFKC/trim/空白/拉丁lower → exact artist/alias → city → place/event →有限连接词 →残余AND匹配。连续中文、艺人+城市、别名、同名歧义必须支持；识别“南京”不能忽略“火星”。事件名称的出现不自动推荐南京；空q为已收录/编辑内容，匿名不声称猜你喜欢。

城市query的产品section顺序固定Artist→Route→Place→Event，不由不同entity分数比较决定；精准艺人query的Artist首位、primaryTarget=artist_hub，但由用户点击，不自动跳页；同名返回多个identity先区分。其它query当前默认同四组顺序，组内匹配依据可解释，未来调整不破坏type合同。

组内顺序：精确命名/登记alias > 已识别实体组合一致 > 标题/解释残余命中；显式cityId为过滤；城市组Artist只来自该城合法公开关联/路线或Event关系，events-only city不可伪称已到访足迹；Route按公开artist/city/stop关系、Place按公开地点与相关artist、Event按场馆城市/artist/名称筛选。同分canonical ID稳定；重复alias或JOIN去重，limit前完成资格过滤与rank，避免N+1和漏最佳结果。核验状态是可见事实，不自动将全部合法unverified降为不可搜。

SearchProjection是普通SQL view/参数化查询，从canonical派生，无异步索引队列或固定JSON数组。artist-city“足迹城市”来自公开ArtistPlaceRelation/Place并带逐项verification，路线/活动聚合另列，避免演出安排就等于曾经到访。实体identities、relations、sources、media各执行相应公开资格；Artist有身份无路线时Hub合法返回空routes，不能用路线存在性作为全局公开门槛。

### 合同分层

`SearchProvider.search(SearchReadInput): Promise<SearchReadResponse>`返回按entity type区分的四组候选/投影与组内分页，不能是Route[]；SearchReadInput包含normalized query/已识别条件/残余词及请求分页，不耦合HTTP。`DiscoveryService.searchPublic(SearchInput): Promise<SearchResponseDTO>`负责校验/意图/产品section顺序/匹配理由和public白名单映射；PostgresSearchProvider消费同模块rank规则，确保排序在分页前。provider不给UI决定首页或自动导航。

SearchResponseDTO包含 `query、mode(search/default)、intent、sections、requestId`。sections为四种discriminated union，type分别决定items schema；每组包含status、items、page{limit,offset,hasMore}。intent含kind(artist/city/place/event/mixed/unknown)、resolvedIds/ambiguity、primaryTarget nullable；不输出内部score、私人信号或raw provider响应。requestId由HTTP层注入，不能绑搜索引擎。

| item type | 最小public字段 |
| --- | --- |
| artist | type="artist"/id、canonicalName/artistType、primaryMedia nullable、identity verification、city previews（区分footprint/event context）、routeCount、matchedReasons；去向/artists/:id |
| route | type/id/slug、revisionId/number、title、hero nullable、artist/city、relationSummary、whyWorthReplicating、verificationSummary、stopCount、距离/交通时长nullable、matchedReasons；去向/routes/:id |
| place | type/id/name/city、relatedArtists、topVerifiedRelation nullable、其他公开relation摘要/状态、relatedRouteCount、matchedReasons；无verified relation时不假造topVerifiedRelation；去向/places/:id |
| event | type/id/title、artists、startsAt/endsAt、venue/city、state、publication/trust摘要、hero nullable、matchedReasons；未来去向/events/:id，正式Event Hub在006 |

每个DTO有runtime schema，unknown类型/字段错误不能强制as T。Source public字段只title/type/url/可公开excerpt/观察与核验时间/availability，private submitter/审查备注/原始敏感文件不出现。不存在给一个type字段再共享同一Route模板的“多实体”。

## 6. Public Read API

| endpoint | 001返回合同 | 后续UI |
| --- | --- | --- |
| GET `/api/v1/search` | SearchResponseDTO四组与意图；各组分页合法、空结果诚实 | 002混合Search Results |
| GET `/api/v1/artists/:artistId` | ArtistHubDTO：identity、footprintCities（公开place/relation counts与核验摘要）、recommendedRoutes、optionalEvents；艺人存在无路线返回200空数组+内容状态 | 002Artist Hub；城市在页内作为过滤上下文 |
| GET `/api/v1/artists/:artistId?cityId=...` | identity不变、对应cities上下文、routes/events按合法cityId过滤 | 002保留城市选择和滚动位置，不新增独立City页面 |
| GET `/api/v1/routes/:routeId` | 当前公开RouteDetailDTO：Hero/title/artist/city/why/shortStory、分层核验、ordered stops/claim/source、后置logistics；revision身份/时间、metrics nullable | 002Route Detail，主CTA开始路线/次分享；Journey003接线 |
| GET `/api/v1/places/:placeId` | PlaceDetailDTO：identity、artistRelations+claims/evidence、photo reference有授权才返回、address/practicalInfo、relatedRoutes/Artists；数据未知明确null，不编开放时间 | 002Place Detail baseline |
| GET `/api/v1/events/:eventId` | EventReadDTO最小name/artists/date/venue/city/status/公开来源；无Trade/社群/live聚合 | 006Event Hub；001/002不假称页面已交付 |

当前公共HTTP均只读，无开始Journey、follow/save、提交/审查、媒体上传、地图confirm/calculate、Trade等endpoint。API中的实体路径不代表此轮创建对应正式UI。

error合同为 `{error:{code,message,retryable},requestId}`：非法参数400，未发布/withdrawn/不存在统一404，DB失败503可retry，内部500安全文案。不靠DB异常泄漏SQL/stack。查询runtime只读公开视图/受控函数，migration/seed独立凭据；schema、view owner/权限需测试，artist/alias识别也不得放开私有表。请求内一致快照避免读到新指针+旧内容；当前no-store，无独立cache失效系统。SQL参数化、LIKE `%/_`作文字转义、输入限制/查询timeout/requestId日志；不默认记录完整query/位置。

## 7. Migration、seed与目标文件

执行时迁移候选：001_catalog（Artist/City/Place/Route/版本）、002_evidence_publication（Claim/Evidence/资格/冻结）、003_event_discovery（Event/EventArtist/四实体投影）；文件只是计划名，本轮不生成SQL。迁移checksum/applied_at、单执行锁/事务、重复不修改、失败不半成品；cross-table资格用FK+事务/受控读视图，不能塞跨行CHECK。冻结snapshot用DB约束/trigger/权限防修改，发布时锁Route并验证stop/claim，再切public指针。

历史南京种子保留五POI四路段、来源/候选/选择、GCJ-02/观察时间、1496m/1198s和nullable语义，导入默认unpublished；V2允许未核验发布也不构成自动批准该种子。真实reviewed seed需人工内容与权利确认；Event没有真实来源则空数据集，不捏造活动。test fixture独立synthetic，覆盖四entity、同名、多个city、合法unverified公开、严重争议禁止、draft/withdrawn与多revision；只入专用测试库。

seed按稳定UUID/来源ref幂等，整批事务，重复无增行，frozen冲突拒绝。输出计数和状态/provenance，不曝光秘密。真内容不足不阻塞隔离基础测试，须分别记录“技术通过/内容未就绪”；无PG实例不得用SQLite/Map mock跳过DB门禁。数据库host/vendor和map vendor并未锁定，不在当前阶段新增连接服务或生产环境。

| 未来目标路径（均未创建） | 职责 |
| --- | --- |
| `packages/domain/src/{catalog,claim,publication}.ts` | 实体/状态/快照/公开不变量，不依赖React/pg SDK |
| `packages/api-contracts/src/{search,artist,route,place,event,errors,schemas}.ts` | 四entity union、各读DTO/runtime schema |
| `apps/api/src/modules/catalog/{artist,route,place,event}-service.ts` | Entity/Hub读取、统一公开资格、无写产品流程 |
| `apps/api/src/modules/catalog/{repository,public-mapper}.ts` | PG读取边界与白名单，不能裸返row |
| `apps/api/src/modules/discovery/{service,normalize,intent,rank}.ts` | query识别/section顺序/组内rank规则 |
| `apps/api/src/providers/search/{contract,postgres}.ts` | 多实体SearchProvider与PG实现 |
| `apps/api/src/{server,db/pool,http/public-read,http/error-response}.ts` | 启动/连接/六种读取场景/错误与requestId |
| `db/migrations/*.sql`、`db/seeds/*.json`、`tooling/db/{migrate,seed}.ts` | 真实PG可重建、导入/审核元数据/provenance |
| `tests/integration/{catalog-db,trust-read,search-pg,public-api}.test.ts`、`tests/fixtures/catalog.ts` | DB/API/四entity与信任边界测试，非正式内容 |

不移动旧src、不为001创建React页，保留现有Web目录位置；必要技术验证用HTTP测试/契约阅读即可，非强制Figma或页面。正式设计移002。

## 8. 实施任务与验收

每项先写行为/约束失败测试，确认失败原因再最小实现，复测/审查/修复后单独提交并记录provenance。不得删除失败测试伪装通过。

### 任务1：000承接与合同基线

- [ ] 完成旧HEAD/WIP/ignored证据备份读回与bundle恢复验证、建立独立工作区，将V2来源/hash/本四文档纳入文档基线；不改旧工作区。
- [ ] 固定REFERENCE版本/license、Node/pg/PG环境与私有测试库；读取V2相关规格，ADR注明旧Route-only失效与四实体方案。
- [ ] 明确scripts/check/db角色，先写四组response/runtime schema conformance失败测试，建立公共合同。当前建议命令名尚不可执行。

### 任务2：canonical、Claim与版本迁移

- [ ] 真PG测试：孤儿FK、同名alias允许/同艺人重复拒绝、坐标成对/范围/坐标系、外部ID非主键、same Place重复stop、重复序号、跨Route指针、Claim恰好一个target、frozen内容不可改。
- [ ] 实现三批迁移与不变量；验证重跑/checksum冲突/中断事务恢复及旧snapshot不随Place更新漂移。
- [ ] EventArtist孤儿/重复关系、end早于start拒绝；Event活动status与publication独立。通过并审查后提交，不加未来模块表。

### 任务3：受控种子/公开资格

- [ ] 测试历史南京默认不公开、来源哈希/指标保留、重复导入幂等、frozen冲突/非法关联整批回滚。
- [ ] 测试approved+unverified/partial且合规claim可公开并有caveat；draft/pending/rejected/withdrawn、敏感地点、严重核心争议、private evidence、侵权媒体不可泄漏；缺图不等于整个合法路线不可公开。
- [ ] 测试source失效保留核验历史、不标fresh、不自动false；地点verified不能让relation/claim verified。实现合法seed/验证与私有review记录，提交计数和真实内容就绪状态。

### 任务4：四实体PostgresSearchProvider

- [ ] 测艺人exact/alias/连续中文、城市四组顺序、艺人+城市、Place/Event名称、unknown残余词、同名身份区分、空query默认、无结果不fallback。
- [ ] 测四组各自真实PG查询且synthetic fixture均有命中；只有Artist/Route真seed时其余searched空组schema合法，不把空组写成不支持entity。
- [ ] 测组内排序/去重/先过滤后分页、section分页/越界400、LIKE转义/SQL注入、current撤回一致性；Artist城市relation核验可解释，活动城市不冒充足迹。
- [ ] 实现query/投影/provider/service，检查EXPLAIN/N+1，固定数据集记录响应预算及机器规模，审查后提交。

### 任务5：实体/Hub公共API

- [ ] 测Artist有identity无route时200、同名身份与cities/推荐route/optional event，city过滤不改identity；Place返回关系/claim来源而非点评分数。
- [ ] 测Route why/story/当前revision/有序站/source/logistics null、Event最小summary含status/venue；draft/withdrawn直链统一404，runtime角色不能读private或写表。
- [ ] 测public白名单/响应schema、无SQL stack/审查者/private source、DB断开503、非法输入400、一致snapshot，runtime DB重启数据仍在。实现read HTTP与mapper，审查后提交。

### 任务6：Foundation整体验收与交接

- [ ] 从干净专用PG重建迁移/seed，运行domain/contracts/真PG/HTTP/typecheck/build完整门禁；无PG就报未通过，不skip绿。
- [ ] 独立审查multi-entity真实性、publishing不等于verified、私有数据/核心争议、snapshot冻结、来源/授权、范围与迁移回退；修复后回归。
- [ ] 记录旧成果来源、文件/hash/命令/限制、技术通过与正式内容就绪分别状态；验收passed才标001里程碑，停止。002/Figma/merge/deploy不自动获授权。

建议执行时提供 `pnpm db:migrate`、`db:seed:historical`、`db:seed:reviewed`、`test:contracts`、`test:domain`、`test:db`、`test:api`、`check:foundation`，任务1建立后才运行；最终check包含真数据库和全部public接口测试。旧Web/Worker/资产回归另报告，不能以它们全绿证明Foundation完成。

## 9. 后续稳定扩展与回退

002消费四entity和Hub合同，实现推荐气泡baseline/正式五页/返回恢复/CTA与分享；003Journey固定revision、GPS提示需确认/manual/skip/finish与Doll基础runtime；004Memory/Poster/Book；005UGC写链与审核；006Event Hub/Community/Trade；007Card/Me/Doll页。未来User/Event/Community/Memory关系用稳定FK迁移，不塞Route通用JSON。接口的实体去向预留不等于提前提供未实现按钮/endpoint。

Git遵循000：单批提交，revert或从固定基线重建新分支；不reset/clean旧工作区。DB是独立状态，迁移append/forward-fix，测试库重建限显式专用库，未来真实数据库先备份恢复验证，不用代码tag假冒数据回滚。

没有尚需重问的001阻塞性产品方向；真实内容/授权不足则不发布，工程基础可用隔离fixture验收。本轮交付至此，待确认后才执行000/001。
