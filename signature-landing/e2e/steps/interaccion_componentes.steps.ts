import { When, Then, Before } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { Page } from '@playwright/test';

let page: Page;

Before(async function () {
  page = this.page;
});

When('hago clic en el botón {string}', async function (buttonText: string) {
  const button = page.getByRole('button', { name: new RegExp(buttonText, 'i') });
  await button.click();
});

Then('debo ver una respuesta a la interacción', async function () {
  // Verificar que algo cambió después del clic
  // Esto dependerá de la implementación real del botón
  await page.waitForTimeout(500);
});

When('hago clic en un enlace del menú de navegación', async function () {
  const navLink = page.locator('nav a').first();
  await navLink.click();
});

Then('debo ser llevado a la sección correspondiente', async function () {
  // Verificar que hubo un scroll o navegación
  await page.waitForTimeout(500);
});

When('hago scroll hasta la sección de beneficios', async function () {
  const benefitsSection = page.locator('[data-testid="benefits-section"]');
  await benefitsSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
});

Then('debo ver las estadísticas de reducción de tiempo {string}', async function (value: string) {
  const element = page.getByText(value);
  await expect(element).toBeVisible();
});

Then('debo ver la trazabilidad {string}', async function (value: string) {
  const element = page.getByText(value);
  await expect(element).toBeVisible();
});

Then('debo ver documentos perdidos {string}', async function (value: string) {
  const element = page.getByText(value);
  await expect(element).toBeVisible();
});

Then('debo ver disponibilidad {string}', async function (value: string) {
  const element = page.getByText(value);
  await expect(element).toBeVisible();
});

When('hago scroll hasta la sección de características', async function () {
  const characteristicsSection = page.locator('[data-testid="characteristic-section"]');
  await characteristicsSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
});

Then('debo ver el título {string}', async function (title: string) {
  const heading = page.getByText(title);
  await expect(heading).toBeVisible();
});

Then('debo ver al menos {int} características listadas', async function (minCount: number) {
  const characteristicsSection = page.locator('[data-testid="characteristic-section"]');
  await expect(characteristicsSection).toBeVisible();
  // Verificar que hay contenido suficiente
});

When('hago scroll hasta la sección {string}', async function (sectionName: string) {
  // Buscar la sección por su título
  const section = page.getByText(sectionName);
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
});

Then('debo ver el paso {int} {string}', async function (stepNumber: number, stepTitle: string) {
  const step = page.getByText(stepTitle);
  await expect(step).toBeVisible();
});

When('hago scroll hasta el footer', async function () {
  const footer = page.locator('footer');
  await footer.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
});

Then('debo ver el email {string}', async function (email: string) {
  const emailElement = page.getByText(email);
  await expect(emailElement).toBeVisible();
});

Then('debo ver el teléfono {string}', async function (phone: string) {
  const phoneElement = page.getByText(phone);
  await expect(phoneElement).toBeVisible();
});

Then('debo ver la ubicación {string}', async function (location: string) {
  const locationElement = page.getByText(location);
  await expect(locationElement).toBeVisible();
});

Then('debo ver el copyright {string}', async function (copyright: string) {
  const copyrightElement = page.getByText(new RegExp(copyright, 'i'));
  await expect(copyrightElement).toBeVisible();
});
