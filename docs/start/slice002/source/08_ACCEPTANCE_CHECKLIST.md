# 08 — Slice 002 Discovery Design Acceptance Checklist

## A. Product clarity
- [ ] Home primary focus is `Start with [ ... ] ?`
- [ ] Home has no feed/banner wall
- [ ] Search supports Artist / Route / Place / Event
- [ ] Exact Artist hit does not auto-jump
- [ ] Artist Hub clearly exposes cities before deep route details
- [ ] Route shows Stops and Start action immediately
- [ ] Route Map can be reached by normal scroll or `MAP ↓`
- [ ] Place clearly answers why related + where + what to do there
- [ ] Address is not hidden in More/secondary modal

## B. Information hierarchy
- [ ] One dominant task per page
- [ ] Important content not hidden for aesthetics
- [ ] Search rows remain choice-oriented
- [ ] No duplicate long relation story across Search/Route/Place
- [ ] Stop Preview contains only lightweight explanation
- [ ] Full details live in Place or source/evidence layer

## C. Layout / spacing
- [ ] 390 source-of-truth alignment is stable
- [ ] whitespace feels intentional, not empty-by-accident
- [ ] major section spacing is visibly larger than intra-group spacing
- [ ] no arbitrary card wrapping
- [ ] long names survive without breaking hierarchy

## D. Visual quality
- [ ] Apple-like clarity without becoming generic
- [ ] youth/fandom identity visible but controlled
- [ ] reference-inspired editorial character is original
- [ ] <=1 dominant expressive gesture per page
- [ ] no sticker/doodle overload
- [ ] no rainbow system UI
- [ ] no “all-rounded-card” visual language

## E. Interaction
- [ ] Search focus/typing/loading/empty/error exist
- [ ] City index click and scroll sync work
- [ ] Stop Preview opens/closes naturally
- [ ] Stop ↔ Map relationship is understandable
- [ ] reduced-motion mode remains usable
- [ ] touch targets are >=44px

## F. Responsive
- [ ] 320 pressure test passes
- [ ] 390 is clean
- [ ] 768 does not look like a stretched phone
- [ ] 1280 is not a dashboard/card wall
- [ ] Route desktop uses map/stops relationship effectively
- [ ] Artist/Place desktop use editorial splits appropriately

## G. Distinctiveness
- [ ] Home does not look like generic search app
- [ ] Artist Hub has recognizable booklet/index logic
- [ ] Route has recognizable pilgrimage trace
- [ ] Place practical objects feel intentional
- [ ] overall five-page system still feels like one product

## H. Engineering boundary
- [ ] Slice 001 APIs reused rather than rebuilt
- [ ] Slice 003 Journey runtime not falsely claimed
- [ ] Event Hub not prematurely built
- [ ] no merge/deploy without explicit approval
