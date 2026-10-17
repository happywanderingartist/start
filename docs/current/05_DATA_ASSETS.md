# 数据模型、资产与来源

## 当前数据库

2026-10-17只读核对本机55435的start_acceptance，共26表：3张start_accounts表，23张start_app表。完整表计数在 data/DATABASE_INVENTORY.json；本包不包含账号身份、私人记录或原始数据库文件。

| 数据组 | 表与用途 |
| --- | --- |
| 账号 | users有效/禁用；auth_identities将provider+subject映射userId；profiles昵称兴趣与隐私 |
| 公共内容 | content统一artist/place/route/event、draft/published/version/poi_id；revisions历史版本 |
| 投稿与证据 | submissions地点/路线投稿；contributions单艺人地点证据；corrections补充纠错 |
| 社群 | community_applications申请；communities艺人唯一社群；memberships；community_requests转让/解散等 |
| 集市 | listings物料；exchanges申请/接受/撤回；listing_comments公开评论；contacts历史兼容表 |
| 私人记忆 | checkins当前地点引用+历史snapshot+文字/媒体/票根；shares记录ID集合与字段、令牌hash、撤销 |
| 角色/互动 | dolls唯一角色/服装/表情；favorites；notifications |
| 运维基础 | media安全文件引用/hash/visibility；audit；idempotency；settings |

```text
artist ─── community(唯一) ─── membership(user)
  │           └── listing ─── exchange(requester)
  │                 └── listing_comment(user)
  ├── contribution ─── place ─── checkin(user, snapshot) ─── share(selected fields)
  ├── route ─── ordered placeIds
  └── event ─── place(场馆)
                  └── listing的event/place关联
user ─── profile / doll / media / favorites / notifications
```

部分关联在JSON字段内，由服务发布/审核时验证，不是全部以关系表FK约束。未来做检索、统计、分页时要考虑规范化，而非直接复制演示数据扩规模。

## 数据现实性

当前验收库包含4个账号、1个艺人、1个地点、1条路线、1场演出、1个社群，来源是本地验收过程，并不证明真实资料核验或用户上线。公开快照 data/PUBLIC_CATALOG.json 的B001、117/36等是测试占位；路线顺序和取消演出也不能当真实推荐。验收库的Book/分享当时为0条，不影响隔离测试中创建过记录这一事实。

盘点时存在172个start_test_*数据库，之后新验收可能继续增加。它们是保留的测试现场，占空间但本次未清理；任何清理都需先列出范围和用户确认，不能猜测哪些库有独有数据。

高德POI匹配仅输出候选，坐标系采用GCJ-02；设备GPS一般为另一来源，转换与展示需单独验证，不能随意混用。台北/跨境地点的Provider覆盖、分类与导航仍应验证，不能把大陆样例推断为全球覆盖。

## 本包资产分区

- `source/workspace/deliveries/START_FINAL_LAYOUT_REVIEW_2026-10-06/assets`：当前原型实际使用的Logo、首页、娃娃与服装/表情预览等。
- `assets/character-baseline`：锁定角色原始参考、动作候选、QA联系表、角色manifest及验收记录的唯一归档副本。
- `references/MASTER_HANDOFF_2026-10-01/05_VISUAL`：原始视觉参考包，含REF_28票根参考以及其他排布/卡片参考。
- `source/workspace/deliveries/START_ROUTE_INTAKE_2026-10-07/references`：安溥济南/南京/上海及苏打绿北京/台北五份用户路线图，顺序与来源见同目录manifest。
- `images`：文档阅读用的精选截图，标注历史视觉稿和当前API界面。
- `data/ASSET_CATALOG.json`：选定资产范围的原始位置、字节、修改时间与SHA-256；它包含盘点范围中的重复引用，具体已打包内容以MANIFEST_SHA256.json为准。

用户临时C盘/微信缓存路径不是稳定资产地址。已归档的路线和参考图应优先从本包路径读取；未归档的旧临时附件不能宣称仍可访问。外部参考图用于设计学习，不表示获得公开商业使用权；生成/裁剪角色候选也不等于已获视觉批准。

## 角色资产特别说明

女娃R01、男娃R02为身份基准。男娃五套来自原始服装参考，部分是含纸底的局部预览，不是全部已完成透明正式素材。四种表情与服装当前以整图切换为主，未形成任意组合的分层素材；需服装×表情兼容矩阵、边缘透明度和身份一致性验收。禁止擅自重新生成角色替换身份；禁止只为省事退回“男娃只有一套”。

## 不随包转交的敏感与大型数据

private-config/amap.env、AMAP_WEB_SERVICE_KEY等密钥仅记录变量名和原机存放约定，不读出值。数据库PG目录、私人上传、auth identities、审计原始行、idempotency结果、正式分享令牌均不导出。本地模型GGUF/llama/PG/Chromium/node_modules不打包；文档提供版本/路径与恢复依赖说明。

本包的数据资产交接是“schema + 公开示例 + 元数据 + 原始设计资产 + 位置与恢复说明”，不是生产备份恢复包。需要实际用户数据迁移时，应另做范围明确的受控备份与校验。
