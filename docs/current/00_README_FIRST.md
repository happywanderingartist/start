> 本文来自当日交接包。GitHub现役路径与归档分工以仓库根README为准；文中source/workspace对应完整版附件。

# START 项目交接包 · 2026-10-17

本包用于让新 agent 理解并继续当前项目。它包含现役代码快照、历史工程参考、产品规则、技术与数据文档、测试证据、视觉资产和困难清单。它不是已上线产品，也不是包含运行库及私人数据的整机备份。

## 先读结论

START 是围绕艺人兴趣的城市打卡与旅行产品，第一阶段为 Mobile Web，后续考虑微信小程序。主导航固定为 Start / Community / Me。已经建立本地 Node.js + PostgreSQL 平台，接通公开发现、地点/路线投稿、社群成员、物料集市和私人 Book 的一批界面；真实微信登录、云端部署、真机定位导航、完整 Me/娃娃/推荐接线仍未完成。

现役实现位于原机 `D:/Downloads/fan-route-codex-handoff/deliveries/START_LOCAL_PLATFORM_2026-10-08`。本包对应快照位于 `source/workspace/deliveries/START_LOCAL_PLATFORM_2026-10-08`。不要误把 `.worktrees/start-slice-001` 或 10 月 6 日视觉原型当成已合并最新 Book 的主工程。

2026-10-17 已重新运行整套验收：12 组中 11 组通过，local-smoke 失败于高德配置转发返回 503。本地平台测试 55/55 通过；Book 浏览器 20 检查通过，使用隔离真实数据库和测试身份。不能据此称真实微信用户已可使用。详见 [验收报告](07_VERIFICATION.md)。

## 阅读顺序

1. [产品规则与架构](01_PRODUCT.md)：产品目标、页面归属、用户已确定规则。
2. [当前成果与进度](02_STATUS.md)：界面、后端、测试与真实可用分别记录。
3. [技术架构](03_ARCHITECTURE.md)、[接口合同](04_API.md)、[数据与资产](05_DATA_ASSETS.md)。
4. [开发过程与决策](06_HISTORY.md)、[验收](07_VERIFICATION.md)。
5. [下一步计划](08_ROADMAP.md)、[困难与风险](09_BLOCKERS.md)、[启动与接手](10_RUNBOOK.md)。
6. [视觉与截图](11_VISUAL.md)、[skill 与协作流程](12_SKILLS_WORKFLOW.md)、[打包范围](13_PACKAGE_SCOPE.md)。
7. 开始执行前阅读 [给下一位 agent 的指令](AGENT_START_HERE.md)。

也可以直接打开 `START_HANDOFF.html`，离线阅读全部现役说明及图片。原始 Markdown 和源文件更适合 agent 检索。

## 状态与证据优先级

本包 `docs/` 是 2026-10-17 的现役说明；`evidence/latest` 是本次复制的验收证据；`references/` 和 source 内旧 README/计划是历史记录。发现冲突时优先最新用户明确决定，其次当前代码和当前测试，再看旧文档。旧文档里的“待确认”“接口未接通”“六组全绿”等不能直接作为今天的状态。

本包快照文件已逐一与本机来源核对，见 `evidence/current/SNAPSHOT_VERIFICATION.json`；`MANIFEST_SHA256.json` 用于核对包内文件。正式密钥、账号原始身份、私人照片、数据库原始目录、模型和安装运行库不在包中，详见打包范围。
