# START V2 — Slice 001 验证边界与正式 Discovery 设计计划

日期：2026-10-01。状态：计划待确认，本轮未创建Figma/Canva/低保真/高保真页面。本文件保留原请求的文件名，但重新界定其权威范围：Slice001是Catalog & Discovery Foundation，正式Discovery页面属于Slice002。

## 1. Source of truth范围与制作门禁

001不要求正式UI，可用HTTP/契约测试完成基础验收。若将来批准建立001技术验证Figma文件，必须显著标注 **Stage-specific implementation reference**、对应合同版本、暂缺能力与“不能作为完整START Search UX长期定稿”；不能把Route-only列表或纯搜索框长期定为产品。旧三页Figma计划未执行，原件保留历史，新计划替代其产品范围。

正式UI source of truth仍为经过确认的Figma；正式文件建议 `START / Mobile Web / P0`，Discovery阶段至少覆盖Home、Search、Artist Hub、Route Detail、Place Detail五页与状态、响应式、prototype。001技术示意不得自动升格为这份正式文件。数据/IA/逻辑以V2和仓库文档为先，Figma表现已确认规格，工程截图不能反向决定产品。

顺序：本轮计划确认 → 000保护/001基础 → 002低保真结构评审 → 正式Figma页面/组件/Tokens/状态 → Prototype与handoff确认 → 002页面编码。002制作前以001合同核对字段，并复读视觉包Library/Rules/Manifest/Checklist/Contact Sheet及所用原图；不因已画过技术示意跳过评审。Canva仅用于必要Moodboard/概念/海报/拼贴，不代替正式UI，本轮无需使用。

## 2. 正式Discovery五页及近期产品结构

| 页面与路由 | 核心任务与信息层级 | 主交互/阶段边界 |
| --- | --- | --- |
| Start Home `/` | Start with [ ... ] ? 为第一任务；少量悬浮推荐气泡；Doll低频轻互动空间 | 搜索或点击明确推荐entity；气泡不遮输入、不形成Feed。未登录初版可编辑精选并说明依据，不伪称个性化。Doll runtime003接入，002设计必须含静态/动态/无runtime的对应变体，不能永久删掉Doll |
| Search Results `/search?q=...` | 多实体sections，城市默认Artist→Route→Place→Event；精准艺人identity首位，Route封面/艺人关系/城市优先，统计辅助 | 用户点击艺人→Hub，无自动跳；同名先区分。返回保留query/scroll/selected result；空section≠不支持type |
| Artist Hub `/artists/:artistId` | Identity → 杂志目录式足迹城市块 → 推荐路线 → optional events；不是百科页 | city在Hub内作为filter上下文；Artist→Route→返回原city位置；无route仍展示合法已收录place/relation，未核验线索明确标状态 |
| Route Detail `/routes/:routeId` | 可信关联 → 想去感 → 怎么走；第一屏Hero/title/Artist/City/why worth replicating/short story；之后核验/站点，地图与交通后置 | 正式主CTA“开始路线”，次“分享给朋友”。003前开始路线可feature flag/disabled/design-only并说明阶段，不把查看站点变成最终CTA，不演示实际创建Journey |
| Place Detail `/places/:placeId` | Place identity → Artist relations/claims/evidence → 授权拍照参考 → 地址/实用信息 → 相关Route/Artist | 回答为什么值得追星用户来，不做点评/POI工具页；Place真实与相关事实核验分开，缺信息显示未知，不编开放时间 |

Event是正式search entity，卡片/行需在002设计中存在；Event Hub完整页归006。本阶段prototype可标注去向/events/:id与006交接，工程在未有该页时不设置无反馈死链接，不伪装功能已交付。001EventRead API可以技术验证，不能据此称Event Hub完成。

三主导航Start/Community/Me，无Go/Map/Book/Doll Tab。实体页可有底栏，流程页隐藏规则在后续Journey设计中定义；本轮不全面设计Community/Me/UGC/Journey/Poster。锁定长期结构不等于一次性制作全部P0页面。

## 3. 视觉映射与素材边界

视觉仍遵循 START_CODEX_VISUAL_REFERENCE_PACK_v2，目录为 `D:/Downloads/fan-route-codex-handoff/handoff-review-2026-10-01/START_CODEX_MASTER_HANDOFF_v1/05_VISUAL/START_CODEX_VISUAL_REFERENCE_PACK_v2/`。总体为Editorial Minimalism × Fandom Scrapbook：骨架克制、内容鲜活、信息清楚、局部出格。

| 页面 | 结构/表达参考与使用理由 | 不机械照搬 |
| --- | --- | --- |
| Home | REF_26结构/留白；REF_02摄影与标题关系；少量气泡在清楚输入之外形成生活感，Doll作为陪伴 | 不复制原照片/logo/字体；不把气泡做泡泡Feed或宠物任务菜单，不以大Hero挤掉核心输入 |
| Search | REF_26编辑目录与分区节奏；不同entity有各自信息样式 | 不把四类都套同款Route圆角卡，不以跨实体score重排城市优先级，不做瀑布流 |
| Artist Hub | REF_26档案/杂志目录骨架，艺人照片和城市块表达行动入口；人物注释如需要从包内适合人物参考中选择并标明 | 不自行新增视觉方向，不做百科/粉丝战绩表；城市标签不暗示全部到访已验证 |
| Route Detail | REF_26正文秩序 + REF_07景观Hero/标题关系，一处表达增强why/story | 不满屏手写/贴纸，不以指标/地图dashboard主导首屏，不每站重复装饰 |
| Place Detail | REF_26清晰事实目录，合法城市/场景摄影为内容 | 不做高德POI卡/大众点评分数，不把图片本身当证据 |

全页通常一处主表达，中性base与局部鲜明accent；功能字体清楚，表达字体只标题/局部。POSTER_ONLY参考留004海报，不扩普通功能页。已有R01/R02及18资产是Doll identity authority；缺sit/look动作在003单独设计/验收，不重新生成母版或拿现有walk称全部状态完成。摄影/字体/人物/参考图不自动有上线许可；缺图为合法variant，不造艺人到访照。

## 4. 文件组织与Design System

正式Figma文件按V2建议的00 Brief & References、01 IA & Flows、02 Foundations、03 Components、04 Start & Search、05 Artist / Route / Place、10 Responsive、11 Prototype、12 Handoff & Review逐步沉淀。06 Journey、07 Poster/START Book、08 Community/Event/Trade、09 Me/Card/Doll只记录后续范围或以后建立，不本轮画完。

Foundations最小集合：Color、Typography、Spacing、Layout、Radius、Border、Motion、Icon、Media。具体色值/字体/间距在设计确认时锁定，不由旧CSS或本计划自行发明新品牌色。语义色明确文本/交互/focus/verification；状态不得只靠颜色；功能正文可读且长中文不裁切。Auto Layout、safe-area、photo crop、max-width、focus/reduced-motion纳入规则。

| 组件组 | 最小组件与Variants |
| --- | --- |
| 输入/首页 | StartPrompt、SearchField（idle/focus/composing/loading/error）、Submit、RecommendationBubble（editorial/personalized占位、static/reduced-motion）、DollPlacement（runtime/deferred）；不做recommendation engine组件 |
| 导航/结果 | 三项Nav、BackContext、SectionHeader、ArtistResult、RouteResult、PlaceResult、EventResult、MatchReason、Pagination；保留entity区别与empty/not-enabled状态 |
| Artist/城市 | ArtistIdentity、EditorialCityBlock、CityFilter、RelatedRoute、OptionalEvents、NoRoutesState |
| Route/Place | Hero、WhyStory、RelationSummary、StopRow、ClaimRow、PracticalInfo、RelatedEntity、MetricValue（unknown/available）；一页不用无限同款卡 |
| 信任/动作 | PlaceValidity、RelationValidity、ClaimVerification、Publication/SourceAvailability、SourceDisclosure、RevisionMetadata；StartRouteCTA(active/deferred)与ShareCTA |
| 反馈 | Loading、Empty、Error/Retry、404/Withdrawn、MissingMedia、Partial/Unverified/Disputed；public安全文案不泄露draft |

状态/字段需对应001四实体DTO和分层trust数据。Route overall summary不能替代逐claim/逐relation，source可访问不等于claim verified。组件命名按语义，不按颜色或“卡片1”。

## 5. 必须设计的状态与Prototype

Discovery状态：idle/composing/loading/results/empty/error/retrying；四entity组空/可用/阶段未启用；同名Artist、Artist无Route但有Place、无足迹城市、无Event、来源失效、缺授权媒体、指标null、partial/unverified、withdrawn和直接链接。弱网/失败/较旧响应不可覆盖较新query，点击后撤回需不可查看并可返回；API异常不冒充零结果。

| Prototype链 | 必须证明 | 不能假装已实现 |
| --- | --- | --- |
| 搜艺人→Artist Hub→city→Route→返回 | 用户选择、同名区分、城市位置/查询滚动恢复 | 自动进固定Route或搜索成功自动跳Hub |
| 搜城市→四实体sections→Artist/Route/Place | 顺序Artist→Route→Place→Event、entity信息与导航区别 | 将空Event组称产品不支持Event |
| 首页气泡→entity | 不遮输入、少量/慢速或静态/reduced-motion、来源明确 | 无账号信号却称猜你喜欢、Doll改变推荐rank |
| Route why/story→source→开始/分享 | V2层级、正式CTA及延期状态、分享deep link | 003未完成就实际创建Journey；查看站点作为终局主动作 |
| Place关系/claim→相关Artist/Route | 四层trust可理解、来源展开/外链 | confirmed POI=艺人到访confirmed |
| empty/error/retry/deep-link/withdrawn | 同query重试、返回上下文、直接链接不依赖上一页 | 把Figma网络/位置模拟当工程验收 |

GPS拒绝/manual arrival、匿名长期保存/登录returnTo、Journey弱网等状态已锁定为后续003及持久化节点设计要求；在Discovery交接说明引用，不本阶段实现/绘制完整Journey。Poster、UGC、EventTrade、Me prototype各在004–007细化。

## 6. Viewport、交接与验收

主要390×844 CSS px，同时验320/768/1280；真实手机可用高度因工具栏/键盘变化，输入/按钮不能被safe-area或fixed nav挡住。宽屏用受限内容列/分栏，不自动变双列Feed；图片按用途裁切、长标题/地址换行、来源长URL不横向溢出。明确Tokens/断点/信息顺序/裁切而非只交几张截图。键盘focus、IME、Enter、status提示、Reduced Motion、触控目标与对比需写handoff并浏览器验证。

正式交接记录file URL/node IDs、确认版本/日期、Tokens、组件Variants、API字段/null/state映射、媒体asset ID/rights、Prototype、响应式与验收截图。每frame标真实reviewed内容/synthetic测试/待核验历史，stage-specific与product设计分开。Figma确认通过后才写002页面代码，代码修改不能静默替换已确认规格。

拒绝旧粉紫玻璃、重复圆角卡堆叠、地图工具页主导、小红书/微博Feed、闲鱼市场、儿童宠物、满屏拼贴；接受标准是五页任务一眼清楚、首页三元素共存且输入优先、城市四组顺序、Artist可行动、Route可信/想去/可走层级、证据可追溯及正式CTA。001不因没有正式Figma被阻塞，完整START Discovery也不因001技术示意就被宣称完成。
