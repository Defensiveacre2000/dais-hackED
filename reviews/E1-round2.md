# E1: Visual design and brand, round 2 (semi-final)

**How I checked.** I rebuilt the site with `python3 build.py --strict` (the only warning is `siteUrl`) and re-ran `shoot.py`, which reported no overflow and no console errors in any of the six runs. I then looked at every slice at 360, 768 and 1280, in light and dark. I also re-ran my colour sweep, contrast sweep and measurement scripts (`reviews/scratch/e1_*.py`).

- **Contrast:** the sweep now finds **zero** failing solid-background text runs in light or dark. In round 1 there were four.
- **Section backgrounds:** they now strictly alternate, as decision D4 requires.

## 1. Verification of my round-1 items

| # | Item | Status | Evidence |
|---|---|---|---|
| M1 | Final call-to-action band looks disabled; primary button vanished into the band | **Fixed** | The band now reads "Registration opens in October". It has one clear status line ("Links go live here in October."), a fee line with a single "Fee to be confirmed" pill, and no faded buttons anywhere. The circuit pattern is visible in both themes. |
| M2 | Empty gaps where neighbouring sections share a background | **Fixed** | The order is now about (white), hackathon (tint), programme (white), timeline (tint), team (white), FAQ (tint). At 1280 the About-to-Hackathon change is 120px with a background change in between, and Programme-to-Timeline is the same. |
| M3 | Hero headline ran to 5 lines and the hero was 1032px tall | **Fixed** | The headline is now 3 lines and the hero is 721px tall, so the countdown is fully visible at 1280×800. |
| M4 | Blue text failing contrast on navy (dark) and ice (light) | **Fixed** | `--accent-text` is in place. The grade labels, timeline dates and "Done" pill all pass. The sweep is clean in both themes. |
| M5 | White text on the light end of the gradient | **Fixed** | `--grad-ui` (deep blue to #0568F5) now drives the buttons and the At a glance band. The hero keeps the full `--grad`. |
| S1 | Seven different "to be confirmed" treatments | **Fixed** | Now there are two: dotted `.tbc` for inline values and a dashed `.badge--tbc` pill, used about once per block. The glance band has a single "Still being finalised" line. The triple "proposed" hedge is gone. |
| S2 | Double gap in "on  Discord" | **Fixed** | The Format cell was dropped, per D4. |
| S3 | "Learn"/"Build" larger than the section heading | **Fixed** | Desktop: 36px against a 44.8px h2. Mobile: 28px against 28.8px, which is acceptable. |
| S4 | `.section-head` wrapped "Education programme" | **Fixed** | It is one line at 1280. |
| S5 | Circuit pattern invisible on the register band in light mode | **Fixed** | Visible in light and dark. |
| S6 | Track pills duplicated on desktop | **Fixed** | Hidden on desktop and kept on mobile. "Subject to equipment" stays. |
| S7 | Raw "TBC" shown as the contact | **Fixed** | Now reads "Contact email coming soon" in the band and the footer. |
| S8 | Hero logo on mobile | **Fixed** | A small mark now sits above the badges. |
| S9 | Timeline date column wrapped | **Fixed** | "24–25 October 2026" is on one line. |
| S10 | Team grid orphan at 768 | **Fixed** | 2×2 at tablet, 4 columns at ≥1000px, with headings aligned (measured). |
| S11 | Prize block too weak | **Fixed, then tuned by me (see §2)** | It is now a wide feature row with an amount slot and the donation note underneath. |
| S12 | Hackathon section too long | **Partly fixed** | The duplicated team-size rule was removed. Mobile is still about 6000px, but it now scans much better. I am not reopening this. |

## 2. Changes I made (CSS only)

| File | Change | Why |
|---|---|---|
| `src/hackathon.css` (`.hk-facts__list` at ≥900px) | Columns changed to `minmax(0,1.7fr) repeat(3,minmax(0,1fr))` | "24–25 October 2026" was breaking onto two lines while the other three cells were one line, which made the band ragged. I tested 1.5, 1.6 and 1.7fr: only 1.7fr gives one line at 1280 and 1440. |
| `src/hackathon.css` (`.hk-prize__amount[data-tbc="true"]`) | Added `font-size:clamp(1.3rem,2vw,1.6rem)` | The placeholder "To be announced" was 36.8px, larger than the block heading "Prizes and awards" (26.4px). Now it sits below the heading. Real amounts, once `tbc:false`, keep the large `clamp(1.6rem,3vw,2.3rem)` size, so the slot still works when the client sends figures. |
| `src/hackathon.css` (after `.hk-pending`) | `.hk-pending.tbc,.hk-pending .tbc{text-decoration:none}` | "Exact rubric, weighting and judges to be confirmed." had a dashed box and a dotted underline at the same time. The one-treatment rule (D4) means the box alone is enough. |
| `src/programme.css` (`.pg-glance__note .badge`) | `margin-left:6px; vertical-align:1px` | The "To be confirmed" pill was touching "Across both tracks". |

## 3. Final feedback for the lead

Visual polish is no longer blocking launch. These items remain:

1. **FAQ "How big can a team be?" carries a "To be confirmed" pill** (owner: E2, `config.js` FAQ item `tbc`, and the matching `data-tbc` in `faq.html`).
   - The pill makes a confirmed fact (maximum 4) look unsettled. Only the solo rule is open.
   - Fix: set `tbc:false` on this item and end the answer with "Whether solo entries are allowed is still to be confirmed."
   - Alternatively, keep the pill only if the question is reworded to "Can I enter solo?"
2. **The 7-column "How the event runs" flow is still narrow at 1200–1279px**, with about 140px of text per column; "Challenge briefing" runs to 7 lines.
   - This is a judgement call and not a blocker.
   - Fix (B2 or E1 in a later pass): change `@media (min-width:1200px)` to `@media (min-width:1320px)` on the horizontal stepper in `hackathon.css`, so 1200–1319px uses the vertical layout. Alternatively, trim `flow[2].desc` (E2) to "The theme is revealed: structured problems for juniors, a broad SDG theme for seniors."
3. **Client-dependent visuals.** Once the client sends prize amounts, the fee and the NGO list, set the `tbc` flags to false.
   - The prize slot then shows in large display type.
   - The dotted markers disappear on their own.
   - The NGO empty state is replaced.
   - No design work is needed.

## 4. Provisional scores (visual and brand lens)

| Component | Round 1 | Round 2 | Note |
|---|---|---|---|
| Nav | 8 | 8.5 | Clean. The button contrast is fixed and "How to register" is honest. |
| Hero | 7 | 8.5 | A 3-line headline that fits above the fold, a small mark on mobile, and a tidy pair of badges. |
| About | 7 | 8 | The type hierarchy is correct and the section transitions now read as rhythm. |
| Hackathon | 6 | 8 | One gradient band, an honest prize row and consistent "to be confirmed" markers. Still long on mobile. |
| Programme | 7 | 8 | Calm on white, no redundant pills on desktop, and a good NGO state. |
| Timeline | 7 | 8.5 | Statuses are credible and pass contrast in dark mode. |
| Team | 7 | 8 | Aligned grid at every width. |
| FAQ | 8 | 8 | Consistent pills. One of them is wrong (see §3.1). |
| Register | 4 | 7.5 | No longer a dead end. The status line is honest, and the band is the right weight for a closing call to action. |
| Footer | 6 | 8 | Complete links, the binary tape, and no raw TBC. |
| **Lens overall** | **6.5** | **8** | Strict brand palette, the hero as the one bold moment, a disciplined rhythm and dark mode at parity. I would ship it once the item in §3.1 is fixed. |
