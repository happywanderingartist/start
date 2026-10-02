# 本机 Foundation 验收环境

仅本任务隔离测试环境，未安装系统服务或部署。PostgreSQL 18.6 当前已经停止；数据、原始下载包、dump 和恢复库保留。Node24.18.1、pnpm11.25.0、pg8.16.3/zod4.1.12；依赖版本与许可证记录见 ADR 和 package/lock。

在 START worktree PowerShell 中手动启动测试实例：

```powershell
$startPgBin='D:\Downloads\fan-route-codex-handoff\integration-runtime\pg-minimal\pgsql\bin'
$startPgData='D:\Downloads\fan-route-codex-handoff\integration-runtime\pgdata-start-test'
& "$startPgBin\pg_ctl.exe" -D $startPgData -l 'D:\Downloads\fan-route-codex-handoff\integration-runtime\postgresql-test.log' -o '-p 55432 -h 127.0.0.1' -w start
$env:START_TEST_DATABASE_URL='postgresql://postgres@127.0.0.1:55432/start_test_foundation'
pnpm check:foundation
```

测试只接受 localhost/127.0.0.1 与 `start_test_` 名称，并使用 synthetic fixture；55433 须未运行测试数据库，供真实断连用例。现存验收库 `start_test_acceptance_final_1790941858303` 和 dump 恢复库 `start_test_restore_final_1790942149241` 均保留。migration/seed 角色为本机 postgres，运行 API 必须 reader；API 启动会拒绝高权限角色。

```powershell
$env:DATABASE_URL='postgresql://start_public_reader@127.0.0.1:55432/start_test_foundation'
pnpm build:api
pnpm start:api
```

默认 API 仅监听127.0.0.1:3001；这是手动本机验证，不是部署。按 Ctrl+C 结束 API 后停止数据库：

```powershell
& "$startPgBin\pg_ctl.exe" -D $startPgData -m fast -w stop
```

本机 loopback trust 不作为生产认证配置。pg_dump/restore 对应 `integration-backups/2026-10-02-slice001-test-db/`；恢复必须新建独立 `start_test_` 库，不加 --clean、不 drop 旧库。不同新 cluster 要先建立 start_catalog_owner/start_public_reader 角色。`tooling/verification/persistence.mjs --before` 在实际 restart 前取逻辑 checkpoint，restart 后运行无参数校验；`--restored` 比较新库与 checkpoint，仅在写 fixture 前执行。`compiled-smoke.mjs` 读取编译产物，检查五类 API 与 owner 启动拒绝。
