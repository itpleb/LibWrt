/* ==========================================================================
   LibWrt Modern Theme - 效果图交互逻辑
   纯原生 JS，无构建依赖。包含图标降级（离线可用）、主题、路由、图表、
   数据模拟、搜索、登录、Toast、配置面板等全部交互。
   ========================================================================== */

'use strict';

/* --------------------------------------------------------------------------
   0. 图标系统：Lucide CDN 优先，离线时用内置 SVG 兜底
   -------------------------------------------------------------------------- */
const ICON_PATHS = {
  'alert-triangle': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  'alert-circle': '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  'activity': '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  'chevron-left': '<path d="m15 18-6-6 6-6"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'layout-dashboard': '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
  'cpu': '<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/>',
  'globe': '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  'git-branch': '<line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
  'stethoscope': '<path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>',
  'settings': '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2Z"/><circle cx="12" cy="12" r="3"/>',
  'package': '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  'database': '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
  'rotate-cw': '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
  'shield': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  'hard-drive': '<line x1="22" x2="2" y1="12" y2="12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><line x1="6" x2="6.01" y1="16" y2="16"/><line x1="10" x2="10.01" y1="16" y2="16"/>',
  'box': '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  'terminal': '<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>',
  'external-link': '<path d="M15 3h6v6"/><path d="m10 14 11-11"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  'sun': '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  'moon': '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
  'menu': '<line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/>',
  'search': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  'memory-stick': '<rect width="8" height="16" x="4" y="2" rx="1"/><rect width="8" height="16" x="12" y="2" rx="1"/><path d="M8 8v.01M16 8v.01M8 12v.01M16 12v.01M8 16v.01M16 16v.01"/>',
  'thermometer': '<path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>',
  'user': '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  'user-cog': '<circle cx="18" cy="15" r="3"/><path d="m21.3 13.4-.3-.3M18 12.5v-1M15.4 13.9l-.4-.4M18 18v.01M14.6 16.1l-.4.4"/><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>',
  'key': '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>',
  'refresh-cw': '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
  'clock': '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  'wifi': '<path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.859a10 10 0 0 1 14 0"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/>',
  'lock': '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  'eye': '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  'eye-off': '<path d="m2 2 20 20"/><path d="M6.71 6.71C4.85 8.03 3.44 9.75 2.37 11.4a1 1 0 0 0 0 1.2C3.7 14.5 7.4 19 12 19c1.63 0 3.13-.5 4.44-1.25"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c4.6 0 8.3 4.5 9.63 6.4a1 1 0 0 1 0 1.2 16 16 0 0 1-1.67 2.16"/><path d="M14.12 9.88a3 3 0 1 1-4.24 4.24"/>',
  'check': '<polyline points="20 6 9 17 4 12"/>',
  'loader': '<line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>',
  'wrench': '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z"/>',
  'github': '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>',
  'x': '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  'bell': '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  'arrow-up': '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
  'arrow-down': '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
  'info': '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  'zap': '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  'ethernet': '<rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 14v-4h12v4M8 10V6h8v4M10 6V2h4v4"/>',
};

function iconSVG(name) {
  const body = ICON_PATHS[name] || ICON_PATHS['info'];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;width:1em;height:1em">${body}</svg>`;
}

function initIcons(root = document) {
  // 全部图标用内置 SVG（Lucide 风格路径）渲染，零外部依赖、离线可用。
  // 支持 root 为 document、某个元素、或单个 <i> 节点。
  let nodes;
  if (root.nodeType === 1 && root.hasAttribute && root.hasAttribute('data-lucide')) {
    nodes = [root];
  } else {
    nodes = (root.querySelectorAll ? root : document).querySelectorAll('i[data-lucide]');
  }
  nodes.forEach((el) => {
    if (el.dataset._done) return;
    el.innerHTML = iconSVG(el.getAttribute('data-lucide'));
    el.style.display = 'inline-flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.dataset._done = '1';
  });
}

/* --------------------------------------------------------------------------
   1. 小工具
   -------------------------------------------------------------------------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);
const fmtBytes = (mb) => mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb.toFixed(0)} MB`;
const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

let toastSeq = 0;
function toast(title, message, type = 'info', ttl = 3600) {
  const c = $('#toastContainer');
  if (!c) return;
  const icons = { success: 'check', warning: 'alert-triangle', danger: 'alert-circle', info: 'info' };
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `
    <span class="toast-icon">${iconSVG(icons[type] || 'info')}</span>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" aria-label="关闭">${iconSVG('x')}</button>`;
  c.appendChild(el);
  initIcons(el);
  const id = ++toastSeq;
  el.dataset.id = id;
  const remove = () => {
    el.classList.add('removing');
    setTimeout(() => el.remove(), 250);
  };
  $('.toast-close', el).addEventListener('click', remove);
  setTimeout(remove, ttl);
}

/* --------------------------------------------------------------------------
   2. 主题 / 强调色 / 密度
   -------------------------------------------------------------------------- */
const State = {
  theme: localStorage.getItem('libwrt-theme') || 'light',
  accent: localStorage.getItem('libwrt-accent') || 'blue',
  density: localStorage.getItem('libwrt-density') || 'compact',
  scaleMode: localStorage.getItem('libwrt-scale') || 'auto', // auto | 1 | 1.15 | 1.3 | 1.5 | 1.75 | 2
  interval: 0,
};

/* --------------------------------------------------------------------------
   2b. 全局自适应缩放
   按视口 CSS 逻辑宽度连续计算倍率，不写死"4K"：
     ≤1600  → 1.00（普通笔记本，保持 1:1 不放大）
     1600→3840 线性增长到 1.80（2K/4K 平滑变大）
     >3840 继续增长，上限 2.00（5K/8K 仍可读）
   手动档位（1 / 1.15 / 1.3 / 1.5 / 1.75 / 2）覆盖任意偏好，
   包括 macOS 系统缩放把 4K 渲染成 1920 CSS px 的情形。
   -------------------------------------------------------------------------- */
const SCALE_MIN = 1600, SCALE_AT = 3840, SCALE_MAX_RATIO = 1.80, SCALE_CAP = 2.00;

function autoScale() {
  const w = Math.max(window.innerWidth || 1600, 960); // 下限防窄屏误判
  if (w <= SCALE_MIN) return 1;
  const t = Math.min((w - SCALE_MIN) / (SCALE_AT - SCALE_MIN), 1);
  let s = 1 + t * (SCALE_MAX_RATIO - 1);
  // 超宽屏（>3840，如 5K/8K）继续缓增到上限
  if (w > SCALE_AT) s += Math.min((w - SCALE_AT) / SCALE_AT, 1) * 0.2;
  return Math.min(Math.round(clamp(s, 1, SCALE_CAP) * 100) / 100, SCALE_CAP);
}

function currentScale() {
  return State.scaleMode === 'auto' ? autoScale() : clamp(Number(State.scaleMode) || 1, 0.9, 2.2);
}

function applyScale() {
  const s = currentScale();
  document.documentElement.style.setProperty('--ui-scale', String(s));
  document.documentElement.setAttribute('data-scale', State.scaleMode);
  // 同步缩放档位选择器
  $$('#scaleSelect, input[name="scale"]').forEach((el) => {
    if (el.tagName === 'SELECT') el.value = State.scaleMode;
    else el.checked = el.value === State.scaleMode;
  });
  const label = $('#scaleValue');
  if (label) label.textContent = `${s.toFixed(2)}×`;
  return s;
}

function effectiveTheme() {
  if (State.theme === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return State.theme;
}

function applyState() {
  const eff = effectiveTheme();
  // 写入解析后的实际值，供 CSS 的 [data-theme="dark"] / [data-theme="light"] 命中
  document.documentElement.setAttribute('data-theme', eff);
  document.documentElement.setAttribute('data-accent', State.accent);
  document.documentElement.setAttribute('data-density', State.density);
  document.documentElement.setAttribute('data-theme-pref', State.theme); // 保留用户偏好
  applyScale();

  // 同步配置面板控件
  $$('input[name="theme"]').forEach((r) => { r.checked = r.value === State.theme; });
  $$('input[name="accent"]').forEach((r) => { r.checked = r.value === State.accent; });
  $$('input[name="density"]').forEach((r) => { r.checked = r.value === State.density; });

  // 供 canvas 图表判断深浅色
  document.body.classList.toggle('is-dark', eff === 'dark');

  // 同步 theme-color meta
  $$('meta[name="theme-color"]').forEach((m) => {
    const media = m.getAttribute('media') || '';
    const wantDark = media.includes('dark');
    m.content = eff === 'dark'
      ? (wantDark ? '#0f172a' : '#0f172a')
      : (wantDark ? '#ffffff' : '#2563eb');
  });
}

function cycleTheme() {
  State.theme = State.theme === 'auto' ? 'light' : State.theme === 'light' ? 'dark' : 'auto';
  localStorage.setItem('libwrt-theme', State.theme);
  applyState();
  drawAllCharts();
  const label = { auto: '跟随系统', light: '浅色', dark: '深色' }[State.theme];
  toast('主题已切换', `当前模式：${label}`, 'info', 1800);
}

/* --------------------------------------------------------------------------
   3. 侧边栏：折叠 + 移动端 + 子菜单
   -------------------------------------------------------------------------- */
function initSidebar() {
  const sidebar = $('#sidebar');
  const overlay = $('#sidebarOverlay');

  $('#sidebarToggle')?.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    $('#sidebarToggle').setAttribute('aria-expanded', String(!sidebar.classList.contains('collapsed')));
  });

  const openMobile = () => { sidebar.classList.add('open'); overlay.classList.add('visible'); $('#mobileMenuBtn').setAttribute('aria-expanded', 'true'); };
  const closeMobile = () => { sidebar.classList.remove('open'); overlay.classList.remove('visible'); $('#mobileMenuBtn').setAttribute('aria-expanded', 'false'); };

  $('#mobileMenuBtn')?.addEventListener('click', openMobile);
  overlay?.addEventListener('click', closeMobile);

  // 二级菜单展开
  $$('.nav-parent').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const children = document.getElementById(btn.getAttribute('aria-controls'));
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      if (children) children.hidden = expanded;
    });
  });

  // 折叠状态下 hover 显示弹出子菜单
  $$('.nav-has-children').forEach((li) => {
    li.addEventListener('mouseenter', () => {
      if (!sidebar.classList.contains('collapsed')) return;
      const btn = $('.nav-parent', li);
      const children = $('.nav-children', li);
      if (children) { children.hidden = false; btn.setAttribute('aria-expanded', 'true'); }
    });
    li.addEventListener('mouseleave', () => {
      if (!sidebar.classList.contains('collapsed')) return;
      const btn = $('.nav-parent', li);
      const children = $('.nav-children', li);
      if (children) { children.hidden = true; btn.setAttribute('aria-expanded', 'false'); }
    });
  });

  // 导航点击（效果图：切换 active + 更新标题）
  $$('.nav-link[data-page]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href && href !== '#' && !a.hasAttribute('target')) e.preventDefault();
      $$('.nav-link').forEach((n) => { n.classList.remove('active'); n.removeAttribute('aria-current'); });
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
      const title = ($('.nav-text', a)?.textContent || $('span', a)?.textContent || '页面').trim();
      $('#pageTitle').textContent = title;
      if (window.innerWidth <= 767) closeMobile();
      navigate(a.getAttribute('data-page'), title);
    });
  });
}

/* --------------------------------------------------------------------------
   4. 简易路由（效果图演示：概览 / 登录 / 404 / 维护）
   -------------------------------------------------------------------------- */
const pageTitles = { overview: '系统概览', login: '登录', '404': '页面未找到', maintenance: '系统维护' };

const FULLSCREEN_PAGES = ['login', '404', 'maintenance'];

function navigate(page, title) {
  const full = FULLSCREEN_PAGES.includes(page);

  if (full) {
    // 全屏页面：把对应 .page 挪到 body 下，脱离 .page-content 的裁剪/滚动上下文
    const p = $(`.page[data-page="${page}"]`);
    if (p && p.parentElement !== document.body) document.body.appendChild(p);
    document.body.classList.add('has-fullscreen-page');
    $$('.page').forEach((el) => { el.hidden = el.getAttribute('data-page') !== page; });
  } else {
    // 回到应用：把曾被挪出的全屏页放回 page-content 并隐藏
    const host = $('#pageContent');
    $$('body > .page').forEach((el) => { el.hidden = true; if (host) host.appendChild(el); });
    document.body.classList.remove('has-fullscreen-page');
    $$('.page').forEach((el) => { el.hidden = el.getAttribute('data-page') !== page; });
  }

  if (title) $('#pageTitle').textContent = title;
  if (page === 'overview') drawAllCharts();
  if (page === 'login') initLogin();
}

function initRouterLinks() {
  // 效果图预览条：一键切换演示页面
  $$('[data-demo-page]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const page = el.getAttribute('data-demo-page');
      $$('[data-demo-page]').forEach((b) => b.classList.toggle('active', b === el));
      navigate(page, pageTitles[page]);
    });
  });
  // 深浅色 / 强调色快捷切换
  $('#demoThemeLight')?.addEventListener('click', () => { State.theme = 'light'; localStorage.setItem('libwrt-theme', 'light'); applyState(); drawAllCharts(); });
  $('#demoThemeDark')?.addEventListener('click', () => { State.theme = 'dark'; localStorage.setItem('libwrt-theme', 'dark'); applyState(); drawAllCharts(); });
  const accents = ['blue', 'purple', 'emerald', 'red', 'orange', 'cyan'];
  $('#demoAccent')?.addEventListener('click', () => {
    const i = accents.indexOf(State.accent);
    State.accent = accents[(i + 1) % accents.length];
    localStorage.setItem('libwrt-accent', State.accent);
    applyState(); drawAllCharts();
    toast('强调色已切换', `当前：${State.accent}`, 'info', 1400);
  });
  // 缩放档位（自适应 / 手动）
  $('#scaleSelect')?.addEventListener('change', (e) => {
    State.scaleMode = e.target.value;
    localStorage.setItem('libwrt-scale', State.scaleMode);
    applyScale();
    if (!$('#page-overview').hidden) drawAllCharts();
    const s = currentScale().toFixed(2);
    toast('界面缩放已调整',
      State.scaleMode === 'auto'
        ? `跟随窗口自动缩放 · 当前 ${s}×`
        : `固定 ${s}×`,
      'info', 1800);
  });

  // 隐藏预览条
  $('#demoBarClose')?.addEventListener('click', () => {
    $('#demoBar')?.remove();
    document.body.classList.remove('demo-bar-visible');
  });
}

/* --------------------------------------------------------------------------
   5. 用户菜单 / 登出
   -------------------------------------------------------------------------- */
function initUserMenu() {
  const trigger = $('#userMenuTrigger');
  const dropdown = $('#userDropdown');
  trigger?.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = trigger.getAttribute('aria-expanded') === 'true';
    trigger.setAttribute('aria-expanded', String(!open));
    dropdown.hidden = open;
  });
  document.addEventListener('click', (e) => {
    if (!$('#userMenu')?.contains(e.target)) {
      trigger?.setAttribute('aria-expanded', 'false');
      if (dropdown) dropdown.hidden = true;
    }
  });
  const doLogout = () => {
    toast('已注销', '正在跳转到登录页面…', 'info', 1500);
    setTimeout(() => navigate('login', '登录'), 700);
  };
  $('#logoutMenuBtn')?.addEventListener('click', doLogout);
  $('#logoutBtn')?.addEventListener('click', doLogout);
  $('#goBackBtn')?.addEventListener('click', () => navigate('overview', pageTitles.overview));
}

/* --------------------------------------------------------------------------
   6. 配置面板
   -------------------------------------------------------------------------- */
function initConfigPanel() {
  const panel = $('#configPanel');
  const openPanel = () => { panel.hidden = false; };
  const closePanel = () => { panel.hidden = true; };

  $('#themeToggle')?.addEventListener('dblclick', openPanel); // 双击打开配置
  $('#configClose')?.addEventListener('click', closePanel);
  $('.config-backdrop', panel)?.addEventListener('click', closePanel);

  // Tab 切换
  $$('.config-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      $$('.config-tab').forEach((t) => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      $$('.config-panel-body').forEach((p) => { p.hidden = p.id !== `panel-${tab.dataset.tab}`; });
    });
  });

  // 主题 / 强调色 / 密度
  $$('input[name="theme"]').forEach((r) => r.addEventListener('change', () => { State.theme = r.value; localStorage.setItem('libwrt-theme', State.theme); applyState(); drawAllCharts(); }));
  $$('input[name="accent"]').forEach((r) => r.addEventListener('change', () => { State.accent = r.value; localStorage.setItem('libwrt-accent', State.accent); applyState(); drawAllCharts(); }));
  $$('input[name="density"]').forEach((r) => r.addEventListener('change', () => { State.density = r.value; localStorage.setItem('libwrt-density', State.density); applyState(); }));
  $$('input[name="scale"]').forEach((r) => r.addEventListener('change', () => {
    State.scaleMode = r.value;
    localStorage.setItem('libwrt-scale', State.scaleMode);
    applyScale();
    if (!$('#page-overview').hidden) drawAllCharts();
  }));

  // 顶部主题按钮：单击循环切换
  $('#themeToggle')?.addEventListener('click', (e) => {
    if (e.detail > 1) return; // 双击交给上面的 dblclick
    cycleTheme();
  });
}

/* --------------------------------------------------------------------------
   7. 全局搜索（模态框 + 快捷键）
   -------------------------------------------------------------------------- */
const SEARCH_INDEX = [
  { title: '系统概览', path: 'admin/status/overview', icon: 'layout-dashboard', page: 'overview', kw: '概览 状态 dashboard 首页' },
  { title: '实时图表', path: 'admin/status/realtime', icon: 'activity', page: 'overview', kw: '实时 图表 流量 监控' },
  { title: '网络接口', path: 'admin/network/network', icon: 'globe', page: 'overview', kw: '接口 网络 network interface' },
  { title: '无线网络', path: 'admin/network/wireless', icon: 'wifi', page: 'overview', kw: '无线 wifi 2.4g 5g ssid' },
  { title: '防火墙', path: 'admin/network/firewall', icon: 'shield', page: 'overview', kw: '防火墙 firewall 规则' },
  { title: 'DHCP / DNS', path: 'admin/network/dhcp', icon: 'database', page: 'overview', kw: 'dhcp dns 租约 域名' },
  { title: '静态路由', path: 'admin/network/routes', icon: 'git-branch', page: 'overview', kw: '路由 route 静态' },
  { title: '系统设置', path: 'admin/system/system', icon: 'settings', page: 'overview', kw: '系统 设置 主机名 时区' },
  { title: '管理密码', path: 'admin/system/admin', icon: 'key', page: 'overview', kw: '密码 管理员 root' },
  { title: '软件包', path: 'admin/system/packages', icon: 'package', page: 'overview', kw: '软件包 opkg 安装 更新' },
  { title: '备份 / 升级', path: 'admin/system/backup', icon: 'database', page: 'overview', kw: '备份 升级 固件 恢复' },
  { title: '启动项', path: 'admin/system/startup', icon: 'zap', page: 'overview', kw: '启动项 自启 服务' },
  { title: '定时任务', path: 'admin/system/crontab', icon: 'clock', page: 'overview', kw: '定时 cron 计划任务' },
  { title: '系统日志', path: 'admin/system/log', icon: 'terminal', page: 'overview', kw: '日志 log 内核 系统日志' },
  { title: '诊断工具', path: 'admin/network/diagnostics', icon: 'stethoscope', page: 'overview', kw: '诊断 ping traceroute nslookup' },
  { title: '终端', path: 'admin/services/ttyd', icon: 'terminal', page: 'overview', kw: '终端 ttyd ssh shell' },
  { title: '重启设备', path: 'admin/system/reboot', icon: 'rotate-cw', page: 'overview', kw: '重启 reboot 关机' },
  { title: '打开登录页', path: 'cgi-bin/luci', icon: 'log-out', page: 'login', kw: '登录 login 注销' },
  { title: '外观设置', path: 'theme/appearance', icon: 'sun', page: 'overview', kw: '主题 深色 浅色 外观 颜色' },
];

function renderSearchResults(q, container, modal = false) {
  const query = (q || '').trim().toLowerCase();
  let items = SEARCH_INDEX;
  if (query) {
    items = SEARCH_INDEX.filter((it) =>
      (it.title + ' ' + it.path + ' ' + (it.kw || '')).toLowerCase().includes(query));
  }
  if (!items.length) {
    container.innerHTML = `<div class="search-empty">未找到与 “${q}” 相关的结果</div>`;
    return;
  }
  const groupLabel = query ? '搜索结果' : '快速跳转';
  container.innerHTML = `
    <div class="search-result-group">
      <div class="search-result-group-label">${groupLabel} · ${items.length} 项</div>
      ${items.slice(0, 8).map((it, i) => `
        <div class="search-result-item ${i === 0 && query ? 'highlighted' : ''}" data-page="${it.page}" data-title="${it.title}">
          <span class="search-result-icon">${iconSVG(it.icon)}</span>
          <div class="search-result-content">
            <div class="search-result-title">${it.title}</div>
            <div class="search-result-path">${it.path}</div>
          </div>
        </div>`).join('')}
    </div>`;
  $$('.search-result-item', container).forEach((el) => {
    el.addEventListener('click', () => {
      navigate(el.dataset.page, el.dataset.title === '打开登录页' ? '登录' : el.dataset.title);
      closeSearchModal();
      toast('已跳转', `打开「${el.dataset.title}」`, 'success', 1600);
    });
  });
}

function openSearchModal(prefill = '') {
  const modal = $('#searchModal');
  modal.hidden = false;
  const input = $('#searchModalInput');
  input.value = prefill;
  renderSearchResults(prefill, $('#searchModalBody'), true);
  setTimeout(() => input.focus(), 30);
}
function closeSearchModal() { const m = $('#searchModal'); if (m) m.hidden = true; }

function initSearch() {
  $('#searchBtn')?.addEventListener('click', () => openSearchModal($('#searchInput').value));
  $('#searchInput')?.addEventListener('focus', () => openSearchModal($('#searchInput').value));
  $('#searchModalInput')?.addEventListener('input', (e) => renderSearchResults(e.target.value, $('#searchModalBody'), true));
  $('#searchModal')?.querySelector('.search-modal-backdrop')?.addEventListener('click', closeSearchModal);

  document.addEventListener('keydown', (e) => {
    // Cmd/Ctrl + K 打开搜索
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openSearchModal();
    }
    // Esc 关闭所有浮层
    if (e.key === 'Escape') {
      closeSearchModal();
      const panel = $('#configPanel'); if (panel) panel.hidden = true;
      const modal = $('#modalContainer'); if (modal) modal.hidden = true;
      const s = $('#searchResults'); if (s) s.hidden = true;
    }
    // Cmd/Ctrl + Shift + D 切换主题
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
      e.preventDefault(); cycleTheme();
    }
    // Cmd/Ctrl + B 折叠侧边栏
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault(); $('#sidebar')?.classList.toggle('collapsed');
    }
    // 搜索框内上下选择
    if (!$('#searchModal').hidden) {
      const items = $$('#searchModalBody .search-result-item');
      let idx = items.findIndex((i) => i.classList.contains('highlighted'));
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!items.length) return;
        idx = e.key === 'ArrowDown' ? (idx + 1) % items.length : (idx - 1 + items.length) % items.length;
        items.forEach((i) => i.classList.remove('highlighted'));
        items[idx].classList.add('highlighted');
        items[idx].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter' && idx >= 0) {
        e.preventDefault(); items[idx].click();
      }
    }
  });
}

/* --------------------------------------------------------------------------
   8. 登录页交互
   -------------------------------------------------------------------------- */
let loginInited = false;
function initLogin() {
  if (loginInited) return;
  loginInited = true;
  const form = $('#loginForm');
  const pwd = $('#password');
  $('#togglePassword')?.addEventListener('click', () => {
    const show = pwd.type === 'password';
    pwd.type = show ? 'text' : 'password';
    const icon = $('.toggle-icon', $('#togglePassword'));
    if (icon) {
      icon.setAttribute('data-lucide', show ? 'eye-off' : 'eye');
      icon.dataset._done = '';                 // 允许重新渲染
      icon.innerHTML = iconSVG(icon.getAttribute('data-lucide'));
      icon.dataset._done = '1';
    }
    $('#togglePassword').setAttribute('aria-pressed', String(show));
  });
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = $('#username').value.trim();
    const pass = pwd.value;
    const errBox = $('#loginError');
    const errText = $('#loginErrorText');
    errBox.hidden = true;
    $$('.form-input').forEach((i) => i.classList.remove('invalid'));
    let err = '';
    if (!user) err = '请输入用户名';
    else if (!pass) err = '请输入密码';
    if (err) {
      errText.textContent = err;
      errBox.hidden = false;
      (user ? pwd : $('#username')).classList.add('invalid');
      return;
    }
    const btn = $('#loginBtn');
    btn.classList.add('loading');
    btn.disabled = true;
    setTimeout(() => {
      btn.classList.remove('loading');
      btn.disabled = false;
      toast('登录成功', `欢迎回来，${user}`, 'success');
      setTimeout(() => navigate('overview', pageTitles.overview), 600);
    }, 1100);
  });
}

/* --------------------------------------------------------------------------
   9. 数据模拟 + 指标卡片
   -------------------------------------------------------------------------- */
const Metrics = {
  cpu: 23, mem: 61, storage: 34, temp: 52, clients: 14,
  uptimeSec: 3 * 86400 + 7 * 3600 + 42 * 60,
  rx: 2.4, tx: 0.8,
  history: { cpu: [], mem: [], temp: [], netRx: [], netTx: [] },
};

function seedHistory() {
  for (let i = 0; i < 40; i++) {
    Metrics.history.cpu.push(rand(12, 45));
    Metrics.history.mem.push(rand(55, 68));
    Metrics.history.temp.push(rand(46, 58));
    Metrics.history.netRx.push(rand(0.4, 3.2));
    Metrics.history.netTx.push(rand(0.1, 1.4));
  }
}
function pushHistory() {
  const h = Metrics.history;
  const step = (arr, min, max) => { arr.push(clamp(arr[arr.length - 1] + rand(-6, 6), min, max)); if (arr.length > 40) arr.shift(); };
  step(h.cpu, 5, 95); step(h.mem, 30, 90); step(h.temp, 38, 78);
  h.netRx.push(clamp(h.netRx[h.netRx.length - 1] + rand(-1.2, 1.2), 0, 6)); if (h.netRx.length > 40) h.netRx.shift();
  h.netTx.push(clamp(h.netTx[h.netTx.length - 1] + rand(-0.6, 0.6), 0, 3)); if (h.netTx.length > 40) h.netTx.shift();
  Metrics.cpu = h.cpu[h.cpu.length - 1];
  Metrics.mem = h.mem[h.mem.length - 1];
  Metrics.temp = h.temp[h.temp.length - 1];
  Metrics.rx = h.netRx[h.netRx.length - 1];
  Metrics.tx = h.netTx[h.netTx.length - 1];
}

function setRadial(type, pct) {
  const circle = $(`.radial-progress.${type}`);
  if (!circle) return;
  const C = 163.36;
  circle.style.setProperty('--progress-offset', String(C - (C * pct) / 100));
  circle.setAttribute('stroke-dashoffset', String(C - (C * pct) / 100));
}

function sparkline(svg, data, color) {
  if (!svg) return;
  const min = Math.min(...data), max = Math.max(...data), span = (max - min) || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${28 - ((v - min) / span) * 24}`).join(' ');
  svg.querySelector('polyline').setAttribute('points', pts);
  if (color) svg.style.color = color;
}

function fmtUptime(sec) {
  const d = Math.floor(sec / 86400), h = Math.floor((sec % 86400) / 3600), m = Math.floor((sec % 3600) / 60);
  return `${d} 天 ${h} 时 ${m} 分`;
}

function renderMetrics() {
  $('#metricCpu').textContent = `${Metrics.cpu.toFixed(0)}%`;
  $('#metricMem').textContent = `${Metrics.mem.toFixed(0)}%`;
  $('#metricStorage').textContent = `${Metrics.storage}%`;
  $('#metricTemp').textContent = `${Metrics.temp.toFixed(0)}°C`;
  $('#metricClients').textContent = Metrics.clients;
  $('#metricUptime').textContent = `${Math.floor(Metrics.uptimeSec / 86400)}天${Math.floor((Metrics.uptimeSec % 86400) / 3600)}时`;
  $('#memDetail').textContent = `${(1024 * Metrics.mem / 100).toFixed(0)} / 1024 MB`;
  $('#storageDetail').textContent = `${(128 * Metrics.storage / 100).toFixed(1)} / 128 GB`;
  $('#loadAvg').textContent = `负载: ${rand(0.1, 0.6).toFixed(2)}, ${rand(0.2, 0.7).toFixed(2)}, ${rand(0.3, 0.8).toFixed(2)}`;
  $('#netTraffic').textContent = `↑ ${Metrics.tx.toFixed(1)} MB/s  ↓ ${Metrics.rx.toFixed(1)} MB/s`;
  $('#cpuUsage').textContent = `${Metrics.cpu.toFixed(0)}%`;
  $('#memUsage').textContent = `${Metrics.mem.toFixed(0)}%`;
  $('#tempValue').textContent = `${Metrics.temp.toFixed(0)}°C`;
  $('#deviceUptime').textContent = `运行时间: ${fmtUptime(Metrics.uptimeSec)}`;
  $('#footerUptime').textContent = `运行时间: ${fmtUptime(Metrics.uptimeSec)}`;
  $('#footerLoad').textContent = `负载: ${rand(0.2, 0.6).toFixed(2)}`;

  setRadial('cpu', Metrics.cpu);
  setRadial('mem', Metrics.mem);
  setRadial('storage', Metrics.storage);
  setRadial('net', Math.min(100, Metrics.clients * 6));

  sparkline($('#cpuTrend .sparkline'), Metrics.history.cpu, cssVar('--color-primary'));
  sparkline($('#tempTrend .sparkline'), Metrics.history.temp, cssVar('--color-danger'));

  const zone = $('#tempZone');
  zone.textContent = Metrics.temp > 70 ? '偏高' : Metrics.temp > 60 ? '注意' : '正常';
  zone.className = 'temp-zone ' + (Metrics.temp > 70 ? 'critical' : Metrics.temp > 60 ? 'warn' : 'normal');
  const badge = $('#uptimeBadge');
  badge.textContent = Metrics.uptimeSec > 86400 ? '稳定运行' : '刚刚启动';
}

/* --------------------------------------------------------------------------
   10. Canvas 图表（自绘，零依赖，深浅色自适应）
   -------------------------------------------------------------------------- */
function chartColors() {
  const dark = document.body.classList.contains('is-dark');
  return {
    grid: dark ? 'rgba(148,163,184,0.12)' : 'rgba(100,116,139,0.12)',
    label: dark ? '#94a3b8' : '#64748b',
    primary: cssVar('--color-primary') || '#2563eb',
    success: cssVar('--color-success') || '#059669',
    warning: cssVar('--color-warning') || '#d97706',
    danger: cssVar('--color-danger') || '#dc2626',
    info: cssVar('--color-info') || '#0891b2',
    fillA: 'rgba(37,99,235,0.18)',
    fillB: 'rgba(5,150,105,0.15)',
  };
}

function setupCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const w = rect.width || canvas.parentElement.clientWidth || 400;
  const h = rect.height || 220;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}

function drawGrid(ctx, w, h, pad, c) {
  ctx.strokeStyle = c.grid;
  ctx.lineWidth = 1;
  ctx.fillStyle = c.label;
  ctx.font = '10px ui-monospace, monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let i = 0; i <= 4; i++) {
    const y = pad.t + (h - pad.t - pad.b) * (i / 4);
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
    ctx.fillText(`${100 - i * 25}`, pad.l - 6, y);
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  for (let i = 0; i <= 5; i++) {
    const x = pad.l + (w - pad.l - pad.r) * (i / 5);
    ctx.beginPath(); ctx.moveTo(x, pad.t); ctx.lineTo(x, h - pad.b); ctx.stroke();
    ctx.fillText(`-${(5 - i) * 10}m`, x, h - pad.b + 6);
  }
}

function withAlpha(color, a) {
  if (!color) return `rgba(37,99,235,${a})`;
  const c = color.trim();
  if (c.startsWith('#')) {
    let h = c.slice(1);
    if (h.length === 3) h = h.split('').map((x) => x + x).join('');
    const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  }
  if (c.startsWith('rgb(')) return c.replace('rgb(', 'rgba(').replace(')', `,${a})`);
  if (c.startsWith('rgba(')) return c.replace(/[\d.]+\)$/, `${a})`);
  return c;
}

function line(ctx, data, w, h, pad, color, maxVal = 100, fill = false) {
  const n = data.length;
  const x0 = pad.l, x1 = w - pad.r, y0 = pad.t, y1 = h - pad.b;
  const X = (i) => x0 + (x1 - x0) * (i / (n - 1));
  const Y = (v) => y1 - (y1 - y0) * (clamp(v, 0, maxVal) / maxVal);
  ctx.beginPath();
  data.forEach((v, i) => { i === 0 ? ctx.moveTo(X(i), Y(v)) : ctx.lineTo(X(i), Y(v)); });
  if (fill) {
    ctx.lineTo(X(n - 1), y1); ctx.lineTo(X(0), y1); ctx.closePath();
    const g = ctx.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0, withAlpha(color, 0.28));
    g.addColorStop(1, withAlpha(color, 0));
    ctx.fillStyle = g; ctx.fill();
    // 重新描边路径
    ctx.beginPath();
    data.forEach((v, i) => { i === 0 ? ctx.moveTo(X(i), Y(v)) : ctx.lineTo(X(i), Y(v)); });
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.stroke();
  // 末端圆点
  ctx.beginPath(); ctx.arc(X(n - 1), Y(data[n - 1]), 3.5, 0, Math.PI * 2);
  ctx.fillStyle = color; ctx.fill();
}

function drawLineChart(canvas, series, opts = {}) {
  if (!canvas) return;
  const { ctx, w, h } = setupCanvas(canvas);
  const c = chartColors();
  const pad = { t: 12, r: 12, b: 22, l: 30 };
  ctx.clearRect(0, 0, w, h);
  drawGrid(ctx, w, h, pad, c);
  series.forEach((s) => line(ctx, s.data, w, h, pad, s.color, opts.maxVal || 100, s.fill));
  // 图例
  const legend = opts.legendId && document.getElementById(opts.legendId);
  if (legend) {
    legend.innerHTML = series.map((s) => `<span class="legend-item"><span class="legend-color" style="background:${s.color}"></span>${s.name}</span>`).join('');
  }
}

function drawAreaChart(canvas, opts = {}) {
  if (!canvas) return;
  const { ctx, w, h } = setupCanvas(canvas);
  const c = chartColors();
  const pad = { t: 12, r: 12, b: 22, l: 30 };
  ctx.clearRect(0, 0, w, h);
  // 网格
  ctx.strokeStyle = c.grid; ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.t + (h - pad.t - pad.b) * (i / 4);
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
  }
  const rx = Metrics.history.netRx, tx = Metrics.history.netTx;
  const colorRx = 'rgb(5,150,105)', colorTx = 'rgb(37,99,235)';
  line(ctx, rx, w, h, pad, colorRx, 6, true);
  line(ctx, tx, w, h, pad, colorTx, 6, true);
  const legend = opts.legendId && document.getElementById(opts.legendId);
  if (legend) legend.innerHTML = `<span class="legend-item"><span class="legend-color" style="background:rgb(5,150,105)"></span>接收 ↓</span><span class="legend-item"><span class="legend-color" style="background:rgb(37,99,235)"></span>发送 ↑</span>`;
}

function drawAllCharts() {
  const h = Metrics.history;
  drawLineChart($('#cpuChart'), [
    { name: 'CPU 使用率', data: h.cpu, color: chartColors().primary, fill: true },
  ], { legendId: 'cpuChartLegend', maxVal: 100 });
  drawLineChart($('#memChart'), [
    { name: '已用内存', data: h.mem, color: chartColors().success, fill: true },
    { name: '缓存/Buffers', data: h.mem.map((v) => v * 0.35), color: chartColors().info },
  ], { legendId: 'memChartLegend', maxVal: 100 });
  drawAreaChart($('#netChart'), { legendId: 'netChartLegend' });
  drawLineChart($('#tempChart'), [
    { name: 'CPU 温度', data: h.temp, color: chartColors().danger, fill: true },
  ], { legendId: 'tempChartLegend', maxVal: 100 });
}

/* --------------------------------------------------------------------------
   11. 接口表格 / 日志 / 通知
   -------------------------------------------------------------------------- */
const INTERFACES = [
  { name: 'eth0', type: 'WAN', up: true, v4: '192.168.1.100/24', v6: 'fe80::a2bb:ccff:fe00:11/64', rx: '1.24 GB', tx: '342 MB', rate: 46 },
  { name: 'br-lan', type: 'LAN', up: true, v4: '192.168.2.1/24', v6: 'fd00:abcd::1/64', rx: '8.71 GB', tx: '12.3 GB', rate: 72 },
  { name: 'wlan0', type: '2.4G', up: true, v4: '—', v6: '—', rx: '2.10 GB', tx: '980 MB', rate: 33 },
  { name: 'wlan1', type: '5G', up: true, v4: '—', v6: '—', rx: '5.62 GB', tx: '2.41 GB', rate: 58 },
  { name: 'eth1', type: 'LAN', up: false, v4: '—', v6: '—', rx: '0 B', tx: '0 B', rate: 0 },
  { name: 'tailscale0', type: 'VPN', up: true, v4: '100.64.0.1/32', v6: 'fd7a:115c::1/128', rx: '124 MB', tx: '89 MB', rate: 12 },
];

function renderInterfaces() {
  const body = $('#interfacesBody');
  if (!body) return;
  body.innerHTML = INTERFACES.map((it) => `
    <tr class="interface-row ${it.up ? 'up' : 'down'}">
      <td><div class="interface-name">${iconSVG(it.type === 'VPN' ? 'shield' : it.type.includes('G') ? 'wifi' : 'ethernet')} ${it.name} <span class="interface-type">${it.type}</span></div></td>
      <td><span class="badge ${it.up ? 'badge-success' : 'badge-neutral'} badge-dot">${it.up ? '已连接' : '未连接'}</span></td>
      <td><span class="ip-address">${it.v4}</span></td>
      <td><span class="ip-address">${it.v6}</span></td>
      <td><span class="ip-address traffic-rx">↓ ${it.rx}</span></td>
      <td><span class="ip-address traffic-tx">↑ ${it.tx}</span></td>
      <td><div class="rate-bar"><div class="rate-fill" style="width:${it.rate}%"></div></div></td>
      <td><button class="btn btn-ghost btn-sm" title="编辑">${iconSVG('settings')}</button></td>
    </tr>`).join('');
}

const LOG_SEED = [
  { t: '22:41:03', lvl: 'info', msg: 'dnsmasq[1842]: DHCPREQUEST(br-lan) 192.168.2.108 a4:83:e7:xx:xx:xx' },
  { t: '22:40:58', lvl: 'info', msg: 'hostapd: wlan1: STA 3c:22:fb:xx:xx:xx IEEE 802.11: associated' },
  { t: '22:39:12', lvl: 'warning', msg: 'kernel: [12345.6] nss-dp: eth0 link speed changed to 1000Mbps' },
  { t: '22:35:44', lvl: 'info', msg: 'dropbear[2210]: Password auth succeeded for root from 192.168.2.105' },
  { t: '22:30:01', lvl: 'info', msg: 'crond[1520]: USER root pid 3301 cmd /usr/bin/libwrt-healthcheck' },
  { t: '22:28:17', lvl: 'error', msg: 'uhttpd[1203]: Failed to bind [::]:80 (Address in use)' },
  { t: '22:20:05', lvl: 'info', msg: 'netifd: Network device br-lan link is up' },
];
function renderLogs() {
  const list = $('#logList');
  if (!list) return;
  list.innerHTML = LOG_SEED.map((l) => `
    <div class="log-item">
      <span class="log-time">${l.t}</span>
      <div class="log-content">
        <span class="log-level ${l.lvl}">${l.lvl.toUpperCase()}</span>
        <div>${l.msg}</div>
      </div>
    </div>`).join('');
}

function renderNotices() {
  const list = $('#noticeList');
  if (!list) return;
  const data = [
    { t: '2 分钟前', icon: 'package', title: '有 3 个软件包可更新', msg: 'luci-app-passwall、tailscale、ca-certificates 有新版本可用。', type: 'info' },
    { t: '1 小时前', icon: 'shield', title: '防火墙规则已生效', msg: '新增的端口转发规则已由 netifd 重新加载。', type: 'success' },
    { t: '今天 08:12', icon: 'activity', title: 'WAN 流量峰值提醒', msg: '过去 24 小时下行峰值达到 92 Mbps（22:10）。', type: 'warning' },
    { t: '昨天', icon: 'database', title: '配置自动备份完成', msg: '系统配置已备份至 /etc/config/backup-20261111.tar.gz。', type: 'info' },
  ];
  list.innerHTML = data.map((n) => `
    <div class="notice-item">
      <span class="toast-icon toast-${n.type}" style="color:var(--color-${n.type === 'success' ? 'success' : n.type === 'warning' ? 'warning' : 'info'})">${iconSVG(n.icon)}</span>
      <div class="notice-content">
        <div class="notice-title">${n.title}</div>
        <div class="notice-message">${n.msg}</div>
      </div>
      <span class="notice-time">${n.t}</span>
    </div>`).join('');
}

/* --------------------------------------------------------------------------
   12. 自动刷新 / 时钟 / 按钮组
   -------------------------------------------------------------------------- */
let refreshTimer = null;
function tick() {
  Metrics.uptimeSec += 5;
  pushHistory();
  renderMetrics();
  drawAllCharts();
}
function setIntervalMode(sec, btn) {
  State.interval = sec;
  $$('[data-interval]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
  if (refreshTimer) clearInterval(refreshTimer);
  if (sec > 0) {
    refreshTimer = setInterval(tick, sec * 1000);
    toast('自动刷新已开启', `每 ${sec} 秒刷新一次数据`, 'info', 1800);
  }
}
function initControls() {
  $$('[data-interval]').forEach((btn) => {
    btn.addEventListener('click', () => setIntervalMode(Number(btn.dataset.interval), btn));
  });
  const doRefresh = () => { tick(); toast('数据已刷新', '所有指标已更新至最新状态', 'success', 1500); };
  $('#refreshBtn')?.addEventListener('click', doRefresh);
  $('#refreshInterfaces')?.addEventListener('click', () => { renderInterfaces(); toast('接口列表已刷新', '网络接口状态已更新', 'success', 1500); });
  $$('#cpuChartRange, #memChartRange, #tempChartRange, #netChartInterface').forEach((sel) => {
    sel.addEventListener('change', () => { seedHistory(); drawAllCharts(); toast('图表范围已切换', `当前：${sel.options[sel.selectedIndex].text}`, 'info', 1400); });
  });

  // 时钟
  const updateClock = () => {
    const d = new Date();
    const el = $('#footerTime');
    if (el) el.textContent = d.toLocaleTimeString('zh-CN', { hour12: false });
  };
  updateClock();
  setInterval(updateClock, 1000);

  // 更新徽标
  const pkgBadge = $('#pkgUpdates');
  if (pkgBadge) { pkgBadge.textContent = '3'; pkgBadge.hidden = false; }
}

/* --------------------------------------------------------------------------
   13. 进度条演示
   -------------------------------------------------------------------------- */
function demoProgress() {
  const bar = $('#progressBar');
  if (!bar) return;
  const fill = $('.progress-bar-fill', bar);
  bar.hidden = false;
  let p = 0;
  const id = setInterval(() => {
    p += rand(8, 22);
    fill.style.width = `${Math.min(p, 100)}%`;
    if (p >= 100) {
      clearInterval(id);
      setTimeout(() => { bar.hidden = true; fill.style.width = '0%'; }, 350);
    }
  }, 120);
}

/* --------------------------------------------------------------------------
   14. 初始化
   -------------------------------------------------------------------------- */
function boot() {
  if ($('#demoBar')) document.body.classList.add('demo-bar-visible');
  applyState();
  initIcons();
  initSidebar();
  initUserMenu();
  initConfigPanel();
  initSearch();
  initRouterLinks();
  initControls();

  seedHistory();
  renderMetrics();
  renderInterfaces();
  renderLogs();
  renderNotices();
  drawAllCharts();
  initLogin();
  demoProgress();

  // 系统配色变化时重绘
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (State.theme === 'auto') { applyState(); drawAllCharts(); }
  });
  // 窗口缩放：重算自适应倍率（含把窗口拖到不同 DPI 屏幕）+ 重绘图表
  let resizeT = null, lastScale = currentScale();
  const onResize = () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => {
      const s = applyScale();                 // 实时更新 --ui-scale
      if (Math.abs(s - lastScale) > 0.001) lastScale = s;
      if (!$('#page-overview').hidden) drawAllCharts();
    }, 120);
  };
  window.addEventListener('resize', onResize);
  // 浏览器缩放 / 外接屏切换时 innerWidth 会变，一并监听
  window.visualViewport?.addEventListener('resize', onResize);

  // 欢迎提示
  setTimeout(() => toast('LibWrt 现代主题效果图', '已加载演示数据 · 点击右上角头像或 ⌘K 试试搜索', 'success', 4200), 900);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
// 补一次图标初始化，覆盖 boot 之后动态注入的节点
window.addEventListener('load', () => initIcons());
