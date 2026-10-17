# START 当前仓库入口

先读 README.md、docs/current/01_PRODUCT.md、02_STATUS.md、03_ARCHITECTURE.md、08_ROADMAP.md、09_BLOCKERS.md、10_RUNBOOK.md。现役代码在 deliveries/START_LOCAL_PLATFORM_2026-10-08。旧 React/TypeScript 版本在既有与归档分支，不能当成最新Book已合并。

实现前先读相关成熟skill，搜索成熟GitHub参考并记录优势/局限，先写文档与按批确认。新视觉先确认再实现；Apple Music系统底座、组合色卡、原Logo和角色身份锁定。常规授权内读取/修复/测试无需反复问权限。

主导航仅Start/Community/Me；物料集市属于Community；联系方式在评论自行交换，无支付/完成追踪；一个艺人一个社群；一次投稿一个艺人；Book默认私密可选择分享撤销；一个账号一个娃娃、无配饰。

本地Node/pg/zod，PostgreSQL-first；正式身份与云尚未接入。npm start要求已有本机PG和配置；npm run test:platform需隔离测试数据库，脚本有本机Playwright路径，迁机先按runbook配置。不要把fixture身份当微信登录，不将开发trust配置公开。

最新本地验收12组11通过，高德配置503待修；55项平台测试及Book20检查通过。视觉/代码/自动测试/真实配置/真机/上线状态分开。

所有生成文件默认D盘；密钥/私人数据/模型/依赖不提交。保留旧分支与未提交现场，不force push，不自动清理数据库/原资产。发布附件是开发归档，不是部署。
