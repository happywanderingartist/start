# START — Design & Figma Handoff V2

日期：2026-10-01  
状态：正式 UI 前的设计规格基线。

## 1. 视觉总方向

**Editorial Minimalism × Fandom Scrapbook**

更准确：

**structural calm + expressive youth editorial layer**

原则：

> 骨架克制，内容鲜活；信息清晰，局部出格。

## 2. 不要做成

- 高德/百度地图 dashboard
- 小红书瀑布流
- 微博信息流
- 闲鱼市场
- 儿童宠物游戏
- 所有内容同款圆角卡片
- 旧粉紫玻璃
- 满屏贴纸/手写导致任务消失

## 3. Start Home

必须同时表达：
- `Start with [ ... ] ?`
- 悬浮推荐气泡
- Doll 轻互动

搜索输入仍是视觉第一任务。推荐气泡不能遮挡输入。

## 4. Search Results

需要支持多实体：
- Artist
- Route
- Place
- Event

不能只画 Route list 作为长期 source of truth。

## 5. Artist Hub

必须设计：
- Artist identity
- Editorial city blocks
- Recommended routes

不是百科页。

## 6. Route Detail

信息顺序：
1. 关联真实性
2. 想去感
3. 怎么走

第一屏：
- Hero
- title
- artist/city
- why worth replicating
- short story

CTA：
- 开始路线
- 分享

## 7. Journey

地图在这里才是主要区域。

设计：
- map
- doll
- progress
- next stop
- skip
- finish

Arrival 适合 bottom sheet / state view。

## 8. Poster

Poster 比普通功能页更允许表达性视觉。

重点：
- user photos
- visited places
- idol-related visual elements

Poster Editor 只做轻量交互。

## 9. START Book

应有“册子/档案/翻阅”感，不做 Dashboard。

## 10. Community / Event

Community 用 section，不用 Feed。

Event 首屏先信息，再现场动作。

Trade Board 功能性优先，不能变闲鱼。

## 11. Me

START Card / Doll / START Book 组合，但有主次。

## 12. Figma 文件建议

`START / Mobile Web / P0`

Pages：
1. `00 Brief & References`
2. `01 IA & Flows`
3. `02 Foundations`
4. `03 Components`
5. `04 Start & Search`
6. `05 Artist / Route / Place`
7. `06 Journey`
8. `07 Poster / START Book`
9. `08 Community / Event / Trade`
10. `09 Me / Card / Doll`
11. `10 Responsive`
12. `11 Prototype`
13. `12 Handoff & Review`

## 13. Foundations 最小集合

- Color
- Typography
- Spacing
- Layout
- Radius
- Border
- Motion
- Icon
- Media

不要先造庞大设计系统。

## 14. 390×844 主视口

同时验：
- 320
- 768
- 1280

响应式不自动变成双列 Feed。

## 15. 必须设计的状态

- idle
- loading
- empty
- error
- retry
- 404
- withdrawn
- missing media
- partial verification
- denied location
- anonymous vs logged-in persistence
- offline / weak network for Journey

## 16. Prototype 最小主链

Discovery：
`Start → Search → Artist Hub → Route Detail`

Journey：
`Route Detail → Start Journey → Arrival → Skip/Next → Finish`

Memory：
`Finish → Poster → Edit → START Book`

Community：
`Community → Event Hub → Live Trade`

UGC：
`New Route → Add Place → Evidence → Submit`

## 17. Handoff

必须记录：
- file URL
- node IDs
- confirmed version/date
- tokens
- component variants
- API field mapping
- media rights
- interaction state matrix
- responsive rules
- acceptance screenshots

工程截图不能反向成为设计 source of truth。

## 18. 视觉参考使用边界

参考包用于：
- 结构
- 摄影与标题关系
- 表达密度
- editorial rhythm

禁止直接剪取：
- 品牌 logo
- 人物照片
- 字体
- 商业素材

若角色出现，仅用已验收正式资产。
