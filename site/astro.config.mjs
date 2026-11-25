// @ts-check
import { defineConfig } from 'astro/config';

// Deployed to GitHub Pages as a project site: https://brandvm.github.io/adamson-poc/
// If the site moves to a custom domain, set `site` to that domain and remove `base`.
// https://docs.astro.build/en/guides/deploy/github/
export default defineConfig({
  site: 'https://brandvm.github.io',
  base: '/adamson-poc',
});
