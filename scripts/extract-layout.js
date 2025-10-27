import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { svgPathBbox } from 'svg-path-bbox';

// Gera tokens de layout pixel-perfect a partir do SVG exportado do Figma
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
let scene = null;
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === '--scene' && args[i + 1]) {
    scene = args[i + 1];
    break;
  }
}

const svgFilename = scene ? `gabarito-${scene}.svg` : 'figma-gabarito.svg';
const svgPathPreferred = path.join(ROOT, 'public', svgFilename);
const svgPathFallback = path.join(ROOT, 'public', 'figma-gabarito.svg');

let SVG_PATH = svgPathPreferred;
if (!fs.existsSync(svgPathPreferred)) {
  if (fs.existsSync(svgPathFallback)) {
    console.warn(
      `[layout:sync] Arquivo ${svgFilename} não encontrado. Usando figma-gabarito.svg como fallback.`,
    );
    SVG_PATH = svgPathFallback;
  } else {
    console.error(
      `[layout:sync] Nenhum gabarito encontrado. Salve ${svgFilename} ou figma-gabarito.svg em public/.`,
    );
    process.exit(1);
  }
}

const OUTPUT_PATH = scene
  ? path.join(ROOT, 'src', 'config', `generatedLayout-${scene}.ts`)
  : path.join(ROOT, 'src', 'config', 'generatedLayout.ts');
const BASELINE_PATH = scene
  ? path.join(ROOT, 'src', 'config', `layoutBaseline-${scene}.json`)
  : path.join(ROOT, 'src', 'config', 'layoutBaseline.json');
const DEFAULT_OUTPUT_PATH = path.join(ROOT, 'src', 'config', 'generatedLayout.ts');
const DEFAULT_BASELINE_PATH = path.join(ROOT, 'src', 'config', 'layoutBaseline.json');

const TARGET_REGIONS = [
  { key: 'HEADER', type: 'mask', id: 'path-158-outside-15_2238_4227', description: 'Header completo' },
  { key: 'QUESTION_CARD', type: 'mask', id: 'path-87-outside-1_2238_4227', description: 'Cartão de pergunta' },
  { key: 'ALTERNATIVE_TOP_STRIP', type: 'mask', id: 'path-102-outside-5_2238_4227', description: 'Alternativa D (superior)' },
  { key: 'ALTERNATIVE_LEFT_COL', type: 'mask', id: 'path-93-outside-3_2238_4227', description: 'Alternativa A (esquerda)' },
  { key: 'ALTERNATIVE_RIGHT_COL', type: 'mask', id: 'path-96-outside-4_2238_4227', description: 'Alternativa B (direita)' },
  {
    key: 'ALTERNATIVES_GRID',
    type: 'composed',
    from: ['ALTERNATIVE_TOP_STRIP', 'ALTERNATIVE_LEFT_COL', 'ALTERNATIVE_RIGHT_COL', 'FOOTER_PANEL'],
    description: 'Área completa das alternativas',
  },
  { key: 'FOOTER_PANEL', type: 'mask', id: 'path-90-outside-2_2238_4227', description: 'Alternativa C / base inferior' },
  { key: 'FOOTER_STRIP', type: 'mask', id: 'path-160-inside-16_2238_4227', description: 'Footer completo' },
  { key: 'FOOTER_POWERUP_LEFT', type: 'mask', id: 'path-162-outside-17_2238_4227', description: 'Power-up esquerdo' },
  { key: 'FOOTER_POWERUP_CENTER', type: 'mask', id: 'path-170-outside-19_2238_4227', description: 'Power-up central' },
  { key: 'FOOTER_POWERUP_RIGHT', type: 'mask', id: 'path-178-outside-21_2238_4227', description: 'Power-up direito' },
];

function readSvg() {
  return fs.readFileSync(SVG_PATH, 'utf-8');
}

function extractMaskBounds(svg, id) {
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
    return extractBoundsFromMaskedPath(svg, id);
  }

  return {
    x: parseFloat(x),
    y: parseFloat(y),
    width: parseFloat(width),
    height: parseFloat(height),
  };
}

function extractBoundsFromMaskedPath(svg, id) {
  const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const elementRegex = new RegExp(
    `<(path|rect|ellipse|circle)[^>]*mask="url\\(#${escapedId}\\)"[^>]*>`,
    'i',
  );
  const match = svg.match(elementRegex);
  if (!match) {
    return null;
  }

  const tag = match[0];

  const dMatch = tag.match(/\sd="([^"]+)"/i);
  if (dMatch) {
    const [minX, minY, maxX, maxY] = svgPathBbox(dMatch[1]);
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  const attr = (name) => {
    const attrMatch = tag.match(new RegExp(`${name}="([^"]+)"`, 'i'));
    return attrMatch ? parseFloat(attrMatch[1]) : null;
  };

  const x = attr('x');
  const y = attr('y');
  const width = attr('width');
  const height = attr('height');
  const cx = attr('cx');
  const cy = attr('cy');
  const r = attr('r');
  const rx = attr('rx');
  const ry = attr('ry');

  if (x !== null && y !== null && width !== null && height !== null) {
    return { x, y, width, height };
  }

  if (cx !== null && cy !== null) {
    if (r !== null) {
      return { x: cx - r, y: cy - r, width: r * 2, height: r * 2 };
    }
    if (rx !== null && ry !== null) {
      return { x: cx - rx, y: cy - ry, width: rx * 2, height: ry * 2 };
    }
  }

  return null;
}

function unionBounds(boundsList) {
  const minX = Math.min(...boundsList.map((b) => b.x));
  const minY = Math.min(...boundsList.map((b) => b.y));
  const maxX = Math.max(...boundsList.map((b) => b.x + b.width));
  const maxY = Math.max(...boundsList.map((b) => b.y + b.height));
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function resolveBounds(target, svg, cache) {
  if (target.type === 'mask' && target.id) {
    const attrs = extractMaskBounds(svg, target.id);
    if (attrs) {
      return attrs;
    }
  }

  if (target.type === 'composed') {
    const sources = target.from || [];
    const base = sources
      .map((key) => cache.get(key))
      .filter(Boolean);
    if (base.length > 0) {
      return unionBounds(base);
    }
  }

  return null;
}

function roundValue(value) {
  const fixed = value.toFixed(3);
  const trimmed = fixed.replace(/\.0+$/, '').replace(/(\.\d*?[1-9])0+$/, '$1');
  return Number(trimmed);
}

function computeToken(bounds) {
  const { x, y, width, height } = bounds;
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
  const boundsCache = new Map();

  TARGET_REGIONS.forEach((target) => {
    const bounds = resolveBounds(target, svg, boundsCache);
    if (!bounds) {
      throw new Error(`Não foi possível localizar a região ${target.key}. Atualize o mapeamento.`);
    }

    boundsCache.set(target.key, bounds);
    const raw = computeToken(bounds);
    const formatted = formatForTs(raw);
    tokens.push({ key: target.key, description: target.description, raw, formatted });
  });

  const fileContent = buildFile(tokens);
  fs.writeFileSync(OUTPUT_PATH, `${fileContent}\n`, 'utf-8');
  const baselineContent = JSON.stringify(buildBaseline(tokens), null, 2);
  fs.writeFileSync(BASELINE_PATH, `${baselineContent}\n`, 'utf-8');
  console.log(`Layout atualizado em ${OUTPUT_PATH}`);
  console.log(`Baseline gerada em ${BASELINE_PATH}`);

  if (scene === 'game') {
    fs.writeFileSync(DEFAULT_OUTPUT_PATH, `${fileContent}\n`, 'utf-8');
    fs.writeFileSync(DEFAULT_BASELINE_PATH, `${baselineContent}\n`, 'utf-8');
    console.log(`Layout padrão atualizado em ${DEFAULT_OUTPUT_PATH}`);
    console.log(`Baseline padrão atualizada em ${DEFAULT_BASELINE_PATH}`);
  }
}

const isMain = process.argv[1] ? path.resolve(process.argv[1]) === __filename : false;

if (isMain) {
  try {
    main();
  } catch (error) {
    console.error('[extract-layout] Falha ao gerar tokens:', error.message);
    process.exit(1);
  }
}
