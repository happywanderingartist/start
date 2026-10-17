# 棉花娃娃弧形选择视觉 / 动效样片
阶段：独立审阅样片，不集成原型；使用/保存禁用。奶油底 + 冰蓝舞台 + 咖啡字，橙色只做小标记，去除叶绿/陶黄大块拼色。
资料：D:/Downloads/Fan-route_角色素材包_v1 下实际4张原图、README；README列女娃定版衣服但该文件当前缺失；实际 reference 图包含4套穿搭，accessories 图含6件配饰，均按参考状态展示。男娃 outfits 标待重做，不作为正式素材；已验收目录含8张表情、8动作、2母版。SVG viewBox仅展示原图局部，不改原图、不生成新脸、不冒充可叠加层。
Interaction Design：中央候选与名称同步、保存另行操作。Apple Design：原生滚动惯性与snap，滑动期间变换跟随位置，可反向中断。Animate / Emil：偶发动作，目的为空间连续性与选中状态；仅transform/opacity，缩放不改变布局；键盘即时，reduced-motion固定大小，mouse拖拽与touch原生滚动。无自动播放。
GitHub-first：搜索并查看 davidjerleke/embla-carousel、package.json、维护者讨论978，MIT，David Jerleke维护，8.4k stars仅背景，2020commits；多框架playground和workspace test脚本存在，最近提交日期未加载无法验证。可复用优势：原生感惯性与按距离缩放；明确局限：维护者说明动画时改变宽度会重置，且弧形和资产管理仍需自定义。本独立样片借鉴固定槽宽+transform原则，未复制代码或安装依赖，浏览器原生滚动处理惯性。https://github.com/davidjerleke/embla-carousel https://github.com/davidjerleke/embla-carousel/discussions/978
视觉确认、实际触屏手感与正式装扮功能均未验收。
`nOpen Design 实际预览通过，下一项点击后从校园风切换日常休闲；evidence/OPEN_DESIGN_ARC.png。六宽度、鼠标拖动、键盘、选中同步、reduced-motion及禁用保存检查通过；手机触屏手感未验证。

V5：人物从参考图独立提取，使用 imagegen 保留身份的透明抠图候选，不覆盖原参考与已锁定母版。人物主预览与轮播均改为小卡（冰蓝底、奶油纸边、咖啡细边线），剔除临近角色头发及原纸背景。提取后的身份一致性等待用户视觉确认。
图像工具强制在 CODEX_HOME 的 C 盘兼容目录先写入，项目使用副本保存 D 盘。生成提取结果仅是审阅候选，不证明原图像素或锁定身份完全一致；原图、旧稿、正式母版均保留。
4套已提取为单角色候选并逐张查看；未发现临近角色头发。原图不变，生成候选不等于逐像素提取。六宽度、拖动、键盘、reduced-motion回归通过。Open Design 小卡预览实际核对，evidence/OPEN_DESIGN_CARD.png。

V6 用户明确撤销小卡方向：主人物与候选均无卡框、无卡底；同一单角色素材站在冰蓝天空/奶油岸边背景中。Animate：背景属于用户明确要求的氛围装饰，CSS预定cloud translate和light opacity，16/20s缓慢来回、4s亮度呼吸；无角色变形动画、无喂养数值。可暂停，隐藏文档自动暂停，reduced-motion固定场景。Apple Design弧形滑动原则不变。Hallmark使用既有色卡，不加入图中真人、贴纸卡框。仅视觉动效审阅，不集成/保存。小卡业务草稿未启动，随新指示暂停。
六宽度、拖动、键盘、reduced-motion通过；背景移动、暂停冻结、恢复通过，截图与录像已输出；Open Design 实际显示核对。未接入业务原型，等待本版本视觉确认。
