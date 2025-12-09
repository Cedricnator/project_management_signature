import http from 'k6/http';
import { check, fail } from 'k6';
import { config } from './config.js';

export function authenticate(user) {
  const payload = JSON.stringify({
    email: user.email,
    password: user.password,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(`${config.BASE_URL}/auth/login`, payload, params);

  if (
    !check(res, {
      'logged in successfully': (r) => r.status === 200 || r.status === 201,
      'has access token': (r) => r.json('token') !== undefined,
    })
  ) {
    fail(`Login failed for ${user.email}: ${res.status} ${res.body}`);
  }

  return res.json('token');
}

export function getAuthHeaders(token) {
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
}
