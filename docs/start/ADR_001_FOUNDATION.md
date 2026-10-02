# ADR 001 — 四实体 Catalog 与 Discovery 基础

2026-10-02，用户已批准实施。Node 24.18.1/TypeScript 5.9.3，pg 8.16.3、zod 4.1.12固定版本；两者安装版本LICENSE实际读过，MIT。PostgreSQL 18.6 portable仅隔离本机测试，不锁定生产vendor、不安装服务。完整官方artifact hash在验收环境记录，真PG不可用则不宣称001通过。

采用Modular Monolith：Catalog承担canonical/public投影与分层信任，Discovery承担意图和产品组顺序，SearchProvider消费独立四实体输入/候选合同，Postgres为首实现。runtime只读public视图/受控函数，迁移/种子另角色。API runtime schema为strict白名单，艺人、路线、地点、活动结构独立；query分组始终Artist→Route→Place→Event，section分页不把未请求解释为空结果。未发布、withdrawn、private与review不允许的内容不用于alias解析，也不进入公开查询。

参考固定GitHub快照和文件hash见reference-pins.json。实际读取node-postgres query.js全文件（query text/values分离、结果生命周期），Meilisearch multi_search.rs前160行（独立多个查询结果和输入/权限边界）、Strapi repository.ts前200行（入口参数、稳定ID、分页校验）；其余模块Pattern延续已批准REFERENCE_NOTE_001，不假称当前全文件读完。node-postgres预猜query-tests.js路径404，不计已读测试；维护/README测试实际用法已从官方GitHub阅读。Meilisearch MIT/BUSL部分、Strapi Community MIT/EE/Cloud分界许可证本轮实际核验，不引入这些实现。维护owner/stars/精确commit/日期已通过GitHub API固定，星标不是质量证明。

可复用优势：查询合同独立于真源、参数化执行、稳定内容身份、分组而非跨entity比分、public清洗独立。明确局限：引擎/全CMS过重；draft/published和搜索score都不能证明艺人关联、claim核验或媒体授权。只借鉴Pattern，没有fork、拼接或移植这些源码。查询始终保留未知残余词，不能识别南京后跳过火星。不使用LLM/vector/独立搜索集群。后续Journey用route_id+revision_id；Event后续流程复用canonical；此轮不建后续runtime空表。

旧src/v0.1测试和角色资产仅回归与历史成果保留，旧Route-only、万能verified、固定南京跳转不再代表START正式方向。没有新增页面/正式Figma设计。

实际环境：PostgreSQL18.6已用当前用户初始化并在127.0.0.1:55432启动，start_test_foundation专用数据库，SELECT version()成功；portable官方343808005bytes/hash见postgresql-artifact.json。initdb在SandboxOffline restricted-token失败，改同cluster用户执行；无系统服务、无旧DB。开发实例loopback trust仅本机测试，禁止作为生产认证配置。运行时和迁移角色在任务2落实，当前不冒称权限门禁已测。
