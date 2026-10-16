# ADR 001：模块化单体与垂直业务切片

- 状态：Proposed
- 日期：2026-09-28
- 适用版本：Fan-route v0.3+

## 背景

当前原型按页面、组件、数据和全局状态组织，适合三页演示，但路线搜索、编辑、旅程执行、打卡、记忆和娃娃继续增长后，业务规则会跨多个技术目录散落。当前团队和验证规模不足以承担微服务、跨服务事务和独立部署成本。

## 决策

采用模块化单体。前端按 `discovery`、`route-catalog`、`route-editor`、`journey`、`check-in`、`memories`、`companion` 切分。每个 feature 自己拥有 UI、hooks、services、domain 和测试；`app` 只负责路由与组装；`shared` 只接收至少两个 feature 真实复用的无业务组件或工具。

服务端保持一个部署单元，但地图适配、路线内容、旅程进度、媒体和投稿审核之间通过明确接口连接。网页和未来小程序共享领域契约和 API，不共享页面代码。

## 目录约束

```text
src/
├── app/
├── features/
│   ├── discovery/
│   ├── route-catalog/
│   ├── route-editor/
│   ├── journey/
│   ├── check-in/
│   ├── memories/
│   └── companion/
├── domain/
├── infrastructure/
└── shared/
```

路由页面不得直接调用地图供应商；跨 feature 写入必须经过领域服务；只有一个 feature 使用的工具不得提前上移到 `shared`。

## 结果

优点是用户任务、代码、测试和负责人边界一致，能够逐条纵向交付。代价是短期会存在旧目录与新 feature 并存，迁移必须按功能完成，禁止一次性大重构。

## 拒绝方案

- 继续以页面为中心：会让 Journey、Route 和 Doll 状态再次进入单一全局 Context。
- 立即微服务化：当前没有独立扩缩容、团队边界或发布节奏需求。
- 整体 Fork 旅行产品：领域和许可证不匹配，删除无关功能的成本高于独立实现。

