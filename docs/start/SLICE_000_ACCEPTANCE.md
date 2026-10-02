# Slice 000 验收 — 2026-10-02

结论：保护、恢复、文档和资产基线通过；允许按既有授权继续 Slice 001。未执行产品功能开发、merge/deploy，不代表新START产品验收。

## Git 与可恢复性

起点master 1def607be517cb2e5bbf7c183125836a113ea5ce，新branch feature/start-slice-001，新worktree .worktrees/start-slice-001。旧map b9a4623292ca373869b9feb8343d6d36e0b1d36f、character a8ece9707afca3a8106ec09b8d2a215dd30aa456不变。添加baseline/start-20261002/{main,map,character}只读保护tag，未移动旧分支。完整bundle SHA256 40f8d114994d2aa0f58be51038626eacd8d94ae6e5d7d81e9b1b478f96e539ee，64992711 bytes，无外部前置对象。

外部备份 integration-backups/2026-10-02-baseline-verified/manifest.json：468文件逐项hash读回；旧main/map/character分别24/13/7未提交项、76/88/89已跟踪及WIP文件，恢复clone HEAD/status/253hash一致，原root也一致。全部staged.patch为0。ignored审查材料、来源zip/视觉参考及旧计划在restored-evidence独立恢复hash一致。node tooling/baseline/recover.mjs <backup> --backup-only不读取原root，恢复只用backup；独立结果backup-only-recovery.json通过。依赖/build/cache等可重建内容排除，私有.env未复制且未发现根.env。两次LF/CRLF恢复校验失败记录保留未删除；只在恢复clone归一pristine index，cached diff为空，不改WIP或旧index。

回退使用保护tag/bundle在新路径重建，或对新integration提交做revert；数据库回退以后独立说明。禁止对旧root reset/clean。

## 来源与回归

provenance见baseline-provenance.json：V2源16文件与完整包zip/hash保存在备份，批准计划与旧Note/基线计划版本化，63复制文件来源/hash登记。旧角色24候选/18release原样迁移；validator和tests未改，qa/report运行后hash仍相同。仅修复baseline脚本有单独衍生hash。

实际命令 pnpm test:assets：13/13、18资产、0errors。pnpm check：typecheck通过、Vitest21/21、build通过、Node18/18，无skip。pnpm install离线缺metadata后联网补依赖；新lock仅新增pngjs7.0.0九行，无旧依赖版本漂移。旧v0.2历史47/52和Worker60/60是已有记录，不称本轮已重跑或新验收；原失败不删除/弱化。

## 独立审查与修复

review_slice000只读检查原root、manifest、全部hash、restore/evidence、bundle及新变更。发现Important：恢复脚本依赖原root进行bundle verify和比较；已改为恢复clone验bundle，backup-only不访问原root，并通过同一完整恢复回归。修复capture的换行索引归一逻辑。无遗留Critical/Important。审查未验证生产环境/所有旧外部vendor网络，这些不属000验收。提交与后续任务记录见EXECUTION_LOG.md及git log。
