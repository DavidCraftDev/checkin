#!/usr/bin/env node
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const clientPath = join(__dirname, '..', 'node_modules', '.prisma', 'client', 'default.ts');
const content = `export * from './client'\n`;

writeFileSync(clientPath, content, 'utf-8');
console.log('✓ Created default.ts export file');
