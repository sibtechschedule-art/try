import { test, expect } from '@playwright/test';

test('capture updated video studio with moving visuals and multi character voices', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(1000);

  // Click on Video Studio tab
  await page.click('text=5+ Min Video Studio');
  await page.waitForTimeout(2000);

  // Take screenshot
  await page.screenshot({ path: 'updated_studio_preview.png', fullPage: true });
});
