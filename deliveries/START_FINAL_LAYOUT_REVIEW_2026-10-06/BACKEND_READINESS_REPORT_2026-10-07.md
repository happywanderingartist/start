# START 后端基础核验报告 · 2026-10-07

本地基础核验通过；真实微信登录、云媒体存储和公开部署尚未完成。本轮无业务代码、原数据库、旧原型或云资源变更。

## 工作区与保护

复用现有隔离工作区 `.worktrees/start-slice-001`，HEAD `45a44b348696c6f5af8be6bfdbbb79d591c72c29`。执行前后 Git 状态相同，原有未跟踪目录 `docs/start/slice002/phase-c/` 和 `evidence/slice002-phase-c/` 原样保留。编译输出单独存于本报告旁的 `backend-readiness-evidence/compiled-api`，未覆盖原 dist。

现有 AGENTS.md 的旧阶段范围被本轮明确授权扩展为后端基础核验；其数据保护、隔离、禁止默认部署等要求继续保留。仅核验现有基础，不以本轮授权推定新视觉稿已获批。

## 数据与备份

原端口 55432 无响应；旧 postmaster.pid 的进程 37828 已不存在，未发现 postgres 进程。原数据目录未启动或修改，备份来自停止运行但此前非正常关闭的集群。

冷备份路径：`D:/Downloads/fan-route-codex-handoff/integration-backups/2026-10-07-readiness/cold-pgdata`。2,888 个文件、106,669,342 字节逐个 SHA-256 校验通过；清单为同目录上级的 `cold-backup-manifest.json`。

在独立 `restored-pgdata` 副本删除陈旧 PID 文件并恢复，PostgreSQL 18.6 成功重放 WAL 后可连接。仅绑定 127.0.0.1。受沙箱 Windows token 限制，首次启动失败，经工具权限审核后在隔离副本启动成功。未修改原 pg_hba.conf；副本继承本机 trust 配置，仅适用于此次本地验证，不可据此上线。

恢复目录库中 001–008 共 8 个迁移校验和均与源码一致；原目录库含 15 个艺人、18 个地点、2 个演出，为已有测试/种子内容，不能称为新上线真实资料。另导出 `foundation.dump`，在全新 `start_test_restore_readiness_20261007` 恢复成功，迁移与上述三种实体数量一致。恢复演练验证了可读与结构/数量，未声称全库逐行语义比对。

## 检查结果

| 检查 | 结果 | 证据 |
| --- | --- | --- |
| foundation 类型检查 | 退出码 0 | backend-readiness-evidence/typecheck.log |
| API 编译（输出重定向） | 退出码 0 | backend-readiness-evidence/build-api.log |
| contracts/domain/integration | 53/53 通过，0 跳过 | backend-readiness-evidence/foundation-tests-final.log |
| 现有账号基础及 PostgreSQL 集成 | 5/5 通过，0 跳过 | backend-readiness-evidence/account-full-tests.log |
| 迁移文件校验 | 8/8 一致 | backend-readiness-evidence/restored-catalog.txt |
| 逻辑备份恢复 | 成功，结构和关键数量一致 | backend-readiness-evidence/logical-restore-counts.txt |

第一次基础测试 52/53：原断线测试硬编码 55433 为不可用端口，与本轮副本端口冲突。移副本至 55434 后完整重跑 53/53；原失败日志保留为 foundation-tests.log。没有修改测试断言或业务代码来掩盖失败。

账号 PostgreSQL 测试固定 55432 和库名，因此复制账号交付到证据目录，仅在副本测试文件替换为 55434 和独立 `start_test_accounts_readiness_20261007`。原账号文件不变。测试数据不进入原账号库。

## 已有账号能力与缺口

发现 `deliveries/START_ACCOUNT_FOUNDATION_2026-10-05` 已有账号服务、身份/资料事务仓储、候选 SQL 及测试；恢复集群已有 start_accounts.users/auth_identities/profiles。可复用身份映射、并发创建和用户隔离，不重新造一套用户表。

当前 createAccountService 要求注入真实 verifyBearer。尚未提供微信 code 换取身份的适配器、正式会话 HTTP API、受限写入数据库角色或云照片上传；本地 fixture 仅为测试。下一阶段需审阅并集成已有模块，同时处理 AppID + OpenID 身份命名空间，避免不同小程序同名 OpenID 冲突。

## 配置核验与边界

本轮检查当前进程环境、主要项目中的 .env 文件名及相关接入源码位置。仅识别变量名 `AMAP_WEB_SERVICE_KEY`，未打印值、未访问高德服务、未确认配额或调用成功。未在此范围找到微信/CloudBase/Supabase 接入变量或 .env 文件；这不等于整台电脑没有配置。

已向用户请求微信 AppID/腾讯云环境是否存在或配置路径，不要求在对话发送 AppSecret。账号权限、付费资源、具体保留期限及公开部署继续按计划单独核定。

## 下一阶段

根据用户接入条件补齐身份与媒体阶段的具体接口、迁移、失败测试和真机验收步骤。继续保留已有账号底座，先完成本地服务整合或真实微信适配；有真实配置前不能宣称真机登录已通过。本地 trust 数据库不得用于公开服务。

测试后隔离副本已正常停止；55434 再检查无响应。原数据库保持未启动状态。
