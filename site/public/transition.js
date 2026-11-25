/*
 * Adamson page transition — one continuous "volume up" sweep, top-left → bottom-right.
 *
 * The screen is cut into narrow strips at the mark's own 60° angle. Strips start one after
 * another from the top-left corner.
 *   Out (on link click): in each strip a bar grows toward the bottom-right until the page is
 *   covered, while the logo plays its intro drawn in reverse (dark on the bars, gold between).
 *   In (on the next page): each bar collapses the SAME way — its trailing edge chases the
 *   leading edge toward the bottom-right — so the wipe never goes back and forth.
 * Easing: cubic-bezier(0.64, 0.05, 0, 1), as the logo intro.
 *
 * Opt-in: only links with a data-transition attribute play it, and only a page reached through
 * one of them plays the arrival. Load it in <head> (not deferred) on each page that has such
 * links, so an arriving page is covered from first paint:
 *   <script src="transition.js"></script>          (path relative to the page)
 * Call adamsonTransition.demo() to play out + in on the spot without navigating.
 */
(() => {
  const KEY = 'adamson-transition';
  const CFG = {
    gold: '#816D4D',       // bar colour (logo gold)
    ink: '#000',           // logo colour on the bars
    period: 34,            // strip spacing in CSS px, measured across the stripes
    angle: 30,             // strips are vertical rotated 30° clockwise → the mark's 60° stripes
    outMs: 1200,
    inMs: 1000,
    sweep: 0.45,           // share of the time the sweep takes to cross the screen
    logoW: 240,            // logo width in CSS px (max 46vw)
  };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MARK = "M218.35 262.58L351.95 31.18L333.95 0L68.7695 459.3H83.8695L207.9 244.48L218.35 262.58ZM240.85 301.55L374.45 70.15L356.45 38.97L113.77 459.3H128.87L230.4 283.45L240.85 301.55ZM263.35 340.52L396.95 109.12L378.95 77.94L158.77 459.3H173.87L252.9 322.42L263.35 340.52ZM285.85 379.49L419.45 148.09L401.45 116.91L203.77 459.3H218.87L275.4 361.39L285.85 379.49ZM308.35 418.46L441.95 187.06L423.95 155.88L248.77 459.3H263.87L297.9 400.36L308.35 418.46ZM330.85 457.44L464.45 226.03L446.45 194.86L293.77 459.3H308.87L320.4 439.34L330.85 457.44ZM338.77 459.3H374.77L486.95 265L468.95 233.83L338.77 459.3ZM383.77 459.3H419.77L509.45 303.98L491.45 272.8L383.77 459.3ZM428.77 459.3H464.77L531.95 342.95L513.95 311.77L428.77 459.3ZM473.77 459.3H509.77L554.45 381.92L536.45 350.74L473.77 459.3ZM518.77 459.3H554.77L576.95 420.89L558.95 389.71L518.77 459.3ZM581.45 428.68L563.77 459.3H599.13L581.45 428.68Z";
  const LETTERS = [{"d": "M57.3898 480.1H76.4498V577.6H67.0498V545H34.4998L15.3098 577.6H0.00976562L57.3898 480.1ZM39.9698 535.7H67.0498V489.68L39.9698 535.7Z", "x": 0.0, "w": 76.45}, {"d": "M84.8498 480.1H113.8C126.729 480.1 139.129 485.236 148.271 494.379C157.414 503.521 162.55 515.921 162.55 528.85C162.55 541.779 157.414 554.179 148.271 563.321C139.129 572.464 126.729 577.6 113.8 577.6H84.8498V480.1ZM94.5498 489.75V567.95H113.8C124.17 567.95 134.115 563.831 141.448 556.498C148.78 549.165 152.9 539.22 152.9 528.85C152.9 518.48 148.78 508.535 141.448 501.202C134.115 493.869 124.17 489.75 113.8 489.75H94.5498Z", "x": 84.85, "w": 77.7}, {"d": "M193.1 480.1H202.7L241.9 577.6H231.8L218.69 545H177.11L164.01 577.6H153.91L193.1 480.1ZM197.9 493.28L214.95 535.7H180.85L197.9 493.28Z", "x": 153.91, "w": 87.99}, {"d": "M248.55 480.1H262.46L298.15 561.26L333.84 480.1H347.75V577.6H338.15V493.72L301.27 577.6H295.03L258.15 493.72V577.6H248.55V480.1Z", "x": 248.55, "w": 99.2}, {"d": "M405.24 504.55C405.352 499.804 404.134 495.122 401.724 491.032C399.315 486.942 395.809 483.608 391.604 481.405C387.399 479.203 382.662 478.221 377.928 478.569C373.194 478.918 368.652 480.584 364.814 483.378C360.977 486.173 357.998 489.985 356.214 494.383C354.429 498.782 353.91 503.592 354.716 508.27C355.522 512.948 357.62 517.308 360.773 520.856C363.926 524.404 368.009 527 372.56 528.35L384.77 531.97C388.101 532.959 391.092 534.856 393.405 537.45C395.718 540.044 397.263 543.231 397.866 546.653C398.469 550.076 398.106 553.599 396.818 556.827C395.53 560.055 393.368 562.86 390.575 564.927C387.782 566.995 384.467 568.243 381.004 568.532C377.541 568.821 374.065 568.139 370.968 566.563C367.871 564.987 365.274 562.579 363.469 559.609C361.664 556.639 360.722 553.225 360.75 549.75H351.35C351.322 554.969 352.749 560.092 355.47 564.546C358.19 568.999 362.098 572.607 366.753 574.965C371.409 577.323 376.63 578.338 381.83 577.896C387.03 577.454 392.004 575.572 396.195 572.462C400.386 569.352 403.628 565.136 405.558 560.287C407.488 555.438 408.029 550.148 407.121 545.008C406.213 539.869 403.892 535.084 400.417 531.19C396.943 527.296 392.453 524.446 387.45 522.96L375.23 519.34C372.352 518.485 369.771 516.84 367.781 514.591C365.791 512.342 364.472 509.581 363.974 506.62C363.475 503.659 363.817 500.618 364.961 497.841C366.104 495.065 368.004 492.665 370.443 490.915C372.883 489.164 375.764 488.133 378.76 487.938C381.757 487.744 384.747 488.394 387.393 489.814C390.038 491.234 392.232 493.368 393.725 495.973C395.219 498.578 395.951 501.549 395.84 504.55H405.24Z", "x": 351.3, "w": 56.8}, {"d": "M411.4 528.85C411.4 515.364 416.757 502.43 426.293 492.894C435.83 483.357 448.763 478 462.25 478C475.736 478 488.67 483.357 498.206 492.894C507.742 502.43 513.1 515.364 513.1 528.85C513.1 542.336 507.742 555.27 498.206 564.806C488.67 574.343 475.736 579.7 462.25 579.7C448.763 579.7 435.83 574.343 426.293 564.806C416.757 555.27 411.4 542.336 411.4 528.85ZM420.9 528.85C420.9 517.883 425.256 507.366 433.011 499.611C440.766 491.857 451.283 487.5 462.25 487.5C473.216 487.5 483.734 491.857 491.489 499.611C499.243 507.366 503.6 517.883 503.6 528.85C503.6 539.817 499.243 550.334 491.489 558.089C483.734 565.843 473.216 570.2 462.25 570.2C451.283 570.2 440.766 565.843 433.011 558.089C425.256 550.334 420.9 539.817 420.9 528.85Z", "x": 411.4, "w": 101.7}, {"d": "M522.35 480.1H534.91L590.35 563.46V480.1H599.75V577.6H588.2L531.75 492.71V577.6H522.35V480.1Z", "x": 522.35, "w": 77.4}];

  // ---- cubic-bezier(0.64, 0.05, 0, 1) ----
  const ease = (() => {
    const x1 = 0.64, y1 = 0.05, x2 = 0, y2 = 1;
    const bx = (t) => 3*x1*(1-t)*(1-t)*t + 3*x2*(1-t)*t*t + t*t*t;
    const by = (t) => 3*y1*(1-t)*(1-t)*t + 3*y2*(1-t)*t*t + t*t*t;
    return (x) => {
      if (x <= 0) return 0; if (x >= 1) return 1;
      let lo = 0, hi = 1, t = x;
      for (let i = 0; i < 28; i++) { t = (lo + hi) / 2; if (bx(t) < x) lo = t; else hi = t; }
      return by(t);
    };
  })();
  const clamp01 = (v) => v < 0 ? 0 : v > 1 ? 1 : v;

  // ---- arriving page: stay covered until the canvas exists, so the new page never flashes ----
  const style = document.createElement('style');
  style.textContent = `
    html.atx-arriving body { visibility: hidden; }
    html.atx-arriving { background: ${CFG.gold}; }
    .atx { position: fixed; inset: 0; width: 100vw; height: 100vh; z-index: 2147483000;
           pointer-events: none; display: none; }
    .atx.is-on { display: block; pointer-events: auto; }`;
  document.head.appendChild(style);

  let incoming = false;
  try { incoming = sessionStorage.getItem(KEY) === '1'; sessionStorage.removeItem(KEY); } catch (e) {}
  if (incoming && !reduce) document.documentElement.classList.add('atx-arriving');

  const markPath = new Path2D(MARK);
  const letterPaths = LETTERS.map((l) => new Path2D(l.d));
  const MARK_BOX = { x0: 68.77, x1: 599.13, y0: 0, y1: 459.3 };

  let canvas, ctx, W = 0, H = 0, dpr = 1;
  function size() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
  }

  // strips laid out along n = (cos30°, sin30°) — top-left corner is s = 0
  function strips() {
    const a = CFG.angle * Math.PI / 180, nx = Math.cos(a), ny = Math.sin(a);
    const sMax = W * nx + H * ny;
    const first = -1, last = Math.ceil(sMax / CFG.period) + 1;
    return { a, sMax, first, last };
  }

  // phase: 'out' (bars grow) or 'in' (bars collapse forward); t in ms
  function barsPath(phase, t, dur) {
    const { a, sMax, first, last } = strips();
    const P = CFG.period, L = W + H, span = Math.max(sMax, 1);
    const p = new Path2D();
    const rot = new DOMMatrix().rotate(CFG.angle);
    const local = new Path2D();
    for (let k = first; k <= last; k++) {
      const s0 = k * P;
      const q = clamp01(s0 / span);                                  // 0 top-left … 1 bottom-right
      const g = ease(clamp01((t / dur - q * CFG.sweep) / (1 - CFG.sweep)));
      let from, to;
      if (phase === 'out') { from = s0; to = s0 + g * (P + 0.75); }      // leading edge sweeps forward
      else { from = s0 + g * (P + 0.75); to = s0 + P + 0.75; }        // trailing edge follows it
      if (to - from > 0.01) local.rect(from, -L, to - from, 2 * L);
    }
    p.addPath(local, rot);
    return p;
  }

  // logo intro progress at time t of the out phase (mark volume-up + masked letter slides)
  function drawLogo(color, t, alpha) {
    if (alpha <= 0) return;
    const w = Math.min(CFG.logoW, W * 0.46), sc = w / 600, h = 580 * sc;
    const ox = (W - w) / 2, oy = (H - h) / 2;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.setTransform(dpr * sc, 0, 0, dpr * sc, dpr * ox, dpr * oy);
    // mark: triangular window anchored at the bottom-right corner, growing to full size
    const m = ease(clamp01(t / CFG.outMs));
    if (m > 0) {
      const { x0, x1, y0, y1 } = MARK_BOX, bw = x1 - x0, bh = y1 - y0;
      const ax = x1 + 4, ay = y1 + 4;                                 // anchor (slightly outside)
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax + (x0 + bw / 2 - ax) * m, ay + (y0 - 8 - ay) * m);
      ctx.lineTo(ax + (x0 - 8 - ax) * m, ay);
      ctx.closePath();
      ctx.clip();
      ctx.fill(markPath, 'evenodd');
      ctx.restore();
    }
    // name: each letter slides 35% of its width and wipes in from its left; N lands with the mark
    const dur = CFG.outMs * 0.56;
    LETTERS.forEach((l, i) => {
      const start = CFG.outMs * 0.44 - (6 - i) * 30;
      const v = ease(clamp01((t - start) / dur));
      if (v <= 0) return;
      const shift = (1 - v) * 0.35 * (l.w + 2);
      ctx.save();
      ctx.beginPath();
      const left = l.x - 1, right = Math.min(l.x - 1 - shift + v * (l.w + 4), l.x + l.w + 1);
      ctx.rect(left, 474, Math.max(right - left, 0), 108);
      ctx.clip();
      ctx.translate(-shift, 0);
      ctx.fill(letterPaths[i], 'evenodd');
      ctx.restore();
    });
    ctx.restore();
  }

  // one frame: phase 'out' | 'in' | 'cover'
  function frame(phase, t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const bars = phase === 'cover' ? null : barsPath(phase, t, phase === 'out' ? CFG.outMs : CFG.inMs);
    const logoT = phase === 'out' ? t : CFG.outMs;
    const logoA = phase === 'in' ? 1 - clamp01(t / 260) : 1;

    // gold bars
    ctx.fillStyle = CFG.gold;
    if (bars) ctx.fill(bars); else ctx.fillRect(0, 0, W, H);

    // logo, dark where it sits on the bars …
    ctx.save();
    if (bars) ctx.clip(bars);
    drawLogo(CFG.ink, logoT, logoA);
    ctx.restore();

    // … and gold where the page shows between them
    if (bars) {
      ctx.save();
      const gaps = new Path2D();
      gaps.rect(0, 0, W, H);
      gaps.addPath(bars);
      ctx.clip(gaps, 'evenodd');
      drawLogo(CFG.gold, logoT, logoA);
      ctx.restore();
    }
  }

  function run(phase, dur) {
    return new Promise((done) => {
      const t0 = performance.now();
      const step = (now) => {
        const t = Math.min(now - t0, dur);
        frame(phase, t);
        if (t < dur) requestAnimationFrame(step); else done();
      };
      requestAnimationFrame(step);
    });
  }

  function isTransitionLink(a, e) {
    if (!a || !a.hasAttribute('data-transition') || a.hasAttribute('download')) return false;
    if (a.target && a.target !== '_self') return false;
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return false;
    if (url.pathname === location.pathname && url.search === location.search) return false;
    return true;
  }

  function init() {
    canvas = document.createElement('canvas');
    canvas.className = 'atx';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    size();
    addEventListener('resize', size);
    // QA hook: adamsonTransition.frame('out' | 'in' | 'cover', ms)
    let busy = false;
    window.adamsonTransition = {
      cfg: CFG,
      frame: (ph, t) => { canvas.classList.add('is-on'); frame(ph, t); },
      // play the whole thing in place: sweep over, hold a beat, sweep off
      demo: async () => {
        if (busy) return; busy = true;
        canvas.classList.add('is-on');
        if (reduce) { frame('cover', 0); await new Promise(r => setTimeout(r, 600)); }
        else { await run('out', CFG.outMs); await new Promise(r => setTimeout(r, 250)); await run('in', CFG.inMs); }
        canvas.classList.remove('is-on'); busy = false;
      },
    };

    if (incoming && !reduce) {
      canvas.classList.add('is-on');
      frame('cover', 0);
      document.documentElement.classList.remove('atx-arriving');
      setTimeout(() => run('in', CFG.inMs).then(() => canvas.classList.remove('is-on')), 80);
    }

    document.addEventListener('click', (e) => {
      const a = e.target.closest && e.target.closest('a[href]');
      if (busy || !isTransitionLink(a, e)) return;
      e.preventDefault();
      if (reduce) { location.href = a.href; return; }
      busy = true;
      canvas.classList.add('is-on');
      run('out', CFG.outMs).then(() => {
        try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
        location.href = a.href;
      });
    });

    // back/forward cache: never leave a restored page covered
    addEventListener('pageshow', (e) => {
      if (e.persisted) { busy = false; canvas.classList.remove('is-on'); document.documentElement.classList.remove('atx-arriving'); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
