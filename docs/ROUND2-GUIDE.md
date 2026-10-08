# Evaluator round 2 — semi-final changes

The builders have applied your round-1 feedback (decisions: `docs/ROUND1-DECISIONS.md`; builder reports summarised by the lead below). You now **make the semi-final changes yourself**, then send final feedback.

## Step 1 — verify
Rebuild (`python3 build.py`), screenshot (`python3 shoot.py > /dev/null`), and re-check every Must-fix and Should-fix in YOUR round-1 file. Mark each: fixed / partly / not fixed / regressed.

## Step 2 — make semi-final changes directly in `src/`
- Fix what is still wrong in your lens. Small, surgical edits only — **use the Edit tool (exact string replacement); never rewrite a whole file with Write**, because four other evaluators edit the same tree at the same time. If an Edit fails because the file changed, re-Read and retry.
- Lens ownership to avoid collisions — you may read everything but only edit:
  - **E1 (visual)**: CSS files (`*.css`) — spacing, type, colour, layout.
  - **E2 (content)**: `src/config.js` facts/copy and the matching static fallback text in HTML fragments.
  - **E3 (UX/a11y)**: HTML attributes/ARIA/semantics in fragments, focus/interaction CSS in `base.css` (coordinate: append rules at the end of base.css under a `/* E3 a11y */` comment rather than editing E1's rules), interaction code in `main.js`.
  - **E4 (code/hosting)**: `build.py`, `shoot.py`, `DEPLOY.md`, `head.html`, `hero.js`, and code-level fixes in `main.js`.
  - **E5 (copy/IA)**: visible copy in HTML fragments that is NOT config-driven (headings, leads, labels, button text). Config-driven copy → tell E2 in your final notes instead.
- Do not invent facts (prize amounts, NGO names, fee, emails, URLs). Do not undo decisions in ROUND1-DECISIONS.md; if you disagree with one, say so in your final feedback.
- After your edits: `python3 build.py --strict` may warn only about `siteUrl`; `python3 shoot.py` must show no overflow and no console errors.

## Step 3 — final feedback
Write `/home/claude/dh-site/reviews/E<n>-round2.md`:
1. Verification table of your round-1 items (status).
2. Changes you made (file + what + why).
3. **Absolute final feedback for the lead** — anything remaining that you could not or should not change yourself (outside your lens, needs the client, or a judgement call), each with owner and exact fix. Keep it to what truly matters for launch.
4. Provisional score per component (Nav, Hero, About, Hackathon, Programme, Timeline, Team, FAQ, Register, Footer) and overall for your lens.

Reply with a ≤12-line summary.

## Known client-side gaps (do not try to fix; list in final feedback only if relevant)
Prize amounts, confirmed fee, solo rule, junior lower grade, college entry, exact session count, NGO list, registration/Discord/rulebook/interest URLs, contact email, Instagram, final project name, siteUrl/hosting.
