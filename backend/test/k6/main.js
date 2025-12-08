import { authScenario } from './scenarios/auth.js';
import { filesScenario } from './scenarios/files.js';
import { signatureScenario } from './scenarios/signature.js';
import { config } from './config.js';

// Select scenario type via K6_SCENARIO_TYPE env var: smoke (default), load, or stress
const scenarioType = __ENV.K6_SCENARIO_TYPE || 'smoke';
const scenarioConfig = config.SCENARIOS[scenarioType] || config.SCENARIOS.smoke;

export const options = {
  thresholds: config.THRESHOLDS,
  scenarios: {
    auth: {
      ...scenarioConfig,
      exec: 'authScenario',
    },
    files: {
      ...scenarioConfig,
      exec: 'filesScenario',
      startTime: '5s',
    },
    signature: {
      ...scenarioConfig,
      exec: 'signatureScenario',
      startTime: '10s',
    },
  },
};

export { authScenario, filesScenario, signatureScenario };
export default function() {}
