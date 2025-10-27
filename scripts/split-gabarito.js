import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { svgPathBbox } from "svg-path-bbox";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const scene = args[0];

if (!scene) {
  console.error('[layout:slice] Informe a cena. Exemplo: npm run layout:slice game');
  process.exit(1);
}

const svgFilename = `gabarito-${scene}.svg`;
const svgPathPreferred = path.join(ROOT, 'public', svgFilename);
const svgPathFallback = path.join(ROOT, 'public', 'figma-gabarito.svg');

let svgPath = svgPathPreferred;
if (!fs.existsSync(svgPathPreferred)) {
  if (fs.existsSync(svgPathFallback)) {
    console.warn('[layout:slice] Arquivo ' + svgFilename + ' não encontrado. Usando figma-gabarito.svg como fallback.');
    svgPath = svgPathFallback;
  } else {
    console.error('[layout:slice] Nenhum gabarito encontrado. Salve ' + svgFilename + ' ou figma-gabarito.svg em public/.');
    process.exit(1);
  }
}

const outputDir = path.join(ROOT, 'public', 'assets', 'layout', scene);
fs.mkdirSync(outputDir, { recursive: true });

const TARGET_REGIONS = [
  { key: 'HEADER', type: 'mask', id: 'path-158-outside-15_2238_4227', description: 'Header completo' },
  { key: 'QUESTION_CARD', type: 'mask', id: 'path-87-outside-1_2238_4227', description: 'Cartão da pergunta' },
  { key: 'ALTERNATIVE_TOP_STRIP', type: 'mask', id: 'path-102-outside-5_2238_4227', description: 'Alternativa D (top strip)' },
  { key: 'ALTERNATIVE_LEFT_COL', type: 'mask', id: 'path-93-outside-3_2238_4227', description: 'Alternativa A' },
  { key: 'ALTERNATIVE_RIGHT_COL', type: 'mask', id: 'path-96-outside-4_2238_4227', description: 'Alternativa B' },
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

function getBaselineData() {
  const candidates = [
    path.join(ROOT, 'src', 'config', `layoutBaseline-${scene}.json`),
    path.join(ROOT, 'src', 'config', 'layoutBaseline.json'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      try {
        return JSON.parse(fs.readFileSync(candidate, 'utf-8'));
      } catch (error) {
        console.warn('[layout:slice] Falha ao ler ' + candidate + ': ' + error.message);
      }
    }
  }
  return null;
}

function extractMaskBounds(svg, id) {
  const maskRegex = new RegExp('<mask[^>]*id="' + id + '"[^>]*>', 'i');
  const match = svg.match(maskRegex);
  if (!match) {
    return null;
  }

  const tag = match[0];
  const attrRegex = (name) => {
    const attrMatch = tag.match(new RegExp(name + '="([^"]+)"', 'i'));
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
  const elementRegex = new RegExp('<(path|rect|ellipse|circle)[^>]*mask="url\\(#' + escapedId + '\\)"[^>]*>', 'i');
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
    const attrMatch = tag.match(new RegExp(name + '="([^"]+)"', 'i'));
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

function toIntBounds(bounds) {
  return {
    left: Math.round(bounds.x),
    top: Math.round(bounds.y),
    width: Math.max(1, Math.round(bounds.width)),
    height: Math.max(1, Math.round(bounds.height)),
  };
}

function unionBounds(list) {
  const minX = Math.min(...list.map((b) => b.x));
  const minY = Math.min(...list.map((b) => b.y));
  const maxX = Math.max(...list.map((b) => b.x + b.width));
  const maxY = Math.max(...list.map((b) => b.y + b.height));
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function resolveBounds(target, svg, baselineData, cache) {
  if (target.type === 'mask' && target.id) {
    const attrs = extractMaskBounds(svg, target.id);
    if (attrs) {
      return attrs;
    }
  }

  if (target.type === 'composed') {
    const sources = target.from || [];
    const base = sources
      .map((key) => cache.get(key) || baselineData[key]?.frame)
      .filter(Boolean)
      .map((frame) => ({ x: frame.x, y: frame.y, width: frame.width, height: frame.height }));

    if (base.length > 0) {
      return unionBounds(base);
    }
  }

  const frame = baselineData[target.key]?.frame;
  if (frame) {
    return { x: frame.x, y: frame.y, width: frame.width, height: frame.height };
  }

  return null;
}

async function sliceScene() {
  const svgBuffer = fs.readFileSync(svgPath);
  const svgContent = svgBuffer.toString('utf-8');
  const baselineData = getBaselineData();
  if (!baselineData) {
    console.error('[layout:slice] layoutBaseline não encontrado. Rode "npm run layout:sync -- --scene ' + scene + '" primeiro.');
    process.exit(1);
  }

  const boundsCache = new Map();

  console.log('[layout:slice] Gerando sprites para cena "' + scene + '"...');

  for (const target of TARGET_REGIONS) {
    const resolved = resolveBounds(target, svgContent, baselineData, boundsCache);
    if (!resolved) {
      console.warn('[layout:slice] Não foi possível resolver bounds para ' + target.key + '. Pulando.');
      continue;
    }

    const frame = baselineData[target.key]?.frame;
    const baseBounds = frame
      ? { x: frame.x, y: frame.y, width: frame.width, height: frame.height }
      : resolved;

    const bounds = toIntBounds(baseBounds);
    boundsCache.set(target.key, baseBounds);

    const fileName = target.key.toLowerCase().replace(/_/g, '-');
    const outputFile = path.join(outputDir, fileName + '.png');

    try {
      await sharp(svgBuffer, { density: 300 })
        .extract(bounds)
        .png()
        .toFile(outputFile);
      console.log('  ✓ ' + fileName + '.png (' + bounds.width + 'x' + bounds.height + ')');
    } catch (error) {
      console.error('[layout:slice] Falha ao gerar ' + target.key + ':', error.message);
    }
  }

  console.log('[layout:slice] Sprites exportados em ' + path.relative(ROOT, outputDir));
}

sliceScene().catch((error) => {
  console.error('[layout:slice] Erro inesperado:', error);
  process.exit(1);
});
