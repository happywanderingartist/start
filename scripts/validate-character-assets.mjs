import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";

const LOCKED_CANVAS = { width: 1536, height: 1536 };
const LOCKED_ANCHOR = { centerX: 768, footY: 1420 };
const FOOT_TOLERANCE = 8;
const CATEGORY_FOLDER = { base: "base", expression: "expressions", action: "actions" };
const CATEGORY_PREFIX = { base: "base", expression: "expr", action: "action" };
const PHASE_ONE_RELEASE_IDS = [
  "girl_base_default_v1",
  "boy_base_default_v1",
  ...["girl", "boy"].flatMap((character) => ["default", "curious", "happy_open_eye", "surprised"].map((state) => `${character}_expr_${state}_v1`)),
  ...["girl", "boy"].flatMap((character) => ["idle", "wave", "walk", "photo"].map((state) => `${character}_action_${state}_v1`)),
];

function pushError(errors, code, message, assetId) {
  errors.push({ code, message, ...(assetId ? { assetId } : {}) });
}

function expectedIdentity(record) {
  const prefix = CATEGORY_PREFIX[record.category];
  const folder = CATEGORY_FOLDER[record.category];
  if (!prefix || !folder) return null;
  const id = `${record.character}_${prefix}_${record.state}_v1`;
  return { id, file: `${record.character}/${folder}/${id}.png` };
}

function hasAcceptedChecks(record) {
  const values = Object.values(record.checks ?? {});
  return values.length > 0 && values.every((value) => value === true);
}

export function validatePhaseOneCoverage(manifest) {
  const releaseIds = new Set(Array.isArray(manifest.releaseAssets) ? manifest.releaseAssets : []);
  const missing = PHASE_ONE_RELEASE_IDS.filter((id) => !releaseIds.has(id));
  const expected = new Set(PHASE_ONE_RELEASE_IDS);
  const unexpected = [...releaseIds].filter((id) => !expected.has(id));
  const errors = [];
  if (missing.length > 0) errors.push({
    code: "phase-one-coverage-missing",
    message: `Missing required phase-one release assets: ${missing.join(", ")}`,
  });
  if (unexpected.length > 0) errors.push({
    code: "phase-one-coverage-unexpected",
    message: `Unexpected phase-one release assets: ${unexpected.join(", ")}`,
  });
  return errors;
}

function inspectPixels(png) {
  let hasTransparency = false;
  let minX = png.width;
  let minY = png.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const alpha = png.data[(y * png.width + x) * 4 + 3];
      if (alpha < 255) hasTransparency = true;
      if (alpha === 0) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  return { hasTransparency, bounds: { minX, minY, maxX, maxY } };
}

async function inspectCandidatePng(root, manifest, record, errors) {
  const assetPath = path.resolve(root, record.file);
  let buffer;
  try {
    buffer = await readFile(assetPath);
  } catch {
    pushError(errors, "file-missing", `Missing candidate PNG: ${record.file}`, record.id);
    return;
  }

  let png;
  try {
    png = PNG.sync.read(buffer);
  } catch {
    pushError(errors, "png-invalid", `Cannot decode candidate PNG: ${record.file}`, record.id);
    return;
  }

  if (png.width !== manifest.canvas.width || png.height !== manifest.canvas.height) {
    pushError(errors, "dimensions-mismatch", `Expected ${manifest.canvas.width}x${manifest.canvas.height}, received ${png.width}x${png.height}`, record.id);
  }

  const colorType = buffer[25];
  if (colorType !== 4 && colorType !== 6) {
    pushError(errors, "alpha-channel-required", `PNG color type ${colorType} does not provide a direct alpha channel`, record.id);
    return;
  }

  const { hasTransparency, bounds } = inspectPixels(png);
  if (!hasTransparency) {
    pushError(errors, "transparency-required", "At least one pixel must be transparent", record.id);
  }
  if (bounds.maxX < 0) {
    pushError(errors, "visible-subject-required", "Release PNG has no visible subject pixels", record.id);
    return;
  }
  if (bounds.minX === 0 || bounds.minY === 0 || bounds.maxX === png.width - 1 || bounds.maxY === png.height - 1) {
    pushError(errors, "edge-contact", "Visible subject pixels must not touch the canvas edge", record.id);
  }
  if (Math.abs(bounds.maxY - manifest.anchor.footY) > FOOT_TOLERANCE) {
    pushError(errors, "foot-baseline-mismatch", `Lowest visible pixel ${bounds.maxY} must be within ${FOOT_TOLERANCE}px of footY ${manifest.anchor.footY}`, record.id);
  }
}

export async function validateCharacterAssets(manifestPath) {
  const absoluteManifestPath = path.resolve(manifestPath);
  const root = path.dirname(absoluteManifestPath);
  const manifest = JSON.parse(await readFile(absoluteManifestPath, "utf8"));
  const errors = [];
  const candidates = Array.isArray(manifest.candidates) ? manifest.candidates : [];
  const releaseIds = Array.isArray(manifest.releaseAssets) ? manifest.releaseAssets : [];

  if (manifest.canvas?.width !== LOCKED_CANVAS.width || manifest.canvas?.height !== LOCKED_CANVAS.height) {
    pushError(errors, "canvas-contract-mismatch", "Manifest canvas must be 1536x1536");
  }
  if (manifest.anchor?.centerX !== LOCKED_ANCHOR.centerX || manifest.anchor?.footY !== LOCKED_ANCHOR.footY) {
    pushError(errors, "anchor-contract-mismatch", "Manifest anchor must be centerX 768 and footY 1420");
  }

  const seen = new Set();
  for (const record of candidates) {
    if (seen.has(record.id)) pushError(errors, "duplicate-id", `Duplicate candidate id: ${record.id}`, record.id);
    seen.add(record.id);
    const normalizedFile = record.file.replaceAll("\\", "/");
    if (!normalizedFile.startsWith("validation/drafts/")) {
      await inspectCandidatePng(root, manifest, record, errors);
    }
  }

  for (const id of releaseIds) {
    const record = candidates.find((candidate) => candidate.id === id);
    if (!record) {
      pushError(errors, "release-candidate-missing", `Release id has no candidate: ${id}`, id);
      continue;
    }
    const normalizedFile = record.file.replaceAll("\\", "/");
    if (normalizedFile.startsWith("validation/drafts/")) {
      pushError(errors, "draft-path-forbidden", "Draft files cannot be released", record.id);
    }
    if (record.qaStatus !== "accepted" || !hasAcceptedChecks(record)) {
      pushError(errors, "release-not-accepted", "Release assets require accepted QA and all checks true", record.id);
    }
    const expected = expectedIdentity(record);
    if (!expected || record.id !== expected.id || normalizedFile !== expected.file) {
      pushError(errors, "filename-mismatch", `Manifest fields must resolve to ${expected?.file ?? "a supported category"}`, record.id);
    }
  }

  if (manifest.phaseOneComplete === true) errors.push(...validatePhaseOneCoverage(manifest));

  const report = {
    valid: errors.length === 0,
    manifest: path.basename(absoluteManifestPath),
    canvas: manifest.canvas,
    anchor: manifest.anchor,
    candidateCount: candidates.length,
    rejectedCandidateCount: candidates.filter((record) => record.qaStatus === "rejected").length,
    releaseAssetCount: releaseIds.length,
    errors,
  };

  const reportPath = path.join(root, "qa", "report.json");
  await mkdir(path.dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  return report;
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  const manifestPath = process.argv[2];
  if (!manifestPath) {
    console.error("Usage: node scripts/validate-character-assets.mjs <manifest-path>");
    process.exitCode = 2;
  } else {
    const report = await validateCharacterAssets(manifestPath);
    console.log(JSON.stringify({ valid: report.valid, candidates: report.candidateCount, released: report.releaseAssetCount, errors: report.errors.length }));
    if (!report.valid) process.exitCode = 1;
  }
}
