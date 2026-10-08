# E3 — UX, responsiveness & accessibility (round 1)

Method: Playwright/Chromium against `dist/index.html` (rebuilt with `build.py`). Fonts were served locally with `shoot.py`'s `route_fonts`. I tested 360, 390, 768, 1024, 1280 and 1440 wide, in light and dark, plus 320 and 900/960 as spot checks. Scripts are in `reviews/scratch/e3_*.py`. The raw contrast data is in `reviews/scratch/contrast-{390,1280}-{light,dark}.json`.

How contrast was measured: I hid all text with `color:transparent`, took a full-page screenshot and sampled the real background pixels under every text run, including gradients, canvas and opacity. The computed text colour × cumulative opacity was composited over each pixel. The reported ratio is the **5th-percentile worst** pixel, with the median in brackets. The thresholds are WCAG 2.x AA: 4.5:1 for normal text, and 3:1 for text ≥24px, or ≥18.66px at weight 700+.

## 1. Scores

| Component | Score | One-line reason |
|---|---|---|
| Nav | 6 | Solid toggle semantics and Escape handling. But there is no skip link, the menu doesn't close when you tap outside or tab out, and the primary CTA text drops to 3.70:1. |
| Hero | 6 | Static canvas under reduced motion and a correct `role="timer"`. But the countdown labels are 2.65–3.16:1, the focus ring on the gradient is 1.65–2.45:1, and the main CTA leads to a dead end. |
| About | 8 | No contrast failures and a clean outline. |
| Hackathon | 6 | The "At a glance" band fails (3.18–3.82:1). The division grades are 4.33:1 (light) and 2.80:1 (dark). The pending ghost button overflows at 320px. |
| Programme | 7 | Only the "Hackathon prep" badge fails (4.33:1). The NGO empty state is good. |
| Timeline | 6 | In dark mode, "Done" is 2.80:1 and the dates are 3.33:1. The "Now: registration opens" item contradicts every CTA. |
| Team | 8 | Nothing blocking. |
| FAQ | 7 | Native `<details>` and good keyboard behaviour. The single-open logic makes the list jump 106px at desktop. |
| Register | 4 | Every action is disabled and the contact shows the literal "TBC", so a visitor has nothing they can do today. The fee line is 4.09:1. |
| Footer | 6 | "TBC" is printed as the contact. Pending links look live. Link targets are 18–21px tall. |
| **UX/a11y overall** | **5** | Responsive layout is excellent: no horizontal scroll at any tested width from 360 to 1440, in either theme. However, the primary CTA path dead-ends, about 30 text runs per view fail AA (mostly text on the bright end of `--grad`), and keyboard support is missing a skip link and a 3:1 focus ring. |

Measurements that pass, so you can stop worrying about them:
- **Horizontal scroll:** `scrollWidth === innerWidth` at all 12 width/theme combinations, with no offenders.
- **Anchor offset:** every nav anchor lands with the section top at 84px, under a nav whose bottom is at 73px. The h2 sits at 148px (mobile) or 204px (desktop). `scroll-padding-top` works.
- **Heading outline:** h1 → h2 ×8 → h3 → h4 with no skipped levels.
- **Landmarks:** banner, nav "Main", main#main, contentinfo and nav "Footer" are all present. `lang="en"` is set, there are no duplicate ids, and the logo alt text is good.
- **Reduced motion:** the canvas hash is identical across 1.4s and the canvas is not blank (67k painted pixels). `.hero-rise` has `animation:none` and `scroll-behavior:auto`.
- **Countdown:** `role="timer"` has implicit `aria-live="off"`, so screen readers are not spammed. The accessible tree reads "timer: Time until the hackathon opens — days 16, hours 21 …".
- **Mobile menu:** the toggle is 44×44 with name "Menu", `aria-expanded` and `aria-controls`. Escape closes it and returns focus to the toggle. Menu links are 358×55px, and tapping a link closes the menu.
- **FAQ keyboard:** Space and Enter toggle each item. Summaries are 68–88px tall.

## 2. Must fix (blocking)

**M1. Primary buttons and the "At a glance" band: white text on the bright end of `--grad` fails AA.**
- Owner and file: B1 `src/base.css`; B2 `src/hackathon.css`.
- Problem: `--grad` ends at `#4D9BFF`, and white on `#4D9BFF` is 2.82:1. Measured results:
  - `.btn--primary` labels: 3.70:1 for nav "Register your team" and 3.74:1 for `.hk-teams__actions .btn--primary`. These are 16px/700, which is not large text.
  - `.hk-fact dt` (`opacity:.84`): 3.18:1.
  - `.hk-fact__sub` (`opacity:.9`): 3.26:1 at 1280 and 3.82:1 at 390.
  - The `.hk-facts .badge--tbc` "Tentative" badge: 3.92:1.
  - Lowering opacity can't fix this, because even pure white on `#2d84fb` is only 3.62:1.
- Fix:
  - Add a text-safe gradient token in `base.css` §1: `--grad-ui:linear-gradient(135deg,var(--blue-deep) 0%,var(--blue) 100%);`. Its worst stop gives white 4.88:1, and it is still a gradient of #0568F5.
  - Line 148: `.btn--primary{background:var(--grad-ui);…}`.
  - `hackathon.css` line 24: `.hk-facts{background:var(--grad-ui)}`.
  - Raise `.hk-fact dt` (line 47) and `.hk-fact__sub` (line 58) to `opacity:1`.
  - Keep `--grad` for the hero and other text-free fills.

**M2. Focus ring is below 3:1 on light surfaces and almost invisible on blue surfaces.**
- Owner and file: B1 `src/base.css` line 90.
- Problem: the ring is `#4D9BFF`. Measured against the surrounding background:
  - White and ice: 2.45–2.82:1, for every light-mode stop.
  - Hero buttons: 1.65–2.45:1. "Explore the programme" is 1.65:1 at 390.
  - Register band buttons: 2.45–2.87:1.
  - Dark mode is fine (5.6–6.4:1), apart from the same hero and register-band problem.
- Fix:
  - Line 90: `:focus-visible{outline:3px solid var(--blue);outline-offset:3px}` gives 4.88:1 on white and 4.33:1 on ice.
  - Add `.on-dark :focus-visible,.on-dark:focus-visible,.rg-band :focus-visible,.hk-facts :focus-visible,.site-footer :focus-visible{outline-color:#fff}`.
  - Keep `--blue-bright` in the two dark-theme blocks by adding a `--focus` token: light `var(--blue)`, dark `var(--blue-bright)`.

**M3. There is no skip link.**
- Owner and file: B1 `src/nav.html` and `src/base.css`.
- Problem: a keyboard user tabs through 8 stops at desktop (brand, 6 links, CTA) before reaching the hero. There is no "Skip to content", even though `build.py` already wraps the content in `<main id="main">`.
- Fix:
  - Make the first line of `nav.html` `<a class="skip-link" href="#main">Skip to content</a>`, before the `<header>`.
  - In `base.css`: `.skip-link{position:absolute;left:12px;top:-60px;z-index:100;padding:10px 16px;border-radius:var(--radius-sm);background:var(--blue-ink);color:#fff;font-weight:700;text-decoration:none}.skip-link:focus{top:12px}`.
  - Add `tabindex="-1"` to `main` in `build.py` line 137 so focus lands there in Safari (owner B5).

**M4. Every route to "register" or "contact us" ends at a disabled button or the literal "TBC".**
- Owner and files: B5 `src/main.js` (`applyHrefs`, lines 218–261) and `src/config.js` (lines 170, 243–244, 265–268); B4 `src/register.html` and `register.css` (lines 112–132); B1 `src/footer.html` (lines 26–28).
- What a real visitor experiences today:
  1. Hero, nav and hackathon "Register your team" all look live and jump to `#register`.
  2. There, all three buttons are faded to 55% with "Opens soon" and a meaningless ○ glyph.
  3. `pointer-events:none` means a tap does nothing, with no feedback.
  4. The only way out is "Questions …: **TBC**", plus an Instagram link that is also "Opens soon".
  5. Programme → "Ask about hosting a session" lands on the same dead end.
  6. The footer prints "Contact: **TBC**" and two links that look live but aren't.
  7. The Timeline says October is **Now** and that "registration opens". That contradicts every button.
- Keyboard and screen-reader cost: 7 of the 35 tab stops (20%) are dead `aria-disabled` links, announced as "Register your team Opens soon, link, dimmed".
- Fix:
  - (a) While `registerUrl` is pending, have `main.js` render pending `data-href` elements as `<span class="btn … is-pending" role="link" aria-disabled="true">` with no `href` and no tab stop. Alternatively, set `tabindex="-1"` on them.
  - (b) In `#register`, replace the three faded buttons with one status line that stays at full contrast. Pull the date from config rather than inventing one: "Registration, the Discord server and the rulebook open together when the rulebook is published. Check back in October." If you keep the buttons, keep their text at full opacity and drop `opacity:.55` (`register.css` line 115). Delete the ○ `::after` glyph (lines 123–132), which reads as a broken radio button.
  - (c) Add `SITE.hackathon.registerCtaPending: "Registration opens soon"` and use it for the nav and hero CTA labels while the URL is pending. The link stays `#register`, so the promise matches the destination.
  - (d) When `contact.email` has no "@", hide the email `<li>` in the footer and the `.rg-contact__email` in register instead of printing "TBC". Then tell the client that **a working contact email is a launch blocker**: it is the only actionable route for parents, NGOs and sponsors.
  - (e) In `config.js` line 267, change the timeline copy to "The participant rulebook will be published … and registration will open." Leave it as `status:"next"` until the URL is live.

**M5. Text set in `--blue` fails on ice and on every dark surface.**
- Owners and files: B2 `hackathon.css`; B3 `programme.css`; B4 `timeline.css`.
- Problem: `--blue` (#0568F5) is used as a text colour that doesn't flip in dark mode. Measured results:
  - `.hk-division__grades` (line 94, "Grade 10 and below"): 4.33:1 light (on `--surface-2` = #EAF2FF), **2.80:1 dark** (on #0F2B61).
  - `.tl-item[data-status="done"] .tl-when::after` "Done" pill (`timeline.css` lines 110–114): 4.33:1 light, **2.80:1 dark**.
  - `.tl-when` (line 94, "August 2026"): **3.33:1 dark**. It is 18px/600, so not large text.
  - `#programme .pg-topic[data-track="hackathon-prep"] .pg-topic__track` (`programme.css` line 122, "Hackathon prep"): 4.33:1 light.
- Fix: add a token in `base.css`: `--accent-text:#0350C4` in light (6.32:1 on ice, 7.7:1 on white) and `--accent-text:var(--blue-bright)` in both dark blocks (4.84:1 on #0F2B61, 5.76:1 on #0A1E48). Use `color:var(--accent-text)` in all four rules above. For the "Done" pill in dark, also set `background:var(--surface)`.

**M6. The hero countdown labels and caption fail.**
- Owner and file: B1 `src/hero.css`.
- Problem:
  - `.hero-count__cell dt` (line 94, `rgba(255,255,255,.72)`, 12.8px): 2.65:1 at 390 dark, 2.71:1 at 390 light, 3.16:1 at 1280.
  - `.hero-count__caption` (line 76, `.8`): 3.73–3.77:1 at 390.
  - `.hero-lead` (line 58, `.88`): 4.33–4.46:1 where canvas traces pass behind it (median 5.2–5.75:1).
  - The cause: at 390 the counter sits over the brightest part of the gradient, where the `::after` scrim has faded to 0.
- Fix:
  - `dt{color:rgba(255,255,255,.92);font-size:.85rem}`.
  - `.hero-count__caption{color:rgba(255,255,255,.92)}`.
  - `.hero-lead{color:rgba(255,255,255,.95)}`.
  - Change the hero scrim (line 17) for narrow screens: `@media (max-width:899px){.hero::after{background:linear-gradient(180deg,rgba(3,56,168,.45) 0%,rgba(3,56,168,.3) 100%)}}`.

## 3. Should fix

**S1. The mobile menu doesn't close when focus leaves it, when you tap outside, or when you scroll.**
- Owner and file: B5 `src/main.js` `bindNav` (lines 524–551).
- Problem, measured at 390:
  - After opening and pressing Tab 9 times, focus is on the hero "Explore the programme" while the menu is still open, covering y 72–497px.
  - Tapping the hero at (200,700) left it open.
  - Scrolling 600px left it open.
  - After you tap a menu link the link becomes `display:none` and `document.activeElement` is BODY, so focus is lost.
- Fix:
  - Add a `focusout` listener on `#nav-menu` and the toggle: `if(!header.contains(e.relatedTarget)) setNav(false)`.
  - Add a `pointerdown` listener on `document` that closes the menu when the target is outside `header.site-nav`.
  - On link click, after `setNav(false)`, focus the target: `t=document.querySelector(href); t.setAttribute('tabindex','-1'); t.focus({preventScroll:true})`.

**S2. The FAQ single-open behaviour makes the list jump under the pointer.**
- Owner and file: B5 `src/main.js` `bindFaq` (lines 555–567).
- Problem: at 1280, with Q1 open, clicking Q7 closes Q1, and Q7's summary moves from y=458 to y=352, a 106px jump. The user loses their place and may click the wrong item.
- Fix: delete `bindFaq`, so several items can be open at once. If single-open is a design requirement, measure `summary.getBoundingClientRect().top` before closing the others and `scrollBy(0, after-before)` afterwards.

**S3. Live ghost buttons are barely recognisable as buttons.**
- Owner and file: B1 `src/base.css` line 150.
- Problem: the `.btn--ghost` border is `--line` (#CFE0FB), which is 1.34:1 on white. In dark mode `--line` is #1E3A6E, 1.63:1 on the background. "Ask about hosting a session" (`programme.html` line 194) reads as loose text, not a control. That fails the 3:1 non-text contrast for a component boundary.
- Fix: `.btn--ghost{border-color:var(--accent-text)}` (the M5 token). `.btn--ghost:hover` already exists.

**S4. "To be confirmed" is invisible on touch devices and to keyboard users wherever it relies on `.tbc` alone.**
- Owners and files: B1 `base.css` line 168 plus every inline `.tbc` (B1 `hero.html` line 11; B4 `register.html` line 8 and `about.html` lines 16, 34, 36; B4 `faq.html` lines 41, 55).
- Problem: the only signals are a dotted `--blue-sky` underline (1.87:1 against white, and on the hero 1.x) and `title="To be confirmed"`. There are 19 `title` attributes in total, and `title` never appears on touch or keyboard. A parent on a phone reads "Registration fee ₹2,000 per team." in the register band as a confirmed price.
- Fix: where the TBC fact is the headline value, write it into the copy:
  - `register.html` line 8: "Registration fee <span class="tbc">₹2,000 per team</span> (to be confirmed)."
  - `hero.html` line 11: "…on <span class="tbc">24–25 October 2026</span> (dates tentative)."
  - Also make the underline itself visible: `.tbc{text-decoration-color:var(--accent-text)}` in light.

**S5. Register band fee line fails AA.**
- Owner and file: B4 `src/register.css` lines 40–44.
- Problem: `.rg-fee{color:var(--blue-sky)}` measures 4.09:1 at 390 and 4.41:1 at 1280.
- Fix: `color:#D6E8FF` (5.75:1 on the lightest band pixel), or `rgba(255,255,255,.9)`.

**S6. The countdown ticks every second forever, even under `prefers-reduced-motion`, and counts down to a tentative date.**
- Owners and files: B5 `src/main.js` lines 497–502; B1 `src/hero.html` lines 16–22.
- Problem:
  - A per-second auto-updating region sitting beside reading content is a WCAG 2.2.2 (Pause, Stop, Hide) risk.
  - Measured: it still ticks with `reduced_motion="reduce"` (seconds went 26→25).
  - The caption "Opening ceremony starts in" also states a time that is not confirmed.
- Fix:
  - Remove the `secs` cell and tick every 30s. Alternatively, when `matchMedia('(prefers-reduced-motion: reduce)')` matches, hide `[data-cd="s"]`'s cell and use `setInterval(…, 60000)`.
  - Change the caption to "Opening ceremony (tentative) starts in".
  - Rename the `dt` labels to "days / hours / minutes / seconds". Screen readers currently say "mins" and "secs".

**S7. Footer links and the Instagram link are small tap targets.**
- Owner and files: B1 `src/base.css` lines 316–317 and 327; B4 `register.css` line 99.
- Problem, measured at 360 and 390: footer links are 21px tall, "Back to top" is 18px, and `.rg-insta` is 25px. They pass WCAG 2.5.8's 24px spacing exception, but miss the 44px target in the brief.
- Fix:
  - `.site-footer__list{gap:0}.site-footer__list a{display:inline-flex;align-items:center;min-height:44px}`.
  - `.site-footer__bottom a{display:inline-flex;min-height:44px;align-items:center}`.
  - `.rg-insta{min-height:44px}`.

**S8. The pending ghost button overflows at 320px.**
- Owner and file: B2 `src/hackathon.css` line 127.
- Problem: "Read the rulebook Opens soon" is `white-space:nowrap`, 309px wide, and spans x 16→325 in a 320px viewport. That gives `scrollWidth` 325, with the right edge clipped by `body{overflow-x:clip}`.
- Fix: `.hk-teams__actions .btn{max-width:100%;white-space:normal;text-align:center}`. It goes away entirely if M4(a) shortens the pending label.

## 4. Nice to have

- **N1. Active-section indicator (B5 `main.js`).** The `.site-nav__link[aria-current]` style exists (`base.css` line 246), but nothing ever sets `aria-current`. Add an IntersectionObserver that sets `aria-current="true"` on the link for the section in view.
- **N2. Remove a stray landmark (B2 `hackathon.html` line 118).** `<aside aria-label="Where the rest goes">` is exposed as a complementary landmark inside main, which is noise in the landmark list. Make it a `<div>`.
- **N3. Latent badge colour trap (B1 `base.css` line 163).** The base `.badge` colour is `var(--blue-deep)`, which is 1.39:1 on dark `--surface-2`. Every current use overrides it, so nothing fails today, but the next author will hit it. Set `.badge{color:var(--accent-text)}`.
- **N4. Dark-mode hover colours (B1 `base.css` line 245; B4 `faq.css` line 35).** Nav link and FAQ hover colours are `var(--blue)`, 3.71:1 on the dark nav. Use `var(--link)`.
- **N5. Page length (all owners).** The page is 18,648px tall at 360, about 22 phone screens. The hackathon section alone runs from 3,342 to roughly 9,600px at 390. Consider collapsing "AI rules", "Logistics" and "Judging" into `<details>` on mobile, so registration-relevant content is reachable sooner.

## 5. What's working (keep it)

- **Responsive layout.** No horizontal scroll at any of the 12 width/theme combinations, every grid has `min-width:0`, and the desktop nav still fits at 900px.
- **Anchor offsets.** `scroll-padding-top: calc(var(--nav-h) + safe-area + 12px)` lands every anchor 11px clear of the sticky nav. Keep it.
- **Reduced motion.** `hero.js` really does draw a single static frame (identical canvas hash), and the global reduced-motion block kills the load animation and smooth scrolling.
- **Native elements.** The FAQ is native `<details>`/`<summary>`, and the countdown is `role="timer"`. These are the right choices; don't swap them for div widgets or `aria-live`.
- **Mobile toggle.** It is 44×44 with a text label, `aria-expanded` and `aria-controls`, and Escape returns focus to it. Menu rows are 55px tall.
- **Body text contrast.** `--muted` is 5.7–6.4:1 on light surfaces and 7.3–9.7:1 in dark. The FAQ "to be confirmed" pills and the `.badge--tbc` text all pass. The contrast failures are confined to the bright gradient end and `--blue`-as-text.
