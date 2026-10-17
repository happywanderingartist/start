# 票根批准稿接入

2026-10-05 用户明确「审核通过」，仅批准票根两种封面与编辑布局。Community、Me、角色与投稿未获本批视觉批准。

实现前按 agent-reach GitHub 路径搜索图片编辑/上传类成熟方案。gh 无登录，改读官方公开 GitHub 仓库。FilePond（https://github.com/pqina/filepond）约 16.4k stars，PQINA/Rik Schennink 维护，MIT；提交页展示 2026-07-13 README 更新与 2026-07-02 合并修复，Jest 配置和 BrowserStack 兼容性验证有公开记录。优势是验证、预览、移除和清晰反馈的可访问上传流程；局限是维护者注明约 65% 测试覆盖，插件架构不能提供 START 票根构造。仅借鉴流程，不复制代码、不安装依赖。票面按已批准 REF_28 对照稿实施。

在独立 prototype/ 复制上批原型与测试，仅修改 memory-views.js、memory.css 和独立服务端口。保留状态模型、首页、Logo、角色、fixture 与原测试断言。测试副本仅替换服务端口；新测试验证批准稿构造、照片充满主视觉、键盘、历史返回、状态恢复与 reduced-motion。

Apple Design：系统标题/返回、即时按压、连续反馈；Interaction Design：编辑草稿与保存分离、取消不写记录、错误可恢复；Hallmark：券体而非卡墙、共享色卡、装饰克制。照片仅取用户实际上传与记录，不接入 REF_12 示例照片。

本批仍为本浏览器 sessionStorage 演示，不代表云保存、真实 API、公开分享或正式功能完成。
