# Me 第一批结构与视觉合约

阶段：独立视觉稿，等待用户确认；不接入现有原型。个人主页、START Card 查看/编辑、Book 入口/空状态/内容示意、设置、隐私、收藏及我的路线空状态。Card → 静态锁定 Doll → Book → 次级列表，尺寸与权重不同。基于 Apple Music 系统字、列表、顶部大标题、稳定底栏与清晰分区。沿用九色卡：奶油/亚麻主体，咖啡文字，冰蓝控制、叶绿兴趣、陶黄 Book 标识、橙色少量书签。

用户要求的物料集市分区先单独修复：活动详情集市入口和集市列表加入亚麻背景、湖蓝左边线、明确 23 px 章节标题。保留现有交互。

结构前应用 Interaction Design、Apple Design、Hallmark。信息与动作：Card 显示昵称/偏好/兴趣，编辑为次级动作；Doll 是陪伴角色，不提供喂养商店成长值；Book 是主内容资产，不是统计中心。默认不显示真实身份、匹配百分比、伪造数量。收藏和路线为空，Book 默认空；booksample.html 是单独标明的合成章节构图样本，不写入 Memory。所有业务按钮禁用，静态链接仅用于逐页审阅。

隐私三个开关默认关闭，分别是艺人偏好、兴趣标签、共同点推断。登录不伪造，设置页面说明本地演示。用户确认后才接入字段验证、取消恢复和会话存储；Book 复用现有 Memory 数据。

角色来自 .worktrees/character-asset-baseline/character-assets/girl/base/girl_base_default_v1.png 和 boy/base/boy_base_default_v1.png，qaStatus accepted，qa/phase-one-acceptance.md 登记验收，原图字节复制。仅做等比缩放，不重绘、变脸或生成姿势；女娃用于主稿，男娃用于第二种已有母版示意。当前不是动作批次。

GitHub 先行：搜索 metabrainz/listenbrainz-server 的音乐用户资料/设置/隐私。公开页约 1k stars，仅作规模背景；MetaBrainz Foundation 维护；README GPL-2.0-or-later；package.json 与 Jest/pytest/test.sh 存在；commit 缓存展示 2026-09-07 导入修复、09-03 导出错误处理（不宣称今天最新）。优势：个人音乐资料与配置分离、错误恢复与长期实际部署；限制：聆听历史/推荐/API 体系与 START 的旅程纪念资产不同，GPL 与后端体系不适合直接拼入本原型。只借鉴信息架构，未复制代码或依赖。https://github.com/metabrainz/listenbrainz-server/ 、https://github.com/metabrainz/listenbrainz-server/blob/master/README.md 、https://github.com/metabrainz/listenbrainz-server/blob/master/package.json 、https://github.com/metabrainz/listenbrainz-server/commits/master/ 。

验证仅为静态视觉：六宽度、原图解码、无水平溢出、无业务脚本、按钮字段禁用及隐私默认关闭。Open Design 可编辑 HTML/CSS 并实际预览，图片供直接确认；不代表业务、登录或角色动画完成。
