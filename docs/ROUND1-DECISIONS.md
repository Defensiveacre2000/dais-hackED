# Round 1 → decisions from the lead (binding for all builders)

Read all five reviews in `/home/claude/dh-site/reviews/E*-round1.md` for detail. Where reviewers disagree or a fix crosses owners, THIS file decides. Fix everything in the reviews that is assigned to you, unless it conflicts with a decision below. Stay in your own files (ownership in BRIEF §6). New shared tokens/classes come from B1 only; use the names below even before B1 lands them.

## D1. Facts and honesty (E2, E5)
- Nothing on the page may state as decided what the sources call undecided. Prize/donation model: ONE sentence, from `SITE.hackathon.donationNote`, shown in the prizes block and the fee FAQ only:
  "The current plan is to use part of the registration proceeds for prizes and donate the rest to NGOs and community organisations connected with the literacy programme. The final model is still being decided." Delete every other wording of it (e.g. hackathon.html "Registration fees fund the prize pool", "Funded from part of the registration proceeds and any external sponsorship").
- FAQ "Do I need to attend the sessions to compete?" → "We'll confirm this when registration opens. The online preparation sessions are open to registered participants and will help you get ready." (tbc).
- AI rules: the list is headed as draft — show `aiRulesNote` visibly under the heading: "Draft rules. The participant rulebook, published before the event, is final." Rule 2 becomes "Vibe coding is welcome. Generating most of your code with AI is fine." Rule 5 becomes "Teams build during the build period, with organiser support on Discord."
- Remove "across Mumbai" (invented). Remove footer "subject to school approval" → "Details marked 'to be confirmed' may change before the event."
- "Fully online" → "Online" with the format marked as planned: value "Online (planned)", platform "Discord". Keep it simple, no extra hedges.
- Countdown caption must not imply a confirmed 09:00 start: caption "Countdown to 24 October 2026 (tentative)" built from config; keep `start` as-is.
- Juniors don't "pick" a problem: hero/hackathon lead copy say teams "work on a social problem linked to the UN SDGs" (juniors get a structured problem statement, seniors define their own).
- Use the client's term **induction sessions**: programme says "6–8 induction sessions" (tbc) and "Induction sessions start September 2026". Track names stay.
- Timeline: Aug "Project defined" = done; Sep "Induction sessions begin" = status `next` (label "In progress"); Oct "Rulebook published and registration opens" = later; 24–25 Oct hackathon = later + tbc; after = later. Do NOT claim sessions have happened.
- Team: keep "VLK" in Online and "Vihan" in Website as listed (lead will ask client).
- Add FAQ (B5 config + B4 fallback) "Is there an age limit?" → "Discord requires users to be at least 13. The junior division's lower grade limit, and arrangements for younger participants, will be confirmed before registration opens." (tbc). Place it after "Who can take part?".
- FAQ order starts with "How do I register?" → "Registration opens in October together with the participant rulebook. The registration link will appear on this page."

## D2. Single source of truth (E2, E4) — B5 leads, everyone complies
- B5 implements in main.js: (a) `{path}` tokens in ANY config string (e.g. `{hackathon.feeText}`, `{hackathon.teamMax}`, `{hackathon.dates}`) are substituted before rendering; (b) `data-tbc-flag="hackathon.fee.tbc"` on any element → element hidden when that flag is false; (c) facts with false tbc flags lose `.tbc` styling (already done).
- Every builder: replace hard-coded repeats of fee, dates, team size ("four"/"4"), duration, session count, "Saturday to Sunday", "Six working topics" in YOUR HTML with `data-fact` spans; every "Tentative"/"To be confirmed" badge gets the matching `data-tbc-flag`. Static fallback text must match config copy word-for-word (B5 will hand you nothing — copy from config.js after B5 finishes, OR B5 aligns config to your fallback; rule: **config text wins; builders copy config text into fallbacks**). B5 finishes config first (it's fast) — builders read the updated config before finalising fallbacks.
- New computed facts (B5): `hackathon.weekdays` ("Saturday to Sunday"), `hackathon.teamMaxWord` ("four"), `programme.topicsCountWord` ("Six"), `hackathon.countdownCaption`.
- `head.html` meta/OG/title filled at build time from config by build.py (B5) using `{{name}}`-style placeholders that B1 puts in head.html.

## D3. Register path — no dead ends (E1, E3, E5)
- Config gets `hackathon.registrationOpen:false`, `hackathon.interestUrl:"#"`, `contact.email:""` (empty, NOT "TBC").
- While `registrationOpen` is false: nav + hero + hackathon CTAs read **"How to register"** and link to `#register` (in-page, always works). When true, they read "Register your team" and link to `registerUrl`. B5 implements via `data-label-open` / `data-label-closed` attributes (builders add them).
- Register band (B4): heading **"Registration opens in October"**; one line: "Registration, the Discord server and the participant rulebook open together. Teams of up to {teamMax}, {feeText}." Primary button white-filled `.btn--on-band` "Get notified" → `interestUrl`; if interestUrl pending AND email set → `mailto:` email; if both pending → replace the button row with a styled status line "Links go live here in October." (no faded buttons). Discord + rulebook become small text links that only appear when their URL is set.
- Contact row: if `contact.email` empty → show "Contact email coming soon" muted text, no copy button. Separate audience lines (students/parents, NGOs, sponsors) all point to the same email when set.
- No more 55%-opacity buttons anywhere. `.is-pending` links get `hidden` unless they are the ONLY action, in which case a status line replaces them.

## D4. Visual system (E1, E3) — B1 owns tokens
- Add tokens: `--grad-ui: linear-gradient(135deg,#0338A8 0%,#0568F5 100%)` (buttons, at-a-glance band); full `--grad` only for hero. `--accent-text:#0350C4` light / `#7FB4FF` dark for any blue text on white/ice/dark surfaces (replace `color:var(--blue)` text uses in your files).
- Focus ring: `outline:3px solid var(--blue)` on light; inside `.on-dark` → `#fff`.
- Skip link (B1 nav.html) "Skip to content" → `#main`.
- `ul[class],ol[class]` reset → `:where(ul,ol)[class]`.
- Ghost buttons: border `1.5px solid var(--blue)` light / `rgba(255,255,255,.7)` on dark.
- Section backgrounds strictly alternate: hero(grad) · about(white) · **hackathon(tint)** · **programme(white)** · timeline(tint) · team(white) · faq(tint) · register(deep blue). B2 adds `section--tint` to hackathon; B3 removes it from programme and ensures white surfaces become `--ice-2` cards where needed.
- Hero (B1): h1 `clamp(2.2rem,5vw,4rem)`, columns `1.6fr .7fr`, countdown visible at 1280×800; mobile shows a small logo above the badges instead of a big one below.
- `.section-head` max-width → 72ch for h2 so "Education programme" fits on one line at desktop.
- About "Learn"/"Build" must be smaller than section h2 (use h3 scale ~2rem).
- One consistent TBC treatment site-wide: `.badge--tbc` pill (dashed, readable ≥4.5:1) for standalone status; `.tbc` inline values get dotted underline AND are followed by a visible pill once per section, not per line. Hedge each fact once where it's defined (E5 M6 list).
- At a glance band (B2): cells = Dates · Entry fee · Duration · Team size (drop Format — it's in the hero badges). Remove the "proposed" triple hedge.
- Prizes (B2): stronger block — one wide feature row: "Cash prizes" + "Non-cash prizes & subscriptions" side by side, amounts as large "₹ — to be announced" style placeholder from config (`value`), plus the donationNote as a quiet line under. Must remain honest.

## D5. Code/perf/hosting (E4) — B5 + B1
- build.py: one `<script>` per JS file; `node --check` each and FAIL the build on error; inline each logo once (B1: nav uses a 72px-tall downscaled PNG `logo-nav.png`, hero + footer share one `logo-white-sm.png` ≤ 360px tall, quantised palette PNG; or reference via a CSS custom property defined once). Target ≤ 180 KB.
- build.py also emits `dist/site/` = `index.html` + `assets/` (og-image.png 1200×630, favicon-32.png, apple-touch-icon.png 180, logo files) for static hosting, and fills head placeholders from config. Add schema.org `Event` JSON-LD (eventAttendanceMode Online, eventStatus Scheduled, organizer = school, location VirtualLocation Discord) built from config.
- B5 writes `DEPLOY.md` (new, for this codebase): GitHub Pages / Netlify / Vercel steps for `dist/site/`, and "how to update facts" for a non-developer.
- B1: hero canvas — draw traces once to an offscreen canvas, animate only digits, and stop animating after ~15 s (static last frame). Countdown: under reduced motion update once per minute.
- Footer links ≥ 44px tap height on mobile; fix 320px overflow.
- Mobile nav: close on outside tap and when focus leaves; move focus to target after link tap (B5).
- FAQ: allow multiple open (remove single-open) to avoid jumps (B5).

## Deliverable from each builder
Apply fixes, rebuild (`python3 build.py`), run `python3 shoot.py > /dev/null` and look at your sections at 360 and 1280 in light and dark. Then reply with: what you changed (mapped to review item IDs), anything you deliberately didn't do and why.
