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

- `index.html` - the whole site (single page, responsive from 380px to 1440px and up).
  `styles.css` - shared stylesheet, all tokens. The mark is defined once as an SVG
  `<symbol id="mark">` at the top of the body and reused in the nav, About, and footer.
- `js/workshop-3d.js` - the `<three-d-stage>` element for the workshop models.
  `index.html` imports it only when the workshop section nears the screen. It loads
  three.js 0.184.0 from unpkg through the import map in `<head>` (pinned, with SRI hashes).
  `js/obj-model.js` reads OBJ + MTL; `js/cajon-model.js` and `js/saw-model.js` hold
  each object's materials. Viewer rules: no wheel zoom, no pan, drag to turn on a mouse
  only, touch screens never capture the finger (the page always scrolls), turntable off
  under prefers-reduced-motion, rendering paused while off screen.
- `assets/models/` - `be-better-cajon.obj/.mtl`, `bucksaw-open.obj`, `bucksaw.mtl`.
  The folded and stowed saw states and the fold animation stayed in the Claude Design
  handoff and are not shipped.
- `assets/icons/` - app icons at 96px (shown at 48px).
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
3. **AI is how we work, never a slogan.** Name AI wherever it is true and say what it
   did in concrete terms, the way a carpenter talks about a table saw. Never use it as a
   label, a badge, a tagline, or a selling adjective, and never as a visual theme
   (no circuits, sparkles, robots, or brains). Never write "AI-powered". The Doctrine's
   refrain cuts both ways: we will not pretend the tools are magic, and we will not
   pretend we do not use them.
4. **Every claim must be literally true today.** The hero states the record (only
   shipped, verifiable things). Services state promises, and every promise must point
   at evidence on the page. Nothing is claimed that has not been done: no invented
   clients, metrics, or team. When reality changes, claims may grow; they are never
   inflated first.
5. Voice is "we" (Clay's choice). Do not describe the studio as one person.
6. **Career background is not a studio service.** Clay's training and Nokia experience
   lives in About. The page does not offer AI training or courses (see Parked).

## Brand

- Name: arbor + linea, the tree line. Tagline: "Ideas above the treeline". The treeline
  means perspective: when you can't see the forest for the trees, get above them.
- Headline: "The idea was never the barrier. Finishing is." - mirrors the (parked) Services turn
  "Having the idea was never the problem. Making it real is." "Finishing is." carries
  the ice-to-timber gradient (`.grad`), software fading into the workshop. Keep it.
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
  timber #D2A878/#A97F4F. Ice marks software, timber marks the workshop.
  Fonts: Space Grotesk (headings), Public Sans (body), Spline Sans Mono (labels/pills).
  Cards 16px radius, hairline border, 3px hover lift. Wordmark is lowercase "arbolinea".
- The page structure came from a Claude Design redesign (September 2026): Hero, Apps,
  Workshop, How we work, Doctrine, About, Contact. Services is parked (see Parked).
  Nav: Apps, Workshop, How we work, About.

## Hard requirements (regressions that already happened once)

1. Every surface declares its own solid background (html, body, main, every section,
   footer) plus `<meta name="color-scheme" content="dark">` - iOS in-app browsers
   render white otherwise.
2. WCAG AA contrast against the actual background. Verify at 380px width: nav stays
   one row, no horizontal overflow.
3. prefers-reduced-motion respected; visible :focus-visible on all interactive elements.
4. Static output only - no build step.
5. Every link must work: store links go straight to each store's PLUed listing, not a
   redirect page; new-tab links carry rel="noopener". Check every link before a push.

## Parked (in HTML comments, restore only when Clay says ready)

- Real photos in the Workshop cards - the 3D models stand in until photos exist. The
  cajon is designed but not yet cut; update its card (and "How we work" 03 and the
  Workshop intro) when it is built. The Elmore Buck Saw is built.
- No marketing campaign for the saw yet; do not claim one.
- Skills library link (nav and page) - `skills/index.html` stays a noindex stub.
- The whole Services section, parked 2026-09-14 before sharing the site on LinkedIn:
  there is no client work yet, so the page shows what is built rather than selling.
  Restoring it means three edits together: the Services section comment in index.html,
  a nav link, and a hero "Work with us" button (mailto support@ with a subject), plus
  contact copy that invites ideas. The "Set up AI for your work" card sits inside it
  and returns only when the templates/infrastructure to deliver it exist.
- Stripe's business description (client invoicing) does not match a site with no
  services; revisit before taking payments.
- Confirm the legal entity name in the footer (currently "Arbolinea LLC").
- Hand-drawn mark trace; then regenerate all assets from it.

## Archive

- The site before the September 2026 redesign is tagged `site-v1-2026-09-14`
  (`git show site-v1-2026-09-14:index.html`). It is not published at a public URL,
  because its copy carries claims that have since changed.

## Verification habit

After any edit: check locally (a static server on the folder), confirm no em dashes
crept in, no horizontal overflow at 380px, backgrounds still painted, every link
returns 200, and the two workshop models still render. Then show Clay
the wording, get the OK, push, and confirm the change is live on arbolinea.com.
