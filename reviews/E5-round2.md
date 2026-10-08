# E5 — Copywriting, information architecture & credibility (round 2, semi-final)

## Method

- Ran `python3 build.py --strict`. The only warning is `siteUrl`, which is expected.
- Ran `python3 shoot.py`. There is no overflow and no console errors at 360, 768 or 1280 px, in either light or dark mode.
- Re-read the rendered page as the same six readers as in round 1, re-ran my `reviews/scratch/e5_*.py` scripts, and checked the result against `ROUND1-DECISIONS.md`.

What changed between round 1 and now:

| Measure | Round 1 | Now |
|---|---|---|
| Hedge phrases on the page | 41 in about 2,030 words | 31 in about 2,080 words |
| "Opens soon" buttons | 7 | 0 |
| Pages showing the literal "TBC" | yes | none |
| Em dashes in rendered copy | 3 | 0 |
| Entry fee position at 360 px | 7.3 screens down | 5.5 screens down |
| Entry fee position at 1280 px | 4.4 screens down | 3.3 screens down |

## 1. Verification of my round-1 items

| # | Item | Status | Evidence now |
|---|---|---|---|
| M1 | Every action was a dead end; "TBC" shown as the email | **Fixed** on the site (live channel still needs the client) | Nav, hero and hackathon buttons say "How to register" and go to `#register`. Pending links are hidden. The status line reads "Links go live here in October." The contact line reads "Contact email coming soon", with no copy button. Audience-specific mailto links appear once an email is set. |
| M2 | Register band copy | **Fixed** | Heading "Registration opens in October" (D3). One factual line, then a status line instead of disabled buttons. The fee now carries a visible "Fee to be confirmed" pill. |
| M3 | Four contradictory statements about where the money goes | **Fixed** | One `donationNote` sentence (D1), shown in prizes and the fee FAQ only. The phrases "prize pool", "remaining proceeds" and "profits" are gone. |
| M4 | Fee missing from At a glance | **Fixed** | Cells are now Dates · Entry fee · Duration · Team size. The fee cell has the sub-label "working figure". |
| M5 | Timeline and programme contradicted each other; FAQ stated an invented policy | **Fixed** | September is "In progress… once approvals are in place". The programme legend says "for hackathon participants". The sessions FAQ is marked TBC. One small residue is noted in §3-4. |
| M6 | Hedge overload | **Partly** | The consolidated "Still being finalised" note is in place, and the triple hedge and the duplicate logistics rows are gone. Two places are still over-hedged: (a) the hero hedges the dates 3 times ("planned for", the "Dates tentative" badge, and "(tentative)" in the countdown caption); (b) 5 FAQ items show a TBC pill *and* repeat "still to be confirmed" in the answer. See §3-3. |
| M7 | Discord age (13+) versus a Grade 6 Junior division | **Fixed on page** (policy is a client decision) | The FAQ "Is there an age limit?" uses the D1 wording and appears straight after "Who can take part?". |
| S1 | CAS rationale sits in About and pushes the hackathon down | **Partly** | The copy is rewritten as I suggested: "Why a hackathon", "many" instead of "most", no colon-reveal, and the strands are labelled "The two IB CAS strands this project covers". The block has **not moved**, so the hackathon still starts at 4.8 screens on mobile. See §3-1. |
| S2 | Three near-identical summaries | **Fixed** (by my edit, §2) | The hackathon lead repeated the About "Build" pane word for word. It now gives the D1 framing and then says what the section covers. |
| S3 | "AI rules" heading covered non-AI rules | **Partly**, now fixed by my edit | The team-size rule was removed and the draft note added. I renamed the heading (§2). One config rule still repeats the judging block (§3-2). |
| S4 | Countdown implied a confirmed start time | **Fixed** | Caption now reads "Countdown to 24 October 2026 (tentative)" (D1). |
| S5 | "Programme" was ambiguous | **Fixed** | Nav says "Sessions". The hero button says "See the induction sessions". The footer says "Induction sessions". |
| S6 | Divisions copy used an em dash and "not X" | **Fixed** | Copy used verbatim. |
| S7 | Phrasing table | **Fixed** (12 of 13) | "A pitch that lands", the logistics em dash, "What you need", "How the event runs", the topics intro, the FAQ lead, the footer disclaimer, the team lead and the role labels are all done. "VLK" is kept per D1. |
| S8 | FAQ: "How do I register?" first, then reorder | **Fixed** | The order matches what I proposed, including the age question. |
| S9 | Missing sponsor, school, NGO and "after you register" content | **Partly** | The NGO "what to expect" line is added. Audience contact lines exist and appear once an email is set. Still missing: the sponsor note is a passive statement rather than an invitation (§3-2), and there is no line for teachers. "What happens after registering" waits on the client. |
| N1–N6 | Nice to have | Mostly fixed | Numerals are consistent ("4" everywhere, from config). About panes now link to their sections. "Across Mumbai" is removed. The timeline lead is shortened. The judging fallback is synced. The binary tape is kept. |

## 2. Changes I made (all in `src/hackathon.html`, done with exact-string edits only)

1. **Section lead (line 7). Removed the word-for-word duplicate of the About "Build" pane.**
   - Before: "Teams work on a social problem linked to the UN Sustainable Development Goals, build a working prototype with any tools they like, AI included, and pitch it to judges. Juniors get a structured problem statement; seniors define their own."
   - After: "Teams work on a social problem linked to the UN Sustainable Development Goals. Juniors get a structured problem statement; seniors define their own. This section covers who can enter, what it costs, the rules and how judging works."
   - Why: it keeps the D1 framing and turns the lead into a signpost, instead of a third copy of the summary.
2. **Teams and registration paragraph (line 90).**
   - Before: "Registration, the Discord server and the participant rulebook open together. The register section below always has the current status."
   - That first sentence appeared word for word three times on the page (here, the timeline and the register band), and the second sentence talked about the page itself rather than the event.
   - After: a state-aware pair using the existing global `data-hide-if` / `data-show-if` mechanism.
     - Closed: "Registration opens in October, at the same time as the participant rulebook."
     - Open: "Registration is open. Read the participant rulebook before you register."
   - No new facts: both statements already appear in the D1/D3 copy.
3. **Rules heading (line 127).**
   - Before: "AI and vibe-coding rules".
   - After: "Rules, including AI and vibe coding".
   - Why: the list also covers submissions, the build period, the theme and the rulebook. The new heading keeps the client's own term "vibe coding", which they asked for by name, while describing the list accurately.

After these edits: the strict build passes with only the `siteUrl` warning, and `shoot.py` shows no overflow and no console errors in all 6 runs.

## 3. Absolute final feedback for the lead

1. **IA judgement call: move the CAS rationale out of About.** Owner: B4 (markup move), E1 (spacing check).
   - Move `.ab-why`, `.ab-issue` and `.ab-cas` from `about.html` into a short block at the top of `#team`, headed "Why we're running this". That puts it next to the organising team, which is where a CAS coordinator or sponsor looks for accountability.
   - Effect: About becomes one screen (the lead plus the Learn/Build panes), and the hackathon moves up by about 1.5 screens on mobile. That section holds the fee, the eligibility rules and the "How to register" button.
   - I did not do this myself because it is a structural move across two files and their scoped CSS, not a surgical copy edit.
2. **Config copy for E2** (I can't edit `config.js`):
   - `aiRules[2]` "You are judged on the solution, not the code: feasibility, implementation thinking, the MVP and the pitch matter most."
     - Delete it. "What judges look for" sits directly below and says the same thing.
     - It is the fourth "solution, not the code" line on the page; the others are in the About "Why a hackathon" block, the "Can we use AI tools?" FAQ and the judging block.
   - `sponsorsNote` "External sponsorship is possible, subject to school approval."
     - Change to: "Interested in supporting prizes, tool subscriptions, a judge or the guest speaker? Sponsorship is subject to school approval; contact details are below."
     - This turns a passive statement into an invitation, and every element of it is sourced.
   - `linksPendingText` "Links go live here in October."
     - Change to: "The registration link will appear here."
     - The heading directly above already says "in October".
   - `timeline[2].detail` "Registration, the Discord server and the participant rulebook open together."
     - Fine to keep here. It is now said only here and in the register band, which is acceptable.
3. **Remaining hedge duplicates.** Owners: E2 (config) and E1/B1 (hero).
   - FAQ items marked `tbc: true` show a "To be confirmed" pill *and* end with "…still to be confirmed".
     - Pick one per item. My recommendation is to keep the pill and cut the trailing clause.
     - "Who can take part?" would then end at "…whether college students can enter Senior."
     - The pattern applies to "When is it…", "What does it cost?" ("The working figure is ₹2,000 per team.") and "How big can a team be?".
   - Hero: the dates are hedged three times above the fold.
     - The countdown "(tentative)" wording is required by D1, and the "Dates tentative" badge is the standard treatment.
     - So change only the lead wording, from "planned for 24–25 October 2026" to "on 24–25 October 2026". The badge already carries the hedge.
4. **Small consistency residue in the sessions FAQ.** Owner: E2.
   - The FAQ says prep sessions "are open to registered participants". The timeline says they are already in progress, while registration opens in October.
   - Change to: "…The online preparation sessions are for hackathon participants and will help you get ready." This matches the programme legend.
5. **Client blockers that decide whether the site can convert visitors.** These are listed only because they matter for launch.
   - As it stands, a visitor can read everything but cannot act on anything.
   - **One live contact channel** (`contact.email` or `interestUrl`) is the single change that would move Register from 7 to 9.
   - Also needed: the Junior lower grade and an under-13 policy (Discord's minimum age), plus what happens after someone registers (payment, confirmation, Discord invite).

## 4. Provisional scores (E5 lens)

| Component | R1 | R2 | Note |
|---|---|---|---|
| Nav | 6 | 8 | "How to register" is honest, "Sessions" is clear, and there is a skip link. |
| Hero | 7 | 8 | Strong headline and honest CTAs. The dates are slightly over-hedged (§3-3). |
| About | 5 | 6 | Copy is much cleaner, but the CAS block is still in the student's path (§3-1). |
| Hackathon | 6 | 8 | Fee is in At a glance, one funding sentence, and the duplicate lead and mislabelled rules heading are fixed. One redundant rule remains (§3-2). |
| Programme | 6 | 8 | Uses the client's "induction sessions" term. The NGO block is honest and tells partners what to expect. |
| Timeline | 6 | 8 | Statuses are now believable; nothing claims sessions have already happened. |
| Team | 6 | 7 | Clear lead and sentence-case roles. Still no named supervisor (client). |
| FAQ | 7 | 8 | Right order, plus a register question and an age question. Double hedges remain (§3-3). |
| Register | 3 | 7 | No dead ends and honest status. It still offers no action until the client supplies a channel. |
| Footer | 5 | 8 | Accurate disclaimer and no placeholder links. |
| **Overall (copy / IA / credibility)** | **5** | **7.5** | This reaches 8.5 or more with §3-1 to §3-3 done and one live contact channel. |
