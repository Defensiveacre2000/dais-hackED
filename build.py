#!/usr/bin/env python3
"""
build.py — assembles the DH 2026 site from src/ (BRIEF §6, ROUND1-DECISIONS D2/D5). Owner: B5.

    python3 build.py            build everything
    python3 build.py --strict   same, but exit 1 if there are any warnings (for CI)

Outputs
  dist/index.html     one self-contained file (images inlined) — for previews and emailing
  dist/artifact.html  the same without doctype/html/head/body wrappers — for publishing as an artifact
  dist/site/          index.html + assets/ + robots.txt (+ sitemap.xml) — THE folder to deploy
                      (GitHub Pages / Netlify / Vercel, see DEPLOY.md)

What it does
  1. Checks src/config.js with Node. A typo there STOPS the build with Node's message and line.
     Then runs main.js's fact logic in Node so the page <head> can use the same values.
  2. Fills {{path|default}} placeholders in head.html from config (title, description, og tags),
     adds canonical/og:url/og:image when SITE.siteUrl is set, and adds schema.org Event JSON-LD.
  3. Concatenates CSS (one <style>) and sections (wrapped in <main id="main" tabindex="-1">).
  4. Emits ONE <script> PER JS FILE, after `node --check` on each (a syntax error stops the build),
     so a broken file cannot take the others down with it.
  5. Inlines assets/<file>.(png|jpg|webp|svg|ico|gif) as data URIs in the single-file outputs and
     warns when one file is inlined more than once (page weight).
  6. Generates favicon-32.png, apple-touch-icon.png (180) and og-image.png (1200×630) for dist/site
     with Pillow, when Pillow is installed.
  7. Warns when a data-fact element's static text differs from config (no-JS visitors and link
     previews would see stale text), and strips HTML comments from the fragments.
  8. Ships slimmed CSS/JS (comments and indentation removed; JS re-checked with node --check).
     The readable, commented sources stay in src/.
  9. dist/site only: copies just the assets the page uses (+ og-image), and self-hosts the two
     fonts from .fonts/ (latin woff2 + a 1 KB ₹ subset, preloaded) instead of Google Fonts when
     .fonts/ and fontTools are available. The single-file build keeps Google Fonts.
"""
from __future__ import annotations

import base64
import hashlib
import html
import json
import mimetypes
import re
import shutil
import subprocess
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
ASSETS = SRC / "assets"
DIST = ROOT / "dist"
SITE_DIR = DIST / "site"
GEN = DIST / ".gen"                      # generated images, cached between builds
FONTS = ROOT / ".fonts" / "node_modules" / "@fontsource-variable"

HEAD = "head.html"
CSS = ["base.css", "hero.css", "programme.css", "info.css", "register.css"]
NAV = "nav.html"
MAIN_SECTIONS = ["hero.html", "info.html", "register.html"]
FOOTER = "footer.html"
JS = ["config.js", "hero.js", "main.js"]

STRICT = "--strict" in sys.argv
warnings: list[str] = []


def warn(msg: str) -> None:
    warnings.append(msg)
    print(f"  warning: {msg}")


def fail(msg: str) -> None:
    print(f"\nERROR: {msg}\nThe build was stopped; nothing was written.")
    sys.exit(1)


def read(name: str) -> str:
    path = SRC / name
    if not path.is_file():
        warn(f"missing fragment src/{name} — skipped")
        return ""
    return path.read_text(encoding="utf-8").strip("\n")


# ---------------------------------------------------------------- comments

COMMENT = re.compile(r"<!--.*?-->[ \t]*\n?", re.S)
TEMPLATE_OR_RAW = re.compile(r"(<(script|style)\b.*?</\2>)", re.S | re.I)


def strip_comments(fragment: str) -> str:
    """Remove HTML comments (ownership notes etc.), leaving <script>/<style> contents alone."""
    parts = TEMPLATE_OR_RAW.split(fragment)
    out = []
    i = 0
    while i < len(parts):
        out.append(COMMENT.sub("", parts[i]))
        if i + 1 < len(parts):
            out.append(parts[i + 1])        # the raw block
            i += 3                          # skip the tag-name group
        else:
            i += 1
    return "".join(out)


# ---------------------------------------------------------------- Node: config + facts

def node_bin() -> str | None:
    return shutil.which("node")


def check_js_syntax(node: str | None) -> None:
    if not node:
        warn("Node.js not found: JavaScript was NOT syntax-checked. Install Node (https://nodejs.org).")
        return
    for n in JS:
        p = SRC / n
        if not p.is_file():
            continue
        r = subprocess.run([node, "--check", str(p)], capture_output=True, text=True, timeout=30)
        if r.returncode != 0:
            lines = [l for l in r.stderr.splitlines() if l.strip()][:6]
            fail(f"src/{n} has a syntax mistake. Node says:\n  " + "\n  ".join(lines))


NODE_EVAL = r"""
global.window = {};
try { require(process.argv[1]); } catch (e) { console.error(String(e && e.stack || e)); process.exit(2); }
if (!window.SITE || typeof window.SITE !== 'object') { console.error('config.js must assign window.SITE = { ... }'); process.exit(2); }
var facts = {};
try {
  require(process.argv[2]);                       // main.js exports window.DHFacts when there is no DOM
  var paths = JSON.parse(process.argv[3]);
  paths.forEach(function (p) { var t = window.DHFacts.text(window.DHFacts.get(p)); if (t !== undefined) facts[p] = t; });
} catch (e) { console.error('main.js fact helpers failed: ' + e); }
process.stdout.write(JSON.stringify({ site: window.SITE, facts: facts }));
"""


def load_site(node: str | None, paths: list[str]) -> tuple[dict | None, dict]:
    if not node:
        warn("Node.js not found: config.js was NOT checked and <head> uses its default text.")
        return None, {}
    r = subprocess.run([node, "-e", NODE_EVAL, str(SRC / "config.js"), str(SRC / "main.js"),
                        json.dumps(sorted(set(paths)))], capture_output=True, text=True, timeout=30)
    if r.returncode != 0:
        lines = [l for l in r.stderr.splitlines() if l.strip()][:8]
        fail("src/config.js has a mistake (often a missing comma or quote). The site would show stale "
             "values and the mobile menu would stop working. Node says:\n  " + "\n  ".join(lines))
    if r.stderr.strip():
        warn(r.stderr.strip().splitlines()[0])
    data = json.loads(r.stdout)
    return data["site"], data["facts"]


def site_get(site: dict | None, path: str, default=None):
    cur = site
    for part in path.split("."):
        if not isinstance(cur, dict) or part not in cur:
            return default
        cur = cur[part]
    return default if cur in (None, "") else cur


# ---------------------------------------------------------------- head, share tags, JSON-LD

PLACEHOLDER = re.compile(r"\{\{\s*([\w.]+)\s*(?:\|([^}]*))?\}\}")


def fill_placeholders(text: str, facts: dict) -> str:
    """{{path|default}} → HTML-escaped config fact (tokens resolved), else the default."""
    def sub(m: re.Match) -> str:
        val = facts.get(m.group(1))
        if val in (None, ""):
            val = m.group(2) or ""
            if m.group(1) not in facts:
                warn(f"head placeholder {{{{{m.group(1)}}}}} has no config value — used its default")
        return html.escape(str(val), quote=True)
    return PLACEHOLDER.sub(sub, text)


def is_url(v) -> bool:
    return isinstance(v, str) and v.startswith(("http://", "https://"))


def share_tags(site: dict | None) -> str:
    url = str(site_get(site, "siteUrl", "") or "").rstrip("/")
    if not url:
        warn("SITE.siteUrl is empty: no canonical / og:url / og:image tags yet (set it once hosting is decided)")
        return ""
    e = lambda v: html.escape(v, quote=True)
    return "\n".join([
        f'<link rel="canonical" href="{e(url)}/">',
        f'<meta property="og:url" content="{e(url)}/">',
        f'<meta property="og:image" content="{e(url)}/assets/og-image.png">',
        '<meta property="og:image:width" content="1200">',
        '<meta property="og:image:height" content="630">',
    ])


def event_jsonld(site: dict | None, facts: dict) -> str:
    """schema.org Event built from config, so search results never drift from the page."""
    if not site:
        return ""
    h = site.get("hackathon", {}) or {}
    url = str(site.get("siteUrl") or "").rstrip("/")
    discord = h.get("discordUrl")
    ev = {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": f'{site.get("name", "")} hackathon'.strip(),
        "description": facts.get("description", ""),
        # Date only: no start time has been decided.
        "startDate": str(h.get("start") or "")[:10] or None,
        "endDate": str(h.get("end") or "")[:10] or None,
        "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
        "eventStatus": "https://schema.org/EventScheduled",
        "location": {"@type": "VirtualLocation", "name": h.get("platform") or "Online",
                     **({"url": discord} if is_url(discord) else ({"url": url + "/"} if url else {}))},
        # The project is initiated, planned and run by the students (proposal form).
        "organizer": {"@type": "Organization",
                      "name": f'{site.get("name", "")} organising team, Year 12 students at {site.get("school", "")}'.strip()},
        "inLanguage": "en-IN",
    }
    if url:
        ev["url"] = url + "/"
        ev["image"] = url + "/assets/og-image.png"
    fee = h.get("fee") or {}
    # Never publish an unconfirmed price to search engines.
    if fee.get("amount") and fee.get("tbc") is False and h.get("registrationOpen") is True and is_url(h.get("registerUrl")):
        ev["offers"] = {"@type": "Offer", "price": fee["amount"], "priceCurrency": "INR",
                        "url": h["registerUrl"], "availability": "https://schema.org/InStock"}
    ev = {k: v for k, v in ev.items() if v not in (None, "", {})}
    return ('<script type="application/ld+json">\n'
            + json.dumps(ev, ensure_ascii=False, indent=1).replace("</", "<\\/") + "\n</script>")


# ---------------------------------------------------------------- assets

ASSET_REF = re.compile(r"(?<![\w/.-])(?:\./)?assets/([\w.-]+\.(?:png|jpe?g|webp|svg|ico|gif))", re.I)
_uri_cache: dict[str, str | None] = {}
inline_counts: Counter = Counter()


def asset_path(filename: str) -> Path | None:
    for d in (ASSETS, GEN):
        p = d / filename
        if p.is_file():
            return p
    return None


def data_uri(filename: str) -> str | None:
    if filename in _uri_cache:
        return _uri_cache[filename]
    p = asset_path(filename)
    if not p:
        warn(f"asset assets/{filename} not found in src/assets — reference left unchanged")
        _uri_cache[filename] = None
        return None
    mime = mimetypes.guess_type(filename)[0] or "application/octet-stream"
    if filename.lower().endswith(".svg"):
        mime = "image/svg+xml"
    _uri_cache[filename] = f"data:{mime};base64," + base64.b64encode(p.read_bytes()).decode("ascii")
    return _uri_cache[filename]


def inline_assets(text: str, count: bool = False) -> str:
    def sub(m: re.Match) -> str:
        uri = data_uri(m.group(1))
        if uri and count:
            inline_counts[m.group(1)] += 1
        return uri if uri else m.group(0)
    return ASSET_REF.sub(sub, text)


def gen_images(site: dict | None) -> None:
    """favicon-32.png, apple-touch-icon.png, og-image.png → dist/.gen (cached by inputs)."""
    try:
        from PIL import Image, ImageDraw, ImageFont
    except ImportError:
        warn("Pillow not installed: favicon-32 / apple-touch-icon / og-image were not generated "
             "(pip install pillow)")
        return
    GEN.mkdir(parents=True, exist_ok=True)
    name = str(site_get(site, "name", "DH 2026"))
    tagline = str(site_get(site, "tagline", ""))
    platform = str(site_get(site, "hackathon.platform", "") or "")
    school = str(site_get(site, "school", ""))
    logo_p, white_p = ASSETS / "logo.png", ASSETS / "logo-white.png"
    sig_src = "|".join([name, tagline, platform, school, "v3"] +
                       [f"{p.name}:{p.stat().st_mtime_ns}" for p in (logo_p, white_p) if p.is_file()])
    sig = hashlib.sha1(sig_src.encode()).hexdigest()
    stamp = GEN / ".stamp"
    want = ["favicon-32.png", "apple-touch-icon.png", "og-image.png"]
    if stamp.is_file() and stamp.read_text() == sig and all((GEN / w).is_file() for w in want):
        return

    def square(src: Path, size: int, pad: float, bg) -> Image.Image:
        im = Image.open(src).convert("RGBA")
        box = round(size * (1 - 2 * pad))
        im.thumbnail((box, box), Image.LANCZOS)
        out = Image.new("RGBA", (size, size), bg)
        out.alpha_composite(im, ((size - im.width) // 2, (size - im.height) // 2))
        return out

    fav_src = ASSETS / "favicon.png" if (ASSETS / "favicon.png").is_file() else logo_p
    if fav_src.is_file():
        square(fav_src, 32, 0.0, (0, 0, 0, 0)).save(GEN / "favicon-32.png", optimize=True)
    if logo_p.is_file():
        square(logo_p, 180, 0.12, (255, 255, 255, 255)).convert("RGB").quantize(64).save(GEN / "apple-touch-icon.png", optimize=True)
    else:
        warn("src/assets/logo.png missing: favicon-32 / apple-touch-icon not generated")

    # Open Graph card: brand gradient, name, tagline, school, white logo.
    W, H = 1200, 630
    stops = [(0.0, (0x03, 0x38, 0xA8)), (0.55, (0x05, 0x68, 0xF5)), (1.0, (0x4D, 0x9B, 0xFF))]

    def grad(t: float):
        for (t0, c0), (t1, c1) in zip(stops, stops[1:]):
            if t <= t1:
                u = (t - t0) / (t1 - t0)
                return tuple(round(c0[i] + (c1[i] - c0[i]) * u) for i in range(3))
        return stops[-1][1]
    line = Image.new("RGB", (W + H, 1))
    line.putdata([grad(i / (W + H - 1)) for i in range(W + H)])
    img = Image.new("RGB", (W, H))
    for y in range(H):                                  # diagonal 135° gradient, one row at a time
        img.paste(line.crop((y, 0, y + W, 1)), (0, y))

    if white_p.is_file():
        logo = Image.open(white_p).convert("RGBA")
        lh = 420
        logo = logo.resize((round(logo.width * lh / logo.height), lh), Image.LANCZOS)
        img.paste(logo, (W - logo.width - 90, (H - lh) // 2), logo)

    def font(kind: str, size: int, weight: int):
        woff = FONTS / ("unbounded/files/unbounded-latin-wght-normal.woff2" if kind == "display"
                        else "manrope/files/manrope-latin-wght-normal.woff2")
        try:
            from fontTools.ttLib import TTFont
            ttf = GEN / (kind + ".ttf")
            if not ttf.is_file():
                t = TTFont(str(woff)); t.flavor = None; t.save(str(ttf))
            f = ImageFont.truetype(str(ttf), size)
            try:
                f.set_variation_by_axes([weight])
            except Exception:
                pass
            return f
        except Exception:
            for cand in ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
                         "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"):
                if Path(cand).is_file():
                    return ImageFont.truetype(cand, size)
            return ImageFont.load_default()

    d = ImageDraw.Draw(img)
    title_font = font("display", 84 if len(name) <= 12 else 60, 800)
    d.text((80, 160), name, font=title_font, fill="white")
    sub = (tagline[:1].upper() + tagline[1:]) if tagline else ""
    words, lines_, cur = sub.split(), [], ""
    f2 = font("body", 34, 600)
    for w in words:
        test = (cur + " " + w).strip()
        if d.textlength(test, font=f2) > 640 and cur:
            lines_.append(cur); cur = w
        else:
            cur = test
    if cur:
        lines_.append(cur)
    if platform:
        lines_.append(f"Online on {platform}")
    d.multiline_text((80, 290), "\n".join(lines_[:3]), font=f2, fill=(234, 242, 255), spacing=12)
    if school:
        d.text((80, 500), school, font=font("body", 24, 500), fill=(214, 232, 255))
    img.save(GEN / "og-image.png", optimize=True)
    stamp.write_text(sig)


def write_site(index_html: str, site: dict | None) -> None:
    """dist/site/: index.html + assets/ as real files, ready for any static host."""
    if SITE_DIR.exists():
        shutil.rmtree(SITE_DIR)
    (SITE_DIR / "assets").mkdir(parents=True)
    # Only what the page uses, plus the share image (og:image is added once siteUrl is set).
    wanted = {m.group(1) for m in ASSET_REF.finditer(index_html)} | {"og-image.png"}
    for name in sorted(wanted):
        p = asset_path(name)
        if p:
            shutil.copy2(p, SITE_DIR / "assets" / name)
        elif name != "og-image.png":
            warn(f"dist/site: assets/{name} is referenced but does not exist")
    index_html = self_host_fonts(index_html)
    (SITE_DIR / "index.html").write_text(index_html, encoding="utf-8")
    url = str(site_get(site, "siteUrl", "") or "").rstrip("/")
    (SITE_DIR / "robots.txt").write_text("User-agent: *\nAllow: /\n" + (f"Sitemap: {url}/sitemap.xml\n" if url else ""),
                                         encoding="utf-8")
    if url:
        (SITE_DIR / "sitemap.xml").write_text(
            '<?xml version="1.0" encoding="UTF-8"?>\n'
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
            f"<url><loc>{html.escape(url)}/</loc></url></urlset>\n", encoding="utf-8")


# ---------------------------------------------------------------- checks

FACT_EL = re.compile(r'<(\w+)\b[^>]*?\sdata-fact="([^"]+)"[^>]*>([^<]*)</\1>')


def fact_paths(*texts: str) -> list[str]:
    paths = set()
    for t in texts:
        paths.update(m.group(2) for m in FACT_EL.finditer(t))
        paths.update(re.findall(r'data-fact="([^"]+)"', t))
        paths.update(m.group(1) for m in PLACEHOLDER.finditer(t))
    return sorted(paths)


def check_static_drift(fragments: dict[str, str], facts: dict) -> None:
    """Static fallback text must equal config, or no-JS visitors / link previews see stale text."""
    if not facts:
        return
    for name, frag in fragments.items():
        for m in FACT_EL.finditer(frag):
            path, static = m.group(2), html.unescape(m.group(3)).strip()
            if path == "contact.email" or path not in facts:
                continue
            want = facts[path].strip()
            if static and static != want:
                warn(f'src/{name}: data-fact="{path}" says "{static}" but config says "{want}"')


def check_logo_copies() -> None:
    """logo-nav.png / logo-white-sm.png are small copies of the master logos: flag them when stale."""
    for master, copy in (("logo.png", "logo-nav.png"), ("logo-white.png", "logo-white-sm.png")):
        m, c = ASSETS / master, ASSETS / copy
        if m.is_file() and c.is_file() and m.stat().st_mtime > c.stat().st_mtime + 1:
            warn(f"src/assets/{master} is newer than {copy}: regenerate the small copy (see DEPLOY.md §5)")


def check_ids(doc: str) -> None:
    ids = re.findall(r'\sid="([^"]+)"', doc)
    for d, c in Counter(ids).items():
        if c > 1:
            warn(f'duplicate id="{d}" ({c}×)')


def safe_script(js: str) -> str:
    return re.sub(r"</(script)", r"<\\/\1", js, flags=re.I)


# ---------------------------------------------------------------- output slimming (sources keep their comments)

CSS_TOKEN = re.compile(r'("(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\')|/\*.*?\*/', re.S)


def slim_css(css: str) -> str:
    """Drop CSS comments (never inside strings) and indentation/blank lines. Rules are untouched."""
    css = CSS_TOKEN.sub(lambda m: m.group(1) or "", css)
    return "\n".join(l.strip() for l in css.splitlines() if l.strip())


JS_BLOCK_COMMENT_LINES = re.compile(r"^[ \t]*/\*.*?\*/[ \t]*\n", re.S | re.M)


def slim_js(js: str, name: str, node: str | None) -> str:
    """Drop whole-line /* … */ comment blocks and indentation. Verified with `node --check`;
    falls back to the original text if the slimmed version does not parse."""
    slim = JS_BLOCK_COMMENT_LINES.sub("", js)
    if "`" not in slim:                      # template literals may hold meaningful indentation
        slim = "\n".join(l.strip() for l in slim.splitlines() if l.strip())
    if not node:
        return js
    GEN.mkdir(parents=True, exist_ok=True)
    tmp = GEN / f"_check_{name}"
    tmp.write_text(slim, encoding="utf-8")
    ok = subprocess.run([node, "--check", str(tmp)], capture_output=True, timeout=30).returncode == 0
    tmp.unlink(missing_ok=True)
    if not ok:
        warn(f"src/{name}: comment stripping produced invalid JS — shipped unslimmed")
        return js
    return slim


# ---------------------------------------------------------------- self-hosted fonts (dist/site only)

GOOGLE_FONTS = re.compile(
    r'<link rel="preconnect" href="https://fonts\.googleapis\.com">\s*'
    r'<link rel="preconnect" href="https://fonts\.gstatic\.com" crossorigin>\s*'
    r'<link rel="stylesheet" href="https://fonts\.googleapis\.com/css2\?[^"]*">')
LATIN_RANGE = ("U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,"
               "U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD")
FONT_FACES = [("Unbounded", "unbounded", "500 800"), ("Manrope", "manrope", "400 800")]


def self_host_fonts(index_html: str) -> str:
    """Replace the Google Fonts <link> in dist/site with local woff2 files + preload.
    Removes two third-party connections and the render-blocking cross-origin stylesheet, and
    serves ₹ from a 1 KB subset instead of Google's ~133 KB latin-ext files.
    Skipped (Google Fonts kept) when the @fontsource files are not installed:
    npm ci --prefix .fonts"""
    if not GOOGLE_FONTS.search(index_html):
        return index_html
    src = {slug: (FONTS / slug / "files" / f"{slug}-latin-wght-normal.woff2",
                  FONTS / slug / "files" / f"{slug}-latin-ext-wght-normal.woff2") for _, slug, _ in FONT_FACES}
    if not all(p.is_file() for pair in src.values() for p in pair):
        print("  note: .fonts/ not installed — dist/site keeps Google Fonts (npm ci --prefix .fonts to self-host)")
        return index_html
    try:
        from fontTools import subset as ftsubset
        import brotli  # noqa: F401  (fontTools needs it to read/write .woff2)
    except ImportError:
        print("  note: fontTools/brotli not installed — dist/site keeps Google Fonts (pip install fonttools brotli)")
        return index_html
    out = SITE_DIR / "assets" / "fonts"
    out.mkdir(parents=True, exist_ok=True)
    faces, preloads = [], []
    for family, slug, weight in FONT_FACES:
        latin, ext = src[slug]
        shutil.copy2(latin, out / f"{slug}-latin.woff2")
        opts = ftsubset.Options(); opts.flavor = "woff2"; opts.layout_features = ["*"]
        font = ftsubset.load_font(str(ext), opts)
        sub = ftsubset.Subsetter(opts); sub.populate(unicodes=[0x20B9]); sub.subset(font)
        ftsubset.save_font(font, str(out / f"{slug}-rupee.woff2"), opts)
        faces.append(f"@font-face{{font-family:'{family}';font-style:normal;font-weight:{weight};font-display:swap;"
                     f"src:url(assets/fonts/{slug}-latin.woff2) format('woff2');unicode-range:{LATIN_RANGE}}}")
        faces.append(f"@font-face{{font-family:'{family}';font-style:normal;font-weight:{weight};font-display:swap;"
                     f"src:url(assets/fonts/{slug}-rupee.woff2) format('woff2');unicode-range:U+20B9}}")
        preloads.append(f'<link rel="preload" href="assets/fonts/{slug}-latin.woff2" as="font" type="font/woff2" crossorigin>')
    return GOOGLE_FONTS.sub(lambda m: "\n".join(preloads) + "\n<style>" + "\n".join(faces) + "</style>",
                            index_html, count=1)


def kb(n: int) -> str:
    return f"{n:,} bytes ({n / 1024:.1f} KB)"


# ---------------------------------------------------------------- main

def sync_static_facts(fragments: dict[str, str], facts: dict) -> dict[str, str]:
    """Write config values into each data-fact fallback, so config.js really is the only file to edit.
    No-JS visitors and link previews then see the same text as the rendered page."""
    if not facts:
        return fragments
    changed = 0

    def rep(m: re.Match) -> str:
        nonlocal changed
        path = m.group(2)
        if path == "contact.email" or path not in facts:
            return m.group(0)
        want = html.escape(facts[path].strip(), quote=False)
        if html.unescape(m.group(3)).strip() == facts[path].strip():
            return m.group(0)
        changed += 1
        s, e = m.start(3) - m.start(0), m.end(3) - m.start(0)
        return m.group(0)[:s] + want + m.group(0)[e:]

    out = {n: FACT_EL.sub(rep, f) for n, f in fragments.items()}
    if changed:
        print(f"  synced {changed} static fallback(s) from config.js")
    return out


def main() -> int:
    print("Building the site from src/ …")
    node = node_bin()
    check_js_syntax(node)

    head_src = strip_comments(read(HEAD))
    nav = strip_comments(read(NAV))
    sections = {n: strip_comments(read(n)) for n in MAIN_SECTIONS}
    footer = strip_comments(read(FOOTER))
    fragments = {NAV: nav, **sections, FOOTER: footer}

    wanted = fact_paths(head_src, *fragments.values()) + ["name", "tagline", "description"]
    site, facts = load_site(node, wanted)
    fragments = sync_static_facts(fragments, facts)
    nav, footer = fragments[NAV], fragments[FOOTER]
    sections = {n: fragments[n] for n in MAIN_SECTIONS}
    if "--check-drift" in sys.argv:
        check_static_drift(fragments, facts)

    head = fill_placeholders(head_src, facts)
    extra_head = "\n".join(x for x in (share_tags(site), event_jsonld(site, facts)) if x)
    if extra_head:
        head += "\n" + extra_head

    css = "\n".join(f"/* {n} */\n{slim_css(c)}" for n in CSS if (c := read(n)))
    style = f"<style>\n{css}\n</style>" if css else ""
    script = "\n".join(f"<script>\n/* {n} — readable source with comments: src/{n} */\n{safe_script(slim_js(j, n, node))}\n</script>"
                       for n in JS if (j := read(n)))
    check_logo_copies()

    main_html = "\n\n".join(s for s in sections.values() if s)
    body = "\n\n".join(x for x in (nav, f'<main id="main" tabindex="-1">\n{main_html}\n</main>', footer) if x)

    index = ('<!doctype html>\n<html lang="en-IN">\n<head>\n'
             f"{head}\n{style}\n</head>\n<body>\n{body}\n\n{script}\n</body>\n</html>\n")
    artifact = f"{head}\n{style}\n\n{body}\n\n{script}\n"
    check_ids(index)

    gen_images(site)
    write_site(index, site)

    # Single-file outputs are for previews/email: a data-URI apple-touch-icon is dead weight there.
    no_touch = re.compile(r'<link rel="apple-touch-icon"[^>]*>\n?')
    index_inl = inline_assets(no_touch.sub("", index), count=True)
    artifact_inl = inline_assets(no_touch.sub("", artifact))
    for f, c in inline_counts.items():
        if c > 1:
            size = (asset_path(f) or Path()).stat().st_size if asset_path(f) else 0
            warn(f"assets/{f} ({size / 1024:.0f} KB) is inlined {c}× in the single-file build — "
                 "use a smaller copy or one shared reference")
    leftover = set(re.findall(r'["(\s]assets/[\w.-]+', index_inl))
    for ref in sorted(leftover):
        warn(f"un-inlined asset reference left in dist/index.html: {ref.strip()}")

    DIST.mkdir(parents=True, exist_ok=True)
    (DIST / "index.html").write_text(index_inl, encoding="utf-8")
    (DIST / "artifact.html").write_text(artifact_inl, encoding="utf-8")

    print(f"  inlined assets: {', '.join(f'{k}×{v}' for k, v in sorted(inline_counts.items())) or 'none'}")
    print(f"  wrote dist/index.html:     {kb((DIST / 'index.html').stat().st_size)}")
    print(f"  wrote dist/artifact.html:  {kb((DIST / 'artifact.html').stat().st_size)}")
    site_assets = sorted(p.name for p in (SITE_DIR / "assets").iterdir())
    print(f"  wrote dist/site/index.html: {kb((SITE_DIR / 'index.html').stat().st_size)}"
          f" + assets/ ({', '.join(site_assets)})  ← deploy this folder")
    print(f"Done with {len(warnings)} warning(s).")
    return 1 if (STRICT and warnings) else 0


if __name__ == "__main__":
    sys.exit(main())
