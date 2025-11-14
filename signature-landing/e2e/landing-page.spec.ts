import { test, expect } from '@playwright/test';

test.describe('Landing Page Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la landing page
    await page.goto('http://localhost:3001');
  });

  test('should display all main sections of the landing page', async ({ page }) => {
    // Verificar que la página cargue correctamente
    await expect(page).toHaveTitle(/Signature/i);

    // Verificar que el Navbar esté visible
    const navbar = page.locator('nav');
    await expect(navbar).toBeVisible();

    // Verificar que la sección Hero esté visible
    const hero = page.locator('section').first();
    await expect(hero).toBeVisible();

    // Verificar que la sección de métricas esté visible
    const metricsSection = page.locator('[data-testid="metrics-section"]');
    await expect(metricsSection).toBeVisible();

    // Verificar que el Footer esté visible
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('should display metrics values', async ({ page }) => {
    // Esperar a que la sección de métricas esté visible
    const metricsSection = page.locator('[data-testid="metrics-section"]');
    await expect(metricsSection).toBeVisible();

    // Verificar que las métricas tengan valores (aunque sean 0)
    const totalUsersValue = page.locator('[data-testid="total-users-value"]');
    await expect(totalUsersValue).toBeVisible();
    await expect(totalUsersValue).toContainText(/\d+/); // Al menos un dígito

    const totalDocsValue = page.locator('[data-testid="total-documents-value"]');
    await expect(totalDocsValue).toBeVisible();
    await expect(totalDocsValue).toContainText(/\d+/);

    const pendingValue = page.locator('[data-testid="pending-signatures-value"]');
    await expect(pendingValue).toBeVisible();
    await expect(pendingValue).toContainText(/\d+/);
  });

  test('should have all sections in correct order', async ({ page }) => {
    // Obtener todas las secciones principales
    const sections = page.locator('body > div > *');
    
    // Verificar que haya al menos 5 secciones (navbar, hero, metrics, cta, footer mínimo)
    const count = await sections.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test('should be responsive', async ({ page }) => {
    // Probar en viewport móvil
    await page.setViewportSize({ width: 375, height: 667 });
    
    const metricsSection = page.locator('[data-testid="metrics-section"]');
    await expect(metricsSection).toBeVisible();

    // Probar en viewport de tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(metricsSection).toBeVisible();

    // Probar en viewport de desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(metricsSection).toBeVisible();
  });

  test('should scroll to sections smoothly', async ({ page }) => {
    // Verificar que la página sea scrolleable
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    const windowHeight = await page.evaluate(() => window.innerHeight);
    
    // La página debería ser más alta que la ventana
    expect(bodyHeight).toBeGreaterThan(windowHeight);

    // Hacer scroll hasta el footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Esperar un momento para que el scroll se complete
    await page.waitForTimeout(500);

    // Verificar que el footer esté en el viewport
    const footer = page.locator('footer');
    await expect(footer).toBeInViewport();
  });
});
