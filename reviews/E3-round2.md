# E3 — UX, responsiveness & accessibility — round 2 (semi-final)

**How I checked.**
- Rebuilt with `python3 build.py --strict` (the only warning is `siteUrl`) and ran `python3 shoot.py`: no overflow and no console errors in any of the 6 runs.
- Re-ran my round-1 scripts in `reviews/scratch/`:
  - `e3_contrast.py`: pixel-sampled, 5th-percentile worst background. I fixed it to skip the bodies of closed `<details>`, which had produced a false 1.32:1 reading in round 1.
  - `e3_keys.py`: now measures the ring's **actual** colour against what surrounds it.
  - `e3_nav.py`, `e3_taps.py`, `e3_anchor.py`, `e3_struct.py`, `e3_basic.py` (now also at 320px).
- New script `e3_states.py`: rebuilds the page with config set to three states (email only, interest form plus email, registration fully open) and audits the Register band, footer and CTAs in each.

## 1. Verification of my round-1 items

| # | Item | Status | Evidence (round 2) |
|---|---|---|---|
| M1 | White text on the bright end of `--grad` (buttons, At a glance) | **Fixed** | `--grad-ui` is on buttons and the band. 0 failing runs in `.btn--primary`/`.hk-facts` at any width or theme. |
| M2 | Focus ring under 3:1, invisible on blue | **Fixed** | The ring is `--blue` in light, `#fff` on dark bands and `--blue-bright` in dark mode. Measured minimum against surroundings across all 34 tab stops: **4.24:1** at 1280 light. Hero buttons 6.0–7.9:1, footer 15.8:1, dark mode 5.4–6.4:1. |
| M3 | No skip link | **Fixed** | First tab stop is "Skip to content". Enter puts focus on `MAIN#main`, and the next Tab goes to the hero CTA. |
| M4 | Register path dead-ends; 7 dead tab stops | **Fixed** | 0 `aria-disabled` links and 0 faded buttons. Pending links are `hidden`, so 34 tab stops, all live. CTAs read "How to register" and go to an honest band with the status line "Links go live here in October." and "Contact email coming soon" (no "TBC"). I tested the email-only, interest-URL and open states: every link and button becomes real, mailto links are subject-tagged per audience, the footer list fills in, and the nav, hero and footer CTAs switch to "Register your team" pointing at `registerUrl`. |
| M5 | `--blue` used as text fails on ice and dark | **Fixed** | `--accent-text` is applied. Grades, "Done", timeline dates and track pills all pass in both themes. |
| M6 | Hero countdown labels and caption fail | **Partly fixed → fixed by me** | After the builders' changes: `dt` measured 3.61–4.42:1 and the caption 4.18–4.36:1 at 320–1024px, over the bright lower-right of the hero. My E3 block fixes it (§2). Now **0 failing text runs at all 11 width/theme runs** (320, 360, 390, 768, 1024, 1280, 1440). |
| S1 | Mobile menu stays open when focus or taps leave it; focus lost after a link | **Fixed** | Tabbing past "How to register" closes the menu. An outside tap closes it. A link tap focuses the target section, and the next Tab reaches its first control. It still stays open on scroll, which is acceptable for a 425px dropdown. |
| S2 | FAQ jumps 106px | **Fixed** | Several items can now be open at once. Jump measured at 0px at 390 and 1280. |
| S3 | Ghost button border 1.34:1 | **Fixed** | 1.5px `--blue` border (4.88:1), white at 70% on dark. |
| S4 | TBC conveyed only by underline and `title` | **Fixed** | Each TBC fact now has a visible pill or text, such as "Dates tentative", "Fee to be confirmed", "· working figure" and FAQ "To be confirmed" pills. `title` attributes dropped from 19 to 7, and those are now redundant. |
| S5 | `.rg-fee` blue-sky at 4.09:1 | **Fixed** | The band text passes. |
| S6 | Countdown ticks every second under reduced motion | **Fixed** | Under `reduce`, the seconds cell is `hidden` and updates come once a minute. The canvas hash is identical over 1.4s. Labels are "minutes" and "seconds", and the caption says "(tentative)". |
| S7 | Footer, Instagram and Back-to-top under 44px | **Fixed** | 44px tall on mobile. I added a 44px minimum width (see §2). |
| S8 | 5px overflow at 320px | **Fixed** | `scrollWidth === innerWidth` at 320, 360, 390, 768, 1024, 1280 and 1440, light and dark. |
| N1 | `aria-current` never set | **Fixed** | An IntersectionObserver scroll-spy sets it. |
| N2 | `<aside>` landmark noise | **Fixed** | The aside was removed. |
| N3 | Base `.badge` colour trap in dark | **Fixed** | `.badge` uses `--accent-text`. |
| N4 | Dark hover colours | **Fixed** | Uses tokens. |
| N5 | Page length | **Not changed** | 18,179px at 360. It was 18,648px in round 1. |

Still passing from round 1:
- Heading outline: h1 → h2 ×8 → h3 → h4, with no skipped levels.
- Landmarks: banner, Main nav, main, contentinfo and Footer nav.
- Language: `lang="en-IN"`.
- The timer stays `role="timer"` (not live).
- Anchors land 11px clear of the sticky nav (section top 84px, nav bottom 73px).
- Mobile toggle is 44×44, menu rows are 55px, and Escape returns focus to the toggle.

## 2. Changes I made

| File | Change | Why |
|---|---|---|
| `src/base.css`, new `/* E3 a11y */` block at the end | `.hero .hero-count__caption, .hero .hero-count__cell dt, .hero .hero-lead { color:#fff }`. Under 900px, `.hero.on-dark::after` uses a slightly deeper lower scrim (`.45 → .45 → .55` instead of `.45 → .3`). The doubled selectors are needed because hero.css loads after base.css. | At 320–1024px the countdown sits over the brightest corner of the hero. Labels measured 3.61:1 at worst; now ≥4.5:1 everywhere, 0 failing runs. The scrim change is barely visible (screenshot `e3r2-hero-390.png`). |
| same block | `[tabindex="-1"]:focus{outline:none}` | The new focus-to-section behaviour (skip link and nav links) drew a 3px ring around an entire section, visible as a stray blue bar under the nav. Real controls keep `:focus-visible`. |
| same block | `.rg-copy::after{inset:-6px -4px}` with `position:relative` | The Copy button is a 32px pill. This gives it a 44px hit area without changing how it looks (hit-test verified 4px above the pill). |
| same block | `.site-footer__list a, .site-footer__bottom a { min-width:44px }` | "FAQ" (28px) and "Team" (38px) were narrow targets. |
| same block | `@media (forced-colors:active)` rules for focus outline, pills and buttons | In Windows High Contrast, `.btn--primary` has a transparent border and dashed pills on transparent backgrounds disappear. |
| `src/main.js` `setExternal()` | Appends `<span class="sr-only dh-newtab"> (opens in a new tab)</span>` to `target="_blank"` links, and removes it when the link becomes in-page again. | Once URLs are set, the registration, Discord, rulebook, Instagram and interest links open new tabs without warning. Verified name: "Register your team (opens in a new tab)". It does not affect `applyRegisterCtas`, which resets text first and is idempotent. |
| `src/main.js` `flashCopied()` / `bindCopy()` | The `role="status"` span stays in the tree, empty, while the Copy button is usable. On copy the text is set to "Copied" after 60ms and cleared after 2s, instead of toggling `hidden`. | A live region revealed from `display:none` is often not announced by NVDA or VoiceOver. Verified: the clipboard receives the address and the region text goes `"" → "Copied" → ""`. |

`node --check src/main.js` passes, `build.py --strict` gives the `siteUrl` warning only, and `shoot.py` reports no overflow and no errors.

## 3. Final feedback for the lead (what still matters for launch)

1. **Client: the contact email is the only thing between this page and "no dead ends".** With `contact.email` set, the band gains "Get notified" (a mailto), three audience mailto links and a Copy button, all tested. Without it, a parent or NGO has no way to reach the team until October. Treat the email as a launch blocker.
2. **Judgement call (B1/E1, keep as is): the seconds still tick for users without reduced motion.** `role="timer"` is not live, so screen readers aren't spammed, and reduced-motion users get a per-minute display without seconds. WCAG 2.2.2 only strictly applies to content that can't be paused. If the lead wants zero risk, remove the `seconds` cell in `hero.html` line 21 and set `step` to 60000 in `main.js` `scheduleCountdown`.
3. **Optional (B5/E4, `main.js` `bindNav`): close the mobile menu on scroll.** It stays open while the page scrolls under it. That is harmless because it's a capped, scrollable dropdown, but it's one line: `window.addEventListener('scroll', function(){ if(isNavOpen() && !navParts().header.contains(document.activeElement)) setNav(false); }, {passive:true})`.
4. **Optional (E5/B2): page length on mobile.** It is 18,179px at 360, about 21 screens, with the hackathon section about 6,000px of it. Collapsing "Logistics" and "What judges look for" into `<details>` on narrow screens would bring the FAQ and Register band about 2 screens closer. This is not a blocker.
5. **Coordination note for E1: my E3 block slightly deepens the mobile hero scrim** (`.hero.on-dark::after`, under 900px). If E1 prefers to solve the countdown contrast in `hero.css` itself, move my two rules there and delete them from the E3 block. Re-measure with `e3_contrast.py 360 light` and `e3_contrast.py 390 dark`; the target is 0 failing.

## 4. Provisional scores (UX / a11y lens)

| Component | R1 | R2 | Note |
|---|---|---|---|
| Nav | 6 | 9 | Skip link, 4.88:1 ring, menu closes on focus-out and outside tap, focus moves to the target, scroll-spy `aria-current`. |
| Hero | 6 | 8.5 | All text ≥4.5:1 (with E3 block), white ring 6–8:1, honest "How to register", reduced motion respected. |
| About | 8 | 8.5 | Clean. |
| Hackathon | 6 | 8.5 | Contrast and overflow fixed, TBC visible as text. Long on mobile. |
| Programme | 7 | 8.5 | Track pills pass; empty state is good. |
| Timeline | 6 | 8.5 | Dark-mode contrast fixed; "In progress" is no longer contradicted by the CTAs. |
| Team | 8 | 8.5 | — |
| FAQ | 7 | 9 | Several items open at once, no jump, visible TBC pills in the summary names, ring 4.6–5.8:1. |
| Register | 4 | 8.5 | No dead controls. A status line instead of faded buttons, 44px targets, live-region copy, new-tab notice. Reaches 9+ once an email is set. |
| Footer | 6 | 8.5 | 44×44 targets, no "TBC", pending links hidden. |
| **E3 overall** | **5** | **8.5** | 0 AA text failures across 11 width/theme runs, every tab stop live with a ≥4.2:1 ring, no horizontal scroll from 320 to 1440, and correct behaviour in every config state. |
