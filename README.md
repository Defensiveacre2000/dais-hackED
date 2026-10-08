# DAIS HackED website

The website for **DAIS HackED**, the Year 12 CAS hackathon at Dhirubhai Ambani International School.

## How this repository works

| Branch | What it is | Who touches it |
|---|---|---|
| `main` | The working copy and backup of the source files. Push here as often as you like: **the live site does not change.** | You |
| `live` | The finished website files that Netlify serves. Created and updated automatically. | Nobody (the publish button writes it) |

**To publish your changes:** GitHub → **Actions** tab → **Publish website** → **Run workflow** → **Run workflow**.
About a minute later the live site shows whatever is on `main`. If you don't press the button, nothing goes live.

Every push to `main` also runs **Check build**, which puts a ✓ or ✗ next to your commit, so you know it's safe to publish.

## Changing the website

Almost everything (dates, prize pool, registration amount, contact email, registration link, NGO list, session topics) lives in **one file: `src/config.js`**. Change the value between the quotes and keep every comma, quote and bracket. Examples:

- Dates confirmed: set `datesTbc: false` (the "tentative" labels disappear).
- Registration opens: paste the form link as `registerUrl: "https://…"` and set `registrationOpen: true`. Every "How to register" button becomes "Register your team" and goes to the form.
- Platform decided: set `platform: "…"` and it appears next to "Online".
- NGO partners: add `{ name: "…", location: "…", focus: "…", url: "https://…" }` inside `ngos: [ ]`.
- Instagram: replace `"#"` in `instagram: "#"` with the link. Links left as `"#"` stay hidden.

Page text that isn't in config is in `src/hero.html`, `src/info.html` and `src/register.html`. Styles are in the `.css` files next to them.

## Previewing on your own laptop (optional)

You need **Python 3** (already on most Macs). Then:

```bash
python3 build.py
open dist/index.html        # Mac; on Windows just double-click the file
```

`dist/index.html` is the whole site in one file, so it works straight from your disk with no server. If you typo `config.js`, the build tells you the line number. (Optional extras for the full build: `pip install pillow fonttools` and `npm ci --prefix .fonts`. The publish button always does the full build anyway.)

## Getting the code (first time)

```bash
git clone https://github.com/<owner>/dais-hacked.git
cd dais-hacked
```

Then the usual loop: edit → `git add -A` → `git commit -m "what you changed"` → `git push`. Press **Publish website** when you want it live.
If you'd rather not use the terminal, GitHub Desktop or editing files directly on github.com (pencil icon) works the same way.

## One-time hosting setup (already done if the site is live)

**Netlify:** Add new site → Import an existing project → GitHub → pick this repository → **Branch to deploy: `live`** → leave the build command empty and the publish directory empty → Deploy. Rename the site under *Site configuration → Change site name*.
(Run **Publish website** once first, so the `live` branch exists.)

**Or GitHub Pages (no extra account):** Settings → Pages → Source: *Deploy from a branch* → `live` / `(root)` → Save.

Once you know the public address, put it in `siteUrl` in `src/config.js` (no trailing slash) and publish again. That turns on the preview image when the link is shared on WhatsApp or Instagram.

## What's where

```
src/            the source: config.js (facts), HTML sections, CSS, JS, assets/
build.py        assembles src/ into dist/ (dist/site = what gets published)
.github/        the Check build and Publish website workflows
_versions/      the earlier, longer version of the site, kept for reference
docs/, reviews/ the original brief, meeting notes and design reviews
```
