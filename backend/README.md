# Backend - Document Signature Management System

A NestJS-based backend application for managing document signatures with user authentication, file uploads, and comprehensive testing suite.

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Docker** and **Docker Compose** (for database)
- **PostgreSQL** (optional, if not using Docker)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your configuration values.

4. **Database Setup**
   ```bash
   # Start PostgreSQL database using Docker Compose
   docker-compose up -d db-signature-project-management

   # Or run the database manually if you have PostgreSQL installed locally
   ```

## Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

## Testing

The application includes comprehensive testing with unit tests, integration tests, e2e tests, and BDD tests.

### Prerequisites for Testing

1. **Database**: Ensure PostgreSQL is running (use Docker Compose as described above)
2. **Environment**: Copy and configure `.env` file

### Running Tests

#### Unit Tests
```bash
# Run all unit tests
npm run test:unit

# Run unit tests with coverage
npm run test:cov
```

#### End-to-End (E2E) Tests
```bash
# Run all e2e tests
npm run test:e2e

# Run e2e tests with coverage
npm run test:e2e:cov

# Run specific e2e test file
npx jest --config ./test/jest-e2e.json test/metrics.e2e-spec.ts
```

#### BDD (Behavior-Driven Development) Tests
```bash
# Run all BDD tests (Cucumber.js)
npm run test:bdd
```


### Test Structure

- **Unit Tests**: Located in `src/**/*.spec.ts`
- **E2E Tests**: Located in `test/*.e2e-spec.ts`
- **BDD Tests**: Feature files in `test/features/`, step definitions in `test/steps/`
