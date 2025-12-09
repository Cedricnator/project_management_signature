import http from 'k6/http';
import { check, sleep } from 'k6';
import exec from 'k6/execution';
import { config } from '../config.js';
import { authenticate, getAuthHeaders } from '../utils.js';

export function filesScenario() {
  const token = authenticate(config.USERS.TEST_USER);
  const headers = getAuthHeaders(token).headers;

  // Get User ID for later tests
  const meRes = http.get(`${config.BASE_URL}/auth/me`, { 
    headers,
    tags: { scenario: 'files', endpoint: 'me' }
  });
  const userId = meRes.json('id');

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

  const fileId = uploadRes.json('id');

  // 2. Download File
  if (fileId) {
    const downloadRes = http.get(`${config.BASE_URL}/files/${fileId}/download`, {
      headers,
      tags: { scenario: 'files', endpoint: 'download' },
    });

    check(downloadRes, {
      'download status is 200': (r) => r.status === 200,
    });
  }

  // 3. List Files
  const listRes = http.get(`${config.BASE_URL}/files`, { 
    headers,
    tags: { scenario: 'files', endpoint: 'list' },
  });
  
  check(listRes, {
    'list status is 200': (r) => r.status === 200,
  });

  // 4. Stream File
  if (fileId) {
    const streamRes = http.get(`${config.BASE_URL}/files/${fileId}/stream`, {
      headers,
      tags: { scenario: 'files', endpoint: 'stream' },
    });
    check(streamRes, { 'stream status is 200': (r) => r.status === 200 });
  }

  // 5. File History
  if (fileId) {
    const fileHistoryRes = http.get(`${config.BASE_URL}/files/${fileId}/history`, {
      headers,
      tags: { scenario: 'files', endpoint: 'history-file' },
    });
    check(fileHistoryRes, { 'file history status is 200': (r) => r.status === 200 });
  }

  // 6. All Files History
  const historyRes = http.get(`${config.BASE_URL}/files/history`, {
    headers,
    tags: { scenario: 'files', endpoint: 'history-all' },
  });
  check(historyRes, { 'history status is 200': (r) => r.status === 200 });

  // 7. Files by User
  if (userId) {
    const userFilesRes = http.get(`${config.BASE_URL}/files/users/${userId}`, {
      headers,
      tags: { scenario: 'files', endpoint: 'user-files' },
    });
    check(userFilesRes, { 'user files status is 200': (r) => r.status === 200 });
  }

  sleep(1);
}
