/* ==========================================================
   SHOWCASE REEL — a second video type (9:16, 1080 x 1920)
   Top: caption + live, clickable preview.  Middle: title strip.
   Bottom: only the important HTML / CSS in a code box (no typing).

   This file is independent of script.js: it reads the saved
   projects from localStorage ("crs.projects") and never writes to
   them. Its own settings are stored under "crs.showcase".
   Two ways to make the video, same as Recording Mode:
     Play  = every control disappears, 3-2-1, then use your phone's own screen recorder
     Start Recording = records this browser tab (desktop Chrome / Edge)
   ========================================================== */
(function () {
  'use strict';

  const PKEY = 'crs.projects', SKEY = 'crs.showcase';
  const W = 1080, H = 1920, SAFE = 1800;              // content stays above y=1800
  const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';
  const SANS = 'system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans Bengali", "Helvetica Neue", Arial, sans-serif';
  const ACCENTS = { green: '#4ade80', orange: '#ff8a3d', purple: '#a78bfa', pink: '#f472b6', blue: '#60a5fa', yellow: '#facc15' };

  const ws = document.getElementById('workspace');
  const wsBar = ws && ws.querySelector('.ws-bar');
  if (!ws || !wsBar) return;

  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const q = (sel, r) => (r || document).querySelector(sel);

  /* ---------------------------------------------------------- UI */
  const TEMPLATE = `
<div class="sc" id="scMode" data-pane="edit" hidden>
  <header class="sc-bar">
    <button class="icon-btn" id="scExit" aria-label="Exit Showcase"><svg class="ic"><use href="#i-back"/></svg></button>
    <div class="sc-title"><h1>Showcase Reel</h1><span>1080 × 1920 · preview on top, code below</span></div>
    <span class="rc-status" id="scStatus" data-state="idle" role="status"><i></i><em>Ready</em></span>
  </header>
  <div class="sc-tabs"><button class="on" data-pane="edit">Edit</button><button data-pane="view">Preview</button></div>

  <div class="sc-main">
    <section class="sc-viewpane">
      <div class="sc-wrap" id="scWrap">
        <div class="sc-comp" id="scComp">
          <div class="s-bg"></div>
          <div class="s-cap s-el" id="sCap" style="--d:0s"><div id="sCap1"></div><div id="sCap2"></div></div>
          <div class="s-frame s-el" id="sFrame" style="--d:.1s"></div>
          <div class="s-prev s-el" id="sPrev" style="--d:.2s">
            <div class="s-chrome"><i></i><i></i><i></i><span>localhost</span></div>
            <div class="s-screen" id="sScreen"><iframe id="sIframe" title="Live preview" sandbox="allow-scripts"></iframe></div>
          </div>
          <div class="s-title s-el" id="sTitle" style="--d:.5s"><span id="sTitleTx"></span></div>
          <div class="s-codes s-el" id="sCode" style="--d:.6s"></div>
          <div class="s-handle s-el" id="sHandle" style="--d:.8s"></div>
          <div class="s-tap" id="sTap"></div>
        </div>
      </div>
    </section>

    <form class="sc-form" id="scForm" autocomplete="off" onsubmit="return false">
      <h2>Project</h2>
      <label class="sc-f"><span>Project</span><select id="scProj"></select></label>

      <h2>Text</h2>
      <label class="sc-f"><span>Caption line 1 (colored)</span><input id="scCap1" type="text" maxlength="60" placeholder="e.g. Do You Love Me?"></label>
      <label class="sc-f"><span>Caption line 2 (white)</span><input id="scCap2" type="text" maxlength="60" placeholder="e.g. Share this with your…"></label>
      <label class="sc-f"><span>Title between preview and code</span><input id="scTitle" type="text" maxlength="90" placeholder="e.g. Heart Cursor Trail | Comment “Heart” for Source code"></label>
      <label class="sc-f"><span>Bottom handle (optional)</span><input id="scHandle" type="text" maxlength="40" placeholder="@yourname"></label>

      <h2>Look</h2>
      <div class="sc-f"><span>Accent color</span><div class="sc-acc" id="scAcc"></div></div>
      <div class="sc-row">
        <label class="sc-f"><span>Preview style</span>
          <select id="scStyle">
            <option value="wide" selected>Frameless 16:10</option>
            <option value="classic">Frameless 4:3</option>
            <option value="square">Frameless 1:1</option>
            <option value="phone">Phone</option>
            <option value="browser">Browser window</option>
          </select>
        </label>
        <label class="sc-f"><span>Outer frame</span>
          <select id="scFrame"><option value="1" selected>On</option><option value="0">Off</option></select>
        </label>
      </div>

      <h2>Code box</h2>
      <label class="sc-f"><span>Code to show</span>
        <select id="scCodeMode">
          <option value="html" selected>HTML only (one box)</option>
          <option value="css">CSS only (one box)</option>
          <option value="both">HTML + CSS (two boxes)</option>
        </select>
      </label>
      <p class="sc-hint">Only the important part is shown (no typing). With HTML + CSS, both boxes appear together, HTML on top and CSS below.</p>
      <div class="sc-code-f" data-k="html" id="scHtmlGroup">
        <div class="sc-chk"><b>HTML</b></div>
        <textarea id="scHtml" rows="7" spellcheck="false" placeholder="Paste or edit the HTML to show"></textarea>
        <div class="sc-row3">
          <label class="sc-f"><span>From line</span><input id="scHtmlFrom" type="number" min="1" inputmode="numeric"></label>
          <label class="sc-f"><span>To line</span><input id="scHtmlTo" type="number" min="1" inputmode="numeric"></label>
          <button type="button" class="btn-ghost" id="scHtmlLoad">Load lines</button>
        </div>
        <label class="sc-f"><span>Highlight lines (e.g. 2-4, 7)</span><input id="scHtmlHl" type="text" placeholder="optional"></label>
      </div>
      <div class="sc-code-f" data-k="css" id="scCssGroup" hidden>
        <div class="sc-chk"><b>CSS</b></div>
        <textarea id="scCss" rows="7" spellcheck="false" placeholder="Paste or edit the CSS to show"></textarea>
        <div class="sc-row3">
          <label class="sc-f"><span>From line</span><input id="scCssFrom" type="number" min="1" inputmode="numeric"></label>
          <label class="sc-f"><span>To line</span><input id="scCssTo" type="number" min="1" inputmode="numeric"></label>
          <button type="button" class="btn-ghost" id="scCssLoad">Load lines</button>
        </div>
        <label class="sc-f"><span>Highlight lines (e.g. 2-4, 7)</span><input id="scCssHl" type="text" placeholder="optional"></label>
      </div>
      <p class="sc-warn" id="scWarn" hidden></p>
    </form>
  </div>

  <footer class="sc-foot">
    <p class="rc-note" id="scNote">Edit the text and code, check the Preview, then press Play.</p>
    <div class="rc-ctrl">
      <button class="rc-start" id="scPlay" title="Hide all controls and play full screen, for your phone's own screen recorder"><svg class="ic fill"><use href="#i-play"/></svg><span>Play</span></button>
      <button class="rc-btn" id="scRec"><svg class="ic fill"><use href="#i-record"/></svg><span>Start Recording</span></button>
      <button class="rc-btn" id="scExpand" type="button" title="Hide everything else and make the preview big (or double-tap the preview)">Expand ⤢</button>
      <button class="rc-btn" id="scPause" disabled><svg class="ic fill"><use href="#i-pause"/></svg><span>Pause</span></button>
      <button class="rc-btn" id="scStop" disabled><svg class="ic fill"><use href="#i-stop"/></svg><span>Stop</span></button>
    </div>
  </footer>

  <div class="rc-result" id="scResult" hidden>
    <div class="rc-res-panel" role="dialog" aria-modal="true" aria-labelledby="scResTitle">
      <h2 id="scResTitle">Recording preview</h2>
      <video id="scVideo" controls playsinline></video>
      <p class="rc-res-meta" id="scResMeta"></p>
      <div class="rc-res-actions">
        <button class="rc-btn" id="scResClose" type="button">Close</button>
        <button class="rc-btn" id="scResAgain" type="button"><svg class="ic fill"><use href="#i-record"/></svg><span>Record Again</span></button>
        <a class="rc-start" id="scDownload" download="showcase.webm" role="button"><svg class="ic"><use href="#i-download"/></svg><span>Download</span></a>
      </div>
    </div>
  </div>
</div>`;

  const holder = document.createElement('div');
  holder.innerHTML = TEMPLATE;
  const root = holder.firstElementChild;
  document.body.appendChild(root);

  const openBtn = document.createElement('button');
  openBtn.className = 'rec-open sc-open';
  openBtn.id = 'scOpen';
  openBtn.title = 'Showcase Reel';
  openBtn.innerHTML = '<svg class="ic"><use href="#i-film"/></svg><span>Showcase</span>';
  const recBtn = document.getElementById('recOpen');
  wsBar.insertBefore(openBtn, recBtn || null);

  const $ = (id) => document.getElementById(id);
  const el = {
    wrap: $('scWrap'), comp: $('scComp'), cap: $('sCap'), cap1: $('sCap1'), cap2: $('sCap2'), frame: $('sFrame'),
    prev: $('sPrev'), screen: $('sScreen'), iframe: $('sIframe'), title: $('sTitle'), titleTx: $('sTitleTx'),
    code: $('sCode'), handle: $('sHandle'), tap: $('sTap'),
    expand: $('scExpand'), status: $('scStatus'), note: $('scNote'), play: $('scPlay'), rec: $('scRec'), pause: $('scPause'), stop: $('scStop'),
    proj: $('scProj'), warn: $('scWarn'),
    result: $('scResult'), video: $('scVideo'), resMeta: $('scResMeta'), download: $('scDownload')
  };
  const F = {
    cap1: $('scCap1'), cap2: $('scCap2'), title: $('scTitle'), handle: $('scHandle'), style: $('scStyle'), frame: $('scFrame'), mode: $('scCodeMode'), cssGroup: $('scCssGroup'), htmlGroup: $('scHtmlGroup'),
    html: { code: $('scHtml'), hl: $('scHtmlHl'), from: $('scHtmlFrom'), to: $('scHtmlTo'), load: $('scHtmlLoad') },
    css: { code: $('scCss'), hl: $('scCssHl'), from: $('scCssFrom'), to: $('scCssTo'), load: $('scCssLoad') }
  };
  const accBox = $('scAcc');
  Object.keys(ACCENTS).forEach((k) => {
    const b = document.createElement('button');
    b.type = 'button'; b.dataset.c = k; b.title = k; b.setAttribute('aria-label', 'Accent ' + k);
    b.style.setProperty('--c', ACCENTS[k]);
    accBox.appendChild(b);
  });

  /* ---------------------------------------------------------- data */
  const S = { open: false, projects: [], proj: null, cfg: null, tabs: [], geo: null, pg: null, expanded: false,
    state: 'idle', demo: false, hist: false, fsOn: false, fill: false, running: false, paused: false,
    goEl: null, goT: 0, layT: 0, saveT: 0, wake: null };

  const loadProjects = () => { try { return JSON.parse(localStorage.getItem(PKEY)) || []; } catch (e) { return []; } };
  const loadAll = () => { try { return JSON.parse(localStorage.getItem(SKEY)) || {}; } catch (e) { return {}; } };
  function saveCfg() {
    if (!S.proj) return;
    const all = loadAll(); all[S.proj.id] = S.cfg;
    try { localStorage.setItem(SKEY, JSON.stringify(all)); } catch (e) { /* settings just won't be remembered */ }
  }
  const fileOf = (p, lang) => {
    const f = p.files || [];
    return lang === 'css' ? f.find((x) => /\.css$/i.test(x.name)) : (f.find((x) => x.name === 'index.html') || f.find((x) => /\.html?$/i.test(x.name)));
  };
  function dedent(text) {
    const lines = text.replace(/\r\n?/g, '\n').replace(/\t/g, '  ').split('\n');
    while (lines.length && !lines[0].trim()) lines.shift();
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
    let min = Infinity;
    lines.forEach((l) => { if (l.trim()) min = Math.min(min, /^ */.exec(l)[0].length); });
    if (!isFinite(min)) min = 0;
    return lines.map((l) => l.slice(min).replace(/\s+$/, '')).join('\n');
  }
  function bodyOf(html) {
    const m = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(html || '');
    return dedent((m ? m[1] : html || '').replace(/<script[\s\S]*?<\/script>/gi, ''));
  }
  function defaults(p) {
    const h = fileOf(p, 'html'), c = fileOf(p, 'css');
    return { cap1: p.name || '', cap2: '', title: '', handle: '', accent: 'green', style: 'wide', frame: '1', mode: 'html',
      html: { code: h ? bodyOf(h.content).split('\n').slice(0, 14).join('\n') : '', hl: '' },
      css: { code: c ? dedent(c.content).split('\n').slice(0, 14).join('\n') : '', hl: '' } };
  }
  function writeForm(c) {
    F.cap1.value = c.cap1; F.cap2.value = c.cap2; F.title.value = c.title; F.handle.value = c.handle;
    F.style.value = c.style; F.frame.value = c.frame; F.mode.value = c.mode; syncMode();
    ['html', 'css'].forEach((k) => { F[k].code.value = c[k].code; F[k].hl.value = c[k].hl; F[k].from.value = F[k].to.value = ''; });
    accBox.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.c === c.accent));
  }
  function readForm() {
    const on = accBox.querySelector('button.on');
    return { cap1: F.cap1.value.trim(), cap2: F.cap2.value.trim(), title: F.title.value.trim(), handle: F.handle.value.trim(),
      accent: on ? on.dataset.c : 'green', style: F.style.value, frame: F.frame.value, mode: F.mode.value,
      html: { code: F.html.code.value, hl: F.html.hl.value },
      css: { code: F.css.code.value, hl: F.css.hl.value } };
  }
  function syncMode() { F.cssGroup.hidden = F.mode.value === 'html'; F.htmlGroup.hidden = F.mode.value === 'css'; }

  /* ---------------------------------------------------------- syntax highlighting (same rules as the editor) */
  const RULES = {
    html: [/(&lt;!--[\s\S]*?--&gt;)|(&lt;\/?[a-zA-Z][\w-]*|\/?&gt;)|("[^"\n]*"|'[^'\n]*')|(\s[\w:-]+(?==))/g, ['c', 't', 's', 'a']],
    css: [/(\/\*[\s\S]*?\*\/)|("[^"\n]*"|'[^'\n]*')|(#[0-9a-fA-F]{3,8}\b|\b\d+\.?\d*(?:px|%|em|rem|vh|vw|s|ms|deg)?\b)|([\w-]+)(?=\s*:)/g, ['c', 's', 'n', 'p']]
  };
  function hlText(text, lang) {
    const r = RULES[lang];
    return esc(text).replace(r[0], function () {
      const g = Array.prototype.slice.call(arguments, 1, 1 + r[1].length);
      const i = g.findIndex((x) => x !== undefined);
      return '<span class="st-' + r[1][i] + '">' + g[i] + '</span>';
    });
  }
  function hlLine(line, lang, st) {
    const open = lang === 'html' ? '<!--' : '/*', close = lang === 'html' ? '-->' : '*/';
    let out = '', rest = line;
    if (st.c) {
      const i = rest.indexOf(close);
      if (i < 0) return '<span class="st-c">' + esc(rest) + '</span>';
      out = '<span class="st-c">' + esc(rest.slice(0, i + close.length)) + '</span>';
      rest = rest.slice(i + close.length); st.c = false;
    }
    const o = rest.lastIndexOf(open);
    if (o >= 0 && rest.indexOf(close, o + open.length) < 0) {
      st.c = true;
      return out + hlText(rest.slice(0, o), lang) + '<span class="st-c">' + esc(rest.slice(o)) + '</span>';
    }
    return out + hlText(rest, lang);
  }
  function parseLines(spec) {
    const set = new Set();
    String(spec || '').split(/[,\s]+/).forEach((p) => {
      const m = /^(\d+)(?:-(\d+))?$/.exec(p);
      if (!m) return;
      const a = +m[1], b = m[2] ? +m[2] : a;
      for (let i = Math.min(a, b); i <= Math.max(a, b) && i < 500; i++) set.add(i);
    });
    return set;
  }

  /* ---------------------------------------------------------- text fitting */
  const cx = document.createElement('canvas').getContext('2d');
  const textW = (t, fs, weight, fam) => { cx.font = weight + ' ' + fs + 'px ' + fam; return cx.measureText(t).width; };
  let monoR = 0;
  const monoRatio = () => monoR || (monoR = (textW('0000000000', 100, 400, MONO) / 1000) || 0.6);
  function fitSize(lines, maxW, start, min, weight) {
    let fs = start;
    while (fs > min && Math.max.apply(null, lines.map((t) => textW(t, fs, weight, SANS))) > maxW * 0.97) fs -= 2;
    return fs;
  }
  function fitCode(lines, iw, ih) {
    const r = monoRatio(), maxLen = Math.max(1, Math.max.apply(null, lines.map((l) => l.length)));
    for (let fs = 40; fs >= 20; fs--) if (maxLen * r * fs <= iw && lines.length * fs * 1.6 <= ih) return { fs: fs, wrap: false, clip: false, rows: lines.length };
    for (let fs = 30; fs >= 17; fs--) {
      const cols = Math.max(8, Math.floor(iw / (r * fs)));
      const rows = lines.reduce((a, l) => a + Math.max(1, Math.ceil(l.length / cols)), 0);
      if (rows * fs * 1.6 <= ih) return { fs: fs, wrap: true, clip: false, rows: rows };
    }
    return { fs: 17, wrap: true, clip: true, rows: Math.floor(ih / (17 * 1.6)) };
  }

  /* ---------------------------------------------------------- layout of the 1080 x 1920 composition */
  /* Same phone as Recording Mode: 390 x 844 screen, 12px padding + 2px border around it, everything scaled by s */
  function phoneGeo(s) {
    return { vw: 390, vh: 844, s: s, bw: Math.round(418 * s), bh: Math.round(872 * s), sx: 12 * s, sy: 12 * s, sw: Math.round(390 * s), sh: Math.round(844 * s) };
  }
  function prevGeo(st, iw) {
    let g;
    if (st === 'classic') { const s = iw / 1024; g = { vw: 1024, vh: 768, s: s, bw: iw, sx: 0, sy: 0, sw: iw, sh: Math.round(768 * s) }; g.bh = g.sh; }
    else if (st === 'square') { const side = Math.min(iw, 780), s = side / 800; g = { vw: 800, vh: 800, s: s, bw: side, bh: side, sx: 0, sy: 0, sw: side, sh: side }; }
    else if (st === 'phone') { const s = Math.min(iw / 418, 830 / 872); g = phoneGeo(s); }
    else if (st === 'browser') { const bar = 56, s = iw / 1280, sh = Math.round(800 * s); g = { vw: 1280, vh: 800, s: s, bw: iw, bh: bar + sh, sx: 0, sy: bar, sw: iw, sh: sh }; }
    else { const s = iw / 1280; g = { vw: 1280, vh: 880, s: s, bw: iw, sx: 0, sy: 0, sw: iw, sh: Math.round(880 * s) }; g.bh = g.sh; }
    return g;
  }
  const px = (n) => Math.round(n * 100) / 100 + 'px';
  function place(node, x, y, w, h) { node.style.left = px(x); node.style.top = px(y); if (w != null) node.style.width = px(w); if (h != null) node.style.height = px(h); }

  function applyPrev(g, bx, by) {
    place(el.prev, bx, by, g.bw, g.bh);
    place(el.screen, g.sx, g.sy, g.sw, g.sh);
    el.iframe.style.width = g.vw + 'px'; el.iframe.style.height = g.vh + 'px';
    el.iframe.style.transform = 'scale(' + g.s + ')';
    el.prev.style.setProperty('--k', g.s);
    S.pg = { bx: bx, by: by, g: g };                       // where the preview really is right now (taps are mapped with this)
  }
  /* Expanded: everything else fades away and the preview grows to fill the picture */
  function expandedGeo(g0) {
    const AX = 40, AY = 56, AW = W - 2 * AX, AH = 1810 - AY;
    if (S.cfg.style === 'phone') {
      const g = phoneGeo(Math.min(AW / 418, AH / 872));
      return { bx: (W - g.bw) / 2, by: AY + (AH - g.bh) / 2, g: g };
    }
    const bar = S.cfg.style === 'browser' ? 56 : 0;
    const s = Math.min(AW / g0.vw, (AH - bar) / g0.vh);       // the page keeps its real size and proportions, it is only scaled up
    const sw = Math.round(g0.vw * s), sh = Math.round(g0.vh * s);
    const g = { vw: g0.vw, vh: g0.vh, s: s, bw: sw, bh: bar + sh, sx: 0, sy: bar, sw: sw, sh: sh };
    return { bx: (W - g.bw) / 2, by: AY + (AH - g.bh) / 2, g: g };
  }
  function placePrev() {
    if (!S.geo) return;
    if (S.expanded) { const e = expandedGeo(S.geo.g); applyPrev(e.g, e.bx, e.by); }
    else applyPrev(S.geo.g, S.geo.bx, S.geo.by);
  }
  let glideT = 0;
  function setExpanded(on, glide) {
    if (!S.cfg || S.expanded === on) return;
    S.expanded = on;
    clearTimeout(glideT);
    el.comp.classList.toggle('glide', !!glide);
    el.comp.classList.toggle('ex', on);
    placePrev();
    el.expand.textContent = on ? 'Shrink ⤡' : 'Expand ⤢';
    if (glide) glideT = setTimeout(() => el.comp.classList.remove('glide'), 800);
  }
  function layout() {
    if (!S.cfg) return;
    const c = S.cfg;
    el.comp.style.setProperty('--acc', ACCENTS[c.accent] || ACCENTS.green);
    const hasCap = !!(c.cap1 || c.cap2), framed = c.frame === '1';
    let y = hasCap ? 72 : 96;

    if (hasCap) {
      const lines = [c.cap1, c.cap2].filter(Boolean);
      const fs = fitSize(lines, 960, 80, 34, 800);
      el.cap.style.fontSize = fs + 'px';
      el.cap1.textContent = c.cap1; el.cap2.textContent = c.cap2;
      el.cap1.style.display = c.cap1 ? '' : 'none'; el.cap2.style.display = c.cap2 ? '' : 'none';
      const h = Math.round(lines.length * fs * 1.2);
      place(el.cap, 60, y, 960, h);
      y += h + 30;
      el.cap.hidden = false;
    } else el.cap.hidden = true;

    const frameTop = y, innerX = framed ? 70 : 60, innerW = framed ? 940 : 960;
    if (framed) y += 26;

    /* preview */
    const g = prevGeo(c.style, innerW);
    const bx = innerX + (innerW - g.bw) / 2;
    el.prev.dataset.st = c.style;
    S.geo = { bx: bx, by: y, g: g };
    applyPrev(g, bx, y);
    y += g.bh;

    /* title strip */
    if (c.title) {
      y += 20;
      el.titleTx.textContent = c.title;
      el.title.style.fontSize = fitSize([c.title], innerW - 40, 31, 20, 600) + 'px';
      place(el.title, innerX, y, innerW, 58);
      el.title.hidden = false;
      y += 58;
    } else el.title.hidden = true;

    /* code box(es): one for HTML only, two stacked boxes for HTML + CSS */
    S.tabs = tabsList();
    if (S.tabs.length) {
      y += 24;
      const n = S.tabs.length, gap = 22, BAR = 66, PAD = 28;
      const bottom = SAFE - (framed ? 26 : 0), avail = Math.max(300, bottom - y);
      const boxAvail = (avail - gap * (n - 1)) / n;
      const iw = innerW - 2 * PAD - 4, ih = boxAvail - BAR - 2 * PAD + 8;
      let total = gap * (n - 1);
      S.tabs.forEach((t) => {
        t.f = fitCode(t.code.split('\n'), iw, ih);
        t.h = Math.round(Math.min(boxAvail, Math.max(220, t.f.rows * t.f.fs * 1.6 + BAR + 2 * PAD + 70)));
        total += t.h;
      });
      place(el.code, innerX, y, innerW, total);
      el.code.hidden = false;
      renderCode();
      y += total;
    } else { el.code.hidden = true; el.warn.hidden = true; }

    if (framed) { place(el.frame, 44, frameTop, 992, y + 26 - frameTop); el.frame.hidden = false; } else el.frame.hidden = true;

    el.handle.textContent = c.handle; el.handle.hidden = !c.handle;
    place(el.handle, 0, 1826, W, 44);
    if (S.expanded) placePrev();
  }
  const scheduleLayout = () => { clearTimeout(S.layT); S.layT = setTimeout(layout, 90); };

  /* ---------------------------------------------------------- code box */
  function tabsList() {
    const out = [];
    (S.cfg.mode === 'both' ? ['html', 'css'] : S.cfg.mode === 'css' ? ['css'] : ['html']).forEach((k) => {
      const d = S.cfg[k];
      if (!d.code.trim()) return;
      const f = S.proj ? fileOf(S.proj, k) : null;
      out.push({ k: k, name: f ? f.name : (k === 'css' ? 'style.css' : 'index.html'), code: dedent(d.code), hl: parseLines(d.hl) });
    });
    return out;
  }
  function renderCode() {
    el.code.innerHTML = '';
    const clipped = [];
    S.tabs.forEach((t) => {
      const lines = t.code.split('\n'), f = t.f, st = { c: false };
      const box = document.createElement('div');
      box.className = 's-code';
      box.style.height = t.h + 'px';
      box.innerHTML = '<div class="s-win"><span class="s-dots"><i></i><i></i><i></i></span><div class="s-tabs"><span class="s-file"><i class="f-' + t.k + '"></i>' + esc(t.name) + '</span></div></div>';
      const body = document.createElement('div');
      body.className = 's-body' + (f.wrap ? ' wrap' : '') + (f.clip ? ' clip' : '');
      body.style.fontSize = f.fs + 'px';
      body.innerHTML = lines.map((l, i) => '<div class="s-ln' + (t.hl.has(i + 1) ? ' hl' : '') + '">' + (hlLine(l, t.k, st) || '&nbsp;') + '</div>').join('');
      box.appendChild(body);
      el.code.appendChild(box);
      if (f.clip) clipped.push(t.k.toUpperCase());
    });
    el.warn.hidden = !clipped.length;
    if (clipped.length) el.warn.textContent = 'The ' + clipped.join(' and ') + ' snippet is too long, so only the top part fits in the video. Shorten it or show fewer lines.';
  }

  /* ---------------------------------------------------------- preview document (reads the project, never changes it) */
  function injected() {
    var raf = 0, last = null;
    document.addEventListener('pointerdown', function (e) { parent.postMessage({ sc: 'tap', x: e.clientX, y: e.clientY, t: e.pointerType }, '*'); }, true);
    document.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      last = e;
      if (!raf) raf = requestAnimationFrame(function () { raf = 0; parent.postMessage({ sc: 'move', x: last.clientX, y: last.clientY }, '*'); });
    }, true);
  }
  const INJECT = '<style>html{scrollbar-width:none;border-radius:38px;overflow:hidden;clip-path:inset(0 round 38px)}::-webkit-scrollbar{display:none}</style><script>(' + injected.toString() + ')()<\/script>';
  function buildDoc(p) {
    const f = (n) => (p.files || []).find((x) => x.name === n);
    const idx = fileOf(p, 'html');
    let html = idx ? idx.content : '';
    html = html.replace(/<link[^>]*href=["']([^"']+)["'][^>]*>/gi, (m, h) => { const x = f(h); return x && /stylesheet/i.test(m) ? '<style>' + x.content + '</style>' : m; });
    html = html.replace(/<script([^>]*?)\ssrc=["']([^"']+)["']([^>]*)>\s*<\/script>/gi, (m, a, h, b) => { const x = f(h); return x ? '<script' + a + b + '>' + x.content.replace(/<\/script/gi, '<\\/script') + '<\/script>' : m; });
    return html + INJECT;
  }
  const loadPreview = () => { if (S.proj) el.iframe.srcdoc = buildDoc(S.proj); };

  /* Click effect: the same ring as Recording Mode */
  let lastTap = { t: 0, x: 0, y: 0 };
  function ring(x, y) {
    const r = document.createElement('i');
    r.className = 's-ring';
    r.style.left = px(x); r.style.top = px(y);
    el.tap.appendChild(r);
    setTimeout(() => r.remove(), 700);
  }
  function tapped(x, y, inPrev) {                            // two quick taps on the preview = expand / shrink
    const now = performance.now();
    if (inPrev && now - lastTap.t < 330 && Math.hypot(x - lastTap.x, y - lastTap.y) < 90) { lastTap.t = 0; setExpanded(!S.expanded, true); return; }
    lastTap = { t: now, x: x, y: y };
  }
  window.addEventListener('message', (e) => {
    if (e.source !== el.iframe.contentWindow || !e.data || !S.pg) return;
    const d = e.data, G = S.pg;
    if (d.sc !== 'tap') return;
    const x = G.bx + G.g.sx + d.x * G.g.s, y = G.by + G.g.sy + d.y * G.g.s;
    ring(x, y); tapped(x, y, true);
  });
  el.comp.addEventListener('pointerdown', (e) => {          // taps on the code boxes, the frame etc. (the preview reports its own)
    const r = el.comp.getBoundingClientRect(), k = r.width / W;
    const x = (e.clientX - r.left) / k, y = (e.clientY - r.top) / k, G = S.pg;
    ring(x, y);
    tapped(x, y, !!G && x >= G.bx && x <= G.bx + G.g.bw && y >= G.by && y <= G.by + G.g.bh);
  });

  /* ---------------------------------------------------------- fitting the composition to the screen */
  function fit() {
    if (root.hidden) return;
    const cw = el.wrap.clientWidth, ch = el.wrap.clientHeight;
    if (!cw || !ch) return;
    const live = root.classList.contains('live'), m = live ? 0 : 12, dpr = window.devicePixelRatio || 1;
    let s = Math.max(0.02, Math.min((cw - 2 * m) / W, (ch - 2 * m) / H));
    if (live) {                                            // whole screen pixels, so the recorder copies it 1:1
      const step = S.fill ? 1 : 9;
      const p = Math.max(step, S.fill ? Math.ceil(W * s * dpr) : Math.floor(W * s * dpr / step) * step);
      s = p / dpr / W;
    }
    el.comp.style.width = W + 'px'; el.comp.style.height = H + 'px';
    el.comp.style.left = (Math.round((cw - W * s) / 2 * dpr) / dpr) + 'px';
    el.comp.style.top = (Math.round((ch - H * s) / 2 * dpr) / dpr) + 'px';
    el.comp.style.transform = 'scale(' + s + ')';
  }
  if (window.ResizeObserver) new ResizeObserver(fit).observe(el.wrap);
  window.addEventListener('resize', fit);

  /* ---------------------------------------------------------- status / controls */
  const STATUS = { idle: 'Ready', starting: 'Starting…', recording: 'Recording', paused: 'Paused', stopped: 'Stopped' };
  function setState(s, note) {
    S.state = s;
    el.status.dataset.state = s;
    root.dataset.s = s;
    el.status.querySelector('em').textContent = STATUS[s];
    if (note) el.note.textContent = note; else el.note.textContent = ({
      idle: 'Edit the text and code, check the Preview, then press Play.',
      starting: 'Choose “This Tab” in the browser prompt to begin.',
      recording: 'Recording. Use the page in the preview, then press Stop.',
      paused: 'Paused. Press Start Recording to continue.',
      stopped: 'Stopped. Download the video before closing the preview.'
    })[s];
    el.note.classList.remove('err');
    const live = s === 'recording', paused = s === 'paused';
    el.rec.disabled = live || s === 'starting';
    el.rec.querySelector('span').textContent = paused ? 'Resume' : 'Start Recording';
    el.play.disabled = live || paused || s === 'starting';
    el.pause.disabled = !live;
    el.stop.disabled = !(live || paused);
  }

  /* ---------------------------------------------------------- 3 - 2 - 1 */
  function goClear() { clearTimeout(S.goT); if (S.goEl) { S.goEl.remove(); S.goEl = null; } }
  function goReady(onTap) {
    goClear();
    const d = document.createElement('div');
    d.className = 's-go';
    d.innerHTML = '<button type="button" class="s-go-btn" aria-label="Play"><svg class="ic fill"><use href="#i-play"/></svg></button>';
    el.wrap.appendChild(d);
    S.goEl = d;
    d.querySelector('button').addEventListener('click', onTap);
  }
  function countdown(done) {
    goClear();
    const d = document.createElement('div');
    d.className = 's-go count';
    d.innerHTML = '<b></b>';
    el.wrap.appendChild(d);
    S.goEl = d;
    let n = 3;
    const b = d.querySelector('b');
    const step = () => {
      if (S.goEl !== d) return;
      if (n <= 0) { goClear(); done(); return; }
      b.textContent = n; n--;
      b.style.animation = 'none'; void b.offsetWidth; b.style.animation = '';
      S.goT = setTimeout(step, 1000);
    };
    step();
  }
  /* Entrance: caption, preview, title and code rise in one after another */
  function begin() {
    loadPreview();
    renderCode();
    el.comp.classList.remove('pre', 'play');
    void el.comp.offsetWidth;
    el.comp.classList.add('play');
    S.running = true; S.paused = false;
  }
  function resetStage() {
    S.running = false; S.paused = false;
    el.comp.classList.remove('pre', 'play');
    if (S.expanded) { S.expanded = false; el.comp.classList.remove('ex', 'glide'); el.expand.textContent = 'Expand ⤢'; }
    if (S.cfg) layout();
    loadPreview();
  }

  /* ---------------------------------------------------------- Play mode (for the phone's own screen recorder) */
  function demoStart() {
    if (!S.proj || S.demo || S.state !== 'idle') return;
    setExpanded(false, false);
    layout();
    S.demo = true; S.fsOn = false; S.hist = false; S.fill = false;
    root.classList.add('clean', 'live');
    fit();
    try { history.pushState({ scDemo: 1 }, ''); S.hist = true; } catch (e) { /* Back button just won't work */ }
    const fs = root.requestFullscreen || root.webkitRequestFullscreen;
    if (fs) { try { const p = fs.call(root); if (p && p.catch) p.catch(() => {}); } catch (e) { /* not allowed here */ } }
    try { if (navigator.wakeLock) navigator.wakeLock.request('screen').then((l) => { S.wake = l; }).catch(() => {}); } catch (e) { /* optional */ }
    setTimeout(() => {
      if (!S.demo) return;
      S.fill = true; fit();
      goReady(() => { el.comp.classList.add('pre'); countdown(begin); });   // 3-2-1 on a clean background, then everything comes in
    }, 900);
  }
  function demoExit(fromPop) {
    if (!S.demo) return;
    S.demo = false;
    goClear();
    resetStage();
    root.classList.remove('clean', 'live');
    if (S.wake) { try { S.wake.release(); } catch (e) { /* ignore */ } S.wake = null; }
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      try { (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch (e) { /* ignore */ }
    }
    if (S.hist && !fromPop) { S.hist = false; try { history.back(); } catch (e) { /* ignore */ } }
    S.hist = false; S.fill = false;
    fit();
  }
  el.play.addEventListener('click', demoStart);
  window.addEventListener('popstate', () => { if (S.demo) { S.hist = false; demoExit(true); } });
  document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) S.fsOn = true;
    else if (S.demo && S.fsOn) demoExit(false);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && S.demo) demoExit(false); });

  /* ---------------------------------------------------------- Start Recording (records this tab, desktop browsers) */
  const R = { mr: null, chunks: [], session: 0, t0: 0, acc: 0, url: '', saved: false };
  const unsupported = () => (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia && window.MediaRecorder && HTMLCanvasElement.prototype.captureStream) ? '' :
    'Recording isn’t supported on this browser or device. Use Play with your phone’s own screen recorder, or Chrome / Edge on a desktop.';
  const stopTracks = (s) => { if (s) s.getTracks().forEach((t) => { try { t.stop(); } catch (e) { /* done */ } }); };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  function fail(msg) {
    resetStage(); root.classList.remove('live'); S.fill = false; fit();
    setState('idle'); el.note.textContent = msg; el.note.classList.add('err');
  }
  function errText(err) {
    const n = err && err.name;
    if (n === 'NotAllowedError') return 'Screen sharing was cancelled, so nothing was recorded.';
    if (n === 'ScSurface') return 'Please choose “This Tab” in the sharing prompt. Nothing was recorded.';
    if (n === 'ScNoFrames') return 'The browser shared the tab but sent no picture. Try again and pick “This Tab”.';
    return 'Couldn’t start the recording' + (n ? ' (' + n + ')' : '') + '.';
  }
  async function recStart() {
    if (S.state === 'paused' && R.mr) { R.mr.resume(); S.paused = false; R.t0 = performance.now(); setState('recording'); return; }
    if (!S.proj) return;
    const why = unsupported();
    if (why) { fail(why); return; }
    closeResult(); discardVideo();
    setExpanded(false, false);
    layout();
    const sid = ++R.session;
    setState('starting');
    let stream = null, vid = null, live = true, raf = 0;
    const cleanup = () => { live = false; cancelAnimationFrame(raf); if (vid) { vid.pause(); vid.srcObject = null; vid.remove(); } stopTracks(stream); };
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: { ideal: 30 } }, audio: false,
        preferCurrentTab: true, selfBrowserSurface: 'include', surfaceSwitching: 'exclude', monitorTypeSurfaces: 'exclude', systemAudio: 'exclude' });
      if (sid !== R.session) { stopTracks(stream); return; }
      const track = stream.getVideoTracks()[0], surface = (track.getSettings() || {}).displaySurface;
      if (surface && surface !== 'browser') { const e = new Error('not this tab'); e.name = 'ScSurface'; throw e; }

      S.fill = false; root.classList.add('live'); fit();
      vid = document.createElement('video');
      vid.muted = true; vid.playsInline = true; vid.srcObject = stream;
      vid.style.cssText = 'position:fixed;left:0;top:0;width:2px;height:2px;opacity:0;pointer-events:none';
      document.body.appendChild(vid);
      await vid.play();
      for (let i = 0; i < 60 && !(vid.videoWidth > 0 && vid.readyState >= 2); i++) await wait(50);
      if (!(vid.videoWidth > 0)) { const e = new Error('no frames'); e.name = 'ScNoFrames'; throw e; }
      await wait(600);                                                     // the "sharing" bar finishes resizing the page
      if (sid !== R.session) { cleanup(); return; }
      fit();

      const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      const ctx = cv.getContext('2d', { alpha: false });
      ctx.imageSmoothingQuality = 'high';
      const draw = () => {
        if (!live) return;
        if (vid.readyState >= 2) {
          const kx = vid.videoWidth / window.innerWidth, ky = vid.videoHeight / window.innerHeight, r = el.comp.getBoundingClientRect();
          if (r.width > 0 && r.height > 0) ctx.drawImage(vid, r.left * kx, r.top * ky, r.width * kx, r.height * ky, 0, 0, W, H);
        }
        raf = requestAnimationFrame(draw);
      };
      draw();
      const mime = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'].find((t) => MediaRecorder.isTypeSupported(t)) || '';
      const opts = { videoBitsPerSecond: 8000000 }; if (mime) opts.mimeType = mime;
      const mr = new MediaRecorder(cv.captureStream(30), opts);
      mr.scCleanup = cleanup; mr.scDiscard = false;
      R.chunks = []; R.acc = 0;
      mr.ondataavailable = (e) => { if (R.mr === mr && e.data && e.data.size) R.chunks.push(e.data); };
      mr.onstop = () => recFinish(mr);
      mr.onerror = () => { recAbort(); fail('Recording stopped unexpectedly. Nothing was saved.'); };
      track.addEventListener('ended', () => { if (R.mr === mr && mr.state !== 'inactive') recStop(); });
      R.mr = mr;
      el.comp.classList.add('pre');
      setState('starting', '3 – 2 – 1 …');
      countdown(() => {                                                    // the video starts exactly when everything comes in
        if (R.mr !== mr) return;
        mr.start(1000); R.t0 = performance.now();
        setState('recording');
        begin();
      });
    } catch (err) {
      cleanup();
      if (sid === R.session) fail(errText(err));
    }
  }
  function recPause() {
    if (!R.mr || R.mr.state !== 'recording') return;
    R.mr.pause(); S.paused = true; R.acc += performance.now() - R.t0; setState('paused');
  }
  function recStop() {
    const mr = R.mr;
    if (!mr || mr.state === 'inactive') return;
    if (mr.state === 'recording') R.acc += performance.now() - R.t0;
    el.pause.disabled = true; el.stop.disabled = true;
    try { mr.requestData(); } catch (e) { /* flush */ }
    try { mr.stop(); } catch (e) { recAbort(); fail('Couldn’t finish the recording. Nothing was saved.'); }
  }
  function recFinish(mr) {
    mr.scCleanup();
    if (mr.scDiscard) return;
    if (R.mr === mr) R.mr = null;
    resetStage(); root.classList.remove('live'); S.fill = false; fit();
    if (!R.chunks.length) { fail('No video data was captured. Try again.'); return; }
    const blob = new Blob(R.chunks, { type: mr.mimeType || 'video/webm' });
    R.chunks = [];
    R.url = URL.createObjectURL(blob);
    setState('stopped');
    showResult(blob);
  }
  function recAbort() {
    R.session++;
    goClear();
    const mr = R.mr; R.mr = null; R.chunks = [];
    if (mr) { mr.scDiscard = true; if (mr.state !== 'inactive') { try { mr.stop(); } catch (e) { /* ignore */ } } mr.scCleanup(); }
    resetStage(); root.classList.remove('live'); S.fill = false; fit();
  }
  const fmtTime = (ms) => { const s = Math.round(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  function showResult(blob) {
    el.video.src = R.url;
    const d = new Date(), p2 = (n) => String(n).padStart(2, '0');
    const slug = ((S.proj && S.proj.name) || 'showcase').toLowerCase().replace(/[^a-z0-9ঀ-৿]+/g, '-').replace(/^-+|-+$/g, '') || 'showcase';
    el.download.href = R.url;
    el.download.download = slug + '-showcase-' + d.getFullYear() + p2(d.getMonth() + 1) + p2(d.getDate()) + '-' + p2(d.getHours()) + p2(d.getMinutes()) + '.' + (/mp4/.test(blob.type) ? 'mp4' : 'webm');
    R.saved = false;
    el.resMeta.textContent = fmtTime(R.acc) + ' · ' + (blob.size / 1048576).toFixed(1) + ' MB · ' + (blob.type.split(';')[0].replace('video/', '') || 'video').toUpperCase() + ' — download it before closing.';
    el.result.hidden = false;
    $('scResClose').focus();
  }
  function closeResult() { el.result.hidden = true; el.video.pause(); }
  function discardVideo() {
    if (R.url) URL.revokeObjectURL(R.url);
    R.url = '';
    el.video.pause(); el.video.removeAttribute('src'); el.video.load();
  }
  el.video.addEventListener('loadedmetadata', () => {                      // WebM from MediaRecorder reports an infinite length; this makes the seek bar work
    if (el.video.duration !== Infinity) return;
    const v = el.video; v.currentTime = 1e101;
    v.addEventListener('timeupdate', function reset() { v.removeEventListener('timeupdate', reset); v.currentTime = 0; });
  });
  const confirmDiscard = () => R.saved || !R.url || window.confirm('This video has not been downloaded. Discard it?');
  el.download.addEventListener('click', () => { R.saved = true; });
  $('scResClose').addEventListener('click', () => { if (!confirmDiscard()) return; closeResult(); discardVideo(); setState('idle'); });
  $('scResAgain').addEventListener('click', () => { if (!confirmDiscard()) return; closeResult(); discardVideo(); setState('idle'); recStart(); });
  el.rec.addEventListener('click', recStart);
  el.pause.addEventListener('click', recPause);
  el.stop.addEventListener('click', recStop);

  /* ---------------------------------------------------------- open / exit / form wiring */
  function chooseProject(id) {
    S.proj = S.projects.find((p) => p.id === id) || S.projects[0] || null;
    if (!S.proj) { S.cfg = null; return; }
    const saved = loadAll()[S.proj.id], d = defaults(S.proj);
    S.cfg = saved ? Object.assign(d, saved, { html: Object.assign(d.html, saved.html), css: Object.assign(d.css, saved.css) }) : d;
    if (saved && !saved.mode) S.cfg.mode = (saved.css && saved.css.on) ? 'both' : 'html';
    if (['html', 'css', 'both'].indexOf(S.cfg.mode) < 0) S.cfg.mode = 'html';
    el.proj.value = S.proj.id;
    writeForm(S.cfg);
    loadPreview();
    layout();
  }
  function open() {
    if (S.open) return;
    S.projects = loadProjects().slice().sort((a, b) => new Date(b.updated) - new Date(a.updated));
    const nameNow = (document.getElementById('wsName') || {}).textContent;
    const cur = S.projects.find((p) => p.name === nameNow) || S.projects[0];
    el.proj.innerHTML = S.projects.map((p) => '<option value="' + esc(p.id) + '">' + esc(p.name) + '</option>').join('');
    S.open = true;
    ws.inert = true;
    root.hidden = false;
    root.dataset.pane = 'edit';
    root.querySelectorAll('.sc-tabs button').forEach((b) => b.classList.toggle('on', b.dataset.pane === 'edit'));
    closeResult();
    setState('idle');
    if (!cur) { S.proj = null; S.cfg = null; el.note.textContent = 'Create a project first.'; el.play.disabled = el.rec.disabled = true; return; }
    el.rec.hidden = !!unsupported();
    chooseProject(cur.id);
    requestAnimationFrame(fit);
  }
  function exit() {
    if (!S.open) return;
    if ((S.state === 'recording' || S.state === 'paused') && !window.confirm('Stop recording and discard it?')) return;
    demoExit(false);
    recAbort();
    closeResult(); discardVideo();
    saveCfg();
    S.open = false;
    setState('idle');
    root.hidden = true;
    el.iframe.srcdoc = '';
    ws.inert = false;
    openBtn.focus();
  }
  el.expand.addEventListener('click', () => setExpanded(!S.expanded, true));
  openBtn.addEventListener('click', open);
  $('scExit').addEventListener('click', exit);

  root.querySelectorAll('.sc-tabs button').forEach((b) => b.addEventListener('click', () => {
    root.dataset.pane = b.dataset.pane;
    root.querySelectorAll('.sc-tabs button').forEach((x) => x.classList.toggle('on', x === b));
    requestAnimationFrame(fit);
  }));
  el.proj.addEventListener('change', () => { saveCfg(); chooseProject(el.proj.value); });
  accBox.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    accBox.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
    changed();
  });
  function changed() {
    if (!S.proj) return;
    syncMode();
    S.cfg = readForm();
    clearTimeout(S.saveT); S.saveT = setTimeout(saveCfg, 300);
    scheduleLayout();
  }
  root.querySelector('#scForm').addEventListener('input', changed);
  root.querySelector('#scForm').addEventListener('change', changed);
  ['html', 'css'].forEach((k) => F[k].load.addEventListener('click', () => {
    const f = S.proj && fileOf(S.proj, k);
    if (!f) return;
    const all = f.content.replace(/\r\n?/g, '\n').split('\n');
    const a = Math.max(1, parseInt(F[k].from.value, 10) || 1), b = Math.min(all.length, parseInt(F[k].to.value, 10) || all.length);
    F[k].code.value = dedent(all.slice(a - 1, Math.max(a, b)).join('\n'));
    if (k === 'css' && F.mode.value === 'html') F.mode.value = 'both';
    if (k === 'html' && F.mode.value === 'css') F.mode.value = 'both';
    changed();
  }));
  window.addEventListener('pagehide', saveCfg);
})();
