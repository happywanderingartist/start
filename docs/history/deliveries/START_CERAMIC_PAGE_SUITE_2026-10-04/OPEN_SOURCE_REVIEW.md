# 开源参照记录

2026-10-04。按照用户 GitHub 先行要求，搜索范围为“offline maps bookmarks / Organic Maps search bookmarks license tests”。agent-reach 开发路径的 gh search repos 因 GitHub CLI 未登录失败，随后使用公开 GitHub 页面和公开 API 只读核对，无代码克隆或复用。

候选：[Organic Maps](https://github.com/organicmaps/organicmaps)。公开 API 读取星标15,566，所有者 organicmaps，pushed_at 2026-10-03T18:06:49Z，最新提交3f26ce8979f044f14664d3a1e88160e105110bb6，提交日期2026-10-02T19:26:47Z。星标仅为筛选信号，不是质量证明。

README 说明由 MapsWithMe 创始人与开源社区维护，面向实际 Android/iOS 离线地图使用，具有地点搜索、书签/轨迹和步行导航能力。文档声明源代码 Apache-2.0，数据文件单独授权；GitHub API license 字段为 NOASSERTION，未据此推断整仓单一许可证。没有执行其测试。仓库CLAUDE.md描述分类/地图测试约定与子系统团队，此次只检查文档，不把测试通过当成既定事实。

可复用优势：搜索、地点、路线与收藏之间有清晰任务衔接，可作为页面职责分离的参照。明确局限：本次资料未提供艺人关系、粉丝社群与证据核验模型，不能覆盖 START 的信任流程；离线导航引擎也超出本次静态页面范围。方案因此只借鉴通用信息结构，界面、角色、配色仍基于用户确认稿，START特有边界遵照本地规格。未使用 Organic Maps 代码、地图二进制数据或界面资产。

来源：[仓库README](https://github.com/organicmaps/organicmaps/blob/master/README.md)、[数据许可](https://github.com/organicmaps/organicmaps/blob/master/DATA_LICENSE.txt)、[开发文档](https://github.com/organicmaps/organicmaps/blob/master/CLAUDE.md)。

