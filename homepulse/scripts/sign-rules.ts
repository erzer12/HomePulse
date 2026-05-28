import { readFileSync, writeFileSync } from 'node:fs';

const filePath = process.argv[2];

if (!filePath) {
  console.error('Usage: npm run sign-rules <path-to-rules.json>');
  process.exit(1);
}

const raw = readFileSync(filePath, 'utf8');
const config = JSON.parse(raw) as { signature?: string };
config.signature = 'signed-dev-placeholder';
writeFileSync(filePath, `${JSON.stringify(config, null, 2)}\n`);
console.log(`Signed ${filePath}`);
