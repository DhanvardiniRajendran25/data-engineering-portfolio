import { test, expect } from "@playwright/test";

/**
 * Header behaviour across the width range, asserted rather than eyeballed.
 *
 * The pill was originally collapsed below 1024px, which put a hamburger on
 * every tablet and every part-width desktop window despite the full nav
 * measuring roughly 420px. The breakpoint is now 640px. These widths cover
 * both sides of it plus the common device sizes, so moving it again without
 * measuring will fail here.
 *
 * Three properties hold at every width:
 *   1. Nothing overflows horizontally.
 *   2. Exactly one navigation affordance is visible, never both and never
 *      neither. Showing both is the classic breakpoint-overlap bug.
 *   3. The visible affordance is the one the width calls for.
 */

const PILL_FROM = 640;

const WIDTHS = [320, 360, 390, 414, 600, 639, 640, 700, 768, 820, 900, 1024, 1280, 1600];

for (const width of WIDTHS) {
  test(`header is correct at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");

    const pill = page.locator('nav[aria-label="Primary"]').first();
    const menuButton = page.getByRole("button", { name: "Open menu" });

    const pillVisible = await pill.isVisible();
    const menuVisible = await menuButton.isVisible();

    // Exactly one, never both, never neither.
    expect(
      pillVisible !== menuVisible,
      `at ${width}px: pill=${pillVisible} menu=${menuVisible}`,
    ).toBe(true);

    expect(pillVisible, `pill visibility at ${width}px`).toBe(width >= PILL_FROM);

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    // 1px of slack for subpixel rounding on fractional device ratios.
    expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(1);
  });
}
