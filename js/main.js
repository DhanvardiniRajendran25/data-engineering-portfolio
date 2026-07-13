/* =========================================================
   Dhanvardini Rajendran - DE Portfolio
   Theme toggle, Lenis smooth scroll, GSAP entrance + timeline
   ========================================================= */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Theme toggle ---------- */
  var toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme');
      var next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }

  /* ---------- Mobile nav toggle (hamburger) ---------- */
  (function mobileNav() {
    var header = document.querySelector('.site-header');
    var nav = header && header.querySelector('.site-nav');
    if (!header || !nav) return;
    var btn = document.createElement('button');
    btn.className = 'nav-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Toggle navigation menu');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML =
      '<svg class="icon-menu" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>' +
      '<svg class="icon-close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    var themeBtn = document.getElementById('themeToggle');
    if (themeBtn && themeBtn.parentNode === header) header.insertBefore(btn, themeBtn);
    else header.appendChild(btn);

    function setOpen(open) {
      header.classList.toggle('nav-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    btn.addEventListener('click', function () { setOpen(!header.classList.contains('nav-open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 860) setOpen(false); });
  })();

  /* ---------- Role title rotator (below CTAs) ---------- */
  (function roleRotator() {
    var el = document.getElementById('roleCycle');
    if (!el) return;
    var roles = [
      'Data Engineer',
      'Data Pipeline Engineer',
      'Cloud Data Engineer',
      'Analytics Engineer',
      'ETL / ELT Engineer',
      'Data Platform Engineer',
      'ML Data Engineer',
      'DataOps Engineer',
      'Azure Data Engineer',
      'Snowflake Data Engineer',
      'Databricks Engineer'
    ];
    var i = 0;
    el.textContent = roles[0];
    if (prefersReduced) return; // static for reduced-motion users
    setInterval(function () {
      el.classList.add('is-out');
      setTimeout(function () {
        i = (i + 1) % roles.length;
        el.textContent = roles[i];
        el.classList.remove('is-out');
      }, 300);
    }, 2200);
  })();

  /* ---------- Projects: filter + show more ---------- */
  (function projects() {
    var grid = document.getElementById('projGrid');
    if (!grid) return;
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.proj-card'));
    var filters = Array.prototype.slice.call(document.querySelectorAll('.pfilter'));
    var moreBtn = document.getElementById('projMore');
    var LIMIT = 8;
    var current = 'all';
    var expanded = false;

    function render() {
      var shown = 0;
      cards.forEach(function (card) {
        var match = (current === 'all') || (card.getAttribute('data-cat') === current);
        var withinLimit = expanded || current !== 'all' || shown < LIMIT;
        if (match && withinLimit) { card.classList.remove('hidden'); shown++; }
        else { card.classList.add('hidden'); }
      });
      if (moreBtn) {
        moreBtn.style.display = (current === 'all' && !expanded && cards.length > LIMIT) ? '' : 'none';
      }
    }

    filters.forEach(function (f) {
      f.addEventListener('click', function () {
        filters.forEach(function (x) { x.classList.remove('is-active'); });
        f.classList.add('is-active');
        current = f.getAttribute('data-filter');
        expanded = false;
        render();
      });
    });
    if (moreBtn) moreBtn.addEventListener('click', function () { expanded = true; render(); });
    render();
  })();

  /* ---------- Gallery: chapter filter + lightbox ---------- */
  (function gallery() {
    var grid = document.getElementById('galleryGrid');
    if (!grid) return;
    var items = Array.prototype.slice.call(grid.querySelectorAll('.gallery-item'));
    var filters = Array.prototype.slice.call(document.querySelectorAll('#galleryFilters .pfilter'));

    filters.forEach(function (f) {
      f.addEventListener('click', function () {
        filters.forEach(function (x) { x.classList.remove('is-active'); });
        f.classList.add('is-active');
        var c = f.getAttribute('data-filter');
        items.forEach(function (it) {
          var match = (c === 'all') || (it.getAttribute('data-chapter') === c);
          it.classList.toggle('hidden', !match);
        });
      });
    });

    var lb = document.getElementById('lightbox');
    if (!lb) return;
    var lbImg = lb.querySelector('img');
    var lbCap = lb.querySelector('.lightbox-cap');
    function closeLb() { lb.classList.remove('open'); lbImg.src = ''; }
    items.forEach(function (it) {
      it.addEventListener('click', function () {
        var img = it.querySelector('img');
        var cap = it.querySelector('figcaption');
        lbImg.src = img.src; lbImg.alt = img.alt;
        if (lbCap) lbCap.textContent = cap ? cap.textContent : '';
        lb.classList.add('open');
      });
    });
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.classList.contains('lightbox-close')) closeLb();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLb(); });
  })();

  /* ---------- Project detail modal ---------- */
  (function projectModal() {
    var modal = document.getElementById('projModal');
    if (!modal) return;
    var cover = document.getElementById('pmCover');
    var catEl = document.getElementById('pmCat');
    var titleEl = document.getElementById('pmTitle');
    var metaEl = document.getElementById('pmMeta');
    var summaryEl = document.getElementById('pmSummary');
    var metricsEl = document.getElementById('pmMetrics');
    var linksEl = document.getElementById('pmLinks');
    var sectionsEl = document.getElementById('pmSections');

    // Rich per-project detail goes here as content arrives (keyed by data-proj).
    // Until then, the modal is populated from the card itself.
    var DETAILS = (window.PROJECT_DETAILS || {});

    // Projects that have a full dedicated case-study page navigate there
    // instead of opening the modal. Add an entry as each page is built.
    var PAGES = {
      podcastiq: 'projects/podcastiq.html',
      courtvision: 'projects/courtvision.html',
      'apple-heart-id': 'projects/apple-heart-id.html',
      inclusived: 'projects/inclusived.html',
      sage: 'projects/sage.html'
    };

    function openFor(card) {
      var id = card.getAttribute('data-proj');
      var det = DETAILS[id] || {};
      var img = card.querySelector('.proj-thumb img');
      var title = card.querySelector('h3, h4');
      var cat = card.querySelector('.fproject-tag, .proj-cat');
      var desc = card.querySelector('.fproject-desc, .proj-card-body p');
      var metrics = card.querySelectorAll('.fproject-metrics span');
      var links = card.querySelectorAll('.fproject-links a, .proj-card-body a');

      if (img && img.getAttribute('src')) {
        cover.src = img.getAttribute('src');
        cover.alt = title ? title.textContent : '';
        cover.parentElement.style.display = '';
      } else {
        cover.parentElement.style.display = 'none';
      }
      catEl.textContent = det.category || (cat ? cat.textContent : '');
      titleEl.textContent = det.title || (title ? title.textContent : '');
      if (metaEl) {
        metaEl.textContent = det.meta || '';
        metaEl.style.display = det.meta ? '' : 'none';
      }
      summaryEl.textContent = det.summary || (desc ? desc.textContent : '');

      metricsEl.innerHTML = '';
      var ms = det.metrics || Array.prototype.map.call(metrics, function (m) { return m.textContent; });
      ms.forEach(function (m) { var s = document.createElement('span'); s.textContent = m; metricsEl.appendChild(s); });
      metricsEl.style.display = ms.length ? 'flex' : 'none';

      linksEl.innerHTML = '';
      var ls = det.links || Array.prototype.map.call(links, function (a) { return { label: a.textContent, href: a.getAttribute('href') }; });
      ls.forEach(function (l) {
        var a = document.createElement('a'); a.className = 'btn'; a.href = l.href;
        a.target = '_blank'; a.rel = 'noopener'; a.textContent = l.label; linksEl.appendChild(a);
      });
      linksEl.style.display = ls.length ? 'flex' : 'none';

      sectionsEl.innerHTML = '';
      if (det.sections && det.sections.length) {
        det.sections.forEach(function (sec) {
          var h = document.createElement('h3'); h.textContent = sec.title; sectionsEl.appendChild(h);
          var p = document.createElement('p'); p.innerHTML = sec.body; sectionsEl.appendChild(p);
        });
      } else {
        var note = document.createElement('p'); note.className = 'pm-note';
        note.textContent = 'Full case study coming soon.'; sectionsEl.appendChild(note);
      }

      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      if (lenis) lenis.stop();
      modal.querySelector('.proj-modal-panel').scrollTop = 0;
    }

    function close() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      if (lenis) lenis.start();
    }

    // Every project now has its own dedicated page; cards navigate there.
    document.querySelectorAll('.proj-card.clickable, .fproject-card.clickable').forEach(function (card) {
      var id = card.getAttribute('data-proj');
      if (!id) return;
      var href = PAGES[id] || ('projects/' + id + '.html');
      card.setAttribute('role', 'link');
      card.setAttribute('tabindex', '0');
      var go = function () { window.location.href = href; };
      card.addEventListener('click', function (e) {
        if (e.target.closest('a')) return; // let inner links work
        go();
      });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') go();
      });
    });
    modal.querySelectorAll('[data-close]').forEach(function (el) { el.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
    });
  })();

  /* ---------- Lenis smooth scroll ---------- */
  var lenis = null;
  if (typeof Lenis !== 'undefined' && !prefersReduced) {
    lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    // anchor links go through Lenis
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length > 1) {
          var target = document.querySelector(id);
          if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: -64 }); }
        }
      });
    });
  }

  /* ---------- Stat formatting helper ---------- */
  function formatStat(el, value) {
    var decimals = parseInt(el.getAttribute('data-decimals'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var n = value.toFixed(decimals);
    if (el.getAttribute('data-format') === 'comma') {
      n = parseFloat(n).toLocaleString('en-US');
    }
    el.textContent = n + suffix;
  }
  var statNums = Array.prototype.slice.call(document.querySelectorAll('.stat-num'));

  /* ---------- GSAP entrance + scroll ---------- */
  if (typeof gsap !== 'undefined' && !prefersReduced) {
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      // keep ScrollTrigger in sync with Lenis
      if (lenis) lenis.on('scroll', ScrollTrigger.update);
    }

    // Hero entrance
    gsap.to('[data-anim]', {
      opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
      stagger: 0.12, delay: 0.15
    });

    // Timeline: fill the spine + reveal milestones
    if (typeof ScrollTrigger !== 'undefined') {
      var spine = document.getElementById('spineFill');
      var timeline = document.getElementById('timeline');
      if (spine && timeline) {
        gsap.to(spine, {
          height: '100%', ease: 'none',
          scrollTrigger: { trigger: timeline, start: 'top 70%', end: 'bottom 70%', scrub: 0.6 }
        });
      }
      document.querySelectorAll('[data-milestone]').forEach(function (m) {
        ScrollTrigger.create({
          trigger: m, start: 'top 82%',
          onEnter: function () { m.classList.add('in-view'); },
          once: true
        });
      });

      // Scroll-reveal elements (About, etc.)
      document.querySelectorAll('.reveal').forEach(function (el) {
        ScrollTrigger.create({
          trigger: el, start: 'top 88%', once: true,
          onEnter: function () { el.classList.add('is-visible'); }
        });
      });

      // Impact counters: count up when the strip scrolls in
      statNums.forEach(function (el) {
        var target = parseFloat(el.getAttribute('data-target')) || 0;
        ScrollTrigger.create({
          trigger: el, start: 'top 90%', once: true,
          onEnter: function () {
            var obj = { v: 0 };
            gsap.to(obj, {
              v: target, duration: 1.6, ease: 'power2.out',
              onUpdate: function () { formatStat(el, obj.v); }
            });
          }
        });
      });
    }
  } else {
    // No GSAP / reduced motion: reveal everything immediately
    document.querySelectorAll('[data-anim]').forEach(function (el) {
      el.style.opacity = 1; el.style.transform = 'none';
    });
    document.querySelectorAll('[data-milestone]').forEach(function (m) {
      m.classList.add('in-view');
    });
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });
    statNums.forEach(function (el) {
      formatStat(el, parseFloat(el.getAttribute('data-target')) || 0);
    });
  }
})();
