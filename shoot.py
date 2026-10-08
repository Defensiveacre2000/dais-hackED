#!/usr/bin/env python3
"""
shoot.py — screenshot + QA pass over dist/index.html. Owner: B5.

    python3 build.py && python3 shoot.py

For widths 360, 768, 1280 (light and dark):
  - full-page screenshot → dist/shots/{width}.png and dist/shots/{width}-dark.png
  - console errors / page errors
  - horizontal overflow (documentElement.scrollWidth > innerWidth) + the widest offenders
  - computed font-family of h1 and body, and whether the web fonts actually loaded
Plus one load of dist/site/ (the deploy folder) over local HTTP: console errors, failed
asset/font requests and any third-party requests → report["site"].
Prints a JSON report and saves it to dist/shots/report.json.
"""
from __future__ import annotations

import glob
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PAGE = ROOT / "dist" / "index.html"
SHOTS = ROOT / "dist" / "shots"
WIDTHS = [360, 768, 1280]
HEIGHT = 900

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("playwright missing — installing (browsers are preinstalled, not downloading them)…")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "--break-system-packages", "-q", "playwright"])
    from playwright.sync_api import sync_playwright


PROBE_JS = r"""
() => {
  const de = document.documentElement;
  const vw = window.innerWidth;
  const offenders = [];
  if (de.scrollWidth > vw) {
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.width && (r.right > vw + 1 || r.left < -1)) {
        const cs = getComputedStyle(el);
        if (cs.position === 'fixed') continue;
        offenders.push({
          el: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') +
              (el.classList.length ? '.' + [...el.classList].join('.') : ''),
          left: Math.round(r.left), right: Math.round(r.right)
        });
        if (offenders.length >= 8) break;
      }
    }
  }
  const ff = sel => { const e = document.querySelector(sel); return e ? getComputedStyle(e).fontFamily : null; };
  // document.fonts.check() is true when NO face is registered, so look for a loaded face instead.
  const faces = document.fonts ? [...document.fonts] : [];
  const loaded = fam => faces.some(f => f.family.replace(/["']/g, '') === fam && f.status === 'loaded');
  const fontsLoaded = document.fonts ? {
    Unbounded: loaded('Unbounded'), Manrope: loaded('Manrope'),
    facesRegistered: faces.length, status: document.fonts.status
  } : null;
  const rendered = [...document.querySelectorAll('[data-render]')].map(c => ({
    key: c.getAttribute('data-render'),
    rendered: c.getAttribute('data-rendered') === 'true',
    items: [...c.children].filter(x => x.tagName !== 'TEMPLATE').length
  }));
  const cd = document.querySelector('[data-countdown]');
  return {
    scrollWidth: de.scrollWidth, innerWidth: vw, overflow: de.scrollWidth > vw,
    offenders, pageHeight: de.scrollHeight,
    fontFamily: { h1: ff('h1'), body: ff('body') }, fontsLoaded,
    jsReady: de.getAttribute('data-js') === 'ready',
    rendered,
    pendingLinks: document.querySelectorAll('a.is-pending').length,
    countdown: cd ? { state: cd.getAttribute('data-state'),
      d: (cd.querySelector('[data-cd="d"]') || {}).textContent || null } : null,
    title: document.title,
    unresolvedTokens: (document.body.innerText.match(/\{[\w.]+\}/g) || []),
    hiddenPendingLinks: document.querySelectorAll('a.is-pending[hidden]').length
  };
}
"""


def find_chromium() -> str | None:
    for pattern in ("/opt/pw-browsers/chromium",
                    "/opt/pw-browsers/chromium-*/chrome-linux/chrome",
                    "/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell"):
        hits = sorted(glob.glob(pattern))
        if hits:
            return hits[-1]
    return None


def launch(p):
    try:
        return p.chromium.launch()
    except Exception as first:
        exe = find_chromium()
        if not exe:
            raise first
        return p.chromium.launch(executable_path=exe)


FONT_DIR = Path(__file__).parent / ".fonts" / "node_modules" / "@fontsource-variable"


def route_fonts(ctx) -> None:
    """Sandbox only: Google Fonts is blocked here, so serve the same faces from local npm copies."""
    u = FONT_DIR / "unbounded" / "files" / "unbounded-latin-wght-normal.woff2"
    m = FONT_DIR / "manrope" / "files" / "manrope-latin-wght-normal.woff2"
    if not (u.is_file() and m.is_file()):
        return
    css = ("@font-face{font-family:'Unbounded';font-weight:200 900;font-display:swap;src:url(https://local.fonts/u.woff2) format('woff2')}"
           "@font-face{font-family:'Manrope';font-weight:200 800;font-display:swap;src:url(https://local.fonts/m.woff2) format('woff2')}")
    ctx.route("https://fonts.googleapis.com/**", lambda r: r.fulfill(status=200, content_type="text/css", body=css,
              headers={"access-control-allow-origin": "*"}))
    ctx.route("https://fonts.gstatic.com/**", lambda r: r.abort())
    ctx.route("https://local.fonts/u.woff2", lambda r: r.fulfill(status=200, content_type="font/woff2", body=u.read_bytes(),
              headers={"access-control-allow-origin": "*"}))
    ctx.route("https://local.fonts/m.woff2", lambda r: r.fulfill(status=200, content_type="font/woff2", body=m.read_bytes(),
              headers={"access-control-allow-origin": "*"}))


def check_site(browser) -> dict:
    """Serve dist/site/ (the deploy folder) over HTTP and load it once: no console errors,
    every asset/font request succeeds, and note any third-party requests."""
    import http.server
    import socketserver
    import threading
    from functools import partial
    site = ROOT / "dist" / "site"
    if not (site / "index.html").is_file():
        return {"ok": None, "note": "dist/site/index.html not found"}
    handler = partial(http.server.SimpleHTTPRequestHandler, directory=str(site))
    handler.log_message = lambda *a, **k: None
    with socketserver.TCPServer(("127.0.0.1", 0), handler) as httpd:
        port = httpd.server_address[1]
        threading.Thread(target=httpd.serve_forever, daemon=True).start()
        ctx = browser.new_context(viewport={"width": 1280, "height": HEIGHT})
        route_fonts(ctx)                     # only matters if dist/site still uses Google Fonts
        page = ctx.new_page()
        errors, failed, external = [], [], []
        base = f"http://127.0.0.1:{port}/"
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
        page.on("requestfailed", lambda r: failed.append(r.url[:120]))
        page.on("response", lambda r: failed.append(f"{r.status} {r.url[:120]}") if r.status >= 400 else None)
        page.on("request", lambda r: external.append(r.url[:80]) if not r.url.startswith((base, "data:")) else None)
        try:
            page.goto(base, wait_until="load", timeout=20000)
            page.evaluate("document.fonts && document.fonts.ready")
            page.wait_for_timeout(800)
        except Exception as e:
            errors.append(f"goto: {e}")
        ctx.close()
        httpd.shutdown()
    return {"ok": not errors and not failed, "consoleErrors": errors, "failedRequests": failed,
            "thirdPartyRequests": sorted(set(external))}


def main() -> int:
    if not PAGE.is_file():
        print(f"{PAGE} not found — run python3 build.py first")
        return 1
    SHOTS.mkdir(parents=True, exist_ok=True)
    url = PAGE.resolve().as_uri()
    report = {"page": str(PAGE), "runs": []}

    with sync_playwright() as p:
        browser = launch(p)
        for scheme in ("light", "dark"):
            for w in WIDTHS:
                ctx = browser.new_context(viewport={"width": w, "height": HEIGHT},
                                          color_scheme=scheme, device_scale_factor=1)
                route_fonts(ctx)
                page = ctx.new_page()
                errors: list[str] = []
                page.on("console", lambda m, errors=errors: errors.append(m.text) if m.type == "error" else None)
                page.on("pageerror", lambda e, errors=errors: errors.append(f"pageerror: {e}"))
                failed: list[str] = []
                page.on("requestfailed", lambda r, failed=failed: failed.append(r.url[:120]))
                try:
                    page.goto(url, wait_until="load", timeout=20000)
                except Exception as e:  # fonts may hang offline; continue with what loaded
                    errors.append(f"goto: {e}")
                try:
                    page.evaluate("document.fonts && document.fonts.ready")
                except Exception:
                    pass
                page.wait_for_timeout(1500)  # let the hero load animation settle
                info = page.evaluate(PROBE_JS)
                name = f"{w}.png" if scheme == "light" else f"{w}-dark.png"
                shot = SHOTS / name
                page.screenshot(path=str(shot), full_page=True)
                report["runs"].append({
                    "width": w, "scheme": scheme, "screenshot": str(shot.relative_to(ROOT)),
                    "consoleErrors": errors, "failedRequests": failed, **info,
                })
                ctx.close()
        report["site"] = check_site(browser)
        browser.close()

    report["summary"] = {
        "anyOverflow": any(r["overflow"] for r in report["runs"]),
        "anyConsoleErrors": any(r["consoleErrors"] for r in report["runs"]) or bool(report["site"].get("consoleErrors")),
        "fontsLoaded": report["runs"][0].get("fontsLoaded") if report["runs"] else None,
        "siteFolderOk": report["site"].get("ok"),
    }
    text = json.dumps(report, indent=2, ensure_ascii=False)
    (SHOTS / "report.json").write_text(text, encoding="utf-8")
    print(text)
    return 0


if __name__ == "__main__":
    sys.exit(main())
