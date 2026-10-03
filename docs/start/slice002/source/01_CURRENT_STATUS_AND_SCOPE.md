# 01 — Current Status & Slice 002 Scope

## Current status
- Slice 000 baseline: accepted.
- Slice 001 Catalog & Discovery Foundation: technical acceptance passed.
- Search/API foundation supports Artist, Route, Place, Event.
- Formal Discovery UI, responsive behavior, prototype states, Home bubbles/Doll interaction, Route/Place UX, and final visual treatment are not yet delivered.

## Slice 002 pages
Formal Discovery scope contains exactly these five primary pages:
1. Start Home `/`
2. Search Results `/search?q=...`
3. Artist Hub `/artists/:artistId`
4. Route Detail `/routes/:routeId`
5. Place Detail `/places/:placeId`

Event is a Search entity. Full Event Hub belongs to Slice 006.

## Core product positioning
START is first a fandom product, second a map product.

Core value:
- reliable fandom-related place data
- routes that can be directly replicated
- on-site fandom experience
- memory accumulation after the trip

Discovery must answer:
- Who / what am I looking for?
- Which city or route is relevant?
- Where should I go?
- Why is this place related?
- What do I need when I arrive?
- How do I start the route?

## Global information-access rule
High-frequency, decision-critical information must not be hidden for aesthetics.

Target accessibility:
- Search: 0 clicks
- Artist cities: 0 clicks
- Route Stops: 0 clicks
- Start Route CTA: 0 clicks
- Place name / artist relation: 0 clicks
- Route Map: <= 1 scroll or direct `MAP ↓`
- Place address / Photo Spot / Angle: <= 1 normal scroll
- Stop relation summary: 1 click
- Source: 1 click
- Verification detail / full evidence: <= 2 clicks

## Non-goals in Slice 002
- full Journey runtime
- full Doll runtime/state machine
- heavy recommendation algorithm
- Event Hub
- UGC authoring
- social feed
- full map/navigation product
