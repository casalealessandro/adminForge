import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, normalize, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const coreRoot = resolve(repoRoot, 'src/app/core');
const norm = value => normalize(value).split(sep).join('/');
const prefix = `${norm(coreRoot)}/`;
const forbidden = ['@angular/fire', 'firebase'];
const pattern = /(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
function files(dir) {
  return readdirSync(dir).flatMap(name => {
    const entry = join(dir, name); const s = statSync(entry);
    if (s.isDirectory()) return files(entry);
    if (entry.endsWith('.spec.ts')) return [];
    return extname(entry) === '.ts' ? [entry] : [];
  });
}
const violations = [];
for (const file of files(coreRoot)) {
  const source = readFileSync(file, 'utf8'); const sourcePath = norm(relative(repoRoot, file));
  for (const match of source.matchAll(pattern)) {
    const spec = match[1] ?? match[2]; if (!spec) continue;
    if (forbidden.some(p => spec === p || spec.startsWith(`${p}/`))) { violations.push(`${sourcePath} -> ${spec} (forbidden package)`); continue; }
    if (spec.includes('environments/')) { violations.push(`${sourcePath} -> ${spec} (environment import)`); continue; }
    if (!spec.startsWith('.')) continue;
    const target = norm(resolve(dirname(file), spec));
    if (target === norm(coreRoot) || target.startsWith(prefix)) continue;
    violations.push(`${sourcePath} -> ${spec} (escapes src/app/core)`);
  }
}
if (violations.length) { console.error('AdminForge Core boundary violations found:'); violations.forEach(v => console.error(`- ${v}`)); process.exit(1); }
console.log('AdminForge Core boundary check passed with zero legacy escapes.');
