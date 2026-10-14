# GitHub Pages 部署

本版本通过 `.github/workflows/pages.yml` 发布到独立 GitHub Pages 项目站点。源码和发布文件均可公开访问。现有私有 Sites 预览独立保留，Pages 不依赖 Sites。

工作流在 main 更新或手动触发时执行 npm ci、测试、食谱校验、构建和发布。PAGES_BASE_PATH 使用 GitHub Pages 返回的项目路径；未设置时保持相对路径，便于本地预览。

主题和食谱通过 `?world=...&recipe=...` 查询参数定位，刷新仍请求项目目录的 index.html，不依赖服务器重写。图像经 BASE_URL 生成路径，食谱数据随 JavaScript 构建，不请求服务器绝对路径。

发布时使用 GitHub noreply 提交身份。仓库不收录私人提示词、研究材料、健康历史、个人路径、凭据、浏览器数据和运行日志。采购、收藏、菜单、步骤与计时仅保存在访问者自己的浏览器中。
