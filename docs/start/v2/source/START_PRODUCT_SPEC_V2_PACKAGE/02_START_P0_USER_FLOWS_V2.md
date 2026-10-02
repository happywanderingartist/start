# START — P0 User Flows V2

日期：2026-10-01  
状态：P0 主流程基线。

## Flow A｜搜艺人 → Artist Hub → Route Detail

`Start Home → 输入艺人 → Search → Artist Hub → 城市块 → 推荐路线 → Route Detail → 开始路线 / 分享`

异常：
- 艺人存在但暂无路线：展示已收录城市/地点，提示路线还在整理
- 同名艺人：先身份区分
- 未找到：Empty，不 fallback 固定路线

## Flow B｜搜城市 → 混合结果

`Start Home → 输入城市 → Search Results`

默认：
1. Artist
2. Route
3. Place
4. Event

点击去向：
- Artist → Artist Hub
- Route → Route Detail
- Place → Place Detail
- Event → Event Hub

## Flow C｜推荐气泡

`Start Home → 浏览气泡 → Doll 轻互动 → 点击 → 对应实体页`

约束：
- 少量
- 慢速
- 不遮搜索
- 不形成 Feed
- 不频繁弹话

## Flow D｜Route Detail → Journey

`Route Detail → 开始路线 → Journey`

建议允许匿名先进入；在长期保存/跨设备/START Book 等持久化节点要求登录。

## Flow E｜Journey

主页面：
- Map
- Doll
- Route Progress
- 下一站
- 跳过
- 结束路线

## Flow F｜GPS 到站

`进入附近范围 → 提示“你到了” → 用户确认`

定位关闭：
`手动确认到达`

## Flow G｜Arrival

到站后：
1. TA 在这里发生过什么？
2. 在这里怎么拍？

操作：
- 拍照
- 上传照片
- 暂时不拍
- 下一站

## Flow H｜跳站

`点击跳过 → 确认 → stop = skipped → 下一站`

## Flow I｜主动结束

`结束本次路线 → 确认 → Journey finalized → Poster`

不把 3/5 定义为失败。

## Flow J｜自动海报

`Journey Finish → Generating → Completion Poster`

优先素材：
1. 实际去过地点
2. 用户照片
3. 偶像相关视觉元素

## Flow K｜编辑海报

支持：
- 替换照片
- 调整位置
- 改文字
- 贴纸
- 若干布局

不做专业图层/模板市场。

## Flow L｜Poster → START Book

结束 Journey 后自动创建 Memory，关联：
- Journey
- Route
- 日期
- Stops
- Photos
- Poster

## Flow M｜START Book

`Me → START Book → 翻页/浏览 → Memory Detail`

可按艺人/城市/年份筛选，但默认不是数据库列表。

## Flow N｜创建 Route

`新建路线 → 基础信息 → 添加地点 → 排序 → 补充 → Preview → Submit`

## Flow O｜添加地点

`搜索地点/地图选择 → 自动填地址/坐标/城市/provider ref → 用户填写“为什么相关” + 证据 → 添加到路线`

## Flow P｜审核

`提交 → 自动初筛 → 人工审核`

结果：
- 已核验发布
- 部分未核验发布
- 需要补证
- 不通过

## Flow Q｜Community

`Community → 个性化 section → 社群/Event/Route/现场活动`

不是时间倒序 Feed。

## Flow R｜Event Hub

`Community/Search/Artist → Event Hub`

第一屏：
- Event
- 艺人
- 日期
- Venue
- 状态

之后：
- Live Trade
- 相关路线
- 社群
- 可选现场内容

## Flow S｜现场换物

`Event Hub → 现场换物 → Live Trade Board`

发布：
- 我有什么
- 我想换什么
- 我在哪个区域
- 怎么认出我

状态：
- 换物中
- 已约
- 已完成
- 暂时离开

P0 不要求完整 IM。

## Flow T｜Me

`Me → START Card / Doll / START Book`

START Book 为主内容入口，Card 提供身份，Doll 提供陪伴。

## Flow U｜START Card

自己的卡：
- 昵称
- 喜欢的艺人
- 兴趣标签

查看别人时额外显示：
- 你们的共同点

不做匹配分数。

## Flow V｜Doll

P0 主要出现：
- Start Home
- Journey

基础状态：
- idle
- walk
- look
- sit
- happy
- arrival reaction
- route completion reaction

## 登录策略

匿名可：
- Start
- Search
- Artist Hub
- Route Detail
- Place Detail
- Community 浏览
- Event 浏览

需要登录：
- 长期保存 Journey
- START Book
- START Card
- 投稿
- 加入社群
- 换物发布
- 收藏

登录后必须回到原任务位置。
