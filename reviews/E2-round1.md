# E2 — Content accuracy & requirement coverage — Round 1

**Method.** Rebuilt (`python3 build.py`, 0 warnings), rendered `dist/index.html` in Chromium (Playwright) and audited `document.body.innerText` *after* `main.js` ran (config overrides the static fallbacks; FAQ bodies read separately). Every claim checked against `docs/meeting-summary-19-aug.md` (MS) and `docs/proposal-form.md` (PF). Single-source test: changed every TBC value in an in-memory copy of `config.js` (name, dates, daysLabel, duration, teamMax, solo, fee, sessions, all `*Note` strings) and re-rendered to list what did **not** update. Scripts: `reviews/scratch/e2_text.py`, `e2_faq.py`, `e2_mutate.py`, `e2_ngo.py`. Verified 24 Oct 2026 is a Saturday.

## 1. Scores

| Component | Score | Reason (content lens) |
|---|---|---|
| Nav | 8 | Name comes from config; labels accurate. |
| Hero | 6 | "Teams of up to four" is hard-coded. "Choose a problem" is wrong for juniors, who are given problem statements. The countdown to the second implies a 09:00 start time that no source gives. |
| About | 7 | Closely sourced from PF. TBC values (dates, 6–8, 24-hour) are only dotted-underlined, so they read as confirmed. Mild overstatement in "Why a hackathon". |
| Hackathon | 5 | The donation model is stated as decided. Some vibe-coding rules are invented but read as binding. Solo, fee badge, "Tentative" and "Saturday to Sunday" are not driven by config. Five `*Note` config keys are never used. |
| Programme | 6 | NGO pipeline works and topics are correct. The client's term "induction sessions" never appears. "Six working topics" is hard-coded. "Across Mumbai" is invented. `ngosEmptyText` is unused. |
| Timeline | 5 | September is marked **done** ("Offline sessions start with NGO… groups"), which contradicts the empty NGO list ("will be announced soon"). Donations are stated as fact. The date duplicates config. |
| Team | 8 | Names, order and role labels match the PF table exactly. "Website: Vihan" is not on PF (it comes from the brief). Possible VLK/Vihan duplicate (see Questions). |
| FAQ | 5 | One invented answer ("not required"). Fee, team size and dates are typed into config strings, so they don't follow the facts. |
| Register | 6 | The fee and dates read as final because there is no visible TBC text, only a dotted underline. Contact shows a literal "TBC". |
| Footer | 6 | The disclaimer says TBC items are "subject to school approval", which is inaccurate. |
| **E2 overall (accuracy + coverage + single source)** | **5** | All 8 client requirements have a home. But 4 claims are invented or overstated, the donation model is stated as decided in 5 different wordings, and the config is not the single source for ~15 visible values. |

## 2. Requirement checklist (client list)

| Requirement | Status | Where (rendered) | Notes |
|---|---|---|---|
| Prize money and awards | **Present (values TBC)** | #hackathon › "Prizes and awards" (2 cards from `hackathon.prizes`); FAQ "What are the prizes?" | Correctly invents no amounts. No award categories yet (e.g. per division), which has to come from the client. |
| Registration fee | **Present** | #hackathon › "Teams and registration" (`feeText` + badge); #register ("Registration fee ₹2,000 per team."); FAQ "What does it cost?" | TBC marking is inconsistent: badge in #hackathon, dotted underline only in #register (Must fix 6). |
| Team limit details | **Present** | At a glance "Up to 4 per team"; Teams block "Up to 4 per team · confirmed"; Solo "To be confirmed · potentially permitted"; FAQ; Register; About | Correctly shown as **confirmed** (MS: "Max 4… That's confirmed."). Solo correctly TBC. |
| Vibe-coding rules | **Present, partly invented** | #hackathon › "AI and vibe-coding rules" (8 rules from `aiRules`) + FAQ "Can we use AI tools?" | Rules 2 and 5 are not in the sources. `aiRulesTbc`/`aiRulesNote` exist but aren't rendered, so draft rules read as final (Must fix 4). |
| Other logistics | **Present** | Logistics list (format, platform, submissions, support, duration, what to bring, rulebook); "How the day runs" (7 steps); "What judges look for"; divisions | Flow, deliverables and judging match MS/PF. Exact start time and schedule are rightly deferred to the rulebook. |
| NGO list, ready to receive data | **Present** | #programme › "Where we're teaching" `data-render="ngos"` + `<template>` | Tested with 2 entries (one without url/focus): renders correctly, empty fields hidden, empty state removed. But the empty-state text is static, and `ngosEmptyText` in config does nothing. |
| Number of induction sessions | **Partial** | About "6–8 sessions"; Programme glance "Sessions 6–8 · Exact number to be confirmed" | The value and TBC status are right (MS: "approximately 6–8… estimate"). The word **"induction"** appears nowhere, so the client won't recognise their requirement (Should fix 1). |
| Session topics | **Present** | #programme › "Session topics": 6 topics, 2 tracks; hardware marked "Subject to equipment" | Matches MS §2C and BRIEF. The descriptions are illustrative elaborations (prompting, phishing, circuits and sensors), which is acceptable. |

## 3. Must fix (blocking)

**1. Invented FAQ answer: sessions "are not required."** Owner **B5**, `src/config.js:327–330` (`faq[8]`).
- Rendered text: "No. The online preparation sessions… are worth joining, but they are not required." No source says this.
- B4's static fallback (`faq.html:69`) correctly says "we'll confirm whether any are required", but config overrides it.
- **Fix:** set `a:` to "Not necessarily. The online preparation sessions on AI, vibe coding and pitching are built to get hackathon teams ready, and we recommend them. Whether any are required is still to be confirmed." and add `tbc: true`.

**2. The fee/prize/donation model is stated as decided, in 5 different wordings.** Owners **B2 + B5**.
- Sources: MS §4 says funding and prizes were "discussed extensively but not finalised… Some proceeds **could** support prizes, while remaining profits **could** be donated". The action list says "Finalise registration fee, prizes and donation model — **Not yet decided**". Sponsorship "would have to be checked" with the school.
- The page says:
  - `hackathon.html:90` "Registration fees fund the prize pool. Whatever remains after prizes are paid is donated…". This says *all* fees go to prizes, and "prize pool" is not in any source.
  - `hackathon.html:118–121` aside "After prizes are paid, remaining proceeds are donated…". This is static; `donationNote` is unused.
  - `config.js:93` prize note "Funded from part of the registration proceeds **and any external sponsorship**." This presents sponsorship funding as given.
  - `config.js:319` FAQ "…remaining profits are donated…".
  - `config.js:280` timeline "Remaining proceeds are donated to the partner NGOs…".
- **Fix (B5):**
  - `donationNote: "The plan is for part of the registration proceeds to fund the prizes, with remaining profits donated to the NGOs and community organisations connected with the education programme. The final model is still to be confirmed."` and add `donationTbc: true`.
  - `prizes[0].note: "How prizes are funded is still being finalised."`
  - `timeline[4].detail: "Results are announced and prizes awarded. Remaining profits are planned to go to the partner NGOs and community organisations."`
  - FAQ cost answer: reuse the `donationNote` sentence.
- **Fix (B2):**
  - Replace `hackathon.html:90` with `<p data-fact="hackathon.donationNote">…</p>`.
  - Replace the aside `<p>` (line 120) with `<p data-fact="hackathon.donationNote">…</p>` and add `<p data-fact="hackathon.sponsorsNote">External sponsorship is possible, subject to school approval.</p>`.
  - Delete the duplicate in one of the two places: the teams paragraph or the aside, not both.

**3. Timeline says the literacy sessions have happened, which contradicts the programme section.** Owner **B5**, `config.js:258–263` (`timeline[1].status: "done"`).
- Rendered text: "September 2026 · Literacy sessions begin · Offline sessions start with NGO and community groups" with a done node.
- But #programme says "Partner organisations will be announced soon. We're confirming sessions with NGOs…", and no source confirms any session ran. B4's fallback had `next`.
- **Fix:** `status: "next"`, detail "Sessions are planned to start in September: offline with NGO and community groups once approvals are in place, and online preparation sessions for hackathon participants."
- Flip it to `done` only when the client confirms the sessions ran **and** sends the NGO list.

**4. Draft vibe-coding rules read as final, and two are invented.** Owners **B2 + B5**.
- `config.js:124–125` defines `aiRulesTbc: true` and `aiRulesNote`, but `hackathon.html:141` renders a static note: "The full rulebook… is the final word". There is no draft marker.
- Invented rules (not in MS/PF):
  - `aiRules[1]` "…as long as your team can explain how your solution works"
  - `aiRules[4]` "You must build your project during the build period." No rule on prior work was discussed.
- `aiRules[0]` "allowed **and encouraged**": "encouraged" is unsourced.
- **Fix (B2):**
  - Heading: `<h3 class="hk-block__title">AI and vibe-coding rules <span class="badge badge--tbc">Draft</span></h3>`.
  - Line 141: `<p class="hk-rules__note" data-fact="hackathon.aiRulesNote">…</p>`.
- **Fix (B5):**
  - `aiRules[0]` → "You may use AI tools freely: code assistants, chatbots and generative tools are all allowed."
  - `aiRules[1]` → "Vibe coding is welcome: generating code with AI is allowed."
  - Delete `aiRules[4]`, or keep it only if the client confirms it.
  - `aiRulesNote` → "Working rules, to be confirmed. The participant rulebook, published before the event, is the final word."

**5. `config.js` is not the single place to edit TBC facts. The mutation test found these still showing old values after a config change.** Owners as listed.
- Fix this with one mechanism instead of per-string edits:
  - **(B5) Token interpolation in `main.js`.** Every string rendered from config (faq, aiRules, logistics, timeline, flow) should replace `{teamMax}`, `{feeText}`, `{dates}`, `{durationText}`, `{daysLabel}`, `{sessionsCount}` with the computed fact.
  - **(B5) A `data-tbc-flag="path"` attribute.** `main.js` sets `hidden` on the element when that flag is `false`. Use it on every static "Tentative" / "To be confirmed" / "proposed" label.
- Instances:
  - a. **B2** `hackathon.html:81`: "Solo entries · To be confirmed · potentially permitted" has no `data-fact`. Setting `soloAllowed: "Yes"` changes nothing. → `<span class="hk-stat__value tbc" data-fact="hackathon.soloText">To be confirmed</span> <span class="hk-stat__sub" data-tbc-flag="hackathon.soloTbc">potentially permitted</span>`.
  - b. **B2** `hackathon.html:85`: the fee badge "To be confirmed" stays after `fee.tbc:false` → add `data-tbc-flag="hackathon.fee.tbc"`. Same treatment for:
    - `hackathon.html:19` "Tentative" → `datesTbc`
    - `hackathon.html:33` "proposed, not yet locked" → `durationTbc`
    - **B1** `hero.html:6` "Tentative" → `datesTbc`
    - **B3** `programme.html:24` "Exact number to be confirmed" → `sessionsTbc`
  - c. **Team size typed as a word:**
    - **B1** `hero.html:11` "Teams of up to four" → `Teams of up to <span data-fact="hackathon.teamMax">4</span>`.
    - **B2** `hackathon.html:89` "Register as a team of up to four." → same pattern.
    - **B5** `aiRules[5]` "at most four members" → "at most {teamMax} members".
    - **B5** FAQ `faq[2]` "Up to 4 people" → `{teamMax}`.
  - d. **"Saturday to Sunday"** is hard-coded in 3 places and `daysLabel` is never used:
    - **B2** `hackathon.html:19` → `<span data-fact="hackathon.daysLabel">Saturday to Sunday</span>`.
    - **B5** set `daysLabel: "Saturday to Sunday"` (no arrow) and use `{daysLabel}` in `timeline[3].detail` and `faq[4]`.
  - e. **Duration duplicated:** `config.js:161` `logistics[4].value: "24 hours (proposed)"` and `faq[4]` "A 24-hour build" → `{durationText}`.
  - f. **Dates duplicated:** `timeline[3].when: "24–25 October 2026"` and `timeline[3].tbc` duplicate `hackathon.dates` / `datesTbc` → `{dates}`, and `main.js` should derive `tbc` from `datesTbc`. Same for `faq[4]`. Submissions are also duplicated: `logistics[2]` vs `hackathon.submissions`.
  - g. **Fee duplicated:** `faq[6]` "₹2,000 per team" → `{feeText}`.
  - h. **B3** `programme.html:42`: "Six working topics across two tracks." is static → "The working topics, across two tracks. The final list and the number of sessions are still being confirmed."
  - i. **B1 + B5** `head.html:7,11,12`: meta description and og tags hard-code "24–25 October 2026", "up to four" and "DH 2026". JavaScript cannot fix these because link previews and crawlers read the static HTML.
    - B1: replace them with `{{dates}}`, `{{teamMax}}`, `{{name}}`.
    - B5: `build.py` fills these placeholders from `config.js` (regex the literal values, e.g. `re.search(r'dates:\s*"([^"]+)"', cfg)`).
  - j. **B5:** config keys that are documented as editable but are never read: `donationNote`, `sponsorsNote`, `aiRulesNote`, `rulebookNote`, `programme.ngosEmptyText`, `howItRuns`, `period`, `theme`, `deliverable`, `description`, `daysLabel`, `schoolShort`, `cas`, `mark`. Wire each one up (items 2, 4 and 5d, and B3 `programme.html:187` → `data-fact="programme.ngosEmptyText"`), or delete it. Then correct the header claim "everything on the site reads from here" (`config.js:5`) to match.

**6. TBC values in the Register band and About read as confirmed.** Owner **B4**.
- `.tbc` is only a dotted underline plus a `title` tooltip. Touch users and screen readers never see the tooltip.
- `register.html:8` "Registration fee ₹2,000 per team." is the conversion point and shows no visible caveat.
- `register.html:7` "The hackathon runs 24–25 October 2026" is likewise unhedged.
- **Fix:**
  - `register.html:7` → "The hackathon is planned for <span …>24–25 October 2026</span> (tentative), online on Discord."
  - `register.html:8` → "Teams of up to 4. Registration fee <span …>₹2,000 per team</span> <span data-tbc-flag="hackathon.fee.tbc">(working figure, to be confirmed)</span>."
  - `about.html:16,34,36` → add a visible "(TBC)" suffix with `data-tbc-flag`.
  - **B1**, optional: add `.tbc` text with `aria-describedby`, or a visible `::after{content:"*"}` with a footnote, so the marker has visible meaning.

## 4. Should fix

1. **Use the client's term "induction sessions".** Owners **B3 + B5**.
   - The client asks for "number of induction sessions". The page says "Sessions", "literacy sessions" and "preparation sessions", and never "induction".
   - Fix `programme.html:22`: label "Sessions" → "Induction sessions". Note → "6–8 across both tracks · exact number to be confirmed".
   - Fix `programme.html:16` lead → "…runs <span data-fact="programme.sessionsCount">6–8</span> induction and technology-literacy sessions…".
   - Fix `about.html:16` "6–8 sessions" → "6–8 induction sessions".
   - **B5:** add `sessionsLabel: "induction sessions"` so the term can be changed in one place.
   - Confirm scope with the client (see Questions).

2. **"Choose / pick a problem" is inaccurate for juniors.** MS: "Younger category: more specific problem areas/questions should be provided."
   - **B1** `hero.html:11` "Teams of up to four choose a problem linked to the UN SDGs" → "…tackle a social problem linked to the UN Sustainable Development Goals".
   - **B4** `about.html:32` "pick a social problem" → "tackle a social problem".
   - **B2** `hackathon.html:7` "Pick a social problem" → "Tackle a social problem".

3. **The countdown implies a fixed start time.**
   - **B1** `hero.html:17` caption "Opening ceremony starts in": 09:00 IST comes from the brief, not the sources.
   - → "Hackathon starts in (tentative)", and `aria-label="Time until the hackathon's tentative start"`.

4. **"Where we're teaching" empty state has invented detail.** **B3** `programme.html:188`: "We're confirming sessions with NGOs and community centres **across Mumbai**." Neither the location nor the progress is sourced. → "Partner organisations will be listed here once approvals are in place."

5. **Footer disclaimer is inaccurate.** **B1** `footer.html:32`: "Dates, fees and prizes marked 'to be confirmed' are subject to school approval." These are pending the organising team's decisions; only sponsorship and offline sessions need school approval. → "Details marked 'to be confirmed' are working figures and may change before the event."

6. **Unsourced registration process.**
   - `config.js:267` timeline "October 2026 … and registration opens"
   - `register.html:7` "Registration opens when the rulebook is published."
   - Neither appears in MS/PF. They are consistent with each other, so keep them only if the client confirms. Otherwise use "Registration details will be announced here."

7. **Guest speaker topic invented.** **B5** `config.js:139`: "A short talk from an invited speaker on technology and social impact." MS lists "Identify potential guest speaker(s)" as Pending. → "A talk from an invited guest speaker (to be announced)."

8. **Duration is hedged twice in the same row.**
   - At a glance shows "24 hours (proposed)" plus the sub "proposed, not yet locked".
   - Logistics shows "24 hours (proposed) To be confirmed".
   - → **B2** `hackathon.html:33` sub → "Not yet locked". **B5** `logistics[4]`: value `{durationText}` and drop `tbc:true`, or keep the badge and value "24 hours". Pick one hedge per row.

9. **"4" vs "four" is inconsistent.**
   - Numerals: About, glance, stats, FAQ, Register.
   - Words: hero, teams body, rule 6, og.
   - Using `data-fact` everywhere (Must fix 5c) also fixes this. Use the numeral "4".

10. **"Fully online" and Discord are stated as settled, but the sources hedge.**
    - MS: "leaned strongly toward an online hackathon… Discord emerged as the **likely** platform". PF: "An online event is strongly preferred, likely using Discord".
    - The BRIEF treats online as confirmed, so don't add hedges everywhere. Ask the client to confirm (see Questions).

11. **Contact shows the literal "TBC".** **B5** `config.js:243`, rendered in Register and Footer. → `email: "Email address coming soon"`. `bindCopy` already hides the copy button when there is no "@".
    - Out of lens: "Ask about hosting a session" (`programme.html:194`) links to #register, which offers no working contact, so it is a dead end until the email is real.

12. **DEPLOY.md describes a different codebase.** **B5** `DEPLOY.md:22,23,66` refers to `build/sections/`, `education.html`, `cta.html`, JSON-LD `startDate`/`offers.price`, and a "9 am start". None of these exist here. Rewrite it for `src/` + `config.js` + `build.py` + `dist/`, and list `head.html` meta as the one non-config place until Must fix 5i lands.

## 5. Nice to have

- **B4** `about.html:44`: "Today AI solves most of those problems outright… pure competitive programming draws a narrow group of students" overstates MS ("AI can easily solve **many**", "fewer students **may** be interested"). → "AI can now solve many of those problems easily… and pure competitive programming may attract a narrower group of students."
- **B5** `config.js:99`: "**Tool** subscriptions and other awards are under discussion." → "Subscriptions and other non-cash awards are under discussion." (MS says "non-cash prizes/subscriptions").
- **B5** `config.js:162`: "What to bring" is unsourced, and "a charged battery" is odd for an at-home online event. → "A laptop or computer and a stable internet connection."
- **B4** `team.html:6`: "Run by Year 12 students at DAIS." → "Initiated, planned and run by Year 12 students at DAIS." This mirrors PF's CAS definition and helps with school approval.

## 6. Consistency audit (rendered)

| Fact | Reads | Verdict |
|---|---|---|
| Dates | "24–25 October 2026" ×6, plus "late October" ×2 and "October hackathon" (static) | Value consistent. Hedge is visible in hero, glance and timeline, but not in About or Register. |
| Team size | "Up to 4 per team" / "Teams of up to 4" / "up to four" / "at most four members" | Same value, mixed form, 4 copies not config-driven. |
| Fee | "₹2,000 per team" ×3 | Value consistent. Hedge visible in #hackathon and FAQ, not in #register. |
| Duration | "24 hours (proposed)", "24-hour build", "A 24-hour build is proposed", "over the weekend" | Consistent, but double-hedged in two rows. |
| Sessions | "6–8 sessions", "6–8 · Exact number to be confirmed", "Six working topics" | Consistent. "Six" is static. |
| Donation model | 5 wordings: "fees fund the prize pool" / "part of… proceeds and any external sponsorship" / "remaining proceeds are donated" / "remaining profits are donated" / "donated to the partner NGOs" | **Inconsistent and over-certain** (Must fix 2). |
| Divisions | Junior "Grade 10 and below" (6 or 8 TBC), Senior "Grade 11 and above" (college TBC) | Correct everywhere. |
| Judging criterion | "Prototype (MVP)" (config) vs "Prototype / MVP" (static fallback) | Only config renders, so fine. |

## 7. What's working

- **Team block is faithful to the PF table.** Names, order, repeated members (Arjun, Nishkarsh, Aryan) and role labels ("Media + Outreach", "Online — Hackathon + Sessions", "Offline Sessions") all match. It uses the form's "Nishkarsh" rather than the MS's "Nishkar", which is correct.
- **"Max 4 per team" is the only hackathon fact shown as "confirmed"**, and solo, grade boundaries, college entry, fee, prizes, duration, submissions platform, rubric and hardware are all hedged. This is the right split per MS §3 and the closing caveat.
- **Flow, deliverables (MVP + pitch deck + implementation explanation) and judging criteria match MS/PF word for word in substance.** "HackerRank" is correctly spelled (PF has "Hackerank").
- **No prize amounts, NGO names or participant numbers are invented anywhere.** Prize cards use "Amount to be confirmed" badges.
- **The NGO pipeline is genuinely ready.** Dropping `{name, location, focus, url}` objects into `programme.ngos` renders cards, hides missing fields and removes the empty state (tested).
- **The About and CAS strands are lifted from the proposal form** (global issue, Service, Creativity). Keep them; they help with school and sponsor credibility.

## Questions for the lead / client

1. **Induction sessions.** Does "number of induction sessions" mean all 6–8 literacy sessions, or only the online hackathon-prep sessions? The page should name and count whichever the client means.
2. **"VLK" and "Vihan".** "VLK" (Online — Hackathon + Sessions, from PF) and "Vihan" (Website, added by the brief) may be the same person. If so, list him once, e.g. "Vihan (VLK)", so the team doesn't appear to have an extra member.
3. **Discord's age rule (severe, outside lens).** Discord's terms require users to be 13+. A Junior lower boundary of Grade 6 means about 11-year-olds. Does the team know, and does it affect the Grade 6 vs 8 decision?
4. **Registration timing.** Is "registration opens when the rulebook is published" the actual plan?
5. **Format.** Is "fully online on Discord" now confirmed? The sources only say "strongly preferred / likely".
