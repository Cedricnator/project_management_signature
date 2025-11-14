import { webcrypto } from 'crypto';

(global as any).crypto = webcrypto;

// Set required environment variables for testing
process.env.JWT_SECRET = 'test-jwt-secret-key-for-e2e-tests';
process.env.JWT_EXPIRES_IN = '1h';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '31000';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'postgres';
process.env.DB_NAME = 'signature_project';
