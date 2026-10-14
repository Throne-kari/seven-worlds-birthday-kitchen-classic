# 视觉素材与来源

正式网页使用七张原创 ImageGen 场景，均已实际查看。文字、表单、导航、食材、计时、地图节点、补给箱、手账、蜡烛火焰和鼠标由原生界面绘制；没有把完整设计参考图当作网页。

| 正式文件 | 原始 Library 资产 |
| --- | --- |
| `public/art/forest.png` | 原创生成素材 |
| `public/art/csgo.png` | 原创生成素材 |
| `public/art/delta.png` | 原创生成素材 |
| `public/art/pubg.png` | 原创生成素材 |
| `public/art/apex.png` | 原创生成素材 |
| `public/art/elden.png` | 原创生成素材 |
| `public/art/palworld.png` | 原创生成素材，无火焰版本 |

它们是完整的环境与食物合成场景，不是透明前景分层，也不是食谱实拍。浏览器负责视差、雾气、状态动画、各主题转场和真实控件。蜡烛坐标按原图与 cover 裁切实时换算；触屏也可以熄灭、重新点亮。

开发前已研究官方或可靠来源的真实画面：Endnight / Steam、Valve 2018 Panorama 与 2020 Broken Fang、Delta Force 官方、PUBG 官方及历史库存画面、Apex 界面作者 Brandon Pirruccello、Bandai Namco Elden Ring、Pocketpair / Steam。具体观察在 `DESIGN_SPEC.md` 和本机研究记录中。研究图片不进入 `dist` 或交付的源码包。

七张 ImageGen 页面参考已经在本机实际查看，目录为 `research/mockups`。最终页面文字以真实食谱为准，未采信参考图中的占位配方或数量。
