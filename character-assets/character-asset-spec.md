# Fan-route 角色资产阶段一规格

## 目标

以 `references/R01_girl_final_reference.png` 和 `references/R02_boy_final_reference.png` 为唯一身份基准，制作可以继续扩展的男女娃透明身份母版，以及首批表情和动作资产。阶段一只建立可信基线，不制作完整换装系统，也不接入前端。

## 范围

- 男女娃透明身份母版各 1 张。
- 男女娃表情各 4 张：`default`、`curious`、`happy_open_eye`、`surprised`。
- 男女娃动作各 4 张：`idle`、`wave`、`walk`、`photo`。
- 统一清单、自动格式检查、人工视觉验收记录和对照预览图。
- `validation/drafts/` 中现有 6 张 RGB 棋盘格图只作失败样本，不得进入正式清单。

## 唯一视觉基准

- 女娃：`references/R01_girl_final_reference.png`
- 男娃：`references/R02_boy_final_reference.png`
- 冲突优先级：R01/R02 → 本规格 → 已验收资产 → 新生成结果。

## 资产契约

- 文件格式：PNG，必须存在真实 Alpha 通道并至少包含一个非不透明像素。
- 画布：`1536 × 1536`。
- 锚点：`center_x = 768`，`foot_y = 1420`。
- 每张图只包含一个角色；完整头发、身体和鞋底不得裁切。
- 正式资产不得包含棋盘格、纯色背景、投影、地面、文字、水印或装饰边框。
- 默认服装：女娃使用 R01 日常休闲造型并关闭帽子、包和狗耳朵；男娃使用 R02 灰色卫衣造型并关闭斜挎包。
- Face、Hair、Body、Material Lock 优先于表情和动作；任何一项人工验收失败即 `REJECT`。

## 阶段一目录

```text
character-assets/
├── references/
├── girl/
│   ├── base/
│   ├── expressions/
│   └── actions/
├── boy/
│   ├── base/
│   ├── expressions/
│   └── actions/
├── qa/
│   ├── contact-sheets/
│   └── report.json
├── validation/drafts/
├── character-assets.json
└── character-asset-spec.md
```

## 正式资产门禁

资产只有同时满足以下条件才能写入 `character-assets.json` 的 `releaseAssets`：格式检查通过、人工 Face/Hair/Body/Material Lock 全部通过、文件名与角色/类别一致、没有未确认配饰、男女服装未混用。阶段一通过后，换装与配饰、前端角色渲染、拍照打卡分别制定后续计划。
