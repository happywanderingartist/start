# Task 6 验收记录

验收结论：通过。实现提交为 `bfebba2 data: add human-verified anpu nanjing route`。产品负责人明确选择五组候选的第一项；独立审查首轮发现 1 个 Important 与 1 个 Minor，修复后第二轮五层门禁批准。

## 人工确认与真实数据证据

候选由真实高德 Web Service 返回，五组数量依次为 8、10、10、2、10。产品负责人回复“均选择第一项”，对应选择如下：

| 顺序 | 标准名称 | `providerPoiId` | 地址 |
| --- | --- | --- | --- |
| 1 | 古秦淮 | `B00190BTHK` | 秦淮小吃城负一楼（夫子庙地铁站2号口步行170米） |
| 2 | 中国科举博物馆(江南贡院) | `B0KUO6U0QZ` | 贡院街95号 |
| 3 | 夫子庙-古秦淮西牌坊 | `B0FFM6T3AH` | 贡院街152号南京夫子庙 |
| 4 | 南京夫子庙ARTALL爱涛设计酒店 | `B0JA2BDQEX` | 平江府路191号（武定门地铁站3号口步行370米） |
| 5 | 三七八巷 | `B0FFGQ9HIL` | 秦淮区 |

`source → candidates → selections → confirmed seed` 顺序和字段逐项一致。正式种子含 5 个 `verificationStatus: confirmed` 的 Place 和 4 个 `dataStatus: fresh` 的相邻路段，距离/时长依次为 131m/105s、271m/217s、782m/626s、312m/250s；交通汇总为 1496m、1198s，建议总时长为 20 分钟。以上只证明生成时的服务商返回，不等同于实时导航结果。

## 五层门禁

| 门禁 | 结果 | 证据 |
| --- | --- | --- |
| 代码与范围 | 通过 | 变更限于 Task 6 种子生成、服务商限流分类、短期兼容数据层和必要的 nullable 展示；未进入 Task 7。 |
| 需求覆盖 | 通过 | 候选、人工选择、正式种子、CLI 和兼容视图齐备；`minutes`/`meters` 只从真实 RouteLeg 派生。 |
| 数据真实性与安全 | 通过 | 五个选择严格来自对应候选组第一项；未自动推断或替换 POI；32 位十六进制敏感值扫描为 0，仓库仅引用环境变量名。 |
| 异常状态 | 通过 | deadline 主动 abort 且最多重试一次；10021 限流可重试；无缓存失败保持 unavailable/null，兼容页面显示“时长暂不可用”而不是 0。 |
| 回归与交付 | 通过 | 独立复审执行 `pnpm check`，Vitest 38/38、Node 60/60、typecheck 与生产构建通过；`git diff --check` 通过。 |

## 测试先行与审查闭环

Task 6 先以不存在的脚本和旧种子结构形成 RED，再实现候选搜索、严格人工选择、正式 seed 计算和兼容数据层。真实调用过程中复现高德 `infocode: 10021`，新增 RATE_LIMIT 归一化和仅用于 seed CLI 的两次有界尝试；没有把 Mock 结果当作真实地图结果。

首轮独立审查发现：完整合法的 unavailable seed 会因 `suggestedTotalMinutes: null` 在兼容层抛错；deadline 包装器的超时缺少 retryable 语义。两个问题均先增加失败测试：前者用三个汇总字段为 null 且通过 `assertRouteBundle` 的完整 seed，后者验证 deadline 总尝试次数严格为 2。修复后聚焦测试和全量检查转绿，第二轮独立复审结论为 Approved，无 Critical、Important 或 Minor。

## 实现调研取舍

实现前审阅了 Ky、p-timeout、Undici、p-retry、Zod 与 TypeBox 的公开实现和测试方式。复用了 AbortSignal 贯穿 fetch、边界运行时校验和只重试 retryable 错误的设计；这些库覆盖通用重试、流、schema 组合等更大范围，本任务已有窄接口和验证器，因此未新增依赖。

## 遗留边界

五个 POI 实体和四段地图指标已确认，但地点故事、图片、开放时间、入口与停留时长仍未核验；当前 `suggestedStayMinutes` 均为 0，所以 20 分钟仅由交通时长计算。尚未执行真实设备外部导航或用户测试，也没有把本次生成结果描述为持续实时更新的数据。
