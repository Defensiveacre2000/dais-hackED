/* =========================================================
   Hero canvas — B1.
   Echoes the logo: circuit traces with node dots on the left,
   flickering binary digits on the right, white on the gradient.
   - Traces are drawn ONCE to an offscreen layer; each frame only
     blits that layer (drifting upward) plus pulse dots and digits.
   - Animates for ~15 s of visible time, then settles on a static
     frame and stops for good (one load moment, not a perpetual loop).
   - 30 fps cap, DPR <= 2 (<= 1.5 on narrow screens), pauses when
     the tab is hidden or the hero is off-screen, one static frame
     under prefers-reduced-motion, rebuilds on resize.
   ========================================================= */
(function () {
  "use strict";
  if (window.__dhHero) return;              // artifact hot reload / double inclusion
  var canvas = document.getElementById("hero-canvas");
  if (!canvas || !canvas.getContext) return;
  window.__dhHero = true;
  var hero = canvas.parentElement;
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var MAX_TRACES = 120, MAX_DIGITS = 150, FRAME_MS = 1000 / 30, STEP = 22, SETTLE_MS = 15000;
  var W = 0, H = 0, dpr = 1, split = 0, digitSize = 15;
  var traces = [], digits = [];
  var layer = document.createElement("canvas"), lctx = layer.getContext("2d");
  var running = false, settled = false, visible = true, rafId = 0, last = 0, played = 0, offset = 0;
  var rt = 0, lastW = 0, lastH = 0;          // resize bookkeeping; declared before the first build()
  var mq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  var reduced = !!(mq && mq.matches);
  var DIRS = [[1, 0], [1, -1], [1, 1], [0, -1], [0, 1]]; // right, 45° up/down, vertical
  var TAU = 6.2832;

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }

  function makeTrace(regionW) {
    var x = Math.round(rand(-2, regionW / STEP - 2)) * STEP;
    var y = Math.round(rand(-1, H / STEP + 1)) * STEP;
    var pts = [[x, y]], dir = pick([0, 0, 1, 2]), segs = 2 + ((Math.random() * 4) | 0), len = 0;
    for (var i = 0; i < segs; i++) {
      var d = DIRS[dir], n = 1 + ((Math.random() * 4) | 0);
      var dx = d[0] * n * STEP, dy = d[1] * n * STEP;
      x += dx; y += dy; len += Math.sqrt(dx * dx + dy * dy);
      pts.push([x, y]);
      // turn by 45° or 90° but never reverse, like the branches in the mark
      dir = dir === 0 ? pick([1, 2, 3, 4]) : (dir === 3 || dir === 4 ? pick([0, 1, 2]) : pick([0, 0, dir === 1 ? 3 : 4]));
    }
    return {
      pts: pts, len: len,
      a: rand(0.07, 0.2),
      pulse: Math.random() < 0.35 ? rand(0, 1) : -1,
      speed: rand(0.05, 0.14)          // fraction of length per second
    };
  }

  /* ---- geometry ---- */

  function measure() {
    var rect = hero.getBoundingClientRect();
    W = Math.max(1, Math.round(rect.width));
    H = Math.max(1, Math.round(rect.height));
    lastW = W; lastH = H;                   // the resize observer's first callback is then a no-op
    dpr = Math.min(window.devicePixelRatio || 1, W < 700 ? 1.5 : 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    split = W < 700 ? W * 0.5 : W * 0.56;
  }

  function buildTraces() {
    var n = Math.min(MAX_TRACES, Math.round((split * H) / 4200));
    traces = [];
    for (var i = 0; i < n; i++) traces.push(makeTrace(split));
    offset = 0;
  }

  function bakeTraces() {
    layer.width = canvas.width; layer.height = canvas.height;
    if (!lctx) return;
    lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    lctx.clearRect(0, 0, W, H);
    lctx.strokeStyle = "#fff"; lctx.fillStyle = "#fff"; lctx.lineWidth = 1.2;
    lctx.lineJoin = "round"; lctx.lineCap = "round";
    for (var k = 0; k < traces.length; k++) {
      var t = traces[k], p = t.pts, i;
      lctx.globalAlpha = t.a;
      lctx.beginPath(); lctx.moveTo(p[0][0], p[0][1]);
      for (i = 1; i < p.length; i++) lctx.lineTo(p[i][0], p[i][1]);
      lctx.stroke();
      lctx.beginPath();
      for (i = 1; i < p.length - 1; i++) { lctx.moveTo(p[i][0] + 2, p[i][1]); lctx.arc(p[i][0], p[i][1], 2, 0, TAU); }
      lctx.fill();
      var e = p[p.length - 1];
      lctx.beginPath(); lctx.arc(e[0], e[1], 3.2, 0, TAU); lctx.stroke();
      lctx.beginPath(); lctx.arc(p[0][0], p[0][1], 2.2, 0, TAU); lctx.fill();
    }
    lctx.globalAlpha = 1;
  }

  function buildDigits() {
    digitSize = W < 700 ? 13 : 15;
    var gapX = digitSize * 1.9, gapY = digitSize * 2.1;
    var cols = Math.max(1, Math.floor((W - split - 24) / gapX));
    var rows = Math.max(1, Math.floor((H - 24) / gapY));
    while (cols * rows > MAX_DIGITS) {
      gapX *= 1.08; gapY *= 1.08;
      cols = Math.max(1, Math.floor((W - split - 24) / gapX));
      rows = Math.max(1, Math.floor((H - 24) / gapY));
    }
    digits = [];
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        // fade the field in from the split edge so it never forms a hard wall
        var edge = Math.min(1, (c + 1) / 3);
        var a = rand(0.05, 0.22) * edge;
        digits.push({ x: split + 24 + c * gapX, y: 24 + r * gapY + digitSize, ch: Math.random() < 0.5 ? "0" : "1", a: a, t: a, base: a });
      }
    }
  }

  function setFont() {
    // Manrope's narrow 0 reads as a digit (Unbounded's round 0 reads as the letter o)
    ctx.font = "700 " + digitSize + "px Manrope, system-ui, sans-serif";
    ctx.textBaseline = "alphabetic";
  }

  // keepTraces: same width, only the height moved (e.g. web fonts swapping in) — re-bake the
  // existing traces instead of re-randomising them, so the field does not visibly jump.
  function build(keepTraces) {
    measure();
    if (!keepTraces || !traces.length) buildTraces();
    bakeTraces(); buildDigits(); setFont();
  }

  /* ---- drawing ---- */

  function drawPulse(t, offY) {
    var p = t.pts, target = t.pulse * t.len, acc = 0;
    for (var i = 1; i < p.length; i++) {
      var dx = p[i][0] - p[i - 1][0], dy = p[i][1] - p[i - 1][1], sl = Math.sqrt(dx * dx + dy * dy);
      if (acc + sl >= target) {
        var k = (target - acc) / sl;
        ctx.globalAlpha = Math.min(0.7, t.a * 3.2);
        ctx.beginPath(); ctx.arc(p[i - 1][0] + dx * k, p[i - 1][1] + dy * k + offY, 2.4, 0, TAU); ctx.fill();
        return;
      }
      acc += sl;
    }
  }

  function render(dt) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#fff";

    // traces drift upward as one slow field and wrap seamlessly
    offset = (offset - dt * 2.2) % H;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    var oy = Math.round(offset * dpr);
    ctx.drawImage(layer, 0, oy);
    ctx.drawImage(layer, 0, oy + canvas.height);
    ctx.restore();
    for (var i = 0; i < traces.length; i++) {
      var t = traces[i];
      if (t.pulse < 0) continue;
      t.pulse += t.speed * dt; if (t.pulse > 1) t.pulse -= 1;
      drawPulse(t, offset);
      drawPulse(t, offset + H);
    }

    // binary digits: occasional flip, eased alpha
    for (var j = 0; j < digits.length; j++) {
      var d = digits[j];
      if (dt > 0 && Math.random() < 0.012) {
        d.t = Math.random() < 0.3 ? Math.min(0.5, d.base * 2.6) : d.base * rand(0.4, 1.1);
        if (Math.random() < 0.5) d.ch = d.ch === "0" ? "1" : "0";
      }
      d.a += (d.t - d.a) * Math.min(1, dt * 2.5);
      if (d.a < 0.01) continue;
      ctx.globalAlpha = d.a;
      ctx.fillText(d.ch, d.x, d.y);
    }
    ctx.globalAlpha = 1;
  }

  /* ---- loop ---- */

  function frame(now) {
    if (!running) return;
    rafId = requestAnimationFrame(frame);
    var elapsed = now - last;
    if (elapsed < FRAME_MS) return;
    last = now - (elapsed % FRAME_MS);
    var dt = Math.min(elapsed, 100);
    played += dt;
    render(dt / 1000);
    if (played >= SETTLE_MS) { settled = true; stop(); }   // last frame stays on screen
  }

  function start() {
    if (running || settled || reduced || !visible || document.hidden) return;
    running = true; last = performance.now();
    rafId = requestAnimationFrame(frame);
  }
  function stop() { running = false; cancelAnimationFrame(rafId); }
  function staticFrame() { render(0); }

  function rebuild(keepTraces) { build(keepTraces); if (!running) staticFrame(); }

  rebuild();
  start();

  // Fonts arriving late only change the digits' glyphs: re-set the font and repaint, keep the traces.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { setFont(); if (!running) staticFrame(); });
  }

  document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else start(); });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) start(); else stop();
    }).observe(hero);
  }

  function onResize() {
    clearTimeout(rt);
    rt = setTimeout(function () {
      var r = hero.getBoundingClientRect();
      if (Math.round(r.width) === lastW && Math.round(r.height) === lastH) return;
      rebuild(Math.round(r.width) === lastW);  // measure() updates lastW / lastH
    }, 120);
  }
  if ("ResizeObserver" in window) new ResizeObserver(onResize).observe(hero);
  else window.addEventListener("resize", onResize);

  if (mq) {
    var onMq = function (e) { reduced = e.matches; if (reduced) { stop(); staticFrame(); } else start(); };
    if (mq.addEventListener) mq.addEventListener("change", onMq); else if (mq.addListener) mq.addListener(onMq);
  }
})();
