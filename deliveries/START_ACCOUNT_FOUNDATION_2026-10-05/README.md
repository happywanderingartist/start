# START 本地账号底座

此交付为后端模块与独立数据库验证，尚未提供正式 HTTP API 或登录页面，也没有接入已批准原型。浏览器仍使用原有本地演示资料；不能把这里的数据库测试称为已上线登录。

`src/accounts.mjs` 使用服务端注入的 `verifyBearer(token)`：仅在外部服务已验证 token 后返回 `{provider,subject}`。未配置时503、无效身份401、提供者故障503，故障原文不向调用者泄露。没有 JWT 解码冒充验证、默认演示凭证、密码实现或按邮箱自动合并账号。生产适配器还须验证签名/发行者/受众/有效期或使用提供者正式会话校验接口；配置完成后单独验收。

`src/profile-repository.mjs` 接受已有 pg Pool。身份与业务 User 分离，provider+subject唯一；用户资料默认私有。事务串行化同身份初次建立和同用户资料更新，重新连接数据库可读取提交后的资料。artists/interests为用户输入的个人偏好文本，不是已验证的Artist关系或公开到访证据。privacy仅存储开关，Book等公开读取尚未实现，不能称为已有完整公开权限系统。

`db/001_accounts.sql` 仅用于本批独立测试库的候选结构，不是已部署正式迁移；未改变原catalog迁移与公共API。新schema/table不给PUBLIC权限，旧start_public_reader无schema访问权。正式集成必须使用受限运行角色，不使用测试中的postgres管理员，并完成迁移编号/校验归档、HTTP请求限制与错误映射。

验证方式：本地 PostgreSQL监听127.0.0.1:55432后，在此目录运行 `node --test --test-concurrency=1 tests/*.test.mjs`。测试复用工作区 `.worktrees/start-slice-001` 的pg依赖，固定操作 `start_test_accounts_20261005`，不读取生产DATABASE_URL、不清理旧catalog数据、不删除数据库。本次合成验证数据保留，provider=`fixture`；只由测试注入验证器，不存在可供前端使用的fixture登录接口。

已验证：5个测试，其中PostgreSQL集成覆盖8个同身份并发请求、两用户隔离、隐私并发更新、另一连接持久读取、客户端userId拒绝、停用账号拒绝、公共读角色无访问权限。独立审查未发现本批阻断问题。真实AuthProvider、邮件登录、S3图片上传、真实设备体验均未验收。

下一批：先落实登录/存储服务配置与受限数据库角色，提交登录入口视觉稿；确认后接入Me资料，再处理票根/Book永久保存。页面风格继续以已批准首页和Me V4为准。
