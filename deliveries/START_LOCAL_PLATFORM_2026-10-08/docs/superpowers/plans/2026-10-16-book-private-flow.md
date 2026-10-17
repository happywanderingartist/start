# 私人打卡与 START Book：确认稿

状态：待用户确认；本轮仅整理文档，未开始此批代码或视觉文件制作。

## 目标与顺序

接通“地点详情 → 私人打卡 → START Book → 选择内容分享 → 撤销分享”的本地闭环。物料功能之后先做此批，再做 Me/我的娃娃数据接线、兴趣推荐与通知，最后整体验收。云与真实微信账号不在本批部署范围。

## 已有基础与缺口

当前 src/personal.mjs 已有 checkin.create、checkin.delete、share.create、share.revoke；照片沿用私有媒体权限，删除记录会撤销关联分享。public-ui/private-views.mjs 的 Book 仍是只读行，未接新建、详情、分享管理。不能把已有后端测试当成前台闭环完成。

物料批次已有发布/编辑、上下架、申请/接受/撤回和公开评论；不提供单独联系方式功能。2026-10-15 完整验收为 11 组中 9 组通过；2026-10-16 单独复验实际预览已通过，高德搜索与本地模型检查通过，Open Design 63868 连接拒绝。单独复验不改写历史整套报告，也不宣称最新整套全绿。

## 本批实际采用的 skills

- Interaction Design：D:/AI-Data/Codex/skills/interaction-design/SKILL.md。应用可见状态、提交反馈、错误恢复、返回路径及主次动作。
- Apple Design：D:/AI-Data/Codex/skills/apple-design/SKILL.md。应用统一空间层级、触按反馈、可中断动效和 reduced-motion；延续 Apple Music 排版与内容主导原则。
- Writing Plans：C:/Users/15049/.codex/plugins/cache/openai-curated-remote/superpowers/6.4.2/skills/writing-plans/SKILL.md。应用文件责任、可独立验证任务、确认关卡和风险检查。
- Agent Reach：D:/AI-Data/Shared/skills/agent-reach/SKILL.md。读取 GitHub 调研路由；gh 未登录，本次使用公开网页检索，不要求用户为资料调研登录。

## 成熟项目参考

检索范围：GitHub 上私人相册、选中内容分享、撤销链接；选择 immich-app/immich（组织维护，AGPL-3.0）。查看官方 README、sharing 文档、shared-link.service.ts 和 server/test 目录。优势是私人图库与公开分享分离，可只共享选中内容；局限是完整相册与服务部署远超 START 范围，且许可证不适合未经审查直接复制代码。本批只借鉴流程，复用自己的接口，不引入 Immich。

GitHub CLI 因未登录未返回实时元数据；网页未可靠给出当前星数、最近提交时间，单元测试文件读取失败，因此不声称已审阅其测试实现或实时维护状态。实施前若需引入依赖，应补齐版本及维护核查；目前不新增依赖。

来源：https://github.com/immich-app/immich 、 https://immich.app/docs/features/sharing 、 https://github.com/immich-app/immich/blob/main/server/src/services/shared-link.service.ts 、 https://github.com/immich-app/immich/tree/main/server/test 。

## 产品结构与边界

入口保留 Start / Community / Me。地点详情增加“记录打卡”；Me 的 START Book 打开私人记录列表，不新增主导航。路线内各站点进入同一地点记录流程；路线完成纪念海报仍单列待办，不在本批偷偷以单地点打卡代替。

打卡包含地点、实际时间、文字和可选照片/票根。允许自由打卡、补记过去时间，不验证到场；禁止未来时间。默认仅自己可见，保存后不自动发帖、不自动创建公开分享。地点信息保存当时快照，后续地点改名或下架不能抹掉私人记录。

Book 按时间倒序展示，进入详情查看照片、文字和票根。沿用已确认票根方向 REF_28，照片版与无照片版都需视觉核对；不将图片中的条形码当真实入场凭证。当前接口不具备编辑记录能力，本批先做创建、查看、删除；若加入编辑需单独补充范围。

分享先选记录，再选实际接口允许的字段，再预览公开结果，最后生成链接。提供分享管理与撤销；删除记录前明确说明关联链接将失效。分享不是发布到首页或社群。本机链接必须标为本地预览，未部署前不承诺微信好友可访问。

## 页面与状态

| 页面 | 主动作 | 必须具备的状态 |
|---|---|---|
| 地点打卡表单 | 保存到 Book | 未登录、校验错误、上传中、保存中、失败保留草稿、成功 |
| Book 列表 | 查看记录 | 加载、空列表、读取失败可重试、返回恢复滚动位置 |
| 记录详情 | 分享 | 私有图片加载失败、记录不存在、删除确认与取消 |
| 分享选择/预览 | 创建链接 | 未选记录不可提交、字段可见性预览、生成失败不丢选择 |
| 分享管理 | 撤销链接 | 有效、已撤销、失败可重试、刷新后可继续管理 |
| 公开分享页 | 查看选中内容 | 有效、失效、不存在；不得泄露其他记录/照片 |

手机采用单栏，平板可增加列表宽度，不缩成两套完整页面并排。奶油/亚麻底、咖啡文字、冰蓝主动作；橙色少量强调，避免绿色与土黄大面积组合。触控目标至少 44px；键盘可达，焦点清晰，reduced-motion 下关闭非必要动效。照片/票根是内容重点，减少解释性文案。

## 实施任务（确认后开始）

1. 视觉与接口核对：恢复 Open Design 连接并展示本批可编辑稿和直接图片，核对旧票根与 Book 资产。读取 contracts.mjs 中实际字段上限，列出接口表；没有视觉确认不接入新页面。
2. 打卡写入：新增 public-ui/book.mjs，导出 mountBook(root, api, context)，返回清理函数；public.js 只做路由与地点入口，private-views.mjs 增加 Book 链接，private.css 承载既有样式扩展。使用 checkin.create 与现有 uploadImage；失败保留输入，重复提交使用稳定幂等键，不将假身份接入正式页面。
3. 私人阅读：通过 api.me('book') 渲染列表/详情，私有照片用 api.imageUrl 并在离开页面后释放 object URL。返回保留列表位置；异步结果不得覆盖已离开的页面。
4. 分享与删除：复用 share.create/revoke、checkin.delete；为刷新后可管理分享补充只返回本人链接元数据的 api.me('shares')，不返回令牌哈希。令牌只在创建时返回，不为便利改为明文存库。分享页复用 api.share(token)，旧链接撤销后立即拒绝读取媒体。
5. 验收与记录：新增 tests/book-browser-acceptance.mjs，补充 platform/http-media 测试，纳入 acceptance.mjs；运行全套验收并保留失败项目，更新本批报告与待办。

## 验收标准与重点风险

- 匿名或伪造身份不能创建、读取私人 Book；用户 B 不能查看/删除用户 A 的记录或撤销 A 的分享。
- 上传成功但保存失败可重试，不重复创建记录；连续点击只执行一次；照片失败不宣称保存成功。
- 分享预览与实际字段一致；未选照片不可通过原媒体 URL 绕过；撤销、删除记录、注销后旧链接拒绝访问。
- 当前地点撤回不破坏历史快照；列表读取失败不能显示为“没有记录”。
- 六宽度 320/375/390/414/768/834 无横向溢出；键盘、reduced-motion、返回、页面切换时的迟到响应均验证。
- 分别记录设计确认、接口测试、浏览器测试、真实登录、真机与云部署状态。浏览器测试使用隔离身份，不能称为微信验收。

验证命令：node --test --test-concurrency=1 tests/*.test.mjs；node tests/book-browser-acceptance.mjs；node acceptance.mjs。全部预期断言通过才标记对应任务完成，Open Design 与真实服务未通过项单独保留。

## 确认关卡

本次请确认这一批范围：私人打卡、Book 列表/详情、选择分享和撤销；先做视觉核对再实现。确认沿用当前会话顺序执行，无需另选代理或新建任务。后续我的娃娃、推荐和通知分别提供文档，不以本次确认代替后续确认。
