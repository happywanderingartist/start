# 本地运行、迁机与接手步骤

## 原机路径与端口

| 用途 | 原机位置/端口 |
| --- | --- |
| 外层工作目录 | D:/Downloads/fan-route-codex-handoff（不是Git根） |
| 现役本地平台 | deliveries/START_LOCAL_PLATFORM_2026-10-08 |
| 后台/当前前台 | http://127.0.0.1:4330/admin/ 与 /app/ |
| PostgreSQL | 127.0.0.1:55435；DB start_acceptance；开发角色start_local |
| PG数据 | 现役目录/data/pg；不直接复制活跃数据库文件迁移 |
| PG运行库 | integration-runtime/postgresql-18.6/pgsql/bin |
| 高德代理 | deliveries/START_AMAP_INTEGRATION_2026-10-07；4325 |
| 旧后台独立预览 | deliveries/START_ADMIN_CONTENT_VISUAL_2026-10-07；4327 |
| 本地模型 | 同上/local-extractor；llama-server 4328，Qwen2.5-1.5B Q4_K_M |
| Open Design | D:/AI-Data/Tools/OpenDesign/Open Design.exe；旧63868/53625不可作为固定保证 |
| Git二进制 | D:/AI-Data/Cache/codex-runtimes/codex-primary-runtime/dependencies/native/git/cmd/git.exe |

## 原机最小启动

先查端口所属与运行目录，避免重复启动或终止别的进程。进入现役目录后：

```powershell
Set-Location 'D:\Downloads\fan-route-codex-handoff\deliveries\START_LOCAL_PLATFORM_2026-10-08'
node boot.mjs
```

boot验证已有PG_VERSION，启动这个集群，并核对55435对应data_directory后建立start_acceptance，再加载schema与server；它不会替新机器自动安装PG或initdb。保持服务终端运行，在另一终端执行验收。某些沙箱允许文件读取但拒绝loopback，会出现EACCES；区别于ECONNREFUSED（无监听）和真实业务断言失败，不要靠修改业务测试让其消失。

```powershell
node --test --test-concurrency=1 tests/*.test.mjs
node tests/book-browser-acceptance.mjs
node acceptance.mjs
```

完整acceptance包括外部本机集成服务，关闭服务会失败。允许重新恢复已有服务时，旧后台目录的START_TEXT_IMPORT.ps1可以启动4325、4327、4328；它依赖本机已保存模型与高德配置，本包没有模型或密钥。

```powershell
Set-Location 'D:\Downloads\fan-route-codex-handoff\deliveries\START_ADMIN_CONTENT_VISUAL_2026-10-07'
.\START_TEXT_IMPORT.ps1
```

后台实际写入在未注入身份Provider时返回503是预期。不要为了让演示可写，把测试fixture身份加到正式server。可运行独立测试观察完整流程，或按真实微信身份计划接入。

## 新机器恢复说明

本包source/workspace保留了现役deliveries间与旧`.worktrees`的相对布局；不要只拷贝其中一个文件夹。源码是精确快照，未为了迁机偷偷改写import。以下准备仍需完成：

1. 安装可运行ESM/当前语法的Node（原测试环境Node24系列）；在`.worktrees/start-slice-001`按其package与lock恢复依赖。现役实际需要pg8.16.3、zod4.1.12、pngjs7.0.0，旧React/TS工程还有自己的完整依赖。没有打包node_modules。
2. 安装PostgreSQL18系列（原机18.6），配置boot所需bin位置或经审查改为配置项。创建新的开发集群，listen只绑定127.0.0.1，端口55435；开发trust/超管只用于隔离本机，不可用于公网。boot要求角色start_local及postgres库可连接。迁入旧数据应pg_dump/pg_restore并核对，不复制正在运行的data目录。
3. 恢复Playwright与浏览器。现有验收脚本使用绝对运行库路径和chromium_headless_shell-1228路径，迁机要统一配置，不能假设快照可直接开箱运行。
4. 需要地图时另提供JS API key/security code与Web Service key。当前JS配置从原机private-config/amap.env读取，Web服务key从进程环境读取；不要将security code或服务key硬编码前端。
5. 需要本地识别时获取相应Qwen模型与llama运行库，配置4328并核对版本/hash/许可证；下载来源与旧记录在原后台交付文档中。
6. 当前API无需云可以运行，但不能把仅有源码/本地localhost链接发给外部用户当作上线。真实微信、HTTPS、云媒体与权限另走生产阶段。

## 现场诊断顺序

4330/api/status → /api/public → 当前/app/ → DB-only测试 → 各浏览器组 → 4325/map/config（不要记录值）→ 真实POI → 4328/health与识别状态 → Open Design实际项目 → 全套acceptance。逐层验证，服务未起来时不重写整个前端。

原README中的53625预览链接是历史端口，本次未恢复。启动/关闭node进程应定位精确进程与工作目录，不Ctrl-C杀整棵进程树误带PG。新生成数据、截图、缓存、导出默认D盘；本包不授权删除旧工作树或测试库。

## 最小配置模板

`data/CONFIGURATION_TEMPLATE.md`只含变量名与用途，没有值。实际密钥由用户在受控本地环境配置，禁止让用户粘到公开聊天或Git提交中。额外的生产配置如微信AppID/服务端密钥、数据库连接、云存储并未全部在当前代码实现，不应把建议变量名冒称已有支持。
