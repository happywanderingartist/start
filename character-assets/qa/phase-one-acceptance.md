# Fan-route 角色资产阶段一验收

## 结论

阶段一共验收 18 张正式透明 PNG：2 张身份母版、8 张表情、8 张动作。所有资产使用 1536×1536 画布、`centerX = 768`、`footY = 1420`，清单中的 Face/Hair/Body/Material、配饰和参考一致性检查均为通过；6 张历史棋盘格草稿继续保留为 `rejected`，未进入正式发布集合。

## 正式文件

| 角色 | 类别 | 文件 | 来源 |
| --- | --- | --- | --- |
| 女娃 | base | `girl/base/girl_base_default_v1.png` | R01 |
| 女娃 | expression | `girl/expressions/girl_expr_default_v1.png` | `girl_base_default_v1` / R01 |
| 女娃 | expression | `girl/expressions/girl_expr_curious_v1.png` | `girl_base_default_v1` / R01 |
| 女娃 | expression | `girl/expressions/girl_expr_happy_open_eye_v1.png` | `girl_base_default_v1` / R01 |
| 女娃 | expression | `girl/expressions/girl_expr_surprised_v1.png` | `girl_base_default_v1` / R01 |
| 女娃 | action | `girl/actions/girl_action_idle_v1.png` | `girl_base_default_v1` / R01 |
| 女娃 | action | `girl/actions/girl_action_wave_v1.png` | `girl_base_default_v1` / R01 |
| 女娃 | action | `girl/actions/girl_action_walk_v1.png` | `girl_base_default_v1` / R01 |
| 女娃 | action | `girl/actions/girl_action_photo_v1.png` | `girl_base_default_v1` / R01 |
| 男娃 | base | `boy/base/boy_base_default_v1.png` | R02 |
| 男娃 | expression | `boy/expressions/boy_expr_default_v1.png` | `boy_base_default_v1` / R02 |
| 男娃 | expression | `boy/expressions/boy_expr_curious_v1.png` | `boy_base_default_v1` / R02 |
| 男娃 | expression | `boy/expressions/boy_expr_happy_open_eye_v1.png` | `boy_base_default_v1` / R02 |
| 男娃 | expression | `boy/expressions/boy_expr_surprised_v1.png` | `boy_base_default_v1` / R02 |
| 男娃 | action | `boy/actions/boy_action_idle_v1.png` | `boy_base_default_v1` / R02 |
| 男娃 | action | `boy/actions/boy_action_wave_v1.png` | `boy_base_default_v1` / R02 |
| 男娃 | action | `boy/actions/boy_action_walk_v1.png` | `boy_base_default_v1` / R02 |
| 男娃 | action | `boy/actions/boy_action_photo_v1.png` | `boy_base_default_v1` / R02 |

## 验收证据

- `qa/contact-sheets/identity-baseline-v1.png`：身份母版与 R01/R02 对照。
- `qa/contact-sheets/expression-baseline-v1.png`：两名角色的四种表情同尺度对照。
- `qa/contact-sheets/action-baseline-v1.png`：两名角色的四种动作同尺度对照。
- `qa/report.json`：自动门禁结果与正式资产计数。
- 复现命令：`pnpm test:assets`；完整仓库检查：`pnpm check`。
- 运行时回归：在 Chrome 中以 390×844 视口打开本地原型，实测 `innerWidth = 390`、`innerHeight = 844`、`scrollWidth = 390`、`scrollHeight = 844`，无横向溢出；控制台无应用错误，警告仅来自浏览器扩展。

## 已知限制与范围外内容

- 参考图只有正面企划板，阶段一不声明侧脸、背面、3D 拓扑或连续动画已解决。
- 动作资产保留母版脸部像素，允许动作引起的有限发丝与身体宽度变化；不得把这些动作稿反向覆盖身份母版。
- 女娃身份母版的狗耳遮挡区使用同一 R01 内无狗耳造型的原始头发像素补齐，没有生成新脸。
- 五套换装、独立配饰、前端角色组件、路线动画和拍照打卡均未包含在阶段一。
- 本阶段未修改 `src/` 运行时代码；390×844 视口验收只证明现有原型无回归，不代表角色资产已经接入产品界面。
