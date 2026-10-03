# 04 — Figma Build Spec V1

## File/page structure
```text
START — Product Design

00_Cover
01_Foundations
02_Components
03_Discovery_390
04_Discovery_Responsive
05_Discovery_Prototype
06_Visual_Exploration
07_Archive
```

## Foundations
Keep minimal:
- Color
- Typography
- Spacing
- Radius
- Grid
- Iconography
- Motion
- Media

Do not build a huge design system before validating the five Discovery pages.

## Auto Layout rule
Use vertical/horizontal Auto Layout for all semantic content.
Absolute positioning is allowed only for:
- Start Home floating suggestions
- Doll spatial layer
- Map trace/markers

## Wireframe type roles
Do not lock final font family yet.

- Display XL: 32/36
- Display L: 28/32
- Title: 20/26
- Body: 16/22
- Body Small: 14/20
- Label: 12/16
- Micro: 11/14

## Component library

### Navigation
- BackButton
- BottomNav
- BottomNavItem
- TextLinkArrow

### Input
- StartPrompt
- SearchField

### Discovery
- SuggestionBubble

### Rows
- SearchResultRow
- RouteRow
- StopRow
- AddressRow
- RelatedRow

### Index
- CityIndexItem
- SectionLabel
- ChapterNumber

### Cards/media
- MiniInfoCard
- ReferenceImage

### Actions
- PrimaryTextCTA
- SecondaryTextCTA

### Overlay
- StopPreviewSheet

### Map
- RouteTrace
- MapMarker

### Doll
- DollPlaceholder / locked approved asset only

## Minimum variants

SearchField:
- Default
- Focus
- Typing
- Loading
- Disabled
- Error

SuggestionBubble:
- Default
- Pressed
- Muted

SearchResultRow:
- Artist
- Route
- Place
- Event
Each: Default / Pressed

CityIndexItem:
- Default
- Active
- Pressed

StopRow:
- Default
- Pressed
- Active
- future reusable Visited

MiniInfoCard:
- Default
- Pressed
- Unavailable

PrimaryTextCTA:
- Default
- Pressed
- Disabled
- Loading

BottomNavItem:
- Default
- Active

MapMarker:
- Default
- Active
- future Visited

## Prototype minimum path
```text
Start Home
→ Focus
→ Search Results
→ Artist Hub
→ Route Detail
→ Stop Preview
→ Place Detail
```

Shortcut links:
- Home Artist Bubble → Artist Hub
- Home Route Bubble → Route Detail
- Search Place → Place Detail
- Artist city index → Scroll To chapter
- Route `MAP ↓` → Scroll To Map
- Stop Preview `PLACE →` → Place Detail

## Motion
- Page transition: 200–240ms ease-out
- Bottom sheet: ~240ms move-in from bottom
- City Scroll To: 250–350ms
- Bubble press: scale 1→0.97, ~100ms
- no spring-heavy / game-like motion
