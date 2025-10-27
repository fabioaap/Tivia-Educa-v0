import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const scene = args[0];

if (!scene) {
  console.error('[layout:validate] Informe a cena. Exemplo: npm run layout:validate game');
  process.exit(1);
}

const baselinePaths = [
  path.join(ROOT, 'src', 'config', `layoutBaseline-${scene}.json`),
  path.join(ROOT, 'src', 'config', 'layoutBaseline.json'),
];

let baselineData = null;
let baselinePath = null;
for (const candidate of baselinePaths) {
  if (fs.existsSync(candidate)) {
    baselineData = JSON.parse(fs.readFileSync(candidate, 'utf-8'));
    baselinePath = candidate;
    break;
  }
}

if (!baselineData) {
  console.error('[layout:validate] Não foi possível localizar layoutBaseline para a cena informada.');
  process.exit(1);
}

const slicesDir = path.join(ROOT, 'public', 'assets', 'layout', scene);
if (!fs.existsSync(slicesDir)) {
  console.error(`[layout:validate] Diretório ${path.relative(ROOT, slicesDir)} não encontrado.`);
  process.exit(1);
}

const toFilename = (key) => `${key.toLowerCase().replace(/_/g, '-')}.png`;

const failures = [];

async function validate() {
  const entries = Object.entries(baselineData);

  for (const [key, value] of entries) {
    if (!value?.frame) continue;
    const expectedWidth = Math.round(value.frame.width);
    const expectedHeight = Math.round(value.frame.height);

    const fileName = toFilename(key);
    const filePath = path.join(slicesDir, fileName);

    if (!fs.existsSync(filePath)) {
      failures.push(`${key}: arquivo ${fileName} ausente.`);
      continue;
    }

    try {
      const metadata = await sharp(filePath).metadata();
      const actualWidth = metadata.width ?? 0;
      const actualHeight = metadata.height ?? 0;

      if (actualWidth !== expectedWidth || actualHeight !== expectedHeight) {
        failures.push(
          `${key}: esperado ${expectedWidth}x${expectedHeight}, obtido ${actualWidth}x${actualHeight}`,
        );
      }
    } catch (error) {
      failures.push(`${key}: falha ao ler ${fileName} (${error.message})`);
    }
  }

  if (failures.length > 0) {
    console.error('[layout:validate] Inconsistências encontradas:');
    failures.forEach((failure) => console.error(` - ${failure}`));
    process.exit(1);
  } else {
    console.log(`[layout:validate] Todos os slices da cena "${scene}" batem com ${baselinePath}.`);
  }
}

validate().catch((error) => {
  console.error('[layout:validate] Erro inesperado:', error);
  process.exit(1);
});
