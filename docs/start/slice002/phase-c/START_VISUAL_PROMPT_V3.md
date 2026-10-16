# START — young travel magazine / guided V3

Scope: guided home visual revision plus a ticket and typography specimen. No product architecture change, new runtime, real API integration or navigation destination. Existing code remains unchanged.

## Reference translation

P1: thin, irregular handwritten Chinese and a small fluorescent marker accent; apply only to noncritical marginalia, never addresses, sources or long copy. P2 green typography: natural marker strokes, shared handwritten character between Chinese and Latin; general labels use a restrained marker gothic, important functional copy remains legible. P3: open-book spread as a container, not copying the golfer or composition. P4–5: sparse freehand movement lines and tiny stars; no sticker field. P6–7: warmth and imperfect hand-made quality, not copying commercial characters/illustrations. P8: editorial typography and colored sections, not a home feed/card wall. P9: paper ticket, perforation dividers and aligned metadata; no fake event ticket, barcode, authorization or purchase functionality.

## Detailed design prompt

Design START as a living travel magazine through which a fan can discover different cities and places. Keep the accepted search-first home and three recommendation bubbles. Build a coherent cream-paper spread beneath the bubbles with a very subtle central fold and thin layered page edges. Book treatment lives mostly in the lower half; search stays clear above it. Use restrained forest-green ink, sky blue, butter yellow, mint and dusty pink throughout; repeat these colors rather than inventing new palettes per element. Keep photography, marginalia, typography and future movement within this same printed/handmade vocabulary. No gradients or full-screen collage.

Correct the awkward stacked ST/ART logo into a compact, continuous readable lowercase start silhouette with a single small sparkle. Treat this as a brand exploration; app-icon variants and custom lettering are not yet accepted. Increase Start with from the prior 31 px base to about 42 px, preserving gentle baseline and rotation rhythm. Use four coordinated fills from the shared palette, a fine dark contour, and only two small accents. Keep the search question clearly visible below it.

Typography roles: display lettering only for Start with; LXGW Marker Gothic for general Chinese/Latin labels and input; LXGW WenKai TC / Patrick Hand for sparse, noncritical handwritten notes; neutral sans fallback for dense technical or legal copy later. Do not claim these fonts are the exact fonts in the references. Current Figma fonts are verified; simplified-Chinese glyph coverage needs a real-font check before web shipping.

Ticket specimen: cream paper, rounded bite-like edge cutouts, thin dashed separators, editorial title/city header, compact aligned metadata and a small blue accent section. Clearly mark design specimen, not a real reservation or ticket. Do not add it to the homepage as a new product module. Future route/place compositions may borrow paper sections, folios and page hierarchy, but do not rebuild five pages in this bounded iteration.

## Reference Before Implementation

Github search inspected googlefonts/zcool-kuaile and lxgw/LxgwWenKai, plus Google/fonts Marker Gothic metadata and OFL. Reusable benefit: open font construction and shared CJK/Latin styling, with explicit redistribution terms; limitation: neither reproduces the user's original display artwork, and glyph size/coverage/reading density require testing. ZCOOL has maintenance/licensing-history issues noted in Github and is not selected. Marker Gothic is selected as a Figma-available marker-style approximation; font binaries are not vendored. Font metadata/license and WenKai README are saved alongside this note. No copied application code.

## Verification

Actual Figma screenshot at 390×844; confirm title and input do not clip, book spine does not obscure labels, general labels readable, logo no longer splits into ST/ART, and all new artwork remains native editable layers. Retain previous home and component sources for rollback. This is a guided visual draft, not complete Phase C acceptance.
