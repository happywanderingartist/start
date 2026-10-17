# 免费托管与本地高德凭据核对 · 2026-10-07

搜索入口：GitHub ripienaar/free-for-dev（约139k星）；优势是汇集免费服务，局限是目录可能滞后，不能作为实时价格或服务承诺。以各平台官方文档重新核对，不复制目录中的部署代码。

候选：
- 腾讯 CloudBase PG 免费体验版：1个环境，每月3000资源点，6个月；不是永久免费，账号资格与环境能力要核验。适合优先验证微信和国内部署。https://cloud.tencent.com/product/tcbs
- Supabase Free：PostgreSQL、认证和存储免费额度，可用于早期验证；配额、休眠和备份条件见官方价格页，国内访问与微信接入需实测。https://supabase.com/pricing
- Render 免费 Web：可部署 Node；15分钟无请求会休眠，冷启动约1分钟。免费PostgreSQL 30天到期，不能用于长期保存 START 数据。https://render.com/docs/free
- Cloudflare Workers Free：每日100000请求额度；不是常规 Node 虚拟机，也不附带 PostgreSQL，需要运行时适配和独立数据库。https://developers.cloudflare.com/workers/platform/limits/

GitHub目录：https://github.com/ripienaar/free-for-dev 。GitHub Pages只能托管静态页面，不能单独承担账号、审核、数据库和私有照片后台。

本地核对：当前进程和用户环境都有 AMAP_WEB_SERVICE_KEY。搜索范围包括原项目、Open Design数据目录及 D:/AI-Data/Projects 的常见配置文件；未找到 AMAP JS API Key 或 securityJsCode 配置。未输出密钥值；不能断言其他未检查目录没有。上一轮此 Web服务Key已真实请求成功，不需用户重新提供。

用户下一步：查看高德应用的服务平台是否还有 Web端（JS API）Key；如已保存，提供路径即可。若只有 Web服务，在原应用下添加 JS API Key 和对应安全密钥，后续由代理保存至 D 盘私有配置，禁止提交Git。云端先核验腾讯账号免费环境资格与PG兼容性，不购买套餐；若只做本地地图，不要求现在开通云服务。

高德官方准备指南：https://lbs.amap.com/api/javascript-api-v2/prerequisites 。本轮未修改代码、密钥或云资源。