<div align="center">

# 香域 · 传统香料可视化平台

### Spice Realm · Traditional Spice Visualization Platform

从时间、空间与流动三个维度，探索六种中国传统香料的历史轨迹与文化价值。

[![访问在线项目](https://img.shields.io/badge/访问在线项目-8B5B38?style=for-the-badge&logo=githubpages&logoColor=white)](https://chenchen-zz.github.io/Spice-Realm-Traditional-Spice-Visualization-Platform/)
[![English](https://img.shields.io/badge/English-436F83?style=for-the-badge)](docs/README.en.md)
[![中文](https://img.shields.io/badge/中文-83363A?style=for-the-badge)](README.md)

![Vue](https://img.shields.io/badge/Vue-3.5-42B883?logo=vuedotjs&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)
![ECharts](https://img.shields.io/badge/ECharts-6.0-AA344D)
![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub_Pages-222222?logo=github)

</div>

---

## 项目介绍

**香域**是一款围绕沉香、檀香、龙涎香、麝香、丁香与藿香构建的交互式数据可视化平台。项目把零散的历史事件、产区信息与贸易路径组织成可探索的视觉叙事，帮助用户直观理解传统香料在不同朝代、地理区域和文化用途中的变化。

### 核心功能

- **历史热度**：以唐、宋、元、明、清为时间轴，通过堆叠面积图比较六大香料的使用热度。
- **历史事件**：结合市舶司、海禁、隆庆开关等事件解释热度变化。
- **产区地图**：使用高德地图展示现代香料产区，并通过雷达图呈现地区特征。
- **香料流转**：通过桑基图连接香料、产地、贸易路线与最终用途。
- **响应式体验**：兼容桌面端和移动端，并提供平滑滚动与交互提示。
- **自动部署**：推送到 `main` 后由 GitHub Actions 自动构建并发布到 GitHub Pages。

## 在线访问

点击下面的按钮访问已部署的网站：

### [进入「香域」在线平台 →](https://chenchen-zz.github.io/Spice-Realm-Traditional-Spice-Visualization-Platform/)

如果页面刚刚更新，请等待 GitHub Actions 完成部署，并使用 `Ctrl + F5` 强制刷新缓存。

## 技术栈

| 类型 | 技术 |
| --- | --- |
| 前端框架 | Vue 3 |
| 构建工具 | Vite |
| 数据可视化 | Apache ECharts |
| 地图服务 | 高德地图 JavaScript API 2.0 |
| 路由 | Vue Router |
| 自动部署 | GitHub Actions + GitHub Pages |

## 项目结构

```text
.
├─ .github/
│  └─ workflows/
│     └─ deploy.yml              # GitHub Pages 自动部署
├─ docs/
│  └─ README.en.md               # English documentation
├─ public/
│  └─ data/                      # 浏览器运行时加载的数据
├─ src/
│  ├─ assets/
│  │  ├─ images/                 # 页面图片
│  │  └─ videos/                 # 压缩后的网页背景视频
│  ├─ data/
│  │  └─ events/                 # 历史事件数据
│  ├─ router/                    # 路由配置
│  ├─ views/
│  │  └─ sections/               # 首页、时间、空间、流转模块
│  ├─ App.vue
│  └─ main.js
├─ .env.example                  # 环境变量示例
├─ index.html
├─ package.json
└─ vite.config.js
```

## 本地部署

### 1. 环境要求

- Node.js 20 或更高版本
- npm
- 一个“Web 端（JS API）”类型的高德地图 Key

### 2. 克隆仓库

```bash
git clone git@github.com:chenchen-zz/Spice-Realm-Traditional-Spice-Visualization-Platform.git
cd Spice-Realm-Traditional-Spice-Visualization-Platform
```

也可以使用 HTTPS：

```bash
git clone https://github.com/chenchen-zz/Spice-Realm-Traditional-Spice-Visualization-Platform.git
```

### 3. 安装依赖

```bash
npm install
```

### 4. 配置高德地图

复制环境变量示例：

```powershell
Copy-Item .env.example .env.local
```

macOS 或 Linux：

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```env
VITE_AMAP_KEY=你的高德Web端Key
VITE_AMAP_SECURITY_CODE=你的securityJsCode
```

#### 线上部署的域名白名单

在线上部署时，在高德开放平台中将你自己的 GitHub Pages 域名加入安全域名白名单：

```text
<你的GitHub用户名>.github.io
```

例如，本项目的 GitHub 用户名是 `chenchen-zz`，因此原项目使用
`chenchen-zz.github.io`。如果你的用户名是 `example-user`，则应填写
`example-user.github.io`。通常只填写域名，不需要附加仓库路径。

#### 本地开发注意事项

高德控制台可能会把 `localhost` 和 `127.0.0.1` 判定为不规范域名，因此不要将它们填写到域名白名单中。

本地执行 `npm run dev` 时，如果地图无法加载并提示 `INVALID_USER_DOMAIN`：

1. 进入高德开放平台中对应 Key 的安全设置。
2. 暂时取消或清空域名白名单。
3. 完成本地开发和调试。
4. 部署上线前，重新将 `<你的GitHub用户名>.github.io` 加入白名单。

具体说明请参考
[高德官方 `INVALID_USER_DOMAIN` 说明](https://lbs.amap.com/faq/js-api/map-js-api/create-project/46515)。

> `.env.local` 已被 Git 忽略，请勿将真实密钥提交到仓库。

### 5. 启动开发环境

```bash
npm run dev
```

根据终端提示访问本地地址，通常为：

```text
http://localhost:5173/Spice-Realm-Traditional-Spice-Visualization-Platform/
```

### 6. 构建与预览

```bash
npm run build
npm run preview
```

构建结果会生成在 `dist/`，该目录无需提交。

## 部署到自己的 GitHub Pages

1. Fork 或复制本仓库。
2. 如果仓库名称不同，修改 `vite.config.js` 中的 `base`：

   ```js
   base: '/你的仓库名/',
   ```

3. 在仓库中进入 `Settings → Secrets and variables → Actions`，添加：

   ```text
   VITE_AMAP_KEY
   VITE_AMAP_SECURITY_CODE
   ```

4. 进入 `Settings → Pages`，将发布源设置为 `GitHub Actions`。
5. 推送到 `main` 分支：

   ```bash
   git add .
   git commit -m "Deploy project"
   git push
   ```

6. 等待 `Actions → Deploy to GitHub Pages` 显示绿色对勾。

## 数据与安全说明

- `public/data/` 中的数据会随静态网站公开发布。
- Vite 的前端环境变量会被编译进浏览器代码，因此高德 Key 必须配置域名白名单。
- `.env.local`、`node_modules/` 和 `dist/` 不应提交。
- 首页视频已针对网页播放压缩，并启用 MP4 Fast Start。

## 常用命令

```bash
npm run dev       # 启动开发服务器
npm run build     # 生成生产构建
npm run preview   # 本地预览生产构建
```

## 许可证

本项目用于数据可视化学习与展示。引用项目数据、图片或文案前，请确认相应素材的授权范围。
