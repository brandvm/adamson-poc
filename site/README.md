# Adamson studies site (Astro)

Static Astro site deployed to GitHub Pages at https://brandvm.github.io/adamson-poc/
by `.github/workflows/deploy-site.yml` on every push to `main` that touches `site/`.

- `src/pages/index.astro` — the hub page linking the studies.
- `public/` — files served as-is: the self-contained WebGL studies
  (`driver-face-webgl.html`, `hall-sound-waves.html`), the hall photo and thumbnails.

```bash
npm install
npm run dev      # http://localhost:4321/adamson-poc/
npm run build    # outputs to dist/
```

Links must include the base path (`/adamson-poc/`). In `.astro` files use
`import.meta.env.BASE_URL`; in `public/` HTML use relative paths.
