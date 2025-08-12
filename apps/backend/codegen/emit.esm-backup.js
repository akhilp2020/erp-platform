const fs = require('fs-extra');
const path = require('path');
const Handlebars = require('handlebars');

// case helpers (CJS-safe)
const change = require('change-case');
let { camelCase, pascalCase } = change;
let paramCase = change.paramCase;
if (typeof paramCase !== 'function') {
  try { paramCase = require('param-case').paramCase; }
  catch { throw new Error('paramCase not available. Run: npm i param-case'); }
}
Handlebars.registerHelper('camel', (s) => camelCase(String(s || '')));
Handlebars.registerHelper('pascal', (s) => pascalCase(String(s || '')));
Handlebars.registerHelper('kebab', (s) => paramCase(String(s || '')));

function compile(tplPath, data) {
  const source = fs.readFileSync(tplPath, 'utf8');
  const tpl = Handlebars.compile(source);
  return tpl(data);
}

/**
 * ptl: { data.entities: [{ name, fields: [{name,type,required,unique,index}], ... }] }
 * outDir: apps/generated/<tenant>
 */
async function generate(ptl, outDir) {
  await fs.ensureDir(outDir);

  // 1) Prisma schema
  const entities = (ptl?.data?.entities || []).map(e => {
    const fields = (e.fields || []).map(f => ({
      name: f.name,
      type: mapType(f),
      required: f.required === true,
      unique: !!f.unique,
      isId: f.name.toLowerCase() === 'id'
    }));
    const indexes = (e.fields || []).filter(f => f.index).map(f => f.name);
    return { name: e.name, fields, indexes };
  });

  const prismaOut = compile(path.resolve(__dirname, '../templates/prisma/schema.prisma.hbs'), { entities });
  await fs.outputFile(path.join(outDir, 'prisma/schema.prisma'), prismaOut);

  // 2) For each entity: API + UI (Next.js app router)
  for (const e of entities) {
    // API list/create
    const apiList = compile(path.resolve(__dirname, '../templates/api/route.ts.hbs'), { entityName: e.name });
    await fs.outputFile(path.join(outDir, 'app/api', paramCase(e.name), 'route.ts'), apiList);
    // API by id
    const apiId = compile(path.resolve(__dirname, '../templates/api/route-id.ts.hbs'), { entityName: e.name });
    await fs.outputFile(path.join(outDir, 'app/api', paramCase(e.name), '[id]', 'route.ts'), apiId);
    // UI list page
    const displayFields = e.fields.slice(0, 4).map(f => f.name);
    const uiList = compile(path.resolve(__dirname, '../templates/ui/page-list.tsx.hbs'), {
      entityName: e.name, title: `${e.name} List`, displayFields
    });
    await fs.outputFile(path.join(outDir, 'app', paramCase(e.name), 'page.tsx'), uiList);
    // UI form page
    const inputFields = e.fields.filter(f => f.name !== 'id' && f.type !== 'DateTime' && f.type !== 'Json');
    const defaults = {};
    inputFields.forEach(f => (defaults[f.name] = '""'));
    const uiForm = compile(path.resolve(__dirname, '../templates/ui/page-form.tsx.hbs'), {
      entityName: e.name, fields: inputFields, defaults
    });
    await fs.outputFile(path.join(outDir, 'app', paramCase(e.name), '[...id]', 'page.tsx'), uiForm);
  }

  // 3) Base scaffolding (if you don’t already create these elsewhere)
  await scaffoldBase(outDir);

  // 4) Format Prisma if available
  try {
    const { execSync } = require('node:child_process');
    execSync(`npx prisma format --schema=${path.join(outDir, 'prisma/schema.prisma')}`, { stdio: 'inherit' });
  } catch {}
}

function mapType(f) {
  switch (f.type) {
    case 'string':
    case 'text': return 'String';
    case 'int': return 'Int';
    case 'float': return 'Float';
    case 'bool': return 'Boolean';
    case 'money': return 'Decimal';
    case 'date':
    case 'datetime': return 'DateTime';
    case 'json': return 'Json';
    case 'enum': return 'String';
    case 'ref': return 'String';
    default: return 'String';
  }
}

async function scaffoldBase(outDir) {
  await fs.ensureDir(path.join(outDir, 'app'));
  // layout (only if missing)
  const layoutPath = path.join(outDir, 'app', 'layout.tsx');
  if (!fs.existsSync(layoutPath)) {
    await fs.outputFile(layoutPath, `
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html><body className="p-6 font-sans">{children}</body></html>;
}`.trim());
  }
  // homepage (only if missing)
  const homePath = path.join(outDir, 'app', 'page.tsx');
  if (!fs.existsSync(homePath)) {
    await fs.outputFile(homePath, `
export default function Page() {
  return <main className="p-6">
    <h1 className="text-2xl font-semibold mb-4">Generated App</h1>
    <p>Visit your entity routes, e.g., /customer</p>
  </main>;
}`.trim());
  }
}

module.exports = { generate };
