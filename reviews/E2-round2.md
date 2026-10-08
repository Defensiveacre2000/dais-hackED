# E2 — Content accuracy & requirement coverage — Round 2 (semi-final)

**Method.**
- Rebuilt the site (`build.py --strict`: only the expected `siteUrl` warning) and ran `shoot.py` (no overflow, no console errors and no unresolved `{tokens}` at any of the six width/scheme combinations).
- Re-read the rendered `innerText` against the meeting summary (MS), the proposal form (PF) and `ROUND1-DECISIONS.md`.
- New scripts:
  - **`reviews/scratch/e2_mutate2.py`**: copies the project, changes ~20 TBC facts in `config.js`, **rebuilds**, then renders. This also tests the head tags and JSON-LD filled in at build time.
  - **`reviews/scratch/e2_nojs_diff.py`**: compares every `data-render` list's static fallback (JavaScript off) with what config renders (JavaScript on).

## 1. Verification of my round-1 items

| # | Item | Status | Evidence (round 2) |
|---|---|---|---|
| M1 | FAQ: invented "sessions are not required" | **Fixed** | Answer now: "We'll confirm this when registration opens…", marked TBC (D1 wording). |
| M2 | Donation/prize model stated as decided, in 5 wordings | **Fixed** | One sentence (`donationNote`), shown in the prizes block and the fee FAQ only. "Prize pool", the sponsorship-funds-prizes line and the timeline donation claim are gone. `sponsorsNote` is now rendered. |
| M3 | Timeline said the sessions had happened | **Fixed** | September is now `next`, with "…once approvals are in place". It is labelled "In progress" per D1, which is acceptable because the item is about the phase beginning. |
| M4 | Draft rules read as final; two invented | **Fixed** | "Draft rules. The participant rulebook… is final." shows under the heading. Rules 2 and 5 use the D1 wording. "Encouraged" removed. Duplicate team-size rule removed. |
| M5 | `config.js` was not the single source | **Fixed** (one workflow gap: §3-1) | Mutation test: dates, weekdays, duration, team size, fee, solo, sessions count and label, format, platform, submissions, name, school, email and topic count all update. "Tentative", fee and duration labels hide when their flag is false. Head tags and JSON-LD follow config at build time. All 11 list fallbacks match config text exactly (whitespace differences only). Only one dead key was left (`howItRuns`), and I removed it. |
| M6 | TBC visible only as a dotted underline in Register and About | **Fixed** | Register: "…₹2,000 per team. Fee to be confirmed". About: "Dates tentative" pill. Hero: "Dates tentative" badge plus "(tentative)" in the countdown caption. |
| S1 | Client term "induction sessions" | **Fixed** | Glance label, lead, About, footer and hero button. `sessionsLabel` is in config. |
| S2 | "Choose / pick a problem" was wrong for juniors | **Fixed** | Copy now says teams "work on a social problem…". The hackathon lead adds "Juniors get a structured problem statement; seniors define their own." |
| S3 | Countdown implied a 09:00 start | **Fixed** on page; **partly** in JSON-LD (§3-2) | Caption: "Countdown to 24 October 2026 (tentative)". |
| S4 | "Across Mumbai" | **Fixed** | Removed. |
| S5 | Footer "subject to school approval" | **Fixed** | Now "Details marked 'to be confirmed' may change before the event." |
| S6 | Unsourced registration process | Fixed by decision | D1/D3 make "Registration opens in October together with the rulebook" the lead's stated plan. It is consistent in hero, hackathon, timeline, FAQ and register. |
| S7 | Invented guest-speaker topic | **Fixed** | Now "A talk from an invited guest speaker (to be announced)." |
| S8 | Duration hedged twice in one row | **Fixed** | Glance: "24 hours · of building · proposed". Duration row removed from logistics. |
| S9 | "4" vs "four" | **Fixed** | Numeral "4" everywhere, all from `teamMax`. |
| S10 | "Fully online" / Discord stated as settled | **Fixed** (D1) | "Online (planned)" from `format`. FAQ: "The plan is to run it online…". |
| S11 | Contact showed the literal "TBC" | **Fixed** | "Contact email coming soon" comes from `emailPendingText`, with no copy button. |
| S12 | Stale DEPLOY.md | **Fixed** (E4/B5) | Rewritten for `src/` + `config.js` + `dist/site/`. |
| N1–N4 | About overstatement, "Tool subscriptions", "What to bring", team lead | **Fixed** | All four changed as suggested or better. |

**Requirement checklist (round 2):** all 8 client items are now **present**.
- Prizes and awards: block with "To be announced" values.
- Fee: in At a glance, Teams, FAQ and Register.
- Team limit: "Up to 4", stated as confirmed.
- Vibe-coding rules: shown as draft.
- Logistics, flow and judging: present.
- NGO list: renders from config and has an empty state.
- **6–8 induction sessions**: present and marked TBC.
- Session topics: 6 topics across 2 tracks.

**Team:** names and their grouping match the PF table. B4/E5 changed the role labels to sentence case ("Media and outreach", "Online: hackathon and sessions", "Offline sessions"). The meaning is the same, so I accept it.

## 2. Changes I made

All edits are small. `config.js` was edited with exact-match replacements; the HTML with the Edit tool.

| File | Change | Why |
|---|---|---|
| `src/config.js` `aiRules[4]`, `flow[4].desc`, `logistics[3].value`, `timeline[2].detail` | `Discord` → `{hackathon.platform}` | The platform is "likely Discord" (MS). The mutation test showed 4 config strings that would go stale if it changed. The rendered text is unchanged, so the static fallbacks still match. |
| `src/config.js` `faq` "How big can a team be?" + `src/faq.html` fallback | Removed `tbc: true` and the "To be confirmed" pill | Max 4 is the one **confirmed** hackathon fact (MS: "That's confirmed"). The pill hedged it, and the answer already hedges solo entry inline. |
| `src/config.js` `programme.ngosEmptyText` + `src/programme.html:179` fallback | "Partner organisations will be listed here once approvals are in place." → "Sessions with NGO and community groups go ahead once school/CAS and partner approvals are in place." | The empty state was saying "partners announced soon" twice in a row. The new line is sourced (MS §2D approvals). |
| `src/config.js` `hackathon.pendingNote` + `src/hackathon.html:44` fallback | Added "the submission platform" to the "Still being finalised" list. Added a comment: edit this list by hand when a fact is confirmed. | HackerRank is marked "(proposed)" but was missing from the list, while the note claims everything unmarked is confirmed. |
| `src/config.js` `judgingTbc` | Comment: "when judges are confirmed: set false AND rewrite judgingNote (or set it to "")" | The mutation test showed the note text "…to be confirmed" survives the flag being set to false, because the flag only removes the underline. |
| `src/config.js` header | Checklist: FAQ answers need the text rewritten **and** `tbc` removed; added a `pendingNote` line. Corrected "KEYS USED ONLY BY build.py" → "ALSO USED", since `school` and `name` also render on the page. | So the person editing config isn't misled. |
| `src/config.js` `programme.howItRuns` | Deleted | Nothing reads it, so editing it did nothing. |

## 3. Final feedback for the lead (outside my edit scope)

1. **E4, `build.py`: editing one fact in config makes the build print up to 33 warnings, and `--strict` fails.** This is the one remaining single-source gap, and DEPLOY.md promises "only touch one file".
   - `check_static_drift` *warns* that each `data-fact` fallback in the HTML no longer matches config. A non-developer who changes the fee would get a wall of "src/about.html: data-fact=… says … but config says …". The no-JS page would also keep the old values.
   - **Fix:** have build.py *write* the config value into the fallback (in memory, before assembly) instead of warning:
     ```python
     def sync_static_facts(frag, facts):
         def rep(m):
             p = m.group(2)
             if p == "contact.email" or p not in facts: return m.group(0)
             s, e = m.start(3) - m.start(0), m.end(3) - m.start(0)
             return m.group(0)[:s] + html.escape(facts[p], quote=False) + m.group(0)[e:]
         return FACT_EL.sub(rep, frag)
     ```
     Apply it to every fragment in `main()` and keep `check_static_drift` only as a debug option.
   - `data-render` list fallbacks aren't checked at all. They match today (verified), but they will drift silently once FAQ or rules change. Pre-rendering them through node would be ideal; otherwise add a line in DEPLOY.md: "list fallbacks only matter for no-JavaScript visitors".
2. **E4, JSON-LD (`event_jsonld`): it asserts more than the sources do.**
   - `startDate "2026-10-24T09:00:00+05:30"` publishes a 9 am start to Google that nobody decided. Emit the date only (`"2026-10-24"` / `"2026-10-25"`); schema.org accepts Date.
   - `organizer` = the school is inaccurate: the PF says the project is "initiated, planned and implemented completely by the team". Use `{"@type":"Organization","name":"<name> organising team, Year 12 students at <school>"}`.
3. **E5, `hackathon.html:51`: "Two divisions, so younger students compete with students their own age."** This overstates the source: Junior spans about Grade 6–10, and MS only says juniors "should not compete directly against much older participants". → "Two divisions, so younger students don't compete against much older ones."
4. **E5, `hackathon.html:33`: "24 hours · of building".** The sources say a "24-hour (online) format". The countdown's `start`/`end` window is 24 hours *including* the opening, briefing and judging. → drop "of building", e.g. `<span class="hk-fact__sub">in total<span …> · proposed</span></span>`. Or the client confirms the build itself is 24 hours.
5. **E5 (low): "Discord" is hard-coded in two static lines.** `hackathon.html` (Teams body) and `register.html` ("Registration, the Discord server and the participant rulebook open together"). Wrap them in `<span data-fact="hackathon.platform">Discord</span>`. Everything else now follows config.
6. **Client questions (unchanged).**
   - Does "induction sessions" mean all 6–8 sessions or only the hackathon-prep ones? The page currently applies it to all.
   - Is "VLK" the same person as "Vihan"?
   - The Discord 13+ rule versus a Grade 6 lower boundary. The FAQ now states this honestly; the client must decide.
   - The send-blocking gaps listed in the guide (contact email above all).

## 4. Provisional scores (content lens)

| Component | R1 | R2 | Note |
|---|---|---|---|
| Nav | 8 | 9 | "How to register" while registration is closed is honest. |
| Hero | 6 | 8 | Accurate, single-sourced, dates hedged once. |
| About | 7 | 8 | Overstatements gone; facts come from config. |
| Hackathon | 5 | 8 | Donation model, rules and hedges all fixed. "Their own age" and "of building" remain (§3-3, §3-4). |
| Programme | 6 | 9 | Induction sessions, honest empty state, `topicsCountWord`. |
| Timeline | 5 | 9 | No claims that anything has happened yet; dates and TBC derived from config. |
| Team | 8 | 8 | Names match PF; VLK/Vihan still open. |
| FAQ | 5 | 9 | Every fact is a token. Age and register questions added. Team-size pill removed. |
| Register | 6 | 9 | Honest "opens in October" state; fee visibly TBC. |
| Footer | 6 | 9 | Accurate disclaimer; no "TBC" placeholder. |
| **E2 overall** | **5** | **8** | Every sourced fact is accurate and hedged once. Config drives the page and the head tags. What remains is build.py's fallback-drift warnings (§3-1) and two JSON-LD overstatements (§3-2). |
