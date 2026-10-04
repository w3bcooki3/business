# Kowal & Daughter — Creative Brief & Directions

> **Demo business.** Kowal & Daughter is a fictional bakery invented for this concept, because no real business details were supplied. Every name, date, price, address, phone number and hour below is placeholder data. It all lives in `shared/data.js`, so swapping in a real client means editing one file.

---

## 1. Creative strategy

### The business (fictional, as defined for this demo)
- **What:** A Polish rye bakery on Nassau Avenue in Greenpoint, Brooklyn.
- **People:** Teresa Kowal opened it in 1991. Her daughter Ania now runs the ovens.
- **Product:** Naturally leavened Polish rye (żytni), seeded rye, chałka, makowiec, sernik and drożdżówki. Pączki on weekends. Holiday pre-orders for Fat Thursday, Easter and Wigilia. Weekday wholesale rye for cafés.
- **Operational truth:** Bread comes out in waves through the morning, and the good loaves sell out. Regulars call ahead to hold one.

### Audience
| Who | What they want | Tone that works |
|---|---|---|
| Long-time Polish Greenpoint regulars | Hours, holiday order deadlines, a phone number | Plain, warm, a little bilingual. Never folksy. |
| Newer neighbours (young families, remote workers) | What's good, when it's fresh, whether it's open now | Confident and specific, with a dry sense of humour |
| Weekend visitors arriving by G train or ferry | Address, hours, what to get | Fast to scan, from a phone |
| Café and restaurant buyers | Wholesale contact | Matter-of-fact |

### Brand opportunity
Most neighbourhood bakery sites are an Instagram grid plus a PDF menu. None of them answers the question a customer actually has at 9:40 on a Saturday: **"Is the rye out yet, and will there be any left?"**

### Most important customer journey
Open on phone → *Is it open? What's fresh right now?* → *Call to hold a loaf* or *Get directions*.
Secondary: *What do they sell, and for how much?* → *Order for a holiday.*

### Central creative opportunity
**Make the bake schedule the brand.** Every bakery has a back-of-house bake sheet. Putting it on the front of the website, live and timed to New York, is useful, ownable and specific to how this place works.

**Facts vs. assumptions:** Everything about the business is fictional demo data. The neighbourhood details are real public context: Greenpoint's Polish community, the G train at Nassau Av, and Polish holiday baking traditions. The design decisions are creative assumptions.

---

## 2. Direction 01 — "Bake Sheet"  ← recommended

**Creative idea.** The website *is* the bakery's daily bake sheet. It borrows the typography of order slips, price boards and back-of-house timetables: times in monospace, names in a warm, slightly wonky serif, and hairline rules instead of boxes. The hero is a live paper ticket that tells you what is out of the oven right now.

**Personality:** Punctual · warm · unfussy · exact · quietly funny

**Color**
| Role | HEX | Use |
|---|---|---|
| Primary (Rye) | `#3B2417` | Type, buttons, dark bands |
| Secondary (Crust) | `#9A4A24` | Secondary accents, links on dark |
| Accent (Stamp red) | `#C3361F` | Times, the rubber stamp, "now" marker. Used sparingly |
| Background (Flour) | `#F3ECDF` | Page |
| Surface (Paper slip) | `#FBF7EF` | Ticket and sheets |
| Text | `#24170F` | Body |
| Muted text | `#6B5646` | Glosses, captions (5.9:1 on Flour) |

**Typography**
- Display and body: **Fraunces** (variable; SOFT and WONK axes). At large sizes the soft, slightly irregular serif reads as hand-made without tipping into "rustic". It also covers the Polish diacritics (ł ż ś ó ą).
- UI, times and prices: **IBM Plex Mono**. This is the voice of the order slip and the oven timer.
- Hierarchy: Display 72–176px, tight leading, opsz 144 → Section titles 44–80px → Item names 22–28px → Body 17–19px → Mono labels 11–13px, uppercase, tracked.

**Layout philosophy.** A 12-column grid with hairline rules acting as the "ledger". Asymmetric splits (7/5, 5/7). Dense where the information is (prices, hours) and generous where the brand speaks (hero, starter). Numbered sections (01–05) with no cards and no shadows except on the single paper ticket. Images are cropped tall (4:5) or wide (16:9), never square-grid.

**Photography.** Documentary, early morning. Tungsten work-lights mixed with blue window light. Hands, flour, peels and racks, shot straight-on or from the bench. No styled flat-lays and no smiling-at-camera portraits. The concept ships with art-directed placeholders that carry the actual shot list.

**Navigation.** A numbered index in monospace (01 Today, 02 Counter…), like the margin of a ledger. A persistent info strip shows open/closed status, address and phone. On mobile: an index sheet plus a fixed thumb bar with **Call · Today · Directions**.

**Interaction.** "Timer, not theatre." A live now-marker on the bake sheet, a one-time rubber-stamp press, the ticket straightening on hover, and rules that draw in as sections arrive. Reduced motion turns all of it off.

**Why it fits.** It solves the real question (what's fresh?), turns an operational habit into a brand signature, and needs no photography budget to look finished.

---

## 3. Direction 02 — "Wycinanki Poster"

**Creative idea.** It draws on Polish paper-cut folk art (wycinanki) and 1970s Polish poster design. The site is flat, bold and celebratory, with huge cut-paper shapes framing each product like a festival poster. Every section is one color field.

**Personality:** Joyful · proud · graphic · loud

**Color:** Primary Cobalt `#1D3FBF` · Secondary Poppy `#E0322B` · Accent Yolk `#F5B800` · Background Cream `#FFF6E4` · Surface White `#FFFFFF` · Text Ink `#14110F` · Muted `#5B5550`

**Typography:** Bricolage Grotesque for display (condensed width, heavy), Literata for body, Bricolage at small size for UI.

**Layout.** Poster-scale blocks with one idea per viewport. A centred, symmetrical folk-art pattern collides with off-axis type. Low density.

**Photography.** Studio, hard flash, products cut out on flat color. Graphic, not documentary.

**Navigation.** A full-bleed color menu triggered by a large folk-pattern button. Sections behave like posters you flip through.

**Interaction.** Paper-cut shapes unfold on scroll, and colors swap per section.

**Risk.** Folk motifs easily become a heritage cliché. It is brilliant for holiday campaigns and weaker for everyday utility (hours, what's fresh).

---

## 4. Recommendation: Bake Sheet

- **Brand fit:** It is literally how the bakery runs (waves of bread, things selling out).
- **Usefulness:** The hero answers "open? fresh? where?" before anyone scrolls.
- **Differentiation:** No neighbouring bakery site has a live bake sheet. It is ownable.
- **Commercial credibility:** It looks finished with or without a photo shoot, and owners can maintain it by editing a list of times and items.
- **Memorable:** A rotated paper ticket with a red stamp. You'd recognise the screenshot without the logo.

## 5. Information architecture
One page, five numbered sections. The business is simple, and five strong sections beat five thin pages.

1. **Today**: hero plus the live bake sheet (primary actions: Call to hold · Directions)
2. **The Counter**: full price list
3. **The Starter**: the story, told through one living number
4. **Order Ahead**: holidays, whole cakes and wholesale
5. **Visit**: hours (today highlighted), address, transit and map link

Anchor links only, so there is no client router and nothing to break on GitHub Pages. Both directions are built as working concept sites (`bake-sheet/`, `wycinanki/`).

## 6. Shot list (to replace placeholders)
1. Rye loaves on the cooling rack, 6:40 AM, window light from left
2. Ania scoring dough, hands only, tungsten work-light
3. Teresa and Ania at the bench, unposed, mid-conversation
4. The starter crock, lid off, overhead
5. The front counter from the door, a Saturday queue, shot at hip height
6. Nassau Ave storefront at opening, wide, overcast morning
