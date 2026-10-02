# SOURCE_NOTE_CURRENT_SLICE_001.md

本文件仅说明此次 V2 文档包与用户提供的现有 Slice 001 计划之间的关系。

现有计划核心技术方向包括：
- canonical PostgreSQL
- shared public read API
- Modular Monolith
- SearchProvider first implemented on PostgreSQL
- React/TypeScript/Vite retained
- 1A before 1B

本包不否定上述工程安全方向；主要修正的是产品范围与长期接口：
- Search 不能长期 Route-only
- Artist Hub 必须进入近期实体页
- Start Home 必须容纳 recommendation bubbles + Doll
- Route Detail 正式 CTA 必须保留“开始路线 / 分享”
- Slice 001 应被理解为 Discovery Foundation，而不是完整 START 搜索产品体验
