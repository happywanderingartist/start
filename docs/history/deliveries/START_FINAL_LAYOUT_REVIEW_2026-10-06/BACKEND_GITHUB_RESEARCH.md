# START 后端与微信小程序调研 · 2026-10-06

结论：发布小程序与部署后端是两件事。云开发可托管计算、数据库和照片存储，开发者不用管理传统服务器，但仍须开通环境、部署程序、配置身份与权限、处理账单。现有 PostgreSQL 基础应先验证，避免为了小程序改成另一套不兼容数据库。

## GitHub 审阅

Agent Reach 的 GitHub CLI 路由未登录，公开 API 请求亦未成功；改用官方 GitHub 网页和官方文档。未下载、安装或复制项目代码；没有把示例当作生产就绪产品。

| 项目 | 维护与许可/测试证据 | 可复用优势 | 明确局限 |
| --- | --- | --- | --- |
| [node-postgres](https://github.com/brianc/node-postgres) | brianc/Brian Carlson；页面约 13.2k stars，MIT；README 要求带测试并介绍真实 PostgreSQL/SSL 测试环境；2026 年 PR 有维护活动，实时最后提交未取得 | 参数化查询、连接池，适合现有 Node 后端与 PostgreSQL | 是驱动，账号、审核、媒体、业务接口及权限仍由 START 实现 |
| [Supabase](https://github.com/supabase/supabase) | Supabase 团队；组织页显示约 111k stars、2026-10-06 更新；主仓库 Apache-2.0，组成服务许可另审；官方数据库测试文档有 pgTAP、策略测试，JS SDK 有单元/集成/Playwright 测试 | PostgreSQL、认证、存储及权限的成熟先例，学习迁移与权限测试 | 自托管包含多个服务；小程序登录映射与国内部署不能凭 Web 示例认定已完成 |
| [tcb-demo-basic](https://github.com/TencentCloudBase/tcb-demo-basic) | 腾讯云 CloudBase 官方组织；约 171 stars；教程展示开发者工具编译、AppID 接入；本轮未确认独立 LICENSE、自动测试覆盖及最新提交 | 学习微信身份、云函数、云存储与工具链接入 | 明确是教学 DEMO，不是可直接上线的 START 后端；不复制许可未确认的代码 |

星标仅作定位，不作为质量证明。没有找到可直接复用的“艺人打卡地点＋演出＋物料集市”完整生产项目，采用成熟基础组件与官方接入方式，保持自己的统一领域模型。

## 微信后端选项

腾讯云 [CloudBase for Supabase 版](https://cloud.tencent.com/product/tcbs) 官方说明以 PostgreSQL 为核心，提供 REST API、RLS、认证等能力；这是优先验证候选，不代表账号环境已经开通。需要检查可用地域、配额、数据库扩展、迁移兼容性、微信登录与角色权限，并验证跨页面数据联通。官方文档另有 [React 访问 PG 示例](https://docs.cloudbase.net/database/framework-quickstarts/pg/react)。

备选为 Node API 部署云托管，加托管 PostgreSQL 和文件存储。官方 [小程序访问云托管](https://docs.cloudbase.net/run/develop/access/mini) 要求小程序关联云环境且服务已部署；[腾讯云 PostgreSQL](https://cloud.tencent.com/product/postgres) 为独立托管数据库能力。正式选型前须验证网络连接、部署地域和总费用，不默认将数据库文件装在临时容器内。

CloudBase 的传统文档数据库、MySQL 与 PostgreSQL 环境并非可直接互换；不同 SDK/环境要根据所选产品使用对应文档。不能将现有 PG SQL 直接用于集合数据库。

[官方计费说明](https://cloud.tencent.com/document/product/876/75213) 有免费体验及套餐/用量约束；[资源点价格](https://cloud.tencent.com/document/product/876/127357) 列出计算、数据库和存储等计量。免费资格和能力依账号/环境，不能承诺小程序上线附赠永久免费服务器；本轮没有购买、开通或部署云资源。

## START 落地顺序

1. 核验并备份现有 D 盘本地数据库，恢复连接并确认迁移历史；不重建覆盖数据。
2. 统一艺人、地点、投稿、同款/机位、演出、社群和物料 ID；每次投稿单艺人，地点累计多艺人关系。
3. 独立测试数据库约束、投稿审核、用户越权和交换状态并发，再接审阅获批的页面。
4. 在目标账号验证 CloudBase PG 环境及微信身份流程，比较费用后确定部署方案；付款或新增权限在具体配置可审阅后处理。
5. 用真机验收登录、照片上传、审核公开、社群列表/地图一致、演出状态与物料交换，再进入正式发布。

补充测试来源：[Supabase 数据库测试](https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/database/testing.mdx)、[SDK 测试](https://github.com/supabase/supabase-js/blob/master/docs/TESTING.md)。上述仅为文档审阅证据，本轮没有运行这些项目测试。
