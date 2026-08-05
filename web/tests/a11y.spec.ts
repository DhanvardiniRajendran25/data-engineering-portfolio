import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Automated accessibility checks.
 *
 * axe catches roughly 30-40% of real accessibility problems: it verifies
 * contrast, names, roles and structure, but cannot judge whether a focus
 * order makes sense or whether alt text is meaningful. Treat a pass as a
 * floor, not a substitute for a manual screen reader pass.
 */

/**
 * Every route with a distinct rendering pattern, not a sample.
 *
 * All four deep dives are included deliberately. Each introduces something the
 * others do not: PodcastIQ has the agent console, whose `.console-surface`
 * rebinds the theme tokens to a fixed dark palette that nothing else exercises;
 * DocuParse and IMDb each carry a large inline architecture SVG; IMDb also has
 * tables with proportional bars. Testing one deep dive and assuming the rest
 * match is how the console's palette went unchecked.
 */
const ROUTES = [
  "/",
  "/work",
  "/about",
  "/contact",
  "/work/podcastiq",
  "/work/sage",
  "/work/docuparse",
  "/work/imdb-analytics",
  "/work/courtvision",
];

for (const route of ROUTES) {
  test(`${route} has no detectable a11y violations (light)`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      // Third-party iframe content is out of scope. axe reaches into the
      // embedded Drive player and flags Google's own markup (an aria-label on a
      // plain div), which is not ours to fix. Excluding it keeps the suite
      // measuring this site rather than someone else's, and is scoped to that
      // one origin so a genuine violation in our own iframes still fails.
      .exclude('iframe[src*="drive.google.com"]')
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test(`${route} has no detectable a11y violations (dark)`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      // Third-party iframe content is out of scope. axe reaches into the
      // embedded Drive player and flags Google's own markup (an aria-label on a
      // plain div), which is not ours to fix. Excluding it keeps the suite
      // measuring this site rather than someone else's, and is scoped to that
      // one origin so a genuine violation in our own iframes still fails.
      .exclude('iframe[src*="drive.google.com"]')
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

/**
 * WebKit does not include links in the Tab order by default, mirroring Safari,
 * where reaching links by keyboard requires enabling "Press Tab to highlight
 * each item on a webpage". That is platform behaviour, not a defect in this
 * markup, and there is no author-side fix for it.
 *
 * Tests that walk the tab sequence through links are therefore asserted on
 * Chromium and Firefox. The markup itself is still verified everywhere below,
 * so a missing or mistargeted skip link would still fail on every engine.
 */
const TAB_REACHES_LINKS = (browserName: string) => browserName !== "webkit";

test("mobile menu traps focus and restores it on close", async ({
  page,
  browserName,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const trigger = page.getByRole("button", { name: "Open menu" });
  await trigger.click();

  const dialog = page.getByRole("dialog", { name: "Site navigation" });
  await expect(dialog).toBeVisible();

  // Tabbing past the last item must cycle back inside the dialog, never out
  // into the page behind it. The dialog's own items are links, so this only
  // applies where Tab visits links.
  if (TAB_REACHES_LINKS(browserName)) {
    for (let i = 0; i < 12; i++) await page.keyboard.press("Tab");
    const stillInside = await page.evaluate(() => {
      const d = document.getElementById("site-menu");
      return !!d && d.contains(document.activeElement);
    });
    expect(stillInside).toBe(true);
  }

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("skip link exists, targets main, and is first in the tab order", async ({
  page,
  browserName,
}) => {
  await page.goto("/");

  const skip = page.getByRole("link", { name: "Skip to content" });

  // Asserted on every engine: the link must exist and point at a real target.
  await expect(skip).toHaveAttribute("href", "#main");
  await expect(page.locator("#main")).toHaveCount(1);

  // Being *first* in the tab order can only be checked where Tab visits links.
  if (TAB_REACHES_LINKS(browserName)) {
    await page.keyboard.press("Tab");
    await expect(skip).toBeFocused();
  }
});
