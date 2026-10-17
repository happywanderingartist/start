# START — Journey & Memory Spec V2

日期：2026-10-01  
状态：P0 Journey、Poster、START Book 规格基线。

## 1. Journey 定义

Route 是公共可复刻内容；Journey 是某个用户实际走某个 RouteRevision 的一次经历。

## 2. 开始路线

Route Detail 主 CTA：**开始路线**

点击后：
- 创建 Journey
- 固定 route revision snapshot
- 进入地图主界面

匿名用户可创建临时 Journey；长期保存时要求登录。

## 3. Journey 页面

核心层级：
1. Map
2. 下一站
3. 进度
4. Doll
5. 跳过 / 结束

不要做成普通 Route Detail 的卡片列表。

## 4. 地图

地图负责：
- 当前路线
- 当前站
- 下一站
- 路径
- 外部导航入口

START 不自研完整导航引擎。

## 5. 到站

GPS proximity 仅触发提示，不自动完成。

`进入阈值 → 提示 → 用户确认`

定位失败/拒绝：
`手动确认到达`

## 6. Stop 状态

建议：
- pending
- near
- arrived
- visited
- skipped

## 7. Arrival

核心：

### TA 在这里发生过什么
- story
- evidence
- verification

### 怎么拍
- reference
- angle
- pose
- source

操作：
- 拍照
- 上传
- 不拍
- 下一站

## 8. 跳站

默认按顺序，但可跳过。跳过不是失败，可返回。

## 9. 自由结束

用户可在任何时点结束。

文案示例：
> 今天走过了 3 个地点。

避免：
> 未完成路线

## 10. Journey Snapshot

必须保存：
- route revision
- route title at time
- stop snapshots
- visited/skipped state
- start/end time
- user photos
- relevant evidence snapshot

后续 Route 更新不能改变历史 Journey。

## 11. Poster Generation

Journey 结束后立即触发。

输入优先：
1. 实际去过地点
2. 用户照片
3. 偶像相关元素
4. optional metadata

状态：
- generating
- generated
- failed
- editing
- saved

## 12. Poster Editor

P0 支持：
- 替换照片
- 调整照片
- 改文字
- 增删贴纸
- 若干布局

不做：
- 专业图层系统
- 大型模板商城
- 复杂矢量工具
- 全量字体平台

## 13. START Book

每次 Journey 结束生成 Memory。

Memory 包含：
- Poster
- Photos
- Route
- Stops
- Date
- Journey summary

## 14. START Book 视觉

目标：

**实体册子 / 收藏册 / scrapbook 的翻阅感**

不是：
- dashboard
- Excel 式历史
- 单纯时间轴

可筛选：
- 艺人
- 城市
- 年份
- Route

但默认视觉不被这些分类绑死。

## 15. 分享

Route Detail 次 CTA：分享路线。

Poster 完成后：可分享海报。

Memory 是否公开分享需单独控制隐私。

## 16. Doll 在 Journey

只做轻量陪伴：
- idle
- walk
- look
- arrival reaction
- happy
- completion reaction

不参与导航判断。

## 17. 验收

- 路线版本更新不影响旧 Journey
- GPS 不误自动完成
- 定位拒绝仍可手动继续
- 跳站后流程连续
- 3/5 可正常结束
- Poster 生成失败可重试，不丢 Journey
- Memory 自动创建
