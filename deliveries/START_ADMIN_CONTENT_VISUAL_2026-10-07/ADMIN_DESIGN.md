# START 平台管理员内容建设 · 本批视觉设计
阶段：新后台视觉稿，等待本批确认；保留现有基础 Node/PostgreSQL 后端，未实现管理权限或写库。已确认艺人/城市/社群用户端视觉稿于本轮标记通过，审批不跨批。

## 本批流程
内容列表 → 编辑地点、路线或演出 → 图片替换/封面选择 → 保存草稿 → 前台预览 → 发布检查。用户投稿另走审阅、退回补充、通过流程；平台管理员可自行建设，不必伪装为用户投稿。
六个重点页面：内容库、地点编辑、路线编辑、演出编辑、素材库、投稿审核。艺人/社群/首页配置属后续编辑扩展，菜单明确标记不声称完成。
演示状态仅页面内存；刷新重置，无账号、无真实上传、无永久保存、无真实发布或数据写入。图片选择在浏览器本地预览，不发送文件，不改原图片。失败、未核验、空状态显式显示。

## 内容模型与权限
Place保存地点名、城市、分类、地址、已核验POI与GCJ02坐标；公开位置不靠手写无来源坐标。艺人关系独立为PlaceArtistContribution；同一地点可关联多艺人，一份投稿只选一艺人。RouteStop通过placeId引用地点并保留顺序；路线主题不等于全部站点艺人曾到访。Event独立记录艺人、时间、场馆placeId及来源；场馆不是交换集合点。
图片库仅管理可公开内容素材。图片标题、替代文本、来源/授权、封面与引用项需要记录；删除被引用素材不能破坏公开内容，优先停用/替换。私密Book/打卡照片与联系方式不混入平台素材库。
发布流程保留已发布版本：修订先存草稿，公开端保持旧版，预览查询受权草稿，发布后切换版本并统一刷新相关缓存。回退也形成新修订和审计。审核投稿/管理员自建共用验证与公共实体服务，权限由服务端强制，不能依靠前端隐藏。
平台管理员可建设和审核公共资料；社群管理员仅简介/公告/成员。社群artistId唯一。物料发布状态由发布者自选，不跟踪完成，不因演出变更通知发布者或自动更改物料状态。

## GitHub参考审阅
GitHub CLI因未登录不可用，使用公共GitHub页面和官方文档回退，未要求新登录或下载未经审阅代码。
Payload（payloadcms维护，仓库页面约45.1k星，MIT）：草稿/版本与前台预览是可复用优势；其完整Next.js CMS及身份/数据迁移与现有基础不是直接替换关系，START的贡献审核和关系约束需要自建。仓库有test目录、Vitest/Playwright脚本和贡献测试指南，官网模板说明实际运行；未执行上游测试。提交页面快照可见2026-09-10测试维护，缓存页面不能证明今天最后提交。
Strapi（strapi维护，仓库页面约73.3k星）：可复用媒体选择、替换和元数据编辑体验；复杂权限/版本功能需核对具体版本与授权，不能默认全免费；业务模块仍需独立设计。未运行上游测试，未核验当天最后提交，许可证细分暂不作为选型定案。
本批选择：借鉴工作流，继续现有Node/PostgreSQL架构；不安装CMS或更改数据库。
来源：https://github.com/payloadcms/payload
https://github.com/payloadcms/payload/blob/main/LICENSE.md
https://github.com/payloadcms/payload/blob/main/CONTRIBUTING.md
https://github.com/payloadcms/payload/blob/main/templates/website/README.md
https://github.com/payloadcms/payload/blob/main/docs/versions/drafts.mdx
https://github.com/payloadcms/payload/commits/main/
https://github.com/strapi/strapi
https://docs.strapi.io/cms/features/media-library

## UI与验证
Interaction Design确定任务和反馈；Apple Design用于连续编辑、即时按压与明确焦点；Hallmark继承系统字体与组合色卡，采用侧栏/清晰列表/编辑工作区而不是数据大屏或虚构指标。
桌面为管理主场景，1440宽验证完整编辑；兼顾320/375/390/414/768/834；检查无溢出、表单键盘、图片选择、路线顺序、草稿预览、退回理由、失败和减少动效。工作区Open Design独立目录导入与预览另验证。
完成标准分开记录：视觉稿已生成/已验证/用户已确认；业务代码、数据库、真实账号、云存储及上线各自另验收。
## 地图选点修订（2026-10-07）
GitHub 参考：https://github.com/visgl/react-google-maps 及 examples/autocomplete/src/app.tsx。vis.gl 维护、MIT、仓库含 examples、Jest 配置与测试目录；当前检索未返回可靠星标数量，提交页读取失败，最新提交时间未核实。可复用优势：搜索候选、地图标记、选中结果与视口保持一致；局限：Google Maps + React，不能直接用于本项目的高德与原生脚本，不移植未经审阅的代码。
本稿复用已运行的 4325 高德服务，由 4327 只读代理固定白名单端点。独立选点框默认地图搜索，城市与关键词查询真实 POI，明确选择后加入路线；按高德 POI ID 复用记录。同名但未关联 POI 的参考点不自动合并。新的 POI 仅成为本页草稿，不自动获得艺人到访标签、不公开发布、不写数据库。
