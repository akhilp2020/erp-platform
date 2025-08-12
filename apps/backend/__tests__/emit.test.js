const fs = require('fs');
const path = require('path');

const emitPath = path.resolve(__dirname, '../codegen/emit.js');
if (!fs.existsSync(emitPath)) {
  throw new Error(`emit.js not found at: ${emitPath}`);
}
const { generate } = require(emitPath);

test('generate creates prisma schema and basic routes for a simple PTL', async () => {
  const outDir = path.resolve(__dirname, '../.tmp-gen');
  fs.rmSync(outDir, { recursive: true, force: true });

  const ptl = {
    data: {
      entities: [
        { name: 'Foo', fields: [
          { name: 'id', type: 'string', required: true, unique: true },
          { name: 'name', type: 'string', required: true }
        ] }
      ]
    }
  };

  await generate(ptl, outDir);

  expect(fs.existsSync(path.join(outDir, 'prisma', 'schema.prisma'))).toBe(true);
  expect(fs.existsSync(path.join(outDir, 'app', 'foo', 'page.tsx'))).toBe(true);
  expect(fs.existsSync(path.join(outDir, 'app', 'api', 'foo', 'route.ts'))).toBe(true);
});
