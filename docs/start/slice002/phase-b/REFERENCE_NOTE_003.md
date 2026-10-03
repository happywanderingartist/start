# Phase B：层级与响应式参考

研究于2026-10-03，先于原型修改。GitHub搜索范围：Primer React 的响应式 PageLayout / Button，以及 Radix Dialog 的焦点与关闭行为。公开网页搜索后用官方 API 固定版本；沙箱内 TLS 请求失败，公开只读请求在受批准网络环境成功。没有安装依赖、fork 或复制实现。

| 项目 | 固定版本 / 维护信号 | 关键阅读 |
| --- | --- | --- |
| [primer/react](https://github.com/primer/react) | 3911 stars；primer；最近push 2026-10-02；53ed54524aac9c3e829c239afdb4f63de160f873 | packages/react/src/PageLayout/PageLayout.tsx 与 PageLayout.test.tsx；Button/ButtonBase.tsx；LICENSE |
| [radix-ui/primitives](https://github.com/radix-ui/primitives) | 19360 stars；radix-ui；最近push 2026-08-08；f7ecd5ab16f5e1e820eb5786a1419a98a2d594ae | packages/react/dialog/src/dialog.tsx 与 dialog.test.tsx；LICENSE |

Primer 的可复用优势是把主内容、辅助 pane、窄屏顺序和 sticky 行为明确区分，并测试响应式位置和 landmark；Button 用 variant 表达动作等级。局限是面向工具产品的组件与可拖拽 pane，不能直接成为 START 的城市小册、内容节奏或视觉。START 只借鉴语义分区和显式动作等级：768采用索引/内容并置，维持四实体阅读顺序，避免把手机等比拉宽；START/SHARE/MAP按任务等级区分，不引入侧栏拖拽或组件库。

Radix 的优势是关闭时回到 trigger、对话框打开期间约束焦点，并有打开/关闭/aria关联测试；局限是完整React原语和Portal并不适合这份已有原生dialog灰阶原型。START保留原生dialog、SOURCE链路和既有焦点恢复，仅删除Stop Preview多余MAP；不改写已经通过的modal行为。

两项目均MIT：若未来分发复制代码须带版权及许可；本轮只学习Pattern，没有复制代码或加入依赖。星标不是质量结论，维护时间只是研究当时的信号，UX判断必须靠本产品任务与截图。

验收：搜索保持唯一入口焦点且辅助入口仍可用；Artist身份/索引/章节有明确层级；START高于SHARE、MAP是快捷动作；Preview只留SOURCE/PLACE；WHY与地址优先于未知拍摄信息；768有实质信息分区。既有18项功能断言原封保留，新增行为检查先失败再验证；截图和独立UX审查共同提供证据，不以几何断言替代UX结论。
