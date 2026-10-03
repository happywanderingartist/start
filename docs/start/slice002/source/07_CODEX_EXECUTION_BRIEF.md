# 07 — Codex Execution Brief

## Objective
Continue START Slice 002 Discovery from the already accepted Slice 001 foundation without redoing completed foundation work.

## Before modifying code
1. Read this package in order.
2. Read `context/SLICE_001_ACCEPTANCE.md`.
3. Confirm current Git branch/worktree/status and existing APIs/tests.
4. Do not alter Slice 001 schema/API contracts unless a real incompatibility with the current Slice 002 spec is found and documented.
5. Do not merge or deploy without explicit user approval.

## Required execution order

### Phase A — Wireframe implementation only
Create a reproducible gray wireframe/prototype of the five pages:
- Start Home
- Search Results
- Artist Hub
- Route Detail
- Place Detail

Use current API fixtures or synthetic non-public fixtures only as needed.
Do not add high-fidelity decoration yet.

Deliver:
- screenshots at 390
- 320 pressure-test screenshots
- 768 key-page screenshots
- 1280 Route/Artist/Place layout proof
- interaction notes
- unresolved questions only if they are real product decisions, not implementation preferences

### Phase B — Independent UX review
Review against `08_ACCEPTANCE_CHECKLIST.md`.
Fix:
- hidden high-priority info
- excess cards
- repeated info
- awkward scroll depth
- broken hierarchy
- layout instability
- responsive failures

Only after review is clean should visual styling advance.

### Phase C — Visual layer
Apply `05_VISUAL_DIRECTION_RULES_V3.md` using supplied references:
- preserve low-noise Apple-like structure
- add strong editorial/fandom character selectively
- do not copy reference artwork/people
- one expressive gesture per page
- maintain functional hierarchy

Deliver before implementation approval:
- five 390 high-fidelity screens
- key states
- color/type/tokens
- component variants
- responsive proof
- before/after review notes

### Phase D — Product integration
Connect the approved UI to Slice 001 APIs:
- multi-entity Search
- Artist read
- Route read
- Place read
- Event Search entity target

Do not fake “Start Journey” completion while Slice 003 runtime is absent.
Use a clear deferred/handoff state if needed.

## Must not do
- do not create a feed homepage
- do not add hero photos to Route because an older spec said so
- do not put verification/evidence blocks into default Search rows
- do not create a City top-level product page
- do not create a card wall
- do not build full Event Hub
- do not implement Journey runtime as part of Slice 002
- do not redesign locked Doll face/identity
- do not use reference-person likeness or copyrighted brand material
- do not merge/deploy automatically

## Acceptance evidence
Record:
- Git commit(s)
- screenshots
- viewport sizes
- test results
- review findings + fixes
- any deliberate deviations from spec
- known limits
