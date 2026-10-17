# START 高德接入与云端架构调研 · 2026-10-07

## 本轮结果

现有 AMAP_WEB_SERVICE_KEY 成功请求高德 v5 地点搜索，返回 status=1、infocode=10000，取得杭州东站 1 条 POI。未记录 Key、完整请求 URL 或用户位置。此结果证明 Web 服务接口当前可调用，不证明 JS API 地图已嵌入、额度足够或手机定位/导航已验收。

旧工作区 .worktrees/fan-route-v0.2 中的 worker/map/amap.js、worker/api.js 与 src/api/mapClient.ts 可复用。现有高德适配器与地图 API 回归测试 27/27 通过。保留旧目录和最新原型，未改动业务代码、数据库或云环境。

当前最新原型 server.mjs 明确拒绝 /api/ 路径，页面仍使用合成示例。不能因旧适配器存在就宣称当前首页与社群接入了真实地图。

## GitHub 审阅

使用 agent-reach 的 GitHub CLI 路由；gh 未登录，公开 API 元数据请求亦失败，改为 GitHub 公开网页与官方文档。agent-reach 命令未在当前 PATH 中找到，未能检查工具更新。以下星标为网页快照，不作为质量证明；未下载或复制参考代码。

| 项目 | 维护/许可证/测试证据 | 可复用优势 | 局限 |
| --- | --- | --- | --- |
| supabase/supabase | Supabase 团队，约111k星，主仓库 Apache-2.0；审阅 docker/docker-compose.yml 与 supabase-js/docs/TESTING.md，包含多个服务和 SDK 测试方法；公开 API 无法确认即时最后提交 | PostgreSQL 主数据、Auth、Storage、权限和服务分工，部署配置与应用代码分离 | 自托管需管理多个容器、升级和备份；不是直接可上线的 START，也不自动解决微信身份和业务审批 |
| brianc/node-postgres | Brian Carlson，约13.2k星，MIT；提交页可见2026-08维护活动，不能视为即时最后提交；README说明带真实数据库/SSL的测试 | 已有 pg 依赖的连接池、参数查询、事务；保留 SQL 迁移和 Node 后端 | 只是数据库驱动，不包含账号、上传、审核、社群等业务 |
| TencentCloudBase/node-sdk | 腾讯官方组织示例接入依据；约26星，package.json 声明 MIT；有 Jest/coverage 和 Mocha 测试脚本；未运行这些上游测试，最后提交未实时核定 | 官方身份、存储、函数 SDK 使用方式和容器/云能力接入 | 属于接入参考而非成熟完整应用，文档数据库接口不能当 PostgreSQL 驱动；正式迁移与服务许可另核 |
| AMap-Web/amap-skills | 高德官方组织的 JSAPI 文档与技能参考，约178星；完整 LICENSE/自动测试未核定，不复制其代码 | 地图加载顺序、容器生命周期、安全密钥代理规则 | 文档包不等于生产地图应用；成熟性不足以替代高德官方文档与自己的回归测试 |

未找到能直接替代 START「艺人地点＋社群＋演出＋物料」的完整生产项目。采用成熟基础设施和官方接入方式，自己的领域服务负责审批、私人资料和跨页面同步。

来源：https://github.com/supabase/supabase ，https://github.com/supabase/supabase/blob/master/docker/docker-compose.yml ，https://github.com/supabase/supabase-js/blob/master/docs/TESTING.md ，https://github.com/brianc/node-postgres ，https://github.com/brianc/node-postgres/commits/master/ ，https://github.com/TencentCloudBase/node-sdk/blob/master/package.json ，https://github.com/AMap-Web/amap-skills 。

## 高德接入方案

服务端 Web 服务 Key 用于地点搜索、地点核对和路段规划，不发送给浏览器。地图提供方 POI 与 START 的 placeId 分开，通过 provider reference 关联；高德搜索命中不等于平台审核通过或艺人到访证据。

Web 内嵌地图需要 Web端（JS API）Key 与安全密钥。已检查当前环境只发现 Web 服务 Key；已向用户请求 JS API 配置路径，不能把 Web 服务 Key 当成 JS API Key。安全密钥优先服务端代理，浏览器使用 serviceHost；遵循高德固定代理路径及允许端点，禁止做任意 URL 代理。

保留 GCJ-02 标识。GPS WGS84 坐标不能直接当 GCJ-02 使用；定位由用户触发，拒绝后允许手动选择城市和地点，不将定位作为打卡门槛。列表和地图选择同一 placeId，地图只标已公开地点；高德候选结果用于投稿选址，经过平台审批才进公开目录。

导航使用高德官方 URI 入口，未安装 App 时按官方能力回落 Web；实际手机调起、浏览器和微信环境仍需真机验收。不造导航引擎，不用合成坐标冒充真实地点。

优先集成到已确认页面，保持首页布局与色卡；新增状态或视觉变动先用 Interaction Design、Apple Design、Hallmark 优化并提交视觉确认，Open Design 用于展示。凭据准备前不把静态绘制地图换成声称真实可用的地图。

来源：https://lbs.amap.com/api/javascript-api-v2/guide/abc/jscode ，https://lbs.amap.com/api/uri-api/summary ，https://lbs.amap.com/api/uri-api/guide/mobile-web/point 。

## 云端方案选择

优先验证腾讯云 CloudBase for Supabase（PG 模式），作为后端服务而非先购买裸服务器。官方提供 PostgreSQL、身份、对象存储、函数、RLS；可以减少自行维护服务器、数据库和文件系统。仍保留 START 的业务层，投稿审批和交换联系方式不开放成客户端任意写表。

适配门槛：核对目标账号可用性、国内地域、Node 后端部署/直接连接方式、SQL版本、现有角色与迁移权限、连接池限制、对象存储私有读取和备份恢复。当前本地 PostgreSQL 18.6，不默认云端版本一致或可直接按全量 dump 恢复。现有服务兼容性不满足时，备选腾讯云 CloudBase Run 托管 Node API + 腾讯云托管 PostgreSQL + COS 私有存储。

官方页面显示个人版19.9元/月、标准版179.1元/月及资源点额度。此为2026-10-07公开套餐展示，不是 START 总费用报价；数据库计算、容量、图片下载/CDN、函数、地图调用等需核算，免费资格亦依账号。不承诺固定费用、永久免费或购买后无需业务开发。

不推荐第一版用一台廉价 VPS 自托管整套 Supabase：学习与备份、升级、TLS、监控的运维负担偏高。裸服务器不是必须选项；只有明确需要自行维护运行环境时再比较 CVM/轻量服务器。

来源：https://cloud.tencent.com/product/tcbs ，https://cloud.tencent.com/product/tcbr ，https://cloud.tencent.com/product/postgres ，https://cloud.tencent.com/product/cos ，https://supabase.com/docs/guides/self-hosting/docker 。

## 执行顺序与验收

1. 高德优先于微信登录推进；复用旧适配器，新增当前原型服务接入时在隔离目录开发，先写失败测试验证密钥不外泄、超时、输入校验与错误状态。
2. 取得 JS API 凭据后将真实地图接入已确认地点列表/详情，验证缩放、标记、列表联动、重复进入后的地图销毁，以及窄屏画幅；手动选城和拒绝定位可继续使用。
3. 联调高德导航 URI，分别记录 Web 验证和真机调起结果，不能互相代替。
4. 验证 CloudBase PG 兼容性与费用；缺账号访问前只做本地兼容测试和部署配置草案，不购买或公开部署。
5. 向用户提交具体资源组合、月费用估算和备份策略后才开通付费环境；继续沿用此前已确认的业务规则。

本轮状态：GitHub/官方文档调研完成；高德 Web 服务实时可用且既有测试通过；当前原型地图尚未嵌入，需 JS API 凭据；云平台为推荐候选，未开通和部署。