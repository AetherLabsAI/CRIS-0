/* CRIS-0 project page · Aether AI */
(() => {
  'use strict';

  const CFG = window.SITE_CONFIG || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const DEV = location.protocol === 'file:' || /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])$/.test(location.hostname);
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EMBED_RE = /(youtube\.com|youtu\.be|vimeo\.com)/i;

  const ICON = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/></svg>',
    restart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4v3.5H8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    expand: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    film: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M10 9.5v5l4.5-2.5z" fill="currentColor"/></svg>',
  };

  /* ---------- helpers ---------- */
  function h(tag, props, ...kids) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'html') n.innerHTML = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) if (kid != null && kid !== false) n.append(kid);
    return n;
  }

  const fmtTime = (s) => {
    if (!isFinite(s)) return '0:00';
    s = Math.max(0, Math.floor(s));
    const m = Math.floor(s / 60);
    return m >= 60
      ? `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
      : `${m}:${String(s % 60).padStart(2, '0')}`;
  };

  const isEmbed = (src) => !!src && EMBED_RE.test(src);
  const autoPoster = (src) => (src && !isEmbed(src) ? src.replace(/\.(mp4|webm|mov|m4v)$/i, '.jpg') : undefined);

  function embedUrl(src, { autoplay = true } = {}) {
    let m = src.match(/(?:youtu\.be\/|[?&]v=|embed\/|shorts\/)([\w-]{11})/);
    if (m) return `https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=${+autoplay}&rel=0&playsinline=1&modestbranding=1`;
    m = src.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (m) return `https://player.vimeo.com/video/${m[1]}?autoplay=${+autoplay}`;
    return src;
  }

  function makeVideo({ poster, muted = true, loop = true, controls = false, preload = 'metadata' } = {}) {
    const v = document.createElement('video');
    v.muted = muted;
    if (muted) v.setAttribute('muted', '');
    v.loop = loop;
    v.controls = controls;
    v.preload = preload;
    v.playsInline = true;
    v.setAttribute('playsinline', '');
    if (poster) v.poster = poster;
    return v;
  }

  function missingNode(src) {
    return h('div', { class: 'slot-missing', html: ICON.film },
      h('span', { class: 'slot-missing__title' }, 'Video coming soon'),
      DEV ? h('code', { class: 'slot-missing__path' }, src || 'no source configured') : null);
  }

  // Put a <video> into a .media-slot; flips the slot to a placeholder if the file can't load.
  function mountVideo(slot, v, src) {
    slot.append(v, missingNode(src));
    if (!src) { slot.classList.add('is-missing'); return false; }
    v.addEventListener('error', () => slot.classList.add('is-missing'), { once: true });
    v.src = src;
    return true;
  }

  const safePlay = (v) => { const p = v.play(); if (p) p.catch(() => {}); };

  /* ---------- comparison groups registry ---------- */
  const Groups = {
    list: [],
    pauseAll() { this.list.forEach((g) => g.pause()); },
    syncAll() { this.list.forEach((g) => g.sync()); },
  };

  /* ---------- lightbox ---------- */
  const lb = $('#lightbox');

  function openLightbox({ src, title, poster }) {
    if (!lb) return;
    const stage = $('.lightbox__stage', lb);
    stage.replaceChildren();
    stage.classList.remove('is-missing');
    $('.lightbox__title', lb).textContent = title || '';

    if (isEmbed(src)) {
      stage.append(h('iframe', { src: embedUrl(src), title: title || 'Video', allow: 'autoplay; fullscreen; picture-in-picture', allowfullscreen: true }));
    } else {
      const v = makeVideo({ poster: poster ?? autoPoster(src), muted: false, loop: false, controls: true, preload: 'auto' });
      if (mountVideo(stage, v, src)) {
        const p = v.play();
        if (p) p.catch(() => { v.muted = true; safePlay(v); });
      }
    }

    Groups.pauseAll();
    if (typeof lb.showModal === 'function') lb.showModal();
    else lb.setAttribute('open', '');
    document.documentElement.classList.add('is-locked');
  }

  if (lb) {
    lb.addEventListener('close', () => {
      $('.lightbox__stage', lb).replaceChildren();
      document.documentElement.classList.remove('is-locked');
      Groups.syncAll();
    });
    lb.addEventListener('click', (e) => {
      if (e.target === lb || e.target.closest('[data-close]')) lb.close();
    });
  }

  /* ---------- hero ---------- */
  function initHero() {
    const hero = $('#top');
    if (!hero) return;
    const cfg = CFG.hero || {};
    const bg = $('.hero__bg', hero);

    // Show the cover still; keep it visible when the background loop is disabled.
    const coverPoster = cfg.poster ?? autoPoster(cfg.preview || cfg.video);
    if (coverPoster) {
      const img = new Image();
      img.onload = () => { bg.poster = coverPoster; hero.classList.add('has-poster'); };
      img.src = coverPoster;
    }

    const queue = cfg.preview === false ? [] : [...new Set([cfg.preview, cfg.video])].filter((s) => s && !isEmbed(s));
    const next = () => {
      const src = queue.shift();
      if (!src) { bg.removeAttribute('src'); hero.classList.add('no-video'); return; }
      bg.src = src;
      safePlay(bg);
    };
    bg.addEventListener('error', next);
    bg.addEventListener('loadeddata', () => hero.classList.add('has-video'), { once: true });
    next();

    // "Main demo · 3:12"
    const meta = $('[data-hero-meta]', hero);
    const setMeta = (d) => { if (meta && d) meta.textContent = `Main demo · ${d}`; };
    if (cfg.duration) setMeta(cfg.duration);
    else if (cfg.video && !isEmbed(cfg.video)) {
      const probe = document.createElement('video');
      probe.preload = 'metadata';
      probe.muted = true;
      probe.addEventListener('loadedmetadata', () => setMeta(fmtTime(probe.duration)), { once: true });
      probe.src = cfg.video;
    }

    const open = () => openLightbox({ src: cfg.video, title: cfg.title || 'Main demo', poster: cfg.poster });
    $$('[data-play-hero]').forEach((b) => b.addEventListener('click', open));

    // Save decoding when the cover is off-screen
    new IntersectionObserver(([e]) => {
      if (!hero.classList.contains('has-video')) return;
      if (e.isIntersecting && !(lb && lb.open)) safePlay(bg); else bg.pause();
    }).observe(hero);
    if (lb) {
      lb.addEventListener('close', () => { if (hero.classList.contains('has-video') && hero.getBoundingClientRect().bottom > 0) safePlay(bg); });
      new MutationObserver(() => { if (lb.open) bg.pause(); }).observe(lb, { attributes: true, attributeFilter: ['open'] });
    }
  }

  /* ---------- comparison player ---------- */
  function stageChips(v, stages) {
    const btns = stages.map((s, i) => h('button', {
      class: 'stage-chip', type: 'button',
      onclick: () => { v.currentTime = isFinite(v.duration) ? Math.min(s.t, Math.max(0, v.duration - 0.05)) : s.t; safePlay(v); },
    }, h('span', { class: 'stage-chip__i' }, String(i + 1)), s.label));
    v.addEventListener('timeupdate', () => {
      let idx = -1;
      stages.forEach((s, i) => { if (v.currentTime >= s.t) idx = i; });
      btns.forEach((b, i) => { b.classList.toggle('is-on', i === idx); b.classList.toggle('is-done', i < idx); });
    });
    return h('div', { class: 'stages', 'aria-label': 'Jump to stage' }, btns);
  }

  // One transport bar driving a single clip. Each clip gets its own, so clips
  // of different lengths sit side by side without one looping under the other.
  function createTransport(v, slot, label, speeds) {
    const t = { v, userPaused: false };
    const isReady = () => !slot.classList.contains('is-missing');
    t.play = () => { if (isReady()) safePlay(v); };
    t.pause = () => v.pause();
    const toggle = () => {
      if (!v.paused) { t.userPaused = true; t.pause(); }
      else { t.userPaused = false; t.play(); }
    };

    const playBtn = h('button', { class: 'ctrl ctrl--play', type: 'button', 'aria-label': `Play “${label}”`, html: ICON.play, onclick: toggle });
    const restartBtn = h('button', {
      class: 'ctrl', type: 'button', 'aria-label': `Restart “${label}”`, html: ICON.restart,
      onclick: () => { if (isReady()) v.currentTime = 0; t.userPaused = false; t.play(); },
    });
    const range = h('input', { class: 'scrub', type: 'range', min: '0', max: '1000', step: '1', value: '0', 'aria-label': `Seek “${label}”` });
    const time = h('span', { class: 'ctrl-time' }, '0:00 / 0:00');
    const speedWrap = h('div', { class: 'speed', role: 'group', 'aria-label': 'Playback speed' });
    speeds.forEach((s, i) => {
      const b = h('button', { type: 'button', class: i === 0 ? 'is-on' : null, 'aria-pressed': String(i === 0) }, `${s}×`);
      b.addEventListener('click', () => {
        v.defaultPlaybackRate = s; v.playbackRate = s;
        $$('button', speedWrap).forEach((o) => { o.classList.toggle('is-on', o === b); o.setAttribute('aria-pressed', String(o === b)); });
      });
      speedWrap.append(b);
    });
    t.bar = h('div', { class: 'compare__bar' }, playBtn, restartBtn, h('div', { class: 'scrub-wrap' }, range), time, speeds.length ? speedWrap : null);

    function render() {
      const on = !v.paused;
      playBtn.innerHTML = on ? ICON.pause : ICON.play;
      playBtn.setAttribute('aria-label', `${on ? 'Pause' : 'Play'} “${label}”`);
      t.bar.classList.toggle('is-empty', !isReady());
    }
    let scrubbing = false;
    function tick() {
      if (!isFinite(v.duration) || v.duration <= 0) return;
      if (!scrubbing) range.value = String(Math.round((v.currentTime / v.duration) * 1000));
      range.style.setProperty('--p', `${range.value / 10}%`);
      time.textContent = `${fmtTime(v.currentTime)} / ${fmtTime(v.duration)}`;
    }
    ['play', 'pause', 'error', 'loadedmetadata'].forEach((ev) => v.addEventListener(ev, render));
    v.addEventListener('timeupdate', tick);
    v.addEventListener('loadedmetadata', tick);
    v.addEventListener('click', toggle);
    range.addEventListener('input', () => {
      scrubbing = true;
      const f = range.value / 1000;
      if (isReady() && isFinite(v.duration)) v.currentTime = f * v.duration;
      range.style.setProperty('--p', `${f * 100}%`);
    });
    range.addEventListener('change', () => { scrubbing = false; });

    render();
    return t;
  }

  function createCompare(sc) {
    const clips = sc.clips || [];
    const root = h('div', { class: `compare${clips.length === 1 ? ' compare--single' : ''}` });
    const grid = h('div', { class: `compare__grid cols-${Math.min(Math.max(clips.length, 1), 3)}` });
    const transports = [];
    const speeds = sc.speeds || [];   // no speed buttons unless a scenario lists them
    let visible = false;
    let active = false;

    clips.forEach((clip) => {
      const ours = clip.role === 'ours';
      const slot = h('div', { class: 'media-slot clip__media', style: sc.aspect ? `aspect-ratio:${sc.aspect}` : null });
      const tagType = clip.outcomeType || (/fail|✗|miss/i.test(clip.outcome || '') ? 'fail' : 'ok');
      const fig = h('figure', { class: `clip${ours ? ' clip--ours' : ''}` },
        h('figcaption', { class: 'clip__head' },
          h('span', { class: 'clip__dot', 'aria-hidden': 'true' }),
          h('span', { class: 'clip__label' }, clip.label),
          clip.outcome ? h('span', { class: `clip__tag clip__tag--${tagType}` }, clip.outcome) : null),
        slot);

      if (isEmbed(clip.src)) {
        slot.append(h('iframe', { src: embedUrl(clip.src, { autoplay: false }), title: clip.label, loading: 'lazy', allow: 'autoplay; fullscreen; picture-in-picture', allowfullscreen: true }));
      } else {
        const poster = clip.poster ?? autoPoster(clip.src);
        const v = makeVideo({ poster });
        if (sc.fit) v.style.objectFit = sc.fit;
        mountVideo(slot, v, clip.src);
        slot.append(h('button', {
          class: 'clip__expand', type: 'button', 'aria-label': `Open “${clip.label}” full screen`, html: ICON.expand,
          onclick: () => openLightbox({ src: clip.src, title: `${sc.label} — ${clip.label}`, poster }),
        }));
        const t = createTransport(v, slot, clip.label, speeds);
        transports.push(t);
        fig.append(t.bar);
        if (clip.stages && clip.stages.length) fig.append(stageChips(v, clip.stages));
      }
      if (clip.note) fig.append(h('p', { class: 'clip__note' }, clip.note));
      grid.append(fig);
    });

    root.append(grid);
    if (sc.caption) root.append(h('p', { class: 'compare__caption' }, sc.caption));

    function pause() { transports.forEach((t) => t.pause()); }

    // Autoplay while the active panel is on screen, leaving alone any clip the
    // viewer paused themselves
    function sync() {
      const shouldRun = active && visible && !(lb && lb.open);
      if (!shouldRun) pause();
      else if (!REDUCED) transports.forEach((t) => { if (!t.userPaused) t.play(); });
    }
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }, { threshold: 0.3 }).observe(grid);

    const api = { root, pause, sync, setActive(a) { active = a; sync(); } };
    Groups.list.push(api);
    return api;
  }

  /* ---------- experiments tabs ---------- */
  function initExperiments() {
    const tabs = $('#exp-tabs');
    const panels = $('#exp-panels');
    const exps = CFG.experiments || [];
    if (!tabs || !panels || !exps.length) return;

    const entries = exps.map((exp, i) => {
      const tab = h('button', {
        class: 'tab', type: 'button', role: 'tab', id: `tab-${exp.id}`,
        'aria-controls': `panel-${exp.id}`, 'aria-selected': 'false', tabindex: '-1',
      }, h('span', { class: 'tab__num' }, String(i + 1).padStart(2, '0')), h('span', {}, exp.tab || exp.title));

      const panel = h('div', { class: 'panel', role: 'tabpanel', id: `panel-${exp.id}`, 'aria-labelledby': `tab-${exp.id}`, tabindex: '0' });
      panel.hidden = true;

      const scenarios = exp.scenarios || [];
      const chipRow = h('div', { class: 'scenarios', role: 'group', 'aria-label': 'Scenario' });
      const stage = h('div', { class: 'panel__stage' });
      panel.append(
        h('div', { class: 'panel__head' },
          h('div', {}, h('h3', { class: 'panel__title' }, exp.title), exp.summary ? h('p', { class: 'panel__summary' }, exp.summary) : null),
          chipRow),
        stage,
      );

      const cache = new Map();
      let current = null;
      const entry = { tab, panel, active: false };

      function showScenario(j) {
        const sc = scenarios[j];
        if (!sc) return;
        if (current) { current.setActive(false); current.root.hidden = true; }
        let g = cache.get(j);
        if (!g) { g = createCompare(sc); cache.set(j, g); stage.append(g.root); }
        g.root.hidden = false;
        current = g;
        g.setActive(entry.active);
        $$('.chip', chipRow).forEach((c, k) => { c.classList.toggle('is-on', k === j); c.setAttribute('aria-pressed', String(k === j)); });
      }
      // a single scenario has nothing to switch between, so no chip row
      if (scenarios.length > 1) {
        scenarios.forEach((sc, j) => chipRow.append(h('button', { class: 'chip', type: 'button', 'aria-pressed': 'false', onclick: () => showScenario(j) }, sc.label)));
      }

      entry.setActive = (a) => {
        entry.active = a;
        panel.hidden = !a;
        tab.classList.toggle('is-on', a);
        tab.setAttribute('aria-selected', String(a));
        tab.tabIndex = a ? 0 : -1;
        if (a && !current) showScenario(0);
        else if (current) current.setActive(a);
      };

      tab.addEventListener('click', () => select(i));
      tabs.append(tab);
      panels.append(panel);
      return entry;
    });

    function select(i, focus) {
      entries.forEach((e, k) => { if (k !== i) e.setActive(false); });
      entries[i].setActive(true);
      const t = entries[i].tab;
      if (focus) t.focus();
      if (tabs.scrollWidth > tabs.clientWidth) tabs.scrollTo({ left: t.offsetLeft - 16, behavior: REDUCED ? 'auto' : 'smooth' });
    }

    tabs.addEventListener('keydown', (e) => {
      const i = entries.findIndex((en) => en.active);
      const n = { ArrowRight: (i + 1) % entries.length, ArrowLeft: (i - 1 + entries.length) % entries.length, Home: 0, End: entries.length - 1 }[e.key];
      if (n !== undefined) { e.preventDefault(); select(n, true); }
    });

    const fromHash = exps.findIndex((x) => location.hash === `#exp-${x.id}`);
    select(fromHash >= 0 ? fromHash : 0);
    if (fromHash >= 0) $('#experiments').scrollIntoView();
  }

  /* ---------- stage clips ---------- */
  // Five looping clips decoding at once is wasteful, so each only plays while it
  // is on screen. preload="none" in the markup keeps them off the initial load.
  function initTrackClips() {
    const clips = $$('.track__clip, .slot__video, .io__view');
    if (!clips.length) return;
    if (REDUCED) { clips.forEach((v) => { v.removeAttribute('autoplay'); v.pause(); }); return; }
    if (!('IntersectionObserver' in window)) { clips.forEach(safePlay); return; }
    const io = new IntersectionObserver((list) => list.forEach((e) => {
      const v = e.target;
      if (e.isIntersecting) { v.preload = 'auto'; safePlay(v); } else { v.pause(); }
    }), { threshold: 0.2 });
    clips.forEach((v) => io.observe(v));
  }

  /* ---------- generated world model samples ---------- */
  function initWorldModelClips() {
    const videos = $$('.wm-case__video');
    const visible = new Set();
    const resume = new Set();
    const blocked = () => document.hidden || (lb && lb.open);
    const sync = () => {
      videos.forEach((v) => {
        if (blocked()) {
          if (!v.paused) resume.add(v);
          v.pause();
        } else if (resume.has(v)) {
          if (visible.has(v)) safePlay(v);
          resume.delete(v);
        }
      });
    };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => entries.forEach(({ target: v, isIntersecting }) => {
        if (isIntersecting) {
          visible.add(v);
          if (!REDUCED && !blocked()) safePlay(v);
        } else {
          visible.delete(v);
          resume.delete(v);
          v.pause();
        }
      }), { threshold: 0.25 });
      videos.forEach((v) => io.observe(v));
    } else videos.forEach((v) => visible.add(v));
    document.addEventListener('visibilitychange', sync);
    if (lb) new MutationObserver(sync).observe(lb, { attributes: true, attributeFilter: ['open'] });
    $$('[data-wm-expand]').forEach((button) => button.addEventListener('click', () => {
      const card = button.closest('.wm-case');
      const video = $('video', card);
      openLightbox({ src: video.getAttribute('src'), poster: video.getAttribute('poster'), title: `Generated future · ${$('h5', card).textContent}` });
    }));
  }

  /* ---------- page chrome ---------- */
  function initReveal() {
    const els = $$('.reveal');
    if (REDUCED || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('is-in')); return; }
    const io = new IntersectionObserver((list) => list.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach((e) => io.observe(e));
  }

  function initNav() {
    const nav = $('#nav');
    if (!nav) return;
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 24);
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Nav "Watch demo" appears once the cover's own play button has scrolled out of view
    const heroCta = $('.play-pill');
    if (heroCta) {
      new IntersectionObserver(([e]) => nav.classList.toggle('show-cta', !e.isIntersecting), { rootMargin: '-64px 0px 0px 0px' }).observe(heroCta);
    } else {
      nav.classList.add('show-cta');
    }

    const links = $$('.nav__links a[href^="#"]');
    const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver((list) => list.forEach((e) => {
      if (e.isIntersecting) links.forEach((a) => a.classList.toggle('is-active', a === byId.get(e.target.id)));
    }), { rootMargin: '-45% 0px -50% 0px' });
    byId.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------- author list ---------- */
  function initAuthors() {
    const btn = $('[data-authors-toggle]');
    const rest = $('#authors-rest');
    if (!btn || !rest) return;
    const set = (open) => {
      rest.classList.toggle('is-folded', !open);
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Show fewer' : 'Show all 21 authors';
    };
    btn.hidden = false;
    btn.addEventListener('click', () => set(rest.classList.contains('is-folded')));
    set(false);
  }

  /* ---------- architecture figure on small screens ---------- */
  // Below the desktop breakpoint the figure keeps its desktop layout at a fixed
  // width (see style.css, "small screens") and is scaled to the column here.
  function fitArch() {
    const arch = $('.figure .arch');
    if (!arch) return;
    const DESIGN_W = 1120;
    const small = window.matchMedia('(max-width: 1080px)');
    const fit = () => {
      const w = arch.parentElement.clientWidth;
      if (small.matches && w) arch.style.setProperty('--arch-zoom', Math.min(1, w / DESIGN_W).toFixed(4));
      else arch.style.removeProperty('--arch-zoom');
    };
    fit();
    window.addEventListener('resize', fit);
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(arch.parentElement);
  }

  fitArch();
  initNav();
  initAuthors();
  initWorldModelClips();
  initHero();
  initExperiments();
  initTrackClips();
  initReveal();
})();
