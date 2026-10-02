# START — Trust, Evidence & Moderation Spec V2

日期：2026-10-01  
状态：P0 内容可信度机制基线。

## 1. 核心信任问题

用户真正关心的不是“这个 POI 是否存在”，而是：

> 这个地方真的和这个偶像有关吗？

所以必须拆分：
1. Place validity
2. Artist-Place relation validity
3. Specific claim validity
4. Route publication state

## 2. Evidence 是一等对象

每个可验证主张尽量指向 Evidence。

来源类型：
- 艺人官方社媒
- 官方采访
- 官方活动
- 节目
- 演出
- 媒体
- 用户投稿
- 其他公开资料

## 3. 核验状态

推荐：
- unverified
- partial
- verified
- disputed

界面中文：
- 未核验
- 部分核验
- 已核验
- 有争议

不能整条 Route 用一个万能“已认证”覆盖所有 Stop。

## 4. Route Detail 的可信度显示

必须可发现：
- Stop 关联说明
- 来源类型
- 来源链接
- 核验状态

可以有整体摘要，但不能替代逐项状态。

## 5. 来源失效

URL 失效时：
- 显示“来源暂不可访问”
- 保留曾经核验时间/来源标题
- 不自动把历史事实改成 false
- 也不能继续标 fresh

## 6. UGC Route 提交

`Draft → Auto Precheck → Human Review → Publish / Needs Evidence / Reject`

## 7. 自动初筛

可检查：
- 地点是否存在
- URL 格式
- 重复路线/地点
- 必填缺失
- 明显风险内容
- 证据来源是否可访问

自动初筛不能决定复杂事实真实性。

## 8. 人工审核

关注：
- claim 是否被证据支持
- 是否误导
- 是否同名地点/艺人混淆
- 是否侵犯隐私
- 媒体素材授权
- 是否应标“未核验”

## 9. 允许未核验发布

产品决策：证据不足的部分内容可以发布，但必须明确“未核验”。

允许：
- 非核心补充
- 合规的待确认线索

不允许公开：
- 核心路线完全没有可信关联
- disputed 核心事实且无解释
- 私人地址/敏感个人信息
- 侵权素材

## 10. 发布条件

Route published 至少要求：
- approved revision
- 至少一站
- 地点可公开
- 核心关联有证据或符合规则地明确未核验
- 无严重 disputed 核心事实
- 媒体权利状态可用或使用缺图

## 11. 用户纠错

后续可支持：
- 举报
- 补充证据
- 纠错申请

纠错产生新的 moderation case，不直接修改历史已发布 revision。

## 12. 媒体素材

参考图、视觉包、Figma 参考不自动拥有上线授权。

媒体必须记录：
- rights_state
- visibility
- source

没有授权：
- 缺图
- 中性占位
- 不生成“艺人到访照”冒充事实

## 13. 审核日志

至少记录：
- 谁审核
- 何时
- 哪个 revision/claim
- 决定
- 理由
- 关联证据

## 14. UI 文案原则

避免：
- 无依据“官方认证”
- “真实路线”覆盖未核验内容

推荐：
- 已核验
- 部分核验
- 未核验
- 来源暂不可访问
- 此关联由用户提供，尚未完成核验
