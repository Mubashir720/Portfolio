/* ═══════════════════════════════════════════
   MUBASHIR MEHMOOD — PORTFOLIO
   app.js — Terminal/IDE Theme Interactions
   ═══════════════════════════════════════════ */

'use strict';

/* ── UTILS ── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const raf = requestAnimationFrame.bind(window);
const delay = (ms) => new Promise(res => setTimeout(res, ms));

/* ═══════════════════════════════════
   1. BOOT SEQUENCE
   (No giant "MUBASHIR" — just terminal vibes)
═══════════════════════════════════ */
const BOOT_LINES = [
  { text: '> initializing runtime environment...', cls: 'dim', ms: 0 },
  { text: '> loading kernel modules... OK', cls: 'ok', ms: 320 },
  { text: '> mounting filesystem... OK', cls: 'ok', ms: 560 },
  { text: '> checking dependencies... OK', cls: 'ok', ms: 780 },
  { text: '> node v20.11.0 detected', cls: 'dim', ms: 960 },
  { text: '> connecting to portfolio server...', cls: 'dim', ms: 1140 },
  { text: '> engineer profile loaded ✓', cls: 'hi', ms: 1400 },
  { text: '> stack: React · Node · RN · AI/ML', cls: 'dim', ms: 1580 },
  { text: '> status: available for hire', cls: 'ok', ms: 1780 },
  { text: '> launching portfolio...', cls: 'warn', ms: 2000 },
];

async function runBoot() {
  const bootScreen = $('#bootScreen');
  const terminal   = $('#bootTerminal');
  const bar        = $('#bootBar');
  if (!bootScreen) return;

  let skipped = false;
  const skip = () => { skipped = true; };
  document.addEventListener('keydown', skip, { once: true });
  document.addEventListener('click',   skip, { once: true });
  document.addEventListener('touchstart', skip, { once: true });

  const totalTime = 2300;
  const startTime = performance.now();

  // Progress bar
  function animBar() {
    if (skipped) return;
    const elapsed = performance.now() - startTime;
    const pct = Math.min((elapsed / totalTime) * 100, 98);
    bar.style.width = pct + '%';
    if (elapsed < totalTime) raf(animBar);
  }
  raf(animBar);

  // Print lines
  for (const line of BOOT_LINES) {
    if (skipped) break;
    await delay(line.ms === 0 ? 80 : line.ms - (BOOT_LINES[BOOT_LINES.indexOf(line) - 1]?.ms ?? 0));
    if (skipped) break;
    const el = document.createElement('span');
    el.className = `bt-line ${line.cls}`;
    el.textContent = line.text;
    terminal.appendChild(el);
    void el.offsetWidth; // reflow
  }

  if (!skipped) await delay(400);

  // Complete bar
  bar.style.transition = 'width .3s ease';
  bar.style.width = '100%';
  await delay(350);

  // Exit
  bootScreen.classList.add('exit');
  await delay(700);
  bootScreen.remove();
  document.removeEventListener('keydown', skip);
  document.removeEventListener('click',   skip);
  document.removeEventListener('touchstart', skip);
  onBootComplete();
}

// Handle skip
(function () {
  const bootScreen = $('#bootScreen');
  if (!bootScreen) return;
  function skipNow() {
    const bar = $('#bootBar');
    if (bar) { bar.style.width = '100%'; }
    setTimeout(() => {
      bootScreen.classList.add('exit');
      setTimeout(() => { bootScreen.remove(); onBootComplete(); }, 700);
    }, 200);
  }
  document.addEventListener('keydown', skipNow, { once: true });
  document.addEventListener('click',   skipNow, { once: true });
  document.addEventListener('touchstart', skipNow, { once: true });
})();

function onBootComplete() {
  initAll();
}

/* ═══════════════════════════════════
   2. CURSOR
═══════════════════════════════════ */
function initCursor() {
  const cur   = $('#cur');
  const trail = $('#curTrail');
  if (!cur || !trail || window.matchMedia('(hover: none)').matches) {
    cur?.remove(); trail?.remove(); return;
  }

  let mx = 0, my = 0, tx = 0, ty = 0;
  let rafId;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cur.style.transform = `translate(${mx - 6}px, ${my - 6}px)`;
  });

  function animTrail() {
    tx += (mx - tx) * 0.13;
    ty += (my - ty) * 0.13;
    trail.style.transform = `translate(${tx - 18}px, ${ty - 18}px)`;
    rafId = raf(animTrail);
  }
  animTrail();
}

/* ═══════════════════════════════════
   3. CANVAS — PARTICLE GRID
═══════════════════════════════════ */
function initCanvas() {
  const canvas = $('#heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    buildParticles();
  }

  function buildParticles() {
    particles = [];
    const cols = Math.floor(W / 60);
    const rows = Math.floor(H / 60);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        particles.push({
          x: c * 60 + 30,
          y: r * 60 + 30,
          ox: c * 60 + 30,
          oy: r * 60 + 30,
          size: Math.random() * 1.2 + 0.4,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.5 + 0.3,
        });
      }
    }
  }

  let mouse = { x: -999, y: -999 };
  window.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    t += 0.008;
    particles.forEach(p => {
      // Float
      p.x = p.ox + Math.sin(t * p.speed + p.phase) * 4;
      p.y = p.oy + Math.cos(t * p.speed + p.phase * 1.3) * 4;

      // Mouse repel
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 80) {
        const force = (80 - dist) / 80;
        p.x += (dx / dist) * force * 18;
        p.y += (dy / dist) * force * 18;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,255,136,${0.3 + Math.sin(t * p.speed + p.phase) * 0.2})`;
      ctx.fill();
    });

    // Draw connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 72) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,255,136,${(1 - d / 72) * 0.12})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    raf(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
}

/* ═══════════════════════════════════
   4. TYPEWRITER — hero role
   Uses a single setInterval tick at a
   fixed 80ms base. Speed is controlled
   by a holdCounter — no nested timers,
   no stacking, immune to tab switches.
═══════════════════════════════════ */
function initTypewriter() {
  const el = $('#typeTarget');
  if (!el) return;

  const roles = [
    'Full Stack Engineer',
    'Mobile App Developer',
    'React Native Dev',
    'Node.js Engineer',
    'AI/ML Integrator',
  ];

  const TICK_MS    = 80;   // single fixed interval speed
  const HOLD_TYPE  = 1;    // ticks to wait between each character typed
  const HOLD_DEL   = 0;    // ticks to wait between each character deleted
  const HOLD_PAUSE = 25;   // ticks to hold at end of word (~2 seconds)
  const HOLD_GAP   = 5;    // ticks to pause before typing next word

  let ri = 0, ci = 0;
  let deleting = false;
  let hold = 8; // initial delay before starting (8 × 80ms = 640ms)
  let holdCount = 0;

  setInterval(() => {
    // If we're in a hold period, just count down and return
    if (holdCount < hold) { holdCount++; return; }
    holdCount = 0;
    hold = 0;

    const current = roles[ri];

    if (deleting) {
      ci--;
      el.textContent = current.slice(0, ci);
      hold = HOLD_DEL;
      if (ci <= 0) {
        ci = 0;
        deleting = false;
        ri = (ri + 1) % roles.length;
        hold = HOLD_GAP;
      }
    } else {
      ci++;
      el.textContent = current.slice(0, ci);
      hold = HOLD_TYPE;
      if (ci >= current.length) {
        deleting = true;
        hold = HOLD_PAUSE;
      }
    }
  }, TICK_MS);
}

/* ═══════════════════════════════════
   5. TERMINAL PANEL ANIMATION
═══════════════════════════════════ */
async function initHeroTerminal() {
  const cmd1   = $('#termCmd1');
  const line2  = $('#termLine2');
  const out2   = $('#termOut2');
  const line3  = $('#termLine3');
  if (!cmd1) return;

  await delay(1200);
  await typeInto(cmd1, 'npm run portfolio');
  await delay(400);
  line2.style.opacity = '1';
  await typeInto(out2, 'Portfolio compiled in 312ms ✓');
  await delay(300);
  line3.style.opacity = '1';
}

async function typeInto(el, text) {
  for (const ch of text) {
    el.textContent += ch;
    await delay(40 + Math.random() * 30);
  }
}

/* ═══════════════════════════════════
   6. SCROLL REVEAL
═══════════════════════════════════ */
function initReveal() {
  const els = $$('.reveal');
  if (!els.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const d = parseFloat(e.target.dataset.delay || 0);
        setTimeout(() => e.target.classList.add('visible'), d * 1000);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => obs.observe(el));
}

/* ═══════════════════════════════════
   7. COUNTER ANIMATION
═══════════════════════════════════ */
function initCounters() {
  const nums = $$('.stat-num[data-count]');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.count);
      let start = 0;
      const step = () => {
        start += Math.ceil(target / 30);
        if (start >= target) { el.textContent = target; return; }
        el.textContent = start;
        raf(step);
      };
      setTimeout(step, 600);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  nums.forEach(n => obs.observe(n));
}

/* ═══════════════════════════════════
   8. NAV — scroll + active tabs + mobile
═══════════════════════════════════ */
function initNav() {
  const nav        = $('#nav');
  const hamburger  = $('#hamburger');
  const mobMenu    = $('#mobMenu');
  const tabs       = $$('.nav-tab');
  const sections   = ['hero', 'about', 'projects', 'expertise', 'contact'];

  // Scroll class
  window.addEventListener('scroll', () => {
    nav?.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // Active tab on scroll
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 100) current = id;
    });
    tabs.forEach(tab => {
      const href = tab.getAttribute('href')?.replace('#', '');
      tab.classList.toggle('active', href === current);
    });
  }, { passive: true });

  // Hamburger
  hamburger?.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    mobMenu?.classList.toggle('open', open);
  });

  // Close mobile menu on link click
  $$('.mob-link, .mob-hire').forEach(a => {
    a.addEventListener('click', () => {
      hamburger?.classList.remove('open');
      mobMenu?.classList.remove('open');
    });
  });
}

/* ═══════════════════════════════════
   9. DRAG SCROLL — projects
═══════════════════════════════════ */
function initDragScroll() {
  const wrap  = $('#projWrap');
  const track = $('#projTrack');
  const bar   = $('#projBar');
  if (!wrap) return;

  let isDown = false, startX, scrollLeft;

  const down = e => {
    isDown = true;
    startX = (e.pageX || e.touches?.[0].pageX) - wrap.offsetLeft;
    scrollLeft = wrap.scrollLeft;
    wrap.style.userSelect = 'none';
  };
  const up   = () => { isDown = false; wrap.style.userSelect = ''; };
  const move = e => {
    if (!isDown) return;
    e.preventDefault();
    const x = (e.pageX || e.touches?.[0].pageX) - wrap.offsetLeft;
    wrap.scrollLeft = scrollLeft - (x - startX) * 1.2;
  };

  wrap.addEventListener('mousedown', down);
  wrap.addEventListener('touchstart', down, { passive: true });
  window.addEventListener('mouseup', up);
  window.addEventListener('touchend', up);
  wrap.addEventListener('mousemove', move);
  wrap.addEventListener('touchmove', move, { passive: false });

  // Progress bar
  wrap.addEventListener('scroll', () => {
    if (!bar) return;
    const max = wrap.scrollWidth - wrap.clientWidth;
    bar.style.width = (max > 0 ? (wrap.scrollLeft / max) * 100 : 0) + '%';
  }, { passive: true });

  // Set project card accent via CSS var
  $$('.pcard').forEach(card => {
    const accent = card.dataset.accent;
    if (accent) card.style.setProperty('--accent', accent);
  });
}

/* ═══════════════════════════════════
   10. TILT EFFECT — project cards
═══════════════════════════════════ */
function initTilt() {
  $$('.tilt').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale3d(1.02,1.02,1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateY(0) rotateX(0) scale3d(1,1,1)';
    });
  });
}

/* ═══════════════════════════════════
   11. MAGNETIC BUTTONS
═══════════════════════════════════ */
function initMagnetic() {
  $$('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) * 0.3;
      const dy = (e.clientY - cy) * 0.3;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0,0)';
    });
  });
}

/* ═══════════════════════════════════
   12. CONTACT FORM → WhatsApp
═══════════════════════════════════ */
function initContactForm() {
  const form    = $('#cform');
  const success = $('#cfSuccess');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name  = $('#cfName')?.value.trim()  || '';
    const email = $('#cfEmail')?.value.trim() || '';
    const msg   = $('#cfMsg')?.value.trim()   || '';

    if (!name || !email || !msg) {
      const first = form.querySelector(':invalid');
      first?.focus();
      first?.classList.add('shake');
      setTimeout(() => first?.classList.remove('shake'), 400);
      return;
    }

    const text = encodeURIComponent(
      `Hi Mubashir! I'm ${name} (${email}).\n\n${msg}`
    );
    // ⚠ Replace 923135487030 with your actual WhatsApp number
    window.open(`https://wa.me/923135487030?text=${text}`, '_blank');

    if (success) {
      success.classList.add('show');
      setTimeout(() => success.classList.remove('show'), 4000);
    }
    form.reset();
  });
}

/* ═══════════════════════════════════
   13. GLITCH — section titles on hover
═══════════════════════════════════ */
function initGlitch() {
  $$('.ptitle, .sec-title').forEach(el => {
    el.classList.add('glitch');
    el.dataset.text = el.textContent;
  });
}

/* ═══════════════════════════════════
   14. STATUS BAR (bottom strip)
═══════════════════════════════════ */
function initStatusBar() {
  const bar = document.createElement('div');
  bar.className = 'status-bar';

  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  bar.innerHTML = `
    <span class="sb-item hi">⎇ main</span>
    <span class="sb-item">Ln 1, Col 1</span>
    <span class="sb-item">UTF-8</span>
    <span class="sb-item" style="margin-left:auto;">mubashir.dev</span>
    <span class="sb-item">${time}</span>
    <span class="sb-item">✓ 0 errors</span>
  `;
  document.body.appendChild(bar);

  // Update time every minute
  setInterval(() => {
    const t = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    bar.querySelector('span:nth-child(5)').textContent = t;
  }, 60000);
}

/* ═══════════════════════════════════
   15. SMOOTH ANCHOR SCROLL
═══════════════════════════════════ */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ═══════════════════════════════════
   16. SCANLINE OVERLAY
═══════════════════════════════════ */
function initScanlines() {
  const el = document.createElement('div');
  el.style.cssText = `
    position: fixed; inset: 0; pointer-events: none; z-index: 9990;
    background: repeating-linear-gradient(
      0deg,
      rgba(0,0,0,0) 0px,
      rgba(0,0,0,0) 2px,
      rgba(0,0,0,0.03) 2px,
      rgba(0,0,0,0.03) 4px
    );
    animation: scanMove 8s linear infinite;
  `;
  document.body.appendChild(el);

  const style = document.createElement('style');
  style.textContent = `
    @keyframes scanMove {
      from { background-position: 0 0; }
      to   { background-position: 0 100vh; }
    }
    .shake {
      animation: shakeInput .3s ease;
    }
    @keyframes shakeInput {
      0%,100% { transform: translateX(0); }
      25%      { transform: translateX(-6px); }
      75%      { transform: translateX(6px); }
    }
  `;
  document.head.appendChild(style);
}

/* ═══════════════════════════════════
   MAIN INIT (called after boot)
═══════════════════════════════════ */
function initAll() {
  initCursor();
  initCanvas();
  initTypewriter();
  initHeroTerminal();
  initReveal();
  initCounters();
  initNav();
  initDragScroll();
  initTilt();
  initMagnetic();
  initContactForm();
  initGlitch();
  initStatusBar();
  initSmoothScroll();
  initScanlines();
}

/* ── BOOT ── */
document.addEventListener('DOMContentLoaded', () => {
  runBoot();
});
