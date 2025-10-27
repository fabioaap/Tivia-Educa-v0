from pathlib import Path
file = Path('scripts/split-gabarito.js')
text = file.read_text(encoding='utf-8')
start = text.index('async function sliceScene()')
end = text.index('sliceScene().catch', start)
replacement = """async function sliceScene() {
  const svgBuffer = fs.readFileSync(svgPath);
  const svgContent = svgBuffer.toString('utf-8');
  const baselineData = getBaselineData();
  if (!baselineData) {
    console.error(`[layout:slice] layoutBaseline não encontrado. Rode `npm run layout:sync -- --scene ${scene}` primeiro.`);
    process.exit(1);
  }

  const boundsCache = new Map();

  console.log(`[layout:slice] Gerando sprites para cena \"${scene}\"...`);

  for (const target of TARGET_REGIONS) {
    const resolved = resolveBounds(target, svgContent, baselineData, boundsCache);
    if (!resolved) {
      console.warn(`[layout:slice] Não foi possível resolver bounds para ${target.key}. Pulando.`);
      continue;
    }

    const frameOverride = baselineData[target.key]?.frame;
    const baseBounds = frameOverride
      ? { x: frameOverride.x, y: frameOverride.y, width: frameOverride.width, height: frameOverride.height }
      : resolved;

    const bounds = toIntBounds(baseBounds);
    boundsCache.set(target.key, baseBounds);

    const fileName = target.key.toLowerCase().replace(/_/g, '-');
    const outputFile = path.join(outputDir, f"{fileName}.png");

    try:
      await sharp(svgBuffer, { density: 300 })
        .extract(bounds)
        .png()
        .toFile(outputFile)
      console.log(f"  ? {fileName}.png ({bounds.width}x{bounds.height})")
    except Exception as error:
      console.error(f"[layout:slice] Falha ao gerar {target.key}:", error)
  }

  console.log(f"[layout:slice] Sprites exportados em {path.relative(ROOT, outputDir)}")
}
"""
file.write_text(text[:start] + replacement + text[end:], encoding='utf-8')
