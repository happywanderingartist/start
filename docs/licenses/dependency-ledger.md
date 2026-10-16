# Fan-route 第三方依赖与参考项目台账

状态：初始模板。任何代码、素材、字体、地图数据或外部服务进入正式产品前都必须登记。

## 已安装代码依赖

实际版本以 `package.json` 与锁文件为准。本表只记录用途和复审要求，不代替自动化 SBOM。

| 依赖 | 用途 | 类型 | 复审要求 |
| --- | --- | --- | --- |
| React / React DOM | 界面运行时 | dependency | 升级时跑完整 App 测试和 390×844 验收 |
| React Router | 页面路由 | dependency | 检查深链接和 Sites fallback |
| Vite | 构建与开发 | dependency | 检查生产构建、Worker 打包和浏览器兼容 |
| Phosphor Icons | 界面图标 | dependency + assets | 保留许可证；不得用字符或临时 SVG 替代正式图标 |
| Vitest / Testing Library | 自动化测试 | development dependency | 不进入运行时包 |

## 仅作为研究参考，尚未引入代码

| 项目 | 当前用途 | 允许复用层级 | 许可证动作 |
| --- | --- | --- | --- |
| TREK | 离线、幂等、Add-on、Monorepo 参考 | pattern / interface | AGPL，禁止未批准的源码复制 |
| AdventureLog | 计划到记忆的生命周期参考 | pattern | GPL，禁止未批准的源码复制 |
| Cairn | 地图/列表/地点故事交互参考 | pattern；source 需单独审查 | MIT，源码使用需保留声明 |
| Turistar | 垂直切片和版本恢复参考 | pattern / interface | AGPL，独立实现 |
| TRIP | MVP 范围参考 | pattern | MIT，源码使用需登记 |
| GraphHopper / Valhalla | 地图服务边界参考 | pattern / interface | 当前不引入引擎 |

## 素材和数据规则

- 仓库代码许可证不自动覆盖 README 截图、照片、字体、角色和示例数据。
- 高德 POI、算路结果、地图瓦片和导航 URI 必须按对应服务条款使用。
- 用户上传照片、路线来源截图和粉丝内容必须记录来源、授权状态和可见范围。
- 娃娃正式资产必须记录 source reference、生成或编辑方式、人工验收和商业使用权。
- 无法确认许可证或授权时，资产状态必须为 unavailable，不得进入发布清单。

