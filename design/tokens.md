# Design tokens

Implemented in `src/app/globals.css` (CSS variables, mapped into Tailwind through `@theme inline`). This file explains where the values come from.

## Derivation

- Logo colours sampled from `images/idyllic-logo.png`: blue `#003E9D`, yellow `#F7C914`, red `#DF2526`.
- `#A2D2FF` (the supplied brand sky) is kept as the primary tint. It is a surface and highlight colour, not a text colour on white.
- Neutrals are tinted toward the logo blue so they sit with it. No pure white or pure black.
- The lime accent from the references is not used.

## Colour roles

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| canvas | #EFF4FA | #0A1220 | Page background |
| surface | #FCFDFF | #111B2E | Cards, inputs, sidebar |
| sunken | #E4ECF6 | #0D1626 | Hover fills, recessed areas |
| ink | #0B1426 | #E8EEF8 | Text |
| ink-muted | #4A5B75 | #9AABC4 | Secondary text |
| line | #D5DFEC | #26344F | Dividers (decorative) |
| line-strong | #6F7F99 | #5A6C8C | Input borders, 3:1 minimum |
| primary | #A2D2FF | #A2D2FF | Brand tint, selection, active nav |
| brand | #003E9D | #003E9D | Logo blue, constant in both modes |
| action | #003E9D | #A2D2FF | Primary buttons, links, focus ring |
| action-hover | #002F78 | #C4E1FF | Hover state of action |
| on-action | #FCFDFF | #0A1220 | Text on action |
| accent | #F7C914 | #F7C914 | CTA only (Book on WhatsApp, main CTA) |
| accent-hover | #E3B700 | #E3B700 | Hover of accent |
| on-accent | #0B1426 | #0B1426 | Text on accent |
| success | #1E7A4C | #5CC98F | Success text and icons |
| error | #C4161C | #FF8A8A | Error text. Darker than the logo red so it passes contrast |
| success-soft, error-soft | #E3F3EA, #FBE6E6 | #12301F, #3A1518 | Message backgrounds |

## Contrast results (WCAG)

Light: ink on canvas 17.4, ink on surface 18.1, ink-muted on canvas 6.5, on surface 6.8, on sunken 6.2, on-action on action 9.5, on-accent on accent 11.7, ink on primary 11.6, error on surface 5.9, success on surface 5.2, error on error-soft 5.1, success on success-soft 4.6, line-strong on surface 4.0.
Dark: ink on canvas 16.1, ink on surface 14.8, ink-muted on canvas 8.0, on surface 7.4, on-action on action 11.8, error on surface 7.6, success on surface 8.4, line-strong on surface 3.2.

All text pairs are at or above 4.5:1. Input borders and the focus ring are above 3:1.

Not checked: the soft status backgrounds in dark mode, and any text over photography (check per hero with its scrim in Phase 4).

## Shape

One rule, used everywhere: controls are fully rounded pills, inputs 12px, cards 16px, large page containers 28px.

## Type

- Headings: Neue Montreal (Light 300, Regular 400, Medium 500, Bold 700), `--nf-heading`, tracking -0.02em, balanced wrapping.
- Body: Manrope (variable), `--nf-body`.
- No italics are loaded. Add the italic woff2 files from `fonts/` if the design needs them.

## Motion

`--ease-out-strong: cubic-bezier(0.23, 1, 0.32, 1)` and `--ease-in-out-strong: cubic-bezier(0.77, 0, 0.175, 1)`. Buttons transition background and transform in 150ms and scale to 0.97 on press. Reduced motion collapses all transitions.

## Browser surfaces

Text selection uses the primary tint, the caret and focus ring use the action colour, scrollbars use line-strong, and tables use tabular numerals.
