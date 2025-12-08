import http from 'k6/http';
import { check, sleep } from 'k6';
import exec from 'k6/execution';
import { config } from '../config.js';

export function authScenario() {
  // 1. Register a new user
  const uniqueId = `${exec.vu.idInTest}-${exec.scenario.iterationInTest}-${Date.now()}`;
  const registerPayload = JSON.stringify({
    email: `loadtest-${uniqueId}@example.com`,
    password: 'Password123!',
    firstName: 'Load',
    lastName: 'Test',
    role: 'USER'
  });

  const registerParams = {
    headers: {
      'Content-Type': 'application/json',
    },
    tags: { scenario: 'auth', endpoint: 'register' },
  };

  const registerRes = http.post(`${config.BASE_URL}/auth/register`, registerPayload, registerParams);
  
  check(registerRes, {
      'register status is 201': (r) => r.status === 201,
  });

  // 2. Login with existing test user
  const payload = JSON.stringify({
    email: config.USERS.TEST_USER.email,
    password: config.USERS.TEST_USER.password,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
    tags: { scenario: 'auth', endpoint: 'login' },
  };

  const res = http.post(`${config.BASE_URL}/auth/login`, payload, params);

  check(res, {
    'status is 200 or 201': (r) => r.status === 200 || r.status === 201,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  if (res.status === 200 || res.status === 201) {
    const token = res.json('token');
    const meParams = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      tags: { scenario: 'auth', endpoint: 'me' },
    };

    const meRes = http.get(`${config.BASE_URL}/auth/me`, meParams);
    check(meRes, {
      'me status is 200': (r) => r.status === 200,
    });
  }
  
  sleep(1);
}
