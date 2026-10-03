# Phase B Review / Fix Record

状态：实施→独立审查→修复→回归→记录闭环完成，最终独立复审通过。本轮仅Phase B，Phase A五页继续复用，未进入C/D、高保真、正式Figma、Journey、merge/deploy。

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
5. 最终独立审查提出两项轻微问题：320放大后的路线标题留下“线”孤字；768索引测试在1024px高度结果全可见，不能证明真实滚动。Route标题使用均衡换行与keep-all保留“春日城市路线”语义单元，不缩小主标题；新增索引检查改用768×600高度，强化scrollY>0、Event完整可见断言，仍保留规定768×1024截图。原18项不变，4项增强后重新通过；320最终图已复核无孤字。
6. 独立复审发现protection-check.log在生成时仍被追加写入，其manifest hash过早冻结。将该日志视为一次已结束的历史保护检查输出，随后直接运行record-phase-b.mjs，不再把stdout重定向到清单中的文件；重新生成清单并独立核对全部条目。provenance明确snapshotGitHead和未提交差异，附原型文件hash，不把生成前HEAD冒充最终实施提交。

## 回归与证据边界

原18项浏览器检查名称及断言不变，before/after均18/18，新增行为4/4。320×844、390×844、768×1024各五页；1280×900 Artist/Route/Place；49张before＋49张after，含18视口/18整页/13状态。PNG有每张实际尺寸/SHA256；IAB JPEG另存用于实看。SCREENSHOT_COMPARISON_INDEX.md与COMPARISON_GALLERY.html提供同名配对，派生comparison图只是并置原图、不替换原始证据。

after/browser-failure.json与first-failure JSON/log为保留的首轮历史失败，最终状态以browser-report.json和ux-behavior-report.json为准。并置图生成时fontconfig提示不可写系统缓存，不影响原始截图或PNG生成；没有更改系统权限。

pnpm check：typecheck、Vitest21/21、build、Node18/18通过；foundation typecheck、API编译、contract/domain9/9通过，完整输出在after/*.log。API/schema/fixture没有修改；本轮不运行migration/seed，不启动PostgreSQL，001真实PG历史结果不能冒充本轮UX验收。未实测真机中文键盘、真人任务成功率、真实资料长文、网络及地图Provider；不宣称完整WCAG审计。单城市变体/真实媒体lightbox仍是Phase A已披露未覆盖项。

verify.mjs仅调整证据输出目录（默认Phase B after，可环境覆盖）和报告scope说明，不改变测试名、断言或通过label；Phase A历史报告与截图原封保留。API/生产源/tests/资产94份及旧三工作区253hash/WIP需以最终provenance验证。阶段入口README和AGENTS追加最新授权，历史记录不回写为“已经做过B”。

Git基线为74a103ec5ee7f8eab3ce471eacca8711b2a6b82f，分支feature/start-slice-002-phase-b。不会merge至master或继续C。

## 最终独立复审与 Git 收尾

审查者`/root/review_phase_b_final`采用fresh context只读审查完整范围`74a103ec5ee7f8eab3ce471eacca8711b2a6b82f..b9afc1a9d0a959290b320881ab0cbd0811a9b056`，逐页查看五页390/768、320 Route/Place、1280 Artist/Route/Place、Home focused、Stop Preview和来源/核验状态。结论：“可提交Phase B验收”，六项全部满足，无未解决critical/important/minor；仅限本阶段，不代表Phase C批准。

独立审查读取日志而未代替实施者执行测试；实施者已实际运行完整回归。审查者另行核对132份最终证据和10份原型源码hash全部相符，94份受保护实现与253份旧工作区文件匹配，Phase A与Slice001指针保留，修复了日志hash过早冻结问题。审查拒绝判断真机、真人用户研究、真实资料长文、完整辅助技术/WCAG、生产API/DB/地图Provider、高保真和部署，和本记录边界一致。

| 提交 | 成果与验收依据 |
| --- | --- |
| d5bb671f5b71f9ca1830edac3f2a27f9248e1df1 | 六项灰阶修复、独立初审、原18及新4项回归、49组对比证据、参考记录 |
| b9afc1a9d0a959290b320881ab0cbd0811a9b056 | 独立复审后的320标题、真实索引滚动检查、日志与来源pin、证据完整性修复；此提交是最终被审查的实施源码 |
| 此文件所在收尾提交 | 只更新最终审查/提交归属与provenance；通过`git log -1 -- docs/start/slice002/phase-b/PHASE_B_REVIEW_FIX_RECORD.md`获得，不包含后续功能 |

最终provenance中的snapshotGitHead表示生成时Git状态，snapshotWorkingChanges记录尚未提交的证据/文档收尾，不等同于“已提交源码未审查”；sourceSnapshotFiles逐一记录实际源码hash。最终实施源码是上述b9afc1a，后续收尾不改原型、API/schema/fixture或测试。原三工作区44项WIP保持24+13+7，253hash及94保护文件通过；旧Phase A的49张截图hash不变。

前后配对入口：`evidence/slice002-phase-b/COMPARISON_GALLERY.html`和`SCREENSHOT_COMPARISON_INDEX.md`。所有已知偏差、历史失败和未覆盖范围已在本文记录。Phase B完成后停止，等待用户下一阶段指令。
