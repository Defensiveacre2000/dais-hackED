/* ==========================================================================
   DH 2026 — main.js (owner: B5)
   Reads window.SITE (config.js) and wires it into the static page.
   Everything is guarded: a missing container, key or API is skipped silently.
   The page is complete without this script; JS only refreshes it from config.
   Config strings are always written as TEXT (textContent), never as HTML.

   --------------------------------------------------------------------------
   MARKUP CONVENTIONS (for section authors)
   --------------------------------------------------------------------------
   1. Facts       <span data-fact="hackathon.dates">24–25 October 2026</span>
                  → textContent = SITE value at that dotted path. Numbers are
                    formatted en-IN (2000 → "2,000"). {dotted.path} tokens inside
                    any config string are replaced first.
                  Computed keys:
                    hackathon.feeText          "₹2,000 per team"
                    hackathon.teamText         "Up to 4 per team"
                    hackathon.teamMaxWord      "four"
                    hackathon.durationText     "24 hours (proposed)"
                    hackathon.durationShort    "24 hours"
                    hackathon.soloText         "To be confirmed" | "Yes" | "No"
                    hackathon.countdownCaption "Countdown to 24 October 2026 (tentative)"
                    hackathon.notifyUrl        interestUrl, else mailto: email, else ""
                    hackathon.registerHref     registerUrl when open, else "#register"
                    programme.sessionsText     "6–8 induction sessions"
                    programme.topicsCountWord  "Six"
                    contact.emailText          email, or "Contact email coming soon"
                    contact.mailto / mailtoQuestion / mailtoHosting / mailtoSponsor
                                               mailto: links ("" while no email)
                  data-fact="contact.email" with no address shows
                  contact.emailPendingText and gets data-empty="true" (style it muted).
                  When a fact's TBC flag becomes false, `.tbc` is removed from it.

   2. TBC labels  <span class="badge badge--tbc" data-tbc-flag="hackathon.fee.tbc">…</span>
                  → hidden when that config flag is false (an element that itself
                    has class `tbc` just loses the class instead).

   3. Show/hide   data-show-if="path"  → hidden unless the value is set ("#", "" = unset)
                  data-hide-if="path"  → hidden when the value is set

   4. Links       <a href="#" data-href="hackathon.discordUrl">Join the Discord</a>
                  → href set from config. Value "#", "" or missing = pending:
                    the link gets `hidden` + class `is-pending` (and a parent <li>
                    with nothing else visible is hidden too). Exception: if the
                    link's static href is an in-page anchor (e.g. "#register"),
                    it stays visible and keeps that anchor. http(s) links get
                    target="_blank" rel="noopener".

   5. Register CTAs
                  <a class="btn" href="#register" data-label-closed="How to register"
                     data-label-open="Register your team">How to register</a>
                  → while hackathon.registrationOpen is false (or registerUrl is
                    "#"): closed label, href "#register". When open: open label,
                    href registerUrl. The label goes into a [data-label] child if
                    there is one (keeps icons), otherwise replaces the link text.

   6. Action rows <div class="rg-actions" data-actions> …links… </div>
                  <p data-actions-empty hidden>Links go live here in October.</p>
                  → when every link/button in the row is hidden, the row is hidden
                    and the [data-actions-empty] line (next sibling, or inside the
                    same parent) is shown.

   7. Lists       <ul data-render="KEY"> … fallback items … </ul>
                  KEYS: divisions, prizes, aiRules, flow, judging, logistics
                        (hackathon); topics, ngos (programme); timeline, team, faq
                  Section HTML must include at least one fallback item whose text
                  nodes are marked with data-f="<field>" attributes.
                  Item template = <template data-item> inside the container if
                  present (preferred), otherwise the container's FIRST child
                  element. The template is cloned once per config item and the
                  container's fallback content is REPLACED.
                  Inside the template:
                    data-f="field"            textContent = item[field]
                                              ("." = the item itself, for string
                                              arrays such as aiRules). Empty → hidden.
                                              A wrapper with a single child
                                              (<div data-f="a"><p>…</p></div>)
                                              gets the text in that child.
                    data-f-attr="href:url"    sets an attribute; comma-separate
                                              several: "data-status:status,data-tbc:tbc"
                    data-f-if="tbc"           hidden unless item[field] is truthy
                    data-f-unless="tbc"       hidden when item[field] is truthy
                    data-f-list="names"       nested list (team chips)
                  Extra fields: n (1, 2, 3…), nn ("01"…); topics: trackLabel;
                  timeline: statusLabel ("Done" / "In progress" / ""), and tbc
                  taken from the flag named in tbcFrom.
                  Empty or missing config array → fallback left untouched
                  (this is how the NGO "announced soon" state survives).

   8. Countdown   <div data-countdown="2026-10-24T09:00:00+05:30">
                    <dd data-cd="d"></dd> <dd data-cd="h"></dd> <dd data-cd="m"></dd> <dd data-cd="s"></dd>
                    <p data-cd-label>…</p>   (optional)
                  Target = SITE.hackathon.start. data-state: counting | live | ended.
                  Invalid date → the box is hidden. Reduced motion → the seconds
                  cell is hidden and it updates once a minute.

   9. Nav         .nav-toggle toggles aria-expanded + header.site-nav.nav-open;
                  closes on link click (focus moves to the target), Escape,
                  outside tap, focus leaving the header, and resize to ≥ 900px.
                  The link of the section in view gets aria-current="true".

  10. Copy        <button data-copy="contact.email | #id"> copies the address;
                  shows the nearby .rg-copied for 1.5s. Hidden while there is no
                  real address.
   ========================================================================== */
(function () {
  "use strict";

  var NAV_BREAKPOINT = 900;
  var NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  /* ---------- helpers ---------- */

  function site() { return (typeof window !== "undefined" && window.SITE) || {}; }

  function rawGet(obj, path) {
    if (!obj || !path) return undefined;
    if (path === ".") return obj;
    var parts = String(path).split(".");
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur === null || cur === undefined || typeof cur !== "object") return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }

  function fmtNumber(n) {
    try { return Number(n).toLocaleString("en-IN"); } catch (e) { return String(n); }
  }

  function isEmail(v) { return typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }

  function isPendingUrl(v) {
    return v === undefined || v === null || typeof v !== "string" || v.trim() === "" || v.trim() === "#";
  }

  function mailto(subject) {
    var email = rawGet(site(), "contact.email");
    if (!isEmail(email)) return "";
    return "mailto:" + email.trim() + (subject ? "?subject=" + encodeURIComponent(subject) : "");
  }

  // "2026-10-24T09:00:00+05:30" → "24 October 2026" (read from the string, no time-zone shifts)
  function isoDateText(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ""));
    if (!m) return undefined;
    return parseInt(m[3], 10) + " " + MONTHS[parseInt(m[2], 10) - 1] + " " + m[1];
  }

  function word(n) {
    return (typeof n === "number" && NUMBER_WORDS[n]) ? NUMBER_WORDS[n] : (n === undefined ? undefined : String(n));
  }

  function registrationIsOpen() {
    var h = site().hackathon || {};
    return h.registrationOpen === true && !isPendingUrl(h.registerUrl);
  }

  // Computed facts derived from the raw config.
  var COMPUTED = {
    "hackathon.feeText": function (S) {
      var f = rawGet(S, "hackathon.fee");
      if (!f || f.amount === undefined || f.amount === null || f.amount === "") return undefined;
      return (f.currency || "") + fmtNumber(f.amount) + (f.per ? " per " + f.per : "");
    },
    "hackathon.teamText": function (S) {
      var m = rawGet(S, "hackathon.teamMax");
      return m ? "Up to " + m + " per team" : undefined;
    },
    "hackathon.teamMaxWord": function (S) { return word(rawGet(S, "hackathon.teamMax")); },
    "hackathon.durationShort": function (S) {
      var h = rawGet(S, "hackathon.durationHours");
      return h ? h + " hours" : undefined;
    },
    "hackathon.durationText": function (S) {
      var h = rawGet(S, "hackathon.durationHours");
      if (!h) return undefined;
      return h + " hours" + (rawGet(S, "hackathon.durationTbc") ? " (proposed)" : "");
    },
    "hackathon.soloText": function (S) {
      var v = rawGet(S, "hackathon.soloAllowed");
      if (v === undefined || v === null || v === "") return undefined;
      if (v === true) return "Yes";
      if (v === false) return "No";
      return String(v).toUpperCase() === "TBC" ? "To be confirmed" : String(v);
    },
    "hackathon.countdownCaption": function (S) {
      var d = isoDateText(rawGet(S, "hackathon.start"));
      if (!d) return undefined;
      return "Countdown to " + d + (rawGet(S, "hackathon.datesTbc") ? " (tentative)" : "");
    },
    "hackathon.notifyUrl": function (S) {
      var u = rawGet(S, "hackathon.interestUrl");
      if (!isPendingUrl(u)) return u.trim();
      return mailto("Notify me when registration opens");
    },
    "hackathon.registerHref": function (S) {
      return registrationIsOpen() ? rawGet(S, "hackathon.registerUrl").trim() : "#register";
    },
    "programme.sessionsText": function (S) {
      var c = rawGet(S, "programme.sessionsCount");
      return c ? c + " " + (rawGet(S, "programme.sessionsLabel") || "sessions") : undefined;
    },
    "programme.topicsCountWord": function (S) {
      var t = rawGet(S, "programme.topics");
      if (!Array.isArray(t)) return undefined;
      var w = word(t.length);
      return w.charAt(0).toUpperCase() + w.slice(1);
    },
    "contact.emailText": function (S) {
      var e = rawGet(S, "contact.email");
      return isEmail(e) ? e.trim() : (rawGet(S, "contact.emailPendingText") || "");
    },
    "contact.mailto": function () { return mailto(""); },
    "contact.mailtoQuestion": function (S) { return mailto("Question about " + (S.name || "the hackathon")); },
    "contact.mailtoHosting": function () { return mailto("Hosting a session"); },
    "contact.mailtoSponsor": function () { return mailto("Sponsorship"); }
  };

  // Which config flag says a fact is still "to be confirmed".
  var TBC_FLAGS = {
    "name": "nameTbc",
    "hackathon.dates": "hackathon.datesTbc",
    "hackathon.countdownCaption": "hackathon.datesTbc",
    "hackathon.durationHours": "hackathon.durationTbc",
    "hackathon.durationText": "hackathon.durationTbc",
    "hackathon.durationShort": "hackathon.durationTbc",
    "hackathon.fee.amount": "hackathon.fee.tbc",
    "hackathon.feeText": "hackathon.fee.tbc",
    "hackathon.submissions": "hackathon.submissionsTbc",
    "hackathon.soloAllowed": "hackathon.soloTbc",
    "hackathon.soloText": "hackathon.soloTbc",
    "hackathon.judgingNote": "hackathon.judgingTbc",
    "hackathon.donationNote": "hackathon.donationTbc",
    "programme.sessionsCount": "programme.sessionsTbc",
    "programme.sessionsText": "programme.sessionsTbc"
  };

  function getFact(path) {
    var S = site();
    if (COMPUTED[path]) {
      try { return COMPUTED[path](S); } catch (e) { return undefined; }
    }
    return rawGet(S, path);
  }

  // "{hackathon.feeText}" inside any config string is replaced by that fact, so FAQ
  // answers, rules and timeline text never repeat a number by hand. Nested tokens
  // resolve up to 3 levels; an unknown token is left as typed (easy to spot).
  function interpolate(str, depth) {
    depth = depth || 0;
    if (typeof str !== "string" || str.indexOf("{") === -1 || depth > 3) return str;
    return str.replace(/\{([\w.]+)\}/g, function (whole, path) {
      var v = getFact(path);
      if (typeof v === "number") return fmtNumber(v);
      if (typeof v === "string") return interpolate(v, depth + 1);
      return whole;
    });
  }

  function toText(v) {
    if (v === undefined || v === null) return undefined;
    if (typeof v === "number") return fmtNumber(v);
    if (typeof v === "string") return interpolate(v);
    if (typeof v === "boolean") return v ? "Yes" : "No";
    return undefined; // objects / arrays are not printable facts
  }

  function truthy(v) {
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === "string") v = v.trim();
    return !!v && v !== "#" && v !== "false";
  }

  function each(list, fn) {
    if (!list) return;
    for (var i = 0; i < list.length; i++) {
      try { fn(list[i], i); } catch (e) { /* never let one element break the page */ }
    }
  }

  function safe(fn) {
    try { fn(); } catch (e) {
      if (window.console && console.warn) console.warn("[main.js]", e);
    }
  }

  // Same logic for build.py (it runs this file in Node to fill <head> and JSON-LD).
  if (typeof window !== "undefined") {
    window.DHFacts = { get: getFact, text: toText, interpolate: interpolate, isPendingUrl: isPendingUrl };
  }
  if (typeof document === "undefined") return;

  /* ---------- 1–3. facts, TBC labels, show/hide ---------- */

  function applyFacts(root) {
    root = root || document;
    each(root.querySelectorAll("[data-fact]"), function (el) {
      var path = el.getAttribute("data-fact");
      var text;
      if (path === "contact.email") {
        var email = rawGet(site(), "contact.email");
        if (isEmail(email)) { text = email.trim(); el.removeAttribute("data-empty"); }
        else { text = toText(rawGet(site(), "contact.emailPendingText")) || ""; el.setAttribute("data-empty", "true"); }
      } else {
        text = toText(getFact(path));
      }
      if (text === undefined) return;
      if (el.textContent !== text) el.textContent = text;

      var flagPath = TBC_FLAGS[path];
      if (flagPath && rawGet(site(), flagPath) === false) {
        el.classList.remove("tbc");
        var p = el.parentElement;
        if (p && p.tagName === "SPAN" && p.classList.contains("tbc")) p.classList.remove("tbc");
      }
    });

    each(root.querySelectorAll("[data-tbc-flag]"), function (el) {
      var off = rawGet(site(), el.getAttribute("data-tbc-flag")) === false;
      // An inline value (has .tbc, or wraps/is a data-fact) only loses its underline; a badge is hidden.
      if (el.__dhTbcClass === undefined) {
        el.__dhTbcClass = el.classList.contains("tbc") || el.hasAttribute("data-fact") || !!el.querySelector("[data-fact]");
      }
      if (el.__dhTbcClass) {
        el.classList.toggle("tbc", !off);
      } else {
        el.hidden = off;                        // badges such as "Tentative" / "To be confirmed"
      }
    });

    each(root.querySelectorAll("[data-show-if]"), function (el) {
      el.hidden = !truthy(getFact(el.getAttribute("data-show-if")));
    });
    each(root.querySelectorAll("[data-hide-if]"), function (el) {
      el.hidden = truthy(getFact(el.getAttribute("data-hide-if")));
    });

    var S = site();
    if (S.name) {
      var t = S.name + (S.tagline ? " — " + S.tagline : "");
      if (document.title !== t) document.title = t;
    }
  }

  /* ---------- 4. links ---------- */

  function setExternal(a, url) {
    var note = a.querySelector(".dh-newtab");
    if (/^https?:\/\//i.test(url)) {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener");
      // E3 a11y: tell screen-reader users the link opens a new tab (WCAG 3.2.5 advisory).
      if (!note) {
        note = document.createElement("span");
        note.className = "sr-only dh-newtab";
        note.textContent = " (opens in a new tab)";
        a.appendChild(note);
      }
    } else {
      a.removeAttribute("target");
      a.removeAttribute("rel");
      if (note) note.parentNode.removeChild(note);
    }
  }

  // Hide a parent <li> when the link was its only visible content.
  function syncListItem(a) {
    var li = a.parentElement;
    if (!li || li.tagName !== "LI") return;
    var visible = false;
    each(li.childNodes, function (n) {
      if (n.nodeType === 1 && !n.hidden) visible = true;
      if (n.nodeType === 3 && n.nodeValue.trim()) visible = true;
    });
    li.hidden = !visible;
  }

  function applyHrefs(root) {
    each((root || document).querySelectorAll("a[data-href]"), function (a) {
      if (a.hasAttribute("data-label-open") || a.hasAttribute("data-label-closed")) return; // see applyRegisterCtas
      var val = getFact(a.getAttribute("data-href"));
      if (a.__dhOrigHref === undefined) a.__dhOrigHref = a.getAttribute("href") || "";
      var soon = a.querySelector(".btn-soon");            // legacy pill from round 0
      if (soon) soon.parentNode.removeChild(soon);
      a.removeAttribute("aria-disabled");

      if (isPendingUrl(val)) {
        if (/^#[A-Za-z]/.test(a.__dhOrigHref)) {          // in-page fallback keeps working
          a.classList.remove("is-pending");
          a.hidden = false;
          a.setAttribute("href", a.__dhOrigHref);
          setExternal(a, a.__dhOrigHref);
        } else {
          a.classList.add("is-pending");
          a.hidden = true;
        }
      } else {
        val = val.trim();
        a.classList.remove("is-pending");
        a.hidden = false;
        a.setAttribute("href", val);
        setExternal(a, val);
      }
      syncListItem(a);
    });
  }

  /* ---------- 5. register CTAs ---------- */

  function applyRegisterCtas(root) {
    var open = registrationIsOpen();
    var url = open ? String(rawGet(site(), "hackathon.registerUrl")).trim() : "#register";
    each((root || document).querySelectorAll("[data-label-open],[data-label-closed]"), function (el) {
      var label = el.getAttribute(open ? "data-label-open" : "data-label-closed");
      if (label) {
        var target = el.querySelector("[data-label]") || el;
        if (target.textContent !== label) target.textContent = label;
      }
      if (el.tagName === "A") {
        el.setAttribute("href", url);
        setExternal(el, url);
        el.classList.remove("is-pending");
        el.hidden = false;
      }
    });
  }

  /* ---------- 6. action rows ---------- */

  function isShown(el, stop) {
    var cur = el;
    while (cur && cur !== stop) {
      if (cur.hidden) return false;
      cur = cur.parentElement;
    }
    return true;
  }

  function applyActions(root) {
    each((root || document).querySelectorAll("[data-actions]"), function (row) {
      var any = false;
      each(row.querySelectorAll("a, button"), function (el) { if (isShown(el, row)) any = true; });
      row.hidden = !any;
      var empty = row.nextElementSibling;
      if (!empty || !empty.hasAttribute("data-actions-empty")) {
        empty = row.parentElement ? row.parentElement.querySelector("[data-actions-empty]") : null;
      }
      if (empty) empty.hidden = any;
    });
  }

  /* ---------- 7. list renderers ---------- */

  function renderSource(key) {
    var S = site();
    var h = S.hackathon || {};
    var p = S.programme || {};
    switch (key) {
      case "divisions": return h.divisions;
      case "prizes": return h.prizes;
      case "aiRules": return h.aiRules;
      case "flow": return h.flow;
      case "judging": return h.judging;
      case "logistics": return h.logistics;
      case "topics":
        if (!Array.isArray(p.topics)) return undefined;
        var labels = p.trackLabels || { "hackathon-prep": "Hackathon prep", "community": "Community" };
        return p.topics.map(function (t) {
          if (!t || typeof t !== "object") return t;
          var o = shallowCopy(t);
          if (o.trackLabel === undefined && o.track) o.trackLabel = labels[o.track] || o.track;
          if (o.tbc && !o.tbcNote) o.tbcNote = "To be confirmed";
          return o;
        });
      case "ngos": return p.ngos;
      case "timeline":
        if (!Array.isArray(S.timeline)) return undefined;
        var sl = S.timelineStatusLabels || { done: "Done", next: "In progress", later: "" };
        return S.timeline.map(function (t) {
          if (!t || typeof t !== "object") return t;
          var o = shallowCopy(t);
          if (o.tbcFrom) o.tbc = rawGet(S, o.tbcFrom) === true;
          if (o.statusLabel === undefined) o.statusLabel = sl[o.status] || "";
          return o;
        });
      case "faq": return S.faq;
      case "team": return normaliseTeam(S.team);
      default: return rawGet(S, key);
    }
  }

  function normaliseTeam(team) {
    if (Array.isArray(team)) return team;
    if (team && typeof team === "object") {
      return Object.keys(team).map(function (role) {
        return { role: role, names: [].concat(team[role] || []) };
      });
    }
    return undefined;
  }

  function shallowCopy(o) {
    var c = {};
    for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) c[k] = o[k];
    return c;
  }

  // Returns a detached template element for a container (cached on first call,
  // so re-renders after hot updates use the same template).
  function getTemplate(container) {
    if (container.__dhTpl) return container.__dhTpl;
    var tplEl = null;
    for (var i = 0; i < container.children.length; i++) {
      var c = container.children[i];
      if (c.tagName === "TEMPLATE" && c.hasAttribute("data-item")) { tplEl = c; break; }
    }
    var node = null;
    if (tplEl) {
      node = tplEl.content ? tplEl.content.firstElementChild : tplEl.firstElementChild;
      container.__dhTplHolder = tplEl;
    } else {
      for (var j = 0; j < container.children.length; j++) {
        if (container.children[j].tagName !== "TEMPLATE") { node = container.children[j]; break; }
      }
    }
    if (!node) return null;
    container.__dhTpl = node.cloneNode(true);
    return container.__dhTpl;
  }

  function fieldValue(item, field) {
    if (field === "." || field === "") return item;
    if (item === null || typeof item !== "object") return item; // string items: any field = the string
    return rawGet(item, field);
  }

  function setText(el, value) {
    var text = toText(value);
    if (text === undefined) text = "";
    var target = el;
    while (target.children.length === 1 && !target.firstElementChild.hasAttribute("data-f") &&
           target.textContent.trim() === target.firstElementChild.textContent.trim()) {
      target = target.firstElementChild;
    }
    target.textContent = text;
    if (text === "" && !el.hasAttribute("data-f-if") && !el.hasAttribute("data-f-unless")) el.hidden = true;
  }

  function setAttrs(el, spec, item) {
    each(spec.split(","), function (pair) {
      var idx = pair.indexOf(":");
      if (idx < 1) return;
      var attr = pair.slice(0, idx).trim();
      var v = fieldValue(item, pair.slice(idx + 1).trim());
      if (v === undefined || v === null || v === "") {
        if (/^data-|^aria-/.test(attr)) el.setAttribute(attr, "false");
        else el.removeAttribute(attr);
        return;
      }
      v = typeof v === "string" ? interpolate(v) : String(v);
      el.setAttribute(attr, v);
      if (attr === "href") setExternal(el, v);
    });
  }

  function inNestedList(node, root) {
    var cur = node.parentElement;
    while (cur && cur !== root) {
      if (cur.hasAttribute("data-f-list")) return true;
      cur = cur.parentElement;
    }
    return false;
  }

  function fillItem(clone, item, index) {
    if (item && typeof item === "object" && !Array.isArray(item)) {
      var extra = shallowCopy(item);
      if (extra.n === undefined) extra.n = index + 1;
      if (extra.nn === undefined) extra.nn = (index + 1 < 10 ? "0" : "") + (index + 1);
      item = extra;
    }

    var sel = "[data-f],[data-f-attr],[data-f-if],[data-f-unless],[data-f-list]";
    var nodes = [clone].concat(Array.prototype.slice.call(clone.querySelectorAll(sel)))
      .filter(function (n) { return n === clone || !inNestedList(n, clone); });

    each(nodes, function (n) {
      if (!n.hasAttribute("data-f-list")) return;
      var arr = fieldValue(item, n.getAttribute("data-f-list"));
      if (!Array.isArray(arr)) return;
      var sub = getTemplate(n);
      if (!sub) return;
      while (n.firstChild) n.removeChild(n.firstChild);
      each(arr, function (v, i) { n.appendChild(fillItem(sub.cloneNode(true), v, i)); });
    });

    each(nodes, function (n) {
      if (n.hasAttribute("data-f") && !n.hasAttribute("data-f-list")) {
        setText(n, fieldValue(item, n.getAttribute("data-f")));
      }
      if (n.hasAttribute("data-f-attr")) setAttrs(n, n.getAttribute("data-f-attr"), item);
      if (n.hasAttribute("data-f-if")) n.hidden = !truthy(fieldValue(item, n.getAttribute("data-f-if")));
      if (n.hasAttribute("data-f-unless")) n.hidden = truthy(fieldValue(item, n.getAttribute("data-f-unless")));
    });
    return clone;
  }

  function renderContainer(container) {
    var data = renderSource(container.getAttribute("data-render"));
    if (!Array.isArray(data) || data.length === 0) return; // keep fallback / empty state
    var tpl = getTemplate(container);
    if (!tpl) return;

    var frag = document.createDocumentFragment();
    each(data, function (item, i) {
      if (item === undefined || item === null) return;
      frag.appendChild(fillItem(tpl.cloneNode(true), item, i));
    });
    if (!frag.childNodes.length) return;

    var holder = container.__dhTplHolder;
    while (container.firstChild) container.removeChild(container.firstChild);
    if (holder) container.appendChild(holder);
    container.appendChild(frag);
    container.setAttribute("data-rendered", "true");
  }

  function renderAll() {
    each(document.querySelectorAll("[data-render]"), renderContainer);
  }

  /* ---------- 8. countdown ---------- */

  var cdTimer = null;

  function reducedMotion() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function pad2(n) { return (n < 10 ? "0" : "") + n; }

  function setCd(box, part, text) {
    each(box.querySelectorAll('[data-cd="' + part + '"]'), function (el) {
      if (el.textContent !== text) el.textContent = text;
    });
  }

  // Hide the seconds cell under reduced motion (only if its parent holds just that cell).
  function syncSecondsCell(box, hide) {
    each(box.querySelectorAll('[data-cd="s"]'), function (el) {
      var cell = el.parentElement;
      var target = (cell && cell !== box && cell.querySelectorAll("[data-cd]").length === 1) ? cell : el;
      target.hidden = hide;
    });
  }

  function tickCountdowns() {
    var boxes = document.querySelectorAll("[data-countdown]");
    if (!boxes.length) return false;
    var now = Date.now();
    var endIso = rawGet(site(), "hackathon.end");
    var end = endIso ? new Date(endIso).getTime() : NaN;
    var running = false;
    var rm = reducedMotion();

    each(boxes, function (box) {
      var iso = rawGet(site(), "hackathon.start") || box.getAttribute("data-countdown");
      if (iso && box.getAttribute("data-countdown") !== iso) box.setAttribute("data-countdown", iso);
      var target = new Date(iso).getTime();
      if (isNaN(target)) {
        box.hidden = true;
        if (window.console) console.warn("[main.js] hackathon.start is not a valid date: " + iso);
        return;
      }
      box.hidden = false;
      syncSecondsCell(box, rm);
      var diff = target - now;
      var label = box.querySelector("[data-cd-label]");

      if (diff > 0) {
        running = true;
        var s = Math.floor(diff / 1000);
        setCd(box, "d", String(Math.floor(s / 86400)));
        setCd(box, "h", pad2(Math.floor((s % 86400) / 3600)));
        setCd(box, "m", pad2(Math.floor((s % 3600) / 60)));
        setCd(box, "s", pad2(s % 60));
        if (box.getAttribute("data-state") !== "counting") box.setAttribute("data-state", "counting");
        return;
      }
      setCd(box, "d", "0"); setCd(box, "h", "00"); setCd(box, "m", "00"); setCd(box, "s", "00");
      if (!isNaN(end) && now >= end) {
        box.setAttribute("data-state", "ended");
        if (label) label.textContent = "Wrapped up";
      } else {
        running = true;
        box.setAttribute("data-state", "live");
        if (label) label.textContent = "Now live";
      }
    });
    return running;
  }

  function stopCountdown() {
    if (cdTimer) { clearTimeout(cdTimer); cdTimer = null; }
  }

  // Aligned to the wall-clock second (or minute under reduced motion).
  function scheduleCountdown() {
    stopCountdown();
    var step = reducedMotion() ? 60000 : 1000;
    cdTimer = setTimeout(function () {
      cdTimer = null;
      if (tickCountdowns()) scheduleCountdown();
    }, step - (Date.now() % step) + 15);
  }

  function startCountdown() {
    stopCountdown();
    if (tickCountdowns()) scheduleCountdown();
    if (!window.__dhCdBound) {
      window.__dhCdBound = true;
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) { stopCountdown(); return; }
        if (tickCountdowns()) scheduleCountdown();
      });
    }
  }

  /* ---------- 9. nav ---------- */

  function navParts() {
    var header = document.querySelector("header.site-nav");
    var toggle = header ? header.querySelector(".nav-toggle") : document.querySelector(".nav-toggle");
    return { header: header, toggle: toggle };
  }

  function setNav(open) {
    var p = navParts();
    if (!p.header) return;
    p.header.classList.toggle("nav-open", !!open);
    if (p.toggle) p.toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function isNavOpen() {
    var p = navParts();
    return !!(p.header && p.header.classList.contains("nav-open"));
  }

  function focusTarget(hash) {
    if (!hash || hash.length < 2) return;
    var t = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!t) return;
    if (!t.hasAttribute("tabindex") && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(t.tagName)) {
      t.setAttribute("tabindex", "-1");
    }
    try { t.focus({ preventScroll: true }); } catch (e) { t.focus(); }
  }

  function bindNav() {
    var p = navParts();
    if (p.toggle && !p.toggle.__dhBound) {
      p.toggle.__dhBound = true;
      p.toggle.addEventListener("click", function () { setNav(!isNavOpen()); });
    }
    if (p.header && !p.header.__dhFocusBound) {
      p.header.__dhFocusBound = true;
      // Focus moved to something outside the header (e.g. Tab past the last link).
      p.header.addEventListener("focusout", function (e) {
        if (isNavOpen() && e.relatedTarget && !p.header.contains(e.relatedTarget)) setNav(false);
      });
    }
    if (window.__dhNavBound) return;
    window.__dhNavBound = true;

    document.addEventListener("click", function (e) {
      var a = e.target && e.target.closest ? e.target.closest("a") : null;
      if (!a || !isNavOpen()) return;
      var href = a.getAttribute("href") || "";
      var inHeader = !!a.closest("header.site-nav");
      if (inHeader || href.charAt(0) === "#") {
        setNav(false);
        if (inHeader && href.charAt(0) === "#") focusTarget(href);  // focus would be lost on a hidden link
      }
    });
    document.addEventListener("pointerdown", function (e) {
      if (!isNavOpen()) return;
      var h = navParts().header;
      if (h && !h.contains(e.target)) setNav(false);
    });
    document.addEventListener("keydown", function (e) {
      if ((e.key === "Escape" || e.key === "Esc") && isNavOpen()) {
        setNav(false);
        var t = navParts().toggle;
        if (t && t.focus) t.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth >= NAV_BREAKPOINT && isNavOpen()) setNav(false);
    }, { passive: true });
  }

  // aria-current on the nav link for the section in view.
  function bindActiveSection() {
    if (window.__dhSpyBound || !("IntersectionObserver" in window)) return;
    var links = document.querySelectorAll('header.site-nav a[href^="#"]:not(.btn)');
    var map = {};
    var sections = [];
    each(links, function (a) {
      var id = (a.getAttribute("href") || "").slice(1);
      var s = id && document.getElementById(id);
      if (s && id !== "top" && id !== "main") { (map[id] = map[id] || []).push(a); sections.push(s); }
    });
    if (!sections.length) return;
    window.__dhSpyBound = true;
    var current = null;
    function set(id) {
      if (id === current) return;
      current = id;
      each(links, function (a) { a.removeAttribute("aria-current"); });
      each(map[id] || [], function (a) { a.setAttribute("aria-current", "true"); });
    }
    var io = new IntersectionObserver(function (entries) {
      each(entries, function (en) {
        if (en.isIntersecting) set(en.target.id);
        else if (en.target.id === current && en.boundingClientRect.top > 0) set(null);
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    each(sections, function (s) { io.observe(s); });
  }

  /* ---------- 10. copy buttons ---------- */

  function copySource(btn) {
    var ref = (btn.getAttribute("data-copy") || "").trim();
    if (ref.charAt(0) === "#" && ref.length > 1) return document.getElementById(ref.slice(1));
    var path = ref || "contact.email";
    var sib = btn.previousElementSibling;
    while (sib) {
      if (sib.getAttribute("data-fact") === path) return sib;
      var inner = sib.querySelector && sib.querySelector('[data-fact="' + path + '"]');
      if (inner) return inner;
      sib = sib.previousElementSibling;
    }
    var scope = btn.parentElement;
    while (scope) {
      var hit = scope.querySelector('[data-fact="' + path + '"]');
      if (hit) return hit;
      scope = scope.parentElement;
    }
    return null;
  }

  function copiedFlag(btn) {
    var n = btn.nextElementSibling;
    while (n) { if (n.classList.contains("rg-copied")) return n; n = n.nextElementSibling; }
    return btn.parentElement ? btn.parentElement.querySelector(".rg-copied") : null;
  }

  function selectText(el) {
    try {
      var r = document.createRange();
      r.selectNodeContents(el);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(r);
    } catch (e) { /* ignore */ }
  }

  function flashCopied(btn) {
    var flag = copiedFlag(btn);
    if (!flag) return;
    // E3 a11y: the role="status" region stays rendered and only its text changes,
    // so screen readers announce "Copied" (a region revealed from display:none often isn't read).
    flag.hidden = false;
    flag.textContent = "";
    clearTimeout(btn.__dhCopyTimer);
    clearTimeout(btn.__dhCopyTimer2);
    btn.__dhCopyTimer2 = setTimeout(function () { flag.textContent = "Copied"; }, 60);
    btn.__dhCopyTimer = setTimeout(function () { flag.textContent = ""; }, 2000);
  }

  function bindCopy() {
    each(document.querySelectorAll("[data-copy]"), function (btn) {
      var src = copySource(btn);
      btn.hidden = !src || !isEmail(src.textContent);
      var flag = copiedFlag(btn);
      // Keep the live region in the tree (empty) whenever the button is usable.
      if (flag) {
        flag.hidden = btn.hidden;
        if (!btn.__dhBound) flag.textContent = "";
      }
      if (btn.__dhBound) return;
      btn.__dhBound = true;
      btn.addEventListener("click", function () {
        var el = copySource(btn);
        if (!el) return;
        var value = el.textContent.trim();
        if (!value) return;
        var done = function () { flashCopied(btn); };
        var fallback = function () { selectText(el); };
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(value).then(done, fallback);
          } else {
            fallback();
          }
        } catch (e) { fallback(); }
      });
    });
  }

  /* ---------- init ---------- */

  function start() {
    safe(renderAll);
    safe(function () { applyFacts(document); });
    safe(function () { applyHrefs(document); });
    safe(function () { applyRegisterCtas(document); });
    safe(function () { applyActions(document); });
    safe(bindCopy);
    safe(startCountdown);
    safe(bindNav);
    safe(bindActiveSection);
    safe(function () { document.documentElement.setAttribute("data-js", "ready"); });
  }

  function boot() {
    var hot = window.claude && window.claude.hot;
    if (hot && typeof hot.ready === "function") {
      try { hot.ready(start); return; } catch (e) { /* fall through */ }
    }
    start();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
