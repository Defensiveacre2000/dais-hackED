/* ==========================================================================
   DAIS HackED — interface engine
   boot sequence · particle logo · title decode · scroll reveals · count-ups
   3D tilt + spotlight · magnetic buttons · custom cursor · scroll beam
   Everything degrades: no JS → static page; reduced motion → no animation;
   automated browsers (screenshots) → everything shown at rest.
   ========================================================================== */
(function () {
  "use strict";
  if (window.__dhFx) return;
  window.__dhFx = true;

  var doc = document, root = doc.documentElement;
  var mq = function (q) { return !!(window.matchMedia && window.matchMedia(q).matches); };
  var RM = mq("(prefers-reduced-motion: reduce)");
  var BOT = navigator.webdriver === true;
  var FINE = mq("(hover: hover) and (pointer: fine)");
  var hero = doc.querySelector(".hero");
  var each = function (list, fn) { Array.prototype.forEach.call(list, fn); };

  function ready(fn) {
    // run after main.js has filled facts and rendered lists
    if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", function () { setTimeout(fn, 0); });
    else setTimeout(fn, 0);
  }

  /* ------------------------------------------------------------ boot */
  function boot(done) {
    var el = doc.getElementById("boot");
    var seen = false;
    try { seen = sessionStorage.getItem("dh-boot") === "1"; } catch (e) {}
    if (!el || RM || BOT || seen) { if (el) el.hidden = true; done(); return; }
    try { sessionStorage.setItem("dh-boot", "1"); } catch (e) {}

    var lines = el.querySelectorAll("[data-boot]");
    var bar = el.querySelector(".boot__bar i");
    var timers = [], finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      timers.forEach(clearTimeout);
      doc.removeEventListener("keydown", onKey);
      el.classList.add("is-done");
      setTimeout(function () { el.hidden = true; }, 750);
      done();
    }
    function onKey(e) { if (e.key === "Escape" || e.key === "Enter") finish(); }
    doc.addEventListener("keydown", onKey);
    var skip = el.querySelector(".boot__skip");
    if (skip) skip.addEventListener("click", finish);
    el.addEventListener("click", finish);

    var t = 140;
    each(lines, function (line, i) {
      timers.push(setTimeout(function () {
        line.innerHTML = line.getAttribute("data-boot");
        line.classList.add("on");
        if (bar) bar.style.width = ((i + 1) / lines.length * 100) + "%";
      }, t));
      t += 320;
    });
    timers.push(setTimeout(finish, t + 280));
  }

  /* ------------------------------------------------------------ particle logo */
  function particleLogo() {
    var canvas = doc.getElementById("hero-canvas");
    var img = doc.getElementById("hero-logo");
    var stage = doc.getElementById("hero-stage");
    if (!hero || !canvas || !img || !stage || !canvas.getContext) return { start: function () {} };

    var ctx = canvas.getContext("2d");
    var small = window.innerWidth < 700;
    var MAX = small ? 1800 : 4200;
    var W = 0, H = 0, DPR = 1, scale = 1, cx0 = 0, cy0 = 0;
    var P = [], dust = [], RING = small ? 70 : 150;
    var mouse = { x: -9999, y: -9999, nx: 0, ny: 0, on: false };
    var raf = 0, t0 = 0, live = false, inView = true, started = false;
    var instant = RM || BOT;

    function sample() {
      if (!img.naturalWidth) return null;
      var h = 250, w = Math.round(img.naturalWidth / img.naturalHeight * h);
      var c = doc.createElement("canvas");
      c.width = w; c.height = h;
      var x = c.getContext("2d");
      x.drawImage(img, 0, 0, w, h);
      var d;
      try { d = x.getImageData(0, 0, w, h).data; } catch (e) { return null; }
      var pts = [];
      for (var yy = 0; yy < h; yy += 2) {
        for (var xx = 0; xx < w; xx += 2) {
          if (d[(yy * w + xx) * 4 + 3] > 120) pts.push([(xx - w / 2) / h, (yy - h / 2) / h]);
        }
      }
      for (var i = pts.length - 1; i > 0; i--) { var j = (Math.random() * (i + 1)) | 0, s = pts[i]; pts[i] = pts[j]; pts[j] = s; }
      return pts.slice(0, MAX);
    }

    function layout() {
      var r = hero.getBoundingClientRect(), s = stage.getBoundingClientRect();
      DPR = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      cx0 = s.left - r.left + s.width / 2;
      cy0 = s.top - r.top + s.height / 2;
      scale = s.height * 0.8;
    }

    function build(targets) {
      P = targets.map(function (t) {
        var a = Math.random() * Math.PI * 2, e = (Math.random() - 0.5) * Math.PI, rad = 1.1 + Math.random() * 1.8;
        var p = {
          tx: t[0], ty: t[1], tz: (Math.random() - 0.5) * 0.05,
          x: Math.cos(a) * Math.cos(e) * rad, y: Math.sin(e) * rad * 0.7, z: Math.sin(a) * Math.cos(e) * rad,
          vx: 0, vy: 0, vz: 0, s: 1.1 + Math.random() * 1.1, tw: Math.random() * 6.283, blue: Math.random() < 0.55,
          sx: -9999, sy: -9999
        };
        if (instant) { p.x = p.tx; p.y = p.ty; p.z = p.tz; }
        return p;
      });
      dust = [];
      for (var i = 0; i < (small ? 45 : 120); i++) {
        dust.push({ x: Math.random(), y: Math.random(), v: 0.00004 + Math.random() * 0.00022, s: Math.random() * 1.6 + 0.3, a: Math.random() * 0.45 + 0.08 });
      }
    }

    function burst(px, py) {
      // shockwave from a click: push particles outward, the springs pull them home
      var ux = (px - cx0) / scale, uy = (py - cy0) / scale;
      P.forEach(function (p) {
        var dx = p.x - ux, dy = p.y - uy, d = Math.sqrt(dx * dx + dy * dy) + 0.05;
        var f = (0.09 + Math.random() * 0.12) / Math.max(d, 0.25);
        p.vx += dx / d * f; p.vy += dy / d * f; p.vz += (Math.random() - 0.5) * f;
      });
    }

    function frame(now) {
      raf = 0;
      if (!live) return;
      var t = (now - t0) / 1000;
      draw(t, true);
      if (inView && !doc.hidden) raf = requestAnimationFrame(frame);
    }

    function draw(t, physics) {
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, W, H);

      // drifting dust
      ctx.fillStyle = "#9fc6ff";
      dust.forEach(function (d) {
        if (physics) { d.y -= d.v * 16; if (d.y < -0.02) { d.y = 1.02; d.x = Math.random(); } }
        ctx.globalAlpha = d.a;
        ctx.fillRect(d.x * W, d.y * H, d.s, d.s);
      });

      var asm = instant ? 1 : Math.min(1, t / 2.4);
      var easeA = 1 - Math.pow(1 - asm, 3);
      var k = 0.006 + 0.07 * easeA, damp = 0.86;
      var rotY = Math.sin(t * 0.32) * 0.2 + (mouse.on ? mouse.nx * 0.28 : 0);
      var rotX = Math.sin(t * 0.25) * 0.05 + (mouse.on ? mouse.ny * 0.12 : 0);
      if (instant && !physics) { rotY = -0.18; rotX = 0.02; }
      var cY = Math.cos(rotY), sY = Math.sin(rotY), cX = Math.cos(rotX), sX = Math.sin(rotX);
      var F = 2.4, R = small ? 50 : 70, R2 = R * R;
      var wave = 0.65 - ((t * 0.42) % 1.9);            // light pulse sweeping up the bulb
      var mx = mouse.x, my = mouse.y;

      ctx.globalCompositeOperation = "lighter";
      for (var pass = 0; pass < 2; pass++) {
        ctx.fillStyle = pass ? "#ffffff" : "#3b8cff";
        for (var i = 0; i < P.length; i++) {
          var p = P[i];
          if ((pass === 0) !== p.blue) continue;
          if (physics) {
            var ax = (p.tx - p.x) * k, ay = (p.ty - p.y) * k, az = (p.tz - p.z) * k;
            if (mouse.on) {
              var dx = p.sx - mx, dy = p.sy - my, d2 = dx * dx + dy * dy;
              if (d2 < R2) {
                var d = Math.sqrt(d2) + 0.01, f = (1 - d / R) * 0.02;
                ax += dx / d * f; ay += dy / d * f;
              }
            }
            if (!instant) {
              p.vx = (p.vx + ax) * damp; p.vy = (p.vy + ay) * damp; p.vz = (p.vz + az) * damp;
              p.x += p.vx; p.y += p.vy; p.z += p.vz;
            }
          }
          var X = p.x * cY - p.z * sY, Z = p.x * sY + p.z * cY;
          var Y = p.y * cX - Z * sX; Z = p.y * sX + Z * cX;
          var pr = F / (F + Z);
          var sx = cx0 + X * scale * pr, sy = cy0 + Y * scale * pr;
          p.sx = sx; p.sy = sy;
          var band = Math.exp(-Math.pow((p.ty - wave) / 0.07, 2));
          var a = (0.62 + 0.28 * Math.sin(t * 2.2 + p.tw)) * pr + band * 0.8;
          var size = p.s * pr * (1 + band * 1.3);
          ctx.globalAlpha = a > 1 ? 1 : a;
          ctx.fillRect(sx - size / 2, sy - size / 2, size, size);
        }
      }

      // orbiting ring of data around the bulb
      ctx.fillStyle = "#cfe2ff";
      var tilt = 0.42 + rotX;
      var cT = Math.cos(tilt), sT = Math.sin(tilt);
      for (var j = 0; j < RING; j++) {
        var ang = j / RING * 6.283 + t * 0.55;
        var ox = Math.cos(ang) * 0.62, oz = Math.sin(ang) * 0.62, oy = Math.sin(ang * 5 + t * 2) * 0.012;
        var rx = ox * cY - oz * sY, rz = ox * sY + oz * cY;
        var ry = oy * cT - rz * sT; rz = oy * sT + rz * cT;
        var pr2 = F / (F + rz);
        var alpha = rz < 0 ? 0.9 : 0.25;
        ctx.globalAlpha = alpha * (0.5 + 0.5 * Math.sin(j * 0.7 + t * 3));
        var sz = 1.6 * pr2;
        ctx.fillRect(cx0 + rx * scale * pr2 - sz / 2, cy0 + ry * scale * pr2 - sz / 2, sz, sz);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }

    function kick() { if (live && inView && !doc.hidden && !raf) raf = requestAnimationFrame(frame); }

    function begin() {
      if (started) return;
      var targets = sample();
      if (!targets || !targets.length) return;            // keep the static logo
      started = true;
      layout();
      build(targets);
      hero.classList.add("has-particles");
      t0 = performance.now();
      if (instant) { draw(0, false); return; }
      live = true;
      kick();
    }

    // interaction
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
      mouse.nx = (mouse.x - cx0) / (W || 1); mouse.ny = (mouse.y - cy0) / (H || 1);
      mouse.on = true;
    }, { passive: true });
    hero.addEventListener("pointerleave", function () { mouse.on = false; mouse.x = mouse.y = -9999; });
    hero.addEventListener("click", function (e) {
      if (!live || (e.target.closest && e.target.closest("a,button"))) return;
      var r = hero.getBoundingClientRect();
      burst(e.clientX - r.left, e.clientY - r.top);
    });

    var rt = 0;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () { if (!started) return; layout(); if (!live) draw(0, false); }, 120);
    });
    doc.addEventListener("visibilitychange", kick);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { inView = es[0].isIntersecting; kick(); }).observe(hero);
    }

    return {
      start: function () {
        if (img.complete && img.naturalWidth) begin();
        else img.addEventListener("load", begin, { once: true });
      }
    };
  }

  /* ------------------------------------------------------------ title decode */
  var GLYPHS = "01<>/\\#%&*+=ABCDEFHKMNRSTUVXZ";
  function scramble(el, delay) {
    var final = el.getAttribute("data-text") || el.textContent;
    if (RM || BOT) { el.textContent = final; return; }
    var n = final.length, f = 0, total = 14 + n * 4;
    el.textContent = final.replace(/./g, " ");
    setTimeout(function () {
      var iv = setInterval(function () {
        f++;
        var out = "";
        for (var i = 0; i < n; i++) out += f >= 8 + i * 4 ? final[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
        el.textContent = out;
        if (f >= total) { clearInterval(iv); el.textContent = final; }
      }, 38);
    }, delay);
  }
  function glitchLoop() {
    if (RM || BOT) return;
    var title = doc.querySelector(".hero-title");
    if (!title) return;
    setInterval(function () {
      if (doc.hidden) return;
      title.classList.add("is-glitch");
      setTimeout(function () { title.classList.remove("is-glitch"); }, 380);
    }, 6500);
  }

  /* ------------------------------------------------------------ count-ups */
  function countUp(el) {
    var final = el.textContent;
    var m = final.match(/^(\D*)([\d,]+)(.*)$/);
    if (!m) return;
    var target = parseInt(m[2].replace(/,/g, ""), 10);
    if (!target) return;
    var comma = m[2].indexOf(",") >= 0, dur = 1500, s = performance.now();
    (function f(now) {
      var p = Math.min(1, (now - s) / dur), e = 1 - Math.pow(1 - p, 4), v = Math.round(target * e);
      el.textContent = m[1] + (comma ? v.toLocaleString("en-IN") : v) + m[3];
      if (p < 1) requestAnimationFrame(f); else el.textContent = final;
    })(s);
  }

  /* ------------------------------------------------------------ reveals */
  function reveals() {
    if (RM || BOT || !("IntersectionObserver" in window)) return;
    root.classList.add("reveal-ready");
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        io.unobserve(e.target);
        each(e.target.matches("[data-countup]") ? [e.target] : e.target.querySelectorAll("[data-countup]"), countUp);
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.1 });
    function watch(n) {
      if (n.__dhR) return;
      n.__dhR = 1;
      if (n.classList.contains("pg-topic") && !n.style.getPropertyValue("--d")) {
        var idx = Array.prototype.indexOf.call(n.parentNode.children, n);
        n.style.setProperty("--d", (idx % 3) * 110 + "ms");
      }
      io.observe(n);
    }
    each(doc.querySelectorAll("[data-reveal]"), watch);
    // count-ups that aren't inside a revealed block (e.g. section titles)
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { cio.unobserve(e.target); if (!e.target.closest("[data-reveal]")) countUp(e.target); } });
    }, { threshold: 0.6 });
    each(doc.querySelectorAll("[data-countup]"), function (n) { if (!n.closest("[data-reveal]")) cio.observe(n); });
    // lists rendered later by main.js
    new MutationObserver(function (ms) {
      ms.forEach(function (m) {
        each(m.addedNodes, function (n) {
          if (n.nodeType !== 1) return;
          if (n.matches("[data-reveal]")) watch(n);
          each(n.querySelectorAll("[data-reveal]"), watch);
        });
      });
    }).observe(doc.body, { childList: true, subtree: true });
  }

  /* ------------------------------------------------------------ tilt, spotlight, magnetic */
  function pointerFx() {
    if (!FINE || RM) return;
    var cur = null;
    function reset(el) { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); }
    doc.addEventListener("pointermove", function (e) {
      var el = e.target.closest ? e.target.closest("[data-tilt]") : null;
      if (cur && cur !== el) reset(cur);
      cur = el;
      if (el) {
        var r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        el.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
        el.style.setProperty("--my", (py * 100).toFixed(1) + "%");
        el.style.setProperty("--rx", ((0.5 - py) * 6).toFixed(2) + "deg");
        el.style.setProperty("--ry", ((px - 0.5) * 8).toFixed(2) + "deg");
      }
      var b = e.target.closest ? e.target.closest(".btn") : null;
      if (b) {
        var br = b.getBoundingClientRect();
        b.style.setProperty("--bx", (e.clientX - br.left) + "px");
        b.style.setProperty("--by", (e.clientY - br.top) + "px");
        if (b.hasAttribute("data-magnetic")) {
          var dx = (e.clientX - (br.left + br.width / 2)) * 0.18, dy = (e.clientY - (br.top + br.height / 2)) * 0.28;
          b.style.translate = dx.toFixed(1) + "px " + dy.toFixed(1) + "px";
        }
      }
    }, { passive: true });
    each(doc.querySelectorAll("[data-magnetic]"), function (b) {
      b.addEventListener("pointerleave", function () { b.style.translate = ""; });
    });
  }

  /* ------------------------------------------------------------ cursor */
  function cursor() {
    if (!FINE || RM || BOT) return;
    var dot = doc.createElement("div"), ring = doc.createElement("div");
    dot.className = "cursor-dot"; ring.className = "cursor-ring";
    dot.setAttribute("aria-hidden", "true"); ring.setAttribute("aria-hidden", "true");
    doc.body.appendChild(dot); doc.body.appendChild(ring);
    root.classList.add("has-cursor");
    var x = -100, y = -100, rx = -100, ry = -100, run = false;
    doc.addEventListener("pointermove", function (e) {
      if (e.pointerType && e.pointerType !== "mouse") return;
      x = e.clientX; y = e.clientY;
      dot.style.transform = "translate3d(" + x + "px," + y + "px,0)";
      var hot = e.target.closest && e.target.closest("a,button,[data-tilt],summary,input");
      ring.classList.toggle("is-hover", !!hot);
      if (!run) { run = true; requestAnimationFrame(loop); }
    }, { passive: true });
    doc.addEventListener("pointerleave", function () { x = y = -100; });
    function loop() {
      rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
      ring.style.transform = "translate3d(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px,0)";
      if (Math.abs(x - rx) + Math.abs(y - ry) > 0.3) requestAnimationFrame(loop); else run = false;
    }
  }

  /* ------------------------------------------------------------ scroll beam + nav state */
  function scrollFx() {
    var header = doc.querySelector(".site-nav"), tick = false;
    function update() {
      tick = false;
      var max = root.scrollHeight - window.innerHeight, y = window.scrollY || 0;
      root.style.setProperty("--scroll", max > 0 ? (y / max).toFixed(4) : 0);
      if (header) header.classList.toggle("is-scrolled", y > 24);
    }
    window.addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* ------------------------------------------------------------ countdown digit roll */
  function countdownFx() {
    if (RM || !("MutationObserver" in window)) return;
    each(doc.querySelectorAll("[data-cd]"), function (dd) {
      new MutationObserver(function () {
        dd.classList.remove("tick");
        void dd.offsetWidth;
        dd.classList.add("tick");
      }).observe(dd, { childList: true, characterData: true, subtree: true });
    });
  }

  /* ------------------------------------------------------------ terminal typing */
  function typeFx() {
    if (RM || BOT || !("IntersectionObserver" in window)) return;
    each(doc.querySelectorAll("[data-type]"), function (el) {
      var text = el.getAttribute("data-type");
      el.textContent = "";
      var io = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return;
        io.disconnect();
        var i = 0;
        var iv = setInterval(function () { el.textContent = text.slice(0, ++i); if (i >= text.length) clearInterval(iv); }, 55);
      }, { threshold: 0.6 });
      io.observe(el);
    });
  }

  /* ------------------------------------------------------------ go */
  var logo = particleLogo();
  ready(function () {
    scrollFx();
    reveals();
    pointerFx();
    cursor();
    countdownFx();
    typeFx();
    boot(function () {
      if (hero) hero.classList.add("hero-go");
      each(doc.querySelectorAll("[data-scramble]"), function (el, i) { scramble(el, 180 + i * 260); });
      glitchLoop();
      logo.start();
    });
  });
})();
