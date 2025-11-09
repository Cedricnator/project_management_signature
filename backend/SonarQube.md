# Integración con SonarQube

Este proyecto backend está configurado para funcionar con SonarQube para el análisis de calidad del código y la generación de reportes de cobertura de pruebas.

## Requisitos Previos

- Servidor SonarQube en ejecución (incluido en `docker-compose.yaml` en el puerto 9000)
- Node.js y npm instalados

## Inicio Rápido

### 1. Iniciar el Servidor de SonarQube

```bash
docker-compose up sonarqube sonardb -d
````

Accede a SonarQube en: [http://localhost:9000](http://localhost:9000)

* Credenciales por defecto: `admin/admin` (se te pedirá cambiarlas en el primer inicio de sesión)

### 2. Ejecutar las Pruebas con Cobertura

```bash
# Ejecutar pruebas unitarias con cobertura
npm run test:cov

# Ejecutar pruebas e2e con cobertura
npm run test:e2e:cov

# O ejecutar ambas
npm run test:cov && npm run test:e2e:cov
```

Esto generará los reportes de cobertura LCOV en:

* `coverage/lcov.info` (pruebas unitarias)
* `coverage-e2e/lcov.info` (pruebas e2e)

### 3. Ejecutar el Análisis de SonarQube

```bash
npm run sonar
```

Esto hará lo siguiente:

* Subirá el código fuente para análisis
* Enviará los reportes de cobertura a SonarQube
* Analizará la calidad del código, errores, vulnerabilidades, y *code smells*

### 4. Ver los Resultados

Abre [http://localhost:9000](http://localhost:9000) y visualiza el panel de tu proyecto.
