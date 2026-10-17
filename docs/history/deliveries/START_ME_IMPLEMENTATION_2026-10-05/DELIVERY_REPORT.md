# Me 已确认视觉稿接入与移动端检查

新入口 http://127.0.0.1:4319/me；旧版本 4317 保留，不能用旧端口判断当前 Me。Open Design 中 me-implemented/me.html 已实际预览，并验证 Card→返回 Me。

已接入 Me、START Card 查看/编辑、设置/隐私、收藏/我的路线空状态，连接已有娃娃和 Book。初始资料为旅行者，不把视觉稿的示例小夏当成用户身份。Card 保存、取消、刷新恢复及隐私演示选择有效；仅 sessionStorage 同一浏览器会话，账号服务和真实公开权限未接入。没有伪造收藏或个人路线。

使用 Apple Design、Hallmark、Interaction Design 与 Mobile Native；Card/伙伴/Book 层级沿用已确认 V4。设置入口及主要触控目标至少44px，输入16px，viewport-fit=cover、四边 safe-area env 与100svh；样式仅作用于 Me 根容器，离开卸载。长合法英文输入用 overflow-wrap:anywhere 保留全部内容，男娃替换时同步 alt。

GitHub-first：复查 https://github.com/shadcn-ui/ui 的 responsive/settings 相关目录和移动端 issue（497、2740）。成熟组件的优势是分组、可访问性与可组合结构；局限为默认示例尺寸仍可能溢出，不能替代本项目的移动端实测。前一轮核对 MIT、约125.1k星、shadcn-ui组织、Vitest配置及workflows；近期提交和CI实际通过未可靠取得，不将星标当成质量证明。沿用项目原生实现，不新增组件库。

Chromium 触控模拟：320×568、375×812、390×844、414×896、768×1024、820×1180、834×1194、1024×768、1180×820、844×390，共8条Me/娃娃路由×10画幅=80样本通过。viewport width 与 visualViewport 对齐；未出现横向溢出，图片正常，Me可操作目标尺寸符合44px。触控资料保存/取消/刷新、隐私选择保存、娃娃返回Me、Book入口检查通过。合法120字英文资料在7种宽度及两页的元素边界通过；另检查损坏存储、注入文本转义、保存失败回滚、hash路由和样式卸载。

既有24项状态测试与45项旅程/记忆/票根/Community/物料集市/娃娃浏览器检查通过。memory-browser 仅更新已改变的Book入口名称定位，保留原卡册内容断言。基线保护文件字节一致，哈希记录在evidence。独立审查发现长英文裁切和男娃alt，两项均修复并复测。

WebKit：Windows 引擎启动成功，但 newPage 持续无响应；复查后终止，不计作通过。未在真实手机/iPad上测试，不宣称 Safari、系统键盘、地址栏伸缩或刘海安全区已实机验收。

后续适配修正：Me 双列条件改为宽度≥768px且高度≥600px，844×390手机横屏保持单列。6次纵横屏/平板尺寸切换布局断言、80样本重测、损坏存储/注入/回滚检查、7宽度长资料检查均通过。Open Design 的两份样式同步并核验哈希，实际预览截图为 evidence/me/OPEN_DESIGN_CURRENT.png。

本机回环入口4319保留。真机预览另绑定当前私有地址192.168.3.17:4320，电脑请求/me返回200；默认仍是回环，仅允许显式私有IPv4，不监听0.0.0.0、不修改防火墙、不建公网隧道。手机/平板需同一局域网访问 http://192.168.3.17:4320/me；本机返回200不能替代真机验收，网络或IP变化后需重新启动。启动方式：设置START_PREVIEW_HOST为当前私有IPv4、START_PREVIEW_PORT为4320，再运行node prototype/server.mjs。

截图：evidence/me/chromium/；验证记录RESPONSIVE_CHECKS、LONG_DATA_CHECKS、EXTRA_CHECKS。
