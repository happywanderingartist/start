# Phase B Review / Fix Record

状态：实施、功能回归和截图已完成，最终独立复审待补入。本轮仅Phase B，Phase A五页继续复用，未进入C/D、高保真、正式Figma、Journey、merge/deploy。

## 六项修复与任务结果

| 用户要求 | 修复及实看结果 | 对比证据 |
| --- | --- | --- |
| Home Search唯一主焦点 | 输入280×56、深灰边界；问号14px与输入同排，helper11px；Bubble去填充、降为12px，Doll淡边界；所有快捷入口和focused仍可用 | 390-home / home-focused、320-home、768-home |
| Artist节奏与Optional Event | 身份34px、章24px、索引44px触达；活动为首章的轻量折叠条，键盘可展开到原Event读目标；768身份/索引左、章节右 | 390/768/1280-artist；new behavior第二项 |
| Route标题与动作 | 标题30/36，动作间隔32；START18px加粗下划线，SHARE12px普通灰；MAP12px辅助文字、保留44px点击区 | 320/390/768/1280-route |
| Stop Preview精简 | 删除MAP及未使用处理分支；只保留轻关联、SOURCE、PLACE，原嵌套SOURCE/VERIFICATION及关闭回焦点保留 | 390-route-stop-preview、source、verification |
| Place WHY与地址 | WHY HERE→WHY；HERE首项为地址，地址值16px、标签14px；未知Photo Spot/Angle降为80px浅灰对象并放在地址后；320/390/768地址完整落在一次正常滚动范围内 | 320/390/768/1280-place；address；new behavior第三项 |
| 768不是仅无溢出 | Home搜索380px且辅助不升级；Search分组索引与顺序正文并置；Artist索引/章有效并置；Route Stops/Map、Place WHY/HERE及REFERENCE/RELATED继续原分区 | 五页768视口/整页；额外IAB五页实看 |

原地址在390已可见，本轮解决的是排序与权重，不夸大成找不到地址。Search没有把Place提升到Artist旁边；四组结果顺序仍Artist→Route→Place→Event。未知数据和合成事实边界保留；没有用装饰或虚构内容取得视觉效果。

## 失败、修复、回归

1. 新增4项真实行为检查先在未修改Phase A上全部失败，before/ux-behavior-report.json保存RED。后续检查覆盖Preview少一项动作且SOURCE回焦点、活动折叠后键盘可访问、WHY/地址先于Mini Cards、768索引跳转保持查询和四组顺序；不声称RED独立验证了每个内部子断言。
2. 首次新增行为回归3/4：索引hash触发popstate重新render，结果瞬时清空。修复为截获分组链接、在原文档scrollIntoView，不更改查询/路由和历史。原同一断言4/4通过。after/ux-behavior-first-failure.json及log保存失败。
3. 原18项回归发现320 MAP宽37.625px，原44×44断言未改。只增min-width44并保留小字视觉，全部18/18通过。after/browser-first-failure.json及log保存失败。
4. IAB实看发现新Artist grid自动行高把768城市索引推到首屏外，虽不溢出仍不可接受。修复grid行高为auto/min-content/1fr，索引重新邻近身份且章节正文并置；最终768截图和独立复审核对。保留原末章锚点尾部空间。

## 回归与证据边界

原18项浏览器检查名称及断言不变，before/after均18/18，新增行为4/4。320×844、390×844、768×1024各五页；1280×900 Artist/Route/Place；49张before＋49张after，含18视口/18整页/13状态。PNG有每张实际尺寸/SHA256；IAB JPEG另存用于实看。SCREENSHOT_COMPARISON_INDEX.md与COMPARISON_GALLERY.html提供同名配对，派生comparison图只是并置原图、不替换原始证据。

pnpm check：typecheck、Vitest21/21、build、Node18/18通过；foundation typecheck、API编译、contract/domain9/9通过，完整输出在after/*.log。API/schema/fixture没有修改；本轮不运行migration/seed，不启动PostgreSQL，001真实PG历史结果不能冒充本轮UX验收。未实测真机中文键盘、真人任务成功率、真实资料长文、网络及地图Provider；不宣称完整WCAG审计。单城市变体/真实媒体lightbox仍是Phase A已披露未覆盖项。

verify.mjs仅调整证据输出目录（默认Phase B after，可环境覆盖）和报告scope说明，不改变测试名、断言或通过label；Phase A历史报告与截图原封保留。API/生产源/tests/资产94份及旧三工作区253hash/WIP需以最终provenance验证。阶段入口README和AGENTS追加最新授权，历史记录不回写为“已经做过B”。

Git基线为74a103ec5ee7f8eab3ce471eacca8711b2a6b82f，分支feature/start-slice-002-phase-b。每次提交、最终独立复审及保护核验记录在后续段落；不会merge至master或继续C。
