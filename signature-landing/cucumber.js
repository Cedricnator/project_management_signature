module.exports = {
  default: {
    require: ['e2e/support/**/*.ts', 'e2e/steps/**/*.steps.ts'],
    requireModule: ['ts-node/register'],
    format: ['progress', 'html:cucumber-report.html', 'json:cucumber-report.json'],
    formatOptions: { snippetInterface: 'async-await' },
    publishQuiet: true,
    paths: ['e2e/features/**/*.feature'],
    dryRun: false,
    parallel: 1,
  }
};
