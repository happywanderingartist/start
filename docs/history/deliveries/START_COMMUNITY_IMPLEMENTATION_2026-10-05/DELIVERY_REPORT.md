# Community prototype delivery

User approved Community visuals: “确认，减少无关解释性文字即可”. Approved layout retained; developer commentary removed, essential non-official/sample and venue status retained.

Implemented: discovery, mine, community detail, event detail; joined/followed/recommended grouping; reversible join/follow/interest; refresh restoration and corrupt-storage recovery; disabled intent for ended/cancelled/incomplete events; existing navigation context and scroll restoration; original route links. No real membership, signup, accounts or backend.

Run `node prototype/server.mjs`; open http://127.0.0.1:4315/community. This is an independent increment, original 4313/4314 deliveries retained. Sessions are origin-specific, no old-record migration claimed. Open Design project independent `community-implemented/community.html` also supports hash routes and source editing. 25 synced files SHA verified; focus fix subsequently re-synced and hash verified.

Fresh validation: 17 state tests (13 original +4 Community), 9 Journey browser, 10 Memory browser, 1 sandbox save, 5 approved ticket, 8 Community browser =50 passing checks. Community browser includes 48 layout samples (8 states ×6 widths), keyboard reversal, image decode, reduced-motion, refresh and event-route-back context. No page errors. Seven protected home/logo/ticket/journey/memory files remain byte-identical. Evidence under evidence/community/.

Review found one P2: follow action moved keyboard focus onto join. Added failing keyboard reversal test; corrected focus to original control; 8 Community browser checks passed. Open Design manual: Mine → recommended Detour → follow → focus remains cancel-follow → back to Mine → followed row updated. Actual screenshot OPEN_DESIGN_VERIFIED.png.

Minor planning adjustment: small fixed demo catalog lives in community-state.js rather than a second fixture file, avoiding a duplicate source and additional preview fetch. Templates retain approved static structure. build-community.mjs is historical one-shot setup; do not rerun over reviewed files. No Git commit claimed (root delivery is not a Git checkout).

Next: Me profile / START Card / Book entry / settings and privacy visuals, await this batch's explicit visual approval before implementation. Doll animation and submission/announcement batches remain pending their own gates.
Independent re-review confirmed keyboard follow/cancel and join/leave fixes; no new important findings.
