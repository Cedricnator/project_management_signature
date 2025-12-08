import { authScenario } from './scenarios/auth.js';
import { filesScenario } from './scenarios/files.js';
import { signatureScenario } from './scenarios/signature.js';
import { config } from './config.js';

export const options = {
  thresholds: config.THRESHOLDS,
  scenarios: {
    auth_smoke: {
      ...config.SCENARIOS.smoke,
      exec: 'authScenario',
    },
    files_smoke: {
      ...config.SCENARIOS.smoke,
      exec: 'filesScenario',
      startTime: '5s',
    },
    signature_smoke: {
      ...config.SCENARIOS.smoke,
      exec: 'signatureScenario',
      startTime: '10s',
    },
  },
};

export { authScenario, filesScenario, signatureScenario };
export default function() {}
