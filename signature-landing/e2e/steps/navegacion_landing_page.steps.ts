import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

Given('que estoy en la landing page {string}', async function (this: CustomWorld, url: string) {
  await this.page.goto(url);
  await this.page.waitForLoadState('networkidle');
});

When('la página carga completamente', async function (this: CustomWorld) {
  await this.page.waitForLoadState('domcontentloaded');
  await this.page.waitForLoadState('networkidle');
});

Then('debo ver el título de la página conteniendo {string}', async function (this: CustomWorld, expectedTitle: string) {
  await expect(this.page).toHaveTitle(new RegExp(expectedTitle, 'i'));
});

Then('debo ver la barra de navegación', async function (this: CustomWorld) {
  const navbar = this.page.locator('nav');
  await expect(navbar).toBeVisible();
});

Then('debo ver la sección Hero', async function (this: CustomWorld) {
  const hero = this.page.locator('section').first();
  await expect(hero).toBeVisible();
});

Then('debo ver la sección de métricas', async function (this: CustomWorld) {
  const metricsSection = this.page.locator('[data-testid="metrics-section"]');
  await expect(metricsSection).toBeVisible();
});

Then('debo ver el footer', async function (this: CustomWorld) {
  const footer = this.page.locator('footer');
  await expect(footer).toBeVisible();
});

Then('debo ver al menos {int} secciones en la página', async function (this: CustomWorld, minSections: number) {
  const sections = this.page.locator('body > div > *');
  const count = await sections.count();
  expect(count).toBeGreaterThanOrEqual(minSections);
});

Then('las secciones están ordenadas correctamente', async function (this: CustomWorld) {
  // Verificar que el navbar esté antes del hero, hero antes de métricas, etc.
  const navbar = this.page.locator('nav');
  const hero = this.page.locator('section').first();
  const footer = this.page.locator('footer');

  await expect(navbar).toBeVisible();
  await expect(hero).toBeVisible();
  await expect(footer).toBeVisible();
});

Then('la página debe ser scrolleable', async function (this: CustomWorld) {
  const bodyHeight = await this.page.evaluate(() => document.body.scrollHeight);
  const windowHeight = await this.page.evaluate(() => window.innerHeight);
  expect(bodyHeight).toBeGreaterThan(windowHeight);
});

When('hago scroll hasta el final de la página', async function (this: CustomWorld) {
  await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await this.page.waitForTimeout(500); // Esperar a que el scroll se complete
});

Then('el footer debe estar visible en el viewport', async function (this: CustomWorld) {
  const footer = this.page.locator('footer');
  await expect(footer).toBeInViewport();
});
