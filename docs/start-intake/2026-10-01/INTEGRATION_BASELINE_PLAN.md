# START 承接与 Git 基线计划

日期：2026-10-01。状态：待确认，未执行 Git 基线、备份、分支创建、迁移或合并。本轮仅新增三个计划文件；已批准的 CURRENT_STATE_REPORT 与 REFERENCE_NOTE_001 保留原文。本计划以本轮实时 Git 状态为准，测试结果引用上一轮同日审查日志，未重新运行功能测试。

## 1. 三条线的固定起点与必须保留的成果

外层 `D:/Downloads/fan-route-codex-handoff` 不是仓库。三个工作区共享同一 Git 对象库，未提交文件却各自独立；Git tag/bundle 不能代替工作区备份。

| 分支与工作区（相对外层目录） | 当前 HEAD | 必须保留 | 不直接进入 START 正式行为的内容 |
| --- | --- | --- | --- |
| master：`fan-route-codex-handoff/` | `1def607be517cb2e5bbf7c183125836a113ea5ce` | v0.1 React/TS/Vite/Router、打包和检查入口；routeSession 恢复/到达规则与回归测试；旧产品文档和原型验收记录 | 固定南京跳转、模拟导航、四项主导航、匿名收藏、旧玻璃视觉。保留历史，不解释为新 MVP 已完成 |
| feat/fan-route-v0.2：`.worktrees/fan-route-v0.2/` | `b9a4623292ca373869b9feb8343d6d36e0b1d36f` | Task 1–6 的地图合同、AMap 适配、校验/错误、缓存、路段局部重算、幂等/版本冲突用例、4 个 Worker API；source/candidates/selections/seed；QA 4–6 和交接记录；Task 7 未提交成果 | 默认 Map 内存持久化、`provider: amap` 侵入领域、本地单路线“published”集合、旧页面模型，不照搬为 canonical backend |
| feature/character-asset-baseline：`.worktrees/character-asset-baseline/` | `a8ece9707afca3a8106ec09b8d2a215dd30aa456` | R01/R02、18 张正式透明 PNG、manifest、Face/Hair/Body/Material/锚点规范、拒绝草稿与对照图、资产门禁及未提交验收加强 | 不重新生成母版，不把静态动作称为动画或前端已接线；不新增养成系统 |

上轮实测：master check 通过；v0.2 typecheck/build 与 Worker 60/60 通过，前端 47/52，5 项 App 测试失败；角色 check 通过，正式资产 18 张、资产测试 13/13。该状态是承接基线，不能给 v0.2 打“全绿”标签，也不为新架构重新做 Task 1–6。

## 2. 全部未提交改动清单

以下相对路径均基于表内对应工作区。`M` 是已跟踪修改，`??` 是未跟踪文件；有效成果不等于已批准的产品规格或已完成实现。写入本轮三个计划前，共 master 21 项、v0.2 13 项、角色 7 项；没有 staged 项或删除项。本轮三个新计划将使 master 增加 3 项。

### master：1 项修改、20 项未跟踪

| 路径 | 状态与性质 | 建议与保护边界 |
| --- | --- | --- |
| `docs/references/README.md` | M；51 行旧视觉确认记录 | 有效历史。保留原文，迁入历史参考目录时添加“被视觉包 v2 替代”索引；不在原文件直接改写新方向 |
| `character-assets/character-asset-spec.md` | ??；旧角色规范 | 有效历史但与角色分支默认服装不同。此版写女娃日常休闲/男娃灰卫衣；角色分支写 R01 红白舞台运动/R02 学院针织。两份都保护，正式承接使用已验收角色分支规范，不覆盖同名文件 |
| `character-assets/references/R01_girl_final_reference.png`、`R02_boy_final_reference.png` | ??；身份参考 | 与角色分支同路径 SHA-256 一致。正式版本从角色分支迁移，原文件不删除 |
| `character-assets/validation/drafts/boy_action_validation_v1_draft.png`、`boy_expression_validation_v1_draft.png`、`boy_identity_master_v1_draft.png`、`girl_action_validation_v1_draft.png`、`girl_expression_validation_v1_draft.png`、`girl_identity_master_v1_draft.png` | ??；6 张拒绝草稿 | 与角色分支对应文件哈希一致。保留为 rejected 历史，不进入运行时或发布清单 |
| `docs/references/start-home-light-visual-baseline.png`、`start-p3-route-detail-visual-baseline.png`、`start-p4-route-edit-visual-baseline.png`、`start-p5-route-in-progress-visual-baseline.png`、`start-p6-arrival-visual-baseline.png`、`start-p7-photo-checkin-visual-baseline.png`、`start-p8-route-complete-visual-baseline.png`、`start-p9-my-trails-visual-baseline.png` | ??；8 张旧页面视觉 | 有效历史方向，不作为新版设计源。只迁入历史目录与索引，不混入 v2 正式参考 |
| `docs/start-intake/2026-10-01/CURRENT_STATE_REPORT.md`、`REFERENCE_NOTE_001.md` | ??；本次已确认审查/研究 | 有效承接依据，未来纳入文档基线提交；不改写成新阶段已完成 |
| `docs/superpowers/plans/2026-09-28-character-asset-baseline.md` | ??；旧计划 | 与角色分支同路径哈希一致。保留历史执行依据，不重新运行母版制作任务 |

### feat/fan-route-v0.2：1 项修改、12 项未跟踪

| 路径 | 状态与性质 | 建议与保护边界 |
| --- | --- | --- |
| `src/App.test.tsx` | M；36 行新增、9 行删除；真实搜索/结果不自动跳转/空状态断言 | 有效未完成的行为要求。保护原稿；新版重写选择器和契约，不通过删除失败测试伪装完成。旧 mascot 顺序要求不约束新版 Figma |
| `src/api/mapClient.ts`、`src/api/mapClient.test.ts` | ??；地图 HTTP client、超时/错误测试 | 有效成果。地图调用切片再迁移；需改掉浏览器 window 耦合与成功响应裸类型断言。Slice 1A 不为使用它而上线地图写接口 |
| `src/data/routeRepository.ts`、`src/data/routeRepository.test.ts` | ??；单路线、全 token 子串查询 | 有效过渡接口与用例；提取不自动跳转、空搜索及 ID/path 行为，新实现用 PostgreSQL；硬编码 published 集合仅保留历史 |
| `docs/adr/001-modular-monolith-and-vertical-slices.md`、`002-separate-route-version-and-journey.md`、`003-map-provider-boundary.md` | ??；Proposed ADR | 模块化单体、版本/Journey 分离、地图适配思想可迁移；新 ADR 引用它们，不直接改为 Accepted |
| `docs/product/fan-route-v0.3-product-architecture.md`、`fan-route-v0.3-core-flow.md` | ??；旧 Proposed 产品结构 | 有效设计历史，与三导航/Community/投稿/海报范围冲突。只历史保留，不作为新规格 |
| `docs/research/open-source-adoption-matrix.md`、`docs/licenses/dependency-ledger.md` | ??；参考矩阵与许可证台账模板 | 保留研究输入；迁移时复核实际版本/文件许可，模板不能证明供应链已审查 |
| `docs/superpowers/plans/2026-09-28-fan-route-v0.3-planning-foundation.md` | ??；未完成旧计划 | 历史保留，不与本轮 1A/1B 混用验收状态 |

### feature/character-asset-baseline：6 项修改、1 项未跟踪

| 路径 | 状态与具体变化 | 建议与保护边界 |
| --- | --- | --- |
| `README.md` | M；新增角色库、范围和命令说明 | 有效验收文档，迁移相关段落，不覆盖 START README |
| `character-assets/character-assets.json` | M；增加 `phaseOneComplete: true` | 有效发布集合声明，必须与 coverage 校验共同承接 |
| `package.json` | M；check 前置 test:assets | 有效门禁接线，向新工作区合并脚本语义，不整文件覆盖 |
| `scripts/validate-character-assets.mjs` | M；新增准确 18 状态的缺失/多余校验 | 有效工程成果，迁移时保留函数与校验调用 |
| `tests/character-assets.test.mjs` | M；新增 coverage 缺失/完整/额外状态测试 | 有效测试，与 validator 同批迁移 |
| `tests/sites-worker.test.mjs` | M；更新完整 check 命令断言 | 有效但耦合旧命令字符串；新脚本变化时审查门禁覆盖，不原样覆盖其它分支的 Worker 测试 |
| `character-assets/qa/phase-one-acceptance.md` | ??；18 文件及验收/范围说明 | 有效验收记录。保留原始日期和证据语境；其中浏览器记录是旧原型验收，不证明娃娃已接入 START |

### Git status 之外的临时文件与保护对象

不能用“ignored”推断“可删除”。已核对忽略规则和现存目录，以下按用途分类；本轮不清理任何一类，也不声称逐文件审查了 node_modules 的全部内容。

| 目录/文件组 | 分类 | 处理 |
| --- | --- | --- |
| 各工作区 `node_modules/`、`dist/`，外层 `.pnpm-store/`，存在时的 `.vite/coverage/.wrangler` | 可再生依赖/构建缓存 | 不迁入产品提交；未来空间清理另行决定。本轮不删除 |
| v0.2 `.superpowers/sdd/2026-09-15-fan-route-v0.2-real-map-mvp/` | 被忽略的 Task brief/report/review/progress | 必须备份的审查证据，不能视为普通缓存 |
| 角色 `.superpowers/sdd/2026-09-28-character-asset-baseline/` | 候选、处理实验、对照图、工具输出与依赖混合 | 图像/来源/验收记录需备份；其中嵌套 node_modules 是缓存。存在 Windows 深路径问题，备份必须读回校验，不能忽略复制失败 |
| 外层 `handoff-review-2026-10-01/*-check.log`、`v02-*.log` | 本轮临时审查输出但具有验收价值 | 保留日志，正式文档引用；未必要全部纳入 Git |
| 外层完整 `handoff-review-2026-10-01/START_CODEX_MASTER_HANDOFF_v1/`、原始 `D:/START_CODEX_MASTER_HANDOFF_v1.zip` | 正式交接来源/审查副本 | 不改写、不删除，保存 ZIP 哈希与阅读记录；视觉材料只作授权范围内参考 |
| 外层 `.context/source-20260915/`、`fan-route-codex-source-20260915.zip`、三个 `2026-09-15-*.md`、`audit-2026-09-28/`、`design-references/` | 旧交接、代码快照、截图/素材来源 | 历史证据，保留目录；以后仅新增索引，不把旧图当新 source of truth |
| `.git`、worktree `.git` 指针、本地环境/凭据配置（如存在） | 暂时不能动 | 不重写 Git 元数据、不搬工作区；不输出秘密内容，不将环境秘密加入 bundle/公开提交。只记录配置位置与专门恢复办法 |

## 3. 继续开发位置与方案取舍

推荐批准后建立独立工作区 `D:/Downloads/fan-route-codex-handoff/.worktrees/start-slice-001`，建议分支名 `feature/start-slice-001`，从上述完整 master SHA 起步。两者目前只是建议名，本轮未创建；执行前检查同名路径/分支是否已存在，存在则核查并复用或重新提议，不能覆盖。该工作区是 START 新架构集成线，三个旧工作区继续作为可运行基线和成果来源。

| 起点 | 优点 | 成本/结论 |
| --- | --- | --- |
| 固定 master + 按职责迁移（推荐） | 干净、可运行基础；能够独立保护全部 WIP；不被旧 Map 存储或角色 package 改动绑定 | 要保留迁移来源映射，但只动当前切片相关内容，避免重复实现已验证算法 |
| 固定 v0.2 HEAD | 地图代码已在树内 | 当前读切片不需要大部分地图 API，旧领域与新 canonical 耦合更重，且 WIP 尚未接线；不推荐作为默认基线 |
| 三分支整体 merge | 表面上成果集中 | 将旧 IA、演示、配置与重复素材一起带入，不能证明新产品正确；本轮及未经确认的后续均不采用 |

新工作区先保留根 `src/` 为 Web，增加 API/合同/DB 目录即可，不先全仓移动为 monorepo。Slice 1A 不改三处现有 src，不上线继承的模拟首页；Slice 1B 按 Figma 替换新工作区正式入口，旧原型留在原分支。

## 4. 逐项承接方式

| 成果 | 方式 | 具体边界与批次 |
| --- | --- | --- |
| master 框架、build/check、恢复规则测试 | 保留 | 作为新分支祖先已拥有；恢复规则属于后续 Journey，当前不接执行界面 |
| v0.2 地图适配/缓存/计算与 60 项 Worker 用例 | 迁移、必要边界重构 | Task 1A 只归档来源映射和种子；真实地图切片再迁入 `providers/map` 与计算服务，不重新实现算法，不引入进程内 Map 当生产数据库 |
| `bfebba2` 种子及 source/candidates/selections、QA4–6 | 文件迁移 | 1A 复制原始材料到历史种子来源目录，映射 canonical IDs、坐标系、时间/空值；路线保持未发布，事实证据补齐才允许发布 |
| Task 7 client/repository/App tests WIP | 迁移用例、重构实现 | 1A 用新 shared DTO/PG SearchProvider；1B 用浏览器 API client/状态机。保留旧源码快照和 provenance，不照搬单路线数组/错误选择器 |
| 角色 18 正式资产、参考、manifest、门禁、验收 WIP | 原文件迁移、脚本定向整合 | 独立资产保护批次；二进制迁入前后 SHA-256 一致；不重绘。1A 不增加娃娃运行时，1B 仅在批准设计需要时引用现有资产 |
| `96346a3 → 4f7d7c7 → 65191f2 → a8ece97` | cherry-pick 候选，默认不执行 | 只有完整审阅四提交及依赖后可整链 pick；首提交含 package/lock/旧计划，不能单 pick 最后动作提交。当前更推荐文件迁移，避免把旧配置一并套入 |
| `fbf9b2c`、`d850e92`、`98919df`、`ea5f619` | 不单独 cherry-pick | 分别依赖模型硬化、适配修复和旧 Worker/存储；选择文件与配套测试承接，维护来源 SHA，不把审查文档提交误认为功能提交 |
| 旧粉紫截图、旧 v0.3 Proposed 文档、模拟导航与收藏 | 历史保留 | 原分支原样保留；新工作区历史索引注明替代关系，不在 UI 或验收中继续使用旧权威 |

所有迁移提交写明“来源分支 + SHA/未提交文件哈希 + 目标路径 + 有意差异 + 验证”。迁移有效源码不能变成未经审阅的拼接；角色代码及地图服务各有自己的测试边界。暂不迁入与 1A 无关的功能，不意味着删除或放弃成果。

## 5. 批准后才执行的可回退基线

以下是操作顺序，不是本轮执行记录。禁止 `reset/clean`、强推、删除旧分支、在旧工作区 checkout 覆盖文件或整体 merge；不以 stash 作为唯一备份，也不使用 `git add .` 收入所有临时材料。

1. 重新读取三处 HEAD、staged/unstaged/untracked 清单和 worktree 列表；与本计划比对，新增工作先列入保护清单。备份期间保证文件无人写入，否则读回哈希不一致就重新快照，不开始迁移。
2. 在外层创建带执行时间的 `integration-backups/<timestamp>/`：每工作区保存 status、完整 HEAD、二进制 unstaged/staged patch，全部未跟踪文件的原路径副本与 SHA-256 清单。对上述 ignored 审查材料、外层旧交接与素材另存白名单快照。复制采用文件原字节，避免 PowerShell 文本输出重编码 patch；日志、深路径复制结果逐项读回。依赖/构建缓存可不复制，但写明重建办法；不把未检查的 ignored 树全加进 Git。
3. 固定三个历史 HEAD 的只增不改 refs，例如 `baseline/start-intake-20261001/master`、`.../map-v02`、`.../character`；同名 ref 存在且指向不同 SHA 则停止，不 force。创建包含三个 refs/分支的本地 Git bundle，并 `git bundle verify`；另在独立目录验证可恢复三个 HEAD。bundle 与 patch/文件快照共同组成基线，不能只验 bundle 就称 WIP 已保护。
4. 文档与有效 WIP 如需成为可 cherry-pick 提交，在新建的 recovery 工作区/分支按白名单应用备份后提交，保留原工作区 dirty 状态。角色验收加强作为一批，搜索半成品作为另一批，旧文档与视觉作为历史批次；提交说明明确“快照未完成”，不因快照而补写验收成功。
5. 建立上节推荐 START 工作区；先提交已确认的接管报告/研究及本轮三个计划和 provenance 索引，形成文档基线。只新增本轮所需 ADR/合同/迁移，不清理原工作区。
6. 每批承接先验证文件哈希/目标 diff，再执行对应测试，单独提交并记录 SHA。1A、1B 各形成通过验收的里程碑 tag；未通过不打“accepted”标记。全部保留旧 refs 和备份。

回退分三层：尚未提交的迁入失败只在新 START 工作区隔离并另存失败差异，旧工作区完全不受影响；已提交变更用新分支从基线重建或 `git revert` 对应批次，不 reset；未来数据库升级采用先扩展后收敛及 forward-fix，测试 DB 可重新创建专用空库，真实环境先备份并验证恢复，不能拿旧代码 tag 当数据库回退方案。1A 期间不部署真实生产数据，因此不对现有数据库执行破坏性回滚。

基线验收证据必须包括：三个原工作区 HEAD/状态未被改变；41 项既有未提交文件及本轮3个计划均能从备份读回；ignored 证据白名单无复制错误；角色二进制相同；Git bundle 恢复验证；新工作区迁移映射；按原状态记录旧分支检查结果。当前只完成清单与方案，没有完成这些备份验收。

## 6. 批准边界

确认本计划后，才进入保护基线与 Slice 1A 的执行；不自动授权 Slice 1B 页面编码、Figma 高保真定稿、合并到 master 或生产部署。具体任务与验收见同目录 SLICE_001_IMPLEMENTATION_PLAN，正式视觉准备见 FIGMA_PLAN_SLICE_001。正式实施前按已批准 REFERENCE_NOTE_001 固定参考版本并复核许可证；不 fork 或拼接参考项目代码。
