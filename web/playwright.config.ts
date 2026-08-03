import { defineConfig, devices, type PlaywrightTestConfig } from "@playwright/test";

/**
 * Typed explicitly rather than relying on inference through `defineConfig`.
 * Its overloads resolve the generic parameters to `unknown` here, which makes
 * valid context options such as `reducedMotion` look unknown to tsc.
 */
const config: PlaywrightTestConfig = {
  testDir: "./tests",
  fullyParallel: true,
  /**
   * 60s rather than the 30s default.
   *
   * An axe scan of an image-heavy page costs 3-5s on its own, and the matrix
   * runs 96 tests across 8 projects against a single server, so workers
   * contend. Measured in isolation, the slowest case (Firefox on /work) is
   * ~1.9s to load plus ~4.7s to scan; the failures at 30s were queueing, not
   * a slow page. Performance itself is guarded by Lighthouse budgets in CI,
   * which is the right tool for it.
   */
  timeout: 60_000,
  // Guards against a committed `test.only`, which would silently skip the
  // rest of the suite in CI.
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    /**
     * Reduced motion for every test.
     *
     * Without it, axe samples elements mid scroll-reveal and reports their
     * partially-transparent blend as a contrast failure. Those readings are
     * transient and not what WCAG measures, so they are noise that would
     * make the suite flaky. Settling elements at their final opacity also
     * exercises the reduced-motion path real users with that preference get.
     */
    contextOptions: { reducedMotion: "reduce" },
  },
  /**
   * All three engines, plus the viewports most likely to break.
   *
   * Chromium alone was hiding real risk. Safari (WebKit) matters most here
   * because the nav uses `backdrop-filter` and the logo plates use
   * `mix-blend-mode`, both of which have the shakiest history there.
   *
   * The tablet widths are deliberate, not decorative: 810 and 834 sit either
   * side of the `lg` breakpoint at 1024, which is exactly where a layout that
   * only ever got resized in a desktop browser tends to fall apart. iPhone SE
   * pins the 320px floor.
   */
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "iphone-se", use: { ...devices["iPhone SE"] } },
    { name: "iphone-14", use: { ...devices["iPhone 14"] } },
    { name: "ipad", use: { ...devices["iPad (gen 7)"] } },
    { name: "ipad-pro", use: { ...devices["iPad Pro 11"] } },
    { name: "pixel-7", use: { ...devices["Pixel 7"] } },
  ],
  // Tests run against the production build, not the dev server: dev ships
  // extra tooling and unminified output, so a11y and timing there are not
  // what users get.
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
};

export default defineConfig(config);
