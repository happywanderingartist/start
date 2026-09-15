# 星宠主链改版 Design QA

**Source visual truth**

- `C:\Users\15049\.codex\generated_images\01a09c30-c718-7923-bb17-08272b2cdb5c\exec-c24d5d99-c986-4979-9c23-bcc0618db80e.png`
- Source pixels: 853 × 1844. Normalized to 390 × 844 for comparison.

**Implementation evidence**

- `C:\Users\15049\.codex\visualizations\2026\09\13\01a09c30-c718-7923-bb17-08272b2cdb5c\home-star-pet-post-review-final-390x783-browser.png`
- Browser screenshot pixels: 390 × 783. CSS viewport: 390 × 844 at device scale 1; the in-app browser screenshot excludes its 61 px bottom chrome while the page reports a 390 × 844 viewport.
- Bottom navigation focused evidence: `C:\Users\15049\.codex\visualizations\2026\09\13\01a09c30-c718-7923-bb17-08272b2cdb5c\home-star-pet-nav-390x94.png`
- Combined comparison: `C:\Users\15049\.codex\visualizations\2026\09\13\01a09c30-c718-7923-bb17-08272b2cdb5c\home-star-pet-post-review-comparison.png`
- State: homepage, idle mascot, empty prompt.
- Live-route moving state: `C:\Users\15049\.codex\visualizations\2026\09\13\01a09c30-c718-7923-bb17-08272b2cdb5c\live-star-pet-moving-final-390x844.png` (375 × 758 visible page pixels; 390 × 844 CSS viewport, scrollbar and in-app browser chrome excluded).
- Live-route arrival state: `C:\Users\15049\.codex\visualizations\2026\09\13\01a09c30-c718-7923-bb17-08272b2cdb5c\live-star-pet-arrived-390x844.png` (375 × 758 visible page pixels; 390 × 844 CSS viewport).
- Completion state: `C:\Users\15049\.codex\visualizations\2026\09\13\01a09c30-c718-7923-bb17-08272b2cdb5c\live-star-pet-completed-qa-final-390x844.png` (390 × 788 visible page pixels; 390 × 844 CSS viewport).

**Findings**

- Fonts and typography: PingFang/system sans keeps the iOS character of the reference. Heading weight is intentionally a little stronger for Chinese readability; size, wrapping, and hierarchy match the selected direction.
- Spacing and layout rhythm: header, centered mascot, prompt, chips, compact recommendation, and fixed bottom navigation follow the same vertical sequence. The 390 × 844 layout reports no horizontal or vertical overflow.
- Colors and visual tokens: warm off-white background, navy copy, low-saturation lavender controls, pale surfaces, and subtle shadows match the approved palette with clear contrast.
- Image quality and asset fidelity: the mascot is a dedicated 1024 px generated raster asset. Its asymmetric star body, cream patches, forehead lights, raised route point, and three-dot orbit are present; no CSS or placeholder drawing replaces the character.
- Copy and content: the product-specified primary question `今天想沿着谁的星迹出发？`, sample conditions, and the exact seeded route summary remain. The recommendation explicitly says the prototype is pending verification.
- Interaction states: idle breathing, searching movement, and route-found motion are wired to the submit flow. Reduced-motion preferences disable infinite mascot/loading animations and smooth scrolling.
- Focused comparison: the full comparison is readable at 1:1 for mascot, heading, input, chips, and recommendation. The bottom navigation was also checked separately because the in-app browser capture excludes its bottom chrome.
- Live-route density: the companion occupies only the existing progress summary's 58 px third column. It adds no card or explanatory copy, keeps the route and controls primary, and reuses the same generated raster rather than adding another illustration.
- Arrival and completion: arrival feedback lasts 620 ms before advancing; both fixed actions are disabled during that interval. The completion page replaces the previous sparkle icon with a 104 px circular mascot crop instead of adding a new section.

**Comparison history**

1. First pass found P2 spacing drift: the mascot was too high/small and the prompt sat too close to the heading. The mascot slot, scale, vertical offset, and prompt margin were adjusted; post-fix evidence is `home-star-pet-qa-final-390x783-browser.png`.
2. Second pass found P2 asset drift: the isolated mascot omitted the source's external constellation orbit. A new final raster asset with the subtle three-dot orbit replaced it; post-fix evidence is `home-star-pet-qa-comparison-with-orbit.png`.
3. Code-review pass fixed the product copy, added a visible `搜路线` entry, exposed quick-condition selection with `aria-pressed`, completed reduced-motion handling, and added a timed ready-state test.
4. Homepage pass found no actionable P0, P1, or P2 differences. The visible `搜路线` entry and `星迹` wording intentionally follow the product requirements rather than the visual source; remaining differences are P3 illustration and font-rendering nuances between the generated mock and browser rasterization.
5. Live-route pass found a P2 square background edge around the mascot on the completion card. The asset was moved into a circular crop and vertically recentered; post-fix evidence is `live-star-pet-completed-qa-final-390x844.png`.
6. Code review found a P1 restart/arrival race and missing persisted-state validation. Arrival actions now carry their originating stop index, restart is unavailable during the 620 ms transition, pending timers are cancelled on restart/unmount, and invalid or out-of-order localStorage snapshots fall back to a clean route state.
7. Read-only re-review found no remaining Critical, Important, or Minor issue for this scope. The final browser reload was blocked by the local-browser URL policy after the behavior-only fixes; the prior 390 × 844 visual evidence remains representative, while the disabled-control, timing, persistence, cleanup, and completion behavior is covered by the final automated suite.

**Primary interactions tested**

- Entered `南京 安溥`, submitted the prompt, observed the searching state and status copy, then reached `/routes/anpu-nanjing`.
- Verified the recommendation link, quick-condition controls, fixed bottom navigation geometry, and 44 px minimum tap targets.
- Started the route through the map picker, observed the moving mascot, pressed `我已到达`, confirmed the temporary arrival state and disabled controls, then verified the next stop and 1 / 5 progress.
- Advanced through all five stops and verified the compact completion mascot, completion copy, and retained restart/back controls.
- Browser console warning/error check: none.

**Implementation checklist**

- [x] Keep homepage free of a background illustration.
- [x] Keep the mascot small, centered, and state-driven.
- [x] Keep the prompt and recommendation visible in the first viewport.
- [x] Keep recommendation data tied to the seed JSON and marked unverified.
- [x] Preserve the existing route-detail and live-route chain.
- [x] Keep the live mascot inside the existing progress summary instead of adding another card.
- [x] Keep arrival feedback brief and prevent duplicate progress actions.
- [x] Reuse the same mascot asset for moving, arrival, and completion states.
- [x] Reject stale arrival events and malformed persisted progress.

final result: passed
