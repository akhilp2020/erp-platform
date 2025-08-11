const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const { generate } = require('./emit');

function readPTL(ptlPath) {
  const raw = fs.readFileSync(ptlPath, 'utf8');
  const ext = path.extname(ptlPath).toLowerCase();
  return ext === '.json' ? JSON.parse(raw) : yaml.load(raw);
}

async function main() {
  const ptlPath = process.argv[2] || path.resolve(__dirname, '../../backend/packs/salon/salon-pack.ptl.yaml');
  const tenant = (process.argv[3] || 'demo-salon').toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const outDir = path.resolve(__dirname, `../../generated/${tenant}`);

  const ptl = readPTL(ptlPath);
  await generate(ptl, outDir);

  console.log(`\n✅ Generated to: ${outDir}`);
  console.log(`Next steps:`);
  console.log(`  cd ${outDir}`);
  console.log(`  npm i`);
  console.log(`  npx prisma migrate dev --name init`);
  console.log(`  npm run dev   # open http://localhost:3000`);
}

main().catch(e => { console.error(e); process.exit(1); });

