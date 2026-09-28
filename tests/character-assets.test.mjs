import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { PNG } from "pngjs";

let validateCharacterAssets;

try {
  ({ validateCharacterAssets } = await import("../scripts/validate-character-assets.mjs"));
} catch {
  // The first TDD run intentionally reaches this branch.
}

const acceptedChecks = {
  sameFace: true,
  eyesLocked: true,
  faceShapeLocked: true,
  foreheadLocked: true,
  hairLocked: true,
  bodyLocked: true,
  materialLocked: true,
  neckNatural: true,
  notBulky: true,
  outfitSeparated: true,
  accessoryApproved: true,
  referenceAligned: true,
};

function baseRecord(overrides = {}) {
  return {
    id: "girl_base_default_v1",
    character: "girl",
    category: "base",
    state: "default",
    file: "girl/base/girl_base_default_v1.png",
    sourceReference: "R01",
    qaStatus: "accepted",
    checks: acceptedChecks,
    ...overrides,
  };
}

function baseManifest(records, releaseAssets = records.map((record) => record.id)) {
  return {
    version: 1,
    canvas: { width: 1536, height: 1536 },
    anchor: { centerX: 768, footY: 1420 },
    references: {
      R01: "references/R01_girl_final_reference.png",
      R02: "references/R02_boy_final_reference.png",
    },
    candidates: records,
    releaseAssets,
  };
}

async function writePng(file, {
  width = 1536,
  height = 1536,
  transparent = true,
  rgb = false,
  edgeContact = false,
  subjectBottom = 1420,
} = {}) {
  await mkdir(path.dirname(file), { recursive: true });
  const png = new PNG({ width, height });
  png.data.fill(0);
  if (!transparent) {
    png.data.fill(255);
  } else if (width === 1536 && height === 1536) {
    for (let y = subjectBottom - 20; y <= subjectBottom; y += 1) {
      for (let x = 760; x <= 776; x += 1) {
        const offset = (y * width + x) * 4;
        png.data[offset] = 255;
        png.data[offset + 1] = 255;
        png.data[offset + 2] = 255;
        png.data[offset + 3] = 255;
      }
    }
    if (edgeContact) png.data[3] = 255;
  }
  const buffer = PNG.sync.write(png, rgb ? { colorType: 2 } : { colorType: 6 });
  await writeFile(file, buffer);
}

async function createCase({ record = baseRecord(), records, releaseAssets, png = {} } = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), "fan-route-assets-"));
  const selectedRecords = records ?? [record];
  for (const selected of selectedRecords) {
    await writePng(path.join(root, selected.file), png);
  }
  const manifestPath = path.join(root, "character-assets.json");
  await writeFile(manifestPath, JSON.stringify(baseManifest(selectedRecords, releaseAssets), null, 2));
  return { manifestPath, root };
}

async function validate(options) {
  assert.equal(typeof validateCharacterAssets, "function", "validator should export validateCharacterAssets");
  const { manifestPath } = await createCase(options);
  return validateCharacterAssets(manifestPath);
}

function hasError(report, code) {
  return report.errors.some((error) => error.code === code);
}

test("accepts one partly transparent 1536px release asset with the locked anchor", async () => {
  const report = await validate();
  assert.equal(report.valid, true);
  assert.equal(report.releaseAssetCount, 1);
  assert.deepEqual(report.canvas, { width: 1536, height: 1536 });
  assert.deepEqual(report.anchor, { centerX: 768, footY: 1420 });
});

test("rejects an RGB-only PNG", async () => {
  const report = await validate({ png: { rgb: true } });
  assert.equal(hasError(report, "alpha-channel-required"), true);
});

test("rejects an RGBA PNG whose pixels are all opaque", async () => {
  const report = await validate({ png: { transparent: false } });
  assert.equal(hasError(report, "transparency-required"), true);
});

test("rejects a PNG outside the locked 1536px canvas", async () => {
  const report = await validate({ png: { width: 512, height: 512 } });
  assert.equal(hasError(report, "dimensions-mismatch"), true);
});

test("rejects a filename that disagrees with character, category and state", async () => {
  const record = baseRecord({ file: "girl/base/not-the-manifest-name.png" });
  const report = await validate({ record });
  assert.equal(hasError(report, "filename-mismatch"), true);
});

test("rejects a draft path from release assets", async () => {
  const record = baseRecord({ file: "validation/drafts/girl_base_default_v1.png" });
  const report = await validate({ record });
  assert.equal(hasError(report, "draft-path-forbidden"), true);
});

test("rejects a release asset without accepted QA and all true checks", async () => {
  const record = baseRecord({ qaStatus: "pending", checks: { ...acceptedChecks, sameFace: false } });
  const report = await validate({ record });
  assert.equal(hasError(report, "release-not-accepted"), true);
});

test("rejects duplicate candidate IDs", async () => {
  const first = baseRecord();
  const second = baseRecord({ file: "girl/base/girl_base_default_v1.png" });
  const report = await validate({ records: [first, second], releaseAssets: [first.id] });
  assert.equal(hasError(report, "duplicate-id"), true);
});

test("rejects visible pixels touching a canvas edge", async () => {
  const report = await validate({ png: { edgeContact: true } });
  assert.equal(hasError(report, "edge-contact"), true);
});

test("rejects a subject whose lowest visible pixel misses the foot baseline", async () => {
  const report = await validate({ png: { subjectBottom: 1200 } });
  assert.equal(hasError(report, "foot-baseline-mismatch"), true);
});
