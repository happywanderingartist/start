# 配置变量与位置模板（无真实值）

当前高德JS配置文件：原机工作区/private-config/amap.env；变量名AMAP_JS_API_KEY、AMAP_JS_SECURITY_CODE。高德Web服务：进程环境AMAP_WEB_SERVICE_KEY。仅记录存在约定，不复制真实值。

现役DB配置在server.mjs/boot.mjs为本机127.0.0.1:55435、user start_local、database start_acceptance。它不是生产安全模板；不要把开发trust暴露到公网。

本地模型端口4328、alias start-extractor；运行脚本START_TEXT_IMPORT.ps1。模型文件不随包。

Open Design预览smoke读取可选OPEN_DESIGN_BASE_URL，默认历史地址127.0.0.1:63868；实际工具启动后先核对项目。旧53625链接只当历史。

真实微信、云数据库、对象存储、域名HTTPS配置尚未接入完成。不要凭此模板自行设置假AppID/令牌来绕过身份检查，也不要将密钥提交Git或输出到交接文档。
