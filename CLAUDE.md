# Arbolinea site - working guide

Marketing site for arbolinea.com. Static flat files, no build step. This file is
the working context for maintaining it - read it fully before editing.

## Deploy

- Served by GitHub Pages from this repo (clayelmore/arbolinea-site), main branch, root.
- `git push origin main` = live at https://arbolinea.com in about a minute. A push IS publication.
- **Approval rule: show Clay the final wording of any user-visible change and get his
  explicit OK before pushing.** Local edits and commits are fine; the push waits.
- DNS and the Google Workspace mail records live at Network Solutions (registrar only).
  Never touch MX/TXT records - they are the mail for support@arbolinea.com.
- HTTPS: GitHub-managed Let's Encrypt, https_enforced on.

## Files

- `index.html` - the whole site (single page). `styles.css` - shared stylesheet, all tokens.
- `skills/index.html` - stub for a future free skills library; noindex, NOT in the nav
  until it has content.
- `assets/` - brand images served publicly: `og.png` (1200x630 link card, wired into the
  meta tags), `logo-300.png` (tight LinkedIn square), `logo-square.png` (800px, roomy),
  `banner.png` (1128x191 LinkedIn company cover, center-safe), `banner-profile.png`
  (1584x396 LinkedIn personal profile background).
- `assets-src/` - the HTML sources those PNGs are rendered from. To re-render after a
  design change, use headless Chrome:
  `chrome --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1
   --virtual-time-budget=8000 --window-size=WxH --screenshot=out.png file:///path/to/src.html`
  (window-size must match the source's fixed body size.)

## Copy rules (non-negotiable)

1. **No em dashes anywhere.** Plain hyphens only.
2. **Plain, speakable sentences.** Every line must survive being read aloud by a real
   person. No corporate filler ("unlock", "empower", "seamless", "elevate", "cutting-edge").
   No jargon the site's audience would not know (e.g. "native" became "apps you install
   from the App Store or Google Play").
3. **The word "AI" is rationed.** It appears only where it is load-bearing: the hero
   identity line, the Services pitch (buyer vocabulary), and the doctrine. Everywhere
   else, say what the tool did in concrete verbs ("designed by machine, built by hand").
   Never add decorative AI mentions. Never write "AI-powered".
4. **Every claim must be literally true today.** The hero states the record (only
   shipped, verifiable things). Services state promises, and every promise must point
   at evidence on the page. Nothing is claimed that has not been done: no invented
   clients, metrics, or team. When reality changes, claims may grow; they are never
   inflated first.
5. Voice is "we" (Clay's choice), reconciled honestly in About, which names the studio
   as one person.

## Brand

- Name: arbor + linea, the tree line. Tagline: "Ideas above the treeline". The treeline
  means perspective: when you can't see the forest for the trees, get above them.
- Headline: "The idea was never the barrier. Finishing is." - mirrors the Services turn
  "Having the idea was never the problem. Making it real is."
- Doctrine panel (three tenets: On the tool / On the market / On platforms) is the
  worldview. Its refrain is "we will not pretend". Edit it only with Clay, line by line.
- Mark: treeline in ice, frond-fan crown above, mirrored roots (50% opacity) below.
  Inline SVG with currentColor; the same mark is in the nav, favicon (simplified),
  and all assets. It is a placeholder for a hand-drawn pencil original to be traced
  to SVG later - swap points are commented in the HTML. Never replace it with a
  generic tree icon.
- Hero background: Front Range ridgeline from Boulder's perspective; the flat-topped
  high point is Longs Peak. The same ridgeline appears in og.png and the banners.
- Tokens (all in styles.css): bg #0E1411, alt #131A16, panel #182019, hairline #26302A;
  text #EFF3EE / #DDE4DE / muted #B8C2BA (never darker on dark bg); ice #8FC6E8/#4E86AC;
  timber #D2A878/#A97F4F. Fonts: Space Grotesk (headings), Public Sans (body),
  Spline Sans Mono (labels/pills). Cards 16px radius, hairline border, hover lift.

## Hard requirements (regressions that already happened once)

1. Every surface declares its own solid background (html, body, main, every section,
   footer) plus `<meta name="color-scheme" content="dark">` - iOS in-app browsers
   render white otherwise.
2. WCAG AA contrast against the actual background. Verify at 380px width: nav stays
   one row, no horizontal overflow.
3. prefers-reduced-motion respected; visible :focus-visible on all interactive elements.
4. Static output only - no build step.

## Parked (in HTML comments, restore only when Clay says ready)

- Woodworking section + its nav links (here and in skills/index.html) - returns
  photo-led when real photography of the cajon and bow saw exists.
- "Set up AI for your work" service card (0X in the Services grid) - returns when the
  templates/infrastructure to deliver it exist.
- Confirm the legal entity name in the footer (currently "Arbolinea LLC").
- Hand-drawn mark trace; then regenerate all assets from it.

## Verification habit

After any edit: check locally (a static server on the folder), confirm no em dashes
crept in, no horizontal overflow at 380px, backgrounds still painted. Then show Clay
the wording, get the OK, push, and confirm the change is live on arbolinea.com.
