# 06 — Interaction, States & Responsive Matrix

## Global responsive checkpoints
- 320: Small mobile
- 390: source-of-truth mobile
- 768: tablet
- 1280: desktop

## Global rules
320:
- margin 16
- preserve 44px hit targets
- never shrink important text to save layout
- allow horizontal scroll for CityIndex
- Mini Cards can stack

768:
- keep readable max-width
- do not simply stretch mobile layout
- Artist Hub may split into index + content

1280:
- max overall content roughly 1040–1120
- do not turn into a dashboard/card wall
- Route: left identity/stops + right sticky map
- Place: narrative + practical split
- Artist: editorial split
- Start remains sparse, poster-like

## Start states
- idle
- focus
- typing/composing
- lightweight suggestions
- loading
- results transition
- empty
- error
- reduced motion

IME composing must not submit early.

## Search states
- loading
- mixed results
- exact artist hit
- city query
- empty
- error/retry
- return restoration
- deep-link query state

## Artist states
- single city
- many cities / horizontal index
- active city sync
- empty route in one city
- optional event present
- sticky index

## Route states
- default
- stop pressed
- Stop Preview open
- marker active
- map jump
- start action deferred to Slice 003 when runtime absent
- share
- missing optional practical data

## Place states
- default
- source open
- map/address action
- reference lightbox
- missing media
- missing optional opening/floor data
- partial verification disclosure available without dominating layout

## Reduced motion
When enabled:
- floating suggestions stop drifting
- Doll remains static/very low motion
- route/map relationship uses state change instead of animated travel
- navigation remains functional without animation dependency

## Accessibility baseline
- all critical taps >=44×44
- critical meaning not encoded only by color
- text contrast must be verified in visual phase
- gestures have visible/tappable alternatives
- long labels support 2-line fallback where specified
