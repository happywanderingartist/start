# ADR 003：地图供应商适配边界

- 状态：Proposed
- 日期：2026-09-28
- 适用版本：Fan-route v0.3+

## 背景

Fan-route 当前以高德作为 POI 和算路标准源，百度只作为导航出口。若页面、Route 数据和 Journey 状态直接依赖高德原始响应，未来更换接口、增加缓存或接入小程序将迫使产品层理解供应商细节。

## 决策

定义内部 `MapProvider` 契约，供应商响应只能在 infrastructure 层转换为 Fan-route 领域对象。

```ts
interface MapProvider {
  searchPlaces(input: PlaceSearchInput): Promise<PlaceCandidate[]>;
  confirmPlace(input: ConfirmPlaceInput): Promise<ConfirmedPlace>;
  calculateLeg(input: CalculateLegInput): Promise<RouteLegSnapshot>;
  buildNavigationTarget(input: NavigationTargetInput): NavigationTarget;
}
```

产品层只认识 `ConfirmedPlace`、`RouteLegSnapshot`、`MapDataStatus` 和 `NavigationTarget`。每个路段记录 provider、providerPoiId、coordinateSystem、computedAt、dataStatus 和 nullable metrics。地图错误统一为稳定的产品错误码，不暴露 Key、上游 cause 或供应商原始消息。

v0.3 继续使用高德完成地点和算路；百度仅生成导航出口。当前阶段不自建 GraphHopper、Valhalla 或 OpenStreetMap 数据栈。

## 结果

可以在不改页面的情况下替换算路实现、增加缓存或添加新导航出口。代价是需要维护一层运行时校验和字段转换，但当前 v0.2 已经有 `mapClient`、Worker API 和统一 RouteBundle，可渐进迁移。

## 拒绝方案

- 页面直接调用高德：密钥、安全、错误和数据真实性无法统一治理。
- 同时维护高德与百度两套路线指标：成本和用户解释复杂度过高。
- 当前自建路线引擎：没有业务收益，运维与地图数据成本过大。

