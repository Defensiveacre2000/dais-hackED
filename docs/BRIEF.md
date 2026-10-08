# DH 2026 — Website build brief (contract for all builder agents)

Read this whole file before writing anything. Every agent writes ONLY the files assigned to it, in `/home/claude/dh-site/src/`. Do not touch other agents' files. Do not create extra files outside your assignment. When finished, reply with a short summary of what you built and any open questions.

## 1. What this site is

A single-page, self-contained website for a student-run project at **Dhirubhai Ambani International School (DAIS), Mumbai** — a Year 12 IB CAS group project, academic year 2026–27. The project has two connected parts:

1. **Education programme** (September–October 2026): technology-literacy sessions. Offline sessions for NGO / community groups, plus online preparation sessions for hackathon participants.
2. **The hackathon** (24–25 October 2026, tentative, Saturday→Sunday, online on Discord): an **AI-enabled, social-impact hackathon** where teams build a technology solution to a social problem / UN SDG, and pitch it.

Working name / brand mark: **DH** (from the logo). The project's final name is not decided yet — the site must treat the name as a single editable string (`SITE.name`, default "DH 2026") and the mark "DH" as the logo. Never hard-code the name in more than one place.

Audience: school students (Grade 6–12) and possibly college students in India, their parents and teachers, NGO partners, judges, sponsors. Primary job of the page: get teams to register, and explain the education programme clearly. Secondary: look credible enough for sponsors and school approval.

Source documents (read them if your section needs facts): `/home/claude/dh-site/docs/meeting-summary-19-aug.md` and `/home/claude/dh-site/docs/proposal-form.md`. The "main presentation" the client refers to is NOT available — the facts it would contain (exact prize money, exact fee, exact session count/topics) are marked **TBC** below and MUST be editable from `src/config.js` only. Never invent prize amounts or numbers that are not in the sources. Where a value is TBC, the UI shows the working value with a small "to be confirmed" treatment (class `tbc`) — see §5.

## 2. Confirmed facts (use these exactly)

**Hackathon**
- Dates: 24–25 October 2026 (tentative), Saturday → Sunday. Countdown target: 2026-10-24T09:00:00+05:30 (IST). Shown as "Tentative" badge.
- Format: fully online. Platform: Discord (announcements, team channels, voice, Q&A, organiser "office hours" in rotating shifts). Submissions possibly via HackerRank (proposal form mentions "Discord + HackerRank").
- Duration: 24-hour build under consideration (not locked). Treat as "24-hour (proposed)".
- Theme: social problems / UN Sustainable Development Goals.
- Divisions: **Junior** — Grade 10 and below (exact lower boundary TBC: Grade 6 or 8). **Senior** — Grade 11 and above (college students possibly allowed, TBC). Juniors get more structured problem statements; seniors get a broader SDG theme and define their own problem.
- Team size: **maximum 4 participants per team** (confirmed). Solo participation potentially permitted.
- Registration fee: working figure **₹2,000 per team** (TBC — from the presentation).
- Prizes: cash prizes + non-cash prizes/subscriptions were discussed; exact prize money and awards TBC. Principle: part of proceeds funds prizes, remaining profits are donated to NGOs/community organisations connected with the literacy programme. External sponsorship possible.
- **AI use is allowed** ("vibe coding" permitted). Rules direction: teams may use AI tools freely; judged on the solution, not the code's sophistication.
- Deliverable: **MVP + pitch deck + explanation of how the solution would actually be implemented**.
- Judging: overall solution quality and feasibility, implementation thinking, prototype/MVP, presentation/pitch (exact rubric and judges TBC).
- Flow: Opening ceremony → guest speaker → challenge/theme briefing → Q&A → build period (organiser support on Discord) → submission → judging & pitches.
- A participant rulebook / information packet will explain themes, directions, examples, rules, submission requirements (link TBC).

**Education programme**
- Sessions start September 2026. Working scope **6–8 sessions** (TBC; exact number is in the presentation).
- Topics (working set): AI literacy; Basic coding, software & vibe coding; Cybersecurity (incl. AI-related risks); Digital financial literacy (fraud, internet banking, investments / portfolio basics); Hardware, electronics & engineering (tentative — depends on equipment); Presentation, pitching & solution development.
- Split: AI / vibe-coding + pitching sessions directly prepare hackathon participants (online). Digital finance, cybersecurity, hardware form the wider offline NGO literacy effort. Content adapted to the audience; start with basics where needed.
- NGO list: **will be provided later** — render from `SITE.ngos` (array). When empty, show a designed "Partner organisations will be announced soon" state, not a blank.

**Organising team** (first names, as on the proposal form; roles as columns)
- Media + Outreach: Nishkarsh, Nandini, Aranya, Tvishaa
- Online — Hackathon + Sessions: Yatharth, Arjun, Nishkarsh, Aryan, VLK
- Offline Sessions: Arjun, Agastya, Aryan, Prathmesh, Yash, Pratham
- Website: Vihan

**Links (all placeholders in config)**: registration form URL, Discord invite, rulebook URL, contact email, Instagram.

## 3. Design direction (fixed by the client — follow exactly)

- **Colour**: blue and white only, gradients, futuristic. The specific blue, extracted from the logo: **#0568F5**. Every colour on the page derives from it (tints/shades) or is white. No other hue anywhere (no purple, no green, no orange — not even for "success").
- **Visual language from the logo**: the brain is half **circuit traces with node dots**, half **binary digits** (1010…), inside a lightbulb. Use thin circuit traces + node dots and binary-digit texture as the ONLY decorative motifs. No generic blobs, no stock 3D shapes, no emoji.
- **Logo files**: `src/assets/logo.png` (blue on transparent), `src/assets/logo-white.png` (white on transparent), `src/assets/favicon.png`. In HTML reference them as `assets/logo.png` etc. The build step inlines them as data URIs.
- **The one bold moment**: the hero. Everything after it is quiet, disciplined, white-dominant with ice-blue tints, and uses the gradient only on primary buttons, the hero, and one feature band. Do not put a gradient wash on every card.
- Not allowed (reads as generated): tracked-out ALL-CAPS eyebrow labels on every heading; numbered 01/02/03 markers on things that are not sequences; "→" appended to button text; identical rounded cards with the same grey shadow everywhere; one accent word in a different colour in every headline; fade-up-on-scroll on every section.
- Allowed/encouraged: numbered steps ONLY for the hackathon flow and the timeline (they are real sequences); one orchestrated page-load animation in the hero; motion on user action (accordion open, tab switch).

## 4. Token contract (B1 implements in `base.css`; everyone else only uses these names)

```css
/* Layout: left-aligned content on a 1200px max container, 12-col mental grid, generous vertical rhythm; hero is the one full-bleed gradient field. */
:root{
  --blue:#0568F5;          /* brand, from logo */
  --blue-deep:#0338A8;     /* gradient start, dark surfaces */
  --blue-ink:#06204F;      /* headings / body text on white (navy, not black) */
  --blue-bright:#4D9BFF;   /* gradient end, links on dark */
  --blue-sky:#8FC1FF;      /* light accents */
  --ice:#EAF2FF;           /* tinted surfaces */
  --ice-2:#F5F9FF;         /* section alternation */
  --white:#FFFFFF;
  --bg:var(--white); --fg:var(--blue-ink); --muted:#4A5F85; --line:#CFE0FB;
  --surface:var(--white); --surface-2:var(--ice);
  --grad:linear-gradient(135deg,var(--blue-deep) 0%,var(--blue) 55%,var(--blue-bright) 100%);
  --font-display:'Unbounded', 'Manrope', system-ui, sans-serif;   /* headlines, numbers */
  --font-body:'Manrope', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --radius:14px; --radius-sm:8px; --radius-pill:999px;
  --container:1200px; --gutter:clamp(16px,4vw,40px);
  --shadow:0 10px 30px rgba(5,104,245,.12);
}
```
Dark theme (B1 writes the two guarded blocks per the artifact page contract): `--bg:#061531; --fg:#E8F0FF; --muted:#A9BEE6; --line:#1E3A6E; --surface:#0B2250; --surface-2:#0F2B61; --ice:#0F2B61; --ice-2:#0A1E48;` and `color-scheme:dark`. The gradient stays the same in both themes.

Fonts: Google Fonts link `https://fonts.googleapis.com/css2?family=Unbounded:wght@500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap` (B1 puts it at the top of `head.html`).

Shared classes B1 must provide (everyone may use):
- `.container` (max-width + side gutters), `.section` (vertical padding `clamp(64px,10vw,120px)`), `.section--tint` (background `--ice-2`), `.section-head` (h2 + optional lead paragraph, max 60ch, left aligned), `.lead`
- `.btn`, `.btn--primary` (gradient fill, white text), `.btn--ghost` (1px `--line`/white outline variant with `.btn--ghost.on-dark`), `.btn--lg`
- `.badge`, `.badge--tbc` (small pill: "to be confirmed")
- `.tbc` (inline marker: dotted underline + title attr tooltip "To be confirmed")
- `.card` (surface, 1px `--line`, radius) — use sparingly; `.card--feature` (gradient border or deep-blue fill)
- `.grid` with `.grid--2`, `.grid--3`, `.grid--4` (auto-fit, min 240px, gap 24px, stack on mobile)
- `.circuit-bg` (decorative CSS/SVG circuit-trace pattern, very low opacity, `pointer-events:none`, `aria-hidden`)
- `.binary-text` (small binary string texture, display font, low opacity)
- `.sr-only`, `.visually-hidden`
- Headings: h1 `clamp(2.4rem,6vw,4.6rem)`, h2 `clamp(1.8rem,3.5vw,2.8rem)`, h3 `1.25rem`; all `text-wrap:balance`, display font, weight 700, line-height 1.1. Body 1.0625rem/1.65 Manrope. `font-variant-numeric:tabular-nums` on `.num`.
- Focus-visible ring: `outline:3px solid var(--blue-bright); outline-offset:3px`.
- `@media (prefers-reduced-motion:reduce)` kills all animation/transition.

Section IDs (nav anchors — fixed): `#top` (hero), `#about`, `#hackathon`, `#programme`, `#timeline`, `#team`, `#faq`, `#register`.

## 5. Config contract (`src/config.js`, written by B5; everyone else reads from it)

`window.SITE` object with at least:
```js
window.SITE = {
  name: "DH 2026",                 // project name — TBC, group vote pending
  tagline: "AI-enabled social-impact hackathon",
  school: "Dhirubhai Ambani International School, Mumbai",
  year: "2026–27",
  hackathon: {
    dates: "24–25 October 2026", datesTbc: true,
    start: "2026-10-24T09:00:00+05:30", end: "2026-10-25T09:00:00+05:30",
    format: "Online", platform: "Discord", submissions: "HackerRank (proposed)",
    durationHours: 24, durationTbc: true,
    teamMax: 4, soloAllowed: "TBC",
    fee: { amount: 2000, currency: "₹", per: "team", tbc: true },
    prizes: [ /* {title, value, note, tbc} — defaults: "Cash prizes" TBC, "Non-cash prizes & subscriptions" TBC */ ],
    divisions: [ {name:"Junior", grades:"Grade 10 and below", note:"Exact lower boundary (Grade 6 or 8) to be confirmed", tbc:true},
                 {name:"Senior", grades:"Grade 11 and above", note:"College participation to be confirmed", tbc:true} ],
    aiRules: [ /* strings */ ], logistics: [ /* strings */ ], judging: [ /* {criterion, desc} */ ],
    flow: [ /* ordered steps {title, desc} */ ],
    rulebookUrl: "#", registerUrl: "#", discordUrl: "#"
  },
  programme: {
    sessionsCount: "6–8", sessionsTbc: true, start: "September 2026",
    topics: [ {title, desc, track:"hackathon-prep"|"community"} ],
    ngos: []   // [{name, location, focus, url}] — client will send later
  },
  team: { /* role: [names] */ },
  contact: { email: "TBC", instagram: "#" },
  timeline: [ /* {when, what, status} */ ]
};
```
Static HTML must contain sensible default text already (page complete at rest). JS (`main.js`) fills `[data-fact="path.to.value"]` elements and renders list-type things (prizes, topics, ngos, team, flow, timeline, faq) into containers marked `[data-render="prizes"]` etc. Each section author must include **both** the container with a `data-render` attribute AND a static fallback inside it (so the page reads correctly even if JS fails). `main.js` replaces the fallback when it renders.

## 6. Page structure and ownership

| Order | Section | File(s) | Owner |
|---|---|---|---|
| 0 | `<head>` content (title, meta, fonts link, theme-color) | `src/head.html` | B1 |
| 1 | Sticky nav (logo mark + name, anchor links, "Register" button, mobile menu button) | `src/nav.html` | B1 |
| 2 | Hero `#top` — the bold moment | `src/hero.html`, `src/hero.css`, `src/hero.js` | B1 |
| 3 | About `#about` — what the project is, the two parts, SDG framing, CAS/school credibility | `src/about.html`, `src/about.css` | B4 |
| 4 | Hackathon `#hackathon` — dates/format band, divisions, teams, fee, prizes & awards, AI/vibe-coding rules, logistics, flow (numbered), judging, deliverables, rulebook link | `src/hackathon.html`, `src/hackathon.css` | B2 |
| 5 | Education programme `#programme` — sessions count, topics (two tracks), how sessions run, NGO partners (from config, with empty state) | `src/programme.html`, `src/programme.css` | B3 |
| 6 | Timeline `#timeline` — Sep sessions → Oct hackathon (numbered, real sequence) | `src/timeline.html`, `src/timeline.css` | B4 |
| 7 | Team `#team` — role groups | `src/team.html`, `src/team.css` | B4 |
| 8 | FAQ `#faq` — accordion (`<details>`), 8–10 questions | `src/faq.html`, `src/faq.css` | B4 |
| 9 | Register `#register` — final CTA band, fee reminder, Discord + registration + contact | `src/register.html`, `src/register.css` | B4 |
| 10 | Footer | `src/footer.html` | B1 |
| — | `src/base.css` (tokens, reset, shared classes) | B1 |
| — | `src/config.js`, `src/main.js`, `build.py`, `shoot.py` | B5 |

Build (B5's `build.py`) concatenates into `/home/claude/dh-site/dist/index.html` as ONE self-contained file: `<!doctype html><html lang="en"><head>` + head.html + `<style>` base.css + hero.css + about.css + hackathon.css + programme.css + timeline.css + team.css + faq.css + register.css `</style></head><body>` + nav + hero + about + hackathon + programme + timeline + team + faq + register + footer + `<script>` config.js + hero.js + main.js `</script></body></html>`, with `assets/*.png` references replaced by data URIs. It also writes `/home/claude/dh-site/dist/artifact.html` — the same file **without** the doctype/html/head/body wrappers (title+style first, then body content, then scripts), for publishing as an artifact.

## 7. Quality floor (everyone)

- Valid, closed HTML; double-quoted attributes; semantic landmarks (`<header>`, `<main>` wrappers are added by build — sections use `<section id="..." aria-labelledby="...">`).
- Works at 360px wide with no horizontal scroll; `min-width:0` on grid children with text.
- Scope your CSS under your section id or a section-specific class prefix (e.g. `.hk-` for hackathon, `.pg-` for programme, `.ab-`, `.tl-`, `.tm-`, `.fq-`, `.rg-`, `.hero-`) so rules never collide. Never style bare elements globally outside base.css.
- No external resources except Google Fonts. No images except the logo assets. Inline SVG for icons/motifs (keep SVG paths short; prefer CSS/Canvas for patterns).
- Copy: sentence case, plain verbs, specific. Buttons say what happens ("Register your team", "Join the Discord", "Read the rulebook"). No filler, no hype words ("revolutionary", "unleash"). Max ~65ch line length for paragraphs.
- Mark every TBC value with the `tbc` class and keep it sourced from config.
