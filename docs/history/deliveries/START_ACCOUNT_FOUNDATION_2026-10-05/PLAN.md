# START 账号底座执行记录

本批承接已确认的移动端适配和技术接入计划。视觉稿确认继续按页面批次执行；本批不新增登录 UI、不把测试身份接入原型。

1. 修复 Me 手机横屏单列、平板双列：已完成；布局回归与 80 个触控/视口样本通过。
2. 私有局域网预览：已启动 192.168.3.17:4320，电脑请求返回 200；真机验收待手机和平板实际打开。
3. 新增独立账号底座：User 与 AuthIdentity 分离；PostgreSQL 个人资料保存；身份由服务端 AuthProvider 验证，不能接收前端 userId；验证持久化、并发与隔离。
4. 登录视觉稿 V1 已独立制作，Open Design 手机390×844实际展示；输入与查收两状态在5种尺寸共10份截图检查通过。等待用户确认此批视觉，配置真实服务后按确认结果接入已批准的Me。图片存储采用S3兼容适配器，下一批处理，不把图片字节放数据库。
5. 依次推进票根/Book 持久化、真实地图与打卡、Community/物料集市写入。每批分别记录已编码、已测试、已配置、真实验收。

Ruling: 保留既有 Slice 001 PostgreSQL 与公共读 API，本批新增独立交付目录与测试数据库，不修改已应用迁移或公共 API — 避免打断现有证据与路线服务 — 下一批集成需要迁移归档和部署审查。
Ruling: 没有真实 AuthProvider 配置时拒绝账号操作，不自制密码/JWT、不用演示 token 冒充真实登录 — 身份校验是权限前提 — 当前前端仍是明确标注的本地演示。

## GitHub 先行审阅

通过 Agent Reach 的 GitHub 路由检查 gh：当前未登录，改用 GitHub 官方网页读取。参考 [supabase/auth](https://github.com/supabase/auth)、[提交记录](https://github.com/supabase/auth/commits/master/) 与 [贡献/测试方式](https://github.com/supabase/auth/blob/master/CONTRIBUTING.md)。仓库由 Supabase 组织维护，MIT；页面展示 2,453 次提交；提交页缓存最近可见 2026-09-09 的 2.197.0 发布。星标数字未能可靠读取，API 获取失败，不能据此作质量判断。

可复用优势：认证身份与业务资料分离，使用 PostgreSQL，提供外部身份提供者和魔法链接；贡献指南有自动测试流程。明确局限：自托管认证需要持续安全升级、邮件和配置；Go 内部库没有稳定兼容保证，不能直接拷进本项目。本批借鉴边界，保留 START 的数据库，并使用注入式认证适配器；不复制认证实现，也不把 Supabase 选型当成已确认。

使用 Mobile Native、Apple Design、Hallmark 保持已批准的色卡与界面；Executing Plans 与 TDD 记录失败/通过证据。Open Design 同步本次已批准 Me 的布局修正。

执行结果：手机横屏回归先观察844×390错误两列，再修为一列；账号校验测试先失败再实现，最终4项单元+1项真实PostgreSQL集成通过。独立审查无阻断问题；受限运行角色、真实AuthProvider、HTTP边界属于后续接入。本轮停止在独立登录视觉稿确认关卡，未将登录接入原型。
