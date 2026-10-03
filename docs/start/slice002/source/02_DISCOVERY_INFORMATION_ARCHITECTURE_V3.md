# 02 — Discovery Information Architecture V3

## Main flow
```text
Start Home
  ↓
Search Results
  ├─ Artist → Artist Hub → Route Detail
  ├─ Route  → Route Detail
  ├─ Place  → Place Detail
  └─ Event  → lightweight target for now; full Event Hub in Slice 006

Route Detail
  ├─ START → Journey handoff/deferred action for Slice 003
  ├─ Stop → Stop Preview Sheet
  │          └─ PLACE → Place Detail
  └─ MAP ↓ → Map section

Artist Hub
  └─ City Index → scroll to matching vertical city chapter
```

## Page responsibilities

### Start Home
Purpose: begin discovery.
Primary: `Start with [ ... ] ?`
Secondary: 3 floating suggestions.
Ambient: Doll.
Do not add feed, banner wall, “hot”, or “for you” sections.

### Search Results
Purpose: choose an entity, not explain it.
Default city ordering: Artist → Route → Place → Event.
Exact Artist hit: Artist first; never auto-jump.

Do not expose in default list:
- verification status block
- evidence/source details
- route stop count
- distance/time
- long relation summary
- popularity/fan count

### Artist Hub
Purpose: liked artist → relevant cities → routes.
Hierarchy:
Artist identity → City index → City chapters → Route rows.
Not a biography/dashboard.

### Route Detail
Purpose:
- what route is this?
- which stops?
- how do I start?
- where is the map?

Continuous scroll:
Identity + Actions → Stops → Map + practical meta.

No mandatory large Hero. No first-screen long story.
Stops stay minimal; details open in Stop Preview.

### Place Detail
Purpose:
- where is this?
- why is it related?
- what should I know when I arrive?

Continuous scroll:
Identity → Why → Here → Reference → Related.

Address and practical info must remain easy to find.

## Container semantics
- Bubble = discovery / light recommendation
- Row = action / navigation
- Mini Card = independently understandable practical info
- Plain Type = core identity/content
- Editorial Index = chapter navigation
- Trace = route / journey relationship

Never create containers only for decoration.
