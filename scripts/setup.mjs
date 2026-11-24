// Creates matching secrets for WordPress and the Next.js apps (once).
import { randomBytes } from 'node:crypto';
import { existsSync, writeFileSync } from 'node:fs';

const php = 'wordpress/plugin/adamson-headless/config.local.php';
const env = 'web/.env.local';
if (existsSync(php) && existsSync(env)) {
  console.log('Secrets already exist.');
  process.exit(0);
}
const preview = randomBytes(24).toString('hex');
const revalidate = randomBytes(24).toString('hex');
writeFileSync(php, `<?php
// Local secrets, created by scripts/setup.mjs. Not committed.
define( 'ADAMSON_WWW_URL', 'http://localhost:3000' );
define( 'ADAMSON_PREVIEW_URL', 'http://localhost:3001' );
define( 'ADAMSON_PREVIEW_SECRET', '${preview}' );
define( 'ADAMSON_REVALIDATE_SECRET', '${revalidate}' );
// Local test admin for this proof of concept (seed creates it).
define( 'ADAMSON_ADMIN_USER', 'admin' );
define( 'ADAMSON_ADMIN_PASSWORD', 'admin' );
`);
// The www app gets only the revalidate secret. The preview app adds the
// preview secret on start (see web/package.json "start:preview").
writeFileSync(env, `WP_URL=http://127.0.0.1:9400
REVALIDATE_SECRET=${revalidate}
`);
writeFileSync('web/.env.preview', `PREVIEW_SECRET=${preview}
`);
console.log('Wrote', php, env, 'web/.env.preview');
