# API 与业务合同

本文件描述现役本地接口。完整字段以 source/workspace/deliveries/START_LOCAL_PLATFORM_2026-10-08/src/contracts.mjs 为准；本包另附 data/COMMAND_SCHEMAS.json 供检索。前端统一使用 client.mjs，不把账号ID或管理员标记塞入业务载荷。

## HTTP入口

| 方法与路径 | 作用与权限 |
| --- | --- |
| GET /api/status | 本地DB/身份/云状态，不返回密钥 |
| GET /api/public?artistId=&city=&category= | 公开艺人/地点/路线/演出/社群/物料，筛选键白名单 |
| GET /api/public/{artist,place,route,event,listing}/{id} | 公开详情；listing含公开评论 |
| GET /api/home | 已配置公开内容ID映射，首页尚未完整消费 |
| GET /api/recommend?city= | 可选已验证身份，按同城/兴趣基础排序 |
| GET /api/me/{section} | 当前账号私有查询 |
| GET /api/admin/{content,submissions,applications,requests,audit,revisions,media} | 平台管理员读取；revisions用id参数 |
| POST /api/commands/{operation} | JSON命令，需要真实验证身份和idempotency-key |
| POST /api/media | 鉴权PNG上传，5MB、尺寸与真实解码限制 |
| GET /api/media/{id} | 本人私有/公开引用/审核权限判断后读取 |
| GET /api/share/{token} | 令牌对应的选定记录和字段，撤销/无效时404 |
| GET /api/share/{token}/media/{id} | 必须对应分享中选定照片；不开放整个媒体库 |
| /api/map/*、/_AMapService/* | 固定本地代理，POI候选、配置与SDK请求白名单 |
| /api/extract/* | 本地候选识别，POST在现役HTTP层先检查身份 |

private section包括 profile、book、shares、submissions、memberships、notifications、doll、favorites、listings、exchanges、listingComments。shares只返回本人 id/record_ids/fields/revoked，不返回token或token_hash。令牌创建后仅在创建结果显示，刷新后能管理撤销，但不能从metadata恢复完整链接。

## 命令分组

| 领域 | 命令 | 关键限制 |
| --- | --- | --- |
| 平台内容 | artist.save/place.save/route.save/event.save | 管理员；修改带当前version；图片须属于可使用媒体 |
| 版本/发布 | content.publish/withdraw/restore | draft不自动公开；publish重查关联；restore产生新版本 |
| 导入/首页 | import.places、home.configure | 管理员；30项上限；首页引用必须已公开 |
| 用户投稿 | submission.create、routeSubmission.create、submission.resubmit | 一次一个artist；路线placeIds或stops二选一；拒绝后允许本人修订 |
| 审核/纠错 | submission.review、correction.create/review | 审核平台权限；批准需要checked；退回必须理由 |
| 社群 | community.apply/review/join/edit/member/request/request.review | 唯一artist；简介公告成员有限权限；转让解散需平台审批 |
| 物料 | listing.create/edit/status | 已加入社群发布；artist与社群一致；演出与场馆一致；状态available/withdrawn |
| 评论 | listing.comment、listing.comment.delete | 评论1–1000字，公开物料可评论；本人或平台管理员删除 |
| 交换 | exchange.apply/accept/withdraw | 不允许申请自己的物料；仅发布者接受；参与者撤回；无completed状态 |
| 资料 | profile.update | 昵称1–24字；兴趣/艺人文本上限120；隐私字段白名单 |
| Book | checkin.create/delete | 过去或当前时间；文字3500；最多9照片；票根title≤200/note≤1000 |
| 分享 | share.create/revoke | 本人记录1–30条；fields从snapshot/at/text/ticket/media_ids中选；可撤销 |
| 娃娃 | doll.choose/style | boy/girl首次锁定；outfit original或2–5；neutral/smile/sad/surprised；无配饰 |
| 其他 | favorite.set、notification.read、account.delete | 本人数据；注销confirm=true并清私人内容、禁写 |

## 典型载荷

```json
{
  "placeId": "有效UUID",
  "at": "2026-09-01T08:00:00Z",
  "text": "今天的私人记录",
  "mediaIds": [],
  "ticket": {"title":"在济南，慢慢走", "note":"记住今天的阳光。"}
}
```

上述为 checkin.create 的结构示例，不可将“有效UUID”原样当真实请求。share.create 的结构为 `{ids:[checkinId], fields:['snapshot','at']}`；不选text/media_ids时实际公开结果不得包含文字和照片。

## 错误与状态

未配置服务端身份：503 AUTH_NOT_CONFIGURED；缺身份：401 UNAUTHENTICATED；越权：403 FORBIDDEN；失效内容/分享：404 NOT_FOUND；版本/重复载荷冲突：409 CONFLICT；输入错误400、媒体类型415、请求过大413。网络失败不能伪装空列表或成功。

关键状态流：投稿pending → approved/rejected；被拒可补充来源再提交。交换pending → accepted或withdrawn；接受不改变物料完成情况。物料available ↔ withdrawn由发布者选。社群成员joined/followed/removed；单艺人唯一性由DB和服务共同约束。分享有效 → revoked；删除被分享记录也使相关分享失效。

## 待复核的接口成本

旧contacts读写路由/命令已经停用，表尚在。public listing评论未分页。exchange.apply/accept对隐藏社群/无效发布者的进一步可见性复核应作为新增边界测试。share令牌虽在shares表只存hash，但通用幂等结果会保存创建结果，不能宣称全库绝无明文令牌；生产前需明确敏感结果存储策略。
