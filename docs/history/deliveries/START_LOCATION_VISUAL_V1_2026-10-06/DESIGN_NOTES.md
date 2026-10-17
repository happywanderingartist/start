# 城市推荐视觉稿 V1 · 待确认

本批只新增独立视觉审阅文件，没有修改现有业务原型。用户确认前不接入真实推荐或业务逻辑。首页上半部复用原始艺术字、角色和四分类素材；下半部提出城市路线、地点、演出、精选帖的连续阅读区。布局属于候选稿，不宣称像素级复刻已确认首页。

文件：home.html完整首页候选；home-feed.html新增推荐区；city.html城市社群地点目录；map.html关系地图和地点面板；states.html定位/空结果/失败状态；index.html并列审阅入口。HTML/CSS真实可编辑，非截图热区。

技能采用：Interaction Design用于城市、地点类型和艺人维度分离，列表/地图同任务切换；Apple Design用于清楚的系统标题、正文层级、底部导航和即时按压反馈；Hallmark用于既定品牌内审查，删除重复说明和大面积卡墙，使用行式目录、封面路线和演出行的结构差异。品牌约束优先，不按通用主题轮换重选字体或色卡。原素材不重绘。

色卡：paper #FBF3E8、linen #EAE5DA、dark coffee #3F241C、coffee #702720、ice #CBE5FE、cerulean #3B7789、mango #F24E07；绿色只点用于照片槽示例，避免绿色与土黄主配。摄影尚待补，示例地点、路线、演出、帖文不得作为真实发布数据。地图是SVG关系示意，不含真实坐标，不用于导航。

GitHub前置对照：MapLibre组织维护的 https://github.com/maplibre/maplibre-gl-js ，官方例库 https://maplibre.org/maplibre-gl-js/docs/examples/ 检索显示约11.8k星；仓库有unit/integration测试配置，发布页 https://github.com/maplibre/maplibre-gl-js/releases 显示近期发布与修复。许可证BSD-3-Clause。星标只作为规模线索，不作为质量结论；提交摘要未能读取精确日期，不声称已完成源码质量审计。可复用优势：成熟的地图标记、选择与地图视图交互示例；明确局限：库负责地图渲染，不提供START艺人关联、优质帖审核或高德国内导航数据，也不能解决两种坐标体系的适配。本次仅借鉴交互边界，没有复制代码、安装地图依赖或改变高德技术选择。

验证：LAYOUT_CHECKS.json记录5页×6宽度（320/390/414/768/1024/1280，共30个样本）均无横向溢出与图片失败。CHECKS.json另记录餐厅筛选后仅1条可见。REVIEW_BOARD.png与HOME_390.png为浏览器实拍；OPEN_DESIGN.png记录在Open Design打开可编辑稿。视觉审查非完整业务、触控、键盘、GPS和真机验收。

未完成：真实地点摄影；城市/艺人筛选面板完整设计；路线/演出/帖文真实资料；地图标记联动、筛选与返回恢复；真实GPS与AMap集成；现有导航接入。此稿的链接用于审阅跳页，不能当成已完成的真实页面路由。待对应视觉确认后，按真实使用开发计划推进。
