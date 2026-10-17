继续 START Slice 002 Phase C：正式视觉延展与本地可点击原型。首页及色卡已经用户确认，参考附件 HOME_APPROVED.png；不要重选方向或重做已验收信息架构。上下文包 START_DESIGN_CONTEXT.zip 包含 DESIGN.md、design-contract.md、PAGE_DESIGN_PLAN.md 和只读 baseline 原型副本。

先阅读设计合约和 PAGE_DESIGN_PLAN，再设计四页：Route Detail → Artist Hub → Search Results → Place Detail。以年轻旅行杂志、轻盈手绘、安静结构为统一语言，使用纸片叠放和少量手写边注，不能做卡墙、信息流、地图App换皮、满屏贴纸、巨大Hero、粉紫玻璃或大渐变。共享 paper #FBF3E8 / coffee #702720 / ice #CBE5FE / soft orange #C87950，橘色不可用作低对比小字背景。功能正文中文与英文用可用系统无衬线，14–16px；页标题约28px；艺术字仅品牌和次要边注。

必须读取并应用已安装 skills：D:/AI-Data/Codex/skills/reference-design-contract/SKILL.md（已有合约不重做），hallmark/SKILL.md（已有方向保留，用审查模式），emil-design-eng/SKILL.md（动效克制），ui-ux-pro-max/SKILL.md（可读性/焦点/reduced-motion）。不要套它们默认主题。GitHub前置研究已在PAGE_DESIGN_PLAN记录：Vaul、shadcn Dialog、Organic Maps；学习focus/语义/地图边界，不复制代码、不安装已停止维护的Vaul。

Route：Artist/City、紧凑标题、why值得去与短故事，START明显为主、SHARE次要，MAP为快捷；首站首屏可见；站点Preview只有轻量relation、SOURCE、PLACE；来源缺失诚实说明。Artist：identity、sticky城市索引、城市章节和路线目录；Event可选折叠，不抢主线。Search：Artist→Route→Place→Event四实体目录，短行、留白、细线、有限冰蓝分块，不加长why/核验/距离时长；搜索艺人是选择Artist Hub，未知内容empty，不固定跳南京。Place：WHY+SOURCE，地址清晰、一次正常滚动内且视觉不弱于PHOTO SPOT/ANGLE；缺失摄影资料如实标记，不造事实。

先输出四页390视觉参考与共享tokens/components说明，再制作原型串联Home→Search→Artist→Route→StopPreview→Place。首页沿用已确认方向，只实现进入原型所需输入与链接，不重新发明Logo或色卡；未能还原艺术字或娃娃资产应记录为差异，禁止变形/重绘锁定角色。不要把截图整页当可编辑UI或覆盖全部点击区。

复用上下文包baseline/app.js的路由、IME、搜索上下文/滚动恢复、原生dialog、Escape与关闭回焦、city sticky、地图marker关联、retry和缺失状态。fixture.json保持字节一致。baseline文件为只读，不修改原仓库、不写工作目录外旧工作区；所有新文件/下载/数据保存在D盘当前任务或Open Design已配置D盘namespace。无真实API、登录、Journey/GPS、Poster/Book、UGC、Community/Event Hub、Me/Doll runtime；不merge/deploy，不改模型绕过额度。

补Home focus/typing、Search loading/empty/error/retry、Artist sticky city、StopPreview、Map active、Source/Reference、START deferred。输入即时，按压100–160ms，浮层150–250ms可打断，transform/opacity，reduced-motion可直接阅读最终状态。390×844主要视口；320不溢出、目标至少44px；768重排成索引侧栏/章节列/路线地图两列；1280限制阅读宽度，不能等比放大手机。

输出可在Open Design预览并可修改的HTML/CSS/JS，不依赖外部字体/CDN，不新增重框架。原型文本诚实标注合成数据，照片只是视觉占位，不作为偶像真实到访证据。保留baseline/verify.mjs与verify-phase-b.mjs全部断言，运行新原型的现有18+4行为检查；新截图390/320/768/1280和关键状态存D盘。报告哪些真正通过、哪些未运行及具体失败；不得删测试/弱化断言/改标签装通过。Figma目前Starter MCP额度受限，不能声称完成Figma SOT或最终Phase C验收。生成后停止，等待本对话独立审查和修复，不进入Phase D。
