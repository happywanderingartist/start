# START · design tools setup · 2026-10-05

## 安装与保留

| 仓库 | 结果 | 固定来源 | 使用与限制 |
|---|---|---|---|
| emilkowalski/skills | 13个缺失技能新增，已有emil-design-eng保留；共14个入口读回 | e8a175de22ae1e49370fc144c1f3bb9aeedf988d，MIT | 本轮采用动效决策；Swift/Expo等已安装但不用于当前Mobile Web范围 |
| Nutlope/hallmark | hallmark安装，入口version 1.1.0 | 13ac0ec7e148655948100b6396439e481361d690，MIT | 已运行study流程；不执行默认页面生成或范围外重构 |
| nextlevelbuilder/ui-ux-pro-max-skill | 已有技能保留，SKILL.md与固定上游字节一致；search脚本实际运行 | 477bcb28c9812b385cb51a4605ddf30d7b2266e2，MIT | 实际检索focus与reduced motion；没有把整个仓库的其他技能误计作已安装 |
| nexu-io/open-design | Windows v0.24.1安装成功，退出码0；完整reference-design-contract另装为Codex技能 | 源码参考53231d40b778d88eba23f35547bf99485d3ae9fc，Apache-2.0；桌面二进制独立固定release open-design-v0.24.1 | 已按合约技能产出三份文件，桌面服务完成API代理冒烟；不把catalogue stub当完整上游技能 |

物理技能目录 D:/AI-Data/Codex/skills。C:/Users/15049/.codex/skills 已是指向该目录的junction，本轮无需迁移或删除C盘原目录。技能文件清单、尺寸与SHA-256见 installed-skills-manifest.json，共17个相关技能入口；该清单用于安装读回，不代表每个技能已做功能测试。新技能可在下一轮自动发现。

Open Design可执行文件 D:/AI-Data/Tools/OpenDesign/Open Design.exe。安装包438,224,539 bytes；SHA-256为3a544dca7a5f078029d55f272e218278e52edac55efbfb292d56258113e8a441，与GitHub官方release digest一致。Authenticode检查为NotSigned，不声称数字签名通过。安装仅使用已阅读官方NSIS实现支持的/S与/D参数，目标目录原先不存在，没有覆盖旧安装。

## D盘与恢复

安装包和调研下载保存在本项目 design-tools-intake-2026-10-05。安装临时提取设置到D:/AI-Data/Cache/OpenDesignInstaller；运行TEMP/TMP设置到D:/AI-Data/Cache/OpenDesign。安装配置只新增namespaceBaseRoot=D:/AI-Data/Data/OpenDesign/namespaces；原配置备份为intake/nexu-io--open-design/installed-config-before.json。应用的data、runtime、user-data、logs、cache、updates均实际落在该D盘namespace下。没有迁移活跃数据库，没有静默删除数据；恢复配置须先退出Open Design再使用备份。Windows注册表和应用快捷方式属于安装器强制系统集成，未冒充可完全消除的C盘写入。

## 验证与排查

skill-installer官方脚本按固定SHA安装，已有目录不覆盖；Emil与UI UX的已有入口逐字节比较通过。UI UX查询返回焦点不遮挡与减少动态的真实匹配，结果保存在intake的ux-focus-search.txt、ux-motion-search.txt。上游完整测试套件没有运行，星标不作质量证明。

Open Design初次请求Next内部端口61576：根HTML返回200，但/api/skills返回HTML，不能计为API通过。按web-sidecar实现与监听端口定位到正式代理入口http://127.0.0.1:56963，/api/skills返回JSON，163个技能条目；daemon端口58785也返回技能JSON。内部端口问题通过使用正确代理入口解决，没有修改应用源码或关掉认证。当前会话入口端口由应用动态分配，重新启动需读取新入口。

正式代理证据：intake/nexu-io--open-design/web-proxy-smoke.json；daemon证据：daemon-smoke.json；安装、下载与启动日志同目录。新应用数据库在D盘创建，未导入START仓库、未配置云账户或API key、未启动生成任务；没有新增Codex MCP配置，桌面工作台安装与本对话工具热加载分开报告。官方产品存在遥测，未将其声称为完全离线或零遥测产品。

浏览器完成读回：首次设置检测到Codex CLI 0.159.0-alpha.12.1，沿用Default (CLI config)，没有更换模型。点击继续后应用执行其最小连接测试，随后进入主工作台，显示“Codex CLI · 默认”、创作输入和“运行”按钮。这个结果证明本地CLI onboarding通过；不代表生成过START页面。当前工作台入口http://127.0.0.1:56963已在本对话浏览器保留。未选择云端注册、BYOK OpenCode或DeepSeek。

## 本轮应用成果

HALLMARK_STUDY.md为首页拆解；DESIGN.md为统一视觉规范；design-contract.md记录参考/边界/风险；implementation-handoff.md是后续执行提示；后续计划位于docs/superpowers/plans/2026-10-05-start-design-tools-and-next-stage.md。Figma正式源文件缺口与两轮独立视觉审查仍未完成。本轮Git HEAD保持45a44b348696c6f5af8be6bfdbbb79d591c72c29，没有提交、页面源码/API/schema修改、merge或deploy。
