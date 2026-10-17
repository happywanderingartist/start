本稿依据最新用户要求，名称统一我的娃娃。首页紧凑推荐和地点分类列表共存；社区城市打卡列表/地图、活动、物料集市分区；Me保留个人卡/Book/娃娃入口。首次选择角色与日常装扮分离；本稿只展示男娃或女娃候选，未实现账号持久化，日常无性别切换。独立副本，不修改现有业务原型。
Skills: Interaction Design, Apple Design, Hallmark。
前置开源审查：ionic-team/ionic-framework，MIT，Ionic团队维护，52.7k星，仅作活跃度线索；近期issues及main变更仍持续，精确最后提交日期未核实。仓库含组件测试及Angular/React/Vue Conference真实示例。优势为成熟列表/分栏导航与iOS层级参考；局限为路由栈和浏览器返回语义差异，不能直接搬入现有原型。沿用现有轻量样式，不安装新框架。参考 https://github.com/ionic-team/ionic-framework 和 https://github.com/ionic-team/ionic-framework/issues/27131 。

修复：Community重画漏接已加入/已关注展示。保留原membership state与sessionStorage，恢复顶部我的社群独立分区；不重置任何选择。回归验证加入→返回社区→刷新→我的社群。此本地原型仍非云端账号同步，不跨端口/标签页搬运状态。GitHub参考 Ionic tabs状态与展示分离，不搬入其路由栈。

布局优化：Apple Design用字重与间距建立层级；Hallmark审查模式去除社区重复地点标题；Interaction Design保留已加入状态、分类筛选和各入口。手机压缩卡片封面至120px、地点缩略块56px；390以上已加入/已关注并排，平板首页推荐与地点分栏，社区地点与活动/集市分栏。无新框架、无状态迁移、保留现有sessionStorage。开源仍参考Ionic团队MIT列表/导航及Conference示例；成熟优势与路由局限见前述记录，近期main持续更新但精确提交日期未核实。

角色修正：R02包含五套男娃参考，旧原型仅接入original并硬编码禁止其他outfit，现补齐五个独立viewBox参考预览，不能当透明试穿资产已完成。配饰入口暂缓，保留原存储字段兼容。首页独立锁定PNG替代整图裁切，object-fit contain等比显示，容器仅整体轻微translate/rotate，未进行scaleX/scaleY或重绘。Animate目的为角色在场状态；CSS固定动效最小依赖，4秒装饰循环，可暂停、后台暂停、输入聚焦暂停、reduced-motion静止。参考Motion MIT（Motion团队、近期main活动、框架测试与示例）；优势为可打断和减弱动态原则，局限为不提供角色资产且本场景引入库过重，因此不安装。https://github.com/motiondivision/motion 
