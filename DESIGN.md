> **Polarity: dark-mode only.** This system has a single polarity — a calm, low-glare night surface. There is no light theme and no `prefers-color-scheme` switch; every token below resolves to its dark value always. This resolves the prior AGENTS.md ↔ DESIGN.md polarity question in favour of dark mode.

## Overview

Notion-after-dark looks like a well-organized desk under a warm desk lamp. The dominant surface is not pure black but a soft, near-black charcoal — `{colors.canvas-soft}` (#191919) — that takes the harsh edge off an OLED black and makes long pages feel like a document rather than a void. Type is set in `NotionInter` (a tuned Inter) in near-white `{colors.ink}` at large, tightly-tracked weights, so headlines read as confident statements with very little letter-spacing slack at display sizes (`{typography.display-1}` pulls −2.125px of tracking at 64px). The whole system whispers in greys and off-whites, then says exactly one thing in colour: a single, dependable blue, `{colors.primary}` (#2383e2) — brightened from its daylight value so it holds contrast on the dark ground — reserved almost entirely for the primary call-to-action and inline links.

Against that quiet chrome, Notion lets a **playful multi-colour sticker palette** carry all of the brand's personality — purple, pink, orange, teal, green and sky-blue appear as small illustrated blocks, app-icon stickers, and category dots scattered through the marketing pages, where their saturation pops cleanly against the dark. These colours never structure the layout or paint a CTA; they decorate. The discipline is deliberate: the interface stays monochrome-plus-blue so the content (and the cheerful illustrations) can breathe. The one special moment in the otherwise neutral-dark document is the homepage hero, which deepens into a saturated indigo "deep night" band (`{colors.secondary}`) with white type and glowing sticker constellations — a single colour-saturated island standing out from the neutral near-black around it.

Surfaces are defined by hairlines and tint-lift rather than heavy elevation. Raised surfaces read as raised because they are *lighter* than the canvas (#252525 cards on a #191919 page), not because they cast a hard shadow. Cards round at a friendly 12px (`{rounded.lg}`), the marketing CTAs are fully-pill-shaped (`{rounded.full}`), and utility buttons round at a tighter 8px (`{rounded.md}`). Nothing is loud; the brand's character comes from restraint plus one well-placed splash of joy.

**Key Characteristics:**
- Soft near-black canvas `{colors.canvas-soft}` (#191919) over pure black, never an OLED void
- Near-white `{colors.ink}` `NotionInter` type with tight negative tracking at display sizes (`{typography.display-1}`)
- Exactly one structural accent — brightened Notion blue `{colors.primary}` (#2383e2) — reserved for CTAs and links
- A decorative-only multi-colour sticker palette (`{colors.accent-purple}`, `{colors.accent-pink}`, `{colors.accent-orange}`, `{colors.accent-teal}`, `{colors.accent-green}`, `{colors.accent-sky}`) that adds personality without ever painting structure
- Pill-shaped marketing CTAs (`{rounded.full}`) contrasted with 8px utility buttons (`{rounded.md}`)
- Elevation by tint-lift (lighter surface) + hairline + barely-there layered shadow, not heavy drop-shadows
- A single saturated indigo hero "deep night" band (`{colors.secondary}`) as the one colour-island in the neutral-dark page rhythm

## Colors

> Source pages analysed: the Notion home page plus Pricing, Enterprise, Product (AI), Product (Agents), and Startups, mapped to a single dark polarity. Every secondary page resolved to the same core palette — Notion runs one tightly-scoped system across the marketing site.

### Brand & Accent
- **Notion Blue** (`{colors.primary}` — #2383e2): the single structural accent, brightened from the daylight #0075de to hold contrast on dark. Primary CTA fill ("Get Notion free"), inline link colour, active-tab and focus signal. This is the only colour that ever paints an action.
- **Pressed Blue** (`{colors.primary-active}` — #1a6fc0): the darker press state of the primary CTA.
- **Deep Indigo** (`{colors.secondary}` — #213183): the saturated hero "deep night" band background and its sticker-constellation field; a deep brand-blue used for full-bleed colour-saturated sections that stand out from the neutral canvas.
- **On Primary** (`{colors.on-primary}` — #ffffff): text/glyph colour on the blue CTA and on the indigo hero band.

The remaining colours form Notion's **decorative sticker palette** — they appear only as illustrated blocks, app stickers and category dots, never as CTAs or structural fills. Their saturated hues read cleanly against the dark canvas:
- **Sticker Sky** (`{colors.accent-sky}` — #62aef0)
- **Sticker Purple** (`{colors.accent-purple}` — #d6b6f6) / **Deep Purple** (`{colors.accent-purple-deep}` — #391c57)
- **Sticker Pink** (`{colors.accent-pink}` — #ff64c8)
- **Sticker Orange** (`{colors.accent-orange}` — #dd5b00) / **Deep Orange** (`{colors.accent-orange-deep}` — #793400)
- **Sticker Teal** (`{colors.accent-teal}` — #2a9d99)
- **Sticker Green** (`{colors.accent-green}` — #1aae39)
- **Sticker Brown** (`{colors.accent-brown}` — #523410)

> The "deep" sticker variants (`{colors.accent-purple-deep}`, `{colors.accent-orange-deep}`) are reserved for the rare light-tile-on-dark illustration where a dark sticker fill carries light type — they are too dark to sit directly on the canvas.

### Surface
- **Raised Charcoal** (`{colors.canvas}` / `{colors.surface}` — #252525): card and panel surfaces, nav bar, form fields — a step *lighter* than the page so figure lifts off ground without a shadow.
- **Soft Black** (`{colors.canvas-soft}` — #191919): the signature page canvas and the footer band — a soft near-black that gives the whole site its document-like calm while avoiding pure-black glare.
- **Hairline** (`{colors.hairline}` — #373737): 1px card borders and dividers, a white-at-~9%-on-near-black blend kept solid for token reuse.

### Text
- **Ink** (`{colors.ink}` — #ffffff): primary headings and body text (rendered at ~90% alpha for a soft off-white rather than a harsh pure white).
- **Warm Silver** (`{colors.ink-secondary}` — #d4d4d2): secondary body copy and footer text.
- **Stone** (`{colors.ink-muted}` — #9b9893): supporting / muted copy.
- **Ash** (`{colors.ink-faint}` — #6f6c67): captions, metadata, placeholder text.

### Semantic
Notion's marketing surfaces do not expose a dedicated error/success palette in the system chrome — status is carried by the sticker palette (e.g. `{colors.accent-green}` for affirmative ticks) rather than a separate semantic ramp. On dark, prefer the brighter sticker hues for status glyphs so they stay legible against the canvas.

## Typography

> Typography is polarity-independent: the family, scale, weights and tracking are unchanged from the daylight system — only the ink colour it renders in flips to near-white.

### Font Family
The entire system is set in **`NotionInter`** — Notion's tuned cut of Inter — with a fallback stack of `Inter, -apple-system, system-ui, "Segoe UI", Helvetica, Arial`. A single family carries everything from 64px display headlines to 12px eyebrows; there is no serif, no monospace display face. OpenType `lnum` (lining numerals) and `locl` features are enabled on body and heading roles.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display-1}` | 64px | 700 | 1.0 | −2.125px | Hero headline ("Meet the night shift") |
| `{typography.display-2}` | 54px | 700 | 1.04 | −1.875px | Large section headlines |
| `{typography.heading-1}` | 40px | 700 | 1.1 | −1px | Section headlines ("Plans and features") |
| `{typography.heading-2}` | 26px | 700 | 1.23 | −0.625px | Sub-section headings |
| `{typography.heading-3}` | 22px | 700 | 1.27 | −0.25px | Card titles |
| `{typography.title}` | 20px | 600 | 1.4 | −0.125px | Feature titles, callouts |
| `{typography.body-md}` | 16px | 400 | 1.5 | 0 | Default body copy |
| `{typography.body-sm}` | 15px | 400 | 1.33 | 0 | Dense body, table rows, nav |
| `{typography.button}` | 16px | 500 | 1.5 | 0 | Button labels |
| `{typography.caption}` | 14px | 400 | 1.43 | 0 | Captions, footnotes |
| `{typography.eyebrow}` | 12px | 600 | 1.33 | +0.125px | Pill badges, small labels |

### Principles
Notion's type voice is **tight, heavy, and quiet-confident**. Headlines lean on weight 700 and aggressive negative tracking (more negative the larger the size) so display copy feels set, not stretched. Body copy stays at a comfortable 1.5 line-height for document readability. The contrast between a heavy 700 headline and a calm 400 body is the primary expressive lever — there is no decorative typography, only a clear hierarchy. On dark, render `{colors.ink}` at ~90% alpha rather than pure white to soften halation on heavy display weights.

### Note on Font Substitutes
`NotionInter` is a proprietary tuning of the open-source **Inter** family — substitute Inter directly. To approximate Notion's display tightness, apply the negative letter-spacing values in the table above explicitly (Inter at default tracking will read looser than `NotionInter`).

## Layout

> Spacing, grid, and responsive behaviour are polarity-independent and unchanged; only the canvas/surface colours referenced below flip to dark.

### Spacing System
- **Base unit**: 8px.
- **Tokens (front matter)**: `{spacing.xxs}` 4px · `{spacing.xs}` 8px · `{spacing.sm}` 12px · `{spacing.md}` 16px · `{spacing.lg}` 24px · `{spacing.xl}` 28px · `{spacing.xxl}` 32px.
- Card interior padding lands around `{spacing.lg}` (24px); utility buttons use a tight 4px/14px; form fields pad at `{spacing.xxs}`-scale 6px. Section gaps stack the larger steps.

### Grid & Container
Content is centred in a wide max-width column (~1080–1300px on desktop per the extracted breakpoints) with generous outer gutters. Feature sections alternate between full-width text blocks and 2-up / 3-up card grids; the pricing page widens to a 4-column plan table. The indigo hero spans full-bleed edge to edge while body sections respect the centred container.

### Whitespace Philosophy
Whitespace is the primary grouping device. Sections are separated by large vertical gaps rather than rules, and cards sit on the soft-black canvas with quiet hairlines and a gentle tint-lift instead of heavy frames. The effect is document-like: airy, scannable, and never crowded.

### Responsive Strategy

#### Breakpoints
| Name | Width | Key Changes |
|---|---|---|
| Wide | 1440px+ | Full multi-column grids, widest container |
| Desktop | 1080–1300px | Standard centred container, 3-up card grids |
| Tablet | 768–840px | Grids collapse to 2-up, nav begins condensing |
| Mobile | ≤600px | Single-column stacks, hamburger nav, full-width CTAs |

#### Touch Targets
Pill CTAs (`button-primary`, `button-secondary`) and utility buttons (`button-utility`) carry comfortable tap padding; aim for a 44×44px minimum hit area on mobile by preserving vertical padding even as labels shrink.

#### Collapsing Strategy
The top nav condenses to a hamburger below the tablet breakpoint; multi-column card grids collapse to a single stacked column; the pricing plan table reflows from 4 side-by-side columns into stacked plan cards. Section padding tightens but the soft-black canvas rhythm is preserved.

#### Image Behavior
Product screenshots and illustration tiles sit inside rounded `{rounded.lg}` frames and scale fluidly within their grid cell. Sticker illustrations are small fixed-scale decorative assets that re-flow but do not crop.

## Elevation & Depth

> In dark mode, elevation is conveyed primarily by **surface tint** — a raised surface is lighter than the canvas — with shadow as a faint secondary cue. This inverts the daylight system, where shadow did the lifting on a uniformly white surface.

| Level | Treatment | Use |
|---|---|---|
| 0 — Flat | Canvas `{colors.canvas-soft}` (#191919), hairline border `{colors.hairline}`, no shadow | Default cards sit at canvas level, separated by hairline only |
| 1 — Soft | Surface tint-lift to `{colors.surface}` (#252525) + layered micro-shadow: `rgba(0,0,0,0.2) 0 0.175px 1.041px`, `0.24 0 0.8px 2.925px`, `0.28 0 2.025px 7.847px`, `0.32 0 4px 18px` | Raised feature cards, floating buttons |
| 2 — Elevated | Lighter tint still (~#2d2d2d) + deeper 5-stop stack ending in `rgba(0,0,0,0.45) 0 23px 52px` | Modals, popovers, the elevated pill on the indigo hero |

Notion's dark elevation philosophy is **lift by light, not by shadow**: a raised surface announces itself by being a step brighter than the page, with many near-transparent dark shadow layers adding only the faintest grounding. Most cards rely on tint + hairline alone.

### Decorative Depth
The brand's real depth cue is **illustration**, not shadow. The indigo hero (`{colors.secondary}`) uses glowing stickers and a starfield to create a sense of a lit night scene, and feature sections layer small colourful app-icon stickers over plain dark surfaces to add playful dimensionality. Colour-blocked illustration tiles (purple, pink, orange, teal headers on otherwise-dark cards) provide visual rhythm and pop harder against the dark than they did on white.

## Shapes

> Radius is polarity-independent and unchanged.

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.xs}` | 4px | Form fields, small tags, inline chips |
| `{rounded.sm}` | 5px | Menu items, list rows, status pills |
| `{rounded.md}` | 8px | Utility / nav buttons, smaller cards |
| `{rounded.lg}` | 12px | Feature cards, illustration frames, content tiles |
| `{rounded.xl}` | 16px | Large containers, image wells |
| `{rounded.full}` | 9999px | Marketing pill CTAs, badges, circular icon buttons |

### Photography Geometry
Product screenshots are framed in rounded `{rounded.lg}` / `{rounded.xl}` wells, typically full-bleed within their container with a hairline edge. Illustration tiles use colour-blocked header bands above dark card bodies. Avatars and app-icon stickers are small, sometimes fully circular (`{rounded.full}`). There is no heavy art-direction crop — images scale within their rounded frame.

## Components

> **No hover states documented.** Every spec below documents Default and Active/Pressed states only. Variants live as separate `components:` front-matter entries and are described in their own sub-blocks. All surface/text colours below resolve to their dark values.

### Navigation

**`nav-bar`** — Top navigation
- Surface `{colors.surface}` (#252525), `{colors.ink}` link text at `{typography.body-sm}`, padding `{spacing.md}`. Sits as a slim sticky bar; left wordmark, centre product/solutions menu links, right "Log in" text link plus a `button-utility` "Get Notion free" CTA. Condenses to a hamburger below the tablet breakpoint.

### Buttons

**`button-primary`** — Primary CTA ("Get Notion free")
- Background `{colors.primary}`, text `{colors.on-primary}`, type `{typography.button}`, fully pill-shaped `{rounded.full}`. The single blue action on any page.
- Pressed state lives in `button-primary-pressed` (background `{colors.primary-active}`); marketing buttons also apply a brief `scale(0.9)` press transform.

**`button-primary-pressed`**
- Background `{colors.primary-active}`, text `{colors.on-primary}` — the depressed state of the primary CTA.

**`button-secondary`** — Secondary CTA ("Request a demo")
- Surface `{colors.surface}`, text `{colors.ink}`, type `{typography.button}`, pill `{rounded.full}`, carried by the soft Level-1 tint-lift + shadow. Pairs beside `button-primary` in the hero.

**`button-utility`** — Nav / plan-select button
- Surface `{colors.surface}`, text `{colors.ink}`, type `{typography.button}`, tighter `{rounded.md}` (8px), padding `4px 14px`, 1px `{colors.hairline}` border. Used for the nav CTA and pricing plan-select buttons where the marketing pill would be too large.

**`button-icon-circular`** — Carousel / media control
- Circular `{rounded.full}` control with a translucent `rgba(255,255,255,0.08)` fill and `{colors.on-primary}` glyph, used for slide and play/pause controls; applies a `scale(0.9)` press transform.

### Cards & Containers

**`feature-card`** — Content / feature card
- Surface `{colors.surface}` (#252525), `{colors.ink}` text, `{typography.body-md}`, rounded `{rounded.lg}` (12px), padding `{spacing.lg}` (24px). The workhorse marketing card; often topped by a colour-blocked illustration band from the sticker palette. Default elevation lifts off the canvas by tint + hairline (flat shadow).

**`feature-card-elevated`** — Raised feature card
- Same chrome as `feature-card` with the soft Level-1 layered shadow for cards that float above the canvas (testimonials, floating product panels).

**`pricing-plan-card`** — Pricing plan column
- Surface `{colors.surface}`, `{colors.ink}` text, `{typography.body-sm}`, rounded `{rounded.md}` (8px), padding `{spacing.lg}`. A bordered column listing a plan's price and feature checklist, with a `button-utility` select action.

**`pricing-plan-card-featured`** — Highlighted plan column
- Lighter ~#2d2d2d tint to lift the recommended tier off the #252525 siblings, same `{rounded.md}` shape and padding. Distinguished by surface tint rather than a coloured border.

### Inputs & Forms

**`text-input`** — Text / number field
- Surface `{colors.surface}`, `{colors.ink}` text, `{typography.body-sm}`, 1px `{colors.hairline}` (#373737) border, rounded `{rounded.xs}` (4px), padding `6px`. Square-ish corners deliberately tighter than the pill CTAs. Placeholder in `{colors.ink-faint}`. Focus adds a `{colors.primary}` 1px ring plus the soft Level-1 shadow.

### Signature Components

**`hero-band`** — Indigo "deep night" hero
- Full-bleed saturated indigo `{colors.secondary}` band carrying `{typography.display-1}` white headline, sticker-constellation field, and a `button-primary` + `button-secondary` CTA pair. The single colour-saturated island in an otherwise neutral-dark page.

**`badge-pill`** — Eyebrow / category pill
- Surface `{colors.surface}`, `{colors.primary}` text, `{typography.eyebrow}` (12px / 600), fully pill `{rounded.full}`, padding `4px 8px`. Small labels such as the pricing "Essential for staying organized" eyebrow and category tags.

**`footer`** — Site footer
- Soft-black `{colors.canvas-soft}` band, `{colors.ink-secondary}` link text at `{typography.caption}`, padding `{spacing.xxl}`. Multi-column link directory closing every page.

### Examples (illustrative)

> Kit-mirror demonstration surfaces. Each `ex-*` entry references brand-native primitives so downstream consumers (`/preview-design`, `/generate-kit`) re-skin the same 10 surfaces consistently.

**`ex-pricing-tier`** — Default Pricing tier card. Re-uses feature-card chrome on the raised `{colors.surface}` tint.
- Properties: `backgroundColor`, `textColor`, `borderColor`, `rounded`, `padding`

**`ex-pricing-tier-featured`** — Featured/highlighted tier — polarity-flipped surface (lighter tint + brighter type to lift it off its dark siblings).
- Properties: `backgroundColor`, `textColor`, `rounded`, `padding`

**`ex-product-selector`** — What's Included summary card — re-purposed for SaaS / B2B verticals (NOT a literal product gallery).
- Properties: `backgroundColor`, `rounded`, `padding`

**`ex-cart-drawer`** — Subscription summary — re-purposed for SaaS / B2B (line items per add-on, not literal cart).
- Properties: `backgroundColor`, `rounded`, `padding`, `item-divider`

**`ex-app-shell-row`** — Sidebar nav row inside the App Shell example. Active state uses brand primary as the indicator.
- Properties: `backgroundColor`, `activeIndicator`, `rounded`, `padding`

**`ex-data-table-cell`** — Default data-table th + td chrome. Header uses mono-caps eyebrow typography; body uses body-sm.
- Properties: `headerBackground`, `headerTypography`, `bodyTypography`, `cellPadding`, `rowBorder`

**`ex-auth-form-card`** — Sign-in / sign-up card. Re-uses feature-card chrome with text-input primitives inside.
- Properties: `backgroundColor`, `rounded`, `padding`

**`ex-modal-card`** — Modal dialog surface — same chrome as feature-card with elevated shadow + lighter Level-2 tint.
- Properties: `backgroundColor`, `rounded`, `padding`

**`ex-empty-state-card`** — Empty-state illustration frame.
- Properties: `backgroundColor`, `rounded`, `padding`, `captionTypography`

**`ex-toast`** — Toast notification surface — feature-card shape + medium shadow on a Level-2 tint.
- Properties: `backgroundColor`, `rounded`, `padding`, `typography`


## Do's and Don'ts

### Do
- Reserve `{colors.primary}` for the primary action, inline links, and the active/focus signal — nothing decorative.
- Keep the page on the soft-black `{colors.canvas-soft}` (#191919) canvas; use the lighter `{colors.surface}` (#252525) for cards and fields to create gentle figure/ground by tint.
- Let the sticker palette (`{colors.accent-pink}`, `{colors.accent-teal}`, `{colors.accent-orange}`, …) live only in illustrations, icon tiles and category dots — their saturation is meant to pop against the dark.
- Set headlines in heavy `{typography.display-1}`/`{typography.heading-1}` with their negative tracking applied explicitly, rendered at ~90% alpha to soften halation.
- Use pill `{rounded.full}` for marketing CTAs and tighter `{rounded.md}` for nav/utility buttons — the contrast is intentional.
- Lift surfaces with a brighter tint first, then `{colors.hairline}` and the barely-there Level-1 shadow.
- Reserve the saturated indigo `{colors.secondary}` "deep night" treatment for a single hero moment, not repeated bands.

### Don't
- Don't paint a CTA or structural fill in any sticker-palette colour — those are decoration only.
- Don't introduce a second structural accent alongside `{colors.primary}`.
- Don't put pill `{rounded.full}` radii on form fields — inputs stay tight at `{rounded.xs}` (4px).
- Don't drop heavy shadows; dark-mode elevation is tint-lift plus many near-transparent layers, never a hard cast.
- Don't set body copy in a heavy weight — keep 400 for readability and let weight 700 belong to headlines.
- Don't place type on pure black (#000000) for full pages; the soft near-black `{colors.canvas-soft}` (#191919) is core to the brand calm and avoids OLED glare.
- Don't render `{colors.ink}` as harsh pure white on large display weights — use the ~90%-alpha off-white to cut halation.
