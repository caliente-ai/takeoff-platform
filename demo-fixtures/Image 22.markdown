---
name: Aetheric Precision
colors:
  surface: '#fbf8ff'
  surface-dim: '#dad9e3'
  surface-bright: '#fbf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f2fd'
  surface-container: '#eeedf7'
  surface-container-high: '#e8e7f1'
  surface-container-highest: '#e3e1ec'
  on-surface: '#1a1b22'
  on-surface-variant: '#424656'
  inverse-surface: '#2f3038'
  inverse-on-surface: '#f1effa'
  outline: '#737688'
  outline-variant: '#c3c5d9'
  surface-tint: '#0051e0'
  primary: '#0048c9'
  on-primary: '#ffffff'
  primary-container: '#005dff'
  on-primary-container: '#eceeff'
  inverse-primary: '#b5c4ff'
  secondary: '#5f5e60'
  on-secondary: '#ffffff'
  secondary-container: '#e5e1e4'
  on-secondary-container: '#656466'
  tertiary: '#9b2d00'
  on-tertiary: '#ffffff'
  tertiary-container: '#c53b00'
  on-tertiary-container: '#ffeae5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b5c4ff'
  on-primary-fixed: '#00164d'
  on-primary-fixed-variant: '#003cac'
  secondary-fixed: '#e5e1e4'
  secondary-fixed-dim: '#c8c6c8'
  on-secondary-fixed: '#1c1b1d'
  on-secondary-fixed-variant: '#474649'
  tertiary-fixed: '#ffdbd0'
  tertiary-fixed-dim: '#ffb59e'
  on-tertiary-fixed: '#3a0b00'
  on-tertiary-fixed-variant: '#842500'
  background: '#fbf8ff'
  on-background: '#1a1b22'
  surface-variant: '#e3e1ec'
typography:
  display-xl:
    fontFamily: Hanken Grotesk
    fontSize: 64px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0em
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: 0em
  metadata-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.08em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  section-gap: 80px
---

## Brand & Style
The design system embodies a "2026-grade" aesthetic, pivoting on the concept of **Architectural Etherealism**. It targets high-end professional environments where precision, clarity, and forward-thinking technology intersect. The UI evokes a sense of hyper-clean, laboratory-grade software that is both powerful and weightless.

The style is a disciplined fusion of **Minimalism** and **Glassmorphism**, characterized by:
- **Optical Clarity:** High-contrast surfaces using "Super White" overlays against deep zinc backgrounds.
- **Precision Engineering:** Every element is defined by razor-thin borders and micro-adjustments rather than heavy shadows.
- **Architectural Depth:** Layering is achieved through varying degrees of backdrop blurs and subtle inner-light leaks, creating a UI that feels like it’s constructed from panes of technical glass.

## Colors
The palette is built on a high-fidelity **Zinc and Blue** foundation. 

- **Primary Blue:** A vibrant, high-energy blue used sparingly for focus and interaction.
- **The Zinc Grayscale:** Ranges from Zinc-50 (Super White) to Zinc-950 (Deep Ink). 
- **Depth System:** Instead of standard fills, the system uses "Translucent Zincs." Surfaces utilize semi-transparent whites with `backdrop-filter: blur(20px)` to create a frosted glass effect that maintains legibility while feeling atmospheric.
- **Light Leaks:** In place of drop shadows, use `1px` inner borders or top-aligned "edge-lights" in Zinc-100 to simulate light hitting the top edge of a glass pane.

## Typography
The typography is architectural and deliberate. **Hanken Grotesk** provides a wide-tracked, modern grotesque feel for headers, creating an expansive, premium atmosphere. 

- **Body Text:** **Geist** is used for its technical, developer-centric precision and exceptional legibility at small sizes.
- **Micro-labels:** **JetBrains Mono** is reserved for metadata and micro-labels. These should be rendered in small caps or uppercase with wide letter-spacing to emphasize the "precision instrument" aesthetic.
- **Rhythm:** Use generous line heights for body copy to maximize whitespace and perceived lightness.

## Layout & Spacing
The layout follows a **Fixed-Fluid Hybrid** model. Large desktop views use a fixed 12-column grid with ultra-wide 48px margins to isolate content and create a "gallery" feel. 

- **Whitespace:** Spacing is intentionally oversized. Content groups are separated by "Section Gaps" to prevent visual clutter.
- **Grid Alignment:** Elements should align to a strict 4px baseline grid. 
- **Sidebars & Headers:** These are fixed-position "Glass Panes" that float over the content layer with a 1px Zinc-200 border and a 24px backdrop blur.

## Elevation & Depth
Elevation is communicated through **Translucency and Edge Definition** rather than shadows.

- **Level 0 (Base):** Zinc-50 solid surface.
- **Level 1 (Cards):** White surface with 0.7 opacity, 1px Zinc-200 border, and `backdrop-filter: blur(12px)`.
- **Level 2 (Overlays/Modals):** White surface with 0.9 opacity, 1px Zinc-300 border, and a subtle 0.5px inner-shadow (white) to simulate a polished edge.
- **The "Light Leak":** For active states, use a subtle top-border highlight (2px) in the Primary Blue color instead of a glow or shadow.

## Shapes
Shapes are disciplined and "Soft-Technical." 

- **Standard Radius:** 0.25rem (4px) for most UI components (buttons, inputs) to maintain a crisp, engineered look.
- **Container Radius:** 0.75rem (12px) for larger cards and glass panels.
- **Interactive Elements:** Use sharp, geometric forms. Avoid pill shapes unless used for specialized status tags to ensure the UI feels architectural rather than organic.

## Components
- **Glass Buttons:** Primary buttons use a high-contrast Zinc-950 fill with white text. Secondary buttons are transparent glass panes with a 1px Zinc-200 border and a 0.5px inner-light-leak on the top edge.
- **Micro-Labels:** Metadata (dates, tags, stats) must use the `metadata-sm` mono type, positioned with precise 8px padding from their parent content.
- **Input Fields:** Minimalist underlines or 0.5px borders. Focus states trigger a 1px Primary Blue bottom border only.
- **Precision Cards:** No drop shadows. Use a 1px Zinc-200 border. On hover, the border darkens to Zinc-400 and the backdrop blur increases slightly.
- **Frosted Sidebar:** A full-height panel with `backdrop-filter: blur(30px)` and a single 1px vertical border on the right edge.