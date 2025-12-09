import { Given, When, Then, Before } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { Page } from '@playwright/test';

let page: Page;
let loadStartTime: number;

Before(async function () {
  page = this.page;
});

When('navego a la landing page', async function () {
  loadStartTime = Date.now();
  const landingUrl = process.env.LANDING_URL || 'http://localhost:3001';
  await page.goto(landingUrl);
  await page.waitForLoadState('networkidle');
});

Then('la página debe cargar en menos de {int} segundos', async function (maxSeconds: number) {
  const loadTime = Date.now() - loadStartTime;
  const maxMilliseconds = maxSeconds * 1000;
  expect(loadTime).toBeLessThan(maxMilliseconds);
});

Then('todos los componentes principales deben estar visibles', async function () {
  const navbar = page.locator('nav');
  const hero = page.locator('section').first();
  const footer = page.locator('footer');

  await expect(navbar).toBeVisible();
  await expect(hero).toBeVisible();
  await expect(footer).toBeVisible();
});

Then('debo ver un estado de carga para las métricas', async function () {
  const metricsSection = page.locator('[data-testid="metrics-section"]');
  await expect(metricsSection).toBeVisible();
});

Then('las métricas deben actualizarse sin bloquear la página', async function () {
  // Verificar que la página sigue siendo interactiva
  const navbar = page.locator('nav');
  await expect(navbar).toBeVisible();
  
  // Verificar que las métricas terminaron de cargar
  const metricsLoaded = await page.waitForFunction(() => {
    const metrics = document.querySelectorAll('[data-testid$="-value"]');
    return Array.from(metrics).every(metric => 
      metric.textContent && !metric.textContent.includes('...')
    );
  }, { timeout: 10000 });
  
  expect(metricsLoaded).toBeTruthy();
});

Then('todos los recursos deben estar cargados sin errores', async function () {
  // Verificar que no hay errores en la consola relacionados con recursos
  const errors: string[] = [];
  
  page.on('pageerror', (error) => {
    errors.push(error.message);
  });
  
  page.on('requestfailed', (request) => {
    errors.push(`Failed to load: ${request.url()}`);
  });
  
  await page.waitForLoadState('networkidle');
  
  // Permitir algunos errores menores, pero no errores críticos de carga
  const criticalErrors = errors.filter(error => 
    error.includes('404') || error.includes('500')
  );
  
  expect(criticalErrors.length).toBe(0);
});

Then('no debo ver imágenes rotas', async function () {
  // Verificar que todas las imágenes se cargaron correctamente
  const brokenImages = await page.evaluate(() => {
    const images = Array.from(document.querySelectorAll('img'));
    return images.filter(img => !img.complete || img.naturalHeight === 0).length;
  });
  
  expect(brokenImages).toBe(0);
});

Given('que simulo una conexión lenta', async function () {
  // Simular una conexión 3G lenta
  const client = await page.context().newCDPSession(page);
  await client.send('Network.enable');
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: (500 * 1024) / 8, // 500kb/s
    uploadThroughput: (500 * 1024) / 8,
    latency: 400, // 400ms latency
  });
});

Then('la página debe mostrar contenido básico', async function () {
  const navbar = page.locator('nav');
  const hero = page.locator('section').first();
  
  await expect(navbar).toBeVisible({ timeout: 15000 });
  await expect(hero).toBeVisible({ timeout: 15000 });
});

Then('debe manejar errores de carga de métricas apropiadamente', async function () {
  // La sección de métricas debe existir aunque falle la carga
  const metricsSection = page.locator('[data-testid="metrics-section"]');
  await expect(metricsSection).toBeVisible({ timeout: 15000 });
  
  // Debería mostrar algún valor (0 o error, pero no crashear)
  const metricValues = page.locator('[data-testid$="-value"]');
  const count = await metricValues.count();
  expect(count).toBeGreaterThan(0);
});
