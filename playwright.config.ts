import { defineConfig } from "@playwright/test";

/**
 * End-to-end tests run against a production build on port 3100 so they see
 * the same prerendering behavior as deployment. They need the database from
 * `npm run db:up` with migrations applied and the seed account present.
 */
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:3100",
    colorScheme: "dark",
    viewport: { width: 1440, height: 900 },
    // Let Web Audio start in headless Chromium so the chord player can be exercised.
    launchOptions: { args: ["--autoplay-policy=no-user-gesture-required"] },
  },
  webServer: {
    command: "npm run build && npx next start -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: true,
    timeout: 180_000,
    env: { BETTER_AUTH_URL: "http://localhost:3100" },
  },
});
