# START — Slice Roadmap & Acceptance V2

日期：2026-10-01  
状态：建议重拆后的 P0 研发路线。

## 总原则

技术切片可以小，但不能把“当前未实现”误写成“产品长期不存在”。

## Slice 000｜Git / Asset / Documentation Baseline

目标：
- 保护 master / map v0.2 / character 现有成果
- 备份 dirty worktrees
- 建独立 START 集成工作区
- 固定 provenance

验收：
- 三旧工作区未被破坏
- WIP 可恢复
- bundle / backup 校验
- 新工作区建立
- 文档基线提交

## Slice 001｜Catalog & Discovery Foundation

目标：
- canonical Artist
- Alias
- City
- Place
- ArtistPlaceRelation
- Evidence
- Route
- RouteRevision
- RouteStop
- Event 最小读模型
- 多实体 Search contract
- public read API
- PostgreSQL migrations/seeds

注意：
可以先只让 Route/Artist 有真实结果，但 contract 必须多实体。

验收：
- 真 PostgreSQL
- migration 可重建
- draft/withdrawn 不泄露
- route revision 冻结
- evidence 维度分离
- multi-entity response contract 已存在

## Slice 002｜Start Discovery

实现：
- Start Home
- Search Results
- recommendation bubble baseline
- Artist Hub
- Route Detail
- Place Detail baseline

验收：
- 艺人搜索进入 Artist
- 城市搜索按 Artist→Route→Place→Event 组织
- query/scroll 返回恢复
- Route Detail 展示来源/核验
- 正式 CTA 为开始路线/分享

## Slice 003｜Journey

实现：
- Start Journey
- map integration
- progress
- GPS proximity
- manual arrival
- skip
- finish
- Doll basic states

验收：
- Route 与 Journey 分离
- 定位拒绝仍可继续
- 不自动误打卡
- 3/5 可正常结束
- Route revision snapshot 固定

## Slice 004｜Memory

实现：
- auto poster
- poster editor
- Memory
- START Book

验收：
- Journey finish 自动生成
- 生成失败不丢 Journey
- Poster 可轻量编辑
- START Book 非 dashboard 列表

## Slice 005｜UGC Route

实现：
- New Route
- Add Place
- Evidence
- Reorder
- Preview
- Submit
- Auto precheck
- Human moderation baseline

验收：
- 必填关系说明与证据
- 未核验状态可见
- 审核日志
- 不直接修改已发布 revision

## Slice 006｜Community & Event

实现：
- Community Home
- My Communities
- Event Hub
- Live Trade Board

验收：
- Community 不是 Feed
- Trade 必须绑定 Event
- 不公开精确 GPS
- 无完整 IM 仍可发布换物

## Slice 007｜Me & Social Identity

实现：
- Me
- START Card
- START Book integration
- Doll page baseline

验收：
- START Card 不做 match score
- Me 不做功能九宫格
- Doll 不做宠物养成
- 身份资产一致

## P0 完成定义

至少证明一条真实闭环：

`发现 → 选择路线 → Journey → 到站 → 结束 → Poster → START Book`

以及内容闭环：

`新建路线 → Evidence → 审核 → 发布`

以及现场价值链：

`Event → Live Trade publish/browse/status`

## 跨 Slice 验收原则

每个 Slice：
1. 先设计/合同
2. 行为测试
3. 实现
4. 独立审查
5. 修复
6. 回归
7. 记录

禁止：
- 删除失败测试伪装通过
- mock 通过当真 DB 通过
- 旧 demo 全绿当 START 完成
- Figma 截图反向决定数据结构
