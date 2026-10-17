# 路线新站点投稿：实现及验收

本记录优先于 INTEGRATION_UPDATE_2026-10-14.md 中“路线必须先收录地点”的旧结论。

## 已实现
路线表单使用可视站点列表，从高德选点追加已有或全新地点，支持上移、下移、移除及同 POI 去重，最多 30 站。新地点可填写类别、打卡同款及来源；站点来源为空时沿用路线来源。无需输入内部地点 ID，路线名称不会被站点名称覆盖。文字识别候选的城市会带入地图核对，地点关闭等原文警示保留展示。

接口兼容原 placeIds 格式，新增 stops 格式；只允许二者之一。新站点必须包含 POI、GCJ02 经纬度、名称、城市、类别和来源。既有站点必须仍公开。

提交后地点与路线均待审，不提前生成公开记录。管理员明确核对并批准后，在同一数据库事务内处理子地点投稿、独立艺人证据与路线公开。已有 POI 复用原地点，不覆盖原地点名称；不同引用最终解析为同一个地点时拒绝重复路线。任何一步失败，地点、子投稿、通知和路线一并回滚。重复审批不重复新增。

## GitHub 调研与方案
agent-reach 的 gh 搜索路径因本机未认证不可用，改用公开 GitHub 网页搜索和仓库页面，无需用户提供 token。

- perliedman/leaflet-routing-machine：Per Liedman 维护，约 1.2k 星，ISC；README 明确声明 barely maintained。查看 README、commits 页面、Leaflet 官方插件登记与实际 usage；spec 页面读取失败，未把其测试情况算作已验证。可借鉴地图选点、途经点增删和顺序表达；维护不足及默认 demo 后端不可依赖是明确局限。本轮不安装、不复制代码。
- brianc/node-postgres：Brian Carlson / contributors，约 13.2k 星，MIT；查看仓库测试运行说明和官方仓库事务文档。优势是同一个 client 的 BEGIN/COMMIT/ROLLBACK，可验证全部成功或全部回滚；局限是库本身不提供业务审批、去重和幂等，这些必须由本项目实现。使用既有依赖和事务层。提交页面缓存不能证明当天最新提交，未据此宣称实时维护状态。

参考：https://github.com/perliedman/leaflet-routing-machine 、https://github.com/perliedman/leaflet-routing-machine/commits/master/ 、https://github.com/Leaflet/Leaflet/blob/main/docs/_plugins/routing/leaflet-routing-machine.md 、https://github.com/brianc/node-postgres 、https://github.com/brianc/node-postgres/blob/master/docs/pages/features/transactions.mdx 。

## 验证
先加入接受混合站点的合同测试，观察 INVALID_INPUT 失败；浏览器站点列表测试也先观察未显示新站点而超时，再实现修复。

最终 acceptance.mjs：九组中八组通过，local-smoke 仍因 Open Design 指定旧工作区预览未恢复失败。平台测试 54 项通过；私人浏览器 31 项通过，包括六种宽度、地图消息校验、候选原文约束、新站点追加、去重、排序、来源继承、失败保留草稿。真实服务重启后 public-preview-smoke 四项通过。浏览器选点采用隔离地图传输 fixture，不能替代真实 SDK、真机 GPS 或微信身份验收。

证据：evidence/ACCEPTANCE_RUN.json、READINESS.json、acceptance-platform.log、PRIVATE_BROWSER_ACCEPTANCE.json、ROUTE_STOPS_390.png。

## 剩余边界
主服务已载入新代码，但真实身份仍未配置，正式页面的个人写入与识别请求继续按预期拒绝；测试身份仅存在于隔离测试服务。未连接云、未购买资源、未合并主工程。Open Design 的工作目录由用户选择后，旧项目预览仍需单独核对，不能将浏览器 onboarding 状态等同于桌面配置未保存。

当前不需要用户再提供密钥或付费服务。真机定位和第三方导航调起需要后续在实际手机上验收；真实微信身份与云部署按既有阶段边界另行处理。
