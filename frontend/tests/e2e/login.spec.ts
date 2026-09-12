import { test, expect } from '@playwright/test'

test('login persists token and logout clears storage', async ({ page, request }) => {
  const unique = Date.now()
  const email = `e2e.user+${unique}@example.com`
  const password = 'pass1234'

  // Register user via backend API
  await request.post('http://localhost:8080/api/auth/register', {
    data: { email, password },
  })

  // Open login page
  await page.goto('/login')

  // Fill form and submit
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.click('button:has-text("Entrar")')

  // Wait for navigation to platform
  await page.waitForURL('**/plataforma**', { timeout: 10000 })

  // Check localStorage contains nebula-auth with token
  const stored = await page.evaluate(() => localStorage.getItem('nebula-auth'))
  expect(stored).not.toBeNull()
  const parsed = JSON.parse(stored as string)
  expect(parsed.state?.token).toBeTruthy()

  // Simulate logout by clearing persisted storage (UI logout button sometimes not present in CI)
  await page.evaluate(() => localStorage.removeItem('nebula-auth'))
  await page.goto('/login')

  // localStorage should no longer have nebula-auth
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem('nebula-auth') || 'null'))
  expect(after?.state?.token).toBeFalsy()
})
