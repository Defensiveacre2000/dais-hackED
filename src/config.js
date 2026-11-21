/* ==========================================================================
   DAIS HackED — SITE CONFIG
   ==========================================================================

   EDIT THIS FILE TO UPDATE FACTS. Every fact on the page comes from here.
   After editing, run

       python3 build.py

   and publish dist/site/ (see DEPLOY.md). If you make a typing mistake here
   (a missing comma or quote), build.py stops and tells you the line.

   HOW VALUES ARE USED
   - data-fact="dotted.path"   on an element → its text is this value
   - data-href="dotted.path"   on a link     → its address is this value.
                                 "#" or "" = not ready yet: the link is hidden.
   - data-render="key"         on a list     → the list is drawn from the array
   - data-tbc-flag="dotted.path"             → a "tentative" label that
                                 disappears when that flag is set to false
   - {dotted.path} inside any text is replaced by that value.
   - Text is shown as plain text, never as HTML.

   STILL TO DO
     [x] Dates confirmed: opening ceremony Sat 28 Nov 10:00 a.m., hacking to Sun 29 Nov 12:00 p.m. (IST)
     [ ] Registration link           → hackathon.registerUrl + registrationOpen: true
     [ ] NGO / partner list           → programme.ngos
     [ ] Instagram link               → contact.instagram
     [x] Public web address           → siteUrl = https://dais-hacked.netlify.app
   ========================================================================== */

window.SITE = {
  name: "DAIS HackED",
  tagline: "Social-impact hackathon",
  description: "DAIS HackED is an online, 24-hour social-impact hackathon for school and college students on {hackathon.dates}, with {programme.sessionsCount} induction sessions beforehand. A Year 12 IB CAS project at {school}.",
  school: "Dhirubhai Ambani International School, Mumbai",
  year: "2026–27",

  siteUrl: "https://dais-hacked.netlify.app",

  /* ---------------------------------------------------------------------
     HACKATHON
     --------------------------------------------------------------------- */
  hackathon: {
    dates: "28–29 November 2026",
    datesTbc: false,                       // set true to show "tentative" labels again
    weekdays: "Saturday to Sunday",
    timesText: "Sat 10:00 a.m. to Sun 12:00 p.m. (IST)",

    // EVENT-DAY SCHEDULE (all times IST, +05:30). The home screen switches
    // automatically: countdown → opening ceremony → hacking live → ended.
    // Preview any screen with  ?preview=ceremony  /  ?preview=live  /  ?preview=ended
    start:      "2026-11-28T10:00:00+05:30",   // opening ceremony begins (the countdown counts to this)
    buildStart: "2026-11-28T12:00:00+05:30",   // hacking begins after the 2-hour ceremony
    end:        "2026-11-29T12:00:00+05:30",   // hacking ends: 24 hours of building
    ceremonyAgenda: ["Welcome", "Guest speaker", "SDG challenge reveal", "Q&A"],

    format: "Online",
    platform: "",                          // not decided yet; leave empty to hide it

    durationHours: 24,
    durationTbc: false,

    teamMax: 4,
    soloAllowed: true,

    // Never call this a "fee" on the site — it is shown as "Registration".
    fee: { amount: 1000, currency: "₹", per: "team", tbc: false },

    prizePool: "₹20,000+",

    challenge: "The UN Sustainable Development Goals you'll work on are revealed on the day of the hackathon. That's the challenge: pick up the problem, build a solution in 24 hours, and pitch it.",
    deliverables: "A working prototype (MVP), a short pitch deck, and an explanation of how your solution would be put into practice.",
    aiNote: "AI tools and vibe coding are allowed, with no restrictions.",

    registrationOpen: true,               // "Registrations now open" shows; the button appears once registerUrl is set
    registerUrl: "#",                      // registration link — paste it here, then set registrationOpen: true
    interestUrl: "#",
    linksPendingText: "The registration link will appear here.",

    divisions: [
      { name: "Junior", grades: "Grades 6 to 10" },
      { name: "Senior", grades: "Grade 11, 12 and college students" }
    ]
  },

  /* ---------------------------------------------------------------------
     INDUCTION SESSIONS
     --------------------------------------------------------------------- */
  programme: {
    sessionsCount: 4,
    sessionsLabel: "induction sessions",
    sessionsTbc: false,
    start: "",                             // dates to be confirmed — left blank so the site stays non-specific
    trackLabels: { "hackathon-prep": "Online", "community": "Offline" },
    topics: [
      { title: "Pitching and solution development", track: "hackathon-prep", icon: "pitch",
        desc: "Turning an idea into a problem statement, an MVP plan and a clear pitch." },
      { title: "Cybersecurity", track: "community", icon: "shield",
        desc: "Passwords, phishing and scams, and the new risks that come with AI." },
      { title: "Digital financial literacy", track: "community", icon: "finance",
        desc: "Spotting fraud, using internet banking safely, and the basics of investing." },
      { title: "Hardware and electronics", track: "community", icon: "hardware",
        desc: "Hands-on sessions with circuits and sensors." }
    ],
    // Partner NGOs — add one object per organisation; the cards appear automatically.
    // { name: "…", location: "…", focus: "…", url: "https://…" }
    ngos: [],
    ngosEmptyText: "Partner NGOs will be listed here soon."
  },

  contact: {
    email: "dais.hack.ed@gmail.com",
    emailPendingText: "Contact email coming soon",
    instagram: "#"
  }
};
