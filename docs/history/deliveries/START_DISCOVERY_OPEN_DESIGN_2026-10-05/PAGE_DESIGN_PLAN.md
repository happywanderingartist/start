# START Discovery · Open Design execution · 2026-10-05

范围：Slice 002 Phase C 的视觉设计与可点击演示。用户已确认首页及色卡，并授权继续其他页面、用 skills 优化、制作原型及操作 Open Design。不修改旧灰阶、业务源码、API、schema、fixtures；不实现 Journey、Community、Memory；不 merge/deploy。Figma Starter MCP 读取本轮仍返回额度限制，Open Design 原型不冒充正式 Figma 源文件。

## 设计顺序与页面规格

| 顺序 | 页面 | 核心任务与已验收结构 | 视觉表达 | 首屏与动作 |
|---|---|---|---|---|
| 1 | Route Detail | 判断偶像关联、阅读短故事、查看站点和走法 | 紧凑旅行专题；少量编号、手绘路线轨迹；无巨大 Hero | 标题约28px，Artist/City，why与短故事；START 主动作、SHARE 次动作、MAP 快捷；首站可见 |
| 2 | Artist Hub | 从 Artist 身份选择有足迹的城市，再读路线 | 城市册目录和章节；小幅错位纸片只在章首 | identity → sticky City Index → City Chapter → routes；optional event 折叠弱化 |
| 3 | Search Results | 扫描四类结果并选目标，返回保留查询与滚动 | 编辑目录；细线、编号、节奏和冰蓝小分区；避免卡墙 | Artist → Route → Place → Event；结果行不堆长why、核验、距离时长 |
| 4 | Place Detail | 理解WHY、找到地址与来源，再查看摄影参考 | 实用地点档案；小照片/角度记忆物件，参考缺失诚实表达 | WHY + SOURCE；ADDRESS显著且一次正常滚动内；高于 Photo Spot/Angle |

首页作为确认基准保留，图片见 assets/HOME_APPROVED.png。不要重新设计标志、色卡或问句；如原型无法保持原艺术字形，要明确差异而不是重新定稿。图中生成趴姿娃娃只作风格参考，不能冒充已锁定角色母版。

## 共享系统与动效

沿用 paper #FBF3E8、ink #702720、ice #CBE5FE、accent #C87950。重要中文与英文采用可用系统无衬线；功能正文14–16px、区标题18–20px、页标题28px左右。艺术字/手写只用于品牌和非必要边注。coffee/soft-orange小字对比不足，橘色承担装饰或大图形，不作低对比小字背景。

共享 SearchField、EntityIndexRow、CityIndex、ChapterHeader、Primary/Secondary/ShortcutAction、StopRow、StopPreview、SourcePanel、AddressBlock、ReferencePlaceholder、Loading/Empty/Error/Retry。输入即时响应；按压100–160ms；弹层150–250ms、transform/opacity、可打断；关闭回焦；Escape退出、键盘与IME保留。尊重 reduced-motion。不让全屏纸片、照片、Doll同时漂浮。

390×844先设计；320保证可读与44px目标；768用目录侧栏、章节列和路线/地图两列重新组织；1280限制阅读宽度，保留边注与内容关系，不能放大手机界面。

## 原型与验收

五页路径：Home → Search → Artist → Route → Stop Preview → Place。补 Home focus/typing，Search loading/empty/error/retry，Artist sticky city，Stop Preview，Map active，Place Source/Reference，START deferred。Event仅现有最小读目标。不做真实API、导航、传感器、行程与报名。

保留 baseline/app.js、fixture.json、verify.mjs、verify-phase-b.mjs 作为只读复制件；复用现有可靠逻辑和完整断言，不删除或弱化。四页390设计图、响应式、真实交互验证、两轮独立审查/修复、原文件SHA与Git状态分别记录。截图不能证明完整可访问性或Figma完成。若Open Design失败，记录具体失败与产物，不把运行按钮点击当完成。

## Reference Before Implementation

本轮已查看成熟项目关键实现：Vaul src/index.tsx 的 modal/autoFocus/scroll边界；shadcn-ui DialogTitle/DialogDescription组成；Organic Maps README/LICENSE 中地图引擎与数据许可分离。Vaul README明确 unmaintained，不新增此依赖；两次猜测的test路径读取失败，没有声称上游测试通过。shadcn优势是语义化组合与可读的组件边界，局限是它不是START视觉体系，需要自行测试中文IME、焦点与缺失状态。Organic Maps优势是成熟地图基础、数据与UI分层，局限是移动原生工程与数据许可不能直接移植Mobile Web，本轮只保留地图适配边界，不引入引擎。

来源：https://github.com/emilkowalski/vaul/blob/main/src/index.tsx ，https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/dialog.tsx ，https://github.com/organicmaps/organicmaps 。Vaul/shadcn MIT、Organic Maps代码Apache-2.0，地图数据另有许可。这里只学习Pattern，不复制源代码、图像、字体或标志。既有Open Design安装研究已固定53231d40b778d88eba23f35547bf99485d3ae9fc、Apache-2.0、99397stars、2026-10-04更新；数量不作质量证明。
