# START 第一批行程与纪念卡原型

入口：http://127.0.0.1:4313/。从首页搜索示例艺人“苏打绿”，进入路线后点击 START；没有记录时直接打开 Journey / Book 会显示开始入口。当前演示仅存本浏览器临时状态。

运行：在本目录 prototype/ 执行 `node server.mjs`。测试在本目录执行：

```powershell
node --test tests/journey-state.test.mjs tests/memory-state.test.mjs
node tests/journey-browser.mjs
node tests/memory-browser.mjs
node tests/memory-sandbox.mjs
```

浏览器测试依赖已安装 D 盘 Playwright 与 Chromium，具体路径在测试脚本中；没有新增包或 CDN。测试会创建各自的合成浏览器记录，不使用用户的实际照片。

视觉及运行边界见 DELIVERY_REPORT.md；最新色卡见 PALETTE_AND_UI_CONTRACT.md；自评见 DESIGN_REVIEW.md。原始输入、同步和源码清单分别在 INPUT_PROVENANCE.json、OPEN_DESIGN_SYNC.json、PROTOTYPE_MANIFEST.json。源码和截图均位于此 D 盘交付目录。
