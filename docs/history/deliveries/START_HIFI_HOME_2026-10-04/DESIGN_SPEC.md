# START 首页设计规格

此文件是后续可编辑界面的实施目标，图像生成结果存在字号、位置与色值偏差，不能据此宣称已精确实现。基准逻辑画布 390×844，静态稿保持约 853×1844 比例。

| 元素 | 目标参数 |
|---|---|
| 标题 | 保留用户确认的手工块面字形，作为独立品牌图形；不得用默认黑体替换 |
| 正文 | iOS 风格无衬线；系统字体栈，中文苹方或平台等效字体；最多两类字体 |
| 搜索 | 原稿位置约 x23/y235，宽344、高44；16px 常规字重；圆角16px，边框1px |
| 娃娃 | 位于搜索右上边缘，约87×39逻辑像素；前趴、双手搭边、保留角色身份与服装 |
| 区域标题 | 23px/600；示例12px/400；两者垂直对齐 |
| 前层卡片 | 约132×123逻辑像素；保持两列两行与明显组间距；不得自动拉成满宽大卡 |
| 后层卡片 | 仅上沿露出约5px总高度，最多两层，轻微倾斜，不溢出到相邻组 |
| 卡片文字 | 16px/500；箭头同字色；文字与箭头保留一致内边距 |
| 卡片圆角 | 16px逻辑圆角；细微接触阴影，无厚重浮层 |
| 封面 | 实景图模糊约10–15px；约85%类别色蒙版；底部条使用同类别纯色与色卡配对字色 |
| 底栏 | 固定底栏；图标目标26px，文字11px/500；分隔线0.5px、低对比 |

## 三套配色合同

### 陶瓷咖啡

Surface #FEFAF0. Title START #542916 WITH #A13A1E punctuation #88B8CE. Search light honey #F1C166 with terracotta #A13A1E ink. Section #B79858. Cards: 音乐 espresso #542916 + porcelain blue #88B8CE ink; 文艺 ochre #B79858 + cream #FEFAF0 ink; 电影 terracotta #A13A1E + honey #F1C166 ink; 书店 porcelain blue #88B8CE + espresso #542916 ink. Photo overlay AND footer follow each card background. Active nav espresso, inactive ochre.

### 复古海岸

Surface pale warm cream from target. Title START #818546 WITH #4482A3 punctuation #E68A58. Search #9BC0CC with #4482A3 ink. Section #884529. Cards: 音乐 olive #818546 + cream #FFE4D2 ink; 文艺 strawberry #F5B1B8 + wood #884529 ink; 电影 wood #884529 + sunset #E68A58 ink; 书店 cream #FFE4D2 + sunset #E68A58 ink. Photo overlay AND footer follow each card background. Active nav deepsea #4482A3, inactive #99B7A4.

### 糖果海滨

Surface warm cream from target. Title START #037F71 WITH #EF6545 punctuation #F49625. Search #DDF2B8 with #57B1A8 ink. Section #037F71. Cards: 音乐 baby lavender #F9D4F8 + pool #037F71 ink; 文艺 twilight #AECFD0 + navy #263344 ink; 电影 peach #FFD094 + rose #EA5E86 ink; 书店 rose #EA5E86 + peach #FFD094 ink. Photo overlay AND footer follow each card background, ensure film photo peach not saturated red; music mask pale pink lavender. Active nav pool, inactive #57B1A8.

## 交互约定：仅规格，尚未实现

搜索输入艺人、城市或地点，进入已有内容查询；清空和无结果状态应明确。点击一个类别卡组，只展开该类别路线；无真实路线数据时标注示例，不编造路线数量、距离或已验证状态。底部 Start、Community、Me 使用统一导航。娃娃不得遮挡搜索点击区域，动画与交互需另行实施。

