# Slice 002 · Phase A 验收记录

2026-10-03。本轮五页可复现灰阶 Wireframe 已完成并自查，停止在 Phase A。没有执行独立 UX Phase B、视觉 Phase C、真实 API 集成 Phase D，没有正式 Figma、高保真、Journey、merge 或 deploy。此原型不是完整 START 产品或长期 UI source of truth。

交接包 00→01…09、context 四文档完整读取，含嵌套素材的 37 张视觉参考已查看。最新包优先于 V2 Discovery 合同、roadmap/001验收及历史视觉：Search 不加证据/核验/距离/站数；Route 不强制 Hero/首屏长故事；Artist 使用城市索引和章节；Place 地址直接可见。阅读及来源证据见 source/ 原文和 evidence/slice002/provenance.json。

## 实际完成与验证

Start Home（焦点、中文组合输入、建议、Artist/Route/Place 快捷入口、三个主导航）；Search（Artist→Route→Place→Event、精确艺人不自动跳转、未知空结果、loading/error/retry、查询深链接与返回滚动恢复）；Artist（多城市水平索引、sticky、点击/滚动同步、空章节、optional Event）；Route（立即可见的 START、站点、Stop Preview、SOURCE→VERIFICATION、PLACE、MAP 跳转与关联高亮、明确003延期、分享本机链接）；Place（WHY、HERE、Photo Spot/Angle 空值、正文地址及动作、缺媒体结构、related）。串联 Home→Search→Artist→Route→Stop Preview→Place 已在浏览器完整走通。

数据来自既有001合成 fixture 与额外私有布局压力数据，使用原有严格 DTO 校验（Search/ArtistHub/2 Route/6 Place/Event）。南京结果使用独立南京详情，未知查询/ID不会进入固定路线。没有新后端、migration/seed 或正式 SearchProvider。地图仅站点关系示意，不执行导航；未核验关联与不可用来源没有被伪装为已证实事实。

| 本轮执行 | 结果与证据 |
| --- | --- |
| Chromium 自动化行为/响应式检查 | 18/18；evidence/slice002/browser-report.json、browser-final.log |
| 规定响应式 | 320×844、390×844、768×1024 各五页；1280×900 Artist/Route/Place；无页面横溢出，受检操作≥44×44 |
| 截图 | 49张：18视口+18整页+13关键状态；尺寸及SHA256逐张记录；SCREENSHOT_INDEX.md |
| 目视自查 | 五页390整页；320 Home/Route；768 Artist；1280 Route/Place及关键Sheet已查看，其他尺寸以图像及布局断言复核 |
| 既有工程 pnpm check | 修复恢复副本扫描后成功：typecheck、Vitest21/21、build、Node Worker/资产18/18；legacy-check-fixed.log |
| Slice001 静态/契约回归 | foundation typecheck、API编译、contract/domain 9/9通过；foundation-check.log |
| 真实 PostgreSQL | 本轮未重跑、不启动DB；001最终53/53是真实PG历史验收，不能当作本轮UI验收 |
| 原工作区保护 | 三旧HEAD/status和253文件hash不变，44项WIP保留；001 branch固定bb0c092；94份工程/资产保护文件不变；provenance.json |

## 失败、定位、修复、回归

| 发现 | 根因 / 处理 | 记录 |
| --- | --- | --- |
| 最初 Home 输入断言失败0≠1 | 空入口没有交互；实现语义输入后通过 | 初始RED已在执行输出观察，后续18检查保留同一断言；未伪称初始完整RED覆盖全部功能 |
| fixture DTO 拒绝额外字段 | Event详情的claims/sources/requestId不能当Search摘要；显式摘要投影，不改strict schema | builder成功输出及现有契约回归 |
| 返回滚动位置失败 | 异步结果渲染前恢复导致高度夹限；加载完成后再恢复。另以坐标诊断确认自动化locator click会先按scroll-padding滚动；改为在可见结果行实际鼠标点击，原≤2px恢复断言保留 | failure-01-scroll-restoration.json；真实坐标90→90复验 |
| 城市同步错误 | IntersectionObserver只收到变化条目，非完整当前章；末章还受文档最大滚动限制。改用章节位置和唯一滚动同步入口，保留尾部定位空间 | failure-02-city-sync.json；最终同一断言通过 |
| MAP锚点未到期望位置 | 文档结尾没有足够滚动空间；移动端保留明确的锚点尾部空间，无假的路线metrics | failure-03-map-anchor.json；最终原<100px断言通过 |
| Home快捷入口未直达详情 | 原先三个建议都去Search，与04最低shortcut不符；Artist/Route/Place改为直接链接，输入建议仍Search | failure-04-home-shortcut.json、browser-shortcut-red.log |
| 旧pnpm check误扫恢复副本 | .context/raw-checkout-final中的Node-test文件进入Vitest。仅当前分支vite配置排除生成证据目录，不删副本、不改真实测试/断言 | legacy-check-initial.log及修复后完整门禁 |

browser-failure.json、browser-report-before-viewport.json是保留的历史记录；本轮最终状态以 browser-report.json 和 browser-final.log 为准。没有用删除测试、降低原失败断言或改状态label获得通过。当前阶段只有实施者自查和回归，不将其描述为已完成独立UX审查。

## 按08逐项自查

下表“通过”仅指灰阶结构或行为，不表示正式视觉/真实内容/产品集成验收；“待C/待D”是阶段边界。

| 项目 | 结果 | 证据 / 边界 |
| --- | --- | --- |
| A1 Home焦点Start with | 通过 | 390-home / home-focused |
| A2 无feed/banner墙 | 通过 | 三稀疏建议，非信息流 |
| A3 Search四实体 | 通过 | 390-search / existing DTO |
| A4 Exact Artist不自动跳 | 通过 | search-exact-artist +浏览器检查 |
| A5 Artist先城市再路线 | 通过 | 390/768/1280-artist |
| A6 Route立即露Stops/Start | 通过 | 320/390-route +可见坐标检查 |
| A7 Map正常滚动/MAP到达 | 通过 | map锚点、marker检查 |
| A8 Place解释关联/位置/行动 | 结构通过 | 390-place；真实Photo Spot/Angle暂无数据 |
| A9 地址不藏二级More | 通过 | 正文ADDRESS，390-address只是后续动作 |
| B1 每页单主任务 | 自查通过 | 输入/选择/城市章/站点/实用信息 |
| B2 重要信息不为美观隐藏 | 通过 | Stops首屏、地址正文 |
| B3 Search是选择行 | 通过 | 无核验、evidence、距离时长等 |
| B4 不重复长关联故事 | 通过 | 列表只摘要；Route不加长首屏故事 |
| B5 Preview轻解释 | 通过 | 390-route-stop-preview |
| B6 完整信息Place/source层 | 通过 | 390-source / verification |
| C1 390对齐稳定 | 通过 | 24px边距、342内容；截图与溢出检查 |
| C2 留白有意图 | 自查通过 | 大章间隔与锚点尾部空间；见偏差 |
| C3 节间距大于组内 | 通过 | 章节64、section48；内部6/12/16 |
| C4 无任意卡片包装 | 通过 | 行/章为主，HERE仅两个实用对象 |
| C5 长名层级不破坏 | 通过 | 320-route两行地名、Preview长标题 |
| D1 Apple式清晰非泛化 | 灰阶结构通过/待C | 尚无正式色彩、字体与视觉评审 |
| D2 青年追星身份克制 | 灰阶表达意图/待C | booklet/trace；没有装饰高保真 |
| D3 原创编辑感 | 灰阶结构自查/待C | 未复制图片、人脸、品牌、布局 |
| D4 每页≤1主要表达 | 通过 | Home prompt、Artist booklet、Route trace |
| D5 无贴纸涂鸦过载 | 通过 | 无装饰素材 |
| D6 无彩虹系统UI | 通过 | 白灰黑 |
| D7 非全圆角卡片 | 通过 | 仅输入/建议/Sheet等有必要圆角 |
| E1 focus/typing/loading/empty/error | 通过 | 截图与IME/状态检查 |
| E2 城市点击和滚动同步 | 通过 | 同步检查、empty chapter截图 |
| E3 Preview自然开关 | 通过 | native dialog、关闭/Escape、焦点回原触发器 |
| E4 Stop↔Map关系 | 通过 | 编号/文本/active状态；非真实地图 |
| E5 reduced-motion可用 | 通过 | reduce主要回归，normal模式也验证城市点击 |
| E6 ≥44px触达 | 通过 | 18种页面尺寸组合 DOM检查 |
| F1 320压力 | 通过 | 五页视口+整页，长标题不溢出 |
| F2 390干净 | 自查通过 | 五页视口+整页 |
| F3 768非拉伸手机 | 通过 | index/chapter、Route/Place拆分 |
| F4 1280非dashboard/card墙 | 通过 | 1040内容宽度，平面章节 |
| F5 Route桌面关系 | 通过 | 左Stops右sticky map、1280断言 |
| F6 Artist/Place编辑拆分 | 通过 | 1280-artist/place |
| G1 Home非通用搜索App | 灰阶意图通过/待C | 稀疏悬浮入口+Doll比例占位，未定最终视觉 |
| G2 Artist booklet/index | 通过 | 索引/编号城市章节 |
| G3 Route pilgrimage trace | 通过 | 序号站点/示意轨迹，未宣称真实路线 |
| G4 Place实用对象有意图 | 结构通过 | HERE/ADDRESS直接可找；实用事实待录入 |
| G5 五页同一产品 | 灰阶自查通过/待C | 统一行、CTA、间距、Sheet；正式品牌待视觉阶段 |
| H1 复用001API而非重建 | PhaseA契约复用/待D | 原schema/API不改；用原DTO校验私有fixture，不声称已连真实API |
| H2 不伪称003 Journey | 通过 | 390-start-deferred |
| H3 不提前Event Hub | 通过 | 390-event-read最小目标 |
| H4 不merge/deploy | 通过 | 独立分支与Git记录 |

## 偏差、已知限制和后续边界

1. 没有创建Figma文件。按07 PhaseA制作可复现本地灰阶原型；正式Figma source of truth仍待批准的后续阶段，不用HTML原型替代正式设计源文件。系统字体、静态建议和Doll矩形是结构占位，非新视觉方向/角色资产。
2. 390建议气泡按44px最小点击范围覆盖03中42px视觉高度；城市索引44px最小宽度；低频Doll不运行。Route/Artist末尾保留用于锚点对齐的滚动空间，整页截图中的尾部留白并非缺失内容。多城市空章是压力数据，不是新增City产品页/真实艺人足迹。
3. API暂未提供结构化Photo Spot、Angle、年份、Reference集合；本轮独立presentation空值展示，不改schema。媒体缺失场景已覆盖，有真实授权媒体的Reference lightbox和单城市变体尚未制作；它们不在08的PhaseA最低路径中，后续设计/集成需补验，不声称全06状态矩阵完成。
4. Search本地词表只用于原型。真正组合意图/排序/分页/搜索公平性已由001负责，本轮没有第二个生产SearchProvider。正式API鉴权边界、真实内容、地图Provider、移动系统软键盘/真机触达与网络性能均待产品集成；浏览器模拟IME不等于真实手机中文输入法验收。
5. 上传ZIP临时路径在读取/完整解压后过期。完整解压包与素材仍留在外层slice002-intake-2026-10-03，14份原文纳入本分支，按包自带size manifest校验并逐文件SHA256记录；原压缩容器没有及时另存，故不声称有原ZIP hash或byte-exact压缩包备份。旧Slice000的完整bundle/hash/恢复记录保持不变。
6. 仅做实施者自查，没有执行PhaseB独立UX审查、C正式视觉或D真实API接入。没有真正阻塞PhaseA的未决产品问题；以上是验收范围/已知数据兼容项，不重问文档已锁定决策。

复现和交互操作见 prototypes/discovery-wireframe/README.md；成熟项目阅读与许可证见 REFERENCE_NOTE_002.md/reference-pins.json；所有截图见 evidence/slice002/SCREENSHOT_INDEX.md。Git提交与最终状态见 COMPLETION_RECORD.md。
