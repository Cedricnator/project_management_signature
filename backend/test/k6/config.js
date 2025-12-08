export const config = {
  BASE_URL: __ENV.BASE_URL || 'http://backend.signature.project_management.local:3000',
  
  USERS: {
    ADMIN: {
      email: 'admin@signature.com',
      password: 'password123', 
    },
    SUPERVISOR: {
      email: 'supervisor@signature.com',
      password: 'password123',
    },
    TEST_USER: {
      email: 'juan.perez@signature.com',
      password: 'password123',
    }
  },
  
  THRESHOLDS: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
  
  SCENARIOS: {
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '30s',
    },
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 },
        { duration: '5m', target: 50 },
        { duration: '2m', target: 0 },
      ],
    },
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 10 },
        { duration: '5m', target: 50 },
        { duration: '5m', target: 100 },
        { duration: '2m', target: 0 },
      ],
    },
  }
};
