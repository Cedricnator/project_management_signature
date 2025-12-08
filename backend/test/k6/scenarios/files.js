import http from 'k6/http';
import { check, sleep } from 'k6';
import exec from 'k6/execution';
import { config } from '../config.js';
import { authenticate, getAuthHeaders } from '../utils.js';

export function filesScenario() {
  const token = authenticate(config.USERS.TEST_USER);
  const headers = getAuthHeaders(token).headers;

  // 1. Upload File
  const uniqueId = `${exec.vu.idInTest}-${exec.scenario.iterationInTest}-${Date.now()}`;
  const fileName = `test-file-${uniqueId}.pdf`;
  // Add unique content to avoid hash collision
  const fileContent = `%PDF-1.4\nThis is a test file content for load testing. UniqueID: ${uniqueId}`;
  
  const data = {
    file: http.file(fileContent, fileName, 'application/pdf'),
    name: fileName,
    description: 'Load test file',
  };

  const uploadRes = http.post(`${config.BASE_URL}/files/upload`, data, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    tags: { scenario: 'files', endpoint: 'upload' },
  });

  check(uploadRes, {
    'upload status is 201': (r) => r.status === 201,
  });

  // 2. List Files
  const listRes = http.get(`${config.BASE_URL}/files`, { 
    headers,
    tags: { scenario: 'files', endpoint: 'list' },
  });
  
  check(listRes, {
    'list status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
