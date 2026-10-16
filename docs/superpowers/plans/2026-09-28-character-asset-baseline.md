# Fan-route Character Asset Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce two approved transparent identity masters plus the first four expressions and four actions for each Fan-route cotton doll, with automated file validation and explicit human identity approval.

**Architecture:** Treat R01/R02 as immutable source evidence, generated images as candidates, and only accepted transparent PNGs as releasable assets. A JSON manifest carries canvas, anchor, category, source and QA state; a small Node validator enforces the mechanical contract, while contact sheets and a checklist enforce visual identity.

**Tech Stack:** PNG assets, JSON manifest, Node.js ESM, `node:test`, `pngjs` as a development-only PNG decoder, existing pnpm workflow.

**Spec:** `character-assets/character-asset-spec.md`

## Global Constraints

- R01 and R02 are the only identity references; older process images are prohibited.
- Identity always has priority over outfit, expression, accessory and action.
- Every release PNG is exactly `1536 × 1536`, uses real Alpha, and declares `center_x = 768`, `foot_y = 1420`.
- Girl dog ears, cap and bag are OFF; boy crossbody bag is OFF.
- Assets in `character-assets/validation/drafts/` are rejected evidence and cannot be released.
- No new character setting, mixed-gender outfit, text, watermark, background, floor or shadow.
- Phase one stops after base, four expressions and four actions; outfits, accessories, frontend integration and photo check-in require separate plans.

## Open-source precedent

- [Paper Doll Studio](https://github.com/KhurrumAli1997/paper-doll-studio) usefully converges imported PSD and flat-PNG segmentation into one layer/wardrobe configuration and generates garments per slot from a stable base. Its limitation here is that automatic segmentation and inpainting cannot prove Fan-route face identity, and its local ML stack is far beyond this prototype's scope.
- [paperdoll](https://github.com/fralonra/paperdoll) usefully separates doll, slot and fragment and aligns fragments through anchor/pivot points. Its limitation is explicit: it is stationary and has no animation or transformations.
- [hoho-avatar](https://github.com/HH1st/hoho-avatar) usefully keeps character layers beside a versioned JSON definition with canvas and anchor coordinates. Its limitation is a speaking-avatar eye/mouth model, not a full-body plush character with outfit and route actions.
- [LPC Unity Character Creator](https://github.com/TCLowe1982/LPC-Unity-Character-Creator) usefully imports only manifest-selected assets and previews incomplete animation coverage. Its limitation is a large pixel-art/Unity ecosystem with incompatible art licenses and no direct value for the locked R01/R02 appearance.

**Decision:** Reuse the manifest, slot, anchor and selective-release ideas; do not copy art, ML pipelines, engine code or license-bound assets. Keep identity acceptance human-controlled.

## Review Focus

- A PNG has an Alpha-capable color type but every pixel is opaque: reject it as non-transparent.
- A file is transparent but the visible subject crosses the canvas edge or foot baseline tolerance: reject it.
- Manifest identity, category or filename disagree: reject it before visual review.
- A mechanically valid image introduces dog ears, a bag, a changed face or mixed outfit: human checklist must mark it rejected.
- A sheet or draft is accidentally listed as a release asset: validator must fail because release entries must be single-character accepted files.

---

### Task 1: Asset manifest and mechanical validator

**Files:**
- Create: `character-assets/character-assets.json`
- Create: `scripts/validate-character-assets.mjs`
- Create: `tests/character-assets.test.mjs`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- Consumes: PNG files rooted at `character-assets/` and the constants in `character-assets/character-asset-spec.md`.
- Produces: `validateCharacterAssets(manifestPath: string): Promise<ValidationReport>`, CLI exit code `0` on success or `1` on failure, and `character-assets/qa/report.json`.

- [ ] **Step 1: Add the failing manifest-validation tests**

Add `node:test` cases asserting that the validator rejects: RGB-only PNGs, fully opaque RGBA PNGs, non-1536 canvases, mismatched filenames, draft paths, non-accepted release entries and duplicate IDs. Add a passing fixture with a partly transparent `1536 × 1536` PNG and the exact anchor `{ "centerX": 768, "footY": 1420 }`.

- [ ] **Step 2: Run the focused tests and verify failure**

Run: `node --test tests/character-assets.test.mjs`

Expected: FAIL because the manifest loader and validator do not exist.

- [ ] **Step 3: Define the V1 manifest**

Create `character-assets/character-assets.json` with `version`, `canvas`, `anchor`, `references`, `candidates` and `releaseAssets`. Each asset record must contain `id`, `character`, `category`, `state`, `file`, `sourceReference`, `qaStatus`, and `checks`.

- [ ] **Step 4: Implement the validator and report writer**

Implement `validateCharacterAssets(manifestPath: string): Promise<ValidationReport>` in `scripts/validate-character-assets.mjs`. Decode PNG pixels with `pngjs`, verify dimensions and real transparency, validate manifest/file naming consistency, reject paths under `validation/drafts`, and require `qaStatus: "accepted"` plus all checklist booleans for every release entry.

- [ ] **Step 5: Add the validation command**

Add `pngjs` to `devDependencies` and add `"test:assets": "node --test tests/character-assets.test.mjs && node scripts/validate-character-assets.mjs character-assets/character-assets.json"` to `package.json`.

- [ ] **Step 6: Verify the task**

Run: `pnpm test:assets`

Expected: PASS with zero release assets and six rejected draft candidates recorded in `qa/report.json`.

- [ ] **Step 7: Commit**

```bash
git add character-assets/character-assets.json character-assets/qa/report.json scripts/validate-character-assets.mjs tests/character-assets.test.mjs package.json pnpm-lock.yaml
git commit -m "test: add character asset release gates"
```

### Task 2: Locked transparent identity masters

**Files:**
- Create: `character-assets/girl/base/girl_base_default_v1.png`
- Create: `character-assets/boy/base/boy_base_default_v1.png`
- Modify: `character-assets/character-assets.json`
- Create: `character-assets/qa/contact-sheets/identity-baseline-v1.png`
- Modify: `character-assets/qa/report.json`

**Interfaces:**
- Consumes: R01/R02 references and Task 1 manifest/validator.
- Produces: accepted `girl_base_default_v1` and `boy_base_default_v1` entries used as the sole direct inputs for Tasks 3 and 4.

- [ ] **Step 1: Register two pending master records**

Add the exact output paths, R01/R02 provenance, canvas and anchor values to `candidates`; do not add them to `releaseAssets`.

- [ ] **Step 2: Extract the characters without regenerating the face**

Use background extraction on R01 look 03 for the girl and R02 look 02 for the boy. Remove only the confirmed default-OFF accessories, place the unchanged cutout on the shared canvas, and do not synthesize a new face, hairline or body.

- [ ] **Step 3: Run mechanical validation**

Run: `pnpm test:assets`

Expected: PASS for format, dimensions, transparency, naming and anchor metadata; both records remain pending visual review.

- [ ] **Step 4: Build the identity comparison sheet**

Create `identity-baseline-v1.png` with R01/R02 crops beside each proposed master at matched head height. Include no master changes during this step.

- [ ] **Step 5: Perform Face/Hair/Body/Material Lock review**

Record all checklist booleans in the manifest. A single false value sets `qaStatus` to `rejected`; only two fully accepted records move to `releaseAssets`.

- [ ] **Step 6: Re-run the release gate**

Run: `pnpm test:assets`

Expected: PASS with exactly two accepted release assets and no draft paths.

- [ ] **Step 7: Commit**

```bash
git add character-assets/girl/base character-assets/boy/base character-assets/qa/contact-sheets/identity-baseline-v1.png character-assets/character-assets.json character-assets/qa/report.json
git commit -m "feat: lock transparent character identity masters"
```

### Task 3: Four expression states per character

**Files:**
- Create: `character-assets/girl/expressions/girl_expr_{default,curious,happy_open_eye,surprised}_v1.png`
- Create: `character-assets/boy/expressions/boy_expr_{default,curious,happy_open_eye,surprised}_v1.png`
- Create: `character-assets/qa/contact-sheets/expression-baseline-v1.png`
- Modify: `character-assets/character-assets.json`
- Modify: `character-assets/qa/report.json`

**Interfaces:**
- Consumes: the two accepted base masters from Task 2.
- Produces: eight accepted expression PNGs with identical pose, canvas, anchor, outfit, hair and body.

- [ ] **Step 1: Register eight pending expression records**

Use the exact state names in the filenames and declare the matching base master as `sourceAsset`.

- [ ] **Step 2: Produce expressions with localized edits only**

Keep the master pixels unchanged outside eyebrows, eyelids and mouth regions. Happy must keep both eyes visibly open; surprised may use a tiny rounded mouth but cannot enlarge or move the eyes.

- [ ] **Step 3: Run mechanical validation**

Run: `pnpm test:assets`

Expected: PASS mechanically with all eight records still pending visual review.

- [ ] **Step 4: Build the expression comparison sheet**

Place each character's accepted master beside its four states at identical scale and crop. Make eye spacing, forehead, face contour and hair silhouette easy to compare.

- [ ] **Step 5: Complete the visual checklist per file**

Reject any asset that changes eye structure, face width, forehead, hair outline, body proportion, clothing or material. Add only fully accepted individual PNGs to `releaseAssets`.

- [ ] **Step 6: Verify the release set**

Run: `pnpm test:assets`

Expected: PASS with two base masters and eight accepted expressions.

- [ ] **Step 7: Commit**

```bash
git add character-assets/girl/expressions character-assets/boy/expressions character-assets/qa/contact-sheets/expression-baseline-v1.png character-assets/character-assets.json character-assets/qa/report.json
git commit -m "feat: add locked character expressions"
```

### Task 4: Four action states per character

**Files:**
- Create: `character-assets/girl/actions/girl_action_{idle,wave,walk,photo}_v1.png`
- Create: `character-assets/boy/actions/boy_action_{idle,wave,walk,photo}_v1.png`
- Create: `character-assets/qa/contact-sheets/action-baseline-v1.png`
- Modify: `character-assets/character-assets.json`
- Modify: `character-assets/qa/report.json`

**Interfaces:**
- Consumes: accepted base masters and expressions from Tasks 2 and 3.
- Produces: eight accepted action PNGs sharing canvas, anchor, identity, outfit and material.

- [ ] **Step 1: Register eight pending action records**

Declare the matching accepted base master as `sourceAsset`; keep every record outside `releaseAssets` until review.

- [ ] **Step 2: Produce one action at a time from the master**

Generate or edit `idle`, `wave`, `walk` and `photo` independently from the same base, never from the previous action. Permit minimal hair movement but no face regeneration, new props or accessories.

- [ ] **Step 3: Normalize canvas and anchor**

Place each result on `1536 × 1536`, align the character center to `768`, and align the standing/contact foot to `1420`; keep raised limbs and hair inside the canvas.

- [ ] **Step 4: Run mechanical validation**

Run: `pnpm test:assets`

Expected: PASS mechanically with all eight action records pending visual review.

- [ ] **Step 5: Build and review the action comparison sheet**

Compare every pose with its master at equal head size. Reject any changed face geometry, eye construction, hair identity, head/body ratio, neck treatment, material or default accessory state.

- [ ] **Step 6: Verify the release set**

Run: `pnpm test:assets`

Expected: PASS with exactly 18 release assets: 2 base, 8 expression and 8 action files.

- [ ] **Step 7: Commit**

```bash
git add character-assets/girl/actions character-assets/boy/actions character-assets/qa/contact-sheets/action-baseline-v1.png character-assets/character-assets.json character-assets/qa/report.json
git commit -m "feat: add locked character action baseline"
```

### Task 5: Phase-one audit and handoff

**Files:**
- Create: `character-assets/qa/phase-one-acceptance.md`
- Modify: `README.md`
- Modify: `package.json`

**Interfaces:**
- Consumes: the complete release manifest and QA evidence from Tasks 1–4.
- Produces: a reproducible phase-one acceptance record and repository-wide check command.

- [ ] **Step 1: Add phase-one completeness assertions**

Extend `tests/character-assets.test.mjs` to require exactly two characters, the four specified expression states and the four specified action states for each character, with no unrecognized state in phase one.

- [ ] **Step 2: Run the focused tests and verify the new assertion fails if any state is missing**

Run: `node --test tests/character-assets.test.mjs`

Expected: FAIL until all 18 accepted assets are present.

- [ ] **Step 3: Document the acceptance evidence**

Create `phase-one-acceptance.md` listing every accepted file, its source reference, checklist result, known limitations and the exact validator command. State explicitly that outfits/accessories, frontend integration and photo check-in are not part of phase one.

- [ ] **Step 4: Add asset validation to the main check**

Update `package.json` so `pnpm check` runs `pnpm test:assets` before the existing typecheck, Vitest, build and worker tests.

- [ ] **Step 5: Run full verification**

Run: `pnpm check`

Expected: PASS for asset validation, typecheck, Vitest, production build and worker tests.

- [ ] **Step 6: Verify the target viewport manually**

Open the existing prototype at `390 × 844` and confirm no runtime UI changed in this phase. Record the result in `phase-one-acceptance.md`.

- [ ] **Step 7: Commit**

```bash
git add character-assets/qa/phase-one-acceptance.md tests/character-assets.test.mjs README.md package.json
git commit -m "docs: accept character asset baseline"
```

## Deferred plans

After phase one is accepted, write separate plans for: five outfits plus independent accessories; the data-driven React character renderer replacing `StarPet`; expanded route, AI-dialog and photo-check-in motion states. Do not start those plans using rejected or pending assets.
