# Slice 001 Catalog & Discovery Foundation 验收

2026-10-02。结论：**技术验收通过，真实内容尚未就绪**。已先完成并报告 Slice 000，再执行 001；已完成开发、独立审查、修复、回归和记录。停止在 001，没有正式 Discovery 页面、Figma、Journey、Memory、UGC、Community/Event Hub、Trade、Me/Card/Doll runtime，也没有 master merge 或 deploy。

## 实际交付与 Git

工作区 `D:/Downloads/fan-route-codex-handoff/.worktrees/start-slice-001`，分支 `feature/start-slice-001`。Modular Monolith，一个 Node/TypeScript 公共读 API 单元，PostgreSQL-first；Catalog/Discovery 内部职责分离，SearchProvider 第一实现为 PostgreSQL。旧 src、Worker 与测试保留；不是把三条旧分支整体合并。没有引入独立搜索集群、LLM、vector、登录或后续模块空表。

| 里程碑 | commit | 结果 |
| --- | --- | --- |
| Slice 000 | 8186dd2 | Git/asset/document baseline 和恢复通过 |
| 001 任务1 | 778b4e9 | public 合同、成熟项目参考和环境 |
| 任务2 | a916dd3 | canonical/Claim/版本/权限迁移 |
| 任务3 | a519ff5 | 受控 seed、公开投影、冻结快照 |
| 任务4 | fd6f670 | 四实体搜索与完整残余匹配 |
| 任务5 | e0bf002 | 实体/Hub HTTP、bounded reader |
| 任务6 | 本文件所属提交，使用 git log 查询 | 008 最终边界修复、完整门禁、编译/恢复验收、交接 |

三旧 HEAD/分支和 44 项 WIP 再次比对未变：master `1def607`、v0.2 `b9a4623`、character `a8ece97`。468 份备份 hash、恢复的 253 文件和三工作区 HEAD/status 均通过；原完整 bundle SHA 仍为 `40f8d114994d2aa0f58be51038626eacd8d94ae6e5d7d81e9b1b478f96e539ee`。未 reset/clean、删分支、覆盖旧 WIP 或强制 merge。原 index 字节没有前置 hash，验收不声称它的字节级不变；已验证原 staged diff 为空、工作区内容/status 相同。baseline 脚本适用于本次已验证状态，未来 staged/rename/quoted-path 形态需要重新审查。

`.gitattributes` 为精确的原文/资产/衍生脚本及历史 seed 设置 `-text`：修复新工作区首次提交的两份 CRLF/Git blob 字节偏差。63 份 provenance 内容和 3 份历史 JSON 在真实 Windows Git index materialization 后，66 个 hash 全匹配；无旧工作区改写。来源见 `baseline-provenance.json`、历史 seed `provenance.json`、`reference-pins.json` 和 `postgresql-artifact.json`。

## Migration / schema / seed

`db/migrations/` 共 8 个前向迁移，applied migration 从未重写。22 张 canonical 表：Artist/Alias/City/Place/ProviderRef/ArtistPlaceRelation、Route/Revision/Stop、EvidenceSource/Claim/ClaimEvidence、Relation/Revision/Stop/Place/Event Evidence、MediaAsset、ImportRecord/ReviewRecord、Event/EventArtist。无业务 User/Journey/Trade 等预建表。命名以 SQL 为准。

| 迁移 | 职责 |
| --- | --- |
| 001–003 | canonical FK、分离的 review/verification/publication/visibility、证据/媒体/审查、Event 与 least-privilege roles |
| 004 | 坐标 NULL 门禁及 stop-write/freeze 双向父行锁 |
| 005 | 公开视图、受控发布、冻结 snapshot、分层公开资格 |
| 006 | 历史 Hero 引用与缺图不漂移，当前 rights 撤回仍隐藏 |
| 007 | SECURITY DEFINER 显式安全 search_path，阻断 TEMP shadow |
| 008 | 核心 claim 不可公开时排除 Place/Relation/Event 主体，传递至 Route/足迹/Event 城市 |

迁移采用 advisory lock、逐文件事务、SHA256 checksum/applied_at，重复不改、漏文件/改 checksum/乱序拒绝、失败无半成品。Route 使用稳定 id/current published revision，revision/stop 冻结后禁止原地改或删除；Place/provider ID 分离、经纬成对且坐标系明确。审查日志追加，不把合规未核验自动当违规。

历史南京导入保留 5 POI/4 legs、1496m/1198s、GCJ-02、来源候选和来源哈希，但默认 draft/private/unpublished，停留时长未知为 null。遗留 visitStatus 仅留私有 provenance，不成为 RouteStop 进度。真实内容须人工审查，不因测试 fixture 自动批准。受控 CLI 批次使用 stable ID/sourceKey/来源 checksum、allowlisted 参数化 upsert 和整批事务；没有公开写入、CMS 或投稿 API。synthetic 只允许 `start_test_` 数据库。

## API / DTO

仅实现 GET，JSON no-store、服务端 requestId、安全错误 envelope；运行进程拒绝高权限连接，使用 `start_public_reader`，请求内 REPEATABLE READ READ ONLY，statement timeout 3 秒。私有 canonical schema 无 USAGE、无 raw 表权限，公开 helper 不提供写能力。

| endpoint | public DTO / 行为 |
| --- | --- |
| `/api/v1/search?q=&cityId=&section=&limit=&offset=` | 四 ordered discriminated sections：Artist → Route → Place → Event；query/mode/intent、各组状态和独立 page |
| `/api/v1/artists/:id?cityId=` | identity、footprintCities、单独 eventCities、recommendedRoutes、optionalEvents、cityContext；无 route 身份仍 200 |
| `/api/v1/routes/:id` | 当前公开 frozen revision、why/story、分层 trust/有序 stops/evidence、nullable metrics |
| `/api/v1/places/:id` | 地点身份、关系/claim/source、可用媒体、地址/坐标/nullable practicalInfo、related routes/artists |
| `/api/v1/events/:id` | 最小 artist/time/venue/city/state/source；cancelled 与 withdrawn 分开，无 Event Hub 业务 |

合同在 `packages/api-contracts/src/schemas.ts`，unknown/private 字段、错误 entity/group、超页结果和假 not_requested 数据均拒绝。输入非法 400；不存在/draft/private/sensitive/withdrawn 统一 404；DB 不可用 503 retryable；内部输出失败 500，不泄漏 SQL/stack/凭证。Search 无固定南京 fallback：NFKC/登记 alias/连续中文/组合上下文/未知残余 AND；只移除完整连接段，保留“和声/旅行者/活动室”。组内 exact name/alias → 合法组合 → prefix → 说明匹配 → UUID，在 LIMIT 前排序；字面 `%/_/quote` 不成为 wildcard。

## 测试、真实 PostgreSQL 与恢复

全新空库 `start_test_acceptance_final_1790941858303` 从 0 重放 8 migrations/seed：`pnpm check:foundation` 52/52；随后新增重启断言回归，完整恢复库 `start_test_restore_final_1790942149241` 上最终同一门禁 **53/53，无 skip/todo**，foundation tsc 和 API 编译通过。

| 测试组 | 最终结果 | 核心证据 |
| --- | --- | --- |
| public contracts | 6/6 | 专属 item、字段白名单、Source HTTP/S、topVerified literal、Unicode/分页 |
| domain / 验收工具 | 3/3 | 本机 start_test_ guard、NFKC/实体顺序、Date/ISO 同时刻不能冒充重启 |
| schema/migrations | 10/10 | FK/坐标/事件时间、checksum/事务失败、冻结/双连接串行、reader权限 |
| 四实体 search | 12/12 | 城市4组、alias/混合中文、未知残余空、多个公开候选 rank/page、歧义/注入/撤回 |
| evidence/trust | 13/13 | unverified 可公开且披露、private/core争议阻断、snapshot/媒体/来源、TEMP shadow、原始 hash、owner gate |
| public HTTP | 9/9 | Artist 无 route/城市过滤/Event 城市、Route/Place/Event DTO、400/404/503/500、owner startup 拒绝 |

真实引擎为 PostgreSQL 18.6 Windows portable，127.0.0.1:55432，无 Docker/mock 替代 schema/查询。HTTP 成功路径和 503 均使用真实 PG/真实连接；仅 500 诊断分类用窄异常注入，不冒充数据库功能验证。小 synthetic EXPLAIN 四查询完成，最后搜索耗时约 26ms；只说明该测试集，不作为规模承诺。

pg_ctl 实际 stop/start 后 postmaster 从 `2026-10-02T10:14:02.554Z` 变为 `2026-10-02T11:53:27.858Z`，22 表逻辑数据哈希与 8 条 checksum/applied_at 完整一致。独立审查发现 Date vs ISO 类型会让旧断言误过；先 RED，再统一 ISO 修复，重新核验真实 PG 和保存证据通过。不是 PG 物理文件字节相同的声明。

官方 pg_dump custom dump 备份位于 `D:/Downloads/fan-route-codex-handoff/integration-backups/2026-10-02-slice001-test-db/`；pg_restore 到独立新库，在写测试 fixture 前确认 22 表逻辑 hash 和 8 迁移记录全相同。编译后的 dist API 独立进程在原库及恢复库均通过五类读取/严格 schema 和 owner 连接拒绝；API 验收进程已结束。恢复后的完整回归可能追加隔离 private 测试行，恢复 hash 验证记录描述恢复时点。

旧成果回归另列：`pnpm check` typecheck/build 通过，旧 Vitest21/21、Node18/18；`pnpm test:assets`13/13、24候选/18release、0errors。旧 v0.2 五项历史失败仍保留历史记录，本轮不修改旧工作区来消除它们，也不将旧全绿认定为新 START 通过。

## 独立审查闭环

| 审查 | 发现与修复 | 复审 |
| --- | --- | --- |
| review_slice000 | backup-only 原 root 依赖、恢复 clone 换行索引 | 完整备份恢复通过 |
| review_contracts | entity type 丢失、危险来源 URL、topVerified 混淆 | 类型负例和 runtime6/6 |
| review_schema | CHECK NULL 及并发 freeze | 004；独立两连接回归 |
| review_trust | TEMP shadow Critical、seed 原始 hash | 007、3 原文件校验；独立攻击 0 泄漏 |
| review_search | 连接词误改残余、候选排序测试不足 | 原失败 RED→GREEN、12回归，关闭 |
| review_api | 500诊断缺持久回归 | 9HTTP；独立24只读探针，关闭 |
| review_foundation | 严重核心claim主体漏gate、alias空白rank、重启断言类型缺口/异库恢复断言 | 008+normalized_alias+ISO/date RED→GREEN；源码/真实只读PG/验收脚本复审关闭，无遗留Critical/Important |

第一次未应用 008 因 unqualified CREATE 的 pg_catalog 权限拒绝而完整回滚，限定 schema 后应用；没有改已应用迁移或弱化断言。独立审查没有代替主执行的空库/恢复/重启/编译/旧回归测试。各任务 commit 及 provenance 见执行日志。

## 限制与复现

当前不阻塞 001 的限制：真实艺人/关联/Event 内容未审核；没有生产数据库供应商/凭证、生产认证/运行 SLA；loopback trust 仅隔离本机测试且测试 cluster 在交接前停止；有限词典和 SQL 派生投影只测小数据集，大规模词典/相关子查询需后续真实量测。005/未来 Journey 等模块尚未实现，版本/ID 已正确预留。正式 Discovery UI、首页气泡/Doll 低频互动、导航/分享/CTA 待批准 002 后设计，不宣称本轮交付。

复现前先用 portable pg_ctl 手动启动已有测试 cluster（具体 data/bin 路径见 LOCAL_VALIDATION.md），设置进程级 `START_TEST_DATABASE_URL=postgresql://postgres@127.0.0.1:55432/<start_test_库>`，运行 `pnpm check:foundation`。API 启动 `DATABASE_URL` 必须使用 reader，`pnpm build:api` 后 `pnpm start:api`；默认仅 localhost，不自动部署。持久化/恢复/编译工具为 `tooling/verification/`；恢复校验须在独立新库、写回归 fixture 前执行。

回退：旧三保护 tag/bundle+raw WIP 可在新路径恢复，不对旧 root reset；新 integration 提交可在新分支 revert，冻结数据不原地降级。数据库恢复仅对新命名测试/恢复库执行 dump restore，不 drop/reset 现存库；新 cluster 需先建立对应 owner/reader 角色。后续数据库生产回退策略尚未实施，不用本机测试备份冒充生产灾备。
