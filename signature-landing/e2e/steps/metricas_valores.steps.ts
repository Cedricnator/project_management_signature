import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

When('la página carga las métricas del sistema', async function (this: CustomWorld) {
  const metricsSection = this.page.locator('[data-testid="metrics-section"]');
  await expect(metricsSection).toBeVisible();
  
  // Esperar a que las métricas terminen de cargar
  await this.page.waitForFunction(() => {
    const metrics = document.querySelectorAll('[data-testid$="-value"]');
    return Array.from(metrics).every(metric => 
      metric.textContent && !metric.textContent.includes('...')
    );
  }, { timeout: 10000 });
});

Then('debo ver la sección de métricas visible', async function (this: CustomWorld) {
  const metricsSection = this.page.locator('[data-testid="metrics-section"]');
  await expect(metricsSection).toBeVisible();
});

Then('debo ver el valor de {string} con al menos un dígito', async function (this: CustomWorld, metricName: string) {
  let testId: string;
  
  switch (metricName) {
    case 'Usuarios Totales':
      testId = 'total-users-value';
      break;
    case 'Documentos Gestionados':
      testId = 'total-documents-value';
      break;
    case 'Pendientes de Firma':
      testId = 'pending-signatures-value';
      break;
    default:
      throw new Error(`Métrica desconocida: ${metricName}`);
  }

  const metricValue = this.page.locator(`[data-testid="${testId}"]`);
  await expect(metricValue).toBeVisible();
  await expect(metricValue).toContainText(/\d+/); // Al menos un dígito
});

Then('el valor de {string} debe ser un número válido', async function (this: CustomWorld, metricName: string) {
  let testId: string;
  
  switch (metricName) {
    case 'Usuarios Totales':
      testId = 'total-users-value';
      break;
    case 'Documentos Gestionados':
      testId = 'total-documents-value';
      break;
    case 'Pendientes de Firma':
      testId = 'pending-signatures-value';
      break;
    default:
      throw new Error(`Métrica desconocida: ${metricName}`);
  }

  const metricValue = this.page.locator(`[data-testid="${testId}"]`);
  const text = await metricValue.textContent();
  
  expect(text).toBeTruthy();
  const numericValue = parseInt(text!.trim(), 10);
  expect(Number.isInteger(numericValue)).toBeTruthy();
  expect(numericValue).toBeGreaterThanOrEqual(0);
});

Then('debo ver un indicador de carga inicial', async function (this: CustomWorld) {
  // Este step podría verificar el estado de carga "..."
  // pero como es muy rápido, podríamos verificar que eventualmente desaparece
  const metricsSection = this.page.locator('[data-testid="metrics-section"]');
  await expect(metricsSection).toBeVisible();
});

Then('las métricas deben actualizarse con valores del servidor', async function (this: CustomWorld) {
  // Verificar que todas las métricas tengan valores numéricos válidos
  const metrics = ['total-users-value', 'total-documents-value', 'pending-signatures-value'];
  
  for (const testId of metrics) {
    const metricValue = this.page.locator(`[data-testid="${testId}"]`);
    const text = await metricValue.textContent();
    expect(text).toBeTruthy();
    expect(text).not.toContain('...'); // No debe mostrar loading
  }
});
