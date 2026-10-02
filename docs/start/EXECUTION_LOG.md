# START 执行记录

| 任务 | commit | 验证 | 独立审查/修复 | 来源 |
| --- | --- | --- | --- | --- |
| Slice 000 baseline | 本行所属提交（git log） | 468copies；253恢复hash；44WIP；assets13/13；Vitest21/21；Node18/18；typecheck/build | review_slice000；修复原root依赖和恢复clone换行索引；backup-only回归通过 | baseline-provenance.json、三保护tag、完整bundle；V2已批准计划 |

| Slice001任务1 合同与环境 | 本行所属提交 | RED2→GREEN4；review regression6/6；foundation tsc；PG18.6 SELECT version | review_contracts三Important已修：discriminated types/provider专属item、HTTP/S来源URL、topVerified literal；编译负例和runtime测试；响应分页上限也修正 | reference-pins.json、ADR001、MIT pg/zod、官方portable artifact |

| Slice001任务2 Canonical/Claim/版本迁移 | 本行所属提交；任务1 778b4e9 | 真PG10/10+contracts6/6+tsc；schema初始RED→GREEN；坐标NULL追加RED→GREEN；两连接双向锁回归 | review_schema两Important闭环：CHECK NULL和并发freeze；复审独立2/2通过 | migrations001–003原样保留，004 forward-fix；review audit append-only；专用PG |

| Slice001任务3 种子/公开资格/快照 | 本行所属提交；任务2 a916dd3 | RED历史seed/投影→GREEN；媒体漂移RED→006；22DB/trust+6contracts+tsc | review_trust Critical临时表shadow与Important来源hash均先复现RED→007/import校验→复审攻击0泄漏；来源损坏拒绝；无遗留阻塞 | 3历史JSON raw SHA/bytes、5POI4legs1496m1198s默认不发布；synthetic仅start_test_库；005/006/007 forward SQL |

| Slice001任务4 四实体真实搜索 | 本行所属提交；任务3 a519ff5 | search12/12+contracts6/6+tsc；未知残余及alias排序先RED后GREEN；四SQL EXPLAIN | review_search P1连接词误删已修，只移除完整片段；多公开候选LIMIT回归、alias与canonical同tier；只读复审无critical/important | PostgreSQL派生视图、有限词典、不忽略残余、不固定南京、Provider contract四专属组 |

| Slice001任务5 公共实体/Hub HTTP | 本行所属提交；任务4 fd6f670 | HTTP9/9+四实体search12/12+domain2/2+tsc；初始HTTP6RED→GREEN；owner启动拒绝RED→GREEN | review_api独立24只读PG/HTTP探针无阻塞；500诊断泄漏Minor固化回归；复审关闭 | 仅五种GET API，private/draft/withdraw404，输入400，DB503/internal500；真实bounded reader、事务快照；测试限定本机start_test_ |
