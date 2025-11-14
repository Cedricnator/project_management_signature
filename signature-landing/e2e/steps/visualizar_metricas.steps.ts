import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

async function createTestUsers(count: number, apiUrl: string) {
  // Mock de la creación de usuarios para pruebas
  for (let i = 0; i < count; i++) {
    await fetch(`${apiUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `testuser${i}@test.com`,
        password: 'Test1234!',
        name: `Test User ${i}`,
      }),
    });
  }
}

async function createTestDocuments(count: number, status: string = 'SIGNED', apiUrl: string) {
  // Mock de la creación de documentos para pruebas
  for (let i = 0; i < count; i++) {
    await fetch(`${apiUrl}/files/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: `test_document_${i}.pdf`,
        originalName: `Test Document ${i}`,
        mimeType: 'application/pdf',
        size: 1024,
        status: status,
      }),
    });
  }
}

Given('que estoy en la landing page', async function (this: CustomWorld) {
  const landingUrl = process.env.LANDING_URL || 'http://localhost:3001';
  await this.page.goto(landingUrl);
  await this.page.waitForLoadState('networkidle');
});

Given('el sistema tiene {int} usuarios registrados', async function (this: CustomWorld, count: number) {
  const apiUrl = process.env.API_URL || 'http://localhost:3000';
  await createTestUsers(count, apiUrl);
});

Given('el sistema tiene {int} documentos gestionados', async function (this: CustomWorld, count: number) {
  const apiUrl = process.env.API_URL || 'http://localhost:3000';
  await createTestDocuments(count, 'SIGNED', apiUrl);
});

Given('el sistema tiene {int} documentos pendientes de firma', async function (this: CustomWorld, count: number) {
  const apiUrl = process.env.API_URL || 'http://localhost:3000';
  await createTestDocuments(count, 'PENDING', apiUrl);
});

Given('el sistema no tiene usuarios ni documentos', async function (this: CustomWorld) {
  // Este step es informativo - el sistema empieza vacío por defecto
  // No necesita hacer nada especial, solo documentar la precondición
});

When('la página carga las métricas', async function (this: CustomWorld) {
  // Esperar a que el componente de métricas esté visible
  await this.page.waitForSelector('[data-testid="metrics-section"]', {
    state: 'visible',
    timeout: 5000,
  });
  
  // Esperar a que las métricas terminen de cargar (no mostrar "...")
  await this.page.waitForFunction(() => {
    const metrics = document.querySelectorAll('[data-testid$="-value"]');
    return Array.from(metrics).every(metric => 
      metric.textContent && !metric.textContent.includes('...')
    );
  }, { timeout: 10000 });
});

Then('el visitante debe ver la métrica {string}', async function (this: CustomWorld, metricText: string) {
  const [label, expectedValue] = metricText.split(':').map(s => s.trim());

  let testId: string;
  
  // Mapear el label al testid correspondiente
  if (label === 'Usuarios Totales') {
    testId = 'total-users-value';
  } else if (label === 'Documentos Gestionados') {
    testId = 'total-documents-value';
  } else if (label === 'Pendientes de Firma') {
    testId = 'pending-signatures-value';
  } else {
    throw new Error(`Métrica desconocida: ${label}`);
  }

  // Verificar que el valor mostrado coincida con el esperado
  const metricElement = await this.page.locator(`[data-testid="${testId}"]`);
  await expect(metricElement).toBeVisible();
  
  const actualValue = await metricElement.textContent();
  expect(actualValue).toBe(expectedValue);

  // También verificar que el label esté presente
  const labelElement = await this.page.locator('text=' + label);
  await expect(labelElement).toBeVisible();
});
