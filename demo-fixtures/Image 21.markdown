---
name: TakeoffAI Technical System
colors:
  surface: '#faf8ff'
  surface-dim: '#d9d9e5'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3fe'
  surface-container: '#ededf9'
  surface-container-high: '#e7e7f3'
  surface-container-highest: '#e1e2ed'
  on-surface: '#191b23'
  on-surface-variant: '#434655'
  inverse-surface: '#2e3039'
  inverse-on-surface: '#f0f0fb'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#5d5e66'
  on-secondary: '#ffffff'
  secondary-container: '#e3e1ec'
  on-secondary-container: '#63646c'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#e3e1ec'
  secondary-fixed-dim: '#c6c5cf'
  on-secondary-fixed: '#1a1b22'
  on-secondary-fixed-variant: '#46464e'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#faf8ff'
  on-background: '#191b23'
  surface-variant: '#e1e2ed'
typography:
  page-title:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  body-base:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-xs:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  mono-data:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  sidebar_width: 240px
  header_height: 48px
  gutter: 1rem
  margin_page: 1.5rem
  row_height_dense: 32px
  row_height_base: 40px
---

## Brand & Style

The design system is a high-density, technical interface that merges the streamlined productivity of modern developer tools with the data-rich authority of financial terminals. It is designed for power users who require rapid information processing and precise control.

The aesthetic follows a **Corporate / Modern** movement with **Minimalist** constraints. It prioritizes utility over decoration, utilizing a "Strict-Grid" approach where every pixel serves a functional purpose. The interface should feel confident, industrious, and "always-on." Visual flair is restricted to functional state changes (focus, active, success/error) rather than decorative gradients or imagery. 

Key principles:
- **High Information Density:** Minimal whitespace between data points to maximize vertical and horizontal screen real estate.
- **Technical Rigor:** Monospaced nuances where data is concerned, paired with a robust system-ui sans for UI controls.
- **Zero Distraction:** No emojis, no stock photography, and no non-functional gradients.

## Colors

The palette is built on a foundation of Zinc grays to create a neutral, "instrument-panel" feel. 

- **Foundation:** The `zinc-50` background provides a subtle contrast against `white` surfaces, allowing cards and panels to "pop" without relying on heavy shadows.
- **Accents:** `blue-600` is used sparingly for primary actions and critical focus states.
- **Semantic Logic:** Status colors use highly legible, standard tones. To maintain the professional aesthetic, status indicators should use "Tinted Badge" logic: a 10% opacity background of the base color with a high-contrast text color (e.g., Emerald-100 background with Emerald-700 text).
- **Interactive States:** Hover states on rows or buttons should utilize a subtle `zinc-100` shift.

## Typography

This design system utilizes a **System Font Stack** (Inter as the primary reference) to ensure the UI feels native to the user's operating system. 

- **Hierarchy:** We use a tight scale ranging from 11px to 22px. For a "Terminal" feel, we avoid oversized display type.
- **Weights:** Use 700 for page-level titles only. 600 is the workhorse for section headers and modal titles. 500 is used for labels to maintain legibility at small sizes.
- **Data Display:** For financial figures, IDs, or code snippets, use a monospaced font (`JetBrains Mono` or `ui-monospace`) at the `13px` size to ensure character alignment in tables.
- **Mobile:** Scale page-titles down to `18px` (headline-lg equivalent) on mobile devices to preserve horizontal space.

## Layout & Spacing

The layout is a **Fixed Sidebar + Fluid Content** model. 

- **Grid Structure:** A 12-column grid is used for dashboard layouts, but the primary logic is "container-based."
- **The Sidebar:** A fixed 240px width left-hand navigation, utilizing a slightly darker background (`zinc-100`) or the `zinc-50` app background to distinguish it from the main workspace.
- **Density:** We employ two density modes. "Dense" (32px rows) for data tables and lists, and "Base" (40px rows) for settings and forms. 
- **Header:** The header is slim (48px) and remains sticky. It houses breadcrumbs, global search, and secondary actions.
- **Mobile Adaptivity:** At the 768px breakpoint, the sidebar collapses into a slide-over drawer, and page margins reduce from 24px to 16px.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layering** and **Low-Contrast Outlines** rather than traditional shadows.

- **Planes:** The background is `zinc-50`. Surfaces (Cards, Modals, Popovers) are `white`.
- **Borders:** Every interactive element and container uses a `1px` border of `zinc-200`. This creates a crisp, architectural structure.
- **Shadows:** Avoid drop shadows on standard UI cards. Shadows are reserved exclusively for "Floating" elements like dropdown menus or modals, using a very soft, diffused `zinc-900/5` tint.
- **Focus:** Depth is signaled by focus rings: `2px` blue-300 ring with a `1px` white offset, ensuring the element feels "lifted" when active.

## Shapes

The shape language is "Varied Geometric," where the radius indicates the level of containment.

- **Small Controls:** Buttons and selection controls use a 6px (`rounded-md`) radius for a precise, sharp look.
- **Containers:** Inputs and list rows use 8px (`rounded-lg`) to provide a softer internal touchpoint.
- **Large Components:** Cards and main content panels use 12px (`rounded-xl`) to define clear boundaries between the app background and the workspace.
- **Functional Shapes:** Badges and user avatars are always `rounded-full` (pill-shaped) to distinguish them from interactive buttons.

## Components

Components follow the **shadcn/ui** philosophy: accessible, unstyled by default, and styled here with a focus on high density.

- **Buttons:** Use a "Flat-Border" style. Primary is solid `blue-600`. Secondary is `white` with `zinc-200` border. No gradients. Text is `13px` weight 500.
- **Inputs:** Solid `white` background, `zinc-200` border. On focus, the border shifts to `blue-600` with the defined ring-offset.
- **Badges:** Use a "Soft-Tint" approach. Background is 10% opacity of the status color; text is 100% opacity of the same color (darkened for legibility if necessary).
- **Cards:** White background, 1px `zinc-200` border, 12px radius. No shadow unless the card is draggable.
- **Data Tables:** These are the core of the system. 0px border-radius on internal cells, 1px `zinc-200` bottom-border on rows. Header cells use `label-xs` in `zinc-500` with uppercase styling.
- **Sidebar Items:** Clear "active" state using a vertical 2px `blue-600` bar on the left edge and a `zinc-100` background fill.