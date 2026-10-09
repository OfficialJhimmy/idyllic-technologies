# Design patterns

Analysis of the eight images in `reference/`, read through the four design skills (taste, Emil Kowalski, Impeccable, Apple HIG). These are observations to adapt, not layouts to copy. Nothing here is a spec for pixel values.

Images: GreenFlux, Heliora (two images, plus a zoomed hero), Biotric, Aerra, Greenova, Creaenergy.

## What the references do

1. **Photography first heroes.** Full width landscape photography (wind turbines, solar fields, golden hour) with a large light headline over it. Heliora and GreenFlux keep the headline to two lines and add one short paragraph and two buttons. Aerra, Greenova and Creaenergy set an oversized wordmark or phrase across the bottom or top edge of the hero.
2. **One loud accent, used sparingly.** All six use a single lime on the main button and one stat tile. Idyllic does not use it (see below).
3. **Rounded containers and pill controls.** Large containers around 24 to 32px, pill buttons, and a second button as a white pill with an arrow. The primary pill often carries an arrow in a dark circle.
4. **Pill navigation.** A floating pill bar with the active page as a lighter pill, and the call to action as a separate button on the right.
5. **Stats on imagery.** Translucent or solid tiles over the hero photograph (GreenFlux, Heliora), and bento grids that mix photo tiles with number tiles (Heliora, Greenova, Aerra).
6. **Hairline accordions.** FAQs as thin dividers with plus and minus icons, sometimes numbered (Greenova).
7. **Logo strip under the hero**, in muted grey (Heliora, Biotric).
8. **Numbered or highlighted lists.** Biotric numbers its accordion rows. Aerra shows a service list where the active row is dark and the rest are muted.
9. **Large testimonial portrait** with a row of thumbnail selectors (Creaenergy), and card carousels (Greenova).
10. **Dark footer** with a very large wordmark and a dark call to action band above it (Heliora, Aerra).
11. **Mixed light and dark sections.** Heliora and Creaenergy alternate pale sections with one near black section.
12. **Small pill labels with a dot** above section headings (Heliora, Greenova, Creaenergy).

## What to take, adapt and drop for Idyllic

| Pattern | Decision | Why |
| --- | --- | --- |
| Photography hero with big headline | Take, with Idyllic's real photography in `images/` | Spec section 9 says use supplied photography for heroes, industries and corporate responsibility |
| Lime accent | Drop | Spec and CLAUDE.md forbid it. Idyllic's accent is the logo yellow, kept to the main call to action |
| Pill buttons, arrow in a circle | Take | Matches spec. Pills for controls only, containers stay on the radius scale in `tokens.md` |
| Pill navigation with separate CTA | Take, with the "Visit Marketplace" button as the CTA | Spec section 11 |
| Stat cards on imagery, bento | Take for the four approved stats | Spec section 9. Avoid a generic row of identical number cards: vary tile size and put at least two tiles on real photography |
| Hairline accordions | Take | Spec section 9. Use Radix Accordion for accessibility |
| Logo strip | Take, once per page | The client logos are still needed as vectors. Real files only, no text stand-ins |
| Service list with active row | Take for the six product categories | Gives the category list weight without six identical cards |
| Testimonial portrait and thumbnails | Take only if Idyllic supplies portraits | `images/` has a few headshots. Testimonials stay `draft` until approved |
| Dark footer with giant wordmark | Take | Spec section 9 |
| Giant wordmark across the hero edge | Optional | Fine for one moment. Do not repeat it |
| Prices on service cards (Creaenergy shows one) | Drop | Hard rule: no prices anywhere |
| Fake or invented statistics | Drop | The only stats are the four approved ones. Reference numbers like 95% or 15M+ are not Idyllic's |
| Real client and "trusted by" avatar rows | Drop unless supplied | No invented social proof |
| Product cards | New | The references sell services, Idyllic sells products. Use product plates: soft gradient plate, consistent crop and shadow behind cut out Eaton images, so catalogue pages carry the design as the photography does elsewhere |

## Where the skills disagree with the spec

**Decided by the project owner (Phase 2): follow the skills.** Where the skills and the spec disagree, the skills win from here on. The notes below describe each conflict and what following the skills means.

- **Eyebrow pills and numbered sections.** The spec lists them (section 9, Appendix B). Impeccable bans an eyebrow above a heading outright and discourages section numbers. Taste allows at most one eyebrow per three sections and bans section number labels. Suggested compromise: use the pill label on a few key sections only (hero, industries, FAQs), never above every heading, and use numbers only where order matters (the work process steps).
- **Container radius.** The spec says about 24 to 32px. Impeccable keeps cards at 12 to 16px. The token scale follows both: cards 16px, large page containers 28px, controls fully rounded.
- **Stat tiles.** Impeccable warns against the "big number, small label" template. The four stats are approved content, so they stay, but they should sit on imagery or in a bento with varied tiles, not as four equal boxes.
- **Dots in labels.** Taste bans decorative status dots. Pill labels with a dot should drop the dot unless it carries meaning.
- **One marquee per page.** Taste allows one. The logo strip is that one.

## Motion and interaction principles (Emil Kowalski, Taste)

- Animate only what is seen rarely or what gives feedback. Keyboard actions and anything used constantly (admin navigation, filters, compare toggles) do not animate.
- Strong ease out curves, under 300ms for UI. Button press scales to 0.97. Never animate from scale 0.
- Only transform and opacity, with CSS transitions for anything interruptible.
- One authored moment per page, for example the hero entrance. Not the same fade on every section.
- Respect reduced motion. Hover effects only where hover exists.
- The assistant drawer and compare table need real mobile layouts (bottom sheet, stacked comparison), not shrunken desktop ones.

## Platform principles (Apple HIG, applied to the web)

- Minimum 44px tap targets. All buttons are 44px or taller.
- Clear hierarchy with one primary action per screen.
- Labels above inputs, errors below, never a placeholder as a label.
- Dark and light both supported from the start, following the system.
- Text must survive large text sizes. Layouts use rem and wrap rather than truncate.
- Use standard components (Radix) for accordions, dialogs and the drawer to inherit focus handling.

### What "follow the skills" means in practice

- No eyebrow pills above headings, no decorative dots, and no section numbers except where order matters (the work process steps). Headings carry themselves.
- Card radius 16px, large containers 28px, controls fully rounded. Stat tiles must not be four equal boxes.
- One marquee per page, at most. Stats go on imagery or in a varied bento.
- Where the spec's Appendix B lists these patterns, treat Appendix B as inspiration, not a requirement.
