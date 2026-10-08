# Final scoring (all 10 agents)

The lead has integrated the evaluators' absolute final feedback. Changes since round 2:
- Config copy: removed the duplicate "judged on the solution" rule; sponsorsNote is now an invitation; linksPendingText "The registration link will appear here."; sessions FAQ says "for hackathon participants"; FAQ date/fee answers no longer double-hedge; hero/description say "on 24–25 October 2026".
- Hackathon: "don't compete against much older ones"; duration sub-label "in total · proposed"; "Discord" in static lines now from config; `!important` removed; 7-step horizontal flow starts at 1320px.
- IA: "Why a hackathon / global issue / CAS strands" moved from About into the Team section under "Why we're running this".
- build.py: writes config values into static data-fact fallbacks (no drift warnings; `--check-drift` keeps the old check); JSON-LD date-only, organiser = student team; hero logo regenerated at full resolution; `.gitignore` added; DEPLOY.md updated.

## Your task
1. The build in `dist/` and screenshots in `dist/shots/` are current — do NOT rebuild or re-run shoot.py (ten agents are reading at once). Copy screenshots to your own scratch folder before slicing, and look at the final page (slice screenshots; spot-check what matters to you).
2. Do NOT edit any files.
3. Write `/home/claude/dh-site/reviews/final-scores/<YOUR-ID>.json` (create the folder if needed):
```json
{"agent":"E1","role":"Visual design & brand",
 "scores":{"Nav":0,"Hero":0,"About":0,"Hackathon":0,"Programme":0,"Timeline":0,"Team":0,"FAQ":0,"Register":0,"Footer":0},
 "lens_score":0, "overall":0,
 "one_line_verdict":"…",
 "top_remaining_issue":"…"}
```
Scores are 1–10, decimals allowed. `overall` = your judgement of the whole site as a professional, launch-ready website *given that the client still has to supply the TBC facts* (don't penalise for missing prize amounts, links, email — but do penalise for anything the build team could have done better). Be calibrated: builders must not inflate their own work; 9+ means you'd ship it to a paying client unchanged.
4. Reply with one line: your overall score and verdict.
