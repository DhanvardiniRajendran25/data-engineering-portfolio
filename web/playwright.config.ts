import { defineConfig, devices, type PlaywrightTestConfig } from "@playwright/test";

/**
 * Typed explicitly rather than relying on inference through `defineConfig`.
 * Its overloads resolve the generic parameters to `unknown` here, which makes
 * valid context options such as `reducedMotion` look unknown to tsc.
 */
const config: PlaywrightTestConfig = {
  testDir: "./tests",
  fullyParallel: true,
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
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
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
