# Independent implementation review · 2026-10-05

Independent reviewer inspected source and rendered 390 Home/Search/Artist/Route/Place, 768 Home and 1280 Artist/Route/Place. This was an implementation review, not production, API, Figma or full accessibility acceptance.

Important finding: endsWith(id) accepted /places/not-real-<known-id>. Both Place rendering and ADDRESS lookup now use exact placeUrl equality. Added checks reject prefixed/suffixed unknown IDs and confirm no address renders.

Visual findings: initial refinement had too much vertical spacing, visible artwork matte and generic line navigation icons. Recomputed two-column geometry against approved 853×1844 source. CSS darken presentation avoids rectangular matte; native navigation shows original art. Secondary page headers now use the subsequently user-confirmed transparent START logo; see prototype/BRAND_ASSETS.md. Original image and locked masters remain unchanged.

Deep-link asset loading and MAP visibility initially failed. Local server resolves index assets from root for pathname routes; static source keeps relative links for Open Design. MAP target treatment brings map into view. No original assertion was weakened; failed evidence retained.

Final source changes: 18 original regression +4 original UX +9 added Phase C checks passed. Added checks include all five pages at1280, immutable home, composition, current verified/unverified context, unknown IDs, modal targets/focus and reduced motion. Evidence: delivery-logo-final/ and phase-c-extra/.

Limitations: artwork remains bitmap rather than editable vector lettering; controls/layout are editable. Paper texture approximated by approved paper color. Figma and formal Phase C gate remain pending because of live Starter MCP limit. Historical grayscale test metadata is not visual acceptance.