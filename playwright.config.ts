import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 90_000,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:8084",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium-mobile",
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: {
    command: "npx expo start --web --port 8084",
    env: {
      EXPO_PUBLIC_E2E: "true",
    },
    url: "http://127.0.0.1:8084",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
