/* ==========================================================
   Coding Reel Studio — Home / Dashboard
   UI-only prototype: no real functionality yet.
   ========================================================== */

(function () {
  'use strict';

  /* ---- Bottom nav: visual active state only ---- */
  const navItems = document.querySelectorAll('.bottom-nav .nav-item');
  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      navItems.forEach((n) => n.classList.remove('active'));
      item.classList.add('active');
    });
  });

  /* ---- Project cards: soft glow follows the pointer ---- */
  const cards = document.querySelectorAll('.card');
  cards.forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--mx', '50%');
      card.style.setProperty('--my', '0%');
    });
  });
})();


/* ==========================================================
   STEP 2 — Projects, New Project modal, Workspace
   Storage: localStorage ("crs.projects"). No backend.
   ========================================================== */
(function () {
  'use strict';

  const KEY = 'crs.projects';
  const $ = (id) => document.getElementById(id);
  const el = { home: $('homeView'), ws: $('workspace'), modal: $('projectModal'), form: $('projectForm'), name: $('projectName'),
    grid: document.querySelector('.grid'), wsName: $('wsName'), save: $('saveState'), sel: $('deviceSel'), list: $('fileList'),
    code: $('code'), hl: $('hl'), curFile: $('curFile'), lang: $('edLang'), frame: $('frame'), device: $('device'),
    scaler: $('scaler'), stage: $('stage'), vp: $('vpLabel') };

  const DEVICES = { phone: [390, 844], tablet: [820, 1180], desktop: [1440, 900] };

  /* ---------- Starter files ---------- */
  const STARTER = {
    'index.html': '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>My Project</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <main class="card">\n    <h1>Hello, Reel Studio</h1>\n    <p>Edit the code and watch this update.</p>\n    <button id="btn">Clicked 0 times</button>\n  </main>\n  <script src="script.js"></script>\n</body>\n</html>\n',
    'style.css': '* { box-sizing: border-box; margin: 0; }\n\nbody {\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n  font-family: system-ui, sans-serif;\n  background: #0f1020;\n  color: #fff;\n}\n\n.card {\n  padding: 32px;\n  text-align: center;\n  border-radius: 20px;\n  background: rgba(255, 255, 255, 0.08);\n  border: 1px solid rgba(255, 255, 255, 0.15);\n}\n\np { margin: 8px 0 20px; opacity: 0.7; }\n\nbutton {\n  padding: 12px 22px;\n  border: 0;\n  border-radius: 12px;\n  font-size: 1rem;\n  color: #fff;\n  background: linear-gradient(120deg, #ff8a3d, #8b5cf6);\n}\n',
    'script.js': "const btn = document.getElementById('btn');\nlet count = 0;\n\nbtn.addEventListener('click', () => {\n  count++;\n  btn.textContent = `Clicked ${count} times`;\n});\n",
    blank: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>Untitled</title>\n</head>\n<body>\n\n</body>\n</html>\n'
  };

  /* ---------- Sample website (Pour-over timer) ---------- */
  const SAMPLE = {
    "index.html": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <title>Pour-Over Timer</title>\n  <link rel=\"stylesheet\" href=\"style.css\">\n</head>\n<body>\n  <main class=\"app\">\n    <h1>Pour-over,<br>by the second.</h1>\n    <p class=\"lead\">A V60 timer that scales to your cups.</p>\n\n    <section class=\"dose\" aria-label=\"Dose\">\n      <button id=\"minus\" aria-label=\"Fewer cups\">&minus;</button>\n      <div class=\"amount\"><b id=\"cups\">2</b><span>cups</span></div>\n      <button id=\"plus\" aria-label=\"More cups\">+</button>\n    </section>\n\n    <p class=\"recipe\">\n      <span>Coffee <b id=\"coffee\">30 g</b></span>\n      <span>Water <b id=\"water\">500 ml</b></span>\n    </p>\n\n    <section class=\"dial\">\n      <svg viewBox=\"0 0 120 120\" aria-hidden=\"true\">\n        <circle class=\"track\" cx=\"60\" cy=\"60\" r=\"54\"/>\n        <circle class=\"bar\" id=\"ring\" cx=\"60\" cy=\"60\" r=\"54\"/>\n      </svg>\n      <div class=\"clock\" id=\"clock\">0:00</div>\n    </section>\n\n    <ol class=\"steps\">\n      <li><span>0:00</span>Bloom the grounds</li>\n      <li><span>0:30</span>First pour</li>\n      <li><span>1:15</span>Second pour</li>\n      <li><span>2:00</span>Let it drain</li>\n    </ol>\n\n    <button class=\"go\" id=\"start\">Start brew</button>\n  </main>\n  <script src=\"script.js\"></script>\n</body>\n</html>\n",
    "style.css": ":root {\n  --ink: #0f1b24;\n  --card: #182a37;\n  --line: #2a4254;\n  --crema: #f0c27a;\n  --mint: #9fe3cb;\n  --text: #e8eef2;\n  --dim: #8aa0ae;\n}\n\n* { box-sizing: border-box; margin: 0; }\n\nbody {\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n  padding: 24px 18px;\n  font-family: system-ui, sans-serif;\n  color: var(--text);\n  background: radial-gradient(120% 60% at 50% 0%, #1c3445, var(--ink) 70%);\n}\n\n.app { width: 100%; max-width: 360px; display: grid; gap: 16px; }\n\nh1 { font: 700 2rem/1.05 Georgia, serif; letter-spacing: -.02em; }\n.lead { margin-top: -8px; font-size: .92rem; color: var(--dim); }\n\n.dose {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 10px;\n  border-radius: 20px;\n  background: var(--card);\n  border: 1px solid var(--line);\n}\n.dose button {\n  width: 48px;\n  height: 48px;\n  border: 0;\n  border-radius: 14px;\n  font-size: 1.5rem;\n  color: var(--text);\n  background: #223a4a;\n  cursor: pointer;\n  transition: transform .15s, background .2s;\n}\n.dose button:active { transform: scale(.9); background: var(--crema); color: var(--ink); }\n.amount { text-align: center; }\n.amount b { display: block; font: 700 2rem/1 Georgia, serif; }\n.amount span { font-size: .8rem; color: var(--dim); }\n\n.recipe { display: flex; justify-content: space-around; font-size: .9rem; color: var(--dim); }\n.recipe b { font-weight: 600; color: var(--crema); }\n\n.dial { position: relative; width: 190px; height: 190px; margin: 0 auto; }\n.dial svg { width: 100%; height: 100%; transform: rotate(-90deg); }\n.dial circle { fill: none; stroke-width: 7; }\n.track { stroke: var(--line); }\n.bar {\n  stroke: var(--mint);\n  stroke-linecap: round;\n  stroke-dasharray: 339.3;\n  stroke-dashoffset: 339.3;\n}\n.clock {\n  position: absolute;\n  inset: 0;\n  display: grid;\n  place-items: center;\n  font: 700 2.6rem Georgia, serif;\n  font-variant-numeric: tabular-nums;\n}\n\n.steps { list-style: none; padding: 0; display: grid; gap: 6px; }\n.steps li {\n  display: flex;\n  gap: 12px;\n  padding: 10px 14px;\n  border-radius: 12px;\n  font-size: .92rem;\n  color: var(--dim);\n  transition: background .25s, color .25s;\n}\n.steps span { width: 36px; font-variant-numeric: tabular-nums; }\n.steps .done { color: var(--mint); }\n.steps .now { color: var(--ink); background: var(--crema); font-weight: 600; }\n\n.go {\n  height: 54px;\n  border: 0;\n  border-radius: 16px;\n  font: 700 1rem system-ui, sans-serif;\n  color: var(--ink);\n  background: var(--mint);\n  cursor: pointer;\n  transition: transform .15s;\n}\n.go:active { transform: scale(.97); }\n",
    "script.js": "const cupsEl = document.getElementById('cups');\nconst coffeeEl = document.getElementById('coffee');\nconst waterEl = document.getElementById('water');\nconst startBtn = document.getElementById('start');\nconst ring = document.getElementById('ring');\nconst clock = document.getElementById('clock');\nconst steps = [...document.querySelectorAll('.steps li')];\n\nconst TOTAL = 150;   // brew length in seconds\nconst SPEED = 8;     // preview runs faster so you can watch it\nconst CIRC = 2 * Math.PI * 54;\nconst STEP_AT = [0, 30, 75, 120];\n\nlet cups = 2;\nlet timer = null;\nlet t = 0;\n\nfunction renderDose() {\n  cupsEl.textContent = cups;\n  coffeeEl.textContent = cups * 15 + ' g';\n  waterEl.textContent = cups * 250 + ' ml';\n}\n\nfunction fmt(s) {\n  return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');\n}\n\nfunction draw() {\n  ring.style.strokeDashoffset = CIRC * (1 - t / TOTAL);\n  clock.textContent = fmt(t);\n  const now = STEP_AT.filter((x) => t >= x).length - 1;\n  steps.forEach((li, n) => {\n    li.classList.toggle('now', !!timer && n === now);\n    li.classList.toggle('done', n < now || t >= TOTAL);\n  });\n}\n\ndocument.getElementById('minus').addEventListener('click', () => {\n  cups = Math.max(1, cups - 1);\n  renderDose();\n});\n\ndocument.getElementById('plus').addEventListener('click', () => {\n  cups = Math.min(6, cups + 1);\n  renderDose();\n});\n\nstartBtn.addEventListener('click', () => {\n  if (timer) {\n    clearInterval(timer);\n    timer = null;\n    t = 0;\n    startBtn.textContent = 'Start brew';\n    draw();\n    return;\n  }\n  t = 0;\n  startBtn.textContent = 'Reset';\n  timer = setInterval(() => {\n    t += SPEED / 20;\n    if (t >= TOTAL) {\n      t = TOTAL;\n      clearInterval(timer);\n      timer = null;\n      startBtn.textContent = 'Start brew';\n    }\n    draw();\n  }, 50);\n});\n\nrenderDose();\ndraw();\n"
  };

  const SAMPLE2 = {
    "index.html": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <title>Palette Roller</title>\n  <link rel=\"stylesheet\" href=\"style.css\">\n</head>\n<body>\n  <main class=\"app\">\n    <h1>Palette roller</h1>\n    <p class=\"lead\">Pick a mood, then roll five colors.</p>\n\n    <div class=\"modes\">\n      <button class=\"mode on\" data-mode=\"warm\">Warm</button>\n      <button class=\"mode\" data-mode=\"cool\">Cool</button>\n      <button class=\"mode\" data-mode=\"wild\">Wild</button>\n    </div>\n\n    <div class=\"swatches\">\n      <div class=\"sw\"><span>#000000</span></div>\n      <div class=\"sw\"><span>#000000</span></div>\n      <div class=\"sw\"><span>#000000</span></div>\n      <div class=\"sw\"><span>#000000</span></div>\n      <div class=\"sw\"><span>#000000</span></div>\n    </div>\n\n    <button class=\"roll\" id=\"roll\">Roll palette</button>\n  </main>\n  <script src=\"script.js\"></script>\n</body>\n</html>\n",
    "style.css": "* { box-sizing: border-box; margin: 0; }\n\nbody {\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n  padding: 24px 18px;\n  font-family: system-ui, sans-serif;\n  color: #f4f4f8;\n  background: #14141a;\n}\n\n.app { width: 100%; max-width: 360px; display: grid; gap: 16px; }\n\nh1 { font: 800 2.2rem/1 system-ui, sans-serif; letter-spacing: -.04em; }\n.lead { margin-top: -8px; font-size: .92rem; color: #9a9ab0; }\n\n.modes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }\n.mode {\n  height: 44px;\n  border: 1px solid #34344a;\n  border-radius: 12px;\n  font: 600 .9rem system-ui, sans-serif;\n  color: #c9c9dc;\n  background: transparent;\n  cursor: pointer;\n  transition: background .2s, color .2s;\n}\n.mode.on { color: #14141a; background: #f4f4f8; border-color: #f4f4f8; }\n\n.swatches { display: grid; border-radius: 20px; overflow: hidden; }\n.sw {\n  height: 78px;\n  display: flex;\n  align-items: center;\n  padding: 0 20px;\n  font: 600 1rem ui-monospace, Menlo, monospace;\n  transition: background .35s;\n}\n\n.roll {\n  height: 54px;\n  border: 0;\n  border-radius: 16px;\n  font: 700 1rem system-ui, sans-serif;\n  color: #14141a;\n  background: #f4f4f8;\n  cursor: pointer;\n  transition: transform .15s;\n}\n.roll:active { transform: scale(.97); }\n",
    "script.js": "const swatches = [...document.querySelectorAll('.sw')];\nconst modes = [...document.querySelectorAll('.mode')];\n\nconst RANGES = { warm: [0, 50], cool: [170, 260], wild: [0, 360] };\nlet mode = 'warm';\n\nconst rand = (a, b) => a + Math.random() * (b - a);\n\nfunction toHex(h, s, l) {\n  s /= 100;\n  l /= 100;\n  const k = (n) => (n + h / 30) % 12;\n  const a = s * Math.min(l, 1 - l);\n  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));\n  return '#' + [f(0), f(8), f(4)]\n    .map((x) => Math.round(x * 255).toString(16).padStart(2, '0'))\n    .join('');\n}\n\nfunction roll() {\n  const [from, to] = RANGES[mode];\n  swatches.forEach((sw, i) => {\n    const hex = toHex(rand(from, to), rand(55, 85), 30 + i * 10 + rand(-4, 4));\n    sw.style.background = hex;\n    sw.style.color = i > 2 ? '#111' : '#fff';\n    sw.querySelector('span').textContent = hex;\n  });\n}\n\nmodes.forEach((btn) => {\n  btn.addEventListener('click', () => {\n    mode = btn.dataset.mode;\n    modes.forEach((m) => m.classList.toggle('on', m === btn));\n    roll();\n  });\n});\n\ndocument.getElementById('roll').addEventListener('click', roll);\nroll();\n"
  };
  const SAMPLES = { sample: SAMPLE, sample2: SAMPLE2 };

  /* ---------- Storage ---------- */
  let projects = [];
  let current = null;
  try { projects = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { projects = []; }
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(projects)); return true; } catch (e) { return false; }
  }
  const uid = () => (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  function createProject(name, type) {
    const now = new Date().toISOString();
    const files = type === 'blank'
      ? [{ name: 'index.html', content: STARTER.blank }]
      : ['index.html', 'style.css', 'script.js'].map((n) => ({ name: n, content: (SAMPLES[type] || STARTER)[n] }));
    const p = { id: uid(), name: name, type: type, files: files, kept: false, created: now, updated: now };
    projects.unshift(p);
    persist();
    return p;
  }

  /* ---------- Home: saved project cards ---------- */
  function timeAgo(iso) {
    const m = Math.floor((Date.now() - new Date(iso)) / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return m + (m === 1 ? ' minute ago' : ' minutes ago');
    const h = Math.floor(m / 60);
    if (h < 24) return h + (h === 1 ? ' hour ago' : ' hours ago');
    const d = Math.floor(h / 24);
    return d === 1 ? 'yesterday' : d + ' days ago';
  }

  function renderProjects() {
    el.grid.querySelectorAll('.card[data-id], .empty').forEach((c) => c.remove());
    const list = projects.slice().sort((a, b) => new Date(b.updated) - new Date(a.updated)).slice(0, 5);
    if (!list.length) {
      const e = document.createElement('p');
      e.className = 'empty';
      e.textContent = 'No projects yet. Press New Project to start.';
      el.grid.appendChild(e);
      return;
    }
    list.forEach((p) => {
      const tags = p.type === 'blank' ? '<span class="tag html">HTML</span>'
        : '<span class="tag html">HTML</span><span class="tag css">CSS</span><span class="tag js">JS</span>';
      const card = document.createElement('article');
      card.className = 'card';
      card.dataset.id = p.id;
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.innerHTML =
        '<div class="thumb"><div class="code"><i style="--w:60%" class="o"></i><i style="--w:78%"></i><i style="--w:42%" class="b"></i><i style="--w:66%"></i><i style="--w:34%" class="p"></i></div><div class="pv"><span class="pill">Open</span></div></div>' +
        '<div class="card-body"><div class="card-top"><h3>' + esc(p.name) + '</h3>' +
        '<button type="button" class="icon-btn sm" data-menu aria-label="Project menu" aria-haspopup="menu"><svg class="ic fill"><use href="#i-dots"/></svg></button>' +
        '<div class="card-menu" role="menu"><button type="button" role="menuitem" data-del>Delete project</button></div></div>' +
        '<div class="tags">' + tags + '</div>' +
        '<p class="edited"><svg class="ic"><use href="#i-clock"/></svg>Edited ' + timeAgo(p.updated) + '</p></div>';
      el.grid.appendChild(card);
    });
  }
  function deleteProject(id) {
    const p = projects.find((x) => x.id === id);
    if (!p) return;
    if (!window.confirm('Delete "' + p.name + '"? This cannot be undone.')) return;
    projects = projects.filter((x) => x.id !== id);
    persist();
    renderProjects();
  }
  const openCard = (card) => { const p = projects.find((x) => x.id === card.dataset.id); if (p) openWorkspace(p); };
  el.grid.addEventListener('click', (e) => {
    const del = e.target.closest('[data-del]');
    if (del) { deleteProject(del.closest('.card').dataset.id); return; }
    const dots = e.target.closest('[data-menu]');
    if (dots) {
      const card = dots.closest('.card'), open = !card.classList.contains('menu-open');
      el.grid.querySelectorAll('.card.menu-open').forEach((c) => c.classList.remove('menu-open'));
      card.classList.toggle('menu-open', open);
      return;
    }
    if (e.target.closest('.card-menu')) return;
    const c = e.target.closest('.card[data-id]');
    if (c) openCard(c);
  });
  el.grid.addEventListener('keydown', (e) => {
    const c = e.target.closest('.card[data-id]');
    if (c && e.target === c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openCard(c); }
  });
  document.addEventListener('click', (e) => {
    if (e.target.closest('.card-menu, [data-menu]')) return;
    el.grid.querySelectorAll('.card.menu-open').forEach((c) => c.classList.remove('menu-open'));
  });
  document.addEventListener('pointermove', (e) => {
    const c = e.target.closest && e.target.closest('.card');
    if (!c) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
    c.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
  });

  /* ---------- Modal ---------- */
  let lastFocus = null;
  function openModal() {
    lastFocus = document.activeElement;
    el.form.reset();
    el.name.classList.remove('err');
    el.modal.hidden = false;
    setTimeout(() => el.name.focus(), 50);
  }
  function closeModal() { el.modal.hidden = true; if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  document.querySelectorAll('#homeView .btn-primary, #homeView .btn-ghost, #homeView .nav-create').forEach((b) => b.addEventListener('click', openModal));
  el.modal.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !el.modal.hidden) closeModal(); });
  el.name.addEventListener('input', () => el.name.classList.remove('err'));
  el.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const type = el.form.elements.ptype.value;
    const name = el.name.value.trim() || ({ sample: 'Pour-Over Timer', sample2: 'Palette Roller' }[type] || '');
    if (!name) { el.name.classList.add('err'); el.name.focus(); return; }
    const p = createProject(name, type);
    el.modal.hidden = true;
    renderProjects();
    openWorkspace(p);
  });

  /* ---------- Workspace ---------- */
  let activeFile = null, saveT = 0, prevT = 0;

  function openWorkspace(p) {
    animStop();
    current = p;
    activeFile = p.files[0];
    el.wsName.textContent = p.name;
    el.ws.dataset.pane = 'code';
    el.ws.classList.remove('files-open');
    document.querySelectorAll('.ws-tabs button').forEach((b) => b.classList.toggle('on', b.dataset.pane === 'code'));
    setState('saved');
    el.home.hidden = true;
    el.ws.hidden = false;
    document.body.classList.add('ws-open');
    buildFileList();
    loadFile();
    applyDevice();
    renderPreview();
  }
  function closeWorkspace() {
    animStop();
    flushSave();
    el.ws.hidden = true;
    el.home.hidden = false;
    document.body.classList.remove('ws-open');
    current = null;
    renderProjects();
    window.scrollTo(0, 0);
  }
  $('wsBack').addEventListener('click', closeWorkspace);

  function langOf(n) { return n.endsWith('.css') ? 'css' : n.endsWith('.js') ? 'js' : 'html'; }
  function buildFileList() {
    el.list.innerHTML = '';
    current.files.forEach((f) => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.className = f === activeFile ? 'on' : '';
      b.innerHTML = '<i class="f-' + langOf(f.name) + '"></i>';
      b.append(f.name);
      b.addEventListener('click', () => { animStop(); activeFile = f; buildFileList(); loadFile(); el.ws.classList.remove('files-open'); });
      li.appendChild(b);
      el.list.appendChild(li);
    });
  }
  function loadFile() {
    el.code.value = activeFile.content;
    el.curFile.textContent = activeFile.name;
    el.lang.textContent = langOf(activeFile.name).toUpperCase();
    highlight();
    el.code.scrollTop = el.code.scrollLeft = 0;
    syncScroll();
  }
  $('fileBtn').addEventListener('click', (e) => { e.stopPropagation(); el.ws.classList.toggle('files-open'); });
  document.addEventListener('click', (e) => { if (!e.target.closest('#wsFiles')) el.ws.classList.remove('files-open'); });

  document.querySelectorAll('.ws-tabs button').forEach((b) => b.addEventListener('click', () => {
    el.ws.dataset.pane = b.dataset.pane;
    document.querySelectorAll('.ws-tabs button').forEach((x) => x.classList.toggle('on', x === b));
    requestAnimationFrame(fit);
  }));

  /* Basic syntax highlighting (editor overlay) */
  const RULES = {
    html: [/(&lt;!--[\s\S]*?--&gt;)|(&lt;\/?[a-zA-Z][\w-]*|\/?&gt;)|("[^"\n]*"|'[^'\n]*')|(\s[\w:-]+(?==))/g, ['c', 't', 's', 'a']],
    css: [/(\/\*[\s\S]*?\*\/)|("[^"\n]*"|'[^'\n]*')|(#[0-9a-fA-F]{3,8}\b|\b\d+\.?\d*(?:px|%|em|rem|vh|vw|s|ms|deg)?\b)|([\w-]+)(?=\s*:)/g, ['c', 's', 'n', 'p']],
    js: [/(\/\/.*|\/\*[\s\S]*?\*\/)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\[\s\S])*`)|(\b(?:const|let|var|function|return|if|else|for|while|new|class|import|export|from|async|await|true|false|null|undefined|this|typeof|of|in)\b)|(\b\d+\.?\d*\b)/g, ['c', 's', 'k', 'n']]
  };
  function hlText(text, lang) {
    const [re, cls] = RULES[lang];
    return esc(text).replace(re, function () {
      const g = Array.prototype.slice.call(arguments, 1, 1 + cls.length);
      const i = g.findIndex((x) => x !== undefined);
      return '<span class="tk-' + cls[i] + '">' + g[i] + '</span>';
    });
  }
  function highlight() {
    el.hl.innerHTML = hlText(el.code.value, langOf(activeFile.name)) + '\n';
    updateGutter();
  }
  const gIn = $('gIn');
  let gLines = 0;
  function updateGutter() {
    const n = el.code.value.split('\n').length;
    if (n === gLines) return;
    gLines = n;
    let t = '';
    for (let i = 1; i <= n; i++) t += i + '\n';
    gIn.textContent = t;
  }
  function syncScroll() {
    const st = el.code.scrollTop, sl = el.code.scrollLeft;
    el.hl.style.transform = 'translate(' + (-sl) + 'px,' + (-st) + 'px)';
    gIn.style.transform = 'translateY(' + (-st) + 'px)';
  }
  el.code.addEventListener('scroll', syncScroll);
  function insert(t) {
    el.code.focus();
    if (!document.execCommand || !document.execCommand('insertText', false, t)) {
      el.code.setRangeText(t, el.code.selectionStart, el.code.selectionEnd, 'end');
      el.code.dispatchEvent(new Event('input'));
    }
  }
  function indentLines(out) {
    const v = el.code.value, s = el.code.selectionStart, e = el.code.selectionEnd;
    const ls = v.lastIndexOf('\n', s - 1) + 1;
    let le = v.indexOf('\n', e); if (le < 0) le = v.length;
    const block = v.slice(ls, le), orig = block.split('\n');
    const lines = orig.map((l) => out ? l.replace(/^( {1,2}|\t)/, '') : '  ' + l);
    const nb = lines.join('\n');
    el.code.setSelectionRange(ls, le);
    insert(nb);
    el.code.setSelectionRange(Math.max(ls, s + lines[0].length - orig[0].length), e + nb.length - block.length);
  }
  el.code.addEventListener('keydown', (e) => {
    if (e.isComposing || e.ctrlKey || e.metaKey || e.altKey) return;
    const v = el.code.value, s = el.code.selectionStart, en = el.code.selectionEnd;
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey || s !== en) indentLines(e.shiftKey); else insert('  ');
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const ls = v.lastIndexOf('\n', s - 1) + 1;
      const indent = /^[ \t]*/.exec(v.slice(ls, s))[0];
      const prev = v[s - 1], next = v[en];
      let ins = '\n' + indent, back = 0;
      if (prev === '{' || prev === '(' || prev === '[') {
        ins += '  ';
        if ({ '{': '}', '(': ')', '[': ']' }[prev] === next) { ins += '\n' + indent; back = 1 + indent.length; }
      }
      insert(ins);
      if (back) { const c = el.code.selectionStart - back; el.code.setSelectionRange(c, c); }
    }
  });
  el.code.addEventListener('input', () => {
    activeFile.content = el.code.value;
    highlight();
    syncScroll();
    setState('saving');
    clearTimeout(saveT); saveT = setTimeout(flushSave, 500);
    clearTimeout(prevT); prevT = setTimeout(renderPreview, 300);
  });

  /* Save */
  function setState(s) {
    el.save.dataset.state = s;
    el.save.querySelector('em').textContent = s === 'saving' ? 'Saving…' : s === 'error' ? 'Not saved' : 'Saved';
  }
  function flushSave() {
    clearTimeout(saveT);
    if (!current) return;
    current.updated = new Date().toISOString();
    setState(persist() ? 'saved' : 'error');
  }

  /* Live preview (sandboxed iframe, srcdoc) */
  function buildDoc(ov) {
    const f = (n) => (ov && ov.name === n) ? ov : current.files.find((x) => x.name === n);
    const idx = f('index.html');
    let html = idx ? idx.content : '';
    html = html.replace(/<link[^>]*href=["']([^"']+)["'][^>]*>/gi, (m, h) => {
      const x = f(h); return x && /stylesheet/i.test(m) ? '<style>' + x.content + '</style>' : m;
    });
    html = html.replace(/<script([^>]*?)\ssrc=["']([^"']+)["']([^>]*)>\s*<\/script>/gi, (m, a, h, b) => {
      const x = f(h); return x ? '<script' + a + b + '>' + x.content.replace(/<\/script/gi, '<\\/script') + '<\/script>' : m;
    });
    return html;
  }
  function renderPreview(ov) { if (current) el.frame.srcdoc = buildDoc(ov); }

  /* Preview device: real viewport size + scaled to fit */
  function applyDevice() {
    const d = el.sel.value, size = DEVICES[d];
    el.device.dataset.device = d;
    el.frame.style.width = size[0] + 'px';
    el.frame.style.height = size[1] + 'px';
    el.vp.textContent = size[0] + ' × ' + size[1];
    fit();
  }
  function fit() {
    if (el.ws.hidden || !el.stage.clientWidth) return;
    const w = el.device.offsetWidth, h = el.device.offsetHeight;
    const s = Math.min((el.stage.clientWidth - 32) / w, (el.stage.clientHeight - 32) / h, 1);
    el.device.style.transform = 'scale(' + s + ')';
    el.scaler.style.width = w * s + 'px';
    el.scaler.style.height = h * s + 'px';
  }
  el.sel.addEventListener('change', applyDevice);
  if (window.ResizeObserver) new ResizeObserver(fit).observe(el.stage);
  window.addEventListener('resize', fit);
  window.addEventListener('pagehide', flushSave);

  /* ---------- Mobile keyboard: keep the editor visible ---------- */
  const vv = window.visualViewport;
  function vvSync() {
    if (!vv || el.ws.hidden) return;
    const kb = window.innerWidth < 960 && window.innerHeight - vv.height > 120;
    el.ws.classList.toggle('kb', kb);
    el.ws.style.height = kb ? vv.height + 'px' : '';
    el.ws.style.top = kb ? vv.offsetTop + 'px' : '';
    fit();
  }
  if (vv) { vv.addEventListener('resize', vvSync); vv.addEventListener('scroll', vvSync); }

  /* ==========================================================
     STEP 4 — Basic automatic code typing (animation mode)
     The animation only READS activeFile.content. It renders a
     temporary view, so the real project code is never changed.
     ========================================================== */
  const ed = document.querySelector('.ed');
  const tv = $('tv');
  const aPlay = $('aPlay'), aReplay = $('aReplay'), aStop = $('aStop'), aStatus = $('aStatus');
  const STATUS = { idle: 'Ready', typing: 'Typing…', paused: 'Paused', done: 'Completed' };
  const anim = { due: 0, lead: true, mood: 1, moodLeft: 0, state: 'idle', view: false, text: '', pos: 0, acc: 0, last: 0, raf: 0, finishT: 0, file: null,
    line: '', idx: 0, st: { c: false }, cur: null, lh: 22, cw: 8, gw: 48, x: 0, y: 0, saveX: 0, saveY: 0, lastPrev: 0, prevPos: -1 };

  function setStatus(state) {
    anim.state = state;
    aStatus.dataset.state = state;
    aStatus.querySelector('em').textContent = STATUS[state];
    const typing = state === 'typing';
    aPlay.querySelector('span').textContent = typing ? 'Pause' : 'Play';
    aPlay.querySelector('use').setAttribute('href', typing ? '#i-pause' : '#i-play');
    aPlay.setAttribute('aria-label', typing ? 'Pause' : 'Play');
    aStop.disabled = state === 'idle';
  }

  /* Line-based highlighter (carries block-comment state between lines) */
  function hlLine(line, lang, st) {
    const open = lang === 'html' ? '<!--' : '/*', close = lang === 'html' ? '-->' : '*/';
    let out = '', rest = line;
    if (st.c) {
      const i = rest.indexOf(close);
      if (i < 0) return '<span class="tk-c">' + esc(rest) + '</span>';
      out = '<span class="tk-c">' + esc(rest.slice(0, i + close.length)) + '</span>';
      rest = rest.slice(i + close.length); st.c = false;
    }
    const o = rest.lastIndexOf(open);
    if (o >= 0 && rest.indexOf(close, o + open.length) < 0 && !(lang === 'js' && rest.slice(0, o).indexOf('//') >= 0)) {
      st.c = true;
      return out + hlText(rest.slice(0, o), lang) + '<span class="tk-c">' + esc(rest.slice(o)) + '</span>';
    }
    return out + hlText(rest, lang);
  }

  function renderCur() {
    anim.cur.innerHTML = hlLine(anim.line, langOf(anim.file.name), { c: anim.st.c }) + '<span class="caret"></span>';
  }
  function commitLine() {
    const d = document.createElement('div');
    d.className = 'ln';
    d.innerHTML = hlLine(anim.line, langOf(anim.file.name), anim.st);   // advances comment state
    tv.insertBefore(d, anim.cur);
    anim.idx++;
    gIn.appendChild(document.createTextNode((anim.idx + 1) + '\n'));
  }

  /* Keep the typing position visible: scroll down by whole lines, follow long lines sideways */
  function followCaret() {
    const bottom = 14 + (anim.idx + 1) * anim.lh;
    const y = Math.max(anim.y, bottom + anim.lh * 2 - ed.clientHeight);
    const x = Math.max(0, anim.line.length * anim.cw + 52 - (ed.clientWidth - anim.gw));
    if (y === anim.y && x === anim.x) return;
    anim.y = y; anim.x = x;
    tv.style.transform = 'translate(' + (-x) + 'px,' + (-y) + 'px)';
    gIn.style.transform = 'translateY(' + (-y) + 'px)';
  }

  /* Live preview while typing: throttled; unfinished tags hidden; JS only runs syntactically valid snapshots */
  function animPreview(force) {
    const now = performance.now();
    if (!force && (now - anim.lastPrev < 220 || anim.prevPos === anim.pos)) return;
    const lang = langOf(anim.file.name);
    let t = anim.text.slice(0, anim.pos);
    anim.lastPrev = now;
    if (lang === 'html') t = t.replace(/<[^>]*$/, '');
    else if (lang === 'js') { try { new Function(t); } catch (e) { return; } }
    anim.prevPos = anim.pos;
    renderPreview({ name: anim.file.name, content: t });
  }

  /* ---------- Human-like rhythm ----------
     Every character has its own small random delay; extra pauses are added only at
     structural points (line ends, tags, braces, blank lines). Returns the wait in ms
     before the NEXT character, given that `end` characters are already typed. */
  const R = (a, b) => a + Math.random() * (b - a);
  function nextDelay(end) {
    const t = anim.text, ch = t[end - 1], prev = t[end - 2], lang = langOf(anim.file.name);
    if (ch === '\n') anim.lead = true; else if (ch !== ' ' && ch !== '\t') anim.lead = false;
    if (anim.lead && (ch === ' ' || ch === '\t')) return R(3, 8);        // indentation is typed quickly

    if (--anim.moodLeft <= 0) { anim.mood = R(0.7, 1.35); anim.moodLeft = 6 + Math.floor(Math.random() * 14); }
    const d = R(11, 24) * anim.mood * (anim.human || 1);                 // base speed with drifting rhythm (Recording Mode types slower, like a person)
    let pause = 0;

    if (ch === '\n') {
      pause = R(80, 200);                                                // line break
      if (prev === '\n') pause += R(200, 420);                           // blank line = new section
    } else if (ch === '{') {
      const line = t.slice(t.lastIndexOf('\n', end - 2) + 1, end);
      pause = (lang === 'js' && /function|=>|\)\s*\{$/.test(line)) ? R(220, 420) : R(150, 300);
    } else if (ch === '}') {
      pause = R(140, 320);
    } else if (ch === ';') {
      if (Math.random() < 0.5) pause = R(30, 90);
    } else if (ch === '>' && lang === 'html') {
      const tag = t.slice(t.lastIndexOf('<', end - 1), end);             // a tag was just completed
      const name = (/^<\/?([a-zA-Z][\w-]*)/.exec(tag) || [])[1];
      if (tag[1] === '!') pause = R(150, 300);                           // doctype / comment
      else if (tag[1] === '/') pause = R(100, 240);                      // closing tag
      else if (/^(html|head|body|main|section|header|footer|nav|div|ul|form|script|style)$/i.test(name)) pause = R(130, 300);
      else pause = R(40, 110);
    } else if (ch === ' ' && Math.random() < 0.012) {
      pause = R(140, 340);                                               // rare "thinking" moment
    }
    return Math.min(d + pause, 700);
  }

  function tick(now) {
    const dt = Math.min(now - anim.last, 100);
    anim.last = now;
    anim.acc += dt;                                                      // ms of typing time available
    let end = anim.pos;
    for (let g = 0; g < 24 && anim.acc >= anim.due && end < anim.text.length; g++) {
      anim.acc -= anim.due;
      end++;
      const c = anim.text.charCodeAt(end - 1);
      if (c >= 0xD800 && c <= 0xDBFF && end < anim.text.length) end++;  // never split an emoji
      anim.due = nextDelay(end);
      const ch = anim.text[end - 1];
      if (!(anim.lead && (ch === ' ' || ch === '\t'))) break;           // one visible character per frame; indentation is instant
    }
    if (anim.acc > anim.due) anim.acc = anim.due;                       // no catch-up bursts after a slow frame
    if (end > anim.pos) {
      const parts = anim.text.slice(anim.pos, end).split('\n');
      anim.pos = end;
      anim.line += parts[0];
      for (let i = 1; i < parts.length; i++) { commitLine(); anim.line = parts[i]; }
      renderCur();            // one small DOM update per frame, not per character
      followCaret();
      animPreview(false);
    }
    if (anim.pos >= anim.text.length) { animFinish(); return; }
    anim.raf = requestAnimationFrame(tick);
  }

  /* Leave the animation view and show the normal (real, unchanged) editor again */
  function exitView(restoreScroll) {
    clearTimeout(anim.finishT);
    cancelAnimationFrame(anim.raf);
    if (!anim.view) return;
    anim.view = false;
    ed.classList.remove('anim');
    el.code.readOnly = false;
    tv.textContent = '';
    tv.style.transform = '';
    el.code.value = activeFile.content;
    highlight();
    gLines = 0; updateGutter();
    el.code.scrollTop = restoreScroll ? anim.saveY : anim.y;
    el.code.scrollLeft = restoreScroll ? anim.saveX : anim.x;
    syncScroll();
  }

  function animStart() {
    exitView(false);
    const f = activeFile;
    if (!f) return;
    anim.file = f;
    anim.text = f.content.replace(/\r\n?/g, '\n');
    anim.pos = 0; anim.acc = 0; anim.due = 260; anim.lead = true; anim.mood = 1; anim.moodLeft = 0; anim.idx = 0; anim.line = ''; anim.st = { c: false };
    anim.human = 1;
    anim.x = anim.y = 0; anim.prevPos = -1;
    anim.saveX = el.code.scrollLeft; anim.saveY = el.code.scrollTop;
    el.code.blur();
    el.code.readOnly = true;
    tv.textContent = '';
    tv.style.transform = '';
    gIn.textContent = '1\n';
    gIn.style.transform = '';
    anim.cur = document.createElement('div');
    anim.cur.className = 'ln cur';
    tv.appendChild(anim.cur);
    ed.classList.add('anim');
    anim.view = true;
    anim.lh = anim.cur.offsetHeight || 22;
    anim.gw = parseFloat(getComputedStyle(ed).getPropertyValue('--gw')) || 48;
    const probe = document.createElement('span');                        // measure one monospace character
    probe.style.cssText = 'position:absolute;visibility:hidden';
    probe.textContent = '0000000000';
    tv.appendChild(probe); anim.cw = probe.offsetWidth / 10 || 8; probe.remove();
    renderCur();
    setStatus('typing');
    animPreview(true);                                                   // starts from an empty file
    if (!anim.text.length) { animFinish(); return; }
    anim.last = performance.now();
    anim.raf = requestAnimationFrame(tick);
  }
  function animPause() { cancelAnimationFrame(anim.raf); setStatus('paused'); }
  function animResume() { setStatus('typing'); anim.last = performance.now(); anim.raf = requestAnimationFrame(tick); }
  function animFinish() {
    cancelAnimationFrame(anim.raf);
    setStatus('done');
    renderPreview();                                                     // final, real project output
    anim.finishT = setTimeout(() => exitView(false), 1400);              // caret stays briefly, then normal editor
  }
  function animStop() {
    if (anim.state === 'idle') return;
    exitView(true);
    setStatus('idle');
    renderPreview();
  }

  aPlay.addEventListener('click', () => {
    if (anim.state === 'typing') animPause();
    else if (anim.state === 'paused') animResume();
    else animStart();                                                    // idle or completed → from the beginning
  });
  aReplay.addEventListener('click', animStart);
  aStop.addEventListener('click', animStop);
  el.code.addEventListener('input', () => { if (anim.state === 'done') setStatus('idle'); });
  setStatus('idle');

  /* ==========================================================
     RECORDING MODE (rebuilt)
     One fixed-size "composition" (1080×1080 or 1080×1920) holds the
     background, the code window, the phone and the progress bar.
     It is scaled to fit the screen, and exactly that rectangle is
     recorded. Flow: type HTML → CSS → JS, then the code window fades
     away, the phone moves to the centre and grows, and recording keeps
     going while you use the page by hand. You press Stop.
     The project itself is only READ here, never edited.
     ========================================================== */
  const rc = {
    root: $('recMode'), project: $('rcProject'), status: $('rcStatus'), seq: $('rcSeq'), files: $('rcFiles'), lang: $('rcLang'),
    wrap: $('rcWrap'), comp: $('rcComp'), code: $('rcCode'), ed: $('rcEd'), gut: $('rcGut'), tv: $('rcTv'), prog: $('rcProg'), tap: $('rcTap'),
    device: $('rcDevice'), frame: $('rcFrame'), note: $('rcNote'),
    start: $('rcStart'), play: $('rcPlay'), pause: $('rcPause'), stop: $('rcStop'),
    result: $('rcResult'), video: $('rcVideo'), resMeta: $('rcResMeta'), resClose: $('rcResClose'), resAgain: $('rcResAgain')
  };
  const RC_STATUS = { idle: 'Ready', starting: 'Starting…', recording: 'Recording', paused: 'Paused', stopped: 'Stopped' };
  const RC_NOTE = {
    idle: 'Ready. Pick the typing order, then press Start Recording. For the sharpest video use full screen (F11).',
    starting: 'Choose “This Tab” in the browser prompt to begin.',
    recording: 'Recording. Typing HTML, CSS and JS automatically.',
    live: 'Live. Use the page on the phone by hand, then press Stop.',
    paused: 'Paused. Resume to continue the same video.',
    stopped: 'Stopped. Download the video before closing the preview.'
  };
  /* Composition sizes (design pixels). typeH / liveH = phone height while typing / in the final live view */
  const RC_FMT = {
    square: { W: 1080, H: 1080, typeH: 840, liveH: 1000, pad: 48, gap: 36 },
    reel: { W: 1080, H: 1920, typeH: 980, liveH: 1780, pad: 48, gap: 36 }
  };
  const RC_BAR = 30;                                  // room kept at the bottom for the progress bar
  const rcs = { open: false, state: 'idle', file: null, step: 'html', stage: 'type' };
  const rcFmt = () => ($('rcFormat').value === 'reel' ? 'reel' : 'square');
  const rcFormatSpec = () => { const f = RC_FMT[rcFmt()]; return [f.W, f.H]; };
  const rcStepOf = (f) => langOf(f.name);

  /* Typing order, chosen before recording (e.g. "css,html,js") */
  const rcOrderEl = $('rcOrder');
  const rcOrderList = () => (rcOrderEl.value || 'html,css,js').split(',');
  const rcRank = (f) => { const i = rcOrderList().indexOf(rcStepOf(f)); return i < 0 ? 9 : i; };
  const rcSorted = () => current.files.slice().sort((a, b) => rcRank(a) - rcRank(b));
  function rcApplyOrder() {                                          // re-order the progress indicators to match
    const o = rcOrderList().concat('test');
    [rc.seq, rc.prog].forEach((box) => o.forEach((s) => { const n = box.querySelector('[data-step="' + s + '"]'); if (n) box.appendChild(n); }));
  }

  /* Progress: HTML → CSS → JS → Live (top indicator + thin bar inside the video) */
  function rcUpdateSeq() {
    const has = {};
    current.files.forEach((f) => { has[rcStepOf(f)] = true; });
    const order = rcOrderList().concat('test'), cur = order.indexOf(rcs.step);
    rc.seq.querySelectorAll('li').forEach((li) => {
      const s = li.dataset.step;
      li.classList.toggle('on', s === rcs.step);
      li.classList.toggle('na', s !== 'test' && !has[s]);
      if (s === rcs.step) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
    rc.prog.querySelectorAll('i').forEach((b) => {
      const s = b.dataset.step, i = order.indexOf(s);
      b.classList.toggle('on', i === cur);
      b.classList.toggle('done', i < cur);
      b.classList.toggle('na', s !== 'test' && !has[s]);
    });
  }

  /* File tabs in the code window */
  function rcBuildFiles() {
    rc.files.innerHTML = '';
    current.files.forEach((f) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', String(f === rcs.file));
      b.className = f === rcs.file ? 'on' : '';
      b.innerHTML = '<i class="f-' + langOf(f.name) + '"></i>';
      b.append(f.name);
      b.addEventListener('click', () => { if (rcTy.run || rcs.state === 'recording' || rcs.state === 'paused') return; rcShowFile(f); });
      rc.files.appendChild(b);
    });
  }

  /* Whole file, highlighted, no typing (idle view) */
  function rcStatic(f) {
    const lang = langOf(f.name), st = { c: false };
    rc.tv.textContent = '';
    let g = '';
    f.content.replace(/\r\n?/g, '\n').split('\n').forEach((l, i) => {
      const d = document.createElement('div');
      d.className = 'ln';
      d.innerHTML = hlLine(l, lang, st);
      rc.tv.appendChild(d);
      g += (i + 1) + '\n';
    });
    rc.gut.textContent = g;
    rc.tv.style.transform = '';
    rc.gut.style.transform = '';
  }
  function rcShowFile(f) {
    rcs.file = f;
    rcs.step = rcStepOf(f);
    rcBuildFiles();
    rc.lang.textContent = langOf(f.name).toUpperCase();
    rcStatic(f);
    rcUpdateSeq();
  }

  /* Status + control states */
  function rcSetState(s) {
    rcs.state = s;
    rc.status.dataset.state = s;
    rc.root.dataset.s = s;
    rc.status.querySelector('em').textContent = RC_STATUS[s];
    rc.note.textContent = (s === 'recording' && rcs.stage === 'live') ? RC_NOTE.live : RC_NOTE[s];
    rc.note.classList.remove('err');
    const live = s === 'recording', paused = s === 'paused';
    rc.start.disabled = live || s === 'starting';
    rc.start.querySelector('span').textContent = paused ? 'Resume Recording' : 'Start Recording';
    rc.pause.disabled = !live;
    rc.play.disabled = live || paused || s === 'starting';
    rc.stop.disabled = !(live || paused);
    $('rcFormat').disabled = $('rcOrder').disabled = live || paused || s === 'starting';
  }

  /* Composition: scale to the screen, place the phone and the code window */
  function rcFit() {
    if (rc.root.hidden || !rc.wrap.clientWidth) return;
    const k = rcFmt(), f = RC_FMT[k], m = rc.root.classList.contains('live') ? 0 : 20;   // while recording, use every screen pixel
    const dpr = window.devicePixelRatio || 1, cw = rc.wrap.clientWidth, ch = rc.wrap.clientHeight;
    let s = Math.max(0.05, Math.min((cw - 2 * m) / f.W, (ch - 2 * m) / f.H));
    /* Pixel-exact: the composition covers a WHOLE number of screen pixels at a WHOLE-pixel position,
       so the recorder copies it 1:1 with no half-pixel resampling (that is what makes video look soft). */
    const step = (k === 'reel' && !rcs.fill) ? 9 : 1;                    // 9:16 needs a multiple of 9 for a whole-pixel height
    const px = Math.max(step, (rcs.fill ? Math.ceil(f.W * s * dpr) : Math.floor(f.W * s * dpr / step) * step));   // Play mode: cover the whole width, never leave a gap
    s = px / dpr / f.W;
    rc.comp.dataset.fmt = k;
    rc.comp.style.width = f.W + 'px';
    rc.comp.style.height = f.H + 'px';
    rc.comp.style.left = (Math.round((cw - f.W * s) / 2 * dpr) / dpr) + 'px';
    rc.comp.style.top = (Math.round((ch - f.H * s) / 2 * dpr) / dpr) + 'px';
    rc.comp.style.transform = 'scale(' + s + ')';
  }
  function rcPlace(animate) {
    const dw = rc.device.offsetWidth, dh = rc.device.offsetHeight;
    if (!dw || !dh) return;
    const k = rcFmt(), f = RC_FMT[k], live = rcs.stage === 'live', availH = f.H - RC_BAR;
    rc.comp.dataset.fmt = k;
    let s = (live ? f.liveH : f.typeH) / dh;
    if (live) s = Math.min(s, (f.W - 64) / dw);          // the whole phone (border included) must fit the width, with a thin even margin
    const ph = dh * s, pw = dw * s;
    let x, y;
    if (live) { x = (f.W - pw) / 2; y = (availH - ph) / 2; }
    else if (k === 'reel') { x = (f.W - pw) / 2; y = f.pad; }
    else { x = f.pad; y = (availH - ph) / 2; }
    const d = rc.device.style;
    if (!animate) d.transition = 'none';
    d.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) scale(' + s.toFixed(4) + ')';
    if (!animate) { void rc.device.offsetWidth; d.transition = ''; }
    const ts = f.typeH / dh, tw = dw * ts, c = rc.code.style;     // code window is laid out around the typing-size phone
    if (k === 'reel') {
      const top = f.pad + f.typeH + f.gap;
      c.left = f.pad + 'px'; c.top = top + 'px'; c.width = (f.W - 2 * f.pad) + 'px'; c.height = (availH - f.pad - top) + 'px';
    } else {
      const left = f.pad + tw + f.gap;
      c.left = left + 'px'; c.top = f.pad + 'px'; c.width = (f.W - f.pad - left) + 'px'; c.height = (availH - 2 * f.pad) + 'px';
    }
  }
  function rcLive(on) {                                   // recording layout: only the composition fills the screen
    rc.root.classList.toggle('live', on);
    rcFit();
    requestAnimationFrame(rcFit);
  }
  if (window.ResizeObserver) new ResizeObserver(rcFit).observe(rc.wrap);
  window.addEventListener('resize', rcFit);
  $('rcFormat').addEventListener('change', () => { rcFit(); rcPlace(false); });
  rcOrderEl.addEventListener('change', () => {
    if (rcTy.run || !current || !rcs.open) return;
    rcApplyOrder();
    rcShowFile(rcSorted()[0]);
    rcRenderPreview();
  });

  const rcAllFiles = () => { const m = {}; current.files.forEach((f) => { m[f.name] = f.content; }); return m; };
  const rcRenderPreview = () => { rc.frame.srcdoc = rcDoc(rcAllFiles()); };

  /* Open / exit */
  function rcOpen() {
    if (!current || rcs.open) return;
    animStop();
    flushSave();
    rcs.open = true;
    rcs.stage = 'type';
    rcCloseResult(); rcDiscardVideo();
    rc.project.textContent = current.name;
    rcApplyOrder();
    rcs.file = rcSorted()[0];
    rc.code.classList.remove('out');
    rc.frame.style.width = DEVICES.phone[0] + 'px';
    rc.frame.style.height = DEVICES.phone[1] + 'px';
    rcSetState('idle');
    rcShowFile(rcs.file);
    el.ws.inert = true;
    rc.root.hidden = false;
    rcFit(); rcPlace(false);
    rcRenderPreview();
    requestAnimationFrame(() => { rcFit(); rcPlace(false); });
  }
  function rcExit() {
    if (!rcs.open) return;
    if ((rcs.state === 'recording' || rcs.state === 'paused') && !window.confirm('Stop recording and discard it?')) return;
    rcAbort();
    rcCloseResult(); rcDiscardVideo();
    rcs.open = false;
    rcSetState('idle');
    rc.root.hidden = true;
    rc.frame.srcdoc = '';
    el.ws.inert = false;
    requestAnimationFrame(fit);
    const b = $('recOpen'); if (b) b.focus();
  }
  $('recOpen').addEventListener('click', rcOpen);
  $('rcExit').addEventListener('click', rcExit);

  /* ---------- Real capture: share THIS TAB -> hidden <video> -> canvas that draws only the composition -> MediaRecorder ---------- */
  const rec = { recorder: null, chunks: [], session: 0, t0: 0, acc: 0, url: '', frames: 0, saved: false };

  function rcUnsupported() {
    if (!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) || !window.MediaRecorder || !(window.HTMLCanvasElement && HTMLCanvasElement.prototype.captureStream)) {
      return 'Recording isn’t supported on this browser or device. Use Chrome, Edge or Opera on a desktop, over https or localhost (or open the file directly).';
    }
    return '';
  }
  function rcPickMime() {
    /* H.264 (MP4) first: it keeps small text much sharper in real-time recording and plays everywhere.
       VP9 / VP8 WebM stay as fallbacks. */
    return [
      'video/mp4;codecs=avc1.640033',
      'video/mp4;codecs=avc1.64002A',
      'video/mp4;codecs=avc1',
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4'
    ].find((t) => MediaRecorder.isTypeSupported(t)) || '';
  }
  function rcStopTracks(stream) { if (stream) stream.getTracks().forEach((t) => { try { t.stop(); } catch (e) { /* already stopped */ } }); }
  function rcFail(msg) { rcTyHalt(); rcRestoreView(); rcSetState('idle'); rc.note.textContent = msg; rc.note.classList.add('err'); }
  function rcErrorText(err) {
    const n = err && err.name;
    if (n === 'NotAllowedError') return 'Screen sharing was cancelled, so nothing was recorded.';
    if (n === 'RcSurface') return 'Please choose “This Tab” in the sharing prompt. Nothing was recorded.';
    if (n === 'RcNoFrames') return 'The browser shared the tab but sent no picture, so nothing was recorded. Try again and pick “This Tab”.';
    return 'Couldn’t start the recording' + (n ? ' (' + n + ')' : '') + '.';
  }
  const rcClock = () => performance.now();
  const rcWait = (ms) => new Promise((r) => setTimeout(r, ms));
  function rcRelease(mr) { rcStopTracks(mr.rcStream); if (mr.rcDrawStop) mr.rcDrawStop(); }

  async function rcStartCapture() {
    const why = rcUnsupported();
    if (why) { rcFail(why); return; }
    rcCloseResult(); rcDiscardVideo();
    rcRestoreView();
    const sid = ++rec.session;
    rcSetState('starting');
    let stream = null, drawStop = null;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 60, max: 60 }, width: { ideal: 3840 }, height: { ideal: 2160 } }, audio: false,
        preferCurrentTab: true, selfBrowserSurface: 'include', surfaceSwitching: 'exclude', monitorTypeSurfaces: 'exclude', systemAudio: 'exclude'
      });
      if (sid !== rec.session) { rcStopTracks(stream); return; }
      const track = stream.getVideoTracks()[0];
      const surface = (track.getSettings() || {}).displaySurface;
      if (surface && surface !== 'browser') { const e = new Error('not this tab'); e.name = 'RcSurface'; throw e; }

      rcLive(true);                                                       // composition fills the screen; controls move aside
      const vid = document.createElement('video');
      vid.muted = true; vid.playsInline = true; vid.srcObject = stream;
      vid.style.cssText = 'position:fixed;left:0;top:0;width:2px;height:2px;opacity:0;pointer-events:none';
      document.body.appendChild(vid);
      await vid.play();
      for (let i = 0; i < 60 && !(vid.videoWidth > 0 && vid.readyState >= 2); i++) await rcWait(50);
      if (!(vid.videoWidth > 0)) { const e = new Error('no frames'); e.name = 'RcNoFrames'; vid.remove(); throw e; }
      if (sid !== rec.session) { vid.remove(); rcStopTracks(stream); return; }
      await rcWait(600);                                                  // let the "sharing" bar finish resizing the page
      if (sid !== rec.session) { vid.remove(); rcStopTracks(stream); return; }

      const target = rc.comp, spec = rcFormatSpec(), cw = spec[0], ch = spec[1];
      const cv = document.createElement('canvas');
      cv.width = cw; cv.height = ch;
      const ctx = cv.getContext('2d', { alpha: false });
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      rec.frames = 0;
      let raf = 0, live = true, sharp = true, lastT = 0, ema = 16, n = 0;
      const draw = (now) => {
        if (!live) return;
        if (vid.readyState >= 2) {
          const kx = vid.videoWidth / window.innerWidth, ky = vid.videoHeight / window.innerHeight;
          const r = target.getBoundingClientRect();
          const sx = Math.round(r.left * kx), sy = Math.round(r.top * ky), sw = Math.round(r.width * kx), sh = Math.round(r.height * ky);
          if (sw > 0 && sh > 0) {
            /* Screen smaller than the video size: the picture has to be enlarged, so add a light sharpening pass.
               It switches itself off if it makes the recording stutter on a slow computer. */
            ctx.filter = (sharp && sw < cw * 0.98) ? 'url(#rcSharp)' : 'none';
            ctx.drawImage(vid, sx, sy, sw, sh, 0, 0, cw, ch);
            rec.frames++;
          }
        }
        /* Only give up sharpening when the computer is clearly struggling (under ~20 fps) */
        if (lastT) { ema = ema * 0.97 + (now - lastT) * 0.03; if (++n > 150 && sharp && ema > 50) sharp = false; }
        lastT = now;
        raf = requestAnimationFrame(draw);
      };
      drawStop = () => { live = false; cancelAnimationFrame(raf); vid.pause(); vid.srcObject = null; vid.remove(); };
      draw();
      const out = cv.captureStream(60);

      const mime = rcPickMime();
      const bps = Math.min(40000000, Math.round(cw * ch * 16));        // ~19 Mbps for 1:1, ~33 Mbps for Reel: keeps text crisp
      const opts = { videoBitsPerSecond: bps, bitsPerSecond: bps };
      if (mime) opts.mimeType = mime;
      const mr = new MediaRecorder(out, opts);
      mr.rcStream = stream; mr.rcDiscard = false; mr.rcDrawStop = drawStop;
      rec.chunks = []; rec.acc = 0;
      mr.ondataavailable = (e) => { if (rec.recorder === mr && e.data && e.data.size) rec.chunks.push(e.data); };
      mr.onstop = () => rcFinish(mr);
      mr.onerror = () => { rcAbort(); rcFail('Recording stopped unexpectedly. Nothing was saved.'); };
      track.addEventListener('ended', () => { if (rec.recorder === mr && mr.state !== 'inactive') rcStopCapture(); });   // browser "Stop sharing"
      rec.recorder = mr;
      mr.start(1000);
      rec.t0 = rcClock();
      rcSetState('recording');
      rcTyStart();
    } catch (err) {
      if (drawStop) drawStop();
      rcStopTracks(stream);
      if (sid === rec.session) rcFail(rcErrorText(err));
    }
  }
  function rcPauseCapture() {
    const mr = rec.recorder;
    if (!mr || mr.state !== 'recording') return;
    mr.pause();
    rcTyPause();
    rec.acc += rcClock() - rec.t0;
    rcSetState('paused');
  }
  function rcResumeCapture() {
    const mr = rec.recorder;
    if (!mr || mr.state !== 'paused') return;
    mr.resume();
    rcTyResume();
    rec.t0 = rcClock();
    rcSetState('recording');
  }
  function rcStopCapture() {
    const mr = rec.recorder;
    if (!mr || mr.state === 'inactive') return;
    if (mr.state === 'recording') rec.acc += rcClock() - rec.t0;
    rcTyHalt();
    rc.pause.disabled = true; rc.stop.disabled = true;
    try { mr.requestData(); } catch (e) { /* flush the last chunk */ }
    try { mr.stop(); } catch (e) { rcAbort(); rcFail('Couldn’t finish the recording. Nothing was saved.'); }
  }
  function rcFinish(mr) {
    rcRelease(mr);
    if (mr.rcDiscard) return;
    if (rec.recorder === mr) rec.recorder = null;
    rcLive(false);
    if (!rec.chunks.length) { rcFail('No video data was captured (frames drawn: ' + (rec.frames || 0) + '). Try again.'); return; }
    const blob = new Blob(rec.chunks, { type: mr.mimeType || 'video/webm' });
    rec.chunks = [];
    rec.url = URL.createObjectURL(blob);
    rcSetState('stopped');
    rcShowResult(blob);
  }
  function rcAbort() {
    rcTyHalt();
    rec.session++;
    const mr = rec.recorder;
    rec.recorder = null;
    rec.chunks = [];
    if (mr) { mr.rcDiscard = true; if (mr.state !== 'inactive') { try { mr.stop(); } catch (e) { /* ignore */ } } rcRelease(mr); }
    rcLive(false);
  }

  /* Playback preview */
  const rcFmtTime = (ms) => { const s = Math.round(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  function rcShowResult(blob) {
    rc.video.src = rec.url;
    const dl = $('rcDownload');
    const d = new Date(), p2 = (n) => String(n).padStart(2, '0');
    const slug = (current ? current.name : 'reel').toLowerCase().replace(/[^a-z0-9ঀ-৿]+/g, '-').replace(/^-+|-+$/g, '') || 'reel';
    dl.href = rec.url;
    dl.download = slug + '-' + rcFmt() + '-' + d.getFullYear() + p2(d.getMonth() + 1) + p2(d.getDate()) + '-' + p2(d.getHours()) + p2(d.getMinutes()) + '.' + (/mp4/.test(blob.type) ? 'mp4' : 'webm');
    rec.saved = false;
    rc.resMeta.textContent = rcFmtTime(rec.acc) + ' · ' + (blob.size / 1048576).toFixed(1) + ' MB · ' + (blob.type.split(';')[0].replace('video/', '') || 'video').toUpperCase() + ' — download it before closing.';
    rc.result.hidden = false;
    rc.resClose.focus();
  }
  function rcCloseResult() { rc.result.hidden = true; rc.video.pause(); }
  function rcDiscardVideo() {
    if (rec.url) URL.revokeObjectURL(rec.url);
    rec.url = '';
    rc.video.pause();
    rc.video.removeAttribute('src');
    rc.video.load();
  }
  /* MediaRecorder WebM reports an infinite duration; this makes the seek bar work */
  rc.video.addEventListener('loadedmetadata', () => {
    if (rc.video.duration !== Infinity) return;
    const v = rc.video;
    v.currentTime = 1e101;
    v.addEventListener('timeupdate', function reset() { v.removeEventListener('timeupdate', reset); v.currentTime = 0; });
  });

  rc.start.addEventListener('click', () => { if (rcs.state === 'paused') rcResumeCapture(); else rcStartCapture(); });
  rc.pause.addEventListener('click', rcPauseCapture);
  rc.stop.addEventListener('click', rcStopCapture);
  const rcConfirmDiscard = () => rec.saved || !rec.url || window.confirm('This video has not been downloaded. Discard it?');
  $('rcDownload').addEventListener('click', () => { rec.saved = true; });
  rc.resClose.addEventListener('click', () => { if (!rcConfirmDiscard()) return; rcCloseResult(); rcDiscardVideo(); rcRestoreView(); });
  rc.resAgain.addEventListener('click', () => { if (!rcConfirmDiscard()) return; rcCloseResult(); rcDiscardVideo(); rcStartCapture(); });

  /* ==========================================================
     Automatic typing inside Recording Mode: same look as the
     Workspace "Play" (current-line highlight, glowing caret,
     smooth follow-scroll, moving line numbers).
     ========================================================== */
  const rcSpeedEl = $('rcSpeed');
  const rcTy = { run: false, paused: false, raf: 0, phase: 'type', wait: 0, last: 0, files: [], fi: 0, file: null,
    text: '', pos: 0, acc: 0, due: 0, typed: {}, lastPrev: 0, prevPos: -1,
    line: '', idx: 0, st: { c: false }, cur: null, lh: 23, cw: 8, gw: 48, x: 0, y: 0 };

  /* Small helper injected into the recording preview only: hides scrollbars and reports taps so a ring can be drawn */
  const RC_INJECT = '<style>html{scrollbar-width:none}::-webkit-scrollbar{display:none}</style><script>(function(){document.addEventListener("pointerdown",function(e){parent.postMessage({rcTap:[e.clientX,e.clientY]},"*")},true)})()<\/script>';
  window.addEventListener('message', (e) => {
    if (e.source !== rc.frame.contentWindow || !e.data || !e.data.rcTap) return;
    const fr = rc.frame.getBoundingClientRect(), cr = rc.comp.getBoundingClientRect();
    const ratio = fr.width / (rc.frame.offsetWidth || 1), S = cr.width / (rc.comp.offsetWidth || 1);
    const ring = document.createElement('i');
    ring.className = 'rc-ring';
    ring.style.left = ((fr.left + e.data.rcTap[0] * ratio - cr.left) / S) + 'px';
    ring.style.top = ((fr.top + e.data.rcTap[1] * ratio - cr.top) / S) + 'px';
    rc.tap.appendChild(ring);
    setTimeout(() => ring.remove(), 700);
  });

  /* Preview document where files that are not typed yet are empty */
  function rcDoc(map) {
    const look = (n) => (n in map) ? map[n] : (current.files.some((x) => x.name === n) ? '' : null);
    let html = look('index.html') || '';
    html = html.replace(/<link[^>]*href=["']([^"']+)["'][^>]*>/gi, (m, h) => {
      const x = look(h); return x !== null && /stylesheet/i.test(m) ? '<style>' + x + '</style>' : m;
    });
    html = html.replace(/<script([^>]*?)\ssrc=["']([^"']+)["']([^>]*)>\s*<\/script>/gi, (m, a, h, b) => {
      const x = look(h); return x !== null ? '<script' + a + b + '>' + x.replace(/<\/script/gi, '<\\/script') + '<\/script>' : m;
    });
    return html + RC_INJECT;
  }

  /* Typing view */
  function rcRenderCur() {
    const T = rcTy;
    T.cur.innerHTML = hlLine(T.line, langOf(T.file.name), { c: T.st.c }) + '<span class="caret"></span>';
  }
  function rcCommit() {
    const T = rcTy, d = document.createElement('div');
    d.className = 'ln';
    d.innerHTML = hlLine(T.line, langOf(T.file.name), T.st);
    rc.tv.insertBefore(d, T.cur);
    T.idx++;
    rc.gut.appendChild(document.createTextNode((T.idx + 1) + '\n'));
  }
  function rcFollow() {
    const T = rcTy;
    const bottom = 14 + (T.idx + 1) * T.lh;
    const y = Math.max(T.y, bottom + T.lh * 2 - rc.ed.clientHeight);
    const x = Math.max(0, T.line.length * T.cw + 52 - (rc.ed.clientWidth - T.gw));
    if (y === T.y && x === T.x) return;
    T.y = y; T.x = x;
    rc.tv.style.transform = 'translate(' + (-x) + 'px,' + (-y) + 'px)';
    rc.gut.style.transform = 'translateY(' + (-y) + 'px)';
  }
  function rcSetupView() {
    const T = rcTy;
    rc.tv.textContent = '';
    rc.tv.style.transform = '';
    rc.gut.textContent = '1\n';
    rc.gut.style.transform = '';
    T.cur = document.createElement('div');
    T.cur.className = 'ln cur';
    rc.tv.appendChild(T.cur);
    T.line = ''; T.idx = 0; T.st = { c: false }; T.x = T.y = 0;
    const cs = getComputedStyle(rc.ed);
    T.lh = parseFloat(cs.getPropertyValue('--lh')) || 23;
    T.gw = parseFloat(cs.getPropertyValue('--gw')) || 48;
    const probe = document.createElement('span');                         // measure one monospace character
    probe.style.cssText = 'position:absolute;visibility:hidden';
    probe.textContent = '0000000000';
    rc.tv.appendChild(probe); T.cw = probe.offsetWidth / 10 || 8; probe.remove();
    rcRenderCur();
  }

  /* Live preview while typing (throttled; unfinished tags hidden; JS only runs when it parses) */
  function rcTyPreview(force) {
    const T = rcTy, now = performance.now();
    if (!force && (now - T.lastPrev < 250 || T.prevPos === T.pos)) return;
    const lang = langOf(T.file.name);
    let t = T.text.slice(0, T.pos);
    if (lang === 'html') t = t.replace(/<[^>]*$/, '');
    else if (lang === 'js') { try { new Function(t); } catch (e) { return; } }
    T.lastPrev = now; T.prevPos = T.pos;
    const map = Object.assign({}, T.typed);
    map[T.file.name] = t;
    rc.frame.srcdoc = rcDoc(map);
  }

  function rcBeginFile(i) {
    const T = rcTy, f = T.files[i], lang = langOf(f.name);
    T.fi = i; T.file = f;
    rcs.file = f; rcs.step = rcStepOf(f);
    rcBuildFiles(); rcUpdateSeq();
    rc.lang.textContent = lang.toUpperCase();
    T.text = f.content.replace(/\r\n?/g, '\n');
    T.pos = 0; T.acc = 0; T.due = i === 0 ? 700 : 350; T.lastPrev = 0; T.prevPos = -1;
    anim.text = T.text; anim.file = f; anim.lead = true; anim.mood = 1; anim.moodLeft = 0; anim.human = 1;   // same human rhythm as the Workspace Play button; the speed menu (1×–5×) scales it
    rcSetupView();
    rc.ed.classList.remove('swap'); void rc.ed.offsetWidth; rc.ed.classList.add('swap');   // soft fade between files
    T.phase = 'type';
    if (!T.text.length) { T.typed[f.name] = ''; T.phase = 'gap'; T.wait = 300; }
  }

  function rcTypeStep(dt) {
    const T = rcTy;
    const speed = parseFloat(rcSpeedEl.value) || 1;
    T.acc += dt * speed;                                             // 1× = same rhythm as Play; 5× = five times faster, pauses included
    let end = T.pos;
    /* No "one character per frame" limit any more: as many characters as the time budget allows
       are typed in each frame, so 1× … 5× really differ (even when the recording lowers the frame rate). */
    for (let g = 0; g < 120 && T.acc >= T.due && end < T.text.length; g++) {
      T.acc -= T.due;
      end++;
      const c = T.text.charCodeAt(end - 1);
      if (c >= 0xD800 && c <= 0xDBFF && end < T.text.length) end++;
      T.due = nextDelay(end);
      const ch = T.text[end - 1];
      /* Same as Workspace Play: a visible character never comes faster than one display frame (~16 ms),
         while indentation is typed almost instantly. Done by time (not by frame), so the speed stays
         identical even when screen recording lowers the frame rate. */
      if (!(anim.lead && (ch === ' ' || ch === '\t'))) T.due = Math.max(T.due, 16);
    }
    if (T.acc > T.due) T.acc = T.due;
    if (end > T.pos) {
      const parts = T.text.slice(T.pos, end).split('\n');
      T.pos = end;
      T.line += parts[0];
      for (let i = 1; i < parts.length; i++) { rcCommit(); T.line = parts[i]; }
      rcRenderCur();
      rcFollow();
      rcTyPreview(false);
    }
    if (T.pos >= T.text.length) {
      T.typed[T.file.name] = T.text;
      rcTyPreview(true);
      T.phase = 'gap'; T.wait = 700;
    }
  }

  /* All code typed: code window fades out, the phone glides to the centre and grows. Recording keeps running. */
  function rcGoLive() {
    const T = rcTy;
    rcs.step = 'test'; rcUpdateSeq();
    rc.frame.srcdoc = rcDoc(T.typed);                                     // fresh, finished page
    rcs.stage = 'live';
    rc.code.classList.add('out');
    rcPlace(true);
    rc.note.textContent = RC_NOTE.live;
    T.run = false;
  }
  function rcAdvance() {
    const T = rcTy;
    if (T.phase === 'gap') { if (T.fi + 1 < T.files.length) rcBeginFile(T.fi + 1); else rcGoLive(); }
  }
  function rcTick(now) {
    const T = rcTy;
    if (!T.run || T.paused) return;
    const dt = Math.min(now - T.last, 100);
    T.last = now;
    if (T.phase === 'type') rcTypeStep(dt);
    else { T.wait -= dt; if (T.wait <= 0) rcAdvance(); }
    if (T.run && !T.paused) T.raf = requestAnimationFrame(rcTick);
  }

  function rcTyStart() {
    const T = rcTy;
    rcTyHalt();
    T.files = rcSorted();
    if (!T.files.length) return;
    T.typed = {}; T.run = true; T.paused = false;
    rcs.stage = 'type';
    rc.code.classList.remove('out');
    rcPlace(false);
    rc.frame.srcdoc = rcDoc({});
    rcBeginFile(0);
    T.last = performance.now();
    T.raf = requestAnimationFrame(rcTick);
  }
  function rcTyHalt() { rcTy.run = false; rcTy.paused = false; cancelAnimationFrame(rcTy.raf); }
  function rcTyPause() { if (!rcTy.run) return; rcTy.paused = true; cancelAnimationFrame(rcTy.raf); }
  function rcTyResume() {
    if (!rcTy.run || !rcTy.paused) return;
    rcTy.paused = false; rcTy.last = performance.now();
    rcTy.raf = requestAnimationFrame(rcTick);
  }
  /* Back to the normal idle view of the real project */
  function rcRestoreView() {
    if (rcTy.run || !current || !rcs.open) return;
    rcLive(false);
    rcs.stage = 'type';
    rc.code.classList.remove('out');
    rcPlace(false);
    rcShowFile(rcSorted()[0]);
    rcRenderPreview();
  }

  /* ==========================================================
     PLAY MODE (for phones): no capture of its own. Every control disappears, the composition
     fills the screen (full screen if the browser allows) and the typing starts, so the phone's
     own screen recorder can record it. Leave with the Back gesture / button.
     ========================================================== */
  let rcWake = null;
  const RC_REEL0 = Object.assign({}, RC_FMT.reel);
  function rcFillOn() {                                    // reel only: make the composition exactly as tall as the screen, so no black bars
    const cw = rc.wrap.clientWidth, ch = rc.wrap.clientHeight;
    if (rcFmt() !== 'reel' || !cw || !ch) return;
    const H = Math.max(RC_REEL0.H, Math.round(RC_REEL0.W * ch / cw)), dH = H - RC_REEL0.H;
    Object.assign(RC_FMT.reel, { H: H, typeH: Math.round(RC_REEL0.typeH + dH * 0.5), liveH: RC_REEL0.liveH + dH });
    rcs.fill = true;
  }
  function rcFillOff() { Object.assign(RC_FMT.reel, RC_REEL0); rcs.fill = false; }
  function rcDemoStart() {
    if (!current || !rcs.open || rcs.state !== 'idle' || rcTy.run || rcs.demo) return;
    rcs.demo = true; rcs.fsOn = false; rcs.hist = false;
    rc.root.classList.add('clean');
    rcLive(true);
    try { history.pushState({ rcDemo: 1 }, ''); rcs.hist = true; } catch (e) { /* Back button just won't work */ }
    const fs = rc.root.requestFullscreen || rc.root.webkitRequestFullscreen;
    if (fs) { try { const p = fs.call(rc.root); if (p && p.catch) p.catch(() => {}); } catch (e) { /* not allowed here */ } }
    try { if (navigator.wakeLock) navigator.wakeLock.request('screen').then((l) => { rcWake = l; }).catch(() => {}); } catch (e) { /* optional */ }
    setTimeout(() => { if (!rcs.demo) return; rcFillOn(); rcFit(); rcPlace(false); rcTyStart(); rcTyPause(); rcGoShow(); }, 900);   // layout settles, then wait for the person's Play tap
  }
  /* Ready screen: a Play button waits until Chrome's "exit full screen" notice has gone.
     After the tap: 3 - 2 - 1, then the typing and the preview start (start your recorder during the countdown). */
  let rcGoEl = null, rcGoT = 0;
  function rcGoClear() { clearTimeout(rcGoT); if (rcGoEl) { rcGoEl.remove(); rcGoEl = null; } }
  function rcGoShow() {
    rcGoClear();
    const d = document.createElement('div');
    d.className = 'rc-go';
    d.innerHTML = '<button type="button" class="rc-go-btn" aria-label="Play"><svg class="ic fill"><use href="#i-play"/></svg></button>';
    rc.wrap.appendChild(d);
    rcGoEl = d;
    d.querySelector('button').addEventListener('click', rcGoCount);
  }
  function rcGoCount() {
    if (!rcGoEl) return;
    let n = 3;
    rcGoEl.classList.add('count');
    rcGoEl.innerHTML = '<b></b>';
    const b = rcGoEl.querySelector('b');
    const step = () => {
      if (!rcs.demo || !rcGoEl) return;
      if (n <= 0) { rcGoClear(); rcTyResume(); return; }
      b.textContent = n; n--;
      b.style.animation = 'none'; void b.offsetWidth; b.style.animation = '';
      rcGoT = setTimeout(step, 1000);
    };
    step();
  }
  function rcDemoExit(fromPop) {
    if (!rcs.demo) return;
    rcs.demo = false;
    rcTyHalt();
    rcGoClear();
    rc.root.classList.remove('clean');
    if (rcWake) { try { rcWake.release(); } catch (e) { /* ignore */ } rcWake = null; }
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      try { (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch (e) { /* ignore */ }
    }
    if (rcs.hist && !fromPop) { rcs.hist = false; try { history.back(); } catch (e) { /* ignore */ } }
    rcs.hist = false;
    rcFillOff();
    rcLive(false);
    rcs.stage = 'type';
    rcRestoreView();
  }
  rc.play.addEventListener('click', rcDemoStart);
  window.addEventListener('popstate', () => { if (rcs.demo) { rcs.hist = false; rcDemoExit(true); } });
  document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) rcs.fsOn = true;
    else if (rcs.demo && rcs.fsOn) rcDemoExit(false);
  });

  renderProjects();
})();
