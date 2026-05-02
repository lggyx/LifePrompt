---
name: Lumina Solarpunk
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#3b494b'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#6a7a7b'
  outline-variant: '#b9cacb'
  surface-tint: '#006970'
  primary: '#006970'
  on-primary: '#ffffff'
  primary-container: '#00f0ff'
  on-primary-container: '#006970'
  inverse-primary: '#00dbe9'
  secondary: '#a90097'
  on-secondary: '#ffffff'
  secondary-container: '#d300bd'
  on-secondary-container: '#fffbff'
  tertiary: '#456800'
  on-tertiary: '#ffffff'
  tertiary-container: '#a2ef00'
  on-tertiary-container: '#456900'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#7df4ff'
  primary-fixed-dim: '#00dbe9'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#ffd7f0'
  secondary-fixed-dim: '#fface8'
  on-secondary-fixed: '#3a0033'
  on-secondary-fixed-variant: '#840076'
  tertiary-fixed: '#a9f900'
  tertiary-fixed-dim: '#94db00'
  on-tertiary-fixed: '#121f00'
  on-tertiary-fixed-variant: '#334f00'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  h1:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  h2:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  h3:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: '0'
  body-lg:
    fontFamily: Sora
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Sora
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-caps:
    fontFamily: spaceGrotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.1em
  mono-data:
    fontFamily: spaceGrotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: '0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

This design system reimagines the aggressive energy of high-tech cyberpunk as an optimistic, airy, and high-performance "Solarpunk" aesthetic. The brand personality is radiant, precise, and visionary. It bridges the gap between biological organicism and advanced hardware, shifting away from "underground" vibes toward a "daylight tech" atmosphere.

The style is a hybrid of **Glassmorphism** and **High-Contrast Minimalism**. By utilizing semi-transparent surfaces and ultra-vibrant neon accents against a pristine, light-flooded environment, the UI evokes a sense of clarity and boundless energy. It targets forward-thinking tech platforms that prioritize both extreme visual interest and effortless readability.

## Colors

The palette is anchored by a "Solar White" base—an off-white with a slight blue-gray undertone to prevent eye strain while maintaining a high-tech feel. 

- **Backgrounds:** Use `#F8F9FA` as the primary canvas and `#FFFFFF` for elevated glass panels.
- **Accents:** Neon Cyan (`#00F0FF`), Neon Pink (`#FF00E5`), and Neon Lime (`#ADFF00`) serve as high-energy functional highlights. These are used sparingly for interactive states, progress indicators, and data visualizations.
- **Contrast:** Typography primarily uses a deep Charcoal (`#1A1A1E`) to ensure accessibility against the light backgrounds, while "Subtle" text uses a cool Slate Gray (`#64748B`).
- **Gradients:** Use soft, multi-stop radial gradients of the neon accents at 5-10% opacity to create "light leaks" in the corners of containers.

## Typography

This design system leverages **Sora** for its technical yet approachable geometric structure. Headlines are aggressive and tight, emphasizing the high-energy nature of the brand. 

For technical metadata, labels, and small UI callouts, **Space Grotesk** is introduced to provide a "hardware-interface" contrast. Use all-caps for labels to maximize the Solarpunk industrial feel. Ensure that large headlines occasionally use the neon primary color to break the monochromatic text flow.

## Layout & Spacing

The layout philosophy is **Airy and Expansive**. It utilizes a 12-column fluid grid with generous margins to evoke a sense of openness. 

- **Rhythm:** A strictly 4px-based baseline grid ensures mathematical precision. 
- **Negative Space:** Use "white space" as a structural element. Elements should feel like they have room to breathe, mimicking a sun-drenched architectural space.
- **Alignment:** Use heavy left-alignment for text blocks to maintain the technical "grid" feel, even in a light and soft environment.

## Elevation & Depth

In this design system, depth is created through **Refraction and Light**, rather than shadows.

1.  **Glass Panels:** Use a background blur (Backdrop Filter: 20px) with a semi-transparent white fill (opacity 60-80%). 
2.  **Inner Glows:** Instead of drop shadows, use 1px inner borders (strokes) in white or 10% primary color to simulate light catching the edge of a glass pane.
3.  **Soft Ambient Occlusion:** When a shadow is necessary for extreme elevation, use a highly diffused (40px-60px blur), low-opacity (5%) shadow tinted with the primary neon color rather than black.
4.  **Layering:** Elements "float" on layers of light. The base is the most opaque, while the highest elements are the most translucent.

## Shapes

The shape language is **Precision-Engineered**. 

- **Corners:** A standard radius of 0.5rem (8px) provides a "friendly-tech" look. 
- **Interaction Elements:** Buttons and tags use a larger `rounded-lg` (16px) or full pill shapes to contrast against the more rigid container grids.
- **Accents:** Incorporate 45-degree "clipped corners" on decorative elements or secondary buttons to give a subtle nod to its cyberpunk heritage without the dark-mode grit.

## Components

- **Buttons:**
    - *Primary:* Solid Neon Cyan with black text for maximum "pop." 
    - *Secondary:* Ghost style with a 1px Neon Pink border and a glass-blur background.
- **Cards:** White glass panels with a 1px border (`#E2E8F0`). On hover, the border transitions to a neon gradient.
- **Inputs:** Ultra-minimal. Underline-only or subtle light-gray fills. The focus state triggers a "glow" effect where the text cursor and bottom border turn Neon Cyan.
- **Chips/Tags:** Small, pill-shaped, and high-contrast. Use Neon Lime for "Success" or "Active" states, providing a vibrant organic feel.
- **Lists:** Clean separation using light-gray horizontal lines. Icons should be monolinear and use the primary neon color.
- **Data Visualization:** Use "Luminescent" strokes. Lines in charts should have a subtle outer glow (neon-colored) to make them appear as if they are projected onto the white surface.