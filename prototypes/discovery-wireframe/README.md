# START Discovery · Phase A

私有灰阶原型，正式 Figma source of truth 前的结构验证；不接 API、数据库或生产服务，不实现 Journey。数据全部为合成示例，不能用于真实足迹、旅行建议、导航或对外发布。现有 Slice 001 API/schema/source 不改。Source / Verification 故意显示未核验和不可用边界。

在本 worktree 根目录运行 `node prototypes/discovery-wireframe/build-fixture.mjs`，再运行 `node prototypes/discovery-wireframe/server.mjs`，浏览器打开 `http://127.0.0.1:4312`。深链接由本地服务器 fallback 到原型入口，`/api/*` 返回404。搜索本地覆盖苏打绿/sodagreen/蘇打綠、台北、南京、春日、现场、未知/空查询；此词表只验证信息结构，不是另一个 SearchProvider。

运行 `node prototypes/discovery-wireframe/verify.mjs` 输出自动化交互检查与四尺寸截图。默认利用本机已有 bundled Playwright 和 Chromium；其它环境分别通过 `START_BROWSER_MODULES` 指定 node_modules 下 createRequire 锚点、`START_CHROMIUM_PATH` 指定浏览器可执行文件。没有下载或安装依赖。

场景：`/search?q=台北&state=loading|empty|error` 用于确定性截图，error 的重试恢复正常结果。Home 回车提交，中文组合输入不早提交；Search 点击 Artist 保留查询/滚动上下文；城市索引 sticky、点击定位和滚动同步；Route 行弹出 Stop Preview，SOURCE 再进入 VERIFICATION，PLACE 去详情，MAP 定位示意；START 清楚延期至003；Share 仅复制本机链接，失败时显示地址。地址在 Place 正文直接可见。

图像、字体、Doll 均不使用真实素材；矩形比例占位没有角色运行行为。Photo Spot/Angle、年份、地图 metrics 未收录显示空值。多城市空章、长地名和五站为排版压力示例。Event 只显示最小读弹层，没有 Event Hub。Community/Me 只保留三个主导航的延期提示。
