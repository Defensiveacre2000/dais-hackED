# E4 — Code quality, performance & hosting readiness (round 1)

Reviewed: every file in `src/` plus `build.py`, the built `dist/index.html`, and the DOM after JS runs. Evidence scripts live in `reviews/scratch/e4_*.py` and can be re-run.

**Measured baseline (built 7 Oct, 06:09)**
- `dist/index.html` is **357,688 B raw / 196,743 B gzip**. **205,744 B (57%) of that is base64 PNG.** The 50 KB logo-white PNG is inlined **twice** (hero + footer) and the 50 KB blue logo once, at full 493×540 resolution, to be shown at 33×36 px (nav) and 40×44 px (footer). Without images the page is 152 KB raw / **37 KB gzip**. The CSS is 55.7 KB and the JS is 50.0 KB, unminified.
- Nu validator (vnu.jar): **0 errors** on both the built file and the JS-rendered DOM. html5lib reports 2 parse errors for the unescaped `&` in the Google Fonts URL. No duplicate ids, and every `aria-labelledby`, `aria-controls` and `#anchor` resolves.
- `node --check`: config.js, hero.js, main.js and the concatenated bundle all pass.
- CLS: 0.0156 at 1280 px and 0 at 360 px. With the woff2 files held back 1.5 s it is 0.036 and 0.013. LCP (headless) ≈ 250–500 ms. The LCP element is the nav CTA or a span, because the hero copy starts at `opacity:0` (`.hero-rise`).
- Hero canvas CPU, measured as the CDP TaskDuration share of one core while the hero is visible. The sandbox has no GPU and rasterises in software, so compare the numbers with each other, not as absolutes. Desktop 1440: **24–39%**. 360 px, DPR 2, 4× CPU throttle: **83–89%**. With the canvas hidden the same pages run at 5% and 13%. Script is only 3–8%; the rest is canvas raster. Off-screen it drops to 0.3%, so the IntersectionObserver works.
- Robustness: 12 broken or partial config scenarios (`SITE` undefined, `{}`, no `hackathon`, null fee or prizes, bad date, team as object, NGOs filled, HTML in FAQ, …) produced **0 exceptions**. But a single **syntax error** in config.js breaks the whole page (Must fix 1).

## 1. Scores (lens: code quality, performance, hosting readiness)

| Component | Score | Main reason |
|---|---|---|
| Nav | 6 | Valid and clean. The logo is a 50 KB PNG for a 33 px mark. The mobile menu is dead without JS and also dies when config.js has a typo. |
| Hero | 5 | Canvas costs a lot of CPU and runs forever. Countdown fallback "17 00 00 00" is already stale and stays frozen on a bad date. "Tentative" badge is hard-coded. Logo inlined twice. |
| About | 6 | The base list reset beats `.ab-meta`, so the meta rows don't align (visible bug). Dead duplicate rule. |
| Hackathon | 6 | Well scoped CSS. But the fee and dates "To be confirmed"/"Tentative" badges and the Solo value can't be turned off from config. 26 of 28 static list items differ from config. |
| Programme | 6 | Good `<template>` use and empty state. But 76 `#programme` ID selectors force 2 `!important`, and `ngosEmptyText` in config does nothing. |
| Timeline | 7 | Clean. The authored `.tl-list` margin is dead (same reset bug). Status is set by hand. |
| Team | 8 | Clean, rendered from config, no issues. |
| FAQ | 6 | Answers repeat fee, dates, duration and team size as literal text. The static Q9 answer contradicts config. `top:96px` magic number. |
| Register | 6 | The global `.is-pending` rules live in register.css. `.btn-soon` has no style. |
| Footer | 7 | Fine. Pending links ("Instagram Opens soon") look live because there is no pending style outside `.rg-band`. |
| **E4 overall** | **5** | Solid, defensive JS and valid markup. But page weight is double what it needs to be, config is not yet the single source of truth, there are no share/SEO tags, and the repo is not deploy-safe (stale root `index.html`, stale `DEPLOY.md`). |

---

## 2. Must fix (blocking)

### M1. One typo in config.js breaks the countdown, mobile menu and canvas, and the build reports success. Owner: B5. File: `build.py` (`main()`, the `js_parts` block)
- **What's wrong:** build.py joins config.js, hero.js and main.js into **one** `<script>`. A student who drops one comma in config.js (the file we tell non-developers to edit) gets a parse error that also kills hero.js and main.js. Reproduced in `reviews/scratch/broken-config.html` (`e4_broken.py`): `pageerror: Unexpected identifier 'nameTbc'`. The mobile menu does not open, the countdown is frozen at "17" and the canvas is blank. `python3 build.py` still prints "Done with 0 warning(s)."
- **Fix (patch tested; full diff in `reviews/scratch/build.py.diff`):**
  1. Emit **one `<script>` per file**, so a broken config leaves main.js running on its static fallbacks:
     ```python
     js_parts = []
     for n in JS:
         j = read(n)
         if j:
             js_parts.append(f"<script>\n/* ===== {n} ===== */\n{safe_script(j)}\n</script>")
     js = "\n".join(js_parts)
     # …and later:  script = js
     ```
  2. **Check config.js with Node and stop the build on error.** Return `window.SITE` as JSON, which M3 to M5 reuse:
     ```python
     def load_site():
         node = shutil.which("node")
         if not node:
             warn("Node.js not found: config.js was NOT checked …"); return None
         code = ("global.window={};require(process.argv[1]);"
                 "if(!window.SITE)throw new Error('config.js must assign window.SITE');"
                 "process.stdout.write(JSON.stringify(window.SITE))")
         r = subprocess.run([node, "-e", code, str(SRC / "config.js")], capture_output=True, text=True, timeout=30)
         if r.returncode != 0:
             print("\nERROR: src/config.js has a mistake … Node says:\n  " + "\n  ".join(r.stderr.splitlines()[:6]))
             sys.exit(1)
         return json.loads(r.stdout)
     ```
     Tested output: `ERROR: src/config.js has a mistake … config.js:52  nameTbc: true, ^^^^^^^ SyntaxError: Unexpected identifier 'nameTbc'` with exit code 1.

### M2. Page weight: 206 KB of inlined PNG, including one 50 KB image twice. Owners: B1 (`nav.html`, `footer.html`, `src/assets/`) and B5 (`build.py`)
- **What's wrong:**
  - `nav.html:4` uses `assets/logo.png` (493×540, 50,212 B) to draw a 33×36 mark.
  - `footer.html:6` uses `assets/logo-white.png` (493×540, 49,734 B) to draw 40×44. The hero (`hero.html:27`) uses the same file, so build.py inlines that data URI **twice**.
  - The logos are flat two-tone art, so full-colour PNG is wasteful.
- **Fix (measured in a scratch copy of the project):**
  - Re-encode `src/assets/logo-white.png` as a 32-colour palette PNG. It drops from 49,734 B to **9,317 B**, and the side-by-side on #0568F5 is visually identical (`reviews/scratch/e4-logo-quantized-cmp.png`):
    ```python
    from PIL import Image
    im = Image.open("src/assets/logo-white.png").convert("RGBA")
    im.quantize(32, method=Image.Quantize.FASTOCTREE).save("src/assets/logo-white.png", optimize=True)
    ```
  - Add `src/assets/logo-nav.png`: 66×72 (2× of 33×36), palette PNG, **1,447 B**.
  - Add `src/assets/logo-white-sm.png`: 80×88 (2× of 40×44), **1,512 B**.
  - Point `nav.html:4` at `assets/logo-nav.png`. Point `footer.html:6` at `assets/logo-white-sm.png`, which also removes the duplicate inline.
  - Replace `favicon.png`, which is 58×64 and not square, with the existing 32×32 `/home/claude/dh-site/assets/logo-32.png` (573 B). See M5.
  - **Result:** 357,688 → **169,168 B raw**, and 196,743 → **51,578 B gzip (−74%)**.
  - WebP is not worth it here: WebP q85 of the 493 px logo is 27 KB, against 9 KB for the palette PNG. An SVG would be best, so ask the client whether a vector logo exists. Until then use palette PNG.
  - B5: in `build.py` `inline_assets`, print a warning when one file is inlined more than once, e.g. `warning: assets/logo-white.png (66 KB) inlined 2× — use a smaller copy`. Count the matches in `sub()`.

### M3. TBC badges and the Solo value can't be switched off from config.js. Owners: B1 (`hero.html`), B2 (`hackathon.html`), B5 (`main.js`)
- **What's wrong:** I set every TBC flag to `false` in config and changed fee, dates and duration (`e4_tbc.py`). These still showed: hero `Tentative` (`hero.html:6`), `hk-facts` `Tentative` (`hackathon.html:19`), the fee's `To be confirmed` badge (`hackathon.html:85`), and Solo entries `To be confirmed … potentially permitted` (`hackathon.html:81`). That last one has no `data-fact`, so `soloAllowed` in config is effectively dead. The client will confirm these facts first, so the page will contradict itself.
- **Fix (patch tested; diff in `reviews/scratch/main.js.diff`):** add a `data-tbc-flag` attribute. main.js hides badges whose flag is `false` and removes `.tbc` from inline values. In `applyFacts()`, before `var S = site();`:
  ```js
  each((root || document).querySelectorAll("[data-tbc-flag]"), function (el) {
    var flag = rawGet(site(), el.getAttribute("data-tbc-flag"));
    if (flag !== false) return;
    if (el.classList.contains("tbc")) el.classList.remove("tbc");
    else el.hidden = true;
  });
  ```
  Markup changes:
  - `hero.html:6` → `<li class="badge hero-badge hero-badge--tbc" data-tbc-flag="hackathon.datesTbc">Tentative</li>`
  - `hackathon.html:19` → `<span class="badge badge--tbc" data-tbc-flag="hackathon.datesTbc">Tentative</span>`
  - `hackathon.html:81` → `<span class="hk-stat__value tbc" title="To be confirmed" data-fact="hackathon.soloText">To be confirmed</span> <span class="hk-stat__sub" data-tbc-flag="hackathon.soloTbc">potentially permitted</span>`
  - `hackathon.html:85` → `<span class="badge badge--tbc" data-tbc-flag="hackathon.fee.tbc">To be confirmed</span>`

  Re-test (`e4_tbc_patched.py`): all four now respond. Also add a one-line comment for the new attribute to main.js header §1.

### M4. config.js is not the single source of truth: 16 keys do nothing and facts are repeated as literal text. Owners: B5 (`config.js`, `main.js`), B4 (FAQ, timeline wording)
- **What's wrong:**
  - **Keys with no effect.** Editing any of these changes nothing on the page:
    - `mark` (53), `description` (55), `schoolShort` (57), `cas` (59)
    - `hackathon.daysLabel` (67), `.format` (71), `.theme` (79), `.deliverable` (80), `.donationNote` (103), `.sponsorsNote` (104), `.aiRulesTbc` (124), `.aiRulesNote` (125), `.rulebookNote` (166)
    - `programme.period` (181), `.howItRuns` (182), `.ngosEmptyText` (226)

    A student who edits `ngosEmptyText` or `donationNote` will think the site is broken.
  - **Literal duplicates that go stale.** After I changed fee, dates and duration in config, these still showed old values:
    - `faq[2].a` "Up to 4 people", `faq[4].a` "24-hour … 24–25 October 2026", `faq[6].a` "₹2,000 per team"
    - `aiRules[5]` "at most four members"
    - `logistics[2]` "HackerRank (proposed)", `logistics[4]` "24 hours (proposed)"
    - `timeline[3].when` "24–25 October 2026"

    The TBC checklist line "FAQ wording … (update by hand)" admits the problem.
- **Fix:**
  1. **`{path}` tokens in config strings** (patch tested). In main.js `toText`, run strings through:
     ```js
     function interpolate(str) {
       return str.replace(/\{([\w.]+)\}/g, function (whole, path) {
         var v = getFact(path);
         if (typeof v === "number") return fmtNumber(v);
         return (typeof v === "string" && v.indexOf("{") === -1) ? v : whole;
       });
     }
     ```
     Then rewrite the duplicates in config.js:
     - `"The working figure is {hackathon.feeText}, still to be confirmed. …"`
     - `"Up to {hackathon.teamMax} people per team. …"`
     - `"A {hackathon.durationText} build is proposed, running {hackathon.dates} (Saturday to Sunday). …"`
     - `"Your team can have at most {hackathon.teamMax} members."`
     - `{ label: "Duration", value: "{hackathon.durationText}", tbc: true }`
     - `{ label: "Submissions", value: "{hackathon.submissions}", tbc: true }`
     - `when: "{hackathon.dates}"`

     Verified: with the fee set to 1500, the FAQ renders "The working figure is ₹1,500 per team" and the rule renders "at most 5 members".
  2. **Delete the unused keys, or wire them up.** Delete `mark`, `schoolShort`, `cas`, `daysLabel`, `theme`, `deliverable`, `aiRulesTbc`, `rulebookNote` and `period`. Wire up the rest:
     - `sponsorsNote` → a second `<p data-fact="hackathon.sponsorsNote">` in the `hackathon.html:118` aside (or delete it)
     - `description` → `<meta name="description">` (M5)
     - `ngosEmptyText` → `programme.html:187` `data-fact="programme.ngosEmptyText"`
     - `donationNote` → `hackathon.html:120` `data-fact="hackathon.donationNote"`
     - `aiRulesNote` → `hackathon.html:141` `data-fact`
     - `howItRuns` → `programme.html` lead
     - `format` → `hackathon.html:25` `data-fact="hackathon.format"`
  3. B5: add a "Keys that are only used by build.py" note to the config.js header, covering `name`, `tagline`, `description` and `siteUrl`.

### M5. No sharing or SEO layer. Owners: B1 (`head.html`), B5 (`build.py`, `config.js`)
- **What's wrong:**
  - **`<title>` and `og:title` hard-code "DH 2026".** That breaks BRIEF §2's "never hard-code the name in more than one place". JS later changes `document.title`, but crawlers and WhatsApp see `<title>DH 2026</title>`.
  - **`<meta name="description">` hard-codes "24–25 October 2026".**
  - **The following are missing:**
    - `og:image`: WhatsApp and Instagram are the main share channels for a Mumbai school event, and a link without an image gets far fewer taps.
    - `og:url`, `rel=canonical`, `twitter:card`, `og:locale`, `og:site_name`
    - `apple-touch-icon`, `color-scheme`
    - Event structured data
  - **The favicon is 58×64, not square,** so browsers squash or letterbox it.
- **Fix (patched head in `reviews/scratch/head.patched.html`; build changes in `build.py.diff`):**
  - `head.html` uses `{{path|default}}` placeholders that build.py fills from `load_site()`, HTML-escaped:
    ```html
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Unbounded:wght@500..800&amp;family=Manrope:wght@400..800&amp;display=swap">
    <title>{{name|DH 2026}} — {{tagline|AI-enabled social-impact hackathon}}</title>
    <meta name="description" content="{{description|…}}">
    <meta name="theme-color" content="#0568F5">
    <meta name="color-scheme" content="light dark">
    <link rel="icon" href="assets/favicon.png" type="image/png" sizes="32x32">
    <link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="{{name|DH 2026}}">
    <meta property="og:title" content="{{name|DH 2026}} — {{tagline|AI-enabled social-impact hackathon}}">
    <meta property="og:description" content="{{description|…}}">
    <meta property="og:locale" content="en_IN">
    <meta name="twitter:card" content="summary_large_image">
    ```
  - Add `siteUrl: ""` to config.js, commented "full public address once hosting is decided, e.g. https://<user>.github.io/dh-2026". When it is set, build.py's `share_tags()` adds `canonical`, `og:url`, `og:image` (`{siteUrl}/assets/og-image.png`, 1200×630) and `og:image:width/height`. When it is empty, build.py warns instead. Absolute URLs can't be invented before hosting, so this mechanism is the deliverable now.
  - **JSON-LD `Event`, generated from config** so it can't drift (`event_jsonld()` in the diff):
    - `@type: Event`, `startDate`/`endDate` from `hackathon.start`/`end`
    - `eventAttendanceMode: OnlineEventAttendanceMode`, `eventStatus: EventScheduled`
    - `location: VirtualLocation`, using the Discord URL or `siteUrl`
    - `organizer` = school, `inLanguage: en-IN`
    - `offers` (price + INR) **only** when `fee.tbc === false` and `registerUrl` is a real URL, so we never publish an unconfirmed price to Google.

    Tested output passes vnu.
  - Assets:
    - Copy `/home/claude/dh-site/assets/logo-180.png` (180×180, white background, 3,492 B) to `src/assets/apple-touch-icon.png`.
    - Copy `/home/claude/dh-site/assets/logo-32.png` to `src/assets/favicon.png`.
    - A draft 1200×630 `og-image.png` is in `reviews/scratch/og-image-draft.png`. Regenerate it with `reviews/scratch/make_og_image.py "<final name>"` once the name is voted on.
  - `og:image` only works as a real file at an absolute URL, not as a data URI, which is one more reason for M6's multi-file output.

### M6. The repo is not deploy-safe: a stale site sits at the root and DEPLOY.md describes a different codebase. Owner: B5
- **What's wrong:**
  - `/home/claude/dh-site/index.html` (657 KB, `<title>DH Hackathon 2026</title>`) and `/artifact.html` are outputs of an **earlier build**. So are `build/`, `qa/` and `versions/`.
  - GitHub Pages' "Deploy from a branch" can only serve `/` or `/docs`, **not `/dist`**. Pointing it at the repo root would publish the **old site**.
  - `/home/claude/dh-site/DEPLOY.md` tells the student to edit `build/sections/*.html`, `cta.html`, `qa/shoot.py` and `build.py --check/--force`. None of these exist in the current pipeline.
  - `/docs` is already taken by the brief.
- **Fix:**
  1. Move the stale root outputs (`index.html`, `artifact.html`, `build/`, `qa/`, `versions/`, `review/`, `feedback/`, `brief/`) into `_archive/`, or delete them after the client confirms.
  2. Add the multi-file output `dist/site/`, which is `index.html` + `assets/` + `robots.txt` (+ `sitemap.xml` when `siteUrl` is set). This is `write_multifile()` in `build.py.diff`, tested: the HTML is 153 KB before image fixes and passes vnu. **Recommendation:** keep `dist/index.html` (single file) for artifact previews and emailing, and make **`dist/site/` the deploy target**. Only a multi-file build can serve `og:image`, `apple-touch-icon`, `robots.txt` and self-hosted fonts, and it lets the browser cache images apart from the HTML.
  3. Add `.github/workflows/pages.yml`. It builds on GitHub, so Node is present and M1's config check always runs:
     ```yaml
     name: Deploy site
     on: { push: { branches: [main] }, workflow_dispatch: {} }
     permissions: { contents: read, pages: write, id-token: write }
     concurrency: { group: pages, cancel-in-progress: true }
     jobs:
       deploy:
         runs-on: ubuntu-latest
         environment: { name: github-pages, url: "${{ steps.d.outputs.page_url }}" }
         steps:
           - uses: actions/checkout@v4
           - uses: actions/setup-node@v4
             with: { node-version: 22 }
           - run: python3 build.py
           - uses: actions/upload-pages-artifact@v3
             with: { path: dist/site }
           - id: d
             uses: actions/deploy-pages@v4
     ```
     Netlify: add `netlify.toml` with `[build]` `command = "python3 build.py"` and `publish = "dist/site"`. Vercel: add `vercel.json` with `{"buildCommand": "python3 build.py", "outputDirectory": "dist/site"}`. If Python isn't available in Vercel's build image, commit `dist/site` and use "Other" with no build command.
  4. Rewrite DEPLOY.md for this pipeline:
     - Edit `src/config.js`, then run `python3 build.py`.
     - Upload `dist/site/`, or push and let the workflow deploy.
     - Set `siteUrl` once the URL is known.
     - Never upload the repo root.

### M7. The base list reset beats every section's list styles, so the About meta rows and Timeline spacing are dead. Owner: B1. File: `base.css:84`
- **What's wrong:** `ul[class],ol[class]{list-style:none;padding:0;margin:0}` has specificity (0,1,1), which beats single-class section rules (0,1,0). This contradicts the file's own header ("Selectors are kept flat … so section CSS loaded after this file can override").
  - In the computed styles, `.ab-meta{margin:auto 0 0;padding:16px 0 0}` (about.css:51–54) is fully overridden. The rule above each meta row sits flush on the text, and the two panes' meta rows don't align. See before/after in `reviews/scratch/ab-split-compare.png`.
  - `.tl-list{margin:clamp(32px,5vw,56px) 0 0}` (timeline.css:4) is dead too.
  - `#programme .pg-topic-list` only survives because it uses an ID.
- **Fix:** `base.css:84` → `:where(ul,ol)[class]{list-style:none;padding:0;margin:0}` (specificity 0). Then re-check the About and Timeline spacing, now that the authored values take effect.

---

## 3. Should fix

### S1. The hero canvas costs too much CPU and never stops. Owner: B1. File: `hero.js`
- **What's wrong:**
  - Every frame re-strokes the full trace geometry. That is up to 120 traces, each drawn **twice** for the wrap, plus about 4 arcs each and up to 150 `fillText`s, at 30 fps, forever.
  - Measured: 24% of a core on desktop and 89% at 360 px with DPR 2 and 4× throttle. Software raster, so read these relatively.
  - BRIEF §3 allows "one orchestrated page-load animation", and this is a perpetual one.
  - `t.drift` (hero.js:42) is computed but never used.
- **Fix:**
  1. **Draw the static traces once onto an offscreen canvas** in `build()`. `render()` then does 2× `drawImage(layer, 0, oy)` plus only the pulse dots. Full tested diff: `reviews/scratch/hero.js.diff`. Measured CPU 24.3% → **12.8%** on desktop and 89% → **63%** on mobile; median frame cost 2.0 → 1.3 ms; the output looks identical (`reviews/scratch/hero-cmp.png`).
  2. **Let it settle.** Add `var SETTLE_MS = 12000, startedAt = 0;`, set `startedAt = performance.now()` in `start()`, and in `frame()` add `if (now - startedAt > SETTLE_MS) { stop(); staticFrame(); return; }`. That makes ongoing CPU zero after the intro. It can resume on `pointermove` over the hero if you want it to feel alive.
  3. Use `dpr = Math.min(devicePixelRatio || 1, W < 700 ? 1.5 : 2)`. That is 44% fewer pixels on phones, and the traces are 1.2 px hairlines at 7–20% alpha.
  4. Delete `drift`.

### S2. The static fallbacks don't match config, and the FAQ contradicts itself. Owners: B2 (`hackathon.html`), B3 (`programme.html`), B4 (`faq.html`)
- **What's wrong:** I compared the no-JS page with the JS-rendered page (`e4_robust.py`, `fallback_vs_config_drift`):
  - aiRules: 8/8 items differ
  - flow: 7/7
  - topics: 6/6
  - logistics: 5 static vs 7 config
  - judging: 3/4
  - divisions: 2/2

  No-JS visitors, link-preview scrapers, and phones that paint before main.js runs see different copy. At 4× CPU, FCP is 148 ms but DOMContentLoaded is 802 ms, so static text is visible first. Worse, static `faq.html:69` says "we'll confirm whether any are required", while config `faq[8].a` says "No. … they are not required".
- **Fix:** make each fallback item a copy of the config text, character for character. Delete fallback items beyond what config has, or add them to config. For the FAQ, decide the Q9 answer with the client and use the same text in both files.
- Better, B5 can make this permanent: after `load_site()`, warn in build.py when a `data-fact` element's static text ≠ `toText(config value)`. Optionally, prerender `dist/site/index.html` with Playwright (already a dev dependency of shoot.py) when it is installed, so static always equals config.

### S3. Countdown fallback and edge cases. Owners: B1 (`hero.html:19–22`), B5 (`main.js` `tickCountdowns`)
- **What's wrong:**
  - The static fallback "17 / 00 / 00 / 00" is already wrong today: it is 16 days, 21 hours.
  - If `hackathon.start` is mistyped (for example `"24 Oct 2026 9am IST"`), the box keeps showing "17 00 00 00" forever with no `data-state`. That case was tested.
  - `setInterval(…,1000)` ticks at a fixed offset from page load (measured: about 41 ms past each wall-clock second), so the seconds change unevenly.
- **Fix:**
  - Static `<dd data-cd="…">–</dd>` for all four cells.
  - In `tickCountdowns`, `if (isNaN(target)) { box.hidden = true; console.warn(...); return; } box.hidden = false;`. Tested: the countdown hides on a bogus date.
  - Replace `setInterval` with an aligned `setTimeout`, and call `tickCountdowns()` on `visibilitychange` so a returning tab updates at once:
    ```js
    function schedule(){ cdTimer = setTimeout(function(){ tickCountdowns(); if (cdTimer) schedule(); }, 1000 - (Date.now() % 1000) + 15); }
    ```
    `stopCountdown` must use `clearTimeout`.

### S4. Pending links are styled in the wrong file and unstyled outside the Register band. Owners: B1 (`base.css`), B4 (`register.css:112–133`)
- **What's wrong:**
  - `.btn.is-pending` is a site-wide rule living in register.css (B4).
  - `.btn-soon` has **no CSS at all**.
  - Footer pending links render as plain live-looking text: "Instagram Opens soon", "Join the Discord Opens soon" (`reviews/scratch/footer-360.png`).
  - vnu flags `aria-disabled="true"` on `<a href>` 7 times after JS runs.
- **Fix:**
  - Move lines 112–132 to base.css §5.
  - Add `.btn-soon{font-size:.8em;font-weight:600;opacity:.75}` and `.is-pending:not(.btn){opacity:.6;cursor:default;text-decoration:none}`.
  - In main.js `applyHrefs`, for the pending branch use `a.removeAttribute("href")` instead of `aria-disabled`. An `<a>` without `href` is a non-interactive placeholder; restore it from `__dhOrigHref` when a URL arrives. Then drop the `onPendingClick` listener.

### S5. ID-selector specificity war in programme.css. Owner: B3. File: `programme.css` (76 `#programme` selectors)
- **What's wrong:**
  - `#programme .pg-glance dt, #programme .pg-glance dd{margin:0}` (lines 36–37, specificity 1,1,1) beats `#programme .pg-glance__value`, which is why lines 40 and 47 need `margin-top:… !important`.
  - No other section uses ID scoping. The `.pg-` prefix already scopes everything.
- **Fix:**
  - Find/replace `#programme .pg-` → `.pg-`.
  - Keep `#programme{--pg-accent…}` (lines 6–13).
  - Change lines 36–37 to `.pg-glance :where(dt,dd){margin:0}`.
  - Remove both `!important`.

### S6. Fonts: the ₹ sign downloads 133 KB of extra font, and the URL is malformed. Owner: B1. File: `head.html:5`
- **What's wrong:**
  - Google's latin-ext range includes U+20AD–20C0, so every "₹" pulls a second subset. That is Unbounded latin-ext, **118 KB** (`.hk-stat__value` is in the display font), plus Manrope latin-ext, 15 KB. This is more than the whole optimised page.
  - The unescaped `&` gives 2 html5lib parse errors.
  - The weight list `500;600;700;800` is better written as a range for these variable fonts.
- **Fix:**
  - Now: use `&amp;` and the `wght@500..800` / `wght@400..800` range syntax (in the M5 head).
  - In `dist/site`: self-host `unbounded-latin` (51 KB) + `manrope-latin` (25 KB) woff2 with `<link rel="preload" as="font" type="font/woff2" crossorigin>`. Add ₹-only subsets: `pyftsubset … --unicodes=U+20B9` is **1,036 B / 1,084 B** each, declared with `unicode-range:U+20B9`. That removes two third-party origins, the render-blocking cross-origin CSS and the 133 KB.
  - Keep `font-display:swap`. CLS with late fonts is already ≤0.036.

### S7. build.py hardening. Owner: B5. File: `build.py`
- **What's wrong:**
  - `ASSET_REF` only matches `.png`. A student who adds `photo.jpg`, `logo.svg` or `og.webp` gets a broken image in the single-file build and no warning.
  - Ownership comments ship to production (`<!-- About — owner B4 — prefix ab- -->` and programme.html's 10-line internal block), because only `<!-- dev:` comments are stripped.
  - The build always exits 0.
- **Fix:**
  - `ASSET_REF = re.compile(r"(?<![\w/.-])(?:\./)?assets/([\w.-]+\.(?:png|jpe?g|webp|svg|ico))")`, with the MIME type from `mimetypes.guess_type`.
  - Warn on any leftover `assets/` reference after inlining.
  - Strip all HTML comments outside `<script>`/`<style>`, or rename section headers to `<!-- dev: … -->`.
  - Add `--strict`, which returns 1 when there are warnings, for CI.

### S8. The mobile menu is unreachable without JS. Owner: B1. Files: `base.css:272–291`, `head.html`
- **What's wrong:** under 900 px, `.site-nav__menu{display:none}` can only be undone by JS. With JS off, or with M1's failure, the six anchors and the CTA can't be reached from the header.
- **Fix:**
  - Add `<script>document.documentElement.classList.add('js')</script>` as the first line of head.html.
  - Wrap the hide rule so it only applies with JS: `.js .site-nav__menu{display:none}` inside the media query.
  - Without JS, show the links as a wrapped row under the brand.

---

## 4. Nice to have

1. **B1, `hero.js`:**
   - Guard against double execution (artifact hot reload): `if (window.__dhHero) return; window.__dhHero = true;`.
   - `document.fonts.ready.then(rebuild)` re-randomises every trace, giving a visible jump about 300 ms in. Keep the traces and only re-measure the digits.
2. **B1, `head.html`:** `<html lang="en-IN">` (build.py line `'<html lang="en">'`), plus `<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#061531">`.
3. **B1, `base.css` / `hackathon.css`:**
   - 21 media queries over 17 widths (639/640, 559/560, 760/780/800, 860/899/900, 960/1000). Standardise on 560 / 760 / 900 / 1200.
   - 19 different `rgba(255,255,255,α)` literals. Replace them with 3 tokens: `--on-dark-line:rgba(255,255,255,.24)`, `--on-dark-muted:rgba(255,255,255,.78)`, `--on-dark-fill:rgba(255,255,255,.12)`.
4. **Dead or duplicate rules:**
   - `about.css:2` `#about .section-head{margin-bottom:…}` repeats base.css exactly.
   - `hackathon.css:67` `border-color` on `.tbc`, which has no border.
   - `faq.css:9` `top:96px` → `top:calc(var(--nav-h) + 24px)`.
5. **B5, `config.js` timeline:** add an optional `date: "2026-10-24"` per item and let main.js derive `done/next/later`, so "Now" doesn't go stale after 25 Oct.
6. **B5, `dist/site`:**
   - `loading="lazy" decoding="async"` on the footer logo and `fetchpriority="high"` on the hero logo. Only meaningful once assets are files.
   - A Netlify `_headers` file with `Cache-Control: public, max-age=86400` for `/assets/*`.
   - Note for later: a CSP will need `'unsafe-inline'` for scripts and styles, or a hash per script block (easy once M1 splits them).
7. **B5, `main.js`:** document that config strings render as text, not HTML (tested: `<a>` in an FAQ answer is escaped, which is safe). If links in answers are wanted, support a `link: {text, url}` field rather than HTML.

---

## 5. What's working (keep these)

- **The markup is valid.** vnu reports 0 errors before and after JS. Ids are unique, all ARIA references resolve, `<template data-item>` sits legally inside `<ul>`, `<dl>` uses `<div>` groups, and image `width`/`height` attributes prevent layout shift.
- **main.js is defensive.** Every renderer is wrapped, values go in via `textContent` only, listeners are bound once (`__dhBound` guards), and 12 malformed-config scenarios threw nothing. Keep the `safe()`/`each()` pattern and the header docs. Of everything in `src/`, they are the clearest to a non-developer.
- **Layout stays stable.** CLS is ≤0.036 even with fonts delayed 1.5 s, thanks to tabular-nums on the countdown, a fixed-ratio hero image and `display=swap` with close fallbacks.
- **The canvas is already a good citizen in most ways.** It pauses off-screen (0.3% CPU) and in hidden tabs, draws a static frame under reduced motion, caps DPR at 2 and debounces resizes. S1 builds on this; don't remove it.
- **The section CSS is scoped and uses tokens.** Section prefixes (`.hk-`, `.tl-`, `.fq-`, `.rg-`…), no global element styling outside base.css, and only the logo images as external assets. The fonts are the only third-party requests.
- **config.js has a strong header.** The "how values are used" notes and the TBC checklist make it a good basis for student editing, once M3 and M4 make every key actually do something.
