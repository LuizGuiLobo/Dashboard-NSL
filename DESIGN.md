# Design System Document

## 1. Overview & Creative North Star: "The Kinetic Workshop"

This design system is engineered to bridge the gap between heavy-duty industrial utility and high-end digital precision. Inspired by the automotive and diesel service sectors, the "Kinetic Workshop" North Star dictates a UI that feels like a calibrated tool—authoritative, dark, and hyper-focused.

To break the "template" look common in dashboard design, we lean into **asymmetric weighting** and **tonal depth**. Rather than using traditional borders to separate information, we use shifts in light and shadow to create "machined" surfaces. The interface should feel like a custom-built dashboard in a high-tech service bay: high-contrast, essentialist, and unyieldingly professional.

---

## 2. Colors

The palette is rooted in deep slates and charcoals to minimize eye strain in high-operational environments, punctuated by high-visibility accents that mirror industrial warning lights and precision indicators.

### Surface Palette
- **Background:** `#0b1326` (The foundational dark canvas)
- **Surface-Container-Lowest:** `#060e20` (Deepest "recessed" areas)
- **Surface-Container-Low:** `#131b2e` (Standard content sections)
- **Surface-Container-High:** `#222a3d` (Raised interaction cards)
- **Surface-Container-Highest:** `#2d3449` (Floating elements and modal backdrops)

### Functional Accents
- **Primary (Amber):** `#ffc174` | **Container:** `#f59e0b` (Primary actions, active machine states)
- **Secondary (Emerald):** `#4edea3` | **Container:** `#00a572` (Positive status, operational health)
- **Tertiary (Gold):** `#fcc455` (Secondary highlights, warnings)
- **Error:** `#ffb4ab` (Critical alerts, stop signals)

### Core Rules
*   **The "No-Line" Rule:** 1px solid borders for sectioning are strictly prohibited. Boundaries must be defined through background color shifts. A `surface-container-low` section sitting on a `background` is sufficient to define edge-play without visual clutter.
*   **Signature Textures:** Use subtle linear gradients on Primary buttons—transitioning from `primary` to `primary_container` (Top-to-Bottom). This adds a "machined metal" sheen that feels premium and tactile.
*   **The Glass & Gradient Rule:** For floating panels or navigation overlays, use `surface-container-highest` with a `backdrop-blur` of 12px and 60% opacity to integrate the UI layers.

---

## 3. Typography

The typographic scale uses a dual-font strategy to balance industrial strength with editorial clarity.

*   **Display & Headlines (Manrope):** Chosen for its geometric precision and modern "tech" feel. Use `display-lg` through `headline-sm` to establish clear, authoritative hierarchies.
*   **Body & Labels (Inter):** The workhorse font. High x-height and exceptional readability for data-heavy dashboard views.

### Hierarchy Application
- **Editorial Punch:** Use `display-md` (Manrope, Semibold) for high-level dashboard metrics (e.g., "Total Units").
- **Instructional Clarity:** Use `title-md` (Inter, Medium) for section headers.
- **Data Precision:** Use `label-sm` (Inter, Regular) for metadata and small captions. Pair with the Amber accent for high-priority status labels.

---

## 4. Elevation & Depth

We eschew traditional drop shadows in favor of **Tonal Layering**, creating a "physical" feel where elements are milled from the same dark material.

*   **The Layering Principle:** Stacking determines importance. Place a `surface-container-lowest` card inside a `surface-container-low` section to create a soft, natural "inset" effect.
*   **Ambient Shadows:** For floating elements like Modals or Context Menus, use a shadow with a 40px blur, 0% offset, and 6% opacity. The shadow color must be `#000000` to ground the element against the deep slate background.
*   **The "Ghost Border" Fallback:** If accessibility requires a border, use the `outline_variant` token at **15% opacity**. This creates a "glint" on the edge of a surface rather than a hard line.
*   **Machined Sharpness:** Maintain `ROUND_FOUR` (0.25rem) across all components to keep the industrial, precision-tool aesthetic.

---

## 5. Components

### Buttons
*   **Primary:** Fill with a vertical gradient (`primary` to `primary_container`). Typography: `label-md` (Inter, Bold, `#472a00`). Subtle 0.25rem rounding.
*   **Secondary:** `surface-container-highest` background with a `Ghost Border`.
*   **Tertiary:** No background. Text uses the `primary` token.

### Cards & Lists
*   **Rule:** Forbid the use of horizontal divider lines.
*   **Implementation:** Separate list items using 8px (Spacing 2) of vertical white space or by alternating background colors between `surface-container-low` and `surface-container-lowest`.

### Input Fields
*   **State:** Unfocused inputs use `surface-container-lowest`. 
*   **Active:** Upon focus, the background shifts to `surface-container-high` with a 1px `Ghost Border` using the Amber `primary` color at 40% opacity.

### Navigation (The "Workshop" Rail)
Use a vertical sidebar with `surface-container-low`. Active states are indicated by a 2px vertical "needle" of Amber (`primary`) on the left edge and a typography shift to `white`.

---

## 6. Do's and Don'ts

### Do
*   **Do** use `surface-container-lowest` for the dashboard "gutters" to create a sense of infinite depth.
*   **Do** use `secondary_container` (Emerald) for all positive metrics; it provides high-contrast legibility against the slate background.
*   **Do** leverage the Spacing Scale strictly (increments of 4px/8px) to maintain "industrial precision."

### Don't
*   **Don't** use pure white text for body copy; use `on_surface_variant` (`#d8c3ad`) to reduce glare and improve the "premium" feel.
*   **Don't** use standard Material Design "Drop Shadows." They feel dated and "pasted on." Rely on color shifts.
*   **Don't** use rounded corners larger than `0.25rem` (ROUND_FOUR). Excessive roundness breaks the industrial automotive aesthetic.