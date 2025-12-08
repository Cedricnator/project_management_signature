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
