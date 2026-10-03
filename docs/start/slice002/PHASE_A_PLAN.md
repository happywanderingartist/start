# Phase A 执行方案

本轮只授权 07 brief Phase A；Phase B/C/D 不执行。新包 00–09 顺序已读，context 四文档完整读取，37 张参考图已通过 contact sheet 检视（26原素材、11最新参考，含重复）。源优先级严格按00。灰阶用白/灰/黑、系统字体临时角色，不定最终字体、不复制人物素材，不创建正式 Figma。原型是阶段性验证，不替代将来正式 Figma source of truth。

现有 linked worktree 复用，新分支 feature/start-slice-002-phase-a 从 bb0c092 建立；feature/start-slice-001 保留原HEAD。旧 src/三个旧工作区、schema/API/fixture 文件不改。新内容只在 prototypes/discovery-wireframe、docs/start/slice002、evidence/slice002；原型监听 localhost。批准文档只作为规格，包中后续B/C/D不构成本轮授权。

1. 固定输入 hash、Git/合同基线及成熟参考；2. 先写浏览器行为/尺寸测试并观察失败，再实现五页与轻量状态；3. 390/320五页，768五页，1280 Artist/Route/Place截图及关键状态；4. 按08逐项自查、修复、回归并记录偏差；5. 提交，停在A，不进行独立UX Phase B。

共用 semantic rows、index、mini-info、text CTA/native dialog。390边距24、320边距16、44px点击范围；五页分别以输入/选择/城市章节/站点Trace/实用信息为核心。无表面装饰/彩色/Hero/card wall。Search结果不显示核验、证据、距离时长/站数；信息留详情。Source一点击、Verification第二层；Start显示003延期状态，不生成Journey。

Ruling：brief允许synthetic non-public fixture，因此用既有001测试身份/字段构造并校验现有DTO的私有原型数据，多城市/5站为额外合成layout pressure数据；不连生产API、不运行seed/migration。Search延迟/错误状态由独立原型场景驱动，不称真搜索/正式集成。Photo Spot/Angle等API无专用字段，以独立presentation空数据占位而不改合同，列为D前的兼容性发现。Event轻弹层，导航Community/Me提示未交付，不新建页。未发现阻塞Phase A的产品决策。

回归发现并允许的单文件例外：当前分支 vite.config.mjs 排除 .context/** 生成的恢复副本，避免 Vitest 将另一个 Node-test 快照当成 jsdom suite；真实 src/tests、断言、恢复材料均不删不改，旧三个工作区没有改写。这是测试发现范围修复，不是缩减测试来伪装通过。
