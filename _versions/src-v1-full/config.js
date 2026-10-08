/* ==========================================================================
   DH 2026 — SITE CONFIG
   ==========================================================================

   EDIT THIS FILE TO UPDATE FACTS. Dates, fee, team size, prizes, links, topics,
   team names, timeline and FAQ text all come from here. After editing, run

       python3 build.py

   and publish dist/site/ (see DEPLOY.md). If you make a typing mistake here
   (a missing comma or quote), build.py stops and tells you the line.

   HOW VALUES ARE USED
   - data-fact="dotted.path"   on an element → its text is this value
   - data-href="dotted.path"   on a link     → its address is this value.
                                 "#" or "" = not ready yet: the link is hidden.
   - data-render="key"         on a list     → the list is drawn from the array
   - data-tbc-flag="dotted.path"             → a "to be confirmed" label that
                                 disappears when that flag is set to false
   - {dotted.path} inside any text below is replaced by that value, e.g.
     "Teams of up to {hackathon.teamMax}" → "Teams of up to 4". So when the fee
     or the dates change you only edit them ONCE, here.
   - Text is shown as plain text, never as HTML (a "<a>" would appear literally).

   KEYS ALSO USED BY build.py (page title, link previews, search results):
     name, tagline, description, siteUrl, hackathon.start / end,
     hackathon.discordUrl, school. tagline, description and siteUrl appear
     only there, so they change on the page only after a rebuild.

   TBC CHECKLIST — things the main presentation / a later meeting will confirm.
   When one is decided, change the value AND set its tbc flag to false.
     [ ] Project name            → name, nameTbc (group vote pending)
     [ ] Hackathon dates         → hackathon.dates / start / end / datesTbc
     [ ] 24-hour duration        → hackathon.durationHours / durationTbc
     [ ] Registration fee        → hackathon.fee.amount / fee.tbc
     [ ] Solo participation      → hackathon.soloAllowed / soloTbc
     [ ] Junior lower grade      → hackathon.divisions[0]
     [ ] College students        → hackathon.divisions[1]
     [ ] Prize money + awards    → hackathon.prizes (value, tbc)
     [ ] Prize / donation model  → hackathon.donationNote, donationTbc
     [ ] Submission platform     → hackathon.submissions / submissionsTbc
     [ ] Judging rubric + judges → hackathon.judging / judgingTbc
     [ ] Rules                   → hackathon.aiRules / aiRulesNote (draft)
     [ ] Registration opens      → hackathon.registrationOpen: true + registerUrl
     [ ] "Get notified" form     → hackathon.interestUrl
     [ ] Discord invite link     → hackathon.discordUrl
     [ ] Rulebook / info packet  → hackathon.rulebookUrl
     [ ] Session count + label   → programme.sessionsCount / sessionsTbc / sessionsLabel
     [ ] Final topic list        → programme.topics (hardware is tentative)
     [ ] NGO / partner list      → programme.ngos (empty = "announced soon" state)
     [ ] Contact email           → contact.email (empty = "coming soon")
     [ ] Instagram link          → contact.instagram
     [ ] Public web address      → siteUrl (enables share image + canonical link)
     [ ] Timeline progress       → timeline[].status (done | next | later)
     [ ] FAQ answers marked tbc  → faq[] (tbc: true): rewrite the answer AND remove tbc
     [ ] "Still being finalised" → hackathon.pendingNote (edit the list by hand)

   Sources: meeting summary of 19 Aug 2026 and the CAS proposal form.
   Do not add numbers (prize amounts, participant counts) that are not confirmed.
   ========================================================================== */

window.SITE = {
  // Project name — working name only; a group vote on 3–4 options is pending.
  name: "DH 2026",
  nameTbc: true,
  tagline: "AI-enabled social-impact hackathon",
  description: "An online, AI-enabled social-impact hackathon for school students on {hackathon.dates}, with technology-literacy induction sessions from {programme.start}. A Year 12 IB CAS project at {school}.",
  school: "Dhirubhai Ambani International School, Mumbai",
  year: "2026–27",

  // Full public address once hosting is decided, e.g. "https://<user>.github.io/dh-2026"
  // (no trailing slash). Leave "" until then; build.py warns while it is empty.
  siteUrl: "",

  /* ---------------------------------------------------------------------
     HACKATHON
     --------------------------------------------------------------------- */
  hackathon: {
    dates: "24–25 October 2026",
    datesTbc: true,
    weekdays: "Saturday to Sunday",
    start: "2026-10-24T09:00:00+05:30",   // countdown target (IST). The caption shows only the date.
    end:   "2026-10-25T09:00:00+05:30",   // countdown switches to "Wrapped up" after this

    format: "Online (planned)",
    platform: "Discord",
    submissions: "HackerRank (proposed)",
    submissionsTbc: true,

    durationHours: 24,
    durationTbc: true,                     // 24-hour build is proposed, not locked

    teamMax: 4,                            // confirmed in the 19 Aug meeting
    soloAllowed: "TBC",                    // "Yes" / "No" once decided
    soloTbc: true,

    fee: { amount: 2000, currency: "₹", per: "team", tbc: true },

    // One line under "At a glance": everything still open, in one place.
    // Edit this list by hand whenever you confirm one of these facts.
    pendingNote: "Still being finalised: exact dates and length, entry fee, prize amounts, the Junior grade range, college entry, solo entries, the submission platform and judges. Confirmed details are shown without a marker.",

    // REGISTRATION — while registrationOpen is false, the "register" buttons read
    // "How to register" and scroll to the Register section.
    registrationOpen: false,
    registerUrl: "#",                      // registration form
    interestUrl: "#",                      // "Get notified" form (falls back to the contact email)
    discordUrl: "#",
    rulebookUrl: "#",
    linksPendingText: "The registration link will appear here.",

    // Prizes — exact money and awards come from the presentation.
    // value: shown large in the prize card ("To be announced" until confirmed).
    prizes: [
      {
        title: "Cash prizes",
        value: "To be announced",
        note: "Prize amounts are still being decided.",
        tbc: true
      },
      {
        title: "Non-cash prizes and subscriptions",
        value: "To be announced",
        note: "Subscriptions and other non-cash awards are under discussion.",
        tbc: true
      }
    ],
    // The ONLY wording of the prize/donation model. Shown in the prizes block and the fee FAQ.
    donationNote: "The current plan is to use part of the registration proceeds for prizes and donate the rest to NGOs and community organisations connected with the literacy programme. The final model is still being decided.",
    donationTbc: true,
    sponsorsNote: "Interested in supporting prizes, tool subscriptions, a judge or the guest speaker? Sponsorship is subject to school approval; contact details are below.",

    divisions: [
      {
        name: "Junior",
        grades: "Grade 10 and below",
        guidance: "You'll be given specific problem statements at the briefing, so your team starts from a clear question.",
        note: "Exact lower grade (Grade 6 or 8) to be confirmed",
        tbc: true
      },
      {
        name: "Senior",
        grades: "Grade 11 and above",
        guidance: "You'll get a broad SDG theme and choose your own problem to solve.",
        note: "College participation to be confirmed",
        tbc: true
      }
    ],

    // Draft rules. Shown under the heading so nobody reads them as final.
    aiRulesNote: "Draft rules. The participant rulebook, published before the event, is final.",
    aiRules: [
      "You may use AI tools freely: code assistants, chatbots and generative tools are all allowed.",
      "Vibe coding is welcome. Generating most of your code with AI is fine.",
      "Submit three things: a working MVP, a pitch deck, and an explanation of how the solution would be implemented.",
      "Teams build during the build period, with organiser support on {hackathon.platform}.",
      "Your solution must address a social problem linked to the UN Sustainable Development Goals.",
      "Follow the participant rulebook, published before the event."
    ],

    flow: [
      { title: "Opening ceremony", desc: "Welcome, introductions and how the event will run." },
      { title: "Guest speaker", desc: "A talk from an invited guest speaker (to be announced)." },
      { title: "Challenge briefing", desc: "The theme is revealed. Juniors receive structured problem statements; seniors get the broader SDG theme." },
      { title: "Q&A", desc: "Ask the organisers anything about the theme, rules or submissions before the build starts." },
      { title: "Build period", desc: "Design, prototype and prepare your pitch. Organisers hold office hours on {hackathon.platform} in rotating shifts." },
      { title: "Submission", desc: "Upload your MVP, pitch deck and implementation explanation before the deadline." },
      { title: "Judging and pitches", desc: "Teams pitch to the judges. Results and prizes follow." }
    ],

    judgingTbc: true,                      // when judges are confirmed: set false AND rewrite judgingNote (or set it to "")
    judgingNote: "Exact rubric, weighting and judges to be confirmed.",
    judging: [
      { criterion: "Solution quality and feasibility", desc: "Does it address a real social problem, and could it realistically work?" },
      { criterion: "Implementation thinking", desc: "How clearly the team explains who the solution serves, how it would be rolled out and what it needs." },
      { criterion: "Prototype (MVP)", desc: "A working minimum viable product that demonstrates the core idea." },
      { criterion: "Presentation and pitch", desc: "A clear, honest pitch that communicates the problem, the solution and its impact." }
    ],

    // Duration is not repeated here: it lives in "At a glance".
    logistics: [
      { label: "Format", value: "{hackathon.format}" },
      { label: "Platform", value: "{hackathon.platform}, for announcements, team channels, voice calls and questions" },
      { label: "Submissions", value: "{hackathon.submissions}" },
      { label: "Organiser support", value: "Office hours on {hackathon.platform} in rotating shifts through the build period" },
      { label: "What you need", value: "A laptop or computer and a stable internet connection" },
      { label: "Rulebook", value: "Published before the event: themes, directions, examples, rules and submission requirements" }
    ]
  },

  /* ---------------------------------------------------------------------
     EDUCATION PROGRAMME
     --------------------------------------------------------------------- */
  programme: {
    sessionsCount: "6–8",
    sessionsTbc: true,
    sessionsLabel: "induction sessions",   // the client's term; change here only
    start: "September 2026",

    // track: "hackathon-prep" (online, for participants) | "community" (offline, NGO/community literacy)
    // icon:  ai | code | pitch | shield | finance | hardware  (drawn by programme.css)
    // tbc + tbcNote: shows a small "to be confirmed" pill with tbcNote as its text
    topics: [
      {
        title: "AI literacy",
        desc: "What today's AI can and cannot do, how to prompt well, and how to check what it gives you.",
        track: "hackathon-prep", icon: "ai"
      },
      {
        title: "Basic coding, software and vibe coding",
        desc: "From a first program to building small apps with AI assistance.",
        track: "hackathon-prep", icon: "code"
      },
      {
        title: "Presentation, pitching and solution development",
        desc: "Turning an idea into a problem statement, an MVP plan and a clear, convincing pitch.",
        track: "hackathon-prep", icon: "pitch"
      },
      {
        title: "Cybersecurity",
        desc: "Passwords, phishing and scams, and the new risks that come with AI.",
        track: "community", icon: "shield"
      },
      {
        title: "Digital financial literacy",
        desc: "Spotting fraud, using internet banking safely, and the basics of investing and portfolios.",
        track: "community", icon: "finance"
      },
      {
        title: "Hardware, electronics and engineering",
        desc: "Hands-on sessions with circuits and sensors.",
        track: "community", icon: "hardware",
        tbc: true, tbcNote: "Subject to equipment"
      }
    ],
    // Labels shown on each topic's track pill (main.js adds trackLabel from this map).
    trackLabels: { "hackathon-prep": "Hackathon prep", "community": "Community" },

    // Partner organisations — the client will send the list later.
    // Format: { name: "Organisation", location: "Mumbai", focus: "Digital literacy for ...", url: "https://..." }
    ngos: [],
    ngosEmptyText: "Sessions with NGO and community groups go ahead once school/CAS and partner approvals are in place."
  },

  /* ---------------------------------------------------------------------
     ORGANISING TEAM — first names as on the CAS proposal form
     --------------------------------------------------------------------- */
  team: [
    { role: "Media and outreach", names: ["Nishkarsh", "Nandini", "Aranya", "Tvishaa"] },
    { role: "Online: hackathon and sessions", names: ["Yatharth", "Arjun", "Nishkarsh", "Aryan", "VLK"] },
    { role: "Offline sessions", names: ["Arjun", "Agastya", "Aryan", "Prathmesh", "Yash", "Pratham"] },
    { role: "Website", names: ["Vihan"] }
  ],

  /* ---------------------------------------------------------------------
     CONTACT — leave email "" until there is a real address
     --------------------------------------------------------------------- */
  contact: {
    email: "",
    emailPendingText: "Contact email coming soon",
    instagram: "#"
  },

  /* ---------------------------------------------------------------------
     TIMELINE — status: "done" | "next" (in progress / up next) | "later"
     statusLabel is added automatically from timelineStatusLabels.
     tbcFrom: take the "to be confirmed" marker from that config flag.
     --------------------------------------------------------------------- */
  timelineStatusLabels: { done: "Done", next: "In progress", later: "" },
  timeline: [
    {
      when: "August 2026",
      what: "Project defined",
      detail: "The organising team chose an AI-enabled, social-impact hackathon over a traditional coding contest, with a technology-literacy programme leading up to it.",
      status: "done"
    },
    {
      when: "{programme.start}",
      what: "Induction sessions begin",
      detail: "Offline sessions with NGO and community groups, once approvals are in place, and online preparation sessions for hackathon participants.",
      status: "next"
    },
    {
      when: "October 2026",
      what: "Rulebook published and registration opens",
      detail: "Registration, the {hackathon.platform} server and the participant rulebook open together.",
      status: "later"
    },
    {
      when: "{hackathon.dates}",
      what: "The hackathon",
      detail: "Online on {hackathon.platform}, {hackathon.weekdays}: opening and theme briefing, the build period, submission, then judging and pitches.",
      status: "later",
      tbcFrom: "hackathon.datesTbc"
    },
    {
      when: "After the event",
      what: "Results",
      detail: "Results are announced and prizes awarded.",
      status: "later"
    }
  ],

  /* ---------------------------------------------------------------------
     FAQ — tbc: true adds the "to be confirmed" marker to that question.
     --------------------------------------------------------------------- */
  faq: [
    {
      q: "How do I register?",
      a: "Registration opens in October together with the participant rulebook. The registration link will appear on this page."
    },
    {
      q: "Who can take part?",
      a: "School students, in two divisions. Junior is Grade 10 and below; Senior is Grade 11 and above. The exact lower grade for Junior (Grade 6 or Grade 8) and whether college students can enter Senior are still to be confirmed.",
      tbc: true
    },
    {
      q: "Is there an age limit?",
      a: "Discord requires users to be at least 13. The junior division's lower grade limit, and arrangements for younger participants, will be confirmed before registration opens.",
      tbc: true
    },
    {
      q: "When is it, and how long is the build?",
      a: "It is planned for {hackathon.dates}, {hackathon.weekdays}. The build is proposed to last {hackathon.durationShort}.",
      tbc: true
    },
    {
      q: "What does it cost?",
      a: "The working figure is {hackathon.feeText}. {hackathon.donationNote}",
      tbc: true
    },
    {
      q: "How big can a team be?",
      a: "Up to {hackathon.teamMax} people per team. Whether you can enter on your own is still to be confirmed."
    },
    {
      q: "Can we use AI tools?",
      a: "Yes. AI tools are allowed, vibe coding included. Teams are judged on the overall solution and its feasibility, their implementation thinking, the MVP and the pitch, not on how sophisticated the code is."
    },
    {
      q: "What's the theme?",
      a: "Social problems linked to the UN Sustainable Development Goals. Juniors receive structured problem statements; seniors get a broader theme and define their own problem."
    },
    {
      q: "What do we submit?",
      a: "Three things: a working MVP, a pitch deck, and an explanation of how the solution would actually be implemented."
    },
    {
      q: "What are the prizes?",
      a: "Cash prizes and non-cash prizes such as subscriptions are planned. The amounts and awards will be announced closer to the event.",
      tbc: true
    },
    {
      q: "Is it online?",
      a: "Yes. The plan is to run it online on {hackathon.platform}, for announcements, team channels, voice and questions. Organisers stay available in rotating office-hours shifts during the build."
    },
    {
      q: "Do I need to attend the sessions to compete?",
      a: "We'll confirm this when registration opens. The online preparation sessions are for hackathon participants and will help you get ready.",
      tbc: true
    }
  ]
};
