import { test, expect } from '@playwright/test';

test.describe('marketing pages', () => {
  test('home renders in Arabic RTL', async ({ page }) => {
    await page.goto('/');
    const html = await page.locator('html').first();
    await expect(html).toHaveAttribute('lang', 'ar');
    await expect(html).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('link', { name: /ابدأ مجاناً/i }).first()).toBeVisible();
  });

  test('pricing shows 4 tiers', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.getByText('مجاني')).toBeVisible();
    await expect(page.getByText('أساسي')).toBeVisible();
    await expect(page.getByText('احترافي')).toBeVisible();
    await expect(page.getByText('بريميوم')).toBeVisible();
  });
});

test.describe('auth pages', () => {
  test('login page reachable', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'تسجيل الدخول' })).toBeVisible();
    await expect(page.getByLabel('البريد الإلكتروني')).toBeVisible();
  });

  test('register page reachable', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /إنشاء/ })).toBeVisible();
  });
});

test.describe('protected routes', () => {
  test('dashboard redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});
