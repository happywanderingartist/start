# START — Slice 002 Discovery Design Handoff
Date: 2026-10-02
Status: Design handoff baseline for Slice 002. This package supersedes earlier Discovery/UI assumptions where they conflict.

## Read order
1. `01_CURRENT_STATUS_AND_SCOPE.md`
2. `02_DISCOVERY_INFORMATION_ARCHITECTURE_V3.md`
3. `03_FIGMA_WIREFRAME_SPEC_V3.md`
4. `04_FIGMA_BUILD_SPEC_V1.md`
5. `05_VISUAL_DIRECTION_RULES_V3.md`
6. `06_INTERACTION_RESPONSIVE_STATE_MATRIX.md`
7. `07_CODEX_EXECUTION_BRIEF.md`
8. `08_ACCEPTANCE_CHECKLIST.md`
9. `09_REFERENCE_MANIFEST.md`

## Source of truth hierarchy
When documents conflict, use this order:
1. This package, dated 2026-10-02.
2. Product V2 Search & Discovery contract in `context/05_START_SEARCH_AND_DISCOVERY_SPEC_V2.md`.
3. Slice roadmap and Slice 001 acceptance evidence in `context/`.
4. Older design handoff documents only as historical reference, never as current UI source of truth.

## Critical latest overrides
These decisions are newer than the 2026-10-01 design handoff:
- Route Detail does **not** require a large Hero image.
- Route Detail first viewport does **not** require long prose such as “他们曾在这些地方留下过一些痕迹”.
- Search Results is a choice layer: no long relation summary, verification block, stop count, distance/time, or evidence in the default list.
- Artist Hub uses horizontal city index + vertical city chapters.
- Place Detail must keep address and on-site practical info easy to find; minimalism must not hide important information.
- No card wall. Information hierarchy is created primarily by typography, spacing, alignment, and selective container use.
- Every page gets at most one dominant expressive fandom/editorial gesture.

## Current engineering state
Slice 001 Catalog & Discovery Foundation is technically accepted. Slice 002 formal Discovery UI is not yet implemented. Do not claim Slice 002 completion from existing APIs or engineering screenshots.

## Stop rule
Do not merge, deploy, or proceed into Journey implementation from this package alone.
