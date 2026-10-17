# START 本地平台验收交付

独立交付，不替换原原型，不修改原 Slice 工作区。数据库、媒体、证据均在本目录 D 盘；现有原型仍然有合成数据和会话状态，不能称已经整体接通真实业务。

已完成本轮：本地 PostgreSQL 业务与权限、HTTP 接口与客户端适配器、已批准后台布局的独立数据接入、业务联通验收、图片访问控制、备份恢复、原型画幅回归、两项独立审查问题修复。

访问：[本机后台](http://127.0.0.1:4330/admin/)；[Open Design验收预览](http://127.0.0.1:53625/api/projects/23d86b85-b67b-42f0-8b1b-d7c118a9d81c/raw/local-acceptance-2026-10-08/index.html)。后台未配置真实身份时拒绝写入。测试在一次性独立测试服务注入明确的测试身份，不提供假微信账号，不把测试账号带入原型。

本机重启后，在本目录运行 `npm start`；另一终端运行 `npm test`。启动器只启动本目录已有的隔离 PostgreSQL 集群，验证55435端口对应的实际目录再初始化本轮数据库，不创建或迁移旧集群。当前端口已占用时先查所属服务，不强行结束其他程序。依赖复用 `.worktrees/start-slice-001/node_modules` 和已装的 Playwright/PostgreSQL，搬走原工作区需重新整理依赖。

完整验收需要当前已配置的高德4325服务、本机文字识别服务，以及Open Design53625；这些服务关闭时集成检查会失败，不能伪造通过。可独立运行 `node --test --test-concurrency=1 tests/*.test.mjs` 检查本地业务（需本机55435数据库）。所有验收新建 start_test_* 数据库并保留，备份恢复新建 start_test_restore_*，不删除、覆盖原库。

API：`/api/public`（artistId/city/category）、`/api/public/{kind}/{id}`、`/api/home`、`/api/recommend?city`；已验证身份后 `/api/me/{section}`、`/api/commands/{operation}`、管理员 `/api/admin/{section}`；照片 `/api/media`；选定分享 `/api/share/{token}` 与受令牌限制的照片路径。客户端 `createPlatformClient({getBearer})` 接受真实身份服务提供的令牌；未提供服务时返回明确的503，不推断客户端userId或管理员标记。身份接口接入前需将项目身份配置提供给服务端，不能把密钥放入前端。

本机数据库 trust、测试超管、全局写锁与未分页查询均限定于隔离开发验收；不能原样暴露公网或作为生产配置。云环境须配置受限数据库角色、真正的身份验证、权限管理、备份与运行监控，再进行单独上线验收。

完整状态见 CURRENT_STATE_REPORT.md、PROGRESS.md；最终执行证据见 evidence/ACCEPTANCE_RUN.json。接口验收、视觉确认、真实身份、真机与正式上线分别记录。
