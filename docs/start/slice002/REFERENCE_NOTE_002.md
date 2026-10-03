# REFERENCE_NOTE_002 — Discovery Wireframe

GitHub CLI未认证，按agent-reach/dev使用官方GitHub API只读固定快照和网页搜索；精确commit/star/owner/license与实际读取范围见reference-pins.json。两项目都MIT，仅学习Pattern，不安装、不fork、不复制实现；未运行项目完整测试，不把star当质量证明。

[Radix Primitives](https://github.com/radix-ui/primitives)：dialog.tsx中的trigger/content refs、关闭焦点回归、Escape/外部交互边界及philosophy可访问性原则。优势：弹层生命周期和语义与视觉分离；局限：完整React依赖/portal和复杂组件链不适合本阶段轻量静态原型，且不能证明本产品Sheet布局。START使用native dialog showModal、明确title、44px关闭、遮罩关闭、Escape和回到原触发器，不复写焦点陷阱或导入大组件库。

[React Router](https://github.com/remix-run/react-router)：ScrollRestoration文档和dom/lib.tsx恢复逻辑入口。优势：按history entry存滚动位置、区分push和pop，避免丢查询/返回位置；局限：原框架集成要求和服务端脚本不是本原型环境。START原型沿用浏览器history/session entry与显式恢复，仅私有原型使用；正式D接入既有React Router须单独按批准设计实现。

实施前验收：精确Artist仍由用户选择、query深链接和返回位置一致；中文IME不早提交；dialog焦点/退出/来源层明确；city index点击和滚动同步；Route Stop/Map有关系但无Journey；320无横向页溢出、所有操作至少44px；灰阶及独立示例数据不伪称公开事实。参考素材37图只学习留白/章节/中心与边缘关系，Phase A不移用任何图像、脸、品牌或商业字形。
