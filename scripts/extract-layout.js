import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Por que: precisamos gerar tokens de layout diretamente do SVG para garantir pixel perfect.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const SVG_PATH = path.join(ROOT, 'public', 'figma-gabarito.svg');
const OUTPUT_PATH = path.join(ROOT, 'src', 'config', 'generatedLayout.ts');
const BASELINE_PATH = path.join(ROOT, 'src', 'config', 'layoutBaseline.json');

const TARGET_MASKS = [
  {
    key: 'QUESTION_CARD',
    id: 'path-87-outside-1_2238_4227',
    description: 'Cartão de pergunta principal',
  },
  {
    key: 'ALTERNATIVE_TOP_STRIP',
    id: 'path-102-outside-5_2238_4227',
    description: 'Faixa superior das alternativas',
  },
  {
    key: 'ALTERNATIVE_LEFT_COL',
    id: 'path-93-outside-3_2238_4227',
    description: 'Coluna esquerda das alternativas inferiores',
  },
  {
    key: 'ALTERNATIVE_RIGHT_COL',
    id: 'path-96-outside-4_2238_4227',
    description: 'Coluna direita das alternativas inferiores',
  },
  {
    key: 'FOOTER_PANEL',
    id: 'path-90-outside-2_2238_4227',
    description: 'Painel inferior lateral (botão principal)',
  },
  {
    key: 'FOOTER_STRIP',
    id: 'path-158-outside-15_2238_4227',
    description: 'Faixa inferior completa (HUD footer)',
  },
  {
    key: 'FOOTER_POWERUP_LEFT',
    id: 'path-162-outside-17_2238_4227',
    description: 'Botão power-up esquerdo',
  },
  {
    key: 'FOOTER_POWERUP_CENTER',
    id: 'path-170-outside-19_2238_4227',
    description: 'Botão power-up central',
  },
  {
    key: 'FOOTER_POWERUP_RIGHT',
    id: 'path-178-outside-21_2238_4227',
    description: 'Botão power-up direito',
  },
];

function readSvg() {
  if (!fs.existsSync(SVG_PATH)) {
    throw new Error(`SVG não encontrado em ${SVG_PATH}`);
  }
  return fs.readFileSync(SVG_PATH, 'utf-8');
}

function extractMaskAttributes(svg, id) {
  const maskRegex = new RegExp(`<mask[^>]*id="${id}"[^>]*>`, 'i');
  const match = svg.match(maskRegex);
  if (!match) {
    return null;
  }

  const tag = match[0];
  const attrRegex = (name) => {
    const attrMatch = tag.match(new RegExp(`${name}="([^"]+)"`, 'i'));
    return attrMatch ? attrMatch[1] : null;
  };

  const x = attrRegex('x');
  const y = attrRegex('y');
  const width = attrRegex('width');
  const height = attrRegex('height');

  if ([x, y, width, height].some((value) => value === null)) {
    return null;
  }

  return {
    x: parseFloat(x),
    y: parseFloat(y),
    width: parseFloat(width),
    height: parseFloat(height),
  };
}

function roundValue(value) {
  const fixed = value.toFixed(3);
  const trimmed = fixed.replace(/\.0+$/, '').replace(/(\.\d*?[1-9])0+$/, '$1');
  return Number(trimmed);
}

function computeToken(maskInfo) {
  const { x, y, width, height } = maskInfo;
  const right = x + width;
  const bottom = y + height;
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  return {
    frame: {
      x: roundValue(x),
      y: roundValue(y),
      width: roundValue(width),
      height: roundValue(height),
      right: roundValue(right),
      bottom: roundValue(bottom),
    },
    center: {
      x: roundValue(centerX),
      y: roundValue(centerY),
    },
  };
}

function formatForTs(token) {
  const format = (value) => {
    return Number.isInteger(value) ? value.toString() : value.toString();
  };

  return {
    frame: {
      x: format(token.frame.x),
      y: format(token.frame.y),
      width: format(token.frame.width),
      height: format(token.frame.height),
      right: format(token.frame.right),
      bottom: format(token.frame.bottom),
    },
    center: {
      x: format(token.center.x),
      y: format(token.center.y),
    },
  };
}

function buildFile(tokens) {
  const lines = [];
  lines.push('// Este arquivo é gerado automaticamente por scripts/extract-layout.js');
  lines.push('// Não edite manualmente. Execute `npm run layout:sync` após atualizar o SVG.');
  lines.push('');
  lines.push('export const LAYOUT_TOKENS = {');

  tokens.forEach((token) => {
    const { key, description, formatted } = token;
    lines.push(`  // ${description}`);
    lines.push(`  ${key}: {`);
    lines.push('    frame: {');
    lines.push(`      x: ${formatted.frame.x},`);
    lines.push(`      y: ${formatted.frame.y},`);
    lines.push(`      width: ${formatted.frame.width},`);
    lines.push(`      height: ${formatted.frame.height},`);
    lines.push(`      right: ${formatted.frame.right},`);
    lines.push(`      bottom: ${formatted.frame.bottom},`);
    lines.push('    },');
    lines.push('    center: {');
    lines.push(`      x: ${formatted.center.x},`);
    lines.push(`      y: ${formatted.center.y},`);
    lines.push('    },');
    lines.push('  },');
    lines.push('');
  });

  lines.push('} as const;');
  lines.push('');
  lines.push('export type LayoutTokenKey = keyof typeof LAYOUT_TOKENS;');

  return lines.join('\n');
}

function buildBaseline(tokens) {
  const baseline = {};
  tokens.forEach(({ key, raw }) => {
    baseline[key] = raw;
  });
  return baseline;
}

function main() {
  const svg = readSvg();
  const tokens = [];

  TARGET_MASKS.forEach((target) => {
    const attributes = extractMaskAttributes(svg, target.id);
    if (!attributes) {
      throw new Error(`Não foi possível localizar o mask ${target.id}. Atualize o mapeamento.`);
    }

    const raw = computeToken(attributes);
    const formatted = formatForTs(raw);
    tokens.push({ key: target.key, description: target.description, raw, formatted });
  });

  const fileContent = buildFile(tokens);
  fs.writeFileSync(OUTPUT_PATH, `${fileContent}\n`, 'utf-8');
  const baselineContent = JSON.stringify(buildBaseline(tokens), null, 2);
  fs.writeFileSync(BASELINE_PATH, `${baselineContent}\n`, 'utf-8');
  console.log(`Layout atualizado em ${OUTPUT_PATH}`);
  console.log(`Baseline gerada em ${BASELINE_PATH}`);
}

const isMain = process.argv[1]
  ? path.resolve(process.argv[1]) === __filename
  : false;

if (isMain) {
  try {
    main();
  } catch (error) {
    console.error('[extract-layout] Falha ao gerar tokens:', error.message);
    process.exit(1);
  }
}
