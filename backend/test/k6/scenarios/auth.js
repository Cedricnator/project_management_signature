import http from 'k6/http';
import { check, sleep } from 'k6';
import { config } from '../config.js';

export function authScenario() {
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
  
  sleep(1);
}
