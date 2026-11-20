/* ==========================================================================
   DAIS HackED — event-day phase engine
   Switches the page between four screens from the schedule in config.js:
     pre       countdown to the opening ceremony        (now < start)
     ceremony  opening ceremony, "on air"               (start ≤ now < buildStart)
     live      24 hours of hacking, mission control     (buildStart ≤ now < end)
     ended     wrap-up                                  (now ≥ end)
   Markup: any element with data-phase-show="pre live …" is shown only in
   those phases. Values are written into [data-ph="key"] elements.
   Preview a screen before the day:  ?preview=pre | ceremony | live | ended
   ========================================================================== */
(function () {
  "use strict";
  if (window.__dhPhase) return;
  window.__dhPhase = true;

  var doc = document, root = doc.documentElement;
  var H = (window.SITE && window.SITE.hackathon) || {};
  var T0 = Date.parse(H.start), T1 = Date.parse(H.buildStart), T2 = Date.parse(H.end);
  if (isNaN(T0)) return;                         // no schedule: leave the page as authored
  if (isNaN(T1)) T1 = T0;
  if (isNaN(T2)) T2 = T1 + 24 * 3600e3;
  var each = function (l, f) { Array.prototype.forEach.call(l, f); };

  /* ---- preview: shift the clock so a chosen screen shows, and keep ticking ---- */
  var offset = 0, preview = null;
  try { preview = new URLSearchParams(window.location.search).get("preview"); } catch (e) {}
  var SIM = {
    pre: T0 - (3 * 86400e3 + 5 * 3600e3 + 17 * 60e3 + 42e3),
    ceremony: T0 + 38 * 60e3,
    live: T1 + 7 * 3600e3 + 26 * 60e3,
    ended: T2 + 20 * 60e3
  };
  if (preview && SIM[preview] !== undefined) offset = SIM[preview] - Date.now();
  function now() { return Date.now() + offset; }

  function phaseAt(t) { return t < T0 ? "pre" : t < T1 ? "ceremony" : t < T2 ? "live" : "ended"; }

  /* ---- formatting (IST, the organisers' time zone) ---- */
  function fmt(ms, opts) {
    try { return new Intl.DateTimeFormat("en-GB", Object.assign({ timeZone: "Asia/Kolkata" }, opts)).format(new Date(ms)); }
    catch (e) { return new Date(ms).toUTCString(); }
  }
  // "10:00 a.m." / "12:00 p.m." — always 12-hour with a.m./p.m., never a bare "10:00"
  function clock(ms) {
    var hm = fmt(ms, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).split(":");
    var h = parseInt(hm[0], 10) % 24, m = hm[1];
    return (h % 12 || 12) + ":" + m + (h < 12 ? " a.m." : " p.m.");
  }
  function label(ms) {
    return fmt(ms, { weekday: "short", day: "numeric", month: "short" }) + ", " + clock(ms) + " IST";
  }
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };

  /* ---- cached targets ---- */
  var slots = {};
  function slot(key) {
    if (!slots[key]) slots[key] = doc.querySelectorAll('[data-ph="' + key + '"]');
    return slots[key];
  }
  function set(key, text) {
    each(slot(key), function (el) { if (el.textContent !== text) el.textContent = text; });
  }
  function bar(name, frac) {
    var w = (Math.max(0, Math.min(1, frac)) * 100).toFixed(2) + "%";
    each(doc.querySelectorAll('[data-ph-progress="' + name + '"]'), function (el) { el.style.width = w; });
  }

  /* ---- one-time fills from config ---- */
  function fillStatic() {
    each(doc.querySelectorAll("[data-ph-date]"), function (el) {
      var which = el.getAttribute("data-ph-date");
      var ms = which === "start" ? T0 : which === "buildStart" ? T1 : which === "end" ? T2 : NaN;
      if (!isNaN(ms)) el.textContent = label(ms);
    });
    var agenda = H.ceremonyAgenda;
    if (Array.isArray(agenda) && agenda.length) {
      each(doc.querySelectorAll("[data-ph-agenda]"), function (ol) {
        ol.innerHTML = "";
        agenda.forEach(function (item) {
          var li = doc.createElement("li");
          li.textContent = String(item);
          ol.appendChild(li);
        });
      });
    }
  }

  /* ---- switching screens ---- */
  var current = null;
  function apply(ph) {
    if (ph === current) return;
    var first = current === null;
    current = ph;
    root.setAttribute("data-phase", ph);
    each(doc.querySelectorAll("[data-phase-show]"), function (el) {
      el.hidden = el.getAttribute("data-phase-show").split(/\s+/).indexOf(ph) < 0;
    });
    // schedule strip: done / now / next
    var order = { pre: -1, ceremony: 0, live: 1, ended: 3 };
    each(doc.querySelectorAll("[data-sched-step]"), function (li) {
      var i = +li.getAttribute("data-sched-step"), at = order[ph];
      li.classList.toggle("is-done", i < at || (ph === "ended"));
      li.classList.toggle("is-now", i === at);
      li.classList.toggle("is-next", ph === "pre" ? i === 0 : i === at + 1 && ph !== "ended");
      if (i === at) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
    });
    if (!first) {
      var hero = doc.querySelector(".hero");
      if (hero) { hero.classList.remove("phase-flash"); void hero.offsetWidth; hero.classList.add("phase-flash"); }
    }
    try { doc.dispatchEvent(new CustomEvent("dh:phase", { detail: { phase: ph } })); } catch (e) {}
  }

  function tick() {
    var t = now(), ph = phaseAt(t), s;
    apply(ph);
    if (ph === "pre") {
      s = Math.floor(Math.max(0, T0 - t) / 1000);
      set("pre-d", String(Math.floor(s / 86400)));
      set("pre-h", pad(Math.floor(s % 86400 / 3600)));
      set("pre-m", pad(Math.floor(s % 3600 / 60)));
      set("pre-s", pad(s % 60));
    } else if (ph === "ceremony") {
      s = Math.floor(Math.max(0, T1 - t) / 1000);
      var hh = pad(Math.floor(s / 3600)), mm = pad(Math.floor(s % 3600 / 60)), ss = pad(s % 60);
      set("cer-h", hh); set("cer-m", mm); set("cer-s", ss);
      set("bar-cer", hh + ":" + mm + ":" + ss);
      var f = (t - T0) / (T1 - T0 || 1);
      bar("ceremony", f);
      each(doc.querySelectorAll("[data-ph-agenda]"), function (ol) {
        var items = ol.children, n = items.length, at = Math.min(n - 1, Math.floor(f * n));
        each(items, function (li, i) {
          li.classList.toggle("is-done", i < at);
          li.classList.toggle("is-now", i === at);
        });
      });
    } else if (ph === "live") {
      s = Math.floor(Math.max(0, T2 - t) / 1000);
      var h2 = pad(Math.floor(s / 3600)), m2 = pad(Math.floor(s % 3600 / 60)), s2 = pad(s % 60);
      set("live-h", h2); set("live-m", m2); set("live-s", s2);
      set("bar-live", h2 + ":" + m2 + ":" + s2);
      var fl = (t - T1) / (T2 - T1 || 1);
      bar("live", fl);
      set("live-pct", Math.floor(fl * 100) + "%");
      var el = Math.floor((t - T1) / 60000);
      set("live-elapsed", Math.floor(el / 60) + "h " + pad(el % 60) + "m");
    }
  }

  function loop() {
    tick();
    var ms = 1000 - (now() % 1000);
    setTimeout(loop, ms < 50 ? ms + 1000 : ms);
  }

  // the floating live bar steps aside while the hero (which shows the big clock) is on screen
  function pillWatch() {
    var pill = doc.querySelector(".live-pill"), hero = doc.querySelector(".hero");
    if (!pill || !hero || !("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (es) {
      pill.classList.toggle("is-away", es[0].isIntersecting);
    }, { threshold: 0.35 }).observe(hero);
  }

  function start() {
    fillStatic();
    pillWatch();
    loop();
    doc.addEventListener("visibilitychange", function () { if (!doc.hidden) tick(); });
  }
  // apply the right screen as early as possible so the wrong one never flashes
  apply(phaseAt(now()));
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", start); else start();
})();
