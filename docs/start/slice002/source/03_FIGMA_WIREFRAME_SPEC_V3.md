# 03 — Figma Wireframe Spec V3

Base mobile viewport: **390 × 844**

## Global geometry
- Left/right margin: 24
- Small-mobile margin (320): 16
- Content width @390: 342
- Top safe area reference: 47
- Bottom safe area reference: 34
- Bottom navigation visual height: 56
- Base spacing unit: 8
- Tight relationship: 8–12
- Normal internal gap: 16–24
- Section gap: 32–48
- Major editorial chapter gap: 56–72
- Minimum interactive hit area: 44×44

## 1. Start Home

### Layers
```text
StartHome
├─ BrandMark
├─ PromptGroup
├─ FloatingSuggestionLayer (absolute)
├─ DollLayer (absolute)
└─ BottomNav
```

### Geometry @390
BrandMark:
- x 24
- y 62
- h ~24

PromptGroup:
- x 55
- y 190
- w 280
- vertical auto layout
- gap 8
- center aligned

Search field:
- w 248
- h 52
- radius 14
- horizontal padding 16
- vertical padding ~14

Floating suggestions:
- A: x32, y350, min-w96, h42
- B: x226, y420, min-w116, h46
- C: x68, y552, min-w112, h42

Doll area:
- x224
- y510
- visual width ~78
- height follows locked asset proportions
- must not overlap Prompt, BottomNav, or suggestion text

BottomNav:
- x0
- y754
- w390
- total reserved h90
- visual h56
- items: Start / Community / Me

### Focus state
- PromptGroup y≈124
- Bubble opacity ≈30–45%
- Doll pauses and reduces prominence
- Suggestion list appears under prompt, max 5 rows
- no card wall

## 2. Search Results

Page:
- vertical auto layout
- top padding ~55
- L/R 24
- bottom 110

SearchHeader:
- h48
- horizontal auto layout
- gap8
- Back 44×44
- QueryField fill, h44, radius12

Section:
- label
- 8 gap
- result rows
- 28–32 gap before next section

ResultRow:
- min h56
- no card background by default
- left content fill
- right arrow ~20

Entity presentation:
```text
ARTISTS
Artist Name                       →

ROUTES
01   Artist · CITY                →

PLACES
•    Place Name                   →

EVENTS
10.21   LIVE · CITY               →
```

## 3. Artist Hub

Page:
- vertical auto layout
- top ~55
- L/R 24
- bottom 48

TopNav:
- h44

ArtistIdentity:
- margin top 24
- artist display size role 32/36
- no biography block

CityIndex:
- margin top 28
- h44
- horizontal auto layout
- gap24
- horizontal scroll, never wrap
- active = weight / fine underline / later hand-mark
- sticky after scrolling

CityChapter:
- first begins ~48 after index
- chapter-to-chapter gap 64
- structure:
  `01`
  `TAIPEI`
  route rows

RouteRow:
- h60
- number width 28
- route title fill
- arrow ~20
- no distance/time/evidence in row

## 4. Route Detail

Page:
- vertical auto layout
- top 55
- L/R24
- bottom56

TopNav:
- h44

RouteIdentity:
```text
ARTIST
CITY
ROUTE NAME
```
- label roles 12–14
- route name role 28/32
- internal gap ~6

Actions:
- margin top24
- horizontal
- `START →` primary
- `SHARE ↗` secondary
- hit area >=44
- not a giant filled CTA

RouteSection:
- margin top56
- header:
  `ROUTE                     MAP ↓`
- header h32

StopRow:
- h64
- number width28
- name fill, max2 lines
- arrow20

Map:
- gap after last stop 64
- `MAP` label
- 16 gap
- map frame 342×280
- only simplified map / trace / numbered markers in wireframe

Meta:
- gap16
- e.g. `4 STOPS   3.2 KM   50 MIN`

Bottom CTA:
- margin top40
- `START →`
- hit area >=44
- bottom breathing space ~48

### Stop Preview Sheet
- width390
- hug height
- min280 / max360
- top radius24
- L/R padding24
- top20
- bottom includes safe area
- content:
  stop number
  place name
  artist · year
  1 short relation summary (max2 lines)
  `SOURCE ↗` + `PLACE →`

## 5. Place Detail

Page:
- vertical auto layout
- top55
- L/R24
- bottom64

Identity:
```text
PLACE NAME
CITY

Artist · Year
```
- place role 28/32
- city role 12–14
- relation meta 14

WHY:
- margin top40
- label
- 12–16 gap
- relation summary max3 lines
- 16 gap
- `SOURCE ↗`

HERE:
- margin top48
- label
- 16 gap

MiniCard row @390:
- total 342
- gap12
- two cards 165×96
- internal padding14
- examples:
  PHOTO SPOT / Left Window
  ANGLE / Front

AddressRow:
- margin top16
- h60
- full-row tap
- location icon + address + arrow

Optional practical:
- only show real data
- plain type, not extra cards
- e.g. OPEN / FLOOR

Reference:
- margin top48
- 1–2 images only
- approx 160 each, h120–140
- not a photo wall

Related:
- margin top48
- row h60
- max 2–3 strongly related items
