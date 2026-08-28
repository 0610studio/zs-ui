import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url));
const PROJECT_DIRECTORY = resolve(SCRIPT_DIRECTORY, '..', '..');
const DOCS_DIRECTORY = join(PROJECT_DIRECTORY, 'docs', 'docs');
const INDEX_FILE = join(PROJECT_DIRECTORY, 'src', 'index.ts');

function collectMarkdown(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const target = join(directory, entry.name);

    if (entry.isDirectory()) return collectMarkdown(target);
    if (!/\.mdx?$/.test(entry.name)) return [];
    return [readFileSync(target, 'utf8')];
  });
}

const source = readFileSync(INDEX_FILE, 'utf8');
const runtimeExportBlock = source.match(/export\s*\{([\s\S]*?)\};/);

if (!runtimeExportBlock) {
  throw new Error('src/index.ts에서 runtime export 블록을 찾지 못했습니다.');
}

const exportedNames = runtimeExportBlock[1]
  .split(',')
  .map(value => value.trim())
  .filter(Boolean)
  .map(value => value.split(/\s+as\s+/).at(-1));

const documentation = collectMarkdown(DOCS_DIRECTORY).join('\n');
const missingNames = exportedNames.filter(name => {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return !new RegExp(`\\b${escapedName}\\b`).test(documentation);
});

if (missingNames.length > 0) {
  console.error('문서에서 찾을 수 없는 공개 runtime export가 있습니다:');
  missingNames.forEach(name => console.error(`- ${name}`));
  process.exit(1);
}

console.log(`공개 runtime export ${exportedNames.length}개의 문서 노출을 확인했습니다.`);
