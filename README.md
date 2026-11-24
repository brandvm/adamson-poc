# Adamson: headless WordPress + Next.js proof of concept

A free, local test of the setup proposed for Multimatic, built on the Adamson homepage design
([Figma](https://www.figma.com/design/Z9vjuAohqnHDLjOBc5ZQBb/Adamson?node-id=463-596)):

- **WordPress** (run locally by WordPress Playground: no PHP, MySQL or Docker needed) holds **all content**.
  Every homepage section is a block with its own fields, and the header and footer live on a
  **Site settings** page. News cards come from real WordPress posts.
- **Next.js** renders the site. The same app runs twice:
  - **www** on <http://localhost:3000>: the public site. It can't read drafts.
  - **preview** on <http://localhost:3001>: holds the draft-reading secret. WordPress's Preview button
    opens drafts here, and the editor's live block previews come from here.
- **Publishing** in WordPress tells www to refresh (`/api/revalidate`), so changes are live in seconds.

| Production (Multimatic) | This test |
|---|---|
| WP Engine | WordPress Playground on <http://127.0.0.1:9400> (SQLite, data kept in `wordpress/site/`) |
| Heroku `www` / `preview` / `stage` apps | `next start` on ports 3000 / 3001 (no `stage` here) |
| Media CDN | WordPress uploads |

## Run it

```bash
npm run setup          # once: secrets + web dependencies
npm run wp             # WordPress on :9400 (keep running)
npm run seed           # loads the design's content into WordPress (re-run any time to reset)
npm run web:build      # build the Next.js app
npm run www            # public site on :3000
npm run preview        # preview app on :3001
```

While developing, use hot-reloading dev servers instead of the last three:
`npm --prefix web run dev -- -p 3000` (www) and `npm --prefix web run dev:preview` (preview, :3001).
In dev mode nothing is cached, so to test publish refresh use the production commands above.

Log in at <http://127.0.0.1:9400/wp-admin> as `admin` / `admin` (set in
`wordpress/plugin/adamson-headless/config.local.php`; test content only).

**From other devices on the network**, use this Mac's address instead of `localhost`, e.g.:
- WordPress: `http://192.168.0.21:9400/wp-admin`
- Site: `http://192.168.0.21:3000`
- Preview: `http://192.168.0.21:3001`

WordPress answers on whichever address it's opened with, and points its Preview button and live block previews at the Next.js apps on that same address. Images are served through the Next.js apps, so they load anywhere. The address can change if the Mac reconnects to the network: check it with `ipconfig getifaddr en0`.

## Share it online (Vercel)

A **snapshot** of the site is hosted at <https://adamson-preview.vercel.app>. It works with this Mac switched
off, because the content is frozen into the app instead of read from WordPress. To update it after content
changes, with WordPress running:

```bash
npm run snapshot
cd web && npx vercel@latest deploy --prod --yes --build-env WP_SNAPSHOT=1 --env WP_SNAPSHOT=1
```

`npm run snapshot` copies the homepage, settings, posts, products and every image they use into
`web/snapshot/` and `web/public/wp-content/`. The online copy has no WordPress, draft preview or publish
refresh: it changes only when you redeploy.

## Try the workflow

1. **Edit a section:** Pages → Home. Select a block; its fields are in the right-hand sidebar, and the
   block on the canvas is the real Next.js component, updating as you type.
2. **Preview a draft:** change something, click Preview (top right). The preview app opens the draft.
3. **Publish:** click Save. Reload <http://localhost:3000>: the change is live, no rebuild.
4. **Header and footer:** Site settings (left menu).
5. **News:** Posts → add or edit a post (title, excerpt, featured image, category). The News section updates.
6. **Products:** Products (left menu).
   - Each product is edited once: type, series, specs, studio render, cut-out, logo, link.
   - The Products section lists every product with "Show in the Products section" on, in their Order.
   - Filter pills follow the types in use.
   - Products in action slides pick a product and add their own photo and heading.
   - Featured products slides are editorial (product-line spotlights) and keep their own content.
7. **Video scrub:** in the "Video scrub" block, upload an MP4. For smooth scrubbing, encode it with a keyframe
   every few frames:
   `ffmpeg -i in.mov -c:v libx264 -crf 22 -g 5 -keyint_min 5 -sc_threshold 0 -bf 0 -pix_fmt yuv420p -movflags +faststart -an scrub.mp4`

## How it's built

- `wordpress/plugin/adamson-headless/`: the WordPress side.
  - `contract/blocks/*.json`: one file per block, defining its fields.
  - `contract/settings-*.json`: the Site settings fields.
  - `assets/fields.js`: builds the editing UI from those files.
  - `assets/editor.js`: registers the blocks and the live preview.
  - `adamson-headless.php`: REST API, preview links and publish refresh.
  - `seed.php`: loads `wordpress/seed/`.
- `web/`: the Next.js app.
  - `components/blocks/*`: one component per block.
  - `components/blocks/registry.ts`: maps block names to components.
  - `app/page.tsx`: the homepage.
  - `app/block-preview`: the editor's live preview.
  - `app/api/*`: preview, exit-preview, revalidate, posts.
- `docs/BUILDING-SECTIONS.md`: how to add a section.
- Ported from `brandvm/wf-template`: Lenis + GSAP smooth scrolling on one ticker, viewport scaling, count-up.
- **Motion:**
  - Hero speaker parallax, which also follows the pointer.
  - An artist strip that loops seamlessly and runs faster when you scroll, following the scroll direction.
  - Featured products:
    - The next slide grows out of the "Next" thumbnail, right to left.
    - The artwork settles from slightly larger into place.
    - Scroll parallax.
- **Backgrounds behind product cut-outs:**
  - The hero and the Vergence slide use a studio backdrop recreated in CSS (`components/ui/StudioBackdrop.tsx`).
  - The design's background photos had the product baked in, which showed as a ghost once the cut-out moved with parallax.
  - An uploaded background must not contain the product.
- WordPress's automatic "-scaled" copies of large uploads are turned off, because they dropped PNG transparency.

Not in this test: languages (WPML/Polylang), forms to Salesforce, Heroku/WP Engine hosting, mobile layouts
(the design is desktop-only).
