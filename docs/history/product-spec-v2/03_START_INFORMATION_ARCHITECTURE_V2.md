# START — Information Architecture V2

日期：2026-10-01  
状态：P0 IA 基线。

## 1. 一级导航

固定：
- Start
- Community
- Me

不新增 Go / Map / Journey / Book / Doll 一级 Tab。

## 2. Start IA

```text
Start
├── Home
├── Search Results
├── Artist Hub
├── Route Detail
├── Place Detail
├── Event Hub
├── Journey
│   ├── Arrival
│   └── Finish
├── Completion Poster
└── Poster Editor
```

建议路由：
- `/`
- `/search?q=...`
- `/artists/:artistId`
- `/routes/:routeId`
- `/places/:placeId`
- `/events/:eventId`
- `/journeys/:journeyId`
- `/journeys/:journeyId/poster`

## 3. Search Results

结果允许：
- Artist
- Route
- Place
- Event

必须保留 query / scroll / selected result。

## 4. Artist Hub

`/artists/:artistId`

结构：
- Artist Identity
- Cities
- Recommended Routes
- Optional Events

城市 P0 可先作为 Artist Hub 内过滤上下文，不必先建独立 Artist × City 页面。

## 5. Route Detail

`/routes/:routeId`

结构：
- Hero
- Route Identity
- Why This Route
- Artist Story
- Verification Summary
- Stops
- Logistics
- Evidence / Sources
- CTA

必须支持 Deep Link，不依赖前一页。

## 6. Place Detail

`/places/:placeId`

回答：
> 这个地方为什么值得追星用户来？

结构：
- Place Identity
- Artist Relations
- Evidence
- Photo Reference
- Address / Practical Info
- Related Routes
- Related Artists

## 7. Event Hub

`/events/:eventId`

默认归 Community，但可从 Start Search 进入。

## 8. Journey

`/journeys/:journeyId`

Journey 是流程页，不是一级实体页。

内部状态建议：
- navigating
- near_stop
- arrival
- reviewing
- finished

## 9. Completion Poster

`/journeys/:journeyId/poster`

未来必要时再独立 `/posters/:posterId`。

## 10. Community IA

```text
Community
├── Home / For You
├── My Communities
├── Community Detail
├── Event Hub
└── Live Trade
```

建议：
- `/community`
- `/community/mine`
- `/communities/:communityId`
- `/events/:eventId`
- `/events/:eventId/trade`

不建全局 `/trade` 市场入口。

## 11. Me IA

```text
Me
├── Home
├── START Card
├── START Book
│   └── Memory Detail
├── Doll
├── Collection
├── My Routes
└── Settings
```

建议：
- `/me`
- `/me/card`
- `/me/book`
- `/me/doll`
- `/me/routes`
- `/memories/:memoryId`

## 12. Create Route

统一：
`/routes/new`

内部 step：
- Basic
- Stops
- Evidence
- Reorder
- Preview
- Submit

## 13. 页面类型

一级入口页：
- Start
- Community
- Me

实体页：
- Artist Hub
- Route Detail
- Place Detail
- Event Hub
- Community Detail
- START Card
- Memory

流程页：
- Journey
- Poster Editor
- Create Route
- Submission

聚合页：
- Search Results
- My Communities
- My Routes
- START Book

不同类型不能全部套相同 UI 模板。

## 14. 登录边界

匿名：
- Start
- Search
- Artist
- Route
- Place
- Community browse
- Event browse

登录：
- Journey 长期保存
- START Book
- START Card
- 投稿
- Join Community
- Live Trade
- Collection

全局需要 `returnTo`。

## 15. 返回规则

- Search → Entity → 返回原 query/scroll
- Artist → Route → 返回原城市位置
- Event → Trade → 返回 Event Hub
- Book → Memory → 返回原翻页位置
- Route → Journey → Finish 后进入 Poster/Memory，不简单返回 Detail

## 16. Bottom Navigation

普通实体页可显示；沉浸流程可隐藏：
- Journey
- Poster Editor
- Create Route

## 17. Deep Link

建议支持：
- Artist
- Route
- Place
- Event
- Community
- START Card
- Memory

Journey 默认不公开分享。

## 18. 禁止结构

不要出现：
- Start 下额外 Map/Go/AI/Trending 一级入口
- Community 下 Marketplace/Nearby People
- Me 下 Level/Coins/Daily Check-in/Pet Energy
