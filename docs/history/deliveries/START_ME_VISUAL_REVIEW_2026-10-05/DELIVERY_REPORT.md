# Me 首版视觉稿

12 个独立页面，2 张四页审阅板。主要页：个人主页、START Card、Book、设置；次级页：编辑、隐私、收藏与路线空状态；另含 Book 合成章节构图、空资料和男娃母版示意。

结构前使用 Interaction Design / Apple Design / Hallmark。系统底座保持原首页与 Apple Music 信息层级；九色卡按内容用途分配，Card / Doll / Book 不做相同卡片九宫格。角色复制已验收母版，ASSET_PROVENANCE.json 记录来源 SHA-256，未经重绘或图片编辑。

72 项静态六宽度检查通过，图像解码，无横向溢出；无 runtime 脚本，业务按钮与输入禁用。Book 默认空，样例章节单独标明，不注入已有 Memory 状态。

此批等待视觉确认，未接入原型。隐私默认关闭，身份与偏好为合成资料，不代表真实账号或服务器设置。角色动效仍为独立待审批批次。

物料集市分区修订已在现有 Trade 实现完成：活动详情集市入口和列表增加浅亚麻底、湖蓝左线、较清晰章节标题。Trade 与 Community 两组浏览器检查共 16 项通过；本轮未重跑旧完整 70 项套件，不把它当本轮新增检查。

GitHub 研究、取舍和素材边界详见 DESIGN_CONTRACT.md。Open Design 预览证据完成后记录在 evidence/OPEN_DESIGN_MAIN.png。

Open Design 实测：已打开 me-visual-v1/index.html 与 states.html，核对 START Card、Book、设置、编辑与三个关闭的隐私开关，分别保存 OPEN_DESIGN_MAIN.png / OPEN_DESIGN_STATES.png。预览与可编辑文件可用；未调用或修复生成引擎。
