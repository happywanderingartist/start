# START 稳定性复核 · 2026-10-14

Mode: PR Review。范围为最新独立交付 START_LOCAL_PLATFORM_2026-10-08；抽查高风险入口、私有数据映射、HTTP/数据库边界，并运行完整已有验收。该目录不是 Git 仓库，保留原有交付和主工作树，不声称已合并。

## 实现前参考

- GitHub 搜索：node-postgres integration tests / Playwright webserver retries。CLI 未登录，改读公开仓库、测试说明和提交页。
- [brianc/node-postgres](https://github.com/brianc/node-postgres)：Brian Carlson 与社区维护，MIT，页面约 13.2k stars；[提交页](https://github.com/brianc/node-postgres/commits/master/)缓存显示 2026-09-02 提交。参考 pg-pool README 和测试说明：优势是独立数据库、顺序测试与连接释放；局限是驱动测试不覆盖业务权限、浏览器模块加载。保留现有 pg，不复制上游代码。
- [microsoft/playwright](https://github.com/microsoft/playwright)：Microsoft 维护，Apache-2.0，页面约 97.7k stars；提交页缓存显示 2026-09-11 提交。查看仓库、提交页和 test-retries 文档。优势是实际浏览器验证资源加载、交互和响应式；局限是重试可能隐藏偶发失败，浏览器模拟不能代替真机。本次保留首次失败证据，不通过增加重试掩盖错误。搜索引擎页面存在缓存，不将页面时间宣称为实时最新提交。

## 核验顺序

1. 重现原失败，区分沙箱限制、服务未启动与业务故障。
2. 检查模块路由和私有视图契约，先补可失败的回归测试，再做最小修复。
3. 完整执行平台、后台浏览器、公开前台、备份恢复、原型、已有集成及服务预览检查。
4. 记录真实通过范围和未完成工作；云、微信真实身份、GPS/真机不纳入本次本地通过结论。

## 初始证据

- 沙箱内连接 55435 返回 EACCES；沙箱外返回 ECONNREFUSED。启动既有 boot.mjs 后 pg_isready 显示 accepting connections，说明之前不能据此认定数据库损坏。
- 第一轮完整验收：platform、browser 通过，public-browser 失败。
- P1：public.js 引用不存在的根路径 /private-views.mjs，导致模块图加载失败；原字符串契约测试通过仍无法发现。修复目标：相对导入，并测试模块实际能被静态服务提供。
- P2：Me 的已确认视觉原型入口丢失；原 live-preview 验收仍要求它可达。修复目标：恢复入口，保留已有私人工作台。
- P2：memberships API 只返回 community_id/status/artist_id，视图却读取 name，导致所有已加入社群显示为“社群”。实际修复：前台通过公共社群目录解析名称，保留 API 契约；浏览器以真实 API 字段形状测试。

## 修复及验证

1. 模块加载：改为相对导入 `./private-views.mjs`。新模块图测试修复前明确报 Missing browser module，修复后通过；公开浏览器验收恢复。
2. Windows 冷启动：原 pg_ctl 同步管道调用在数据库 ready 后仍未返回。使用不继承管道的 stdio ignore、显式启动等待和超时；冷启动日志显示恢复完成后前台自动监听 4330。未重建或删除数据库。
3. Me：恢复“查看已确认的 Me 视觉原型”，娃娃路径指向 `#/me/doll`，去掉已取消配饰功能的入口文案。Me → Card → 返回 → Start 的四项实际浏览器检查通过。
4. 已加入社群：从 catalog 按 community_id 解析名称。API 字段与显示映射在私人页面浏览器测试中验证。
5. 重复提交：异步提交期间设置 in-flight 标记并禁用按钮，在 finally 恢复；两个同步 requestSubmit 只发出一个请求。此保护覆盖当前进行中的请求，不声称解决跨设备或响应丢失后重试的重复问题。
6. 输入丢失：visibilitychange/pageshow 自动刷新现在保留投稿表单。浏览器回归先复现“测试咖啡变为空字符串”，修复后保留输入，失败提交也保留内容并恢复按钮。
7. 验收证据：加入模块图和私有浏览器测试；执行器在某组失败后继续检查其他组，仍返回失败退出码；每轮更新 READINESS.json，local-smoke 即使失败也更新结果，避免读取旧的全绿证据。

## 结果与限制

最新机器记录见 `evidence/ACCEPTANCE_RUN.json`、`evidence/READINESS.json`，日志为 `evidence/acceptance-*.log`。本轮最终回归：九组中八组通过，local-smoke 因 Open Design 旧预览端口 53625 拒绝连接失败；只读进程检查未发现 Open Design 正在运行。未把不可用外部应用标记通过。

- 平台 Node 测试 46 项通过，包含权限隔离、审批、事务、物料、分享撤销、注销、单娃身份与模块加载。
- 后台浏览器 40 项、公开前台浏览器 65 项、私人页面浏览器 24 项、Me 预览往返 4 项通过；私人测试使用模拟 HTTP 身份数据，仅验证视图与交互，不代替真实微信登录。
- 私人页 320/375/390/414/768/834 六种宽度无横向溢出。旧原型画幅与导航回归通过。
- PostgreSQL 25 表及 1 个媒体文件备份恢复校验通过；既有地图代理、文字识别和导入测试通过。
- 启动现有 4325 地图代理后，JS 配置与真实上海 POI 搜索通过；没有输出密钥。Open Design 检查失败发生在此后，不能据此否定已通过的地图步骤。

尚未完成：Open Design 运行态预览复验；本地文字识别状态接口返回 ready=false，模型实际推理尚不可用；真实微信登录、GPS、真机验证和云部署；公开投稿表单的地图/文字识别按钮仍为占位提示，路线仍要求地点 ID，属于功能缺口；本次未将其伪称已实现。主工程合并也未执行。

复验指令（在本交付目录）：`node boot.mjs`，随后另一终端 `node acceptance.mjs`。全套需既有高德代理和 Open Design 指定预览可访问。仅代码/前台回归：`node --test tests/module-loading.test.mjs tests/private-ui-contract.test.mjs`；私人视图：`node tests/private-browser-acceptance.mjs`。
