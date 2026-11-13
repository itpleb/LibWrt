# LibWrt 现代化主题 · 效果图原型

为 LibWrt / LuCI（OpenWrt 25.12-nss，qualcommax/ipq60xx）设计的新一代管理界面主题。
纯 HTML + CSS + 原生 JS，**零构建、零外部依赖**，双击 `index.html` 即可离线预览。

## 预览

方式一：直接双击 `index.html`（`file://` 也能跑）。
方式二（推荐）：起本地服务：

```bash
cd theme-mockup
python3 -m http.server 8899
# 打开 http://127.0.0.1:8899
```

顶部**效果图预览条**可一键切换：

| 按钮 | 作用 |
|------|------|
| 仪表盘 / 登录页 / 404 / 维护 | 切换演示页面 |
| 浅色 / 深色 | 明暗主题 |
| 换色 | 循环切换 6 种强调色（蓝/紫/翠绿/红/橙/青） |
| × | 隐藏预览条（仅演示用） |

其他可交互点：
- 左侧菜单折叠、二级菜单展开、移动端抽屉
- `⌘/Ctrl + K` 全局搜索、`⌘/Ctrl + Shift + D` 切主题、`⌘/Ctrl + B` 折叠侧栏
- 头像下拉菜单、注销 → 登录页
- 主题按钮单击循环 自动→浅色→深色，双击打开「快捷设置」侧滑面板（主题/密度/通知/快捷键）
- 指标卡片、Canvas 实时图表、接口表格、日志、通知均为模拟数据；刷新/自动刷新（10/30/60s）会持续更新
- Toast 通知、登录表单校验、密码显隐、404/维护页

## 文件结构

```
theme-mockup/
├── index.html                 # 单页：仪表盘 + 登录 + 404 + 维护 + 全部浮层/弹窗
├── README.md
└── assets/
    ├── css/
    │   ├── theme.css          # 设计令牌（色彩/字体/间距/圆角/阴影/层级）+ 明暗主题 + 强调色/密度变体 + 工具类
    │   ├── components.css     # 组件库：按钮/表单/卡片/表格/侧栏/顶栏/模态框/Toast/配置面板/搜索…
    │   └── pages.css          # 页面级：仪表盘动画、各业务页（无线/防火墙/软件包/诊断/终端）样式、打印样式
    └── js/
        └── app.js             # 全部交互：内置 SVG 图标、主题、路由、图表、数据模拟、搜索、登录、快捷键
```

## 设计要点

- **设计令牌驱动**：所有颜色/间距/圆角/阴影走 CSS 变量，`data-theme` / `data-accent` / `data-density` 切换整套皮肤。
- **明暗双主题**：深色下把 `*-light` 强调色底改为半透明，避免亮块刺眼；Canvas 图表随主题重绘。
- **全局自适应缩放（解决 4K 字体过小）**：核心是 `--ui-scale` 变量 + `html { font-size: calc(16px * var(--ui-scale)) }`。
  所有 `rem` 字号、`rem` 间距、`rem` 圆角，以及 `--sidebar-width / --topbar-height / --footer-height / --container-max`
  等布局尺寸都乘上该倍率；Canvas 图表高度、`100vh` 补偿、预览条偏移同步跟随。
  倍率**按视口 CSS 逻辑宽度连续计算，不写死"4K"这个分辨率**：
  - ≤1600 CSS px → `1.00×`（普通笔记本保持 1:1，不放大）
  - 1600→3840 线性增长到 `1.80×`（2K/3K/4K 平滑变大，等效字号 16→28.8px）
  - >3840 继续缓增到 `2.00×` 上限（5K/8K 仍可读）
  - 监听 `resize` 与 `visualViewport.resize`，把窗口拖到不同 DPI 屏幕、或改浏览器缩放时实时重算并重绘图表
  - 另提供手动档 `自适应 / 100% / 115% / 130% / 150% / 175% / 200%`（顶部预览条下拉 + 快捷设置面板均可设），
    存 `localStorage`，覆盖 macOS 系统缩放把 4K 渲染成 1920 CSS px 等情形
  - 实测：1440 视口侧栏 239px、3840 视口侧栏 431px，倍率 1.80×，与理论一致
- **信息密度可调**：`compact / comfortable / spacious` 三档，联动侧栏宽度、顶栏高度，且同样乘 `--ui-scale`。
- **响应式**：≥1024 完整布局；768–1023 收起搜索/状态指示器；<768 侧栏变抽屉、卡片单列；<480 顶栏精简。
- **无障碍**：语义化标签、`aria-*` 状态、`role`、`:focus-visible` 轮廓、`prefers-reduced-motion`、`noscript` 降级、键盘导航。
- **零依赖**：图标全部为内置 Lucide 风格 SVG，图表用原生 Canvas 自绘，字体走系统字体栈，`file://` 离线完整可用。

## 对接真实 LuCI（落地路径）

本原型是**视觉/交互效果图**，接入 LuCI 时建议按 `luci-theme-argon` 的组织方式拆包：

1. 新建 `feeds/luci/themes/luci-theme-libwrt/`：
   - `Makefile`：`LUCI_TITLE:=Modern LibWrt Theme`、`LUCI_DEPENDS:=+luci-base`，`include ../../luci.mk`
   - `htdocs/luci-static/libwrt/`：把 `assets/css/*` 合并为 `cascade.css`，图标/字体按需内置
   - `ucode/template/themes/libwrt/`：`head.ut` / `header.ut` / `footer.ut` / `sysauth.ut` 等，
     用 ucode 输出本原型的 DOM 骨架（`header.ut` 里 `#mainmenu` 由 `ui.js` 填充，保留 `<div id="maincontent">` 容器）
2. 样式作用域：LuCI 用 `<body class="...">` 且自带 `cascade.css`，本原型的全局重置要收窄到主题容器内，
   避免影响 `cbi.js`/`form.js` 生成的原生控件；把 `.btn`/`.form-input` 等映射到 `.cbi-button` / `.cbi-input-*`。
3. 数据替换：`app.js` 里的 `Metrics` / `INTERFACES` / `LOG_SEED` 改为读 `L`/`rpc`/`ubus`：
   - 指标：`ubus call system info` / `luci-mod-status` 的 JSON-RPC
   - 图表：`luci-mod-status` 的 `realtime/*.json` 或 `collectd` 数据
   - 菜单：`ui-menu` 从 `/admin/menu` 加载后渲染进 `#mainmenu`
4. 主题切换：LuCI 通过 `uci set luci.main.mediaurlbase=/luci-static/libwrt` 生效；把原型偏好存到
   `localStorage` 或 `uci` 的 `luci.themes` 段。
5. 删除演示资产：预览条（`#demoBar`）、`app.js` 的模拟数据、`SEARCH_INDEX` 里的演示项。

## 与现有主题对比

| 维度 | Argon（现用） | 本原型 |
|------|---------------|--------|
| 视觉 | 顶部栏 + 卡片，偏 Material | 侧边导航 + 指标卡 + 实时图表，偏现代 Dashboard |
| 主题 | 明暗需配置 | 自动/浅色/深色 + 6 强调色，一键切换 |
| 图表 | 无概览图表 | CPU/内存/流量/温度 4 组实时图表 |
| 搜索 | 无 | `⌘K` 全局命令面板 |
| 依赖 | 字体/图标文件 | 全内置，零外部请求 |
