import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3100);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

// AGENTS §5: e2e never depends on the network; every external provider is mocked.
const mockEnv = {
  NEXT_PUBLIC_SITE_URL: baseURL,
  MOCK_DB: "1",
  MOCK_NOTIFY: "1",
  MOCK_IMAGE_PROVIDER: "1",
};

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: { baseURL, trace: "on-first-retry" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"], viewport: { width: 375, height: 812 } } },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        // CI tests the production build; locally the dev server is faster to start.
        command: process.env.CI ? `pnpm start -p ${PORT}` : `pnpm dev -p ${PORT}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: mockEnv,
      },
});
