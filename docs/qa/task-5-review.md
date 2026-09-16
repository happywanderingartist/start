# Task 5 验收记录

验收结论：通过。实现提交为 `ea5f619 feat: expose verified map APIs through worker`。独立审查经历两轮阻塞修复，第三轮复审批准。

## 五层门禁

| 门禁 | 结果 | 证据 |
| --- | --- | --- |
| 需求与 HTTP 合同 | 通过 | 四个 `/api` 路由均返回 JSON；未知 `/api` 和 `/api/*` 返回 JSON 404，不进入 SPA；静态资源及前端路由 fallback 保持。 |
| 用户功能语义 | 通过 | 路线只接受 2–20 个服务端已确认 Place ID；精确幂等重试复用原结果；陈旧或并发竞争编辑返回 409，不覆盖较新版本。 |
| 数据真实性与安全 | 通过 | `/places/confirm` 重新查询服务商并忽略客户端坐标；路线只解析 Worker 服务端确认存储，旧路段只从服务端版本存储读取。未写入真实 POI、距离或时长，测试 fixture 不作为地图证据。 |
| 工程质量与异常 | 通过 | provider deadline 覆盖 fetch 与响应体解析完整生命周期；超时、限流、缺 Key、错误 method/body、畸形路线参数、无 Cache API 均有安全行为，错误不泄露 Key、上游 URL、cause 或 stack。 |
| 交付与回归 | 通过 | Task 5 代码范围仅为 `worker/api.js`、`worker/index.js`、`tests/map-api-worker.test.mjs`、`tests/sites-worker.test.mjs`；独立终审无 Critical/Important。 |

## 测试先行与审查闭环

初始 RED 为缺少 `worker/api.js` 且 `createWorker` 未导出。首次实现后聚焦 12/12、全量检查通过，但独立审查发现 4 个 Important：客户端可伪造 confirmed Place、空/单点路线成功、畸形参数落成 500、缺少主动超时；另有 `/api` 根路径与无 Cache API 两项 Minor。修复后路线改为服务端确认 Place ID 与服务端路线版本，聚焦测试扩展到 17 项。

第二轮审查发现陈旧 `baseVersion` 可覆盖同版本结果，且 timeout 在 `fetch()` 返回后提前清理。新增 RED 分别得到错误的 200 和 `still-pending`；修复后 current-version 指针与同步 reservation 提供 CAS 语义，精确重试在冲突检查前复用结果，deadline 覆盖适配器完整操作。新增不同编辑并发测试后，聚焦测试为 19/19。第三轮独立复审结论为 Approved。

## 提交前复验

- `node --test tests/map-api-worker.test.mjs tests/sites-worker.test.mjs`：19/19 通过。
- `pnpm check`：退出码 0；`tsc --noEmit` 通过，Vitest 36/36 通过，Vite 生产构建通过，Worker 40/40 通过。
- `git diff --check`：通过。
- 敏感信息扫描：唯一命中为测试哨兵字符串 `task-five-key-must-never-leak`；未发现真实密钥赋值或带 Key 的上游 URL。

## 遗留边界

确认地点、路线版本与幂等结果存储在同一 Worker 实例内存或注入存储中，跨实例持久化不在 Task 5 范围。终审记录了一个非阻塞 Minor：没有独立命名的“重算失败释放 reservation”仓库测试，但审查代理已用只读临时复现确认失败后恢复 base version 且可重试。Task 5 只证明离线合同与注入式测试通过，不代表真实高德 Key、真实 POI、真实距离/时长或端到端地图闭环已经完成。
