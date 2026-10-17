# START Discovery · design contract

本文是 Phase C 的执行约束，不替代 Figma 正式源文件。继承 2026-10-04 已确认首页、V2 产品规格与已验收 Phase B 结构；不授权 Phase D 或新模块。

## 1. Visual Theme & Atmosphere

年轻旅行杂志：安静清楚的阅读骨架，配合手绘标题、实景摄影、轻层叠纸片和少量私人档案痕迹。借鉴用户参考的节奏与材料关系，不复制原标志、人物、艺术字或完整构图。首页已确认图为 HOME_SOFT_ORANGE.png；其他页共享语言，但使用目录、城市章节、路线轨迹、地点档案各自的版式。

## 2. Color

沿用已确认 token：paper #FBF3E8，ink #702720，ice #CBE5FE，accent #C87950。咖啡色承担正文，冰蓝与柔橘承担分块和有限强调。已有对比计算记录：ink/paper 约 9.54、ink/ice 约 8.09，ink/accent 约 3.15。橘色块上的小字需另选通过 4.5:1 的配色；不能因参考图好看就把低对比小字交付为可用。图片蒙版与 disabled 文本仍需现场测量。

## 3. Typography

Logo 与 Start with 使用自有艺术字形，轻微不规则、明确疑问感；不把其扩展到所有功能标题。功能中文使用 PingFang SC 或可用系统无衬线回退；英文使用系统无衬线，数字可用系统等宽回退。不可默认打包 Apple 字体文件。正文 14–16、分区标题 18–20、页面标题约 28 逻辑像素为起点；最终以 390 宽度实际阅读校准。手写边注仅用于非必要信息，不承担地址、动作、证据或状态。

## 4. Spacing & Grid

390 为主视口，320/768/1280 为关键证明。建议基础间距 4/8/12/16/24/32，手机内容边距 20（320 可降至 16）；这些是实施建议，尚非 Figma 测量结果。768 应重新分配列与章节空间，避免整页等比放大手机。文字块有独立边界，纸片可以层叠，点击目标不层叠遮挡。

## 5. Layout & Composition

Start：搜索唯一主焦点，四组已确认分类、换一组、小娃娃与薄步数条服从它；步数明确为示意或未接入。Search：四实体目录，不在结果堆长 why、核验、距离与时长。Artist：identity → city index → city chapter → routes，optional events 次要。Route：为什么值得去 → 站点与走法，START 高于 SHARE，MAP 为快捷动作；不加巨大 Hero。Place：WHY，地址在一次正常滚动内且不弱于 Photo Spot/Angle，source 可达。

## 6. Components

正式系统至少包括 Logo/BrandHeading、SearchField、Primary/Secondary/ShortcutAction、EntityIndexRow、CityIndex/Chapter、RouteIdentity/StopRow、StopPreview、SourcePanel、AddressBlock、PhotoReference、BottomNav 与 Loading/Empty/Error/Retry。复用 variants 表达状态，不复制五套相似组件。Stop Preview 只保留轻量 relation、SOURCE、PLACE。票根仅作为后续 Memory 视觉参考，本轮不实现海报或 START Book。

## 7. Motion & Interaction

Emil 原则：先判断目的和频率，再选择动画；输入和键盘触发保持即时。纸片的翻页/展开以来源方向和层级连续性解释内容变化；不整屏同时漂浮。按压反馈建议 100–160ms，浮层 150–250ms，以 transform/opacity 为主，可打断、可快速返回。实际曲线使用技能的标准值而非随意猜测。尊重 reduced-motion，减少模式显示最终可读状态。静态参考图不能证明动效已完成。

## 8. Voice & Brand

轻盈、亲切、有出发邀请感；保留 Start with […] ? 核心入口。只呈现用户做决定所需文字，不把工程术语或架构解释放进页面。真实数据、演示内容、证据缺失、路线发布和开始路线暂缓分别说明，不造真实核验、传感器、导航或分享能力。

## 9. Anti-patterns

禁止粉紫玻璃、巨大渐变、重复圆角卡墙、信息流首页、满屏贴纸、报纸式过重功能标题、过大僵硬娃娃、装饰遮挡输入、地图换皮、隐藏地址及全页相同入场动画。保留角色身份母版；未批准趴姿/坐姿不能通过变形母版或重新生成面部冒充完成。已有风格锁定后，不套用 Hallmark 随机主题或 UI UX 默认调色盘。
