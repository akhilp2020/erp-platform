#!/usr/bin/env node
/*
 * PTL CLI
 * - validate <spec.yml>
 * - build:data <spec.yml>  -> outputs generated/schema.prisma
 *
 * Changes:
 * - Collect field indexes and emit model-level @@index([...]) instead of @index on fields (fixes Prisma P1012).
 */

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const yaml = require('js-yaml');

const schemaPath = path.resolve(__dirname, 'ptl.schema.json');
let ptlSchema;
try {
  ptlSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
} catch (err) {
  console.error('Failed to load PTL schema:', err.message);
  process.exit(1);
}

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validateFn = ajv.compile(ptlSchema);

function readSpec(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.json') return JSON.parse(raw);
  if (ext === '.yaml' || ext === '.yml' || ext === '') return yaml.load(raw);
  throw new Error(`Unsupported spec file extension: ${ext}`);
}

function validateSpec(spec) {
  const valid = validateFn(spec);
  return valid ? null : validateFn.errors;
}

function camelCase(str) {
  return str
    .replace(/_/g, ' ')
    .replace(/(?:^|\s)(\w)/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/\s+/g, '');
}

function prismaType(ptlType) {
  switch (ptlType) {
    case 'string':
    case 'text': return 'String';
    case 'int': return 'Int';
    case 'float': return 'Float';
    case 'bool': return 'Boolean';
    case 'money': return 'Decimal';
    case 'date':
    case 'datetime': return 'DateTime';
    case 'json': return 'Json';
    case 'enum': return 'String'; // simple mapping for v0.1
    case 'ref': return 'String';  // FK as string for now
    default: return 'String';
  }
}

/**
 * Generate Prisma schema for selected entities.
 * For Week-1, we emit Customer, Service, Appointment.
 */
function generatePrismaSchema(spec, entitiesToEmit) {
  const lines = [];
  // Datasource & generator
  lines.push('datasource db {');
  lines.push('  provider = "postgresql"');
  lines.push('  url      = env("DATABASE_URL")');
  lines.push('}');
  lines.push('');
  lines.push('generator client {');
  lines.push('  provider = "prisma-client-js"');
  lines.push('}');
  lines.push('');

  const entities = spec?.data?.entities || [];
  const entityMap = new Map(entities.map((e) => [e.name, e]));

  entitiesToEmit.forEach((entityName) => {
    const ent = entityMap.get(entityName);
    if (!ent) return;

    lines.push(`model ${camelCase(entityName)} {`);
    let idFieldPresent = false;
    const modelIndexes = []; // collect fields flagged as index: true

    (ent.fields || []).forEach((f) => {
      const type = prismaType(f.type);
      let line = `  ${f.name} ${type}${f.required === true ? '' : '?'}`;
      const directives = [];

      if (f.name.toLowerCase() === 'id') {
        idFieldPresent = true;
        directives.push('@id');
        if (type === 'String') directives.push('@default(cuid())');
      } else {
        if (f.unique) directives.push('@unique');
        // no @index on fields; collect for model-level @@index
        if (f.index) modelIndexes.push(f.name);
      }

      if (typeof f.default !== 'undefined' && f.name.toLowerCase() !== 'id') {
        const defVal = typeof f.default === 'string' ? `"${f.default}"` : f.default;
        directives.push(`@default(${defVal})`);
      }

      if (directives.length) line += ' ' + directives.join(' ');
      lines.push(line);
    });

    if (!idFieldPresent) {
      lines.push('  id String @id @default(cuid())');
    }

    // Emit model-level indexes
    modelIndexes.forEach((fname) => {
      lines.push(`  @@index([${fname}])`);
    });

    lines.push('}');
    lines.push('');
  });

  return lines.join('\n');
}

async function main() {
  const [command, specFile] = process.argv.slice(2);
  if (!command || !specFile) {
    console.error('Usage: node ptlc.js <validate|build:data> <spec.yml>');
    process.exit(1);
  }

  try {
    const spec = readSpec(path.resolve(specFile));

    if (command === 'validate') {
      const errs = validateSpec(spec);
      if (!errs) {
        console.log('Spec is valid.');
        process.exit(0);
      }
      console.error('Spec validation failed:');
      errs.forEach((e) => console.error(`- ${e.instancePath} ${e.message}`));
      process.exit(1);
    }

    if (command === 'build:data') {
      const errs = validateSpec(spec);
      if (errs) {
        console.error('Spec validation failed. Cannot generate Prisma schema.');
        errs.forEach((e) => console.error(`- ${e.instancePath} ${e.message}`));
        process.exit(1);
      }
      const outDir = path.resolve(__dirname, 'generated');
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      const prismaSchema = generatePrismaSchema(spec, ['Customer', 'Service', 'Appointment']);
      const outPath = path.join(outDir, 'schema.prisma');
      fs.writeFileSync(outPath, prismaSchema, 'utf8');
      console.log(`Generated Prisma schema at ${outPath}`);
      process.exit(0);
    }

    console.error(`Unknown command: ${command}`);
    process.exit(1);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();