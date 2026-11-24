# Building a homepage section

Every section of the Adamson homepage is one **WordPress block** whose content
is edited in WordPress and rendered by **one React component** in Next.js.
Nothing visible is hard-coded except layout, styling, decorative graphics and
behaviour. A section is four files:

| File | What it is |
|---|---|
| `wordpress/plugin/adamson-headless/contract/blocks/NN-slug.json` | The block contract: the fields editors fill in. `NN` = the section number (02, 03…). |
| `web/components/blocks/Name.tsx` | The React component. It already exists as a stub and is already in `registry.ts`: replace the stub, keep the file name and default export. |
| `wordpress/seed/content/NN-slug.json` | The design's content, so the seeded page matches Figma. |
| `wordpress/seed/assets/<slug>/…` | Content images from Figma (photos, product shots, logos that are content). |

Decorative graphics (glows, lines, map dots, masks, icons) are not content:
put them in `web/public/design/<slug>/` and reference them as `/design/<slug>/file.svg`.
Shared icons already in `web/public/icons/`: `chevron-down.svg`, `search.svg`,
`user.svg`, `arrow-left-dark-bg.svg`, `arrow-right-dark-bg.svg`,
`arrow-left-light-bg.svg`, `arrow-right-light-bg.svg`, `arrow-right-line.svg`.

## 1. Contract (`contract/blocks/NN-slug.json`)

```json
{
  "name": "adamson/hero",
  "title": "Hero",
  "description": "Opening section with headline, buttons and artist strip.",
  "icon": "cover-image",
  "fields": [
    { "key": "heading", "type": "textarea", "label": "Heading" },
    { "key": "background", "type": "image", "label": "Background image" },
    { "key": "primary", "type": "link", "label": "Primary button" },
    { "key": "artists", "type": "repeater", "label": "Artist strip", "itemName": "artist", "itemLabel": "name",
      "fields": [ { "key": "name", "type": "text", "label": "Name" } ] }
  ]
}
```

Field types: `text`, `textarea`, `url`, `number`, `toggle`, `select` (with
`options`: strings or `{label, value}`), `image`, `video`, `link` (`{label, url}`),
`group` (nested `fields`), `repeater` (nested `fields`, optional `itemName`,
`itemLabel`, `max`), `product` (pick one of the Products; stores its ID).

**Products** are their own records (WordPress → Products, fields in
`contract/product.json`): name, type, series, specs, studio render, cut-out,
logo, link, "Show in the Products section". A block that shows products stores
product IDs (`product` fields) or reads the whole list, and declares
`needs: ["products"]` in `registry.ts`; the component then gets them as
`extras.products` (type `Product`), on the page and in the editor preview.
Seed content refers to a product as `{ "seedProduct": "VGt" }`. Optional on any field: `help`, `default`.
`icon` is a Dashicon name (without `dashicons-`). The `name` must match the
entry in `web/components/blocks/registry.ts`.

Stored values: `image`/`video` → `{ id, url, alt, width, height, mime }` or null;
`link` → `{ label, url }`; `repeater` → array of objects; `group` → object.

## 2. Component (`web/components/blocks/Name.tsx`)

```tsx
import type { BlockProps, Media, Link } from "@/lib/types";
type Data = { heading: string; background: Media; primary: Link; artists: { name: string }[] };
export default function Hero({ data, preview }: BlockProps<Data>) { … }
```

- `data` is `Partial<Data>`: **every field can be empty**. Render nothing for an
  empty optional piece, never crash (`data.items ?? []`, `data.title && …`).
- `preview` is true inside the WordPress editor's live preview. There, skip
  scroll-driven or pinned animations and render the resting state.
- Components render both on the server (the page) and the client (the editor
  preview). Add `"use client"` only if the component uses hooks/state/effects
  (sliders, filters). Don't import anything from `@/lib/wp` (server-only).
- News-type data comes from `extras` (see `News` / `registry.ts` `needs`).

### Styling rules

- **Tailwind v4, tokens from `web/app/globals.css`.** Colours: `bg-page`, `bg-raised`,
  `text-gold`/`bg-gold`, `text-ink` (white), `text-muted`, `text-secondary`,
  `border-line`, `border-line-subtle`, `bg-action-secondary`. Radius: `rounded-sm/md/lg`
  (12/16/20px). Text styles: `type-h1…type-h6`, `type-body-l/m/s/xs`, `type-body-s-strong`,
  `type-quote`, `type-eyebrow`, `type-tag`, `type-button`, `type-counter`,
  `type-marquee`, `type-number-m/l/xl`, `type-wordmark`, `type-footer`.
  Use these instead of raw font sizes. Font is Outfit (already loaded).
- **Sizes in rem, never px** (except 1px borders and blur radii): the page
  scales with the viewport (1rem = 16 design px at 1680px). Use Tailwind's
  spacing scale (`p-6` = 24px, `gap-16` = 64px, `px-margin` = 68px page margin,
  `py-section` = 120px) or rem arbitrary values (`w-[28.3125rem]` for 453px).
  Divide Figma px by 16.
- Sections are full-bleed backgrounds with content inside `site-container`
  (max 1680px). Most content uses the 68px side margin: `px-margin`.
- Translate Figma's absolute positioning into flex/grid where it's really a
  row/column/grid. Keep absolute positioning only for overlapping artwork.
- Images: use `<Img media={data.image} className="…" />` (`@/components/ui/Img`).
  Plain `<img>` only for files in `/public`.
- Shared UI — reuse, don't rebuild:
  - `@/components/ui/Button` — `variant`: `primary` (gold), `secondary` (outline glass),
    `contrast` (white), `contrast-light` (black, for light sections), `secondary-light`; `size`: `s` | `m`; `link={data.button}`.
  - `@/components/ui/SectionHeader` (+ `Eyebrow`) — Figma "Section header": `layout` row/stacked/center,
    `size` h1/h2, `tone` dark/light, `action` slot.
  - `@/components/ui/SliderControls` (+ `SliderArrows`, `SliderCounter`) — Figma "Slider counter"/"Slider arrows".
  - `@/components/ui/ArrowLink` — Figma "Arrow link" (60px round arrow).
  - `@/components/motion/CountUp` — count-up numbers; `@/components/motion/Marquee` — endless row;
    `@/components/motion/gsap` — shared GSAP + ScrollTrigger (never import "gsap" directly).
- Interactions: build what the design implies (sliders work, filters filter,
  hovers exist). Respect `prefers-reduced-motion`.
- Desktop design only (1680px). Don't build a separate mobile layout.

## 3. Seed content (`wordpress/seed/content/NN-slug.json`)

```json
{ "block": "adamson/hero",
  "data": {
    "heading": "Adamson Systems Engineering: Professional Loudspeaker Systems",
    "background": { "seed": "hero/hero-background.png", "alt": "" },
    "artists": [ { "name": "Drake" }, { "name": "Lady Gaga" } ] } }
```

Any `{ "seed": "path/under/assets", "alt": "…" }` becomes a media-library item
when seeding. Use the exact text from Figma.

## 4. Figma

File key `Z9vjuAohqnHDLjOBc5ZQBb`, homepage frame `463:596` (1680 × 13553).
Use `get_design_context` on your section's node (and child nodes if a response
is sparse) to get exact values and asset URLs. Download every asset you use
with `curl -sSfL -o <path> <url>` (the URLs expire). Use `get_variable_defs`
only if you need a token that's missing above.

## 5. Check your work

From `web/`: `npx tsc --noEmit` and `npx eslint components/blocks/<Name>.tsx` must pass.
Don't run `next build`/`next dev` and don't touch files outside your sections
(other people are building other sections in parallel). If you need a shared
UI change, say so in your report instead of editing shared files.

## 6. Responsive (tablets and phones)

The Figma file is desktop-only (1680px). Rules:

- **1024px and up (`lg`) is the desktop design and must not change.** Every
  small-screen style goes in `max-lg:` classes (or `@media (width < 64rem)`).
  Above 1024px the page scales proportionally with the window, up to 2560px.
- **Below 1024px the root font is a fixed 16px** (so `1rem` = 16px, normal
  sizes), and these are already handled globally:
  - `type-h1…h6`, `type-number-*`, `type-wordmark`, `type-quote`, `type-counter`
    switch to smaller sizes automatically (see `app/globals.css`).
  - `px-margin` becomes 20px and `py-section` 72px.
  - `SectionHeader` row layout stacks (title, then description + action).
  - The header has a menu button and a full-screen menu.
- **What each section needs below `lg`:**
  - No horizontal page overflow at 375px wide. Test widths: 375, 430, 768, 1023.
  - Fixed desktop heights (`h-[62rem]` etc.) become `max-lg:h-auto` or a
    sensible `max-lg:min-h-[…]`, unless the section is a full-bleed slider that
    needs a fixed height (then pick a mobile height such as `max-lg:h-[44rem]`
    or `max-lg:h-[100svh]`).
  - Absolutely positioned desktop layouts become normal flow: stack text and
    media (`max-lg:static`, `max-lg:flex-col`, `max-lg:w-full`…). Keep absolute
    positioning only for overlapping artwork, resized for the small screen.
  - Rows of cards: a horizontal swipe row (`max-lg:overflow-x-auto
    max-lg:snap-x max-lg:snap-mandatory no-scrollbar`, cards `max-lg:w-[80vw]
    max-lg:shrink-0 snap-start`, row padding `max-lg:px-margin`) or a 1–2 column
    grid, whichever reads better.
  - Grids: `max-lg:grid-cols-1` (or 2 on tablets with `md:`).
  - Big decorative words/wordmarks: scale with the screen (`type-wordmark`
    already uses `23vw` below lg) and clip with `overflow-hidden`.
  - Touch: sliders must work with swipe as well as arrows where it's natural
    (a horizontal swipe on the slide changes it); tap targets ≥ 40px.
  - Hover-only details must also be reachable without hover.
  - Scroll animations still run, but reduce distances if they cause overflow.
- Desktop-only decorative bits can be hidden on phones (`max-lg:hidden`) if
  they don't fit and don't carry content.
