# 包含范围、遗漏与校验

## 包内目录

| 目录 | 内容 |
| --- | --- |
| 00_README_FIRST.md / AGENT_START_HERE.md | 阅读顺序与可粘贴给agent的接手说明 |
| docs/ | 13份现役详细说明：产品、状态、架构、API、数据、记录、验收、计划、困难、运行、视觉、skill、打包范围 |
| START_HANDOFF.html | 离线合并阅读页，带目录和图片 |
| images/ | 精选历史批准方向与当前测试页面截图 |
| data/ | 公开示例目录、DB元数据、资产索引、命令schema、配置模板 |
| source/workspace/deliveries/ | 当前本地平台、账号模块、批准原型、后台/地图适配、路线素材精确快照 |
| source/workspace/.worktrees/ | 旧phase-c和v0.2工程源快照；没有Git元数据及依赖，重复素材另归档 |
| assets/character-baseline/ | 锁定角色与QA/来源manifest |
| references/ | 初始主交接包与10月17日GitHub同步记录 |
| evidence/latest/ | 本次整套验收日志、机器结果及截图 |
| evidence/current/ | 目录/DB/Git/拷贝来源与快照核验、打包检查 |
| tools/ | 本次交接构建/清单/校验脚本，用于追溯，不替代产品构建 |

source快照保持字节一致，不把源码原地重构后声称原始快照；COPY_PROVENANCE.json逐文件记录来源。旧phase-c的重复character-assets/public/assets/.context未打入，角色基线和当前原型资产单独保留。部分旧工程测试若需重复路径的素材，应依据manifest恢复引用，不能假设旧工程快照也能立即运行全部历史测试。

## 明确排除

密钥环境文件、private-config、认证二维码、证书/私钥、生产账号原始身份、私人媒体、PG集群data与测试库dump、模型GGUF、PG/浏览器/Node安装库、node_modules、Git对象库、缓存和重复归档不包含。原机器上的这些文件均保留；本次没有删除、移动或上传。Git状态和远端备份记录只描述本地读到的记录，未重新推送或证明远端今天包含最新deliveries。

原始素材和第三方参考的版权不因打包转移。素材只用于项目理解和已授权工作；对外发布前按来源核验。公开catalog是验收示例，非经过现实核验的旅游数据；不导入生产推荐。

## 校验方式

MANIFEST_SHA256.json记录包内文件字节与hash，清单自身不自包含。SOURCE快照逐一与原路径核对结果在SNAPSHOT_VERIFICATION.json。最终ZIP另有.sha256.txt；先核对压缩包hash，再按包内清单核验文件。HTML本地链接/图片和Zip条目会做机械检查，不以“成功生成ZIP”代替内容完整性。

压缩包是当日快照，后续源代码继续开发不自动同步。新agent开工先核对当前原机源文件mtime/Git和本包清单；不要把快照反向覆盖后续改动。主要不足、依赖恢复和被排除数据已在docs/09与10列明。
