# START — Community, Event & Live Trade Spec V2

日期：2026-10-01  
状态：P0 社群/Event/现场换物基线。

## 1. Community 定义

Community 不是微博式 Feed。

它回答：
> 我的圈子里最近有什么值得参与？

## 2. Community Home

采用 section 化混合推荐：
- Your Artists
- Your Communities
- Events
- Routes
- Live Activity

有主次，不做无限下拉帖子流。

## 3. My Communities

明确区分：
- Joined
- Followed
- Recommended

不能把推荐社群伪装成已加入。

## 4. Community Detail

P0 结构：
- Identity
- Description
- Linked Artist/Interest
- Upcoming Events
- Recommended Routes
- Lightweight Content

不要求完整论坛/Discord 能力。

## 5. Event Hub

第一屏必须先回答：
> 这是什么活动？

字段：
- Event name
- Artist
- Date
- Venue
- Status
- Basic notices

然后才进入：
- Live Trade
- Related Routes
- Communities
- Optional live content

## 6. Event 状态

建议：
- upcoming
- ongoing
- ended
- cancelled

## 7. Live Trade 定义

只属于某个 Event：

`/events/:eventId/trade`

它不是全站二手市场。

## 8. 发布字段

核心：
- 我有什么
- 我想换什么
- 我在哪个区域
- 怎么认出我

可选：
- 图片
- 备注

P0 不强制联系方式。

## 9. 区域

使用 VenueZone，例如：
- A3 看台
- 北门
- 场馆外指定区
- 周边摊位区

禁止公开精确 GPS。

## 10. 状态

- 换物中
- 已约
- 已完成
- 暂时离开
- 关闭

## 11. 联系链路

P0 不做完整 IM。

先验证：
- 浏览
- 发布
- 状态更新
- 简单响应意图（可后续）

## 12. 安全

禁止：
- 精确实时定位公开
- 强制手机号公开
- 身份证/票据敏感信息
- 未成年人高风险陌生人线下匹配机制

## 13. Event 与 Search

Event 是 Search entity。城市搜索中展示优先级在 Artist/Route/Place 后。

## 14. Event 与 Route

可关联：
- 演出前后可走的 Route
- 场馆周边相关地点

但不要变成普通旅游推荐。

## 15. 验收

- Event 第一屏不是换物市场
- Trade 必须绑定 Event
- 用户不公开精确位置也能使用
- 无完整 IM 仍可完成“发布换物公告”
