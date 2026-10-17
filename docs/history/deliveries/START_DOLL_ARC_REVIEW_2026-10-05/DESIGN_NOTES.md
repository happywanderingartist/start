# 棉花娃娃弧形选择视觉 / 动效样片
阶段：独立审阅样片，不集成原型；使用/保存禁用。奶油底 + 冰蓝舞台 + 咖啡字，橙色只做小标记，去除叶绿/陶黄大块拼色。
资料：D:/Downloads/Fan-route_角色素材包_v1 下实际4张原图、README；README列女娃定版衣服但该文件当前缺失；实际 reference 图包含4套穿搭，accessories 图含6件配饰，均按参考状态展示。男娃 outfits 标待重做，不作为正式素材；已验收目录含8张表情、8动作、2母版。SVG viewBox仅展示原图局部，不改原图、不生成新脸、不冒充可叠加层。
Interaction Design：中央候选与名称同步、保存另行操作。Apple Design：原生滚动惯性与snap，滑动期间变换跟随位置，可反向中断。Animate / Emil：偶发动作，目的为空间连续性与选中状态；仅transform/opacity，缩放不改变布局；键盘即时，reduced-motion固定大小，mouse拖拽与touch原生滚动。无自动播放。
GitHub-first：搜索并查看 davidjerleke/embla-carousel、package.json、维护者讨论978，MIT，David Jerleke维护，8.4k stars仅背景，2020commits；多框架playground和workspace test脚本存在，最近提交日期未加载无法验证。可复用优势：原生感惯性与按距离缩放；明确局限：维护者说明动画时改变宽度会重置，且弧形和资产管理仍需自定义。本独立样片借鉴固定槽宽+transform原则，未复制代码或安装依赖，浏览器原生滚动处理惯性。https://github.com/davidjerleke/embla-carousel https://github.com/davidjerleke/embla-carousel/discussions/978
视觉确认、实际触屏手感与正式装扮功能均未验收。
`nOpen Design 实际预览通过，下一项点击后从校园风切换日常休闲；evidence/OPEN_DESIGN_ARC.png。六宽度、鼠标拖动、键盘、选中同步、reduced-motion及禁用保存检查通过；手机触屏手感未验证。
