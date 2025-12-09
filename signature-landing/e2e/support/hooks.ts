import { Before, After, BeforeAll, AfterAll, Status } from '@cucumber/cucumber';
import { chromium, Browser, Page, BrowserContext } from '@playwright/test';

let browser: Browser;
let context: BrowserContext;
let page: Page;

BeforeAll(async function () {
  // Inicializar el navegador antes de todos los tests
  browser = await chromium.launch({
    headless: process.env.HEADLESS !== 'false',
    slowMo: process.env.SLOWMO ? parseInt(process.env.SLOWMO) : 0,
  });
});

AfterAll(async function () {
  // Cerrar el navegador después de todos los tests
  if (browser) {
    await browser.close();
  }
});

Before(async function () {
  // Crear un nuevo contexto y página para cada escenario
  context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    // Puedes agregar más opciones como permisos, geolocalización, etc.
  });
  
  page = await context.newPage();
  
  // Aumentar el timeout por defecto para navegación
  page.setDefaultNavigationTimeout(30000); // 30 segundos
  page.setDefaultTimeout(10000); // 10 segundos para otras operaciones
  
  // Hacer la página accesible en el contexto de Cucumber
  this.page = page;
  this.context = context;
  this.browser = browser;

  // Configurar manejo de errores de consola (opcional)
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log(`Browser console error: ${msg.text()}`);
    }
  });
});

After(async function ({ result }) {
  // Si el test falló, tomar un screenshot
  if (result?.status === Status.FAILED && page) {
    const screenshot = await page.screenshot({ fullPage: true });
    this.attach(screenshot, 'image/png');
  }

  // Cerrar el contexto después de cada escenario
  if (context) {
    await context.close();
  }
});
