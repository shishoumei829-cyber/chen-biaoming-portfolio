import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');

const refs = new Set(html.matchAll(/assets\/[a-zA-Z0-9_\-/.]+\.(?:jpg|jpeg|png|gif|webp|svg)/g).map((m) => m[0]));

const missing = [];
for (const rel of refs) {
  const abs = join(root, rel);
  if (!existsSync(abs)) missing.push(rel);
}

console.log(`Checked ${refs.size} asset references in index.html`);
if (missing.length) {
  console.error('Missing files:');
  missing.forEach((p) => console.error(`  - ${p}`));
  process.exit(1);
}

console.log('All asset references resolve to existing files.');
