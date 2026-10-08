# E4 — Code quality, performance & hosting readiness (round 2, semi-final)

**Measured on 7 Oct, after my edits.** `python3 build.py --strict` gives one warning, `siteUrl` (expected). `python3 shoot.py` reports no overflow and no console errors at any of the 6 sizes, and `siteFolderOk: true`. Nu validator: 0 errors on `dist/index.html`, `dist/site/index.html` and the page after JS runs. html5lib: 0 parse errors (was 2). `node --check` passes on all 3 sources and on all 4 shipped `<script>` blocks.

| Metric | Round 1 | Before my round-2 edits | **Now** |
|---|---|---|---|
| `dist/index.html` (single file) raw / gzip | 357,688 / 196,743 B | 201,134 / 63,108 B | **163,658 / 48,272 B** (target ≤180 KB met) |
| `dist/site/index.html` (deploy folder) raw / gzip | n/a | 178,013 / 44,250 B | **148,925 / 35,587 B** |
| Font bytes, `dist/site` | Google: about 76 KB latin + **133 KB latin-ext** just for "₹" | same | **76 KB + 1 KB ₹ subset, self-hosted, preloaded, 0 third-party requests** |
| Hero canvas CPU, 1440 desktop (software raster) | 24–39% | 10.2% | **10.2% for the first 15 s, then 0.3%** |
| Hero canvas CPU, 360 / DPR 2 / 4× throttle | 83–89% | 39.9% | **42.7% for the first 15 s, then 1.3%** |
| CLS (1440 / 360) | 0.016 / 0 | 0.004 / 0 | **0.004 / 0** |
| One missing comma in config.js | Page broken (menu, countdown, canvas); build "0 warnings" | Fixed | **Build stops with Node's line number and exits 1.** If a broken config ships anyway, the menu still opens, the countdown still runs and the canvas still draws (re-tested) |
| Broken or partial config (12 cases) | 0 exceptions | — | **0 exceptions.** A bad `start` date hides the countdown and logs a warning |
| No-JS text vs config text, list items | 40 of 54 differ | — | **0 of 57 differ** |

## 1. Verification of my round-1 items

| ID | Item | Status | Evidence |
|---|---|---|---|
| M1 | A config typo breaks every script; the build doesn't notice | **Fixed** | One `<script>` per file. `node --check` on each, plus the config is loaded with Node, and either failure stops the build. Re-tested in a scratch copy: exit 1 with `config.js:65 SyntaxError: Unexpected identifier 'nameTbc'`. Runtime test on a deliberately broken config: menu opens, countdown runs, canvas draws. |
| M2 | Page weight (206 KB of PNG, logo inlined twice) | **Fixed** | Each image is inlined once (`logo-nav` 1.4 KB, `logo-white-sm` 8.5 KB via the `--logo-white` CSS variable, `favicon-32`). With my slimming the single file is 163.7 KB raw / 48 KB gzip. |
| M3 | TBC badges and the Solo value can't be switched off from config | **Fixed** | With every flag set to false, only the per-item `tbc: true` markers remain: divisions, prizes, the hardware topic and 6 FAQ answers. That is correct; those are item-level flags. |
| M4 | Config keys that do nothing; facts repeated as literal text | **Fixed** | Every config key is now referenced by markup, main.js or build.py. `{path}` tokens are in use (`{hackathon.feeText}`, `{hackathon.teamMax}`, …). |
| M5 | No SEO or sharing tags | **Fixed** (only `siteUrl` is waiting on the client) | `head.html` placeholders are filled from config. Added: `color-scheme`, light and dark `theme-color`, a square 32 px favicon, apple-touch-icon, `og:*` and `twitter:card` tags, and schema.org `Event` data generated from config. That data publishes no price until the fee is confirmed and registration is open. `canonical`, `og:url`, `og:image`, `robots` and `sitemap` switch on when `siteUrl` is set. |
| M6 | Repo not deploy-safe | **Fixed** | The old site is in `_archive-oct6/`. DEPLOY.md is rewritten for this codebase. Builds go to `dist/site/`. I added real `.github/workflows/deploy.yml` and `netlify.toml` files. |
| M7 | Base list reset beats every section's list styles | **Fixed** | `:where(ul,ol)[class]`. `.ab-meta` now gets its `margin-top:auto` (54 px in the shorter pane) and its 16 px top padding. |
| S1 | Hero canvas CPU | **Fixed** | Traces are drawn once off-screen and the animation stops after 15 s. I also fixed a re-randomise-on-load bug (below). |
| S2 | Static fallbacks don't match config | **Fixed** | 0 of 57 list items differ. build.py also warns when a `data-fact` fallback drifts. |
| S3 | Countdown fallback and edge cases | **Fixed** | No-JS fallback is "–". A bad date hides the countdown. Ticks are aligned to the second (once a minute under reduced motion) and refresh when the tab returns. |
| S4 | Pending links | **Fixed** | Pending links are `hidden`, there is no `aria-disabled` on links (0 Nu warnings) and there are no faded buttons. |
| S5 | `#programme` specificity war | **Fixed** | Only the custom-property blocks still use `#programme`, and programme.css has 0 `!important`. ⚠ There is a **new** `!important` at `hackathon.css:157` (`.hk-prizes__sponsors{margin-top:6px !important}`); see F3. |
| S6 | Fonts: ₹ pulls 133 KB; malformed URL | **Fixed for the deploy folder; partly for the single file** | `&amp;` and the weight-range syntax are in. `dist/site` now serves its own fonts (my change). The single-file preview still uses Google Fonts, so it still fetches latin-ext the first time a ₹ is shown. That's acceptable for a preview file. |
| S7 | build.py hardening | **Fixed** | Supports png/jpg/webp/svg/ico/gif, warns on duplicate inlining and leftover references, strips comments, and has `--strict`. |
| S8 | Mobile menu unreachable without JS | **Fixed** | The `.js` class is set in `<head>`. At 360 px with JS off, the links are visible and the menu toggle is hidden. |

## 2. Changes I made (E4 scope)

| File | Change | Why |
|---|---|---|
| `build.py` | **Output slimming.** `slim_css()` removes CSS comments (tokenised, so nothing inside strings is touched) and indentation. `slim_js()` removes whole-line `/* */` blocks and indentation. Indentation is left alone if the file contains a backtick, and the slimmed JS is re-checked with `node --check`; if that fails, the original text ships with a warning. Each script carries a `src/<file>` pointer. | 201 → 164 KB, meeting D5's ≤180 KB target. The commented sources in `src/` are untouched. |
| `build.py` | **Self-hosted fonts in `dist/site`** (`self_host_fonts()`). The Google Fonts link becomes two preloaded latin woff2 files from `.fonts/` plus a ~1 KB ₹-only subset per family, made with fontTools. If `.fonts/` or fontTools is missing it keeps Google Fonts and prints a note. Verified over HTTP: 0 third-party requests, all faces load, 0 console errors. | Removes the render-blocking cross-origin stylesheet, two connections, and 133 KB of latin-ext downloaded for one glyph. The only character on the page outside the latin range is ₹, which I checked. |
| `build.py` | `dist/site/assets` now gets **only the files the page references**, plus `og-image.png`. Previously it also copied unused files: 100 KB of master PNGs and the 58×64 favicon. | Smaller, cleaner deploy folder. |
| `build.py` | Removed the data-URI `apple-touch-icon` from the single-file builds. | It was 7.4 KB of dead weight there. `dist/site` keeps it as a real file. |
| `build.py` | `check_logo_copies()` warns when `logo.png` or `logo-white.png` is newer than its small copy. | A student replacing the logo would otherwise ship the old small copies. |
| `src/hero.js` | `rt/lastW/lastH` were declared *after* the first `build()`, so their `= 0` initialisers wiped the values `measure()` had just set. Moved the declaration up. | Bookkeeping fix. |
| `src/hero.js` | `build(keepTraces)`: when only the height changes (web fonts swapping in changed the hero from 752 to 721 px about 0.4 s after load), re-draw the existing traces instead of re-randomising them. | Stops the circuit field visibly jumping during the entrance animation. |
| `src/hero.js` | `dpr =Math.min` → `dpr = Math.min`. | Tidy. |
| `shoot.py` | New `check_site()`. It serves `dist/site/` over local HTTP and loads it once, reporting console errors, failed asset or font requests (status 400+) and third-party requests into `report["site"]` and `summary.siteFolderOk`. | Before this, nothing tested the deploy folder, only the single-file preview. |
| `DEPLOY.md` | Added the `npm ci --prefix .fonts` step, and `actions/setup-python@v5` in the workflow (Ubuntu 24.04's system Python can refuse `pip install`). Noted that the workflow and `netlify.toml` are now already in the repo. Added a one-line Pillow command to regenerate `logo-nav.png` / `logo-white-sm.png` after a logo change. | Hosting readiness for a non-developer. |
| **new** `.github/workflows/deploy.yml`, `netlify.toml` | The exact files DEPLOY.md describes; YAML and TOML both parse. | Push and it deploys, with no copy-pasting from the docs. |

I did not change `head.html` or `main.js`. Both already met my round-1 items: head placeholders, `.js` class and font URL are done, and main.js code review plus the 12-case robustness run found no defects.

## 3. Final feedback for the lead (outside my scope or needs a decision)

1. **F1 — Hero logo is soft on high-density screens (owner: B1/E1; asset swap only).**
   - `logo-white-sm.png` is 329×360 but is drawn at up to **300×329 CSS px** (measured at 1440 and 1920). On a 2× MacBook or phone that is about 1.1 source pixels per CSS pixel, so it renders blurry.
   - Fix: regenerate it from the 493×540 master as a 32-colour palette PNG: `python3 -c "from PIL import Image as I; I.open('src/assets/logo-white.png').convert('RGBA').quantize(32, method=I.Quantize.FASTOCTREE).save('src/assets/logo-white-sm.png', optimize=True)"`.
   - Cost: 8.5 KB → 9.3 KB (+0.8 KB). It's still inlined once via `--logo-white`.
2. **F2 — Before the first push, keep the archive and scratch out of the repo (owner: lead).**
   - `_archive-oct6/` holds the old 657 KB site plus `node_modules` (a vnu-jar copy). Delete it, or add `.gitignore` entries for `_archive-oct6/`, `reviews/scratch/`, `dist/` and `.fonts/node_modules/`.
   - If `dist/` is ignored, use the GitHub Actions or Netlify route; DEPLOY.md's Vercel fallback is the one route that needs `dist/site` committed.
3. **F3 — New `!important` (owner: E1/B2).** `hackathon.css:157` `.hk-prizes__sponsors{margin-top:6px !important}`. It is presumably fighting `.hk-prizes__note p{margin:0}`. Use `.hk-prizes__note .hk-prizes__sponsors{margin-top:6px}` instead.
4. **F4 — `siteUrl` (client).** Until it is set, WhatsApp and Instagram link previews show no image and there is no canonical link. It is one line in config.js and the build does the rest. **After the project name is voted on**, rebuild so `og-image.png` regenerates (it's cached by name, tagline and logo).
5. **F5 — Note, no action needed.** The single-file `dist/index.html` keeps Google Fonts on purpose: it must work as a file opened from disk or email. Its first ₹ costs about 133 KB of latin-ext font; the deploy folder does not have this cost.

## 4. Provisional scores (my lens)

| Component | Score | Note |
|---|---|---|
| Nav | 9 | 1.4 KB logo; works without JS; survives a broken config |
| Hero | 8 | Canvas settles to ~0% CPU; stable countdown; logo soft on 2× screens (F1) |
| About | 9 | Reset fix landed; panes align |
| Hackathon | 8 | Single source of truth works; one stray `!important` (F3) |
| Programme | 9 | Clean selectors; config-driven empty state |
| Timeline | 9 | Rendered from config; tentative date follows `datesTbc` |
| Team | 9 | — |
| FAQ | 9 | Token-driven answers; 0 drift |
| Register | 9 | No dead or faded buttons; state driven by config |
| Footer | 9 | Pending links hidden; one shared logo image |
| **E4 overall** | **8.5** | Ready to host as a static site. The remaining gaps are client inputs (`siteUrl`, name) and the 0.8 KB logo swap. |
