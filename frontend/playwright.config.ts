import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    viewport: { width: 1280, height: 800 },
    actionTimeout: 10_000,
    ignoreHTTPSErrors: true,
  },
  webServer: {
    command: 'npm run dev',
    cwd: '.',
    url: 'http://localhost:3000',
    timeout: 120_000,
    reuseExistingServer: true,
  },
})
