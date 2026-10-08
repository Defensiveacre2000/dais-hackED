# E1 — Visual design & brand — round 1

Evidence base: rebuilt `dist/index.html`, re-ran `shoot.py`, and viewed every slice of 360 / 768 / 1280 in light and dark. I also ran a computed-style sweep of every colour on the page, a contrast sweep for light and dark, and a Playwright test of hero type sizes. Scripts are in `reviews/scratch/e1_*.py` and crops are in `reviews/scratch/e1/`.

## 1. Scores

| Component | Score | One-line reason |
|---|---|---|
| Nav | 8 | Clean, on-brand, good blur. Primary button text fails contrast over the light end of the gradient (see M5). |
| Hero | 7 | Strong bold moment, but the headline breaks into 5 lines with "Build" alone on line 1, the hero is 1032px tall at 1280×900 so the countdown is cut, and the logo sits below the fold on mobile. |
| About | 7 | The Learn/Build split with a circuit connector is a good idea. The card words are larger than the section h2, and there is a ~245px dead white gap before the Hackathon section. |
| Hackathon | 6 | Thorough and tidy, but long (3840px desktop, 6550px mobile), with 6+ different TBC treatments, duplicated "proposed" in the glance band, a stray double gap in "on  Discord" and weak prize presentation. |
| Programme | 7 | Good stats row, track legend and NGO empty state. Track pills repeat the column legend, and the section is the second half of a ~265px empty ice gap. |
| Timeline | 7 | A real sequence with node/trace, done well. The date column wraps "24–25 October 2026", and the dates and "Done" pills fail contrast in dark mode. |
| Team | 7 | Name chips plus dot-trace headers are on-motif. "Website" is orphaned at 768, and pill rows misalign under 1- vs 2-line headings. |
| FAQ | 8 | Calm, well spaced, good +/− affordance. The TBC pill is lowercase and differs from every other TBC pill. |
| Register | 4 | The final CTA band looks disabled: all three buttons sit at 55% opacity, the primary button's gradient start equals the band colour so its left half disappears, there is a 1px light stripe on its left edge, raw "TBC" shows as the email, and the circuit pattern is invisible in light mode. |
| Footer | 6 | The binary tape is a nice touch. "Instagram Opens soon" and "Join the Discord Opens soon" read as one phrase, there is a raw "TBC", and the "On this page" list has no About or Team links. |
| **Lens overall (visual & brand)** | **6.5** | Colour discipline is excellent: zero off-brand hues in either theme. Rhythm gaps, the dead-looking final CTA, inconsistent TBC styling and blue-on-navy contrast in dark mode hold it back from shippable. |

---

## 2. Must fix (blocking)

**M1. Final CTA band looks disabled and the primary button half-vanishes.** Owners: B4 (`src/register.css`), B1 (`src/base.css`), B5 (`src/main.js` `.btn-soon`)
- What's wrong:
  - `register.css` lines 113–119 (`.btn.is-pending, .rg-band .is-pending { opacity:0.55 }`) greys out every CTA in the page's last band. The "Register your team" button in the hero is not ghosted, so the same action looks live at the top of the page and dead at the bottom.
  - `.rg-cta` uses `.btn--primary` (`var(--grad)` starting at `#0338A8`) on `.rg-band` (`background: var(--blue-deep)` = `#0338A8`). The left ~40% of the button blends into the band. Zoomed crop: `reviews/scratch/e1/z_regbtn.png`.
  - `.btn.is-pending { border-style:dashed }` on a transparent border lets the gradient tile repeat under the 1px border (background-origin is padding-box). This draws a light 1px vertical stripe on the button's left edge.
  - `.btn.is-pending::after` (the 7px ring) is a flex item that shrinks. At 360 with `width:100%` it collapses to a thin "ı" bar (see `360_sheet2.png`, register band).
  - `.btn-soon` has no styling at all, so the label reads "Register your team Opens soon" as one bold string.
- Fix:
  1. In `register.css`, make the band's primary button white, the same as the hero: `.rg-cta{background:#fff;color:var(--blue-deep);box-shadow:0 12px 32px rgba(3,30,90,.28)}` and `.rg-cta:hover{background:var(--ice)}`.
  2. Replace the pending rule with `.btn.is-pending, .rg-band .is-pending{opacity:1;cursor:default;box-shadow:none}`. Keep the dashed border only on ghost buttons: `.btn--ghost.is-pending{border-style:dashed}`.
  3. Delete `.btn.is-pending::after`.
  4. In `base.css` (B1) style the label once, site-wide: `.btn-soon{display:inline-block;margin-left:.5em;padding:.12em .6em;border-radius:var(--radius-pill);font-size:.72em;font-weight:600;line-height:1.4;background:var(--surface-2);color:var(--muted);white-space:nowrap}` and `.on-dark .btn-soon,.rg-band .btn-soon,.site-footer .btn-soon{background:rgba(255,255,255,.16);color:#fff}`.
  5. In `base.css` add `.btn--primary{background-origin:border-box}` so a transparent border never shows a repeated tile.

**M2. Two oversized empty gaps where adjacent sections share a background.** Owners: B2 (`src/hackathon.html`), B3 (`src/programme.html`), B2 (`src/hackathon.css`)
- What's wrong: the sequence is About (white) → Hackathon (white) → Programme (tint) → Timeline (tint) → Team (white) → FAQ (tint). Two 120px paddings stack with no colour change, so at 1280 there are ~245px of blank white between the "Creativity" strand and "The hackathon" h2 (`1280_01.png`, y≈850–1090). There are also ~265px of blank ice between "Ask about hosting a session" and the "Timeline" h2 (`1280_05.png`, y≈65–330). Both read as a broken page, not as rhythm.
- Fix: make the alternation strict, giving W / T / W / T / W / T:
  - `hackathon.html` line 2: `class="section section--tint"`.
  - `programme.html` line 11: `class="section"`.
  - On the new tint, the division cards (`--ice` on `--ice-2`) lose their edge. In `hackathon.css` set `.hk-division{background:var(--surface);border:1px solid var(--line)}`.
  - Re-check `pg-topic-list` and the NGO empty state on white. Both already have a border, so they will hold.

**M3. Hero headline: 5 lines, an orphaned first word, and a hero taller than the viewport.** Owner: B1 (`src/hero.css`)
- What's wrong: `.hero-title{font-size:clamp(2.2rem,6vw,4.6rem);max-width:15ch}` inside a `1.45fr/.85fr` grid sets "Build / technology / that solves / a real social / problem." at 73.6px. The hero is 1032px tall, so at a 1280×900 viewport the countdown is cut off at the fold.
- Fix (tested in Playwright; the result is in `reviews/scratch/e1/hero_A.png`):
  ```css
  .hero-title{font-size:clamp(2.2rem,5vw,4rem);max-width:none}
  @media (min-width:900px){.hero-inner{grid-template-columns:minmax(0,1.6fr) minmax(0,.7fr)}}
  ```
  - Result: 3 balanced lines ("Build technology / that solves a real / social problem."), a hero height of 849px, and the countdown fully above the fold at 1280 and 1440.
  - The logo stays at the same size.

**M4. Brand blue used as text on navy fails contrast in dark mode, and narrowly fails on ice in light mode.** Owners: B1 (token), B2, B3, B4
- Measured failures (contrast sweep, `reviews/scratch/e1_contrast.py`):
  - `.hk-division__grades` ("Grade 10 and below"): **2.80:1** dark (#0568F5 on #0F2B61) and **4.33:1** light (on #EAF2FF).
  - `.tl-when` ("August 2026" etc.): **3.33:1** dark. At 18px/600 it does not count as large text.
  - `.tl-item[data-status="done"] .tl-when::after` ("Done"): blue on `--ice`, ≈2.8:1 dark.
  - `#programme .pg-topic__track` ("Hackathon prep"): **4.33:1** light at 13px.
- Fix:
  - B1 adds a text-safe brand token in `base.css`: `--blue-text:#0558D6`, a shade of #0568F5 (5.53:1 on ice, 6.23:1 on white). In both dark blocks set `--blue-text:var(--blue-bright)` (#4D9BFF: 4.84:1 on #0F2B61, 5.76:1 on #0A1E48).
  - Then replace `color:var(--blue)` on text in these places:
    - `hackathon.css`: `.hk-division__grades`.
    - `timeline.css` lines 94 and 113: `.tl-when` and the Done pill.
    - `programme.css`: wherever `--pg-accent` colours text (`.pg-topic__track`, `.pg-legend`).
    - `about.css` line 37: `.ab-pane__word` (currently 3.17:1 on dark `--surface`).
  - Keep `--blue` for fills, dots, rules and icons.

**M5. White text on the light end of `--grad` fails AA.** Owners: B1 (`src/base.css`), B2 (`src/hackathon.css`)
- What's wrong: `--grad` ends at #4D9BFF, and white on #4D9BFF is 2.82:1.
  - In `.btn--primary` (nav, Teams block), the word "team" sits over ≈#2D85FB (≈3.6:1 at 16px bold, which is not large text).
  - In `.hk-facts`, the "Team size / Up to 4 / per team" column sits over #2D85FA–#4898FF. "per team" is 14.4px at opacity .9, about 3.3:1.
- Fix: keep the full `--grad` for the hero, which already has its `::after` darkening. Add a UI gradient that never goes lighter than the brand blue: `--grad-ui:linear-gradient(135deg,var(--blue-deep) 0%,var(--blue) 100%)` (white on #0568F5 = 4.88:1). Use it in `.btn--primary{background:var(--grad-ui)}` and `.hk-facts{background:var(--grad-ui)}`. The band still reads as a deep-to-brand gradient.

---

## 3. Should fix

**S1. TBC treatment is inconsistent: I count 7 different visual treatments.** Owners: B2, B4, B5
- The current treatments:
  - Dotted underline (`.tbc`).
  - Dashed pill "To be confirmed".
  - Dashed pill "Amount to be confirmed".
  - Lowercase FAQ pill "to be confirmed" (`faq.css` line 39).
  - Timeline "Tentative" pill.
  - Plain grey "confirmed" / "potentially permitted" text.
  - Double-marking.
- Specific fixes:
  - `hackathon.html` line 77: delete `<span class="hk-stat__sub">confirmed</span>`. Confirmed values need no label, and the label reads like a TBC marker.
  - `hackathon.html` line 85: "₹2,000 per team" has both a dotted underline and a pill. Keep the dotted underline and remove `<span class="badge badge--tbc">To be confirmed</span>`. The rule: a value gets `.tbc`, and a pill appears only where there is no value.
  - Glance band, Duration: it shows "24 hours (proposed)" with a dotted underline, followed by "proposed, not yet locked". B5 should add a `hackathon.durationShort` fact ("24 hours") for `.hk-fact__value` (hackathon.html line 32). B2 should change the sub to "Proposed, to be confirmed".
  - `faq.css` line 39: `content:"To be confirmed"`, so it matches `.badge--tbc` capitalisation.

**S2. "on  Discord" double gap in the glance band.** Owner: B2 (`src/hackathon.css`)
- What's wrong: `.hk-fact__sub{display:flex;gap:8px}` turns the text node "on" and the `<span>` into flex items, so you get 8px plus a space.
- Fix: `.hk-fact__sub{display:block}` and `.hk-fact__sub .badge{margin-left:6px;vertical-align:1px}`.

**S3. Type hierarchy inversion in About.** Owner: B4 (`src/about.css` line 34)
- What's wrong: `.ab-pane__word` ("Learn" / "Build") is `clamp(2.2rem,5vw,3.6rem)`, which is 57.6px at desktop. That is larger than the section h2 "What this is" (44.8px), and on 360 it is 40px against a 28.8px h2.
- Fix: `font-size:clamp(1.75rem,3vw,2.25rem)`.

**S4. `.section-head` caps h2 width at 60ch, so short headings wrap.** Owner: B1 (`src/base.css` line 117)
- What's wrong: "Education programme" breaks onto two lines at 1280 even though the container has 1120px free.
- Fix: `.section-head{...;max-width:none}`. `.lead` already caps itself at 60ch.

**S5. The circuit pattern in the register band is invisible in light mode.** Owners: B1 (`base.css`), B4 (`register.css`)
- What's wrong: the light `--circuit` tile uses a #0568F5 stroke on a #0338A8 band, so it disappears. In dark mode the tile is white and shows (`reviews/scratch/e1/z_rgband.png`, top = light, bottom = dark).
- Fix:
  - B1 exposes the white tile as `--circuit-on-dark` in `:root`, using the same SVG as the dark block.
  - B4 sets `.rg-band > .circuit-bg{background-image:var(--circuit-on-dark);opacity:.08}`.

**S6. Track pills repeat the column legend on desktop and sit inconsistently.** Owner: B3 (`src/programme.css`)
- What's wrong: at ≥761px each column already sits under its legend ("Hackathon preparation" / "Community literacy"). The per-item pills repeat that, and they sit inline after "AI literacy" but wrap below "Basic coding, software and vibe coding".
- Fix: `@media (min-width:761px){#programme .pg-topic__track{display:none}}`. Keep them on mobile, where the list is one column, and keep "Subject to equipment".

**S7. Raw "TBC" shown as the contact email.** Owners: B4 (`register.html` line 19), B1 (`footer.html`), B5 (`config.js`)
- What's wrong: bold white "TBC" looks like a template leak in the register band and the footer.
- Fix: when `contact.email` is unset, render `<span class="tbc" title="To be confirmed">Email address coming soon</span>` in the muted colour, not bold. `main.js` can decide which to render based on a value check.

**S8. Hero logo on mobile and tablet.** Owner: B1 (`src/hero.css`)
- What's wrong: under 900px the lightbulb drops below the countdown, about 950px down at 360, so it is below the fold. At 768 it is a big left-aligned block.
- Fix: `@media (max-width:899px){.hero-mark{order:-1}.hero-mark__img{width:88px}}`. The brand mark then leads the hero on small screens, and the hero gets about 120px shorter.

**S9. Timeline date column too narrow.** Owner: B4 (`src/timeline.css` line 143)
- What's wrong: `minmax(0,13rem)` wraps "24–25 October 2026" onto two lines while every other date fits on one.
- Fix: `minmax(0,15rem)`.

**S10. Team grid orphans a column at tablet.** Owner: B4 (`src/team.css` line 4)
- What's wrong: `auto-fit,minmax(220px,1fr)` gives 3 + 1 at 768, leaving "Website" alone.
- Fix: `.tm-groups{grid-template-columns:repeat(2,minmax(0,1fr))}` with `@media (min-width:1000px){.tm-groups{grid-template-columns:repeat(4,minmax(0,1fr))}}` and `@media (max-width:479px){...1fr}`. Also add `.tm-role{min-height:2.6em}` at ≥1000px so the chip rows line up under 1- and 2-line headings.

**S11. Prize block is visually the weakest part of the client's #1 requirement.** Owner: B2 (`hackathon.css` / `hackathon.html` lines 107–115)
- What's wrong: two small cards carrying a 12px pill. When amounts arrive there is no designed slot for a big number.
- Fix: put the TBC into the amount position in display type, for example `<span class="hk-prize__amount num tbc">Amount TBC</span>` styled `font-family:var(--font-display);font-size:clamp(1.5rem,2.4vw,2rem);font-weight:700`. The layout is then final, and the config value drops in without a redesign. Use the same treatment for "Non-cash prizes".

**S12. Hackathon section vertical density.** Owner: B2
- What's wrong: the section is 6550px on mobile, 35% of the page. "Your team can have at most four members" repeats the team size, which already appears in the hero, About, glance band, Teams block, FAQ and register band.
- Fix:
  - Drop that rule from `aiRules` (B5 `config.js`).
  - On ≤639px remove the per-rule dividers and tighten `.hk-rule` padding to 10px.
  - Reduce `.hk-block` top margin on mobile to ~48px.

---

## 4. Nice to have

- **N1** (B2): `.hk-prize{border-top:3px solid var(--blue)}` with a radius tapers at the corners. Use `box-shadow:inset 0 3px 0 var(--blue)` instead, and do the same for the NGO empty-state card's top rule so the two match.
- **N2** (B1, `hero.js` line 75): the canvas digits use Unbounded, whose "0" is nearly a circle and reads as the letter "o". Use `"700 "+size+"px Manrope"` so the field reads as binary, closer to the logo's condensed digits.
- **N3** (B1, `hero.html`): the badge "Tentative" has no subject. Change it to "Dates tentative".
- **N4** (B2): at 960–1279 the 7-column flow gives ~140px text columns ("Challenge briefing" runs to 8 lines). Use the vertical layout below 1200px.
- **N5** (B3): the floating callout "Different team members lead different sessions…" is a white box at 620px wide with no alignment to the 3-column row above. Make it a plain `.pg-how__note` muted paragraph spanning the grid.
- **N6** (B1, `footer.html`): the "On this page" list has no About or Team links. Add them so the list matches the nav.
- **N7** (B4): the timeline "Tentative" pill inherits the dotted underline from `.tl-when` (block-level `::after` on desktop). Put the underline on an inner `<span>` in the rendered date instead of on `.tl-when`.

---

## 5. What's working (keep these)

- **Colour discipline is exemplary.** A computed-style sweep of every element in both themes found only #0568F5, its gradient stops (#0338A8, #4D9BFF), ink/navy, ice tints, #B9CBEA and white. There are no off-brand hues anywhere, success and "Now" states included.
- **The hero is the one bold moment and it works.** The full-bleed brand gradient, the live circuit and binary canvas, the white logo and the single orchestrated load animation all hold together, and everything after it stays quiet.
- **The logo's motifs are used with restraint and meaning:**
  - the circuit connector between Learn and Build;
  - node-dot rules on Team and How sessions run;
  - node and trace in the numbered flow and timeline (both real sequences);
  - the circuit glyph in the NGO empty state;
  - the footer binary tape, which decodes to "hackathon 2026".
- **Unbounded and Manrope are paired well.** The h2 scale is consistent, everything is in sentence case, there are no tracked-caps eyebrows, no arrows on buttons and no accent-word headlines.
- **Dark-mode token mapping is mostly right.** Navy surfaces keep the section alternation, the gradients are unchanged, and lines and muted text are tuned. Only the blue-as-text cases in M4 break it.
- **The Logistics table and the judging columns** are the cleanest, most "agency" parts of the page. They show the right level of quiet.
