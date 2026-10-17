# START 产品说明：给其他 AI 的快速接手材料

日期：2026-10-03。这是基于用户已确认的 V2 产品规格、已验收 Phase A/B 结构，以及最新首页视觉反馈编写的产品摘要。它不把产品计划写成已交付功能，也不把旧 Fan-route demo 当成正式 START。详细规则以随包 product_spec_v2 原始文档为准；最新用户反馈与已验收 UX 在对应范围内优先于早期视觉草稿。

## 产品是什么

START 首先是追星产品，其次才使用地图能力。它帮助追星用户找到可信的艺人足迹、选择可复刻的路线、体验现场故事与拍照位置，并留下属于自己的追星记忆。核心价值是可靠的追星地点数据、可直接复刻的路线、现场体验和记忆沉淀。用户问的不是单纯“怎样从A到B”，而是“我喜欢的艺人去过哪里，这里为什么真的和TA有关，我也能去吗”。

第一市场是中国大陆；第一阶段 Mobile Web MVP，后续微信小程序，再考虑 App。三端共用后端与数据。产品不能变成普通旅游攻略、高德／百度地图换皮、小红书／微博信息流、闲鱼交易市场或儿童宠物游戏。

## 用户价值链与整个 P0

体验主循环：发现 → 决定去哪里 → 查看路线 → 开始复刻 → 到站 → 偶像故事／拍照 → 结束路线 → 自动纪念海报 → START Book。用户可以跳站、自由结束，实际3/5也能正常形成记忆，不被定义成失败；GPS接近只提示，用户确认到达，定位关闭可手动确认，拍照不是必须打卡条件。

内容循环：发现足迹 → 新建路线 → 添加地点、关联解释与证据 → 自动初筛 → 人工审核 → 发布 → 他人复刻 → 补充／纠错。用户投稿路线是 P0，完成纪念海报也是 P0；这些功能后置到对应切片，并未降为 P1。

P0 分层包含发现、Journey、Memory、UGC、Community 与身份。Memory 包括自动纪念海报、轻量编辑、START Book。Book 是相册＋日记＋收藏册，而不是历史表格。海报编辑不发展成完整 Canva／Photoshop。

## 导航和发现

一级导航固定 Start / Community / Me，没有独立 Go、Map、Journey、Book 或 Doll Tab。Start 负责去哪、看谁、做什么；Community 负责圈子里的事件；Me 负责身份和留下的记忆。

Start Home 的核心是 `Start with [ ... ] ?`，长期输入支持艺人、城市、地点、路线风格、Event 与自然语言。首页不只是搜索框，还要有少量个性化悬浮推荐气泡与 Doll 低频轻互动。当前设计基线是 Search 唯一主焦点、最多3个推荐气泡、Doll不阻断任务；推荐算法和Doll runtime没有因为设计图里出现就算完成。

Search 合同支持 Artist / Route / Place / Event，不能长期 Route-only。城市查询如“台北”，优先级 Artist → Route → Place → Event；艺人查询如“苏打绿”，优先进入 Artist Hub。返回搜索应保留 query、滚动与选择上下文，不能输入任意内容就跳到固定南京路线。

## 五个正式 Discovery 页面

Start Home：邀请与输入、少量推荐、边缘陪伴，避免首页 feed 和大 Hero。Search Results：选择层，不是解释层；默认结果行不塞长 why、核验块、距离时长、来源与站数。Artist Hub `/artists/:artistId`：从喜欢一个艺人转向能去哪里，结构是 Artist identity → 横向 City Index → 纵向 City Chapters → 路线；Optional Event次要，不是百科。

Route Detail `/routes/:routeId`：产品价值顺序是可信 → 想去 → 可执行。已验收 Phase B 表达为连续滚动，identity与START/SHARE → Stops → Map；不强制巨大Hero或首屏长文。START明显强于SHARE，MAP↓是快捷动作。Stop Preview只保留轻量relation、SOURCE、PLACE，不额外堆MAP。正式主CTA是开始路线，次CTA是分享给朋友；Journey未接线时明确延期，不能伪装开始成功，也不能把查看站点当长期主CTA。

Place Detail `/places/:placeId`：identity → WHY → HERE → Reference → Related。为什么与艺人有关、证据、拍照参考、地址与实际信息都要找到。使用WHY而非WHY HERE；地址在一次正常滚动内可发现，视觉上不能弱于Photo Spot／Angle；Mini Cards是信息对象，不是功能按钮墙。

## 可信度

必须拆开 Place是否真实存在、ArtistPlaceRelation是否可信、具体claim有什么证据、Route是否已发布。不能用一个verified或万能已认证覆盖全部语义。Evidence是一等对象，可记录艺人官方社媒、采访、节目、活动、演出、媒体、用户投稿等来源；展示未核验／部分核验／已核验／有争议，核验边界不能靠艺术排版隐藏。

审核与核验是不同维度：证据不足不必一律禁止发布，但发布未核验内容需明确披露与审核边界。来源失效可以保留历史标题、时间与曾经核验信息，显示暂不可访问；不能把失效自动当作事实为假，也不能继续宣称来源新鲜有效。

## Community、Me与Doll

Community P0只有For You／我的社群／Event Hub／现场物料交换。Event先显示艺人、时间、地点、场馆和状态，再进入换物、路线与社群。Live Trade绑定现场Event，表达我有什么、想换什么、所在粗区域和辨认提示，不公开精确GPS，不做闲鱼市场或完整IM。

Me由START Card、START Book和Doll组成。Card表达昵称、本命、兴趣与共同点，不做92%匹配度。Doll是追星陪伴载体，用简单动作、表情与Journey状态回应；角色身份、脸与比例锁定，不做饥饿、喂养、洗澡、EXP、能量等级、每日养成任务、经济系统或完整衣柜。

## 技术边界

Modular Monolith、PostgreSQL-first、共享后端；地图、搜索、存储、登录等外部服务通过Provider Adapter解耦。地图与导航使用成熟服务，不从零自研。当前不上微服务、独立搜索集群、LLM或vector search。学习成熟Github项目的pattern，审阅代码与license后再设计自己的实现，不直接fork改皮肤、大段复制或拼接开源代码。

核心领域包括Artist、ArtistAlias、City、Place、PlaceProviderRef、ArtistPlaceRelation、Claim／Evidence、Route、RouteRevision、RouteStop、Event／EventArtist。不可变RouteRevision为后续Journey和内容审核保留基础。进一步模型、接口、状态和测试要求见V2原文件，不能只凭UI稿反推数据结构。

## 切片与当前状态

路线为000 Git／Asset／Documentation Baseline → 001 Catalog & Discovery Foundation → 002 Start Discovery → 003 Journey → 004 Memory → 005 UGC Route → 006 Community & Event → 007 Me & Social Identity。总体P0范围不等于本轮同时实施全部功能。

当前接手依据：用户已确认Phase A五页灰阶Wireframe完成、Phase B UX修复验收通过，不重做既定信息架构。当前在Slice002 Phase C视觉设计，近期用户将讨论收敛到首页、品牌字样、字体、气泡和旅行杂志风格。Slice000/001此前已执行，但本文不是本轮重新运行数据库和测试的验收报告；工程细节需读取原验收记录，不根据历史描述自行宣称当前全绿。

Figma有正式文件和可编辑草稿，但当前首页视觉尚未定稿；V3修改曾遇Figma MCP额度限制而未完成新截图核对。Canva样板生成失败。最近生成的写实书本首页只是讨论概念，不是用户确认的最终方向。当前打包里的用户参考图才是视觉依据，不把AI生成稿冒充用户素材。

## 当前视觉与工具分工

用户希望首页像摊开的年轻旅行杂志，清新、轻盈、有手作质感；字母、颜色、照片、叠放和动作丰富却不乱。最新要求：START成为自然有辨识度的标志，旧ST／ART拆行形状不合适；Start with彩色手绘、有童趣、适量放大；一般中英文字参考REF_21绿色字气质，边注参考REF_20手写；气泡REF_10，卡册REF_11–12，票根REF_28。不是每张参考的功能与画面都复制进来。

产品逻辑先Markdown／流程图；结构先低保真；正式UI、tokens、components、states、responsive、prototype与handoff放Figma。Canva只用于草图、moodboard、海报与拼贴。图像生成用于概念与独立素材，不能把整屏图片当可编辑正式UI。完整首页提示词见01_START_HOME_DESIGN_PROMPT_CN.md。

本轮给其他AI的任务仅为首页视觉方向探索和沟通：先读取产品说明、当前需求与参考索引，再制作一版可讨论首页；不写代码、不接真实API、不重做A/B、不新建业务功能，不进入Journey／Poster／Book／UGC／Community／Trade／Card／Doll runtime，不merge或deploy。以后实施必须另获用户明确授权。旧worktree、分支、未提交改动、provenance都需保留，不reset／clean、不整体merge三条旧线。

## 源文件与优先关系

随包product_spec_v2保留V2原始Markdown。先读00_README、01_PRD、02_UserFlows、03_IA、05_Search，再按所做模块读专项规格；产品全貌与切片边界参考11_Roadmap、12_AlignmentPatch、13_DecisionLog。phase_c_baseline保留项目状态和阅读入口，用于理解已通过UX。用户最新指令与明确验收在对应范围内优先；V2高于早期Fan-route文档；新首页视觉反馈不是推翻领域模型或扩大P0的授权。
