// Re-seeds WordPress from wordpress/seed (media, settings, posts, homepage).
import { readFileSync } from 'node:fs';
const php = readFileSync('wordpress/plugin/adamson-headless/config.local.php', 'utf8');
const secret = php.match(/ADAMSON_REVALIDATE_SECRET', '([^']+)'/)[1];
const res = await fetch('http://127.0.0.1:9400/wp-json/adamson/v1/seed', { method: 'POST', headers: { 'x-adamson-seed': secret } });
console.log(res.status, await res.text());
