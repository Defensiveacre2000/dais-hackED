# E5 — Copywriting, information architecture & credibility (round 1)

Method: built `dist/index.html`, rendered it in Chromium at 360, 768 and 1280 px, and read it top to bottom six times, once as each reader: a Grade 9 student, a Grade 12 student, a parent, an NGO coordinator, a potential sponsor and the DAIS CAS coordinator. Scripts are in `reviews/scratch/e5_*.py`.

Measurements used below (rendered text, FAQ answers included):
- The page is about 2,030 words. **41 hedge phrases** appear in it: "to be confirmed" ×16, "Opens soon" ×7, "proposed" ×5, plus "TBC", "Tentative", "still being finalised", "under discussion", "not yet locked", "potentially permitted", "may be allowed" and "subject to". That is roughly one hedge every 50 words.
- Repeated facts: "UN Sustainable Development Goal(s)" ×7 written out in full (plus "SDG" ×5), "24–25 October" ×6, "rulebook" ×8, "MVP" ×6, "Register your team" ×5. Team size is stated 8 times. Some form of "judged on the solution, not the code" appears 6 times.
- Scroll depth at 360 px (1 screen = 740 px): the hackathon section starts at **4.8 screens**, the fee first appears at **7.3**, prizes at **8.0**, the register band at **23.2**, and the page is 25 screens long. At 1280 px the fee is at 4.4 screens.
- Today (7 Oct) every action link is pending: register, Discord, rulebook and Instagram all show "Opens soon", and the contact email reads "TBC".

Note on ownership: most list copy (prizes, divisions, rules, flow, judging, logistics, topics, timeline, FAQ, team) is rendered from `src/config.js`, so **B5 makes those copy edits in config**. The section owner then copies the same wording into the static fallback in their HTML. Today the fallbacks and the config differ: for example, `hackathon.html` L132–139 rules and L194 judging do not match `config.js` `aiRules` / `judging`, and `programme.html` L78–129 topic descriptions do not match `programme.topics`. No-JS readers and JS readers currently see different copy.

---

## 1. Scores

| Component | Score | One-line reason |
|---|---|---|
| Nav | 6 | Clean and short. The "Register your team" CTA leads to a closed door, and "Programme" is ambiguous (in Indian English it often means an event schedule). |
| Hero | 7 | Strong, specific headline and a good lead. A lone "Tentative" badge, a primary CTA that dead-ends, and a countdown that gives to-the-second precision for a start time the page never states. |
| About | 5 | Repeats the hero almost word for word, then spends about 3.5 mobile screens on CAS-form language ("The global issue.", "Service", "Creativity") before a student reaches dates or fee. |
| Hackathon | 6 | Covers every client requirement (fee, team limit, prizes, AI rules, logistics). But the fee is missing from "At a glance", the prize-funding claims contradict each other, half the "AI rules" are not about AI, and hedging is heaviest here. |
| Programme | 6 | Clear two-track structure and a good NGO empty state. "For registered participants" contradicts the timeline, the NGO call-to-action dead-ends, and it never says what an NGO gets or what it costs them. |
| Timeline | 6 | A real sequence with good detail. Statuses are not credible next to other sections (September marked "done" while partners are "announced soon"). |
| Team | 6 | Honest and simple. Inconsistent role labels ("+", em dash, Title Case), an unexplained "VLK", and no named lead or supervisor for a parent or school to contact. |
| FAQ | 7 | The right questions in plain answers. It lacks "How do I register?" and anything for parents (safety, age, what is collected), and one answer states a policy that is not in the sources. |
| Register | 3 | The final CTA band is three disabled buttons and an email address that reads "TBC". Nobody can do anything here today. |
| Footer | 5 | Repeats the pending links and the "TBC" email. The disclaimer misattributes TBC items to "school approval". |
| **E5 overall (copy / IA / credibility)** | **5** | The copy quality is above average for a student site. What drags the score down is the conversion path (there is nothing to do) and confidence (contradictions plus 41 hedges). |

---

## 2. Must fix (blocking)

### M1. Every primary action is a dead end today. Add one live path and stop the "Register" loop
- **Owner:** B5 (`config.js`, `main.js`), B4 (`register.html`), B1 (`nav.html`, `hero.html`, `footer.html`). **Client action needed.**
- **What's wrong:** The four "Register your team" buttons (`.site-nav__cta`, `.hero-btn-primary`, `.hk-teams__actions .btn--primary`, footer link) all jump to `#register`. There the same label appears again as a disabled `is-pending` button. Discord, rulebook and Instagram are also "Opens soon", and `.rg-email` shows the literal string **"TBC"**. A parent with a question, an NGO wanting to host, or a sponsor has no way to reach anyone. A student who clicks "Register" twice learns nothing new. "Ask about hosting a session" (`programme.html` L193 area) also jumps to `#register` and lands on "TBC". This is the biggest credibility problem on the page.
- **Fix:**
  1. **Client:** before public launch, supply at least one live channel. The minimum is a real `contact.email`. Ideally also add a "notify me" form URL, which is a contact path and not a fact.
  2. **B5:** add `hackathon.interestUrl: "#"` to config. In `main.js`, when `registerUrl` is pending:
     - Set `.site-nav__cta` and `.hero-btn-primary` text to **"How to register"**. They still point to `#register`.
     - In `#register`, render a single primary button. Its label is **"Get notified when registration opens"** and it links to `interestUrl`, or to `mailto:<email>?subject=Notify%20me%20when%20registration%20opens` if only an email exists.
     - Hide the Discord and rulebook buttons. Show them once their URLs exist.
     - When `registerUrl` is real, restore the label "Register your team" everywhere.
  3. **B5/B4:** when `contact.email` is "TBC", **do not print "TBC"**. Hide `.rg-contact` and `.site-footer__email` entirely, or replace them with the sentence "Contact details will be posted here shortly." Never display a placeholder as if it were an address.
  4. **B3:** point "Ask about hosting a session" at `mailto:<email>?subject=Hosting%20a%20session` via `data-href="contact.emailHostingHref"`, or similar, built by `main.js`. Hide the button while the email is pending, and keep the sentence above it.

### M2. Register band copy: rewrite it for the state it is actually in
- **Owner:** B4 `register.html`, B5 `main.js` (state switch).
- **Before:**
  > **Ready to build?**
  > The hackathon runs 24–25 October 2026, online on Discord. Registration opens when the rulebook is published.
  > Teams of up to 4. Registration fee ₹2,000 per team.
  > [Register your team · Opens soon] [Join the Discord · Opens soon] [Read the rulebook · Opens soon]
  > Questions, sponsorship or hosting a session: TBC
- **After, closed state (now):**
  > **Registration opens soon**
  > Registration, the Discord server and the participant rulebook open together. The hackathon is planned for 24–25 October 2026, online on Discord.
  > Teams of up to 4 · ₹2,000 per team (to be confirmed)
  > [Get notified when registration opens]
  > **Get in touch:** Students and parents → *Ask a question* · NGOs → *Host a session* · Sponsors → *Support the prizes*
  >
  > Each of the three is a `mailto:` with its own subject line, hidden while the email is pending.
- **After, open state:**
  > **Register your team**
  > The hackathon runs 24–25 October 2026, online on Discord. Teams of up to 4 · ₹2,000 per team.
  > [Register your team] [Join the Discord] [Read the rulebook]
- Why: "Ready to build?" is a generic closer. The heading should state the one fact the reader needs, which is whether they can register now. The fee in `.rg-fee` currently has only a dotted underline. This is the place where a parent decides, so the fee needs the words "(to be confirmed)" here too.

### M3. Contradictory statements about where the money goes
- **Owner:** B2 `hackathon.html` L90, L110, L120; B5 `config.js` `prizes[0].note`, `donationNote`, `faq[6].a`, `timeline[4].detail`.
- **What's wrong:** The page makes four different claims:
  - "**Registration fees fund the prize pool.** Whatever remains after prizes are paid is donated…" (hackathon L90). This says *all* fees go to prizes.
  - "Funded from **part of** the registration proceeds **and any external sponsorship**." (cash prize card)
  - "After prizes are paid, **remaining proceeds** are donated…" (Where the rest goes; timeline). "Proceeds" means all money taken in, ignoring costs.
  - "Part of the proceeds funds the prizes; **remaining profits** are donated…" (FAQ). This matches the source ("Some proceeds could support prizes, while remaining profits could be donated").

  A parent paying ₹2,000 and a CAS coordinator signing off will both notice that these don't agree.
- **Fix:** Use one sentence, stored once in `config.js` `donationNote` and rendered via `data-fact` in each place it's needed:
  > "Part of the registration fees pays for the prizes. Any profit left after that is donated to the NGOs and community organisations we work with in the education programme."

  Show it in exactly **two** places: the "Where the rest goes" aside and the FAQ "What does it cost?". **Delete** hackathon L90 entirely. Change the cash-prize note to:
  > "Paid from part of the registration fees, plus any sponsorship."

  Change timeline `[4].detail` to:
  > "Results are announced and prizes awarded. Remaining profits go to the partner NGOs and community organisations."

### M4. The fee is not in "At a glance"
- **Owner:** B2 `hackathon.html` L14–43 (`.hk-facts__list`).
- **What's wrong:** The client named the fee as a required item, and the facts band is where everyone looks first. The band shows Dates, Format, Duration and Team size. "Format: Online on Discord" is already in the hero badges, the About pane and the hackathon lead. The fee first appears 2.6 screens later on mobile, inside "Teams and registration".
- **Fix:** Replace the Format cell with:
  ```html
  <div class="hk-fact"><dt>Entry fee</dt><dd>
    <span class="hk-fact__value num tbc" title="To be confirmed" data-fact="hackathon.feeText">₹2,000</span>
    <span class="hk-fact__sub">per team · to be confirmed</span></dd></div>
  ```
  Format already appears in the Logistics list, so it isn't lost.

### M5. Timeline and programme contradict each other about what has already happened
- **Owner:** B5 `config.js` `timeline[1]`; B3 `programme.html` L48 and L151; B5 `faq[8]`. **Client must confirm.**
- **What's wrong:**
  - Timeline "September 2026: Literacy sessions begin" is `status: "done"` and says "online preparation sessions **open for hackathon participants**".
  - The Programme legend says prep sessions are "**for registered participants**". But registration has not opened (M1).
  - The NGO block says partners "will be announced soon" and "we're confirming sessions". A CAS coordinator or sponsor reads this as either the sessions happened with unnamed partners, or the timeline is wrong. Neither builds trust.
  - FAQ "Do I need to attend the sessions to compete? **No.** … they are not required" is a policy that is not in the meeting summary or the proposal form (the guide's "don't invent facts" rule).
- **Fix:**
  - **Client:** say which September sessions have actually run.
    - If none have: set `timeline[1].status: "next"`, `when: "September–October 2026"` and `what: "Literacy sessions"`.
    - If some have: say so in `detail` without numbers until they are given, e.g. "Sessions are under way with community groups and hackathon participants."
  - Change the Programme legend L48 and L151 from "for registered participants" to **"for students planning to enter the hackathon"**. Add how to join, e.g. "Session times are posted on Discord" once Discord exists, or hide the sentence until then.
  - FAQ `[8]`: either the client confirms the policy, or mark it `tbc: true` and change the answer to: "The online preparation sessions on AI, vibe coding and pitching are designed to get hackathon teams ready. Whether they are required will be confirmed in the rulebook."

### M6. Too many hedges: 41 per 2,000 words. Hedge each fact once, where it's defined
- **Owner:** B1, B2, B3, B4, B5 (items listed per file).
- **What's wrong:** The same uncertain fact is repeated in many places, and each repeat gets its own hedge. The result reads as "nothing is decided" even though team size, format, platform, theme, deliverables, flow and AI policy *are* decided. The confirmed facts get lost among the hedges.
- **Fix (two parts):**
  - **(a) Add one consolidated note** directly under "At a glance" (B2, new `p.hk-facts__pending`, text from config `hackathon.pendingNote`):
    > "Still being finalised: exact dates and length, entry fee, prize amounts, the Junior age range, college entry, solo entries and judges. Confirmed details are shown without a marker."
  - **(b) Delete these specific duplicates:**

    | Where | Before | After |
    |---|---|---|
    | B1 `hero.html` L6–8 | badges `Tentative` · `Online` · `On Discord` | `Dates tentative` · `Online on Discord`. "Tentative" alone does not say what is tentative. |
    | B2 L33 | Duration value `24 hours` (tbc underline) + sub `proposed, not yet locked` | value `24 hours`, sub `Proposed`. Underline plus "proposed" plus "not yet locked" is three hedges on one line. |
    | B5 `logistics` | `Duration: 24 hours (proposed) [To be confirmed]` | Delete the row. It is already in At a glance. |
    | B5 `logistics` | `Submissions: HackerRank (proposed) [To be confirmed]` | `Submissions: HackerRank (proposed)`, no badge. |
    | B2 L81 | `Solo entries: To be confirmed / potentially permitted` | `Solo entries: May be allowed` (with `.tbc` underline). |
    | B2 L85 | `₹2,000 per team` (underline) + badge `To be confirmed` | Keep the underline. Replace the badge with the sub-text `to be confirmed` in `.hk-stat__sub` style, matching the other two stats. |
    | B2 L89 | "Register as a team of up to four. Whether solo entries are allowed, and the exact fee, will be confirmed closer to the event." | Delete. This sentence only repeats the three stats beside it. |
    | B2 prizes | Two cards that each say only "To be confirmed" | While both prizes are TBC, render **one** line instead of the grid: "Cash prizes and non-cash awards such as tool subscriptions are planned. Amounts will be announced before registration opens." Render the cards once `value` is real (B5: `main.js` switch on `prizes.every(p => p.tbc)`). |
    | B4 `register.html` | 3 × "Opens soon" | See M2: one notify button, hide the rest. |
    | B1 `footer.html` | "Instagram Opens soon", "Join the Discord Opens soon", "TBC" | Hide pending links and the pending email in the footer. A footer is not where people read status. |

  The expected result is about 15 hedges, each on the fact's main location or in the FAQ.

### M7. Discord's minimum age versus a Grade 6 Junior division (severe; outside lens; parent credibility)
- **Owner:** Client decision; B4 `faq` (B5 `config.js` `faq`).
- **What's wrong:** Discord's terms require users to be at least 13. The Junior division may start at Grade 6, which is age 11–12. The page sends every participant to Discord and says nothing about age, consent or supervision. A parent of a Grade 6 child, or the CAS coordinator, will raise this immediately. The page also never says whether a 24-hour online event expects minors to stay up overnight.
- **Fix:** The client confirms the policy. Then add this FAQ, with the bracketed parts filled in by the client and *not* published as-is:
  > **Is it suitable for younger students?**
  > The event runs on a Discord server managed by the organising team, with organisers on shift throughout the build. Discord requires users to be 13 or older; [how under-13 Junior participants take part / that participants must be 13+]. [Teams do not need to be online for the whole 24 hours / guidance on breaks.] [Parental consent is / is not collected at registration.]

  Until this is confirmed, do not show "Grade 6" as a possible boundary without this answer next to it.

---

## 3. Should fix

### S1. Section order: About runs 3.5 mobile screens of CAS rationale before the hackathon
- **Owner:** B4 `about.html` L41–60; B5 `build.py` (order) if moved.
- **What's wrong:** A Grade 9 or Grade 12 student clicks past the hero and gets "Why a hackathon, not a coding contest", then "The global issue.", then "Service" and "Creativity". This is CAS-proposal language aimed at one reader (the CAS coordinator), and it pushes the hackathon to screen 4.8 on mobile. Parents also don't know that "Service" and "Creativity" are CAS strands, because the page never says so.
- **Fix:** Keep About to the lead plus the Learn/Build split, which takes about one screen. Move `.ab-why`, `.ab-issue` and `.ab-cas` into a short block titled **"Why we're running this"** placed after `#timeline` and before `#team`. It sits next to the team, which is where a CAS coordinator or sponsor looks for accountability. Label the strands explicitly: "**CAS strands:** Service · Creativity".
- **Rewrites inside that block:**
  - Heading "Why a hackathon, not a coding contest" → **"Why a hackathon"**. This avoids the "not X" construction.
  - "Today AI solves most of those problems outright, which makes a no-AI rule close to impossible to enforce, and pure competitive programming draws a narrow group of students." → **"AI tools can now solve many of those problems, so a no-AI rule would be almost impossible to enforce. Pure competitive programming also attracts a fairly narrow group of students."** The source says "many", not "most".
  - "A build-oriented hackathon is more inclusive, and it connects directly to real social problems and the UN Sustainable Development Goals. So we allow AI, and we judge the solution rather than the code." → **"A build-focused hackathon is open to more students and connects directly to real social problems. So AI tools are allowed, and judges look at the whole solution: the idea, the prototype, the implementation plan and the pitch."**
  - "**The global issue.** Unequal access to practical technology and digital literacy, together with the need for innovative responses to social challenges linked to the UN Sustainable Development Goals." → **"The project responds to unequal access to practical technology and digital skills, and to the need for new ideas on social problems linked to the UN Sustainable Development Goals."** This drops the bold colon-reveal and the filler word "innovative".

### S2. Three near-identical summaries: give each one a different job
- **Owner:** B4 `about.html` L32–37; B2 `hackathon.html` L7.
- **What's wrong:** The hero lead, the About "Build" pane and the Hackathon lead all say: online, Discord, teams of up to 4, social problem/SDG, prototype, pitch, AI allowed. Within the About pane itself, "on Discord" appears in the paragraph and again in the meta list, and "Online" appears twice.
- **Fix:**
  - About Build pane, before: "A fully online hackathon on Discord. Teams of up to 4 pick a social problem or UN Sustainable Development Goal, build a working prototype, and pitch it to judges. AI tools are allowed; the solution is what gets judged."
    After: **"The final event. Over one weekend, teams pick a social problem, build a working prototype with any tools they like, AI included, and pitch it to judges."** Keep the meta list as is.
  - About Learn pane is fine. Optionally cut "run two ways" → "Technology-literacy sessions."
  - Hackathon lead L7, before: "An online, AI-enabled hackathon for school teams. Pick a social problem or a UN Sustainable Development Goal, build a working prototype over the weekend, and pitch it to judges. AI tools are allowed throughout."
    After: **"Everything your team needs to know: who can enter, what it costs, the rules, what you submit and how it's judged."** This works as a signpost and doesn't repeat the summary a third time.

### S3. "AI and vibe-coding rules" mixes AI rules with general rules and repeats the team size
- **Owner:** B5 `config.js` `aiRules`, `aiRulesNote`; B2 `hackathon.html` L128–141.
- **Fix:** Rename the heading to **"Rules"**. Change the intro "This is an AI-enabled hackathon. Use the tools; own the thinking." to **"AI tools are allowed at every stage. These are the working rules; the participant rulebook is the final version."** "Use the tools; own the thinking." is a slogan-style aphorism, and the brief bans that kind of hype. Revised list, in order:
  1. "You may use any AI tools, including code assistants, chatbots and vibe-coding tools."
  2. "Your team must be able to explain how your solution works and which decisions you made." This merges the stronger fallback L133 wording.
  3. "Build your project during the build period, after the challenge briefing and before the submission deadline."
  4. "Your project must address a social problem linked to the UN Sustainable Development Goals, using your division's problem statements or theme."
  5. "Submit three things: a working MVP, a pitch deck and an explanation of how the solution would be implemented."
  6. "Follow the participant rulebook, published before the event."

  Delete "Your team can have at most four members." because team size already has its own stat. Also delete "You are judged on the solution, not the code…" because judging has its own block. Drop the separate `.hk-rules__note`, since rule 6 says the same thing.

### S4. Countdown precision versus an unstated, unconfirmed start time
- **Owner:** B1 `hero.html` L16–17; B5 `config.js`.
- **What's wrong:** "Opening ceremony starts in 16 days 21 hours 19 mins 47 secs" is very precise, but the start time (09:00 IST) is never written as text anywhere, and both the dates and the time are tentative. Readers outside India also have no time zone to go on.
- **Fix:** Change the caption to **"Planned start: Saturday 24 October, 9:00 am IST"** (tbc underline, from config `hackathon.startLabel`), with the countdown below it. Also add a `Starts` row to At a glance sub-text: "Saturday to Sunday · 9:00 am IST start".

### S5. Rename "Programme" in the nav and the hero button
- **Owner:** B1 `nav.html`, `hero.html` L14.
- **What's wrong:** In Indian and British English, "programme" commonly means an event schedule. "Explore the programme" sitting beside a hackathon headline reads as "see the hackathon schedule", and the reader lands on NGO literacy sessions.
- **Fix:** Nav link "Programme" → **"Sessions"**. Hero ghost button "Explore the programme" → **"See the learning sessions"**. Keep the section h2 "Education programme".

### S6. Divisions copy: em dash and "not X" constructions
- **Owner:** B5 `config.js` `divisions[].guidance`; B2 fallback L56, L62.
- Junior, before: "Structured problem statements so teams start from a specific question, not a generic AI prompt."
  After: **"You'll be given specific problem statements at the briefing, so your team starts from a clear question."**
- Senior, before: "A broader SDG theme — teams define their own problem and solution."
  After: **"You'll get a broad SDG theme and choose your own problem to solve."**
- Intro L50, before: "Two divisions, so younger students are not up against much older ones."
  After: **"Two divisions, so younger students compete with students their own age."**

### S7. Other phrasing to fix (AI-sounding, slangy or imprecise)
| Owner / file | Before | After |
|---|---|---|
| B5 `config.js` topics[2].desc | "…an MVP plan and a pitch that lands." | "…an MVP plan and a clear, convincing pitch." |
| B5 `logistics[1].value` | "Discord — announcements, team channels, voice and Q&A" | "Discord, for announcements, team channels, voice calls and questions" |
| B5 `logistics` label | "What to bring" | "What you need" (the event is online; there is nothing to bring) |
| B2 L147 | "How the day runs" / "The event runs in this order. Exact timings are published in the rulebook." | **"How the event runs"** / "From opening to results. Exact timings will be in the rulebook." (It is two days, and the intro repeated the heading.) |
| B5 flow[1].desc | "A short talk from an invited speaker on technology and social impact." | Fine. Keep it. |
| B5 judgingNote | "Exact rubric, weighting and judges to be confirmed." | Fine. Sync fallback L205, which says "to be announced". |
| B3 `programme.html` L42 | "Six working topics across two tracks. The final list, and the number of sessions, are still being confirmed." | "Six planned topics across two tracks. The final list may change." (The session count already has its own TBC stat directly above.) |
| B4 `faq.html` L6 | "Details marked as to be confirmed will be fixed in the rulebook." | "Answers marked 'to be confirmed' will be updated here as details are finalised." (Fee and dates are not rulebook items.) |
| B1 `footer.html` | "Dates, fees and prizes marked 'to be confirmed' are subject to school approval." | "Details marked 'to be confirmed' are working plans and may change. The participant rulebook has the final details." (Most TBCs are the team's own decisions, not school approvals.) |
| B4 `team.html` L6 | "Run by Year 12 students at DAIS." | "Run by Year 12 students at Dhirubhai Ambani International School as their IB CAS project." Add "CAS supervisor: [name]" when the client supplies it. The proposal form leaves it blank, and it is the single strongest credibility line for parents and sponsors. |
| B5 `team[].role` | "Media + Outreach" / "Online — Hackathon + Sessions" / "Offline Sessions" | "Media and outreach" / "Hackathon and online sessions" / "Community sessions" (sentence case, no "+" or em dash, matches the programme's track names) |
| B5 `team[1].names` | "VLK" | Client to confirm. Initials in a list of first names look like a typo. |
| B1 `head.html` `<title>` | "DH 2026" | "DH 2026 · Online AI hackathon for school students" (the share preview and browser tab currently say nothing about what this is) |

### S8. FAQ: add "How do I register?" first and reorder by what people ask
- **Owner:** B5 `config.js` `faq`; B4 `faq.html` fallback.
- **New first question:**
  > **How do I register?**
  > Registration opens when the participant rulebook is published. [Until then: get notified / email us at …]. One person registers the whole team.

  The last sentence is shown only if the client confirms it. Otherwise end after the first sentence plus the notify link.
- **Order:** How do I register → Who can take part → When is it and how long → What does it cost → How big can a team be → Can we use AI tools → What's the theme → What do we submit → What are the prizes → Is it online → Is it suitable for younger students (M7) → Do I need to attend the sessions.
- Merge "Is it online?" into "When is it and how long?" if the list feels long.

### S9. Missing content: sponsor call, schools contact and what happens after registering
- **Owner:** B2 (prizes block), B4 (register), B5 (config strings). None of these needs invented facts.
- **Sponsors**: add after the prize line, from config `hackathon.sponsorsNote`, which already exists but is never rendered.
  > **Support the hackathon.** We're looking for organisations to fund prizes, donate tool subscriptions, or provide a judge or guest speaker. Sponsorship is subject to school approval. [Email us about sponsorship]

  Every element is sourced: non-cash prizes and subscriptions, judges, guest speaker, and "external sponsorship possible, school approval needed".
- **NGOs**: the call exists (programme). Add what an NGO coordinator needs to know before replying, as client-to-confirm fields in config:
  > "Sessions are led by the student organising team, adapted to your group's level, and run with school/CAS approval. [Cost to your organisation: free / …] [Typical length: …]"

  Show only the confirmed parts.
- **Teachers / other schools**: one line in the register contact block:
  > "Teachers: bringing a group of students? Email us and we'll keep you updated."
- **After registering**: once the client confirms the process (payment method, confirmation, Discord invite, when problem statements arrive), add the FAQ "What happens after we register?". **Do not draft the process without the client.** Leave a config slot `faq` entry commented out with the questions to answer.
- **SDG framing** (nice-to-have; the brief asked About to carry it): link "UN Sustainable Development Goals" on its *first* mention only to `https://sdgs.un.org/goals`, so students can browse the 17 goals before the briefing. Spell it out once, then use "SDGs" after that. It is currently written out 7 times.

---

## 4. Nice to have

1. **B5/B2:** Write numbers in one style. The page mixes "up to four" (hero, rules, Teams body) with "up to 4" (everywhere else). Use the numeral throughout and have it come from `teamMax`. The hero L11 and rules hard-code "four" in words, so they won't update if config changes.
2. **B4 `about.html` L11/L30:** "Learn" / "Build" pane words are good. Consider making the two panes link to `#programme` / `#hackathon` ("Session topics" / "Hackathon details") so About works as a router.
3. **B3:** NGO empty state, "We're confirming sessions with NGOs and community centres across Mumbai." Keep it, but only if Mumbai-only is true. Online prep sessions are not location-bound, so the empty state should be clear that it refers to offline sessions.
4. **B4 timeline lead:** "From the first planning meeting in August to the hackathon in late October, and what happens after." → "August to late October, and what happens after the event." The planning meeting is internal history.
5. **B2:** "What judges look for" descriptions in config are good. "A clear, honest pitch" reads well. Keep them, and sync the fallback, which phrases them as questions instead.
6. **B1:** The footer binary tape decodes to "hackathon 2026". It's a nice detail; keep it.

---

## 5. What's working (don't undo)

- **The hero headline**, "Build technology that solves a real social problem.", is specific, active and free of hype. The hero lead covers who, when, team size, task and AI policy in three sentences. Keep both.
- **Using "to be confirmed" on unconfirmed values, with config as the single source.** The honesty is right. The problem is only the volume of hedges (M6), not the principle.
- **The NGO empty state** ("Partner organisations will be announced soon" plus a hosting call) is designed rather than blank. That's exactly what the brief asked for.
- **Plain, second-person rules and judging copy** ("Does it address a real social problem, and could it realistically work?") is the right register for Grade 9–12 readers.
- **Two-track topic structure** (Hackathon prep / Community) with track pills makes the education programme easy to grasp in one scan.
- **Disabled pending links** (`aria-disabled`, no `href` navigation) are better than live `#` links. Keep the mechanism; M1 and M2 change only what the reader is offered instead.
