# Contract review · 2026-10-05

Independent read-only reviewer inspected the plan, approved homepage and baseline implementation. This is not a rendered implementation acceptance. No original files modified. Review findings to resolve before delivery:

1. Home is now four music/art/film/bookstore entries plus shuffle; old first-two-bubble assertions cannot force hidden obsolete controls. Keep legacy tests unmodified, specify genuine current mappings and add Phase C coverage. If a legacy assertion is no longer applicable, report it explicitly.
2. Route must render existing fixture whyWorthReplicating and summary, labelled as synthetic; do not invent real artist stories.
3. Source panel must receive current Place/Stop/Relation context. Baseline hard-coded data.route.sources[0] and verified wording may misrepresent Nanjing unverified data.
4. Home and Search need composition lifecycle protection; baseline protects Home only. Test Chinese IME in both.
5. Open Design preview is the current milestone. Editable Figma remains the separate formal Phase C gate; Starter MCP limit is unresolved. Do not erase the gate or call the preview final Phase C acceptance.

Reusable behavior: history query/scroll restoration, stale-search generation cancellation, exact-artist choice, unknown-query empty state, independent Nanjing fixtures. Additional checks needed: all five pages at1280, sheet target sizes, contextual evidence, reduced-motion and new-home mapping. Existing 18+4 suite alone cannot prove all of these.
