# START · 当前开发版本

围绕艺人兴趣的城市打卡、路线、社群、物料集市与私人旅行记忆产品。主导航 Start / Community / Me，第一阶段 Mobile Web，后续微信小程序。仓库为私有；当前是本地开发平台，尚未接真实微信身份和云环境。

## 当前入口

- **现役前后端**：[deliveries/START_LOCAL_PLATFORM_2026-10-08](deliveries/START_LOCAL_PLATFORM_2026-10-08)。最新地点/路线投稿、社群、物料评论、私人 Book/分享在这里，不是旧根目录 React 原型。
- **详细交接**：[先读产品与状态](docs/current/01_PRODUCT.md)、[进度](docs/current/02_STATUS.md)、[技术架构](docs/current/03_ARCHITECTURE.md)、[下一步计划](docs/current/08_ROADMAP.md)、[困难](docs/current/09_BLOCKERS.md)、[运行说明](docs/current/10_RUNBOOK.md)。
- **Gemini阅读文件**：[图文PDF](docs/gemini/START_GEMINI_HANDOFF_2026-10-17.pdf)、[纯文字交接](docs/gemini/START_GEMINI_HANDOFF_2026-10-17.txt)、[核心源码合集](docs/gemini/START_GEMINI_SOURCE_CORE_2026-10-17.txt)。
- **设计基准与可浏览原型**：[START_FINAL_LAYOUT_REVIEW_2026-10-06](deliveries/START_FINAL_LAYOUT_REVIEW_2026-10-06)，API接线前的视觉稿与演示不能混为一套正式数据。
- **全部交付与原始素材**：见本仓库[开发归档发布附件](https://github.com/happywanderingartist/start/releases/tag/start-handoff-2026-10-17)。主分支只保留当前运行所需素材与文档，避免原始图片/历史重复稿超过 Gemini 导入限制。

## 2026-10-17 状态

最新本地验收12组中11组通过；55项平台测试与Book20检查通过。local-smoke在高德配置转发处返回503，仍待排查；真实微信、云连接、GPS/手机导航和真机验收尚未完成。源码入库不代表本次修复这些问题，也不是部署上线。

已接通：公开艺人/城市/地点/路线/演出查询，地点与路线投稿（含地图候选/拖动排序）、社群加入退出、物料编辑/上下架/申请/公开评论、私人打卡/Book/选择分享/撤销。未收尾：照片封面票根、整批视觉与独立审查，完整 Me/娃娃、个性化推荐、通知收藏与后台管理 UI。

## 代码与数据结构

```text
deliveries/START_LOCAL_PLATFORM_2026-10-08/   当前 Node.js + PostgreSQL + 原生浏览器界面
deliveries/START_ACCOUNT_FOUNDATION_2026-10-05/  账号schema与身份仓储
deliveries/START_ADMIN_CONTENT_VISUAL_2026-10-07/ 后台/文字候选/地图选点适配
deliveries/START_AMAP_INTEGRATION_2026-10-07/    固定上游高德代理
deliveries/START_FINAL_LAYOUT_REVIEW_2026-10-06/ 批准方向的原型与当前所需素材
deliveries/START_ROUTE_INTAKE_2026-10-07/        用户路线参考与需求记录
.worktrees/fan-route-v0.2/worker/map/            保留原相对导入的地图兼容模块
docs/current/                                  当日产品/进度/架构/计划/验收/困难
docs/history/                                  历史交付根文档与产品规范
docs/data/                                     公开示例、schema合同、数据资产索引
docs/gemini/                                   可直接阅读的PDF/TXT
```

`.worktrees`在此仅为少量兼容路径，不是嵌套Git仓库。当前实现仍复用这些原相对路径，后续可在有测试的重构中正式消除耦合。源码与旧工程的迁移尚未做全面重构，不应将本次同步说成“重写架构”。

## 本地恢复

Node24系列环境；根依赖pg8.16.3、zod4.1.12、pngjs7.0.0。先按[运行说明](docs/current/10_RUNBOOK.md)安装依赖与恢复隔离PG集群，再运行：

```text
npm install
npm start
npm run test:platform
npm run test:book
npm run test:acceptance
```

`npm start`需要已有本地PostgreSQL18系列运行库、验收集群及正确目录配置，不会自动安装数据库。Playwright测试还使用原机绝对路径；迁机需配置浏览器和依赖。`node_modules`、PG原始数据、私人媒体、模型、密钥均未上传，不能声称clone后无需配置即可正式运行。

## 历史与接手规则

更新前 main 保存在 `archive/pre-platform-import-2026-10-17`；原有 feature/backup 分支保留。旧React/TypeScript工程在这些分支及提交历史中；本次不force push、不改变仓库私有属性。原本地旧工程的未提交改动不受此独立导入影响。

后续先读相关成熟skill、研究开源参考、形成文档；新视觉按批确认再实现。一个艺人一个社群，物料属于Community，联系方式在评论自换，不追踪交换完成；Book默认私密、单账号单娃娃、配饰暂缓。不要恢复已经被最新用户决定覆盖的旧流程。

导入Gemini时用本仓库main；它读取的是导入时快照，推送新版本后需重新导入。开发归档发布附件含较大原始素材，通常无需整包塞进Gemini。交接文档中“source/workspace”描述完整版归档的布局，本仓库的实际入口以上述目录为准。
