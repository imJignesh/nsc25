# Performance & Scroll Optimization Fixes

## 1. Fixed Section Energy Efficiency
Fixed-position elements are expensive because the browser must redraw them constantly during scroll. We have optimized the first two sections by hiding them when they are not in the viewport.

- **Hero Section**: The fixed video and background container are set to `visibility: hidden` once you scroll past them.
- **Highlights Section**: The sticky/fixed overlay is hidden when the section is passed.
- **Blueprint Section**: The sticky icon holder on the right is hidden when the section is passed.

## 2. Scroll Robustness & Navigation
The following improvements ensure that animations and layouts work correctly regardless of how you navigate the page:

- **Anchor Link Support**: Clicking on navigation links (like "Highlights", "Blueprint", etc.) now uses Lenis smooth scrolling and triggers a `ScrollTrigger.refresh()` upon arrival to ensure triggers are perfectly aligned.
- **Deep Linking**: If the page is loaded directly at a section (e.g., `yoursite.com/#blueprint`), the scroll position is correctly initialized, and the active highlighters are updated immediately.
- **Resize Handling**: Added a global refresh on window resize to prevent layout breaking when flipping between portrait and landscape (or resizing browser).
- **Initial Load Calculation**: Highlighters for the Blueprint and Roadshow sections now run their distance calculations immediately on page load, so they highlight the correct item even if the page starts in the middle.

## 3. Implementation Details
- Used `visibility: hidden` instead of `display: none` for performance-hiding, as `display: none` can cause layout thrashing while `visibility: hidden` simply tells the GPU to stop drawing the layer.
- Added `onRefresh` hooks to continuous monitoring functions (`checkBlueprint`, `checkRoadshow`) to handle scroll triggered by external events.
- Integrated `lenis.scrollTo` into the primary navigation flow for unified scroll management.
