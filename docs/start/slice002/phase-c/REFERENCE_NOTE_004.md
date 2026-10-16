# Reference Before Visual Source — Phase C

目标：建立可维护的Figma token→semantic→component→screen关系，保持已验收UX。先搜索成熟GitHub项目，再确定实现方法；不复制开源App皮肤。

2026-10-03公开GitHub读取：radix-ui/themes 8736stars，最近push2026-04-11，owner radix-ui/README维护者WorkOS，MIT；primer/primitives 412stars，最近push2026-09-09，owner primer，MIT。stars不是质量证明。gh缺登录，改公开GitHubAPI核对元数据，并读公开源文件。

Radix阅读[README](https://github.com/radix-ui/themes)、[space.css](https://github.com/radix-ui/themes/blob/main/packages/radix-ui-themes/src/styles/tokens/space.css)、组件共置目录和apps/playground/tests视觉回归结构。优势：离散spacing与responsive props、variant有限组合可验证；局限：其通用圆角/主题和大量色阶不适合START的档案表达，不能把React测试当成本次Figma验收。仅借鉴token层级和state矩阵，未导入其产品代码。

Primer阅读[README](https://github.com/primer/primitives)、[fgColor.json5](https://github.com/primer/primitives/blob/main/src/tokens/functional/color/fgColor.json5)、[token-authoring](https://github.com/primer/primitives/blob/main/contributor-docs/agents/token-authoring.md)、[MIT license](https://raw.githubusercontent.com/primer/primitives/main/LICENSE)。优势：raw→functional alias及Figma scopes元数据、lint/test/build证明token维护路径；局限：开发工具界面密度与品牌语义不能成为START的视觉源。保留版权要求；本轮只研究pattern无源代码复制。

Figma库先get_libraries后search_design_system；Simple Design System按钮候选与START独特token/variant所有权不匹配，未直接导入。search为空，surface变量为空；Body搜索出现团队样式，须查属性再决定兼容性。服务器batch被clamp到1，剩余查询逐项补齐，不伪称全部执行。

用户参考：26原素材+11latest，latest10中心主体及私人边注、latest11编号外围档案碎片；只借表达密度和受控不对称，不移用人物/照片/字体艺术/原完整构图。锁定Doll直接使用现有授权PNG。ImageGen全屏仅为探索，不上传作正式UI。

外部基准：[Webby criteria](https://www.webbyawards.com/judging-criteria/)已读取，采用Structure/Navigation、Visual、Functionality、Interaction、Overall Experience作为审查维度。Mobbin公开页面暂未成功读取，Awwwards公开目录timeout，FWA网页为动态空响应；没有声称看过受限截图。继续尝试可视访问，并明确记录实际可见范围；不把间接资料称作现场audit。

实施前条件：清洁Phase B Git基线、完整包校验、37图实看、探索与选择记录、Figma读写验证。完成标准为真实可编辑节点/变量/实例/原型及截图，不以概念图片、计划、成功API响应冒充完整交付。
