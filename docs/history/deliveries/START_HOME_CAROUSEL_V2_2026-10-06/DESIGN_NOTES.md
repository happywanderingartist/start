# 首页轮播 V2 · 待用户确认

本轮将四分类替换为可滑动的具体推荐卡：路线、地点、演出、精选帖；保留原稿艺术字和锁定角色。只制作独立可编辑视觉及动效样片，不改已运行业务原型，不代表首页新方案已获批。

规则：7秒自动前进；手势或选卡后保持暂停，用户可显式播放；悬停/内容聚焦/页面隐藏/卡片离开视区临时暂停；reduced-motion停自动并降低滚动动效。方向键即时换卡，无人为输入延迟；仅当前卡链接参与键盘焦点，自动播放不持续播报。下方内容静态。左右控件与选卡点触控区域至少44px。样片保留少量素材标注，发布时换为真实摄影和核验内容。

Skill：Interaction Design明确自动/手动/暂停状态；Apple Design保证手势直接跟随与可打断；Emil与Animate用于动效目的、键盘即时响应和减少动态适配；沿用Hallmark既定品牌规则，控制标题与卡片层级。pick-ui-library清单未覆盖轮播，因此依据GitHub审查选择Embla，不安装新的通用UI框架。

GitHub前置：David Jerleke维护的 [Embla](https://github.com/davidjerleke/embla-carousel)，当次仓库约8.4k星、2020条历史提交，有对齐/焦点/循环/尺寸测试；[发布记录](https://github.com/davidjerleke/embla-carousel/releases)包含自动播放与后台标签相关修复。未读取到精确最新提交日期，不据星数认定质量。可复用优势：成熟滑动手势、循环与可打断运动；局限：轮播引擎不提供推荐数据、自动播放可访问性完整策略或GPS。本轮固定8.6.0，使用其npm官方发行UMD文件，不照搬未经审阅的应用代码。[MIT许可证](https://raw.githubusercontent.com/davidjerleke/embla-carousel/v8.6.0/LICENSE)随vendor保留；[官方Autoplay规则](https://www.embla-carousel.com/docs/v8/plugins/autoplay)用于交互停止依据，样片计时规则由本稿单独管理。

入口index.html；base.css与carousel.css为可编辑样式；carousel.js管理样片状态；vendor为固定轮播库；assets为既有原稿。摄影只复用原稿模糊视觉，明确非地点/演出实拍。例子不是真实推荐，按钮仅用于样片阅读跳转；真实内容与业务接入须在本批视觉获批后进行。

验证结果见CHECKS.json；真实手机手势、屏幕阅读器及系统reduced-motion待独立验收，不将代码存在当作真机通过。
