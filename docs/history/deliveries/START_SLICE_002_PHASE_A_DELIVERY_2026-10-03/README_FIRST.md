# START Slice 002 · Phase A 交付包

先双击 OPEN_ME.html 查看五页与截图，或阅读 docs/start/slice002/PHASE_A_ACCEPTANCE.md。SCREENSHOT_INDEX.md 使用包内相对路径，解压到其它位置仍可打开；历史证据中的绝对路径保留原记录。

已完成：灰阶五页、18/18浏览器检查、49张截图及派生总览、9项001契约/领域回归、21+18项旧工程回归、失败与修复、自查、Git和来源证明。未执行Phase B/C/D、正式Figma、真实API/地图集成、Journey、merge/deploy。已知限制完整记录于验收报告。

直接体验原型：安装/已有 Node.js 24.18.1 或更新版本，在本包根目录执行 node prototypes/discovery-wireframe/server.mjs，然后打开 http://127.0.0.1:4312。已包含fixture.json，启动预览不需要npm安装、不需要数据库、不能直接双击原型index.html代替HTTP服务。停止服务使用Ctrl+C。

如需重建fixture，可在本包安装package.json所列依赖后运行 npm run fixture:rebuild；保留的schemas.ts和catalog.ts是原001支持文件，不是新的后端实现。浏览器回归脚本需Playwright及对应浏览器：START_BROWSER_MODULES指定node_modules目录下的entry.js锚点，START_CHROMIUM_PATH指定Chrome/Chromium可执行文件，然后执行 node prototypes/discovery-wireframe/verify.mjs。record-evidence.mjs依赖原Git仓库和旧工作区，只作为原始来源审计脚本保留，不能在独立解压包中冒充完整仓库恢复验收。

Git分支 feature/start-slice-002-phase-a；提交 f2ba7af897ff8166e1a7f77c91ff2b6c287df1e8、74a103e。git/phase-a-incremental.bundle保存两个增量提交，要求已有基础提交bb0c092b5f3a4b40c042fc5c80881752f5568ae4；它不是全部旧仓库或44项WIP备份，本轮没有自动导入/切换/合并。

本包同时保留完整解压的交接原文、references/素材.zip和latest_style_refs，位于docs/start/slice002/source；仅用作用户提供的视觉研究材料，不代表授权复刻人脸/品牌。原上传ZIP临时容器已过期，其原始hash缺失；本交付ZIP是新打包产物，不声称与上传ZIP字节相同。所有包内文件逐一SHA256登记于DELIVERY_MANIFEST.json，ZIP校验文件在ZIP旁边。
