# 公开数据前台接入

本批沿用已确认首页的品牌裁切、组合色卡、小尺寸推荐卡、分类列表、Community/Me导航。旧原型不覆盖；新增 public-ui/index.html、public.js、public.css、build-public.mjs、tests/public-browser-acceptance.mjs，扩展 src/static.mjs 和 acceptance.mjs。

GitHub 先行核对（2026-10-08）：gh 未登录，改用官方 GitHub 页面搜索、读取 https://github.com/payloadcms/payload 、commits/main、test、LICENSE.md 和 docs/versions/drafts.mdx；当前页面显示45.1k stars、16095 commits，提交页有分页维护记录，测试目录和 MIT 许可证可见，维护方 Payload CMS。星标不是质量证明。可复用优势：公开读接口只展示发布版本，编辑草稿不污染前台；局限：Payload依赖完整 Next.js 框架，直接迁移会扩大范围，本批只借鉴边界、不复制其代码。当前读取的提交页面存在抓取缓存，不作为精确最新提交时间证明。

前台直接读取统一 API，不保留固定艺人、固定地点或数据库为空时的演示回填。URL保存城市、艺人、分类、搜索条件；详情读取真实ID。社区保留明确物料集市分区，演出绑定场馆、物料绑定社群/艺人/演出/地点。未接身份的私人操作不伪装可用，旧私人视觉原型入口保留并明确标示。

Skills：Apple Design（反馈、44px操作目标、导航与reduced-motion）、Hallmark（沿用既有视觉结构、真实内容、色卡克制使用）、Agent Reach（GitHub资料）。Open Design使用已有文件预览能力展示独立副本，不声称可编辑原生画布。

验收：数据库草稿/发布/修改/撤回同步、艺人→城市→分类、独立路线、地点多个艺人、演出场馆与物料关联、未知ID、空库、断网重试、快切请求不覆盖、URL返回恢复、七种宽度、键盘、减少动态。只用隔离测试库生成测试截图；真实库不自动灌入示例。个人写流程、GPS/实际地图/真机/云身份仍单独记录。
