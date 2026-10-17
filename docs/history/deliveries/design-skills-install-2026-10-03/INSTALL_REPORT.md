# Design Skills 安装与审阅记录

日期：2026-10-03。范围：按用户要求搜索 GitHub 并安装产品原型与 UI 设计 skills。本轮没有修改 START 功能、已有 Figma 文件、旧工作区或已有 skills，也没有 merge/deploy。

## 已安装

| Skill | 来源与固定 commit | 用途 | 许可证 |
|---|---|---|---|
| impeccable | https://github.com/pbakaus/impeccable · `e103efe779e2dd01274dabae83531fef00bf2563` | 视觉 brief、排版、布局、颜色、动效、critique、audit、polish | Apache-2.0，保留 LICENSE / NOTICE.md |
| ui-design-system | https://github.com/alirezarezvani/claude-skills · `19392f7a08264ed00486a251f5b2098321771f94` | Tokens、组件架构、响应式规则和开发交接规范 | MIT，保留 LICENSE |
| ux-researcher-designer | 同上 | 用户流程、journey mapping、原型可用性任务与研究计划 | MIT，保留 LICENSE |

安装位置分别为 `C:\Users\15049\.codex\skills\impeccable`、`C:\Users\15049\.codex\skills\ui-design-system`、`C:\Users\15049\.codex\skills\ux-researcher-designer`。使用官方 skill-installer，下载固定 commit 对应的独立 skill 目录，没有安装整库。下一个对话回合可加载新增 skills；如果客户端没有刷新技能目录，开启新任务以重新加载。

## 搜索与选择依据

搜索了 GitHub 中 UI/design system/prototype/UX flow skills。查看主仓库、提交与工作流、许可证、SKILL.md、关键参考文件与可执行脚本。GitHub 公共页面检查时 Impeccable 显示约 74.6k stars / 1960 commits，claude-skills 显示约 27.4k stars；这些仅是当时页面快照，不作为质量保证。两库均有测试或 CI 文件，本轮没有执行它们的完整仓库测试，也没有独立确认所有 CI 当前均绿。主要维护归属为 pbakaus 与 alirezarezvani；未把仓库拥有者等同于每个文件的唯一作者。

`gh` 未登录、公共 API 限流，Git HTTPS 在当前 Windows schannel 环境发生凭据错误；随后使用公开 GitHub 页面及 codeload 下载完成审阅与固定版本安装，无需账号登录。仓库页面 currentOid 提供了固定 commit。安装后逐文件 SHA-256 与先前审阅的 main 下载内容比较，全部一致。

可复用优势与明确局限：

- Impeccable 提供系统化的 typography/layout/critique 工作法，适合纠正模板感和视觉层级。局限是偏 Web/前端工作流，不能代替 Figma 编辑能力；当前版启动器首次使用可能从 GitHub release 下载并校验 Windows 二进制引擎。已阅读启动器的下载与校验逻辑，但没有下载或运行引擎；Windows 实际运行能力仍未验证。
- UI Design System 的组件、tokens、响应式和 handoff 参考结构可复用。局限是默认字体、比例、颜色生成规则属于通用模板，不能直接当作 START 的定稿风格。脚本头部使用示例与实际 CLI 有差异，实际命令应使用 `--style` 和 `--format`。
- UX Researcher Designer 的研究计划、旅程图和可用性测试框架可帮助验证产品原型。局限是默认旅程与人物模板偏通用/B2B，persona CLI 使用内置虚构样本；生成的人名、人口特征、confidence 等绝不能写成 START 的真实用户研究结论。它不是一个可以直接生成可编辑 Figma 原型的连接器。

未安装候选：`richhemsley3/claude-design-skills` 的 wireframe/flow 方向相关，但本次查看仅有 1 commit / 1 star，未获得足够的维护、测试和实际使用证据，暂不采用；并非仅因为低 star 而拒绝。`apple-hig-expert` 偏原生 Apple 平台且突出 Liquid Glass，与当前 Mobile Web 和已锁定视觉边界不匹配。已经存在的 frontend-design / ui-ux-pro-max / Figma / Product Design 保留，不重复安装。

## 验证

1. 三个目录均有独立 SKILL.md；所有安装源文件与审阅源文件 SHA-256 一致；所有 Python 源文件 AST 语法检查通过；原始许可证已保留。
2. design_token_generator 示例执行通过，输出可解析 JSON 且包含 colors / typography / spacing / breakpoints。首次按旧文档传入位置参数失败，改用脚本实际支持的参数后通过；未修改或削弱上游实现。
3. persona_generator 的 `json --sample` 示例执行通过，输出可解析 JSON，内置样本数量为 30；这只证明脚本示例能够运行，不代表 START 用户研究通过。
4. Impeccable 外部引擎、完整仓库测试、Figma 联通与真实产品设计输出未验证。

逐文件哈希、固定 commit 和测试范围见 INSTALL_MANIFEST.json。`ui-design-system-sample.json` 与 `ux-researcher-designer-sample.json` 均为安装验证样本，不是正式产品资产。

## START 后续使用规则

优先使用 UX 框架组织已锁定需求与原型验收，再用 UI Design System 整理设计规范，用 Impeccable 做排版与一致性审查。最新用户参考图、年轻旅行杂志、摊开书页、轻盈手绘、搜索焦点和已通过 Phase B 结构优先于任何 skill 默认模板。Figma 仍是正式产品 UI source of truth；这些 skills 不解除 Figma 额度，不替代其连接器，不授权下一阶段编码或 API integration。
