# START — Codex Alignment Patch V2

日期：2026-10-01  
用途：修正现有 `INTEGRATION_BASELINE_PLAN`、`SLICE_001_IMPLEMENTATION_PLAN`、`FIGMA_PLAN_SLICE_001` 与最新产品规格之间的偏差。

## 1. 可以保留不动

现有 Git 基线保护总体保留：
- 不 reset/clean
- 不整体 merge 三条旧线
- 备份 dirty worktrees
- 建独立 START integration worktree
- 记录 provenance / hashes / tests
- 角色资产不重生成
- v0.2 map 成果按职责迁移

## 2. Slice 001 重定义

旧思路：
`Start Home → Search Results → Route Detail`

不再被描述为完整产品主链。

新定义：

**Slice 001 = Catalog & Discovery Foundation**

主要产物：
- canonical DB
- evidence/trust model
- multi-entity search contract
- public read API
- foundation tests

UI 只做必要技术验证，不作为完整 Search UX 长期定稿。

## 3. SearchProvider 必须改

不能长期定义：
`SearchProvider -> Route[]`

建议：

```ts
type SearchEntityType = "artist" | "route" | "place" | "event"

type SearchResponse = {
  query: string
  sections: SearchSection[]
  requestId: string
}
```

底层当前可以只填部分 section，但 contract 不锁死 Route-only。

## 4. 数据模型新增/明确

近期 Search/IA 必须保留：
- Event
- EventArtist

必须分开：
- Place verification
- ArtistPlaceRelation verification
- Claim/Evidence verification

后续 Slice：
- Journey
- JourneyStop
- Memory
- Poster
- Community
- TradePost
- START Card
- Doll

不要在 Slice 001 一次建完，但 ADR/文档要明确稳定引用方式。

## 5. Artist Hub 提升到近期 Slice

Artist 不只是搜索内部识别实体。

需要正式实体页：
`/artists/:artistId`

API：
`GET /api/v1/artists/:artistId`

返回：
- identity
- cities
- recommended routes
- optional events

## 6. Figma Plan 修正

旧三页：
- Start Home
- Search Results
- Route Detail

不足。

新的 Discovery 至少需要：
- Start Home
- Search Results
- Artist Hub
- Route Detail
- Place Detail baseline

Event Hub 归 Community/Event Slice。

## 7. Start Home

必须加入：
- floating recommendation bubbles
- Doll low-frequency interaction

即使当前不实现个性化算法，正式 Figma 不能把长期首页定稿为纯搜索框。

## 8. Search Results

必须支持多实体布局。

城市搜索默认：
`Artist → Route → Place → Event`

## 9. Route Detail CTA

正式产品：
- 主：开始路线
- 次：分享给朋友

技术 Slice 若 Journey 未实现，可以 feature flag / disabled / design-only，但不能把“查看路线站点”写成长期最终主 CTA。

## 10. Route Detail 信息顺序

必须保持：
1. 偶像关联可信度
2. 想去感
3. 怎么走

地图/交通后置。

## 11. Figma Source of Truth 范围

若 Slice 001 Figma 只是工程验证，必须标注：

**Stage-specific implementation reference**

而不是完整 START Search UX 最终 source of truth。

## 12. 1A 是否可以先做

可以，但前提：
- multi-entity search contract 已修正
- Artist Hub 读模型纳入近期结构
- Event 作为正式 Search entity
- Evidence/verification 不只服务 Route
- 不把 Route-only DTO 固化成长期公共 API

## 13. 仍然不要提前做

- Journey runtime
- Poster
- UGC UI
- Community UI
- Trade UI
- Doll wardrobe
- full CMS
- IM
- vector/LLM search

## 14. Codex 更新任务

Codex 应更新：
1. `CURRENT_STATE_REPORT`
2. `SLICE_001_IMPLEMENTATION_PLAN`
3. `FIGMA_PLAN_SLICE_001`
4. Search DTO / Data Model
5. Slice roadmap

更新后等待确认，不直接编码。
