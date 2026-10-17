# START — Search & Discovery Spec V2

日期：2026-10-01  
状态：P0 搜索与发现产品/技术契约。

## 1. 搜索不是 Route Search

长期实体：
- Artist
- Route
- Place
- Event

当前 Slice 可以渐进实现，但接口不应永久写死成 `RouteSummary[]`。

## 2. 用户输入

允许：
- 精确艺人名
- 别名
- 城市
- 地点
- Event
- 艺人 + 城市组合
- 简单自然语言

P0 不要求 LLM。

## 3. Query Understanding

建议顺序：
1. NFKC / trim / whitespace normalize
2. 拉丁 lower
3. Alias / Artist exact lookup
4. City lookup
5. Place / Event lookup
6. 有限连接词剥离
7. 剩余词保留参与匹配

不要：
- 识别“南京”后忽略其它未知词
- 自动猜不存在的别名
- 任意 query fallback 到固定路线

## 4. 搜索结果类型

推荐响应结构：

```json
{
  "query": "台北",
  "sections": [
    {"type":"artist","items":[]},
    {"type":"route","items":[]},
    {"type":"place","items":[]},
    {"type":"event","items":[]}
  ],
  "requestId":"..."
}
```

## 5. 城市搜索排序

产品展示优先级：

**Artist → Route → Place → Event**

不等于底层统一 score。

## 6. 艺人搜索

精确艺人命中时，Artist 作为首结果并进入 Artist Hub。默认仍由用户点击，不自动跳页。

## 7. Route 结果

至少包含：
- route id
- title
- hero
- artist
- city
- relation summary
- verification summary
- stop count
- optional distance/time

视觉重点仍是“和谁有关、为什么值得去”。

## 8. Place 结果

包含：
- place id
- name
- city
- related artists
- top verified relation
- related route count

不要做点评分数。

## 9. Event 结果

包含：
- event id
- title
- artist
- date
- venue
- state

## 10. 空查询

可以显示：
- 已收录内容
- 编辑精选
- 轻推荐

未登录不能没有依据地声称“猜你喜欢”。

## 11. 首页推荐气泡

优先来源：
1. Followed Artist
2. Joined Community
3. Similar-interest aggregate

P0 可用简单规则和权重。

## 12. 气泡行为

建议：
- 3–6 个
- 慢速漂浮
- 可点击
- 不遮搜索
- 支持 reduced-motion

Doll 可以偶尔看向/靠近一个气泡，但不改变排序。

## 13. 个性化边界

P0 不做：
- 精确位置附近推荐
- 黑盒推荐分
- embedding
- 无限 feed

## 14. Search API 架构

长期：

`SearchProvider.search(input) -> SearchResponse`

SearchResponse 支持多实体。

未来底层可替换：
- PostgresSearchProvider
- MeiliSearchProvider
- TypesenseProvider

产品 DTO 不绑具体引擎。

## 15. Artist Hub API

建议：

`GET /api/v1/artists/:artistId`

返回：
- identity
- cities
- recommended routes
- optional events

## 16. 兼容阶段性 Route-only 实现

若早期只实现 Route：
- 必须标记为阶段性
- public contract 仍预留多实体
- Artist/Place/Event 暂空 section 或 capability flag
- 不把 Route-only 写成长期产品定义

## 17. 搜索状态

- idle
- composing
- loading
- results
- empty
- error
- retrying

必须处理 IME、竞态、返回恢复、深链接、撤回结果。

## 18. 验收

至少验证：
- 艺人精确命中
- 别名
- 城市
- 艺人+城市
- 未知残余词
- 同名歧义
- 空查询
- 0结果
- 撤回不泄露
- 返回恢复
