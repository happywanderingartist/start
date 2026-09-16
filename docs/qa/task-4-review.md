# Task 4 验收记录

验收结论：通过。实现提交为 `98919df feat: calculate and selectively refresh route legs`，独立审查在一次修复与复审后批准。

## 五层门禁

| 门禁 | 结果 | 证据 |
| --- | --- | --- |
| 需求与接口 | 通过 | 实现步行优先、严格大于 1800 秒或 2000 米时评估公交、最终方式汇总、相邻路段差集、局部重算与规定缓存 TTL。 |
| 用户功能语义 | 通过 | 未变化路段保留原 `computedAt`；同幂等键串行或并发重复提交只计算一次并只增加一个版本。 |
| 数据真实性与降级 | 通过 | 未接入真实网络、未写入 POI 或估算指标；服务商失败时仅使用已有成功缓存，否则返回距离和时长为 `null` 的 `unavailable` 路段。 |
| 工程质量 | 通过 | 缓存键包含接口类型、起终点服务商 POI 和方式；并发请求共享 in-flight Promise，失败后清理幂等键以允许重试。 |
| 交付与回归 | 通过 | 差异仅含 `worker/map/cache.js`、`worker/route/calculate.js`、`tests/route-calculation.test.mjs`；独立复审未发现 Critical 或 Important 问题。 |

## 测试先行与审查修复

初始 RED 为缺少 `worker/map/cache.js` 的 `ERR_MODULE_NOT_FOUND`；实现后聚焦测试 5/5 通过。首次独立审查发现并发幂等竞态：修复前新增回归测试得到 `2 !== 1`，证明同键并发触发两次 `planLeg`；修复后测试验证只调用一次并返回同一结果。审查同时指出缓存失败回退测试提前命中缓存，修复后明确覆盖“首次 miss、服务商失败、二次读取成功缓存”的分支。复审结论为 Approved。

## 提交前复验

- `node --test tests/route-calculation.test.mjs`：6/6 通过。
- `pnpm check`：退出码 0；`tsc --noEmit` 通过，Vitest 36/36 通过，Vite 生产构建通过，Worker 测试 26/26 通过。
- `git diff --check`：通过。
- 敏感词与数据扫描：Task 4 文件未包含 `AMAP_WEB_SERVICE_KEY`、待核验种子标记或真实 POI 内容；扫描命令因零匹配返回 1，属于预期的“未发现”结果。

## 遗留边界

幂等结果默认保存在 Worker 进程内存或注入存储中，跨进程重启持久化不属于 Task 4；Task 5 负责 HTTP API 与运行时依赖接线。Task 4 没有声称完成真实地图接入，也没有生成或验证任何 POI、距离、时长或用户测试结果。
