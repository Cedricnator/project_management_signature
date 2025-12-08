import http from 'k6/http';
import { check, sleep } from 'k6';
import exec from 'k6/execution';
import { config } from '../config.js';
import { authenticate, getAuthHeaders } from '../utils.js';

export function signatureScenario() {
  const token = authenticate(config.USERS.SUPERVISOR);
  const headers = getAuthHeaders(token).headers;

  // 1. Upload a file first to sign
  const uniqueId = `${exec.vu.idInTest}-${exec.scenario.iterationInTest}-${Date.now()}`;
  const fileName = `sign-me-${uniqueId}.pdf`;
  // Add unique content to avoid hash collision
  const fileContent = `%PDF-1.4\nSign this content. UniqueID: ${uniqueId}`;
  const data = {
    file: http.file(fileContent, fileName, 'application/pdf'),
    name: fileName,
    description: 'File to sign',
  };

  const uploadRes = http.post(`${config.BASE_URL}/files/upload`, data, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    tags: { scenario: 'signature', endpoint: 'upload' },
  });
  
  if (uploadRes.status !== 201) {
      console.error('Failed to upload file for signature test: ' + uploadRes.status + ' ' + uploadRes.body);
      return;
  }
  
  const fileId = uploadRes.json('id');

  // 2. Sign the document
  const signPayload = JSON.stringify({
    documentId: fileId,
    comment: 'Signed by load test',
  });

  const signRes = http.post(`${config.BASE_URL}/signature`, signPayload, { 
    headers,
    tags: { scenario: 'signature', endpoint: 'sign' },
  });

  check(signRes, {
    'signature status is 201': (r) => r.status === 201,
  });

  const signatureId = signRes.json('id');

  // 3. Verify Signature
  if (signatureId) {
    const verifyRes = http.get(`${config.BASE_URL}/signature/${signatureId}/verify`, {
      headers,
      tags: { scenario: 'signature', endpoint: 'verify' },
    });

    check(verifyRes, {
      'verify status is 200': (r) => r.status === 200,
      'signature is valid': (r) => r.json('isValid') === true,
    });
  }

  // 4. List Signatures
  const listRes = http.get(`${config.BASE_URL}/signature`, {
    headers,
    tags: { scenario: 'signature', endpoint: 'list' },
  });
  check(listRes, { 'list signatures status is 200': (r) => r.status === 200 });

  sleep(1);
}
